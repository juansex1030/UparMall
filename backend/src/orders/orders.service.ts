/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemsDto } from './dto/add-items.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Refactored Create Order logic for maximum reliability with zero nesting.
   */
  async create(createOrderDto: CreateOrderDto) {
    try {
      const { items, ...orderData } = createOrderDto;

      // 0. Verify store exists and is active before accepting order
      const { data: store, error: storeError } = await this.supabase.adminClient
        .from('Stores')
        .select('id')
        .eq('id', orderData.storeId)
        .single();

      if (storeError || !store) {
        throw new Error('La tienda no existe o no está disponible.');
      }

      const now = new Date().toISOString();

      // 2. Verify all products belong to this store and calculate real total
      const productIds = items.map((i) => i.productId);
      const { data: validProducts, error: productsError } =
        await this.supabase.adminClient
          .from('Product')
          .select('id, price, variants')
          .eq('storeId', orderData.storeId)
          .in('id', productIds);

      if (
        productsError ||
        !validProducts ||
        (validProducts as unknown[]).length !== [...new Set(productIds)].length
      ) {
        throw new Error(
          'Uno o más productos no pertenecen a esta tienda o no están disponibles.',
        );
      }

      // Build product map for pricing
      const productMap = new Map(
        (validProducts as any[]).map((p) => [p.id, p]),
      );

      // Calculate safe total
      let calculatedTotal = 0;
      const itemsPayload = items.map((item) => {
        const prod = productMap.get(item.productId);
        const itemBasePrice = Number(prod.price) || 0;
        let optionsExtraPrice = 0;

        // Verify options pricing
        if (item.options && typeof item.options === 'object') {
          const prodVariants = prod.variants || [];
          for (const [vName, selectedOpt] of Object.entries<any>(
            item.options,
          )) {
            // Find variant in DB
            const dbVariant = prodVariants.find((v: any) => v.name === vName);
            if (dbVariant && dbVariant.options) {
              const dbOption = dbVariant.options.find(
                (o: any) => o.label === selectedOpt?.label,
              );
              if (dbOption) {
                optionsExtraPrice += Number(dbOption.price) || 0;
              }
            }
          }
        }

        const finalItemPrice = itemBasePrice + optionsExtraPrice;
        calculatedTotal += finalItemPrice * (Number(item.quantity) || 1);

        return {
          order_id: null, // to be updated
          product_id: item.productId,
          product_name: item.productName,
          price: finalItemPrice,
          quantity: item.quantity,
          options: item.options,
        };
      });

      // Override total provided by client
      const finalTotal = calculatedTotal;

      const payload = {
        store_id: orderData.storeId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        table_id: orderData.tableId,
        waiter_id: orderData.waiterId,
        total: finalTotal,
        payment_method: orderData.paymentMethod,
        notes: orderData.notes,
        status: orderData.tableId ? 'open' : 'pendiente',
        created_at: now,
        updated_at: now,
      };

      // 1. Insert Order header
      const { data: order, error: orderError } = await this.supabase.adminClient
        .from('Orders')
        .insert([payload])
        .select()
        .single();

      if (orderError || !order) {
        throw new Error(
          `DB Error (Order Header): ${orderError?.message || 'Check Orders table'}`,
        );
      }

      // 3. Insert Order Items
      const orderId = (order as Record<string, unknown>).id;
      itemsPayload.forEach((i) => (i.order_id = orderId as any));

      const { error: itemsError } = await this.supabase.adminClient
        .from('OrderItems')
        .insert(itemsPayload);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError.message);
      }

      // 4. Decrement Stock (Including Combos)
      for (const item of items) {
        const { data: prod } = await this.supabase.adminClient
          .from('Product')
          .select('isCombo, comboItems, manageStock, stock')
          .eq('id', item.productId)
          .single();

        if (prod) {
          if (prod.isCombo && prod.comboItems) {
            for (const comboItem of prod.comboItems) {
              const { data: componentProd } = await this.supabase.adminClient
                .from('Product')
                .select('manageStock, stock')
                .eq('id', comboItem.productId)
                .single();

              if (componentProd && componentProd.manageStock) {
                const newStock = Math.max(
                  0,
                  (componentProd.stock || 0) -
                    comboItem.quantity * item.quantity,
                );
                await this.supabase.adminClient
                  .from('Product')
                  .update({ stock: newStock })
                  .eq('id', comboItem.productId);
              }
            }
          } else if (prod.manageStock) {
            const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
            await this.supabase.adminClient
              .from('Product')
              .update({ stock: newStock })
              .eq('id', item.productId);
          }
        }
      }

      return order;
    } catch (error: unknown) {
      console.error('CRITICAL ORDER ERROR:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Error creando orden',
      );
    }
  }

  async addItems(orderId: string, addItemsDto: AddItemsDto, storeId: string) {
    try {
      // 1. Verify order belongs to store and is not closed/paid
      const { data: order, error: orderError } = await this.supabase.adminClient
        .from('Orders')
        .select('id, total, status')
        .eq('id', orderId)
        .eq('store_id', storeId)
        .single();

      if (orderError || !order) {
        throw new NotFoundException('Pedido no encontrado');
      }

      // In a restaurant, 'open', 'pendiente', 'preparing' are modifiable
      if (
        ['pagado', 'paid', 'cancelled', 'cancelado'].includes(
          order.status.toLowerCase(),
        )
      ) {
        throw new BadRequestException(
          'No se pueden añadir productos a un pedido ya cerrado o pagado',
        );
      }

      const items = addItemsDto.items;

      const productIds = items.map((i) => i.productId);
      const { data: validProducts, error: productsError } =
        await this.supabase.adminClient
          .from('Product')
          .select('id, price, variants')
          .eq('storeId', storeId)
          .in('id', productIds);

      if (
        productsError ||
        !validProducts ||
        (validProducts as unknown[]).length !== [...new Set(productIds)].length
      ) {
        throw new BadRequestException(
          'Uno o más productos no pertenecen a esta tienda.',
        );
      }

      const productMap = new Map(
        (validProducts as any[]).map((p) => [p.id, p]),
      );

      // 2. Insert new Order Items and calc total
      let addedItemsTotal = 0;

      const itemsPayload = items.map((item) => {
        const prod = productMap.get(item.productId);
        const itemBasePrice = Number(prod.price) || 0;
        // In addItemsDto options are passed as notes or similar?
        // Wait, addItemsDto usually sends notes, let's keep extra calculation if it's there
        let optionsExtraPrice = 0;

        if (item.options && typeof item.options === 'object') {
          const prodVariants = prod.variants || [];
          for (const [vName, selectedOpt] of Object.entries<any>(
            item.options,
          )) {
            const dbVariant = prodVariants.find((v: any) => v.name === vName);
            if (dbVariant && dbVariant.options) {
              const dbOption = dbVariant.options.find(
                (o: any) => o.label === selectedOpt?.label,
              );
              if (dbOption) {
                optionsExtraPrice += Number(dbOption.price) || 0;
              }
            }
          }
        }

        const finalItemPrice = itemBasePrice + optionsExtraPrice;
        addedItemsTotal += finalItemPrice * (Number(item.quantity) || 1);

        return {
          order_id: order.id,
          product_id: item.productId,
          product_name: item.productName,
          price: finalItemPrice,
          quantity: item.quantity,
          options:
            item.options ||
            (item.notes ? { 'Nota adicional': item.notes } : null),
        };
      });

      const { error: itemsError } = await this.supabase.adminClient
        .from('OrderItems')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // 3. Update Order Total
      const newTotal = Number(order.total) + addedItemsTotal;

      await this.supabase.adminClient
        .from('Orders')
        .update({ total: newTotal, updated_at: new Date().toISOString() })
        .eq('id', order.id);

      // 4. Decrement Stock (Simplified for brevity, similar to create)
      for (const item of items) {
        const { data: prod } = await this.supabase.adminClient
          .from('Product')
          .select('manageStock, stock')
          .eq('id', item.productId)
          .single();

        if (prod && prod.manageStock) {
          const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
          await this.supabase.adminClient
            .from('Product')
            .update({ stock: newStock })
            .eq('id', item.productId);
        }
      }

      return { success: true, newTotal };
    } catch (error: unknown) {
      console.error('Error in addItems:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al añadir productos al pedido',
      );
    }
  }

  async removeItem(orderId: string, itemId: string, storeId: string) {
    try {
      // 1. Verify order belongs to store and is not closed
      const { data: order, error: orderError } = await this.supabase.adminClient
        .from('Orders')
        .select('id, total, status')
        .eq('id', orderId)
        .eq('store_id', storeId)
        .single();

      if (orderError || !order) {
        throw new NotFoundException('Pedido no encontrado');
      }

      if (
        ['pagado', 'paid', 'cancelled', 'cancelado', 'entregado'].includes(
          order.status.toLowerCase(),
        )
      ) {
        throw new BadRequestException(
          'No se pueden eliminar productos de un pedido ya cerrado o pagado',
        );
      }

      // 2. Find the OrderItem
      const { data: item, error: itemError } = await this.supabase.adminClient
        .from('OrderItems')
        .select('id, product_id, price, quantity')
        .eq('id', itemId)
        .eq('order_id', orderId)
        .single();

      if (itemError || !item) {
        throw new NotFoundException('Producto del pedido no encontrado');
      }

      // 3. Delete the OrderItem
      const { error: deleteError } = await this.supabase.adminClient
        .from('OrderItems')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      // 4. Update the order total
      const itemTotal = Number(item.price) * Number(item.quantity);
      const newTotal = Math.max(0, Number(order.total) - itemTotal);

      await this.supabase.adminClient
        .from('Orders')
        .update({ total: newTotal, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      // 5. Restore stock
      const { data: prod } = await this.supabase.adminClient
        .from('Product')
        .select('manageStock, stock')
        .eq('id', item.product_id)
        .single();

      if (prod && prod.manageStock) {
        const restoredStock = (prod.stock || 0) + item.quantity;
        await this.supabase.adminClient
          .from('Product')
          .update({ stock: restoredStock })
          .eq('id', item.product_id);
      }

      return { success: true, newTotal };
    } catch (error: unknown) {
      console.error('Error in removeItem:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al eliminar producto del pedido',
      );
    }
  }

  async applyDiscount(
    orderId: string,
    amount: number,
    reason: string,
    storeId: string,
  ) {
    try {
      const { data: order, error: orderError } = await this.supabase.adminClient
        .from('Orders')
        .select('id, total, status, notes')
        .eq('id', orderId)
        .eq('store_id', storeId)
        .single();

      if (orderError || !order) {
        throw new NotFoundException('Pedido no encontrado');
      }

      if (
        ['pagado', 'paid', 'cancelled', 'cancelado', 'entregado'].includes(
          order.status.toLowerCase(),
        )
      ) {
        throw new BadRequestException(
          'No se pueden aplicar descuentos a un pedido ya cerrado o pagado',
        );
      }

      if (amount <= 0) {
        throw new BadRequestException(
          'El monto del descuento debe ser mayor a 0',
        );
      }

      if (amount > Number(order.total)) {
        throw new BadRequestException(
          'El descuento no puede ser mayor al total del pedido',
        );
      }

      const newTotal = Math.max(0, Number(order.total) - amount);
      const discountNote = `[DESCUENTO APLICADO: -$${amount}] ${reason || ''}`;

      const newNotes = order.notes
        ? order.notes + '\n' + discountNote
        : discountNote;

      const { error: updateError } = await this.supabase.adminClient
        .from('Orders')
        .update({
          total: newTotal,
          notes: newNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return { success: true, newTotal, notes: newNotes };
    } catch (error: unknown) {
      console.error('Error in applyDiscount:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al aplicar el descuento');
    }
  }

  async findAllByStoreId(storeId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('Orders')
      .select('*, OrderItems(*)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error.message);
      return [];
    }
    return (data as unknown[]) || [];
  }

  async findOne(id: string, storeId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('Orders')
      .select('*, OrderItems(*)')
      .eq('id', id)
      .eq('store_id', storeId)
      .single();

    if (error || !data) throw new NotFoundException('Pedido no encontrado');
    return data;
  }

  async updateStatus(id: string, status: string, storeId: string) {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase.adminClient
      .from('Orders')
      .update({
        status,
        updated_at: now,
      })
      .eq('id', id)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error || !data)
      throw new InternalServerErrorException('No se pudo actualizar el estado');

    // Free the table if the order is completed or cancelled
    if (
      ['completed', 'cancelled', 'pagado', 'cancelado', 'entregado'].includes(
        status.toLowerCase(),
      )
    ) {
      if (data.table_id) {
        await this.supabase.adminClient
          .from('Tables')
          .update({ status: 'free', current_order_id: null })
          .eq('id', data.table_id);
      }
    }

    return data;
  }

  async remove(id: string, storeId: string) {
    // 1. Delete Order Items first (FK constraint) with explicit error check
    const { error: itemsError } = await this.supabase.adminClient
      .from('OrderItems')
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError.message);
    }

    // 2. Delete Order
    const { error: orderError } = await this.supabase.adminClient
      .from('Orders')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId);

    if (orderError) {
      console.error('Error deleting order:', orderError.message);
      throw new InternalServerErrorException(
        `No se pudo eliminar el pedido: ${orderError.message}`,
      );
    }

    return { success: true };
  }

  async getStats(storeId: string, period: string = '30d') {
    try {
      let query = this.supabase.adminClient
        .from('Orders')
        .select(
          'total, created_at, status, customer_phone, OrderItems(product_name, quantity, price)',
        )
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (period === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      } else if (period === '12m') {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        query = query.gte('created_at', twelveMonthsAgo.toISOString());
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      const stats = {
        totalRevenue: 0,
        totalOrders: (orders as unknown[]).length,
        averageTicket: 0,
        dailySales: [] as { date: string; total: number; count: number }[],
        topProducts: [] as { name: string; qty: number }[],
        retention: { recurring: 0, new: 0, percentage: 0 },
      };

      const dailyData: Record<string, { total: number; count: number }> = {};
      const productMap: Record<string, number> = {};
      const customerMap: Record<string, number> = {};

      if (period === '30d') {
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          dailyData[dateStr] = { total: 0, count: 0 };
        }
      } else if (period === '12m') {
        for (let i = 0; i < 12; i++) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthStr = d.toISOString().substring(0, 7);
          dailyData[monthStr] = { total: 0, count: 0 };
        }
      }

      (orders as any[]).forEach((order) => {
        let dateKey = '';
        if (period === '30d') {
          dateKey = String(order.created_at).split('T')[0];
        } else {
          dateKey = String(order.created_at).substring(0, 7);
        }

        if (period === 'all' && !dailyData[dateKey]) {
          dailyData[dateKey] = { total: 0, count: 0 };
        }

        // Calculate revenue exclusively from items to avoid delivery fees
        const amount = (order.OrderItems || []).reduce(
          (sum: number, item: any) => {
            return (
              sum + (Number(item.price) || 0) * (Number(item.quantity) || 1)
            );
          },
          0,
        );

        const isDelivered =
          String(order.status).toLowerCase().trim() === 'entregado';

        if (isDelivered) {
          stats.totalRevenue += amount;

          if (dailyData[dateKey]) {
            dailyData[dateKey].total += amount;
          }

          (order.OrderItems || []).forEach(
            (item: { product_name?: string; quantity?: number }) => {
              const name = item.product_name || 'Producto Desconocido';
              productMap[name] = (productMap[name] || 0) + (item.quantity || 1);
            },
          );
        }

        if (dailyData[dateKey]) {
          dailyData[dateKey].count += 1;
        }

        const phone = String(order.customer_phone || 'Desconocido');
        customerMap[phone] = (customerMap[phone] || 0) + 1;
      });

      // Calculate Top Products
      stats.topProducts = Object.keys(productMap)
        .map((name) => ({ name, qty: productMap[name] }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      // Calculate Retention
      const totalCustomers = Object.keys(customerMap).length;
      if (totalCustomers > 0) {
        let recurring = 0;
        Object.values(customerMap).forEach((count) => {
          if (count > 1) recurring++;
        });
        stats.retention.recurring = recurring;
        stats.retention.new = totalCustomers - recurring;
        stats.retention.percentage = Math.round(
          (recurring / totalCustomers) * 100,
        );
      }

      // Calculate Average Ticket only on delivered orders
      const deliveredOrders = (orders as any[]).filter(
        (o) => String(o.status).toLowerCase().trim() === 'entregado',
      );
      stats.averageTicket =
        deliveredOrders.length > 0
          ? stats.totalRevenue / deliveredOrders.length
          : 0;

      stats.dailySales = Object.keys(dailyData)
        .map((date) => ({ date, ...dailyData[date] }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return stats;
    } catch (error: unknown) {
      console.error('Error fetching stats:', error);
      throw new InternalServerErrorException(
        'No se pudieron cargar las estadísticas',
      );
    }
  }
}

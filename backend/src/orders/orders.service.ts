import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Refactored Create Order logic for maximum reliability with zero nesting.
   */
  async create(createOrderDto: CreateOrderDto) {
    try {
      const { items, ...orderData } = createOrderDto;
      const now = new Date().toISOString();
      
      const payload = {
        store_id: orderData.storeId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        total: orderData.total,
        payment_method: orderData.paymentMethod,
        notes: orderData.notes,
        status: 'pendiente',
        created_at: now,
        updated_at: now
      };

      // 1. Insert Order header
      const { data: order, error: orderError } = await this.supabase.adminClient
        .from('Orders')
        .insert([payload])
        .select()
        .single();

      if (orderError || !order) {
        throw new Error(`DB Error (Order Header): ${orderError?.message || 'Check Orders table'}`);
      }

      // 2. Insert Order Items
      const orderId = order.id;
      const itemsPayload = items.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        options: item.options
      }));

      const { error: itemsError } = await this.supabase.adminClient
        .from('OrderItems')
        .insert(itemsPayload);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError.message);
      }

      return order;
    } catch (error: any) {
      console.error('CRITICAL ORDER ERROR:', error);
      throw new InternalServerErrorException(error.message);
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
    return data || [];
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
        updated_at: now 
      })
      .eq('id', id)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error || !data) throw new InternalServerErrorException('No se pudo actualizar el estado');
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
      throw new InternalServerErrorException(`No se pudo eliminar el pedido: ${orderError.message}`);
    }

    return { success: true };
  }

  async getStats(storeId: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString();

      // Fetch orders with items and customer info
      const { data: orders, error } = await this.supabase.adminClient
        .from('Orders')
        .select('total, created_at, status, customer_phone, OrderItems(product_name, quantity)')
        .eq('store_id', storeId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const stats = {
        totalRevenue: 0,
        totalOrders: orders.length,
        averageTicket: 0,
        dailySales: [] as any[],
        topProducts: [] as { name: string, qty: number }[],
        retention: { recurring: 0, new: 0, percentage: 0 }
      };

      const dailyData: Record<string, { total: number, count: number }> = {};
      const productMap: Record<string, number> = {};
      const customerMap: Record<string, number> = {};

      // Initialize last 30 days
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyData[dateStr] = { total: 0, count: 0 };
      }

      orders.forEach(order => {
        const dateStr = order.created_at.split('T')[0];
        const amount = Number(order.total) || 0;
        const isDelivered = order.status === 'entregado';

        // Revenue and Product Popularity ONLY for delivered orders
        if (isDelivered) {
          stats.totalRevenue += amount;
          
          // Daily aggregation only for delivered revenue
          if (dailyData[dateStr]) {
            dailyData[dateStr].total += amount;
          }

          // Product popularity (ONLY for delivered orders now)
          (order.OrderItems || []).forEach((item: any) => {
            const name = item.product_name || 'Producto Desconocido';
            productMap[name] = (productMap[name] || 0) + (item.quantity || 1);
          });
        }

        // We still count the order in total quantity for historical volume purposes
        if (dailyData[dateStr]) {
          dailyData[dateStr].count += 1;
        }

        // Customer retention (by phone)
        const phone = order.customer_phone || 'Desconocido';
        customerMap[phone] = (customerMap[phone] || 0) + 1;
      });

      // Calculate Top Products
      stats.topProducts = Object.keys(productMap)
        .map(name => ({ name, qty: productMap[name] }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      // Calculate Retention
      const totalCustomers = Object.keys(customerMap).length;
      if (totalCustomers > 0) {
        let recurring = 0;
        Object.values(customerMap).forEach(count => { if (count > 1) recurring++; });
        stats.retention.recurring = recurring;
        stats.retention.new = totalCustomers - recurring;
        stats.retention.percentage = Math.round((recurring / totalCustomers) * 100);
      }

      // Calculate Average Ticket only on delivered orders
      const deliveredOrders = orders.filter(o => o.status === 'entregado');
      stats.averageTicket = deliveredOrders.length > 0 ? stats.totalRevenue / deliveredOrders.length : 0;
      
      stats.dailySales = Object.keys(dailyData)
        .map(date => ({ date, ...dailyData[date] }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return stats;
    } catch (error: any) {
      console.error('Error fetching stats:', error.message);
      throw new InternalServerErrorException('No se pudieron cargar las estadísticas');
    }
  }
}

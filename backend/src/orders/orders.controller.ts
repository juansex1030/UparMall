import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { AddItemsDto } from './dto/add-items.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';
import type { User as SupabaseUser } from '@supabase/supabase-js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('stats')
  getStats(@User() user: SupabaseUser, @Query('period') period?: string) {
    return this.ordersService.getStats(user.id, period);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  findAll(@User() user: SupabaseUser) {
    return this.ordersService.findAllByStoreId(user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: SupabaseUser) {
    return this.ordersService.findOne(id, user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @User() user: SupabaseUser,
  ) {
    return this.ordersService.updateStatus(
      id,
      updateOrderStatusDto.status,
      user.id,
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/add-items')
  addItems(
    @Param('id') id: string,
    @Body() addItemsDto: AddItemsDto,
    @User() user: SupabaseUser,
  ) {
    return this.ordersService.addItems(id, addItemsDto, user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @User() user: SupabaseUser,
  ) {
    return this.ordersService.removeItem(id, itemId, user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/discount')
  applyDiscount(
    @Param('id') id: string,
    @Body() body: { amount: number; reason: string },
    @User() user: SupabaseUser,
  ) {
    return this.ordersService.applyDiscount(
      id,
      body.amount,
      body.reason,
      user.id,
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: SupabaseUser) {
    return this.ordersService.remove(id, user.id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('stats')
  getStats(@User() user: any) {
    return this.ordersService.getStats(user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  findAll(@User() user: any) {
    return this.ordersService.findAllByStoreId(user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) {
    return this.ordersService.findOne(id, user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @User() user: any,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status, user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.ordersService.remove(id, user.id);
  }
}

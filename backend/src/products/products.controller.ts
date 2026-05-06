import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('my-products')
  findMyProducts(@User() user: any) {
    return this.productsService.findAll(user.id);
  }

  @Get(':slug')
  findAllBySlug(@Param('slug') slug: string) {
    // We'll need a service method to find products by slug
    return this.productsService.findAllBySlug(slug);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @User() user: any) {
    return this.productsService.create(createProductDto, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @User() user: any) {
    return this.productsService.update(+id, updateProductDto, user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.productsService.remove(+id, user.id);
  }
}

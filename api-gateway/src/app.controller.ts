import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { createOrderDto } from './create-order-dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Post()
  createOrder(@Body() body: createOrderDto) {
    return this.appService.createOrder(body);
  }
}

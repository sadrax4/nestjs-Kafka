import { Inject, Injectable } from '@nestjs/common';
import { createOrderDto } from './create-order-dto';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderEvent } from './create-order-event';
@Injectable()
export class AppService {
  constructor(
    @Inject("BILLING_SERVICE")
    private readonly billingService: ClientKafka
  ) { }
  createOrder({ userId, price }: createOrderDto) {
    console.log("request sent ...")
    this.billingService.emit(
      "order_created",
      new CreateOrderEvent("123", userId, price)
    )
  }
}

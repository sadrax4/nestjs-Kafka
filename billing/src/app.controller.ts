import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientKafka, EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authService: ClientKafka,
    private readonly appService: AppService
  ) { }
  onModuleInit() {
    this.authService.subscribeToResponseOf("get_user");
  }
  @EventPattern("order_created")
  handleOrderCreated(data: any) {
    return this.appService.handleOrderCreated(data);
  }
}

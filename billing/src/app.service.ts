import { Inject, Injectable } from '@nestjs/common';
import { HandleCreateOrder } from './handle-create-order';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject("AUTH_SERVICE") private readonly authService: ClientKafka) { }
  handleOrderCreated(data: HandleCreateOrder) {
    console.log(data);
    this.authService.send(
      "get_user", data
    ).subscribe(
      (user) => {
        console.log(`the user name is ${user.name} with price ${data.price}`);
      })
  }
}
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
const user = [
  {
    userId: "123",
    name: "sadra",
    age: 18,
  },
  {
    userId: "124",
    name: "kia",
    age: 20
  },
  {
    userId: "125",
    name: "gari",
    age: 21
  }
]
@Injectable()
export class AppService {
  constructor(
    @Inject("BILLING_SERVICE") private readonly billingService: ClientKafka
  ) { }
  getHello(): string {
    return 'Hello World!';
  }
  getUser(data: any) {
    console.log("received data ")
    return user[0];
  }
}

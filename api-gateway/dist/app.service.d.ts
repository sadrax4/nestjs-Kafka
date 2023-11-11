import { createOrderDto } from './create-order-dto';
import { ClientKafka } from '@nestjs/microservices';
export declare class AppService {
    private readonly billingService;
    constructor(billingService: ClientKafka);
    createOrder({ userId, price }: createOrderDto): void;
}

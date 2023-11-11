import { HandleCreateOrder } from './handle-create-order';
import { ClientKafka } from '@nestjs/microservices';
export declare class AppService {
    private readonly authService;
    constructor(authService: ClientKafka);
    handleOrderCreated(data: HandleCreateOrder): void;
}

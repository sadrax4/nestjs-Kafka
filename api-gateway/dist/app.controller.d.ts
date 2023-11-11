import { AppService } from './app.service';
import { createOrderDto } from './create-order-dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    createOrder(body: createOrderDto): void;
}

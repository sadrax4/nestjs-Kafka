import { OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientKafka } from '@nestjs/microservices';
export declare class AppController implements OnModuleInit {
    private readonly authService;
    private readonly appService;
    constructor(authService: ClientKafka, appService: AppService);
    onModuleInit(): void;
    handleOrderCreated(data: any): void;
}

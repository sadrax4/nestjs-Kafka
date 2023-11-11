import { ClientKafka } from '@nestjs/microservices';
export declare class AppService {
    private readonly billingService;
    constructor(billingService: ClientKafka);
    getHello(): string;
    getUser(data: any): {
        userId: string;
        name: string;
        age: number;
    };
}

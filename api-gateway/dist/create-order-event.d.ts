export declare class CreateOrderEvent {
    orderId: string;
    userId: string;
    price: number;
    constructor(orderId: string, userId: string, price: number);
    toString(): Object;
}

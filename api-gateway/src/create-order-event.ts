export class CreateOrderEvent {
    constructor(
        public orderId: string,
        public userId: string,
        public price: number
    ) { }
    toString(): Object {
        return JSON.stringify({
            orderId: this.orderId,
            userId: this.userId,
            price: this.price
        })
    }
}
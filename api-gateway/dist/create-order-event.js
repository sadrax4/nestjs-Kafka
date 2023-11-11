"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderEvent = void 0;
class CreateOrderEvent {
    constructor(orderId, userId, price) {
        this.orderId = orderId;
        this.userId = userId;
        this.price = price;
    }
    toString() {
        return JSON.stringify({
            orderId: this.orderId,
            userId: this.userId,
            price: this.price
        });
    }
}
exports.CreateOrderEvent = CreateOrderEvent;
//# sourceMappingURL=create-order-event.js.map
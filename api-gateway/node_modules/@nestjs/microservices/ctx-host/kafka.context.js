"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaContext = void 0;
const base_rpc_context_1 = require("./base-rpc.context");
class KafkaContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    /**
     * Returns the reference to the original message.
     */
    getMessage() {
        return this.args[0];
    }
    /**
     * Returns the partition.
     */
    getPartition() {
        return this.args[1];
    }
    /**
     * Returns the name of the topic.
     */
    getTopic() {
        return this.args[2];
    }
    /**
     * Returns the Kafka consumer reference.
     */
    getConsumer() {
        return this.args[3];
    }
    /**
     * Returns the Kafka heartbeat callback.
     */
    getHeartbeat() {
        return this.args[4];
    }
    /**
     * Returns the Kafka producer reference,
     */
    getProducer() {
        return this.args[5];
    }
}
exports.KafkaContext = KafkaContext;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttContext = void 0;
const base_rpc_context_1 = require("./base-rpc.context");
class MqttContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    /**
     * Returns the name of the topic.
     */
    getTopic() {
        return this.args[0];
    }
    /**
     * Returns the reference to the original MQTT packet.
     */
    getPacket() {
        return this.args[1];
    }
}
exports.MqttContext = MqttContext;

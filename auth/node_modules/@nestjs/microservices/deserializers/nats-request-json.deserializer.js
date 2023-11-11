"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsRequestJSONDeserializer = void 0;
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const incoming_request_deserializer_1 = require("./incoming-request.deserializer");
let natsPackage = {};
/**
 * @publicApi
 */
class NatsRequestJSONDeserializer extends incoming_request_deserializer_1.IncomingRequestDeserializer {
    constructor() {
        super();
        natsPackage = (0, load_package_util_1.loadPackage)('nats', NatsRequestJSONDeserializer.name, () => require('nats'));
        this.jsonCodec = natsPackage.JSONCodec();
    }
    deserialize(value, options) {
        const decodedRequest = this.jsonCodec.decode(value);
        return super.deserialize(decodedRequest, options);
    }
}
exports.NatsRequestJSONDeserializer = NatsRequestJSONDeserializer;

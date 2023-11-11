"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsResponseJSONDeserializer = void 0;
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const incoming_response_deserializer_1 = require("./incoming-response.deserializer");
const nats_request_json_deserializer_1 = require("./nats-request-json.deserializer");
let natsPackage = {};
/**
 * @publicApi
 */
class NatsResponseJSONDeserializer extends incoming_response_deserializer_1.IncomingResponseDeserializer {
    constructor() {
        super();
        natsPackage = (0, load_package_util_1.loadPackage)('nats', nats_request_json_deserializer_1.NatsRequestJSONDeserializer.name, () => require('nats'));
        this.jsonCodec = natsPackage.JSONCodec();
    }
    deserialize(value, options) {
        const decodedRequest = this.jsonCodec.decode(value);
        return super.deserialize(decodedRequest, options);
    }
}
exports.NatsResponseJSONDeserializer = NatsResponseJSONDeserializer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaRequestDeserializer = void 0;
const incoming_request_deserializer_1 = require("./incoming-request.deserializer");
/**
 * @publicApi
 */
class KafkaRequestDeserializer extends incoming_request_deserializer_1.IncomingRequestDeserializer {
    mapToSchema(data, options) {
        if (!options) {
            return {
                pattern: undefined,
                data: undefined,
            };
        }
        return {
            pattern: options.channel,
            data: data?.value ?? data,
        };
    }
}
exports.KafkaRequestDeserializer = KafkaRequestDeserializer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaResponseDeserializer = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const kafka_headers_enum_1 = require("../enums/kafka-headers.enum");
/**
 * @publicApi
 */
class KafkaResponseDeserializer {
    deserialize(message, options) {
        const id = message.headers[kafka_headers_enum_1.KafkaHeaders.CORRELATION_ID].toString();
        if (!(0, shared_utils_1.isUndefined)(message.headers[kafka_headers_enum_1.KafkaHeaders.NEST_ERR])) {
            return {
                id,
                err: message.headers[kafka_headers_enum_1.KafkaHeaders.NEST_ERR],
                isDisposed: true,
            };
        }
        if (!(0, shared_utils_1.isUndefined)(message.headers[kafka_headers_enum_1.KafkaHeaders.NEST_IS_DISPOSED])) {
            return {
                id,
                response: message.value,
                isDisposed: true,
            };
        }
        return {
            id,
            response: message.value,
            isDisposed: false,
        };
    }
}
exports.KafkaResponseDeserializer = KafkaResponseDeserializer;

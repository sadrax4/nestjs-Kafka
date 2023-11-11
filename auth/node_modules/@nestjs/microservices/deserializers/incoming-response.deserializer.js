"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingResponseDeserializer = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
/**
 * @publicApi
 */
class IncomingResponseDeserializer {
    deserialize(value, options) {
        return this.isExternal(value) ? this.mapToSchema(value) : value;
    }
    isExternal(value) {
        if (!value) {
            return true;
        }
        if (!(0, shared_utils_1.isUndefined)(value.err) ||
            !(0, shared_utils_1.isUndefined)(value.response) ||
            !(0, shared_utils_1.isUndefined)(value.isDisposed)) {
            return false;
        }
        return true;
    }
    mapToSchema(value) {
        return {
            id: value && value.id,
            response: value,
            isDisposed: true,
        };
    }
}
exports.IncomingResponseDeserializer = IncomingResponseDeserializer;

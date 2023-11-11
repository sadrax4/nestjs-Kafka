"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingRequestDeserializer = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
/**
 * @publicApi
 */
class IncomingRequestDeserializer {
    deserialize(value, options) {
        return this.isExternal(value) ? this.mapToSchema(value, options) : value;
    }
    isExternal(value) {
        if (!value) {
            return true;
        }
        if (!(0, shared_utils_1.isUndefined)(value.pattern) ||
            !(0, shared_utils_1.isUndefined)(value.data)) {
            return false;
        }
        return true;
    }
    mapToSchema(value, options) {
        if (!options) {
            return {
                pattern: undefined,
                data: undefined,
            };
        }
        return {
            pattern: options.channel,
            data: value,
        };
    }
}
exports.IncomingRequestDeserializer = IncomingRequestDeserializer;

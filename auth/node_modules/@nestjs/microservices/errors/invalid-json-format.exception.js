"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidJSONFormatException = void 0;
/**
 * @publicApi
 */
class InvalidJSONFormatException extends Error {
    constructor(err, data) {
        super(`Could not parse JSON: ${err.message}\nRequest data: ${data}`);
    }
}
exports.InvalidJSONFormatException = InvalidJSONFormatException;

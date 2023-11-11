"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyResponseException = void 0;
/**
 * @publicApi
 */
class EmptyResponseException extends Error {
    constructor(pattern) {
        super(`Empty response. There are no subscribers listening to that message ("${pattern}")`);
    }
}
exports.EmptyResponseException = EmptyResponseException;

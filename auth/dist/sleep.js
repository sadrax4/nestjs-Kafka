"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
function sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
exports.sleep = sleep;
//# sourceMappingURL=sleep.js.map
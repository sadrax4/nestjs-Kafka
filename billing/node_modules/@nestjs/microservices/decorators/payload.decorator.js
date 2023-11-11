"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payload = void 0;
const rpc_paramtype_enum_1 = require("../enums/rpc-paramtype.enum");
const param_utils_1 = require("../utils/param.utils");
function Payload(propertyOrPipe, ...pipes) {
    return (0, param_utils_1.createPipesRpcParamDecorator)(rpc_paramtype_enum_1.RpcParamtype.PAYLOAD)(propertyOrPipe, ...pipes);
}
exports.Payload = Payload;

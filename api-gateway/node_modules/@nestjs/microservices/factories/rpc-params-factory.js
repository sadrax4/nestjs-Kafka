"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcParamsFactory = void 0;
const rpc_paramtype_enum_1 = require("../enums/rpc-paramtype.enum");
class RpcParamsFactory {
    exchangeKeyForValue(type, data, args) {
        if (!args) {
            return null;
        }
        switch (type) {
            case rpc_paramtype_enum_1.RpcParamtype.PAYLOAD:
                return data ? args[0]?.[data] : args[0];
            case rpc_paramtype_enum_1.RpcParamtype.CONTEXT:
                return args[1];
            case rpc_paramtype_enum_1.RpcParamtype.GRPC_CALL:
                return args[2];
            default:
                return null;
        }
    }
}
exports.RpcParamsFactory = RpcParamsFactory;

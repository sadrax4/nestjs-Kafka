"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_GRPC_CALLBACK_METADATA = exports.DEFAULT_CALLBACK_METADATA = void 0;
const rpc_paramtype_enum_1 = require("../enums/rpc-paramtype.enum");
exports.DEFAULT_CALLBACK_METADATA = {
    [`${rpc_paramtype_enum_1.RpcParamtype.PAYLOAD}:0`]: { index: 0, data: undefined, pipes: [] },
};
exports.DEFAULT_GRPC_CALLBACK_METADATA = {
    [`${rpc_paramtype_enum_1.RpcParamtype.CONTEXT}:1`]: { index: 1, data: undefined, pipes: [] },
    [`${rpc_paramtype_enum_1.RpcParamtype.GRPC_CALL}:2`]: { index: 2, data: undefined, pipes: [] },
    ...exports.DEFAULT_CALLBACK_METADATA,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctx = void 0;
const rpc_paramtype_enum_1 = require("../enums/rpc-paramtype.enum");
const param_utils_1 = require("../utils/param.utils");
exports.Ctx = (0, param_utils_1.createRpcParamDecorator)(rpc_paramtype_enum_1.RpcParamtype.CONTEXT);

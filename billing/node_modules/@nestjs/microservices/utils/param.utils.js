"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPipesRpcParamDecorator = exports.createRpcParamDecorator = void 0;
const route_params_decorator_1 = require("@nestjs/common/decorators/http/route-params.decorator");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
require("reflect-metadata");
const constants_1 = require("../constants");
function createRpcParamDecorator(paramtype) {
    return (...pipes) => (target, key, index) => {
        const args = Reflect.getMetadata(constants_1.PARAM_ARGS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(constants_1.PARAM_ARGS_METADATA, (0, route_params_decorator_1.assignMetadata)(args, paramtype, index, undefined, ...pipes), target.constructor, key);
    };
}
exports.createRpcParamDecorator = createRpcParamDecorator;
const createPipesRpcParamDecorator = (paramtype) => (data, ...pipes) => (target, key, index) => {
    const args = Reflect.getMetadata(constants_1.PARAM_ARGS_METADATA, target.constructor, key) || {};
    const hasParamData = (0, shared_utils_1.isNil)(data) || (0, shared_utils_1.isString)(data);
    const paramData = hasParamData ? data : undefined;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];
    Reflect.defineMetadata(constants_1.PARAM_ARGS_METADATA, (0, route_params_decorator_1.assignMetadata)(args, paramtype, index, paramData, ...paramPipes), target.constructor, key);
};
exports.createPipesRpcParamDecorator = createPipesRpcParamDecorator;

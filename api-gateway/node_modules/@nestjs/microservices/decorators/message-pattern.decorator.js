"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGrpcMethodMetadata = exports.GrpcStreamCall = exports.GrpcStreamMethod = exports.GrpcMethod = exports.MessagePattern = exports.GrpcMethodStreamingType = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
/* eslint-disable @typescript-eslint/no-use-before-define */
const constants_1 = require("../constants");
const pattern_handler_enum_1 = require("../enums/pattern-handler.enum");
const enums_1 = require("../enums");
var GrpcMethodStreamingType;
(function (GrpcMethodStreamingType) {
    GrpcMethodStreamingType["NO_STREAMING"] = "no_stream";
    GrpcMethodStreamingType["RX_STREAMING"] = "rx_stream";
    GrpcMethodStreamingType["PT_STREAMING"] = "pt_stream";
})(GrpcMethodStreamingType || (exports.GrpcMethodStreamingType = GrpcMethodStreamingType = {}));
/**
 * Subscribes to incoming messages which fulfils chosen pattern.
 *
 * @publicApi
 */
const MessagePattern = (metadata, transportOrExtras, maybeExtras) => {
    let transport;
    let extras;
    if (((0, shared_utils_1.isNumber)(transportOrExtras) || (0, shared_utils_1.isSymbol)(transportOrExtras)) &&
        (0, shared_utils_1.isNil)(maybeExtras)) {
        transport = transportOrExtras;
    }
    else if ((0, shared_utils_1.isObject)(transportOrExtras) && (0, shared_utils_1.isNil)(maybeExtras)) {
        extras = transportOrExtras;
    }
    else {
        transport = transportOrExtras;
        extras = maybeExtras;
    }
    return (target, key, descriptor) => {
        Reflect.defineMetadata(constants_1.PATTERN_METADATA, [].concat(metadata), descriptor.value);
        Reflect.defineMetadata(constants_1.PATTERN_HANDLER_METADATA, pattern_handler_enum_1.PatternHandler.MESSAGE, descriptor.value);
        Reflect.defineMetadata(constants_1.TRANSPORT_METADATA, transport, descriptor.value);
        Reflect.defineMetadata(constants_1.PATTERN_EXTRAS_METADATA, {
            ...Reflect.getMetadata(constants_1.PATTERN_EXTRAS_METADATA, descriptor.value),
            ...extras,
        }, descriptor.value);
        return descriptor;
    };
};
exports.MessagePattern = MessagePattern;
function GrpcMethod(service, method) {
    return (target, key, descriptor) => {
        const metadata = createGrpcMethodMetadata(target, key, service, method);
        return (0, exports.MessagePattern)(metadata, enums_1.Transport.GRPC)(target, key, descriptor);
    };
}
exports.GrpcMethod = GrpcMethod;
function GrpcStreamMethod(service, method) {
    return (target, key, descriptor) => {
        const metadata = createGrpcMethodMetadata(target, key, service, method, GrpcMethodStreamingType.RX_STREAMING);
        return (0, exports.MessagePattern)(metadata, enums_1.Transport.GRPC)(target, key, descriptor);
    };
}
exports.GrpcStreamMethod = GrpcStreamMethod;
function GrpcStreamCall(service, method) {
    return (target, key, descriptor) => {
        const metadata = createGrpcMethodMetadata(target, key, service, method, GrpcMethodStreamingType.PT_STREAMING);
        return (0, exports.MessagePattern)(metadata, enums_1.Transport.GRPC)(target, key, descriptor);
    };
}
exports.GrpcStreamCall = GrpcStreamCall;
function createGrpcMethodMetadata(target, key, service, method, streaming = GrpcMethodStreamingType.NO_STREAMING) {
    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    if (!service) {
        const { name } = target.constructor;
        return {
            service: name,
            rpc: capitalizeFirstLetter(key),
            streaming,
        };
    }
    if (service && !method) {
        return { service, rpc: capitalizeFirstLetter(key), streaming };
    }
    return { service, rpc: method, streaming };
}
exports.createGrpcMethodMetadata = createGrpcMethodMetadata;

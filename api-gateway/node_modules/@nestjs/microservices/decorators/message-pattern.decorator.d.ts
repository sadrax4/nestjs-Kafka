import { PatternMetadata } from '../interfaces/pattern-metadata.interface';
import { Transport } from '../enums';
export declare enum GrpcMethodStreamingType {
    NO_STREAMING = "no_stream",
    RX_STREAMING = "rx_stream",
    PT_STREAMING = "pt_stream"
}
/**
 * Subscribes to incoming messages which fulfils chosen pattern.
 *
 * @publicApi
 */
export declare const MessagePattern: {
    <T = PatternMetadata | string>(metadata?: T): MethodDecorator;
    <T = PatternMetadata | string>(metadata?: T, transport?: Transport | symbol): MethodDecorator;
    <T = PatternMetadata | string>(metadata?: T, extras?: Record<string, any>): MethodDecorator;
    <T = PatternMetadata | string>(metadata?: T, transport?: Transport | symbol, extras?: Record<string, any>): MethodDecorator;
};
/**
 * Registers gRPC method handler for specified service.
 */
export declare function GrpcMethod(service?: string): MethodDecorator;
export declare function GrpcMethod(service: string, method?: string): MethodDecorator;
/**
 * Registers gRPC call through RX handler for service and method
 *
 * @param service String parameter reflecting the name of service definition from proto file
 */
export declare function GrpcStreamMethod(service?: string): MethodDecorator;
/**
 * @param service String parameter reflecting the name of service definition from proto file
 * @param method Optional string parameter reflecting the name of method inside of a service definition coming after rpc keyword
 */
export declare function GrpcStreamMethod(service: string, method?: string): MethodDecorator;
/**
 * Registers gRPC call pass through handler for service and method
 *
 * @param service String parameter reflecting the name of service definition from proto file
 */
export declare function GrpcStreamCall(service?: string): MethodDecorator;
/**
 * @param service String parameter reflecting the name of service definition from proto file
 * @param method Optional string parameter reflecting the name of method inside of a service definition coming after rpc keyword
 */
export declare function GrpcStreamCall(service: string, method?: string): MethodDecorator;
export declare function createGrpcMethodMetadata(target: object, key: string | symbol, service: string | undefined, method: string | undefined, streaming?: GrpcMethodStreamingType): {
    service: string;
    rpc: string;
    streaming: GrpcMethodStreamingType;
};

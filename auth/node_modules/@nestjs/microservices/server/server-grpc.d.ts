import { Observable } from 'rxjs';
import { GrpcMethodStreamingType } from '../decorators';
import { Transport } from '../enums';
import { CustomTransportStrategy, MessageHandler } from '../interfaces';
import { GrpcOptions } from '../interfaces/microservice-configuration.interface';
import { Server } from './server';
interface GrpcCall<TRequest = any, TMetadata = any> {
    request: TRequest;
    metadata: TMetadata;
    sendMetadata: Function;
    end: Function;
    write: Function;
    on: Function;
    off: Function;
    emit: Function;
}
export declare class ServerGrpc extends Server implements CustomTransportStrategy {
    private readonly options;
    readonly transportId = Transport.GRPC;
    private readonly url;
    private grpcClient;
    constructor(options: GrpcOptions['options']);
    listen(callback: (err?: unknown, ...optionalParams: unknown[]) => void): Promise<void>;
    start(callback?: () => void): Promise<void>;
    bindEvents(): Promise<void>;
    /**
     * Will return all of the services along with their fully namespaced
     * names as an array of objects.
     * This method initiates recursive scan of grpcPkg object
     */
    getServiceNames(grpcPkg: any): {
        name: string;
        service: any;
    }[];
    /**
     * Will create service mapping from gRPC generated Object to handlers
     * defined with @GrpcMethod or @GrpcStreamMethod annotations
     *
     * @param grpcService
     * @param name
     */
    createService(grpcService: any, name: string): Promise<{}>;
    /**
     * Will create a string of a JSON serialized format
     *
     * @param service name of the service which should be a match to gRPC service definition name
     * @param methodName name of the method which is coming after rpc keyword
     * @param streaming GrpcMethodStreamingType parameter which should correspond to
     * stream keyword in gRPC service request part
     */
    createPattern(service: string, methodName: string, streaming: GrpcMethodStreamingType): string;
    /**
     * Will return async function which will handle gRPC call
     * with Rx streams or as a direct call passthrough
     *
     * @param methodHandler
     * @param protoNativeHandler
     */
    createServiceMethod(methodHandler: Function, protoNativeHandler: any, streamType: GrpcMethodStreamingType): Function;
    createUnaryServiceMethod(methodHandler: Function): Function;
    createStreamServiceMethod(methodHandler: Function): Function;
    /**
     * Writes an observable to a GRPC call.
     *
     * This function will ensure that backpressure is managed while writing values
     * that come from an observable to a GRPC call.
     *
     * @param source The observable we want to write out to the GRPC call.
     * @param call The GRPC call we want to write to.
     * @returns A promise that resolves when we're done writing to the call.
     */
    writeObservableToGrpc<T>(source: Observable<T>, call: GrpcCall<T>): Promise<void>;
    createRequestStreamMethod(methodHandler: Function, isResponseStream: boolean): (call: GrpcCall, callback: (err: unknown, value: unknown) => void) => Promise<void>;
    createStreamCallMethod(methodHandler: Function, isResponseStream: boolean): (call: GrpcCall, callback: (err: unknown, value: unknown) => void) => Promise<void>;
    close(): Promise<void>;
    deserialize(obj: any): any;
    addHandler(pattern: unknown, callback: MessageHandler, isEventHandler?: boolean): void;
    createClient(): Promise<any>;
    lookupPackage(root: any, packageName: string): any;
    loadProto(): any;
    /**
     * Recursively fetch all of the service methods available on loaded
     * protobuf descriptor object, and collect those as an objects with
     * dot-syntax full-path names.
     *
     * Example:
     *  for proto package Bundle.FirstService with service Events { rpc...
     *  will be resolved to object of (while loaded for Bundle package):
     *    {
     *      name: "FirstService.Events",
     *      service: {Object}
     *    }
     */
    private collectDeepServices;
    private parseDeepServiceName;
    private createServices;
}
export {};

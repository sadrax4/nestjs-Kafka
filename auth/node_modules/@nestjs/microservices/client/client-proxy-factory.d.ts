import { Transport } from '../enums/transport.enum';
import { ClientOptions, CustomClientOptions } from '../interfaces/client-metadata.interface';
import { Closeable } from '../interfaces/closeable.interface';
import { ClientGrpcProxy } from './client-grpc';
import { ClientProxy } from './client-proxy';
export interface IClientProxyFactory {
    create(clientOptions: ClientOptions): ClientProxy & Closeable;
}
/**
 * @publicApi
 */
export declare class ClientProxyFactory {
    static create(clientOptions: {
        transport: Transport.GRPC;
    } & ClientOptions): ClientGrpcProxy;
    static create(clientOptions: ClientOptions): ClientProxy & Closeable;
    static create(clientOptions: CustomClientOptions): ClientProxy & Closeable;
    private static isCustomClientOptions;
}

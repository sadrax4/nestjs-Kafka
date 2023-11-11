import { Logger } from '@nestjs/common/services/logger.service';
import { Observable } from 'rxjs';
import { ClientGrpc, GrpcOptions } from '../interfaces';
import { ClientProxy } from './client-proxy';
/**
 * @publicApi
 */
export declare class ClientGrpcProxy extends ClientProxy implements ClientGrpc {
    protected readonly options: GrpcOptions['options'];
    protected readonly logger: Logger;
    protected readonly clients: Map<string, any>;
    protected readonly url: string;
    protected grpcClients: any[];
    constructor(options: GrpcOptions['options']);
    getService<T extends {}>(name: string): T;
    getClientByServiceName<T = unknown>(name: string): T;
    createClientByServiceName(name: string): any;
    getKeepaliveOptions(): {};
    createServiceMethod(client: any, methodName: string): (...args: unknown[]) => Observable<unknown>;
    createStreamServiceMethod(client: unknown, methodName: string): (...args: any[]) => Observable<any>;
    createUnaryServiceMethod(client: any, methodName: string): (...args: any[]) => Observable<any>;
    createClients(): any[];
    loadProto(): any;
    lookupPackage(root: any, packageName: string): any;
    close(): void;
    connect(): Promise<any>;
    send<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult>;
    protected getClient(name: string): any;
    protected publish(packet: any, callback: (packet: any) => any): any;
    protected dispatchEvent(packet: any): Promise<any>;
}

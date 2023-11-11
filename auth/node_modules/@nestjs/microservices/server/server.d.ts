import { LoggerService } from '@nestjs/common/services/logger.service';
import { Observable, ObservedValueOf, Subscription } from 'rxjs';
import { BaseRpcContext } from '../ctx-host/base-rpc.context';
import { ClientOptions, MessageHandler, MicroserviceOptions, MsPattern, ReadPacket, WritePacket } from '../interfaces';
import { ConsumerDeserializer } from '../interfaces/deserializer.interface';
import { ConsumerSerializer } from '../interfaces/serializer.interface';
export declare abstract class Server {
    protected readonly messageHandlers: Map<string, MessageHandler<any, any, any>>;
    protected readonly logger: LoggerService;
    protected serializer: ConsumerSerializer;
    protected deserializer: ConsumerDeserializer;
    addHandler(pattern: any, callback: MessageHandler, isEventHandler?: boolean, extras?: Record<string, any>): void;
    getHandlers(): Map<string, MessageHandler>;
    getHandlerByPattern(pattern: string): MessageHandler | null;
    send(stream$: Observable<any>, respond: (data: WritePacket) => unknown | Promise<unknown>): Subscription;
    handleEvent(pattern: string, packet: ReadPacket, context: BaseRpcContext): Promise<any>;
    transformToObservable<T>(resultOrDeferred: Observable<T> | Promise<T>): Observable<T>;
    transformToObservable<T>(resultOrDeferred: T): never extends Observable<ObservedValueOf<T>> ? Observable<T> : Observable<ObservedValueOf<T>>;
    getOptionsProp<T extends MicroserviceOptions['options'], K extends keyof T>(obj: T, prop: K, defaultValue?: T[K]): T[K];
    protected handleError(error: string): void;
    protected loadPackage<T = any>(name: string, ctx: string, loader?: Function): T;
    protected initializeSerializer(options: ClientOptions['options']): void;
    protected initializeDeserializer(options: ClientOptions['options']): void;
    /**
     * Transforms the server Pattern to valid type and returns a route for him.
     *
     * @param  {string} pattern - server pattern
     * @returns string
     */
    protected getRouteFromPattern(pattern: string): string;
    protected normalizePattern(pattern: MsPattern): string;
}

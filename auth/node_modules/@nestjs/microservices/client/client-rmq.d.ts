/// <reference types="node" />
/// <reference types="node" />
import { Logger } from '@nestjs/common/services/logger.service';
import { EventEmitter } from 'events';
import { Observable, ReplaySubject } from 'rxjs';
import { RmqUrl } from '../external/rmq-url.interface';
import { ReadPacket, RmqOptions, WritePacket } from '../interfaces';
import { ClientProxy } from './client-proxy';
type Channel = any;
type ChannelWrapper = any;
type AmqpConnectionManager = any;
/**
 * @publicApi
 */
export declare class ClientRMQ extends ClientProxy {
    protected readonly options: RmqOptions['options'];
    protected readonly logger: Logger;
    protected connection$: ReplaySubject<any>;
    protected connection: Promise<any>;
    protected client: AmqpConnectionManager;
    protected channel: ChannelWrapper;
    protected urls: string[] | RmqUrl[];
    protected queue: string;
    protected queueOptions: Record<string, any>;
    protected responseEmitter: EventEmitter;
    protected replyQueue: string;
    protected persistent: boolean;
    protected noAssert: boolean;
    constructor(options: RmqOptions['options']);
    close(): void;
    connect(): Promise<any>;
    createChannel(): Promise<void>;
    createClient(): AmqpConnectionManager;
    mergeDisconnectEvent<T = any>(instance: any, source$: Observable<T>): Observable<T>;
    convertConnectionToPromise(): Promise<any>;
    setupChannel(channel: Channel, resolve: Function): Promise<void>;
    consumeChannel(channel: Channel): Promise<void>;
    handleError(client: AmqpConnectionManager): void;
    handleDisconnectError(client: AmqpConnectionManager): void;
    handleMessage(packet: unknown, callback: (packet: WritePacket) => any): any;
    handleMessage(packet: unknown, options: Record<string, unknown>, callback: (packet: WritePacket) => any): any;
    protected publish(message: ReadPacket, callback: (packet: WritePacket) => any): () => void;
    protected dispatchEvent(packet: ReadPacket): Promise<any>;
    protected initializeSerializer(options: RmqOptions['options']): void;
    protected mergeHeaders(requestHeaders?: Record<string, string>): Record<string, string> | undefined;
    protected parseMessageContent(content: Buffer): any;
}
export {};

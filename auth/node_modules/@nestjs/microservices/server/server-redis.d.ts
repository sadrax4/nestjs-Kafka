import { Transport } from '../enums';
import { CustomTransportStrategy, RedisOptions } from '../interfaces';
import { Server } from './server';
type Redis = any;
export declare class ServerRedis extends Server implements CustomTransportStrategy {
    private readonly options;
    readonly transportId = Transport.REDIS;
    private subClient;
    private pubClient;
    private isExplicitlyTerminated;
    constructor(options: RedisOptions['options']);
    listen(callback: (err?: unknown, ...optionalParams: unknown[]) => void): void;
    start(callback?: () => void): void;
    bindEvents(subClient: Redis, pubClient: Redis): void;
    close(): void;
    createRedisClient(): Redis;
    getMessageHandler(pub: Redis): (channel: string, pattern: string, buffer: string | any) => Promise<any>;
    handleMessage(channel: string, buffer: string | any, pub: Redis, pattern: string): Promise<any>;
    getPublisher(pub: Redis, pattern: any, id: string): (response: any) => any;
    parseMessage(content: any): Record<string, any>;
    getRequestPattern(pattern: string): string;
    getReplyPattern(pattern: string): string;
    handleError(stream: any): void;
    getClientOptions(): Partial<RedisOptions['options']>;
    createRetryStrategy(times: number): undefined | number | void;
}
export {};

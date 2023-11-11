import { Logger } from '@nestjs/common/services/logger.service';
import { ReadPacket, RedisOptions, WritePacket } from '../interfaces';
import { ClientProxy } from './client-proxy';
type Redis = any;
/**
 * @publicApi
 */
export declare class ClientRedis extends ClientProxy {
    protected readonly options: RedisOptions['options'];
    protected readonly logger: Logger;
    protected readonly subscriptionsCount: Map<string, number>;
    protected pubClient: Redis;
    protected subClient: Redis;
    protected connection: Promise<any>;
    protected isExplicitlyTerminated: boolean;
    constructor(options: RedisOptions['options']);
    getRequestPattern(pattern: string): string;
    getReplyPattern(pattern: string): string;
    close(): void;
    connect(): Promise<any>;
    createClient(): Redis;
    handleError(client: Redis): void;
    getClientOptions(): Partial<RedisOptions['options']>;
    createRetryStrategy(times: number): undefined | number;
    createResponseCallback(): (channel: string, buffer: string) => Promise<void>;
    protected publish(partialPacket: ReadPacket, callback: (packet: WritePacket) => any): () => void;
    protected dispatchEvent(packet: ReadPacket): Promise<any>;
    protected unsubscribeFromChannel(channel: string): void;
}
export {};

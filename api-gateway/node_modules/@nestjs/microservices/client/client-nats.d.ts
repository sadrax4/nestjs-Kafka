import { Logger } from '@nestjs/common/services/logger.service';
import { Client, NatsMsg } from '../external/nats-client.interface';
import { NatsOptions, PacketId, ReadPacket, WritePacket } from '../interfaces';
import { ClientProxy } from './client-proxy';
/**
 * @publicApi
 */
export declare class ClientNats extends ClientProxy {
    protected readonly options: NatsOptions['options'];
    protected readonly logger: Logger;
    protected natsClient: Client;
    constructor(options: NatsOptions['options']);
    close(): Promise<void>;
    connect(): Promise<any>;
    createClient(): Promise<Client>;
    handleStatusUpdates(client: Client): Promise<void>;
    createSubscriptionHandler(packet: ReadPacket & PacketId, callback: (packet: WritePacket) => any): (error: unknown | undefined, natsMsg: NatsMsg) => Promise<any>;
    protected publish(partialPacket: ReadPacket, callback: (packet: WritePacket) => any): () => void;
    protected dispatchEvent(packet: ReadPacket): Promise<any>;
    protected initializeSerializer(options: NatsOptions['options']): void;
    protected initializeDeserializer(options: NatsOptions['options']): void;
    protected mergeHeaders<THeaders = any>(requestHeaders?: THeaders): any;
}

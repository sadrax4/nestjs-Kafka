import { Transport } from '../enums';
import { Client, NatsMsg } from '../external/nats-client.interface';
import { CustomTransportStrategy } from '../interfaces';
import { NatsOptions } from '../interfaces/microservice-configuration.interface';
import { Server } from './server';
export declare class ServerNats extends Server implements CustomTransportStrategy {
    private readonly options;
    readonly transportId = Transport.NATS;
    private natsClient;
    constructor(options: NatsOptions['options']);
    listen(callback: (err?: unknown, ...optionalParams: unknown[]) => void): Promise<void>;
    start(callback: (err?: unknown, ...optionalParams: unknown[]) => void): void;
    bindEvents(client: Client): void;
    close(): Promise<void>;
    createNatsClient(): Promise<Client>;
    getMessageHandler(channel: string): Function;
    handleMessage(channel: string, natsMsg: NatsMsg): Promise<any>;
    getPublisher(natsMsg: NatsMsg, id: string): ((response: any) => boolean) | (() => void);
    handleStatusUpdates(client: Client): Promise<void>;
    protected initializeSerializer(options: NatsOptions['options']): void;
    protected initializeDeserializer(options: NatsOptions['options']): void;
}

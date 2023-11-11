/// <reference types="node" />
import { Transport } from '../enums';
import { MqttClient } from '../external/mqtt-client.interface';
import { CustomTransportStrategy, MessageHandler, PacketId, ReadPacket } from '../interfaces';
import { MqttOptions } from '../interfaces/microservice-configuration.interface';
import { Server } from './server';
export declare class ServerMqtt extends Server implements CustomTransportStrategy {
    private readonly options;
    readonly transportId = Transport.MQTT;
    protected mqttClient: MqttClient;
    private readonly url;
    constructor(options: MqttOptions['options']);
    listen(callback: (err?: unknown, ...optionalParams: unknown[]) => void): Promise<void>;
    start(callback: (err?: unknown, ...optionalParams: unknown[]) => void): void;
    bindEvents(mqttClient: MqttClient): void;
    close(): void;
    createMqttClient(): MqttClient;
    getMessageHandler(pub: MqttClient): Function;
    handleMessage(channel: string, buffer: Buffer, pub: MqttClient, originalPacket?: Record<string, any>): Promise<any>;
    getPublisher(client: MqttClient, pattern: any, id: string): any;
    parseMessage(content: any): ReadPacket & PacketId;
    matchMqttPattern(pattern: string, topic: string): boolean;
    getHandlerByPattern(pattern: string): MessageHandler | null;
    removeHandlerKeySharedPrefix(handlerKey: string): string;
    getRequestPattern(pattern: string): string;
    getReplyPattern(pattern: string): string;
    handleError(stream: any): void;
    protected initializeSerializer(options: MqttOptions['options']): void;
}

/// <reference types="node" />
import { Logger } from '@nestjs/common/services/logger.service';
import { Observable } from 'rxjs';
import { MqttClient } from '../external/mqtt-client.interface';
import { MqttOptions, ReadPacket, WritePacket } from '../interfaces';
import { MqttRecordOptions } from '../record-builders/mqtt.record-builder';
import { ClientProxy } from './client-proxy';
/**
 * @publicApi
 */
export declare class ClientMqtt extends ClientProxy {
    protected readonly options: MqttOptions['options'];
    protected readonly logger: Logger;
    protected readonly subscriptionsCount: Map<string, number>;
    protected readonly url: string;
    protected mqttClient: MqttClient;
    protected connection: Promise<any>;
    constructor(options: MqttOptions['options']);
    getRequestPattern(pattern: string): string;
    getResponsePattern(pattern: string): string;
    close(): void;
    connect(): Promise<any>;
    mergeCloseEvent<T = any>(instance: MqttClient, source$: Observable<T>): Observable<T>;
    createClient(): MqttClient;
    handleError(client: MqttClient): void;
    createResponseCallback(): (channel: string, buffer: Buffer) => any;
    protected publish(partialPacket: ReadPacket, callback: (packet: WritePacket) => any): () => void;
    protected dispatchEvent(packet: ReadPacket): Promise<any>;
    protected unsubscribeFromChannel(channel: string): void;
    protected initializeSerializer(options: MqttOptions['options']): void;
    protected mergePacketOptions(requestOptions?: MqttRecordOptions): MqttRecordOptions | undefined;
}

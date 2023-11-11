import { Logger } from '@nestjs/common/services/logger.service';
import { BrokersFunction, Consumer, ConsumerGroupJoinEvent, EachMessagePayload, Kafka, Producer, TopicPartitionOffsetAndMetadata } from '../external/kafka.interface';
import { KafkaParser } from '../helpers';
import { KafkaOptions, OutgoingEvent, ReadPacket, WritePacket } from '../interfaces';
import { ClientProxy } from './client-proxy';
/**
 * @publicApi
 */
export declare class ClientKafka extends ClientProxy {
    protected readonly options: KafkaOptions['options'];
    protected logger: Logger;
    protected client: Kafka | null;
    protected consumer: Consumer | null;
    protected producer: Producer | null;
    protected parser: KafkaParser | null;
    protected initialized: Promise<void> | null;
    protected responsePatterns: string[];
    protected consumerAssignments: {
        [key: string]: number;
    };
    protected brokers: string[] | BrokersFunction;
    protected clientId: string;
    protected groupId: string;
    protected producerOnlyMode: boolean;
    constructor(options: KafkaOptions['options']);
    subscribeToResponseOf(pattern: any): void;
    close(): Promise<void>;
    connect(): Promise<Producer>;
    bindTopics(): Promise<void>;
    createClient<T = any>(): T;
    createResponseCallback(): (payload: EachMessagePayload) => any;
    getConsumerAssignments(): {
        [key: string]: number;
    };
    protected dispatchEvent(packet: OutgoingEvent): Promise<any>;
    protected getReplyTopicPartition(topic: string): string;
    protected publish(partialPacket: ReadPacket, callback: (packet: WritePacket) => any): () => void;
    protected getResponsePatternName(pattern: string): string;
    protected setConsumerAssignments(data: ConsumerGroupJoinEvent): void;
    protected initializeSerializer(options: KafkaOptions['options']): void;
    protected initializeDeserializer(options: KafkaOptions['options']): void;
    commitOffsets(topicPartitions: TopicPartitionOffsetAndMetadata[]): Promise<void>;
}

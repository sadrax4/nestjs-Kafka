import { Consumer, KafkaMessage, Producer } from '../external/kafka.interface';
import { BaseRpcContext } from './base-rpc.context';
type KafkaContextArgs = [
    message: KafkaMessage,
    partition: number,
    topic: string,
    consumer: Consumer,
    heartbeat: () => Promise<void>,
    producer: Producer
];
export declare class KafkaContext extends BaseRpcContext<KafkaContextArgs> {
    constructor(args: KafkaContextArgs);
    /**
     * Returns the reference to the original message.
     */
    getMessage(): KafkaMessage;
    /**
     * Returns the partition.
     */
    getPartition(): number;
    /**
     * Returns the name of the topic.
     */
    getTopic(): string;
    /**
     * Returns the Kafka consumer reference.
     */
    getConsumer(): Consumer;
    /**
     * Returns the Kafka heartbeat callback.
     */
    getHeartbeat(): () => Promise<void>;
    /**
     * Returns the Kafka producer reference,
     */
    getProducer(): Producer;
}
export {};

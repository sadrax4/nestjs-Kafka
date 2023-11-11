import { ReadPacket, Serializer } from '../interfaces';
import { MqttRecord } from '../record-builders';
export declare class MqttRecordSerializer implements Serializer<ReadPacket, ReadPacket & Partial<MqttRecord>> {
    serialize(packet: ReadPacket | any): ReadPacket & Partial<MqttRecord>;
}

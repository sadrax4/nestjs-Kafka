import { ReadPacket } from '../interfaces';
import { Serializer } from '../interfaces/serializer.interface';
import { RmqRecord } from '../record-builders';
export declare class RmqRecordSerializer implements Serializer<ReadPacket, ReadPacket & Partial<RmqRecord>> {
    serialize(packet: ReadPacket | any): ReadPacket & Partial<RmqRecord>;
}

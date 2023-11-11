/// <reference types="node" />
import { ClientKafka } from '../client/client-kafka';
import { Cluster, GroupMember, GroupMemberAssignment, GroupState } from '../external/kafka.interface';
export declare class KafkaReplyPartitionAssigner {
    private readonly clientKafka;
    private readonly config;
    readonly name = "NestReplyPartitionAssigner";
    readonly version = 1;
    constructor(clientKafka: ClientKafka, config: {
        cluster: Cluster;
    });
    /**
     * This process can result in imbalanced assignments
     * @param {array} members array of members, e.g: [{ memberId: 'test-5f93f5a3' }]
     * @param {array} topics
     * @param {Buffer} userData
     * @returns {array} object partitions per topic per member
     */
    assign(group: {
        members: GroupMember[];
        topics: string[];
    }): Promise<GroupMemberAssignment[]>;
    protocol(subscription: {
        topics: string[];
        userData: Buffer;
    }): GroupState;
    getPreviousAssignment(): {
        [key: string]: number;
    };
    decodeMember(member: GroupMember): {
        memberId: string;
        previousAssignment: any;
    };
}

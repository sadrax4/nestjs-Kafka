"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaHeaders = void 0;
/**
 * @see https://docs.spring.io/spring-kafka/api/org/springframework/kafka/support/KafkaHeaders.html
 *
 * @publicApi
 */
var KafkaHeaders;
(function (KafkaHeaders) {
    KafkaHeaders["ACKNOWLEDGMENT"] = "kafka_acknowledgment";
    KafkaHeaders["BATCH_CONVERTED_HEADERS"] = "kafka_batchConvertedHeaders";
    KafkaHeaders["CONSUMER"] = "kafka_consumer";
    KafkaHeaders["CORRELATION_ID"] = "kafka_correlationId";
    KafkaHeaders["DELIVERY_ATTEMPT"] = "kafka_deliveryAttempt";
    KafkaHeaders["DLT_EXCEPTION_FQCN"] = "kafka_dlt-exception-fqcn";
    KafkaHeaders["DLT_EXCEPTION_MESSAGE"] = "kafka_dlt-exception-message";
    KafkaHeaders["DLT_EXCEPTION_STACKTRACE"] = "kafka_dlt-exception-stacktrace";
    KafkaHeaders["DLT_ORIGINAL_OFFSET"] = "kafka_dlt-original-offset";
    KafkaHeaders["DLT_ORIGINAL_PARTITION"] = "kafka_dlt-original-partition";
    KafkaHeaders["DLT_ORIGINAL_TIMESTAMP"] = "kafka_dlt-original-timestamp";
    KafkaHeaders["DLT_ORIGINAL_TIMESTAMP_TYPE"] = "kafka_dlt-original-timestamp-type";
    KafkaHeaders["DLT_ORIGINAL_TOPIC"] = "kafka_dlt-original-topic";
    KafkaHeaders["GROUP_ID"] = "kafka_groupId";
    KafkaHeaders["MESSAGE_KEY"] = "kafka_messageKey";
    KafkaHeaders["NATIVE_HEADERS"] = "kafka_nativeHeaders";
    KafkaHeaders["OFFSET"] = "kafka_offset";
    KafkaHeaders["PARTITION_ID"] = "kafka_partitionId";
    KafkaHeaders["PREFIX"] = "kafka_";
    KafkaHeaders["RAW_DATA"] = "kafka_data";
    KafkaHeaders["RECEIVED"] = "kafka_received";
    KafkaHeaders["RECEIVED_MESSAGE_KEY"] = "kafka_receivedMessageKey";
    KafkaHeaders["RECEIVED_PARTITION_ID"] = "kafka_receivedPartitionId";
    KafkaHeaders["RECEIVED_TIMESTAMP"] = "kafka_receivedTimestamp";
    KafkaHeaders["RECEIVED_TOPIC"] = "kafka_receivedTopic";
    KafkaHeaders["RECORD_METADATA"] = "kafka_recordMetadata";
    KafkaHeaders["REPLY_PARTITION"] = "kafka_replyPartition";
    KafkaHeaders["REPLY_TOPIC"] = "kafka_replyTopic";
    KafkaHeaders["TIMESTAMP"] = "kafka_timestamp";
    KafkaHeaders["TIMESTAMP_TYPE"] = "kafka_timestampType";
    KafkaHeaders["TOPIC"] = "kafka_topic";
    // framework specific headers
    KafkaHeaders["NEST_ERR"] = "kafka_nest-err";
    KafkaHeaders["NEST_IS_DISPOSED"] = "kafka_nest-is-disposed";
})(KafkaHeaders || (exports.KafkaHeaders = KafkaHeaders = {}));

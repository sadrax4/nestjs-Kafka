"use strict";
/**
 * Do NOT add NestJS logic to this interface.  It is meant to ONLY represent the types for the kafkajs package.
 *
 * @see https://github.com/tulios/kafkajs/blob/master/types/index.d.ts
 *
 * @publicApi
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionCodecs = exports.CompressionTypes = exports.logLevel = exports.AssignerProtocol = exports.PartitionAssigners = exports.ResourcePatternTypes = exports.AclOperationTypes = exports.AclPermissionTypes = exports.ConfigSource = exports.ConfigResourceTypes = exports.AclResourceTypes = exports.Partitioners = void 0;
var AclResourceTypes;
(function (AclResourceTypes) {
    AclResourceTypes[AclResourceTypes["UNKNOWN"] = 0] = "UNKNOWN";
    AclResourceTypes[AclResourceTypes["ANY"] = 1] = "ANY";
    AclResourceTypes[AclResourceTypes["TOPIC"] = 2] = "TOPIC";
    AclResourceTypes[AclResourceTypes["GROUP"] = 3] = "GROUP";
    AclResourceTypes[AclResourceTypes["CLUSTER"] = 4] = "CLUSTER";
    AclResourceTypes[AclResourceTypes["TRANSACTIONAL_ID"] = 5] = "TRANSACTIONAL_ID";
    AclResourceTypes[AclResourceTypes["DELEGATION_TOKEN"] = 6] = "DELEGATION_TOKEN";
})(AclResourceTypes || (exports.AclResourceTypes = AclResourceTypes = {}));
var ConfigResourceTypes;
(function (ConfigResourceTypes) {
    ConfigResourceTypes[ConfigResourceTypes["UNKNOWN"] = 0] = "UNKNOWN";
    ConfigResourceTypes[ConfigResourceTypes["TOPIC"] = 2] = "TOPIC";
    ConfigResourceTypes[ConfigResourceTypes["BROKER"] = 4] = "BROKER";
    ConfigResourceTypes[ConfigResourceTypes["BROKER_LOGGER"] = 8] = "BROKER_LOGGER";
})(ConfigResourceTypes || (exports.ConfigResourceTypes = ConfigResourceTypes = {}));
var ConfigSource;
(function (ConfigSource) {
    ConfigSource[ConfigSource["UNKNOWN"] = 0] = "UNKNOWN";
    ConfigSource[ConfigSource["TOPIC_CONFIG"] = 1] = "TOPIC_CONFIG";
    ConfigSource[ConfigSource["DYNAMIC_BROKER_CONFIG"] = 2] = "DYNAMIC_BROKER_CONFIG";
    ConfigSource[ConfigSource["DYNAMIC_DEFAULT_BROKER_CONFIG"] = 3] = "DYNAMIC_DEFAULT_BROKER_CONFIG";
    ConfigSource[ConfigSource["STATIC_BROKER_CONFIG"] = 4] = "STATIC_BROKER_CONFIG";
    ConfigSource[ConfigSource["DEFAULT_CONFIG"] = 5] = "DEFAULT_CONFIG";
    ConfigSource[ConfigSource["DYNAMIC_BROKER_LOGGER_CONFIG"] = 6] = "DYNAMIC_BROKER_LOGGER_CONFIG";
})(ConfigSource || (exports.ConfigSource = ConfigSource = {}));
var AclPermissionTypes;
(function (AclPermissionTypes) {
    AclPermissionTypes[AclPermissionTypes["UNKNOWN"] = 0] = "UNKNOWN";
    AclPermissionTypes[AclPermissionTypes["ANY"] = 1] = "ANY";
    AclPermissionTypes[AclPermissionTypes["DENY"] = 2] = "DENY";
    AclPermissionTypes[AclPermissionTypes["ALLOW"] = 3] = "ALLOW";
})(AclPermissionTypes || (exports.AclPermissionTypes = AclPermissionTypes = {}));
var AclOperationTypes;
(function (AclOperationTypes) {
    AclOperationTypes[AclOperationTypes["UNKNOWN"] = 0] = "UNKNOWN";
    AclOperationTypes[AclOperationTypes["ANY"] = 1] = "ANY";
    AclOperationTypes[AclOperationTypes["ALL"] = 2] = "ALL";
    AclOperationTypes[AclOperationTypes["READ"] = 3] = "READ";
    AclOperationTypes[AclOperationTypes["WRITE"] = 4] = "WRITE";
    AclOperationTypes[AclOperationTypes["CREATE"] = 5] = "CREATE";
    AclOperationTypes[AclOperationTypes["DELETE"] = 6] = "DELETE";
    AclOperationTypes[AclOperationTypes["ALTER"] = 7] = "ALTER";
    AclOperationTypes[AclOperationTypes["DESCRIBE"] = 8] = "DESCRIBE";
    AclOperationTypes[AclOperationTypes["CLUSTER_ACTION"] = 9] = "CLUSTER_ACTION";
    AclOperationTypes[AclOperationTypes["DESCRIBE_CONFIGS"] = 10] = "DESCRIBE_CONFIGS";
    AclOperationTypes[AclOperationTypes["ALTER_CONFIGS"] = 11] = "ALTER_CONFIGS";
    AclOperationTypes[AclOperationTypes["IDEMPOTENT_WRITE"] = 12] = "IDEMPOTENT_WRITE";
})(AclOperationTypes || (exports.AclOperationTypes = AclOperationTypes = {}));
var ResourcePatternTypes;
(function (ResourcePatternTypes) {
    ResourcePatternTypes[ResourcePatternTypes["UNKNOWN"] = 0] = "UNKNOWN";
    ResourcePatternTypes[ResourcePatternTypes["ANY"] = 1] = "ANY";
    ResourcePatternTypes[ResourcePatternTypes["MATCH"] = 2] = "MATCH";
    ResourcePatternTypes[ResourcePatternTypes["LITERAL"] = 3] = "LITERAL";
    ResourcePatternTypes[ResourcePatternTypes["PREFIXED"] = 4] = "PREFIXED";
})(ResourcePatternTypes || (exports.ResourcePatternTypes = ResourcePatternTypes = {}));
var logLevel;
(function (logLevel) {
    logLevel[logLevel["NOTHING"] = 0] = "NOTHING";
    logLevel[logLevel["ERROR"] = 1] = "ERROR";
    logLevel[logLevel["WARN"] = 2] = "WARN";
    logLevel[logLevel["INFO"] = 4] = "INFO";
    logLevel[logLevel["DEBUG"] = 5] = "DEBUG";
})(logLevel || (exports.logLevel = logLevel = {}));
var CompressionTypes;
(function (CompressionTypes) {
    CompressionTypes[CompressionTypes["None"] = 0] = "None";
    CompressionTypes[CompressionTypes["GZIP"] = 1] = "GZIP";
    CompressionTypes[CompressionTypes["Snappy"] = 2] = "Snappy";
    CompressionTypes[CompressionTypes["LZ4"] = 3] = "LZ4";
    CompressionTypes[CompressionTypes["ZSTD"] = 4] = "ZSTD";
})(CompressionTypes || (exports.CompressionTypes = CompressionTypes = {}));

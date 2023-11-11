"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaLogger = void 0;
const kafka_interface_1 = require("../external/kafka.interface");
const KafkaLogger = (logger) => ({ namespace, level, label, log }) => {
    let loggerMethod;
    switch (level) {
        case kafka_interface_1.logLevel.ERROR:
        case kafka_interface_1.logLevel.NOTHING:
            loggerMethod = 'error';
            break;
        case kafka_interface_1.logLevel.WARN:
            loggerMethod = 'warn';
            break;
        case kafka_interface_1.logLevel.INFO:
            loggerMethod = 'log';
            break;
        case kafka_interface_1.logLevel.DEBUG:
        default:
            loggerMethod = 'debug';
            break;
    }
    const { message, ...others } = log;
    if (logger[loggerMethod]) {
        logger[loggerMethod](`${label} [${namespace}] ${message} ${JSON.stringify(others)}`);
    }
};
exports.KafkaLogger = KafkaLogger;

import pino from 'pino'
import moment from 'moment'

const formatters = {
  level(label, number) {
    return { level: label.toUpperCase() };
  },
};

const opts = {
  messageKey: "message",
  formatters,
  base: undefined,
  timestamp: () => `,"timestamp":"${moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')}"`,
};

const logger = pino(opts);

module.exports.logger = logger;
const { createLogger, format, transports, config } = require("winston");
const path = require("path");

let level, silent;
switch (process.env.NODE_ENV) {
  case "production":
    level = "warning";
    silent = false;
    break;
  case "test":
    level = "emerg";
    silent = true;
    break;
  default:
    level = "debug";
    silent = false;
    break;
}

const options = {
  console: {
    level,
    silent,
    handleExceptions: true,
    format: format.combine(
      format.colorize(),
      format.splat(),
      format.printf(
        (info) => `${new Date().toISOString()} ${info.level}: ${info.message}`
      )
    ),
  },
};

const filename = path.join(process.cwd(), "created-logfile.log");

const logger = createLogger({
  levels: config.syslog.levels,
  transports: [
    new transports.Console(options.console),
    new transports.File({ filename }),
  ],
  exitOnError: false,
});

module.exports = logger;

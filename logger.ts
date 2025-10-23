import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Log rotation configuration
const logRotationConfig = {
	datePattern: "YYYY-MM-DD",
	maxSize: process.env.LOG_MAX_SIZE || "20m",
	maxFiles: process.env.LOG_MAX_FILES || "14d", // Keep logs for 14 days
	zippedArchive: process.env.LOG_ZIP_ARCHIVE === "true" || true, // Compress old logs
	auditFile: "logs/.audit.json" // Audit file for rotation tracking
};

// Create Winston logger with structured logging and log rotation
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json()
	),
	defaultMeta: { service: "imposter-server" },
	transports: [
		// Error logs with daily rotation
		new DailyRotateFile({
			filename: "logs/error-%DATE%.log",
			datePattern: logRotationConfig.datePattern,
			level: "error",
			maxSize: logRotationConfig.maxSize,
			maxFiles: logRotationConfig.maxFiles,
			zippedArchive: logRotationConfig.zippedArchive,
			auditFile: logRotationConfig.auditFile
		}),
		// Combined logs with daily rotation
		new DailyRotateFile({
			filename: "logs/combined-%DATE%.log",
			datePattern: logRotationConfig.datePattern,
			maxSize: logRotationConfig.maxSize,
			maxFiles: logRotationConfig.maxFiles,
			zippedArchive: logRotationConfig.zippedArchive,
			auditFile: logRotationConfig.auditFile
		})
	]
});

// If we're not in production, log to the console with a simpler format
if (process.env.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			)
		})
	);
}

// Handle rotation events for monitoring
logger.transports.forEach((transport) => {
	if (transport instanceof DailyRotateFile) {
		transport.on("rotate", (oldFilename, newFilename) => {
			logger.info("Log file rotated", { oldFilename, newFilename });
		});
		
		transport.on("archive", (zipFilename) => {
			logger.info("Log file archived", { zipFilename });
		});
		
		transport.on("logRemoved", (removedFilename) => {
			logger.info("Old log file removed", { removedFilename });
		});
	}
});

export default logger;


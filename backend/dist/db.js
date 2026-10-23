"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
require("reflect-metadata");
require("dotenv/config");
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
const ca = process.env.DB_CA_BASE64 ? Buffer.from(process.env.DB_CA_BASE64, 'base64').toString('utf8') : undefined;
exports.db = new typeorm_1.DataSource({ type: 'mysql', host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), username: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'aces', entities: [entities_1.User, entities_1.Unit, entities_1.Professional, entities_1.Appointment, entities_1.Review, entities_1.MedicalNote, entities_1.RenewalRequest, entities_1.QueueTicket, entities_1.ClinicalRecord], synchronize: process.env.NODE_ENV !== 'production' && process.env.DB_SYNCHRONIZE === 'true', ssl: ca ? { ca, rejectUnauthorized: true } : process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined, timezone: 'Z' });

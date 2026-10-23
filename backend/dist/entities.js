"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalRecord = exports.QueueTicket = exports.RenewalRequest = exports.MedicalNote = exports.Review = exports.Appointment = exports.Professional = exports.Unit = exports.User = void 0;
const typeorm_1 = require("typeorm");
let User = class User {
    id;
    name;
    email;
    passwordHash;
    phone;
    role;
    createdAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 190 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'password_hash' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, length: 30 }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 12, default: 'patient' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
let Unit = class Unit {
    id;
    name;
    address;
    neighborhood;
    hours;
    latitude;
    longitude;
};
exports.Unit = Unit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Unit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Unit.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Unit.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Unit.prototype, "neighborhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Unit.prototype, "hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Unit.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Unit.prototype, "longitude", void 0);
exports.Unit = Unit = __decorate([
    (0, typeorm_1.Entity)('units')
], Unit);
let Professional = class Professional {
    id;
    name;
    specialty;
    unitId;
    bio;
};
exports.Professional = Professional;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Professional.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Professional.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Professional.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Professional.prototype, "unitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Professional.prototype, "bio", void 0);
exports.Professional = Professional = __decorate([
    (0, typeorm_1.Entity)('professionals')
], Professional);
let Appointment = class Appointment {
    id;
    userId;
    professionalId;
    unitId;
    startsAt;
    status;
    createdAt;
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Appointment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Appointment.prototype, "professionalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Appointment.prototype, "unitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Appointment.prototype, "startsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 15, default: 'scheduled' }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments'),
    (0, typeorm_1.Index)(['professionalId', 'startsAt'])
], Appointment);
let Review = class Review {
    id;
    userId;
    appointmentId;
    professionalId;
    rating;
    comment;
    createdAt;
};
exports.Review = Review;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Review.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Review.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Review.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Review.prototype, "professionalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
exports.Review = Review = __decorate([
    (0, typeorm_1.Entity)('reviews'),
    (0, typeorm_1.Index)(['userId', 'appointmentId'], { unique: true })
], Review);
let MedicalNote = class MedicalNote {
    id;
    userId;
    title;
    description;
    createdAt;
};
exports.MedicalNote = MedicalNote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MedicalNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MedicalNote.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], MedicalNote.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicalNote.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MedicalNote.prototype, "createdAt", void 0);
exports.MedicalNote = MedicalNote = __decorate([
    (0, typeorm_1.Entity)('medical_notes')
], MedicalNote);
let RenewalRequest = class RenewalRequest {
    id;
    userId;
    medication;
    note;
    status;
    createdAt;
};
exports.RenewalRequest = RenewalRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RenewalRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RenewalRequest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], RenewalRequest.prototype, "medication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RenewalRequest.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'received' }),
    __metadata("design:type", String)
], RenewalRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RenewalRequest.prototype, "createdAt", void 0);
exports.RenewalRequest = RenewalRequest = __decorate([
    (0, typeorm_1.Entity)('renewal_requests')
], RenewalRequest);
let QueueTicket = class QueueTicket {
    id;
    userId;
    unitId;
    status;
    priority;
    createdAt;
};
exports.QueueTicket = QueueTicket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QueueTicket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], QueueTicket.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], QueueTicket.prototype, "unitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'waiting' }),
    __metadata("design:type", String)
], QueueTicket.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QueueTicket.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QueueTicket.prototype, "createdAt", void 0);
exports.QueueTicket = QueueTicket = __decorate([
    (0, typeorm_1.Entity)('queue_tickets')
], QueueTicket);
let ClinicalRecord = class ClinicalRecord {
    id;
    userId;
    professionalId;
    title;
    description;
    createdAt;
};
exports.ClinicalRecord = ClinicalRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClinicalRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ClinicalRecord.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ClinicalRecord.prototype, "professionalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], ClinicalRecord.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ClinicalRecord.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ClinicalRecord.prototype, "createdAt", void 0);
exports.ClinicalRecord = ClinicalRecord = __decorate([
    (0, typeorm_1.Entity)('clinical_records')
], ClinicalRecord);

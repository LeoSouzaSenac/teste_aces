import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';
@Entity('users') export class User {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'varchar',length:120}) name!:string;
 @Index({unique:true}) @Column({type:'varchar',length:190}) email!:string;
 @Column({type:'varchar',name:'password_hash'}) passwordHash!:string;
 @Column({type:'varchar',nullable:true,length:30}) phone!:string;
 @Column({type:'varchar',length:12,default:'patient'}) role!:string;
 @CreateDateColumn() createdAt!:Date;
}
@Entity('units') export class Unit {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'varchar'}) name!:string;
 @Column({type:'varchar'}) address!:string;
 @Column({type:'varchar',nullable:true}) neighborhood!:string;
 @Column({type:'varchar',nullable:true}) hours!:string;
 @Column({type:'decimal',precision:10,scale:7,nullable:true}) latitude!:number;
 @Column({type:'decimal',precision:10,scale:7,nullable:true}) longitude!:number;
}
@Entity('professionals') export class Professional {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'varchar'}) name!:string;
 @Column({type:'varchar'}) specialty!:string;
 @Column({type:'int'}) unitId!:number;
 @Column({type:'text',nullable:true}) bio!:string;
}
@Entity('appointments') @Index(['professionalId','startsAt'],{unique:true}) export class Appointment {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'int'}) userId!:number;
 @Column({type:'int'}) professionalId!:number;
 @Column({type:'int'}) unitId!:number;
 @Column({type:'datetime'}) startsAt!:Date;
 @Column({type:'varchar',length:15,default:'scheduled'}) status!:string;
 @CreateDateColumn() createdAt!:Date;
}
@Entity('reviews') @Index(['userId','appointmentId'],{unique:true}) export class Review {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'int'}) userId!:number;
 @Column({type:'int'}) appointmentId!:number;
 @Column({type:'int'}) professionalId!:number;
 @Column({type:'int'}) rating!:number;
 @Column({type:'text',nullable:true}) comment!:string;
 @CreateDateColumn() createdAt!:Date;
}
@Entity('medical_notes') export class MedicalNote {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'int'}) userId!:number;
 @Column({type:'varchar'}) title!:string;
 @Column({type:'text'}) description!:string;
 @CreateDateColumn() createdAt!:Date;
}
@Entity('renewal_requests') export class RenewalRequest {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'int'}) userId!:number;
 @Column({type:'varchar'}) medication!:string;
 @Column({type:'text',nullable:true}) note!:string;
 @Column({type:'varchar',default:'received'}) status!:string;
 @CreateDateColumn() createdAt!:Date;
}

@Entity('queue_tickets') export class QueueTicket {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'int'}) userId!:number;
 @Column({type:'int'}) unitId!:number;
 @Column({type:'varchar',length:20,default:'waiting'}) status!:string;
 @Column({type:'int',default:0}) priority!:number;
 @CreateDateColumn() createdAt!:Date;
}
@Entity('clinical_records') export class ClinicalRecord {
 @PrimaryGeneratedColumn() id!:number;
 @Column({type:'int'}) userId!:number;
 @Column({type:'int'}) professionalId!:number;
 @Column({type:'varchar'}) title!:string;
 @Column({type:'text'}) description!:string;
 @CreateDateColumn() createdAt!:Date;
}

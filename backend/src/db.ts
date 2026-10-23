import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import {User,Unit,Professional,Appointment,Review,MedicalNote,RenewalRequest,QueueTicket,ClinicalRecord} from './entities';
const ca = process.env.DB_CA_BASE64 ? Buffer.from(process.env.DB_CA_BASE64,'base64').toString('utf8') : undefined;
export const db = new DataSource({type:'mysql',host:process.env.DB_HOST||'localhost',port:Number(process.env.DB_PORT||3306),username:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'aces',entities:[User,Unit,Professional,Appointment,Review,MedicalNote,RenewalRequest,QueueTicket,ClinicalRecord],synchronize:process.env.NODE_ENV!=='production'&&process.env.DB_SYNCHRONIZE==='true',ssl:ca?{ca,rejectUnauthorized:true}:process.env.NODE_ENV==='production'?{rejectUnauthorized:true}:undefined,timezone:'Z'});

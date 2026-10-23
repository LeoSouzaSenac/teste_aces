"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const entities_1 = require("./entities");
const units = [{ name: 'UBS Scharlau', address: 'São Leopoldo, RS', neighborhood: 'Scharlau', hours: 'Seg a sex, 8h às 17h' }, { name: 'UBS Centro', address: 'São Leopoldo, RS', neighborhood: 'Centro', hours: 'Seg a sex, 8h às 17h' }, { name: 'UBS Feitoria', address: 'São Leopoldo, RS', neighborhood: 'Feitoria', hours: 'Seg a sex, 8h às 17h' }];
const profs = [['Dra. Morgana', 'Pediatria', 0], ['Dr. Carlos', 'Pediatria', 0], ['Dra. Joana', 'Pediatria', 0], ['Dr. Roberto', 'Clínico geral', 1], ['Dra. Helena', 'Ortopedia', 1], ['Dr. Marcos', 'Radiologia', 2]];
async function main() { await db_1.db.initialize(); const ur = db_1.db.getRepository(entities_1.Unit), pr = db_1.db.getRepository(entities_1.Professional); const saved = await ur.count() ? await ur.find() : await ur.save(units.map(u => ur.create(u))); if (!(await pr.count()))
    await pr.save(profs.map(([name, specialty, idx]) => pr.create({ name, specialty, unitId: saved[idx].id, bio: 'Profissional fictício do ACES.' }))); const users = db_1.db.getRepository(entities_1.User); for (const [name, email, role] of [['Paciente Demonstração', 'paciente@aces.demo', 'patient'], ['Equipe ACES', 'equipe@aces.demo', 'staff'], ['Admin ACES', 'admin@aces.demo', 'admin']]) {
    if (!await users.findOneBy({ email }))
        await users.save({ name, email, role, passwordHash: await bcryptjs_1.default.hash('Demo12345!', 10) });
} console.log('Unidades e profissionais DEMONSTRATIVOS cadastrados'); await db_1.db.destroy(); }
main().catch(e => { console.error(e); process.exit(1); });

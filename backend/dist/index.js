"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const db_1 = require("./db");
const entities_1 = require("./entities");
const app = (0, express_1.default)(), secret = process.env.JWT_SECRET || '';
if (secret.length < 32)
    throw Error('Defina JWT_SECRET com pelo menos 32 caracteres');
app.disable('x-powered-by');
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim()) }));
app.use(express_1.default.json({ limit: '64kb' }));
app.use('/api', (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, limit: 180, standardHeaders: 'draft-7', legacyHeaders: false }));
const asyncRoute = (fn) => (r, s, n) => Promise.resolve(fn(r, s)).catch(n);
const auth = (r, s, n) => { try {
    const token = (r.headers.authorization || '').replace(/^Bearer /, '');
    r.userId = Number(jsonwebtoken_1.default.verify(token, secret).sub);
    if (!r.userId)
        throw Error();
    n();
}
catch {
    s.status(401).json({ error: 'Faça login para continuar.' });
} };
const staff = async (r, s, n) => { const u = await db_1.db.getRepository(entities_1.User).findOneBy({ id: r.userId }); if (!u || !['staff', 'admin'].includes(u.role))
    return s.status(403).json({ error: 'Acesso da equipe necessário.' }); n(); };
const parse = (schema, body) => schema.parse(body);
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role });
app.get('/api/health', (_r, s) => s.json({ ok: true }));
app.post('/api/auth/register', asyncRoute(async (r, s) => { const data = parse(zod_1.z.object({ name: zod_1.z.string().trim().min(2).max(120), email: zod_1.z.string().trim().email().max(190), password: zod_1.z.string().min(8).max(100), phone: zod_1.z.string().max(30).optional() }), r.body); const repo = db_1.db.getRepository(entities_1.User); const email = data.email.toLowerCase(); if (await repo.findOneBy({ email }))
    return s.status(409).json({ error: 'E-mail já cadastrado.' }); const u = await repo.save(repo.create({ name: data.name, email, passwordHash: await bcryptjs_1.default.hash(data.password, 12), phone: data.phone || '' })); return s.status(201).json({ token: jsonwebtoken_1.default.sign({}, secret, { subject: String(u.id), expiresIn: '12h' }), user: publicUser(u) }); }));
app.post('/api/auth/login', asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string() }), r.body); const u = await db_1.db.getRepository(entities_1.User).findOneBy({ email: d.email.toLowerCase() }); if (!u || !await bcryptjs_1.default.compare(d.password, u.passwordHash))
    return s.status(401).json({ error: 'E-mail ou senha incorretos.' }); return s.json({ token: jsonwebtoken_1.default.sign({}, secret, { subject: String(u.id), expiresIn: '12h' }), user: publicUser(u) }); }));
app.get('/api/me', auth, asyncRoute(async (r, s) => { const u = await db_1.db.getRepository(entities_1.User).findOneByOrFail({ id: r.userId }); s.json(publicUser(u)); }));
app.patch('/api/me', auth, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ name: zod_1.z.string().trim().min(2).max(120), phone: zod_1.z.string().max(30).optional() }), r.body); await db_1.db.getRepository(entities_1.User).update({ id: r.userId }, { name: d.name, phone: d.phone || '' }); s.json({ ok: true }); }));
app.get('/api/units', asyncRoute(async (_r, s) => s.json(await db_1.db.getRepository(entities_1.Unit).find({ order: { name: 'ASC' } }))));
app.get('/api/professionals', asyncRoute(async (r, s) => { const unitId = Number(r.query.unitId || 0); const professionals = await db_1.db.getRepository(entities_1.Professional).find({ where: unitId ? { unitId } : {}, order: { name: 'ASC' } }); s.json(professionals); }));
const slots = ['09:00', '10:00', '11:00', '14:00', '14:30', '15:00', '16:00'];
const dateTime = (date, time) => new Date(`${date}T${time}:00.000Z`);
app.get('/api/availability', asyncRoute(async (r, s) => { const id = Number(r.query.professionalId), date = String(r.query.date || ''); if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return s.status(400).json({ error: 'Informe profissional e data.' }); if (!await db_1.db.getRepository(entities_1.Professional).findOneBy({ id }))
    return s.status(404).json({ error: 'Profissional não encontrado.' }); const tomorrow = new Date(); tomorrow.setUTCHours(0, 0, 0, 0); const start = new Date(date + 'T00:00:00Z'); if (start < tomorrow || start > new Date(Date.now() + 90 * 86400000) || [0, 6].includes(start.getUTCDay()))
    return s.json([]); const ap = await db_1.db.getRepository(entities_1.Appointment).findBy({ professionalId: id }); const occupied = new Set(ap.filter(a => a.status === 'scheduled' && a.startsAt.toISOString().slice(0, 10) === date).map(a => a.startsAt.toISOString().slice(11, 16))); s.json(slots.filter(t => !occupied.has(t))); }));
app.get('/api/appointments', auth, asyncRoute(async (r, s) => { const data = await db_1.db.getRepository(entities_1.Appointment).find({ where: { userId: r.userId }, order: { startsAt: 'DESC' } }); s.json(data); }));
app.post('/api/appointments', auth, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ professionalId: zod_1.z.number().int().positive(), date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: zod_1.z.string() }), r.body); const p = await db_1.db.getRepository(entities_1.Professional).findOneBy({ id: d.professionalId }); if (!p)
    return s.status(404).json({ error: 'Profissional não encontrado.' }); const when = dateTime(d.date, d.time), dt = new Date(d.date + 'T00:00:00Z'); if (!slots.includes(d.time) || !Number.isFinite(when.getTime()) || when.getTime() < Date.now() || when.getTime() > Date.now() + 90 * 86400000 || [0, 6].includes(dt.getUTCDay()))
    return s.status(400).json({ error: 'Data ou horário indisponível.' }); const existing = await db_1.db.getRepository(entities_1.Appointment).findOneBy({ professionalId: p.id, startsAt: when, status: 'scheduled' }); if (existing)
    return s.status(409).json({ error: 'Horário já reservado. Selecione outro.' }); const a = await db_1.db.getRepository(entities_1.Appointment).save({ userId: r.userId, professionalId: p.id, unitId: p.unitId, startsAt: when, status: 'scheduled' }); return s.status(201).json(a); }));
app.patch('/api/appointments/:id/cancel', auth, asyncRoute(async (r, s) => { const repo = db_1.db.getRepository(entities_1.Appointment), a = await repo.findOneBy({ id: Number(r.params.id), userId: r.userId }); if (!a)
    return s.status(404).json({ error: 'Consulta não encontrada.' }); if (a.status !== 'scheduled')
    return s.status(409).json({ error: 'Consulta não pode ser cancelada.' }); await repo.update(a.id, { status: 'cancelled' }); s.json({ ok: true }); }));
app.post('/api/appointments/:id/reschedule', auth, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: zod_1.z.string() }), r.body); const repo = db_1.db.getRepository(entities_1.Appointment), a = await repo.findOneBy({ id: Number(r.params.id), userId: r.userId }); if (!a || a.status !== 'scheduled')
    return s.status(404).json({ error: 'Consulta ativa não encontrada.' }); const when = dateTime(d.date, d.time), dt = new Date(d.date + 'T00:00:00Z'); if (!slots.includes(d.time) || when.getTime() < Date.now() || when.getTime() > Date.now() + 90 * 86400000 || [0, 6].includes(dt.getUTCDay()))
    return s.status(400).json({ error: 'Horário indisponível.' }); if ((await repo.findOneBy({ professionalId: a.professionalId, startsAt: when, status: 'scheduled' }))?.id !== undefined && (await repo.findOneBy({ professionalId: a.professionalId, startsAt: when, status: 'scheduled' }))?.id !== a.id)
    return s.status(409).json({ error: 'Horário ocupado.' }); await repo.update(a.id, { startsAt: when }); s.json({ ok: true }); }));
app.get('/api/reviews', auth, asyncRoute(async (r, s) => s.json(await db_1.db.getRepository(entities_1.Review).find({ where: { userId: r.userId }, order: { createdAt: 'DESC' } }))));
app.post('/api/reviews', auth, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ appointmentId: zod_1.z.number().int().positive(), rating: zod_1.z.number().int().min(1).max(5), comment: zod_1.z.string().max(800).optional() }), r.body); const a = await db_1.db.getRepository(entities_1.Appointment).findOneBy({ id: d.appointmentId, userId: r.userId }); if (!a || a.status !== 'completed')
    return s.status(400).json({ error: 'Apenas consultas concluídas podem ser avaliadas.' }); if (await db_1.db.getRepository(entities_1.Review).findOneBy({ appointmentId: a.id, userId: r.userId }))
    return s.status(409).json({ error: 'Consulta já avaliada.' }); const review = await db_1.db.getRepository(entities_1.Review).save({ userId: r.userId, appointmentId: a.id, professionalId: a.professionalId, rating: d.rating, comment: d.comment || '' }); s.status(201).json(review); }));
app.get('/api/medical-notes', auth, asyncRoute(async (r, s) => s.json(await db_1.db.getRepository(entities_1.MedicalNote).find({ where: { userId: r.userId }, order: { createdAt: 'DESC' } }))));
app.post('/api/medical-notes', auth, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ title: zod_1.z.string().trim().min(2).max(150), description: zod_1.z.string().trim().min(2).max(4000) }), r.body); s.status(201).json(await db_1.db.getRepository(entities_1.MedicalNote).save({ userId: r.userId, ...d })); }));
app.delete('/api/medical-notes/:id', auth, asyncRoute(async (r, s) => { await db_1.db.getRepository(entities_1.MedicalNote).delete({ id: Number(r.params.id), userId: r.userId }); s.json({ ok: true }); }));
app.get('/api/renewals', auth, asyncRoute(async (r, s) => s.json(await db_1.db.getRepository(entities_1.RenewalRequest).find({ where: { userId: r.userId }, order: { createdAt: 'DESC' } }))));
app.post('/api/renewals', auth, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ medication: zod_1.z.string().trim().min(2).max(150), note: zod_1.z.string().max(1000).optional() }), r.body); s.status(201).json(await db_1.db.getRepository(entities_1.RenewalRequest).save({ userId: r.userId, medication: d.medication, note: d.note || '', status: 'received' })); }));
// Fila do ACES: criada e gerida dentro do sistema de demonstração.
app.get('/api/queues', asyncRoute(async (r, s) => { const id = Number(r.query.unitId || 0); const rows = await db_1.db.getRepository(entities_1.QueueTicket).find({ where: id ? { unitId: id } : {}, order: { createdAt: 'ASC' } }); const units = await db_1.db.getRepository(entities_1.Unit).find(); s.json(units.map(u => { const tickets = rows.filter(t => t.unitId === u.id); return { unitId: u.id, waiting: tickets.filter(t => t.status === 'waiting').length, inService: tickets.filter(t => t.status === 'serving').length, estimatedMinutes: tickets.filter(t => t.status === 'waiting').length * 15 }; })); }));
app.get('/api/queue/my', auth, asyncRoute(async (r, s) => s.json(await db_1.db.getRepository(entities_1.QueueTicket).find({ where: { userId: r.userId }, order: { createdAt: 'DESC' } }))));
app.post('/api/queue/join', auth, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ unitId: zod_1.z.number().int().positive() }), r.body); if (!await db_1.db.getRepository(entities_1.Unit).findOneBy({ id: d.unitId }))
    return s.status(404).json({ error: 'Unidade não encontrada.' }); const repo = db_1.db.getRepository(entities_1.QueueTicket), tickets = await repo.findBy({ userId: r.userId, unitId: d.unitId }); if (tickets.some(t => ['waiting', 'serving'].includes(t.status)))
    return s.status(409).json({ error: 'Você já está nesta fila.' }); s.status(201).json(await repo.save({ userId: r.userId, unitId: d.unitId, status: 'waiting' })); }));
app.get('/api/staff/patients', auth, staff, asyncRoute(async (_r, s) => s.json((await db_1.db.getRepository(entities_1.User).find({ order: { name: 'ASC' } })).filter(u => u.role === 'patient').map(publicUser))));
app.get('/api/staff/queue', auth, staff, asyncRoute(async (_r, s) => s.json(await db_1.db.getRepository(entities_1.QueueTicket).find({ order: { createdAt: 'ASC' } }))));
app.patch('/api/staff/queue/:id', auth, staff, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ status: zod_1.z.enum(['waiting', 'serving', 'completed', 'cancelled']) }), r.body); const repo = db_1.db.getRepository(entities_1.QueueTicket); if (!(await repo.findOneBy({ id: Number(r.params.id) })))
    return s.status(404).json({ error: 'Senha não encontrada.' }); await repo.update(Number(r.params.id), d); s.json({ ok: true }); }));
app.get('/api/records', auth, asyncRoute(async (r, s) => s.json(await db_1.db.getRepository(entities_1.ClinicalRecord).find({ where: { userId: r.userId }, order: { createdAt: 'DESC' } }))));
app.get('/api/staff/records/:userId', auth, staff, asyncRoute(async (r, s) => s.json(await db_1.db.getRepository(entities_1.ClinicalRecord).find({ where: { userId: Number(r.params.userId) }, order: { createdAt: 'DESC' } }))));
app.post('/api/staff/records', auth, staff, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ userId: zod_1.z.number().int().positive(), professionalId: zod_1.z.number().int().positive(), title: zod_1.z.string().min(2), description: zod_1.z.string().min(2) }), r.body); if (!await db_1.db.getRepository(entities_1.User).findOneBy({ id: d.userId }))
    return s.status(404).json({ error: 'Paciente não encontrado.' }); s.status(201).json(await db_1.db.getRepository(entities_1.ClinicalRecord).save(d)); }));
app.get('/api/staff/renewals', auth, staff, asyncRoute(async (_r, s) => s.json(await db_1.db.getRepository(entities_1.RenewalRequest).find({ order: { createdAt: 'DESC' } }))));
app.patch('/api/staff/renewals/:id', auth, staff, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ status: zod_1.z.enum(['received', 'approved_demo', 'rejected']) }), r.body); await db_1.db.getRepository(entities_1.RenewalRequest).update(Number(r.params.id), d); s.json({ ok: true }); }));
app.get('/api/staff/appointments', auth, staff, asyncRoute(async (_r, s) => s.json(await db_1.db.getRepository(entities_1.Appointment).find({ order: { startsAt: 'DESC' } }))));
app.patch('/api/staff/appointments/:id', auth, staff, asyncRoute(async (r, s) => { const d = parse(zod_1.z.object({ status: zod_1.z.enum(['scheduled', 'completed', 'cancelled']) }), r.body); await db_1.db.getRepository(entities_1.Appointment).update(Number(r.params.id), d); s.json({ ok: true }); }));
app.use((err, _r, s, _n) => { if (err instanceof zod_1.z.ZodError)
    return s.status(400).json({ error: 'Verifique os campos informados.' }); if (err?.code === 'ER_DUP_ENTRY')
    return s.status(409).json({ error: 'Esse registro já existe ou o horário está reservado.' }); console.error(err); s.status(500).json({ error: 'Não foi possível concluir a operação.' }); });
const port = Number(process.env.PORT || 3000);
db_1.db.initialize().then(() => app.listen(port, '0.0.0.0', () => console.log('ACES API na porta', port))).catch(e => { console.error('Falha na conexão com o banco:', e); process.exit(1); });

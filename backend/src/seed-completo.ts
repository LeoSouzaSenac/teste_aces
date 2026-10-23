import 'reflect-metadata';
import { db } from './db';
import bcrypt from 'bcryptjs';
import { User, Unit, Professional, Appointment, Review, QueueTicket, ClinicalRecord, MedicalNote, RenewalRequest } from './entities';

// Todos os registros abaixo são fictícios, exclusivos para demonstração.
// Pode rodar novamente: procura os registros antes de cadastrar.
const demoPassword = 'Demo12345!';
const unitData = [
  ['UBS Scharlau','Scharlau, São Leopoldo - RS','Scharlau'],
  ['UBS Centro','Centro, São Leopoldo - RS','Centro'],
  ['UBS Feitoria','Feitoria, São Leopoldo - RS','Feitoria'],
  ['UBS Campina','Campina, São Leopoldo - RS','Campina'],
  ['UBS Rio dos Sinos','Rio dos Sinos, São Leopoldo - RS','Rio dos Sinos'],
  ['UBS Santo Afonso','Santo Afonso, Novo Hamburgo - RS','Santo Afonso'],
  ['UBS Canudos','Canudos, Novo Hamburgo - RS','Canudos'],
  ['UPA Centro - Demonstração','Centro, São Leopoldo - RS','Centro'],
] as const;
const professionalData = [
  ['Dra. Morgana','Pediatria','UBS Scharlau'],
  ['Dr. Carlos','Pediatria','UBS Scharlau'],
  ['Dra. Joana','Pediatria','UBS Scharlau'],
  ['Dr. Roberto','Clínico geral','UBS Centro'],
  ['Dra. Helena','Ortopedia','UBS Centro'],
  ['Dr. Marcos','Radiologia','UBS Feitoria'],
  ['Dr. Maurício Spindola','Pediatria','UBS Campina'],
  ['Dr. Arthur Almeida','Clínico geral','UBS Campina'],
  ['Dra. Paula Nunes','Clínico geral','UBS Rio dos Sinos'],
  ['Dra. Fernanda Ramos','Ginecologia','UBS Rio dos Sinos'],
  ['Dr. Roberto Arpini','Odontologia','UBS Santo Afonso'],
  ['Dra. Bianca Souza','Odontologia','UBS Canudos'],
  ['Dr. Gustavo Lima','Ortopedia','UBS Canudos'],
  ['Dra. Letícia Martins','Dermatologia','UBS Feitoria'],
  ['Dr. Henrique Melo','Cardiologia','UBS Centro'],
  ['Dra. Alice Oliveira','Enfermagem','UPA Centro - Demonstração'],
  ['Dr. Pedro Ribeiro','Clínico geral','UPA Centro - Demonstração'],
  ['Dra. Renata Costa','Pediatria','UBS Feitoria'],
] as const;
const patientsData = [
  ['Paciente Demonstração','paciente@aces.demo'],
  ['Mariana Costa','mariana@aces.demo'],['Lucas Ferreira','lucas@aces.demo'],
  ['Beatriz Oliveira','beatriz@aces.demo'],['Gabriel Martins','gabriel@aces.demo'],
  ['Camila Rodrigues','camila@aces.demo'],['Rafael Almeida','rafael@aces.demo'],
  ['Julia Santos','julia@aces.demo'],['Pedro Carvalho','pedro@aces.demo'],
  ['Ana Luiza Ribeiro','ana@aces.demo'],['Bruno Pereira','bruno@aces.demo'],
  ['Carolina Nascimento','carolina@aces.demo'],['Daniel Silva','daniel@aces.demo'],
  ['Eduarda Lima','eduarda@aces.demo'],['Felipe Souza','felipe@aces.demo'],
  ['Giovana Martins','giovana@aces.demo'],['Henrique Dias','henrique@aces.demo'],
  ['Isabela Fernandes','isabela@aces.demo'],['João Pedro Oliveira','joao@aces.demo'],
  ['Larissa Almeida','larissa@aces.demo'],['Matheus Vieira','matheus@aces.demo'],
  ['Natália Costa','natalia@aces.demo'],['Otávio Rocha','otavio@aces.demo'],
  ['Patrícia Gomes','patricia@aces.demo'],['Ricardo Martins','ricardo@aces.demo'],
  ['Sofia Cardoso','sofia@aces.demo'],['Vinícius Ferreira','vinicius@aces.demo'],
] as const;
function businessDate(offset: number, hour: number, minute=0): Date {
  // Datas locais do servidor. Evita fins de semana.
  const d=new Date(); d.setHours(hour,minute,0,0); d.setDate(d.getDate()+offset);
  while(d.getDay()===0 || d.getDay()===6) d.setDate(d.getDate()+(offset<0?-1:1));
  return d;
}
async function main() {
  await db.initialize();
  try {
    const ur=db.getRepository(Unit),pr=db.getRepository(Professional),users=db.getRepository(User);
    const ar=db.getRepository(Appointment),rr=db.getRepository(Review),qr=db.getRepository(QueueTicket);
    const cr=db.getRepository(ClinicalRecord),nr=db.getRepository(MedicalNote),renew=db.getRepository(RenewalRequest);
    let created={unidades:0,profissionais:0,usuarios:0,consultas:0,avaliacoes:0,filas:0,prontuarios:0,anotacoes:0,receitas:0};
    const units=new Map<string,Unit>();
    for(const [name,address,neighborhood] of unitData) {
      let item=await ur.findOneBy({name});
      if(!item) {item=await ur.save(ur.create({name,address,neighborhood,hours:'Segunda a sexta, 8h às 17h'}));created.unidades++;}
      units.set(name,item);
    }
    const professionals: Professional[]=[];
    for(const [name,specialty,unitName] of professionalData) {
      let p=await pr.findOneBy({name});
      if(!p) {p=await pr.save(pr.create({name,specialty,unitId:units.get(unitName)!.id,bio:`Profissional fictício de ${specialty}, disponível apenas para demonstração do ACES.`}));created.profissionais++;}
      professionals.push(p);
    }
    const hash=await bcrypt.hash(demoPassword,10);
    const patients:User[]=[];
    for(const [name,email] of patientsData) {
      let u=await users.findOneBy({email});
      if(!u) {u=await users.save(users.create({name,email,role:'patient',passwordHash:hash}));created.usuarios++;}
      patients.push(u);
    }
    for(const [name,email,role] of [['Equipe ACES','equipe@aces.demo','staff'],['Admin ACES','admin@aces.demo','admin']] as const) {
      if(!(await users.findOneBy({email}))) {await users.save(users.create({name,email,role,passwordHash:hash}));created.usuarios++;}
    }
    // Uma vaga por profissional e horário: respeita índice único em appointments.
    // Reserva passado, presente e futuro com status do aplicativo.
    const past:Appointment[]=[];
    for(let i=0;i<patients.length;i++) {
      const patient=patients[i];
      for(let j=0;j<4;j++) {
        const prof=professionals[(i+j*5)%professionals.length];
        // índices com dias e horários distintos por profissional.
        const start=businessDate(-10-i*4-j,[9,10,11,14][j%4],0);
        const status= j===3 && i%3===0?'cancelled':'completed';
        let a=await ar.findOneBy({professionalId:prof.id,startsAt:start});
        if(!a) {a=await ar.save(ar.create({userId:patient.id,professionalId:prof.id,unitId:prof.unitId,startsAt:start,status}));created.consultas++;}
        if(a.userId===patient.id && a.status==='completed') past.push(a);
      }
      for(let j=0;j<3;j++) {
        const prof=professionals[(i*2+j*7)%professionals.length];
        const start=businessDate(2+i*3+j,[9,10,11,14,15,16,14][j%7],0);
        if(!(await ar.findOneBy({professionalId:prof.id,startsAt:start}))) {
          await ar.save(ar.create({userId:patient.id,professionalId:prof.id,unitId:prof.unitId,startsAt:start,status:'scheduled'}));created.consultas++;
        }
      }
    }
    const comments=['Atendimento excelente, muito atencioso.','Profissional explicou tudo com clareza.','Fui atendido no horário previsto.','Equipe acolhedora e organizada.','Atendimento bom, mas houve um pouco de espera.','Consulta objetiva e esclarecedora.'];
    for(let i=0;i<past.length;i++) {
      const a=past[i];
      if(!(await rr.findOneBy({userId:a.userId,appointmentId:a.id}))) {
        await rr.save(rr.create({userId:a.userId,appointmentId:a.id,professionalId:a.professionalId,rating:[5,4,5,4,3,5][i%6],comment:comments[i%6]}));created.avaliacoes++;
      }
    }
    const unitList=Array.from(units.values());
    for(let i=0;i<patients.length;i++) {
      const u=patients[i],unit=unitList[i%unitList.length];
      const tickets=await qr.findBy({userId:u.id,unitId:unit.id});
      if(!tickets.some(t=>t.status==='waiting'||t.status==='serving')) {
        await qr.save(qr.create({userId:u.id,unitId:unit.id,status:i%7===0?'serving':'waiting',priority:i%5===0?1:0}));created.filas++;
      }
      const prof=professionals[i%professionals.length];
      const title='Atendimento de demonstração ACES';
      if(!(await cr.findOneBy({userId:u.id,professionalId:prof.id,title}))) {
        await cr.save(cr.create({userId:u.id,professionalId:prof.id,title,description:`Registro clínico inteiramente fictício do paciente ${u.name}, criado para demonstrar o módulo de prontuário. Nenhuma orientação ou diagnóstico real.`}));created.prontuarios++;
      }
      for(const [title,description] of [['Informações gerais','Informação pessoal fictícia para demonstrar o histórico.'],['Acompanhamento','Anotação de demonstração sobre uma consulta anterior.']] as const) {
        if(!(await nr.findOneBy({userId:u.id,title}))) {await nr.save(nr.create({userId:u.id,title,description}));created.anotacoes++;}
      }
      const med=['Medicamento fictício A','Medicamento fictício B','Medicamento fictício C'][i%3];
      if(!(await renew.findOneBy({userId:u.id,medication:med}))) {
        await renew.save(renew.create({userId:u.id,medication:med,note:'Pedido fictício para demonstração, sem validade médica.',status:['received','approved_demo','rejected'][i%3]}));created.receitas++;
      }
    }
    console.log('\nACES: seed completo finalizado. Novos registros:',created);
    console.log('Dados totais por tabela:');
    for(const [n,repo] of Object.entries({users,units:ur,professionals:pr,appointments:ar,reviews:rr,queue_tickets:qr,clinical_records:cr,medical_notes:nr,renewal_requests:renew})) {
      console.log(`  ${n}: ${await repo.count()}`);
    }
    console.log(`\nLogin: paciente@aces.demo / ${demoPassword}`);
    console.log(`Equipe: equipe@aces.demo / ${demoPassword}`);
    console.log(`Admin: admin@aces.demo / ${demoPassword}`);
    console.log('Observação: senhas de contas preexistentes não são alteradas.');
  } finally {await db.destroy();}
}
main().catch(err=>{console.error('Erro no seed:',err);process.exit(1)});

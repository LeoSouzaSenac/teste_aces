import { db } from './db';
import bcrypt from 'bcryptjs';
import { User, Unit, Professional, Appointment, Review, QueueTicket, ClinicalRecord, MedicalNote, RenewalRequest } from './entities';

// Dados inteiramente fictícios. Use somente para demonstrações.
const patients = [
  ['Mariana Costa','mariana@aces.demo'],
  ['Lucas Ferreira','lucas@aces.demo'],
  ['Beatriz Oliveira','beatriz@aces.demo'],
  ['Gabriel Martins','gabriel@aces.demo'],
  ['Camila Rodrigues','camila@aces.demo'],
  ['Rafael Almeida','rafael@aces.demo'],
  ['Julia Santos','julia@aces.demo'],
  ['Pedro Carvalho','pedro@aces.demo'],
] as const;
const password = 'Demo12345!';
const weekdayAt = (offset: number, hour: number): Date => {
  const d = new Date(); d.setUTCHours(hour,0,0,0); d.setUTCDate(d.getUTCDate()+offset);
  while([0,6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate()+(offset < 0 ? -1 : 1));
  return d;
};
async function main(){
  await db.initialize();
  try {
    const users = db.getRepository(User);
    const units = db.getRepository(Unit);
    const pros = db.getRepository(Professional);
    const appointments = db.getRepository(Appointment);
    const reviews = db.getRepository(Review);
    const queue = db.getRepository(QueueTicket);
    const clinical = db.getRepository(ClinicalRecord);
    const notes = db.getRepository(MedicalNote);
    const renewals = db.getRepository(RenewalRequest);
    const allUnits = await units.find({order:{id:'ASC'}});
    const allPros = await pros.find({order:{id:'ASC'}});
    if(!allUnits.length || !allPros.length) throw new Error('Primeiro execute npm run seed para criar unidades e profissionais.');
    const hash=await bcrypt.hash(password,10);
    const savedPatients:User[]=[];
    for (const [name,email] of patients){
      let user=await users.findOneBy({email});
      if(!user) user=await users.save(users.create({name,email,role:'patient',passwordHash:hash}));
      savedPatients.push(user);
    }
    const mainPatient=await users.findOneBy({email:'paciente@aces.demo'});
    if(mainPatient) savedPatients.unshift(mainPatient);
    const ensureAppointment=async(user:User,professional:Professional,startsAt:Date,status:string)=>{
      // O índice unique(professionalId, startsAt) impede dupla reserva.
      let a=await appointments.findOneBy({professionalId:professional.id,startsAt});
      if(!a) a=await appointments.save(appointments.create({userId:user.id,professionalId:professional.id,unitId:professional.unitId,startsAt,status}));
      return a.userId===user.id ? a : undefined;
    };
    // Consultas concluídas: distintas, para alimentar histórico e avaliações.
    for(let i=0;i<Math.min(6,savedPatients.length);i++){
      const patient=savedPatients[i],p=allPros[i%allPros.length];
      const ap=await ensureAppointment(patient,p,weekdayAt(-5-i,10+(i%3)),'completed');
      if(ap && ap.status==='completed' && !(await reviews.findOneBy({userId:patient.id,appointmentId:ap.id}))) {
        await reviews.save(reviews.create({userId:patient.id,appointmentId:ap.id,professionalId:p.id,rating:[5,4,5,3,4,5][i],comment:[
          'Atendimento muito atencioso.','Explicações claras durante a consulta.',
          'Fui bem atendida.','O atendimento poderia ser mais pontual.',
          'Profissional prestativo.','Equipe muito organizada.'
        ][i]}));
      }
    }
    // Consultas futuras em horários válidos do MVP, distribuídas entre profissionais.
    for(let i=0;i<Math.min(8,savedPatients.length);i++){
      await ensureAppointment(savedPatients[i],allPros[i%allPros.length],weekdayAt(2+i,9+(i%4)),'scheduled');
    }
    // Uma consulta cancelada para exibir histórico de status.
    if(savedPatients[1]) await ensureAppointment(savedPatients[1],allPros[0],weekdayAt(-12,11),'cancelled');
    // Uma ficha de fila ativa por paciente/unidade, sem repetir.
    for(let i=0;i<Math.min(savedPatients.length,7);i++){
      const patient=savedPatients[i], unit=allUnits[i%allUnits.length];
      const existing=await queue.findBy({userId:patient.id,unitId:unit.id});
      if(!existing.some(t=>['waiting','serving'].includes(t.status)))
        await queue.save(queue.create({userId:patient.id,unitId:unit.id,status:i===0?'serving':'waiting',priority:i===2?1:0}));
    }
    const records=[
      ['Consulta de acompanhamento','Registro fictício: paciente relatou melhora dos sintomas. Orientado retorno conforme necessidade.'],
      ['Avaliação clínica','Registro fictício: sinais gerais observados e orientações preventivas fornecidas.'],
      ['Retorno ambulatorial','Registro fictício: acompanhamento realizado sem intercorrências relatadas.']
    ];
    for(let i=0;i<3;i++){
      const patient=savedPatients[i],p=allPros[i%allPros.length], [title,description]=records[i];
      if(!(await clinical.findOneBy({userId:patient.id,professionalId:p.id,title})))
        await clinical.save(clinical.create({userId:patient.id,professionalId:p.id,title,description}));
    }
    const medicalData=[
      ['Alergias informadas','Registro fictício para demonstrar o histórico pessoal do paciente.'],
      ['Observação pessoal','Desejo conversar sobre exames preventivos na próxima consulta.']
    ];
    if(mainPatient) for(const [title,description] of medicalData){
      if(!(await notes.findOneBy({userId:mainPatient.id,title})))
        await notes.save(notes.create({userId:mainPatient.id,title,description}));
    }
    const renewalData:[number,string,string,string][]=[
      [0,'Medicamento demonstrativo A','Solicitação fictícia para testar a análise da equipe.','received'],
      [1,'Medicamento demonstrativo B','Exemplo fictício de solicitação já analisada.','approved_demo'],
      [2,'Medicamento demonstrativo C','Exemplo fictício de solicitação recusada.','rejected'],
    ];
    for(const [idx,medication,note,status] of renewalData){
      const patient=savedPatients[idx];
      if(!(await renewals.findOneBy({userId:patient.id,medication})))
        await renewals.save(renewals.create({userId:patient.id,medication,note,status}));
    }
    console.log('Seed complementar concluído! 8 pacientes, consultas, avaliações, filas e registros de demonstração.');
    console.log(`Acesso de pacientes: mariana@aces.demo ... pedro@aces.demo | senha: ${password}`);
    console.log('Você também pode entrar com paciente@aces.demo após executar o seed básico.');
  }finally{ await db.destroy(); }
}
main().catch(e=>{console.error(e);process.exit(1)});

# ACES — MVP demonstrativo em PWA

Sistema inspirado no protótipo e artigo ACES. Frontend React + Vite (PWA), backend Node/Express + TypeORM, MySQL no Aiven, deploy do backend no Render e frontend na Vercel.

## Instalação local
1. Crie um banco MySQL vazio `aces` (ou use um serviço Aiven).
2. Em `backend`, copie `.env.example` para `.env`, preencha DB e JWT_SECRET (mínimo 32 caracteres).
3. Execute `npm install`, `npm run schema` e `npm run seed` na pasta `backend`.
4. Execute `npm run dev` na pasta `backend`.
5. Em outro terminal: pasta `frontend`, `npm install`, `npm run dev`.
6. Abra `http://localhost:5173`.

### Contas demonstrativas após seed
- `paciente@aces.demo` / `Demo12345!`
- `equipe@aces.demo` / `Demo12345!`
- `admin@aces.demo` / `Demo12345!`

Altere essas credenciais se publicar em ambiente acessível a terceiros; use **somente dados fictícios**.

## Publicação
### Aiven
Crie um serviço MySQL e um banco `aces`. Anote host, porta, usuário, senha e CA. Para TLS com certificado: `DB_CA_BASE64` recebe o conteúdo completo do CA em base64 (pode gerar no PowerShell com `[Convert]::ToBase64String([IO.File]::ReadAllBytes('ca.pem'))`).

### Render (Web Service)
- Repositório: este monorepo.
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Variáveis: `NODE_ENV=production`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_CA_BASE64`, `JWT_SECRET`, `CORS_ORIGIN=https://SEU-FRONT.vercel.app`.
- Execute **uma vez**, via Shell/Job no ambiente conectado ao MySQL: `npm run schema && npm run seed` (no Render sem shell disponível, rode esses comandos localmente com o `.env` do Aiven).
- Teste `https://SEU-BACKEND.onrender.com/api/health`.

### Vercel
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=https://SEU-BACKEND.onrender.com`
- Faça um novo deploy após editar a URL. Em seu celular, abra via HTTPS e utilize a opção **Adicionar à tela inicial**.

## Escopo implementado
Cadastro/login; agendamento e remarcação; listagem de profissionais e unidades; links de rotas; fila demonstrativa atualizada por consulta periódica a cada 12 segundos (não WebSocket); histórico de consultas; avaliações após conclusão; prontuário interno ACES; solicitação de renovação com aprovação/recusa **demonstrativa**; painel para equipe e administração. Os dados persistem no MySQL.

### Limites
Nenhuma conexão com bases do SUS; nenhuma receita com validade médica; nenhuma unidade ou profissional verificados. Estimativa de fila: 15 minutos por pessoa como aproximação ilustrativa. É um sistema educacional. Não insira dados médicos reais. O script `schema` chama `synchronize` para inicializar a demonstração: não execute esse método como estratégia de migração em sistemas reais.

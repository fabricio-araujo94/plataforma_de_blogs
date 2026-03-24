# TEU - Plataforma de Blogs

Uma plataforma completa de blogs construída com Next.js no frontend e Node.js/Express no backend, utilizando Prisma como ORM para PostgreSQL. Suporta criação de posts com editor rico, autenticação de usuários, sistema de comentários, likes, visualizações e gerenciamento de mídia.

## Funcionalidades

- **Autenticação e Autorização**: Sistema de login/registro com JWT, roles (Leitor, Autor, Admin)
- **Criação de Posts**: Editor de blocos rico com EditorJS para conteúdo dinâmico
- **Interações**: Sistema de likes, comentários aninhados e visualizações
- **Gerenciamento de Mídia**: Upload de imagens para AWS S3
- **Painel de Administração**: Controle de usuários, posts e conteúdo
- **Busca**: Funcionalidade de busca de posts
- **Responsivo**: Interface adaptável com TailwindCSS

## Tecnologias Utilizadas

### Backend
- **Node.js** com **Express**
- **TypeScript**
- **Prisma** (ORM para PostgreSQL)
- **JWT** para autenticação
- **AWS S3** para armazenamento de mídia
- **Zod** para validação
- **Vitest** para testes

### Frontend
- **Next.js** (React Framework)
- **TypeScript**
- **TailwindCSS** para estilização
- **EditorJS** para editor de conteúdo rico
- **Axios** para requisições HTTP

### Banco de Dados
- **PostgreSQL**

## Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL
- Conta AWS S3 (opcional, para upload de mídia)

## Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/plataforma_de_blogs.git
   cd plataforma_de_blogs
   ```

2. **Instale as dependências do backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Instale as dependências do frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure o banco de dados:**
   - Crie um banco PostgreSQL
   - Configure a variável `DATABASE_URL` no arquivo `.env` do backend

5. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env` no diretório backend
   - Configure as seguintes variáveis:
     - `DATABASE_URL`: URL do banco PostgreSQL
     - `JWT_SECRET`: Segredo para JWT
     - `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`: Credenciais AWS (se usar S3)
     - `S3_BUCKET_NAME`: Nome do bucket S3

6. **Execute as migrações do Prisma:**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

## Uso

1. **Inicie o backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Inicie o frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000 (ou conforme configurado)

## Scripts Disponíveis

### Backend
- `npm test`: Executa os testes com Vitest
- `npm run test:watch`: Executa os testes em modo watch
- `npm run test:coverage`: Executa os testes com cobertura

### Frontend
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila a aplicação para produção
- `npm start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

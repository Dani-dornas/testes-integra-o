# Documentação dos Testes de Integração

## Visão Geral

Este projeto implementa testes de integração completos para um sistema de cadastro de usuários e contatos, conforme especificado na Atividade 1 de Testes de Integração. Os testes validam operações de usuário (registro, login e logout) e operações CRUD completas para contatos.

## Estrutura dos Testes

### Arquivos Implementados

1. **tests/controllers/user.controller.test.ts** - Testes expandidos para operações de usuário
2. **tests/controllers/contact.controller.test.ts** - Testes completos para operações de contatos
3. **src/controllers/contact.controller.ts** - Controller para operações CRUD de contatos
4. **src/routes/contacts.routes.ts** - Rotas para endpoints de contatos
5. **src/configs/comandos.sql** - Schema atualizado com tabela de contatos

### Configuração do Ambiente

- **PostgreSQL**: Configurado localmente na porta 5432
- **Redis**: Configurado localmente na porta 6379
- **Jest**: Framework de testes com configuração para testes de integração
- **Supertest**: Para simulação de requisições HTTP

## Testes Implementados

### 1. Testes de Usuário (12 testes)

#### Registro de Usuário (4 testes)
- ✅ **Criar usuário válido com sucesso**: Valida criação de usuário com dados corretos
- ✅ **Impedir criação com username muito curto**: Testa validação de username mínimo (3 caracteres)
- ✅ **Impedir criação com password menor que 6 caracteres**: Testa validação de senha mínima
- ✅ **Impedir criação de usuário duplicado**: Valida constraint de unicidade do username

#### Login de Usuário (5 testes)
- ✅ **Login com credenciais válidas**: Retorna token JWT válido
- ✅ **Bloquear login com senha incorreta**: Retorna erro 401 para senha inválida
- ✅ **Bloquear login com usuário inexistente**: Retorna erro 401 para usuário não encontrado
- ✅ **Bloquear login com campos ausentes - username**: Valida campo obrigatório username
- ✅ **Bloquear login com campos ausentes - password**: Valida campo obrigatório password

#### Logout de Usuário (3 testes)
- ✅ **Logout de usuário autenticado**: Invalida token no Redis blacklist
- ✅ **Requisição com token deslogado rejeitada**: Middleware bloqueia tokens na blacklist
- ✅ **Bloquear logout sem token**: Retorna erro 401 quando token não fornecido

### 2. Testes de Contatos (18 testes)

#### Criação de Contato (5 testes)
- ✅ **Criar contato válido com sucesso**: Cria contato associado ao usuário autenticado
- ✅ **Impedir criação sem campo name**: Valida campo obrigatório name
- ✅ **Impedir criação sem campo phone**: Valida campo obrigatório phone
- ✅ **Impedir criação com name muito curto**: Valida tamanho mínimo de 2 caracteres
- ✅ **Impedir criação com telefone inválido**: Valida formato (XX) XXXXX-XXXX

#### Listagem de Contatos (4 testes)
- ✅ **Listar contatos do usuário autenticado**: Retorna apenas contatos do usuário logado
- ✅ **Formato correto da resposta**: Valida estrutura da resposta JSON
- ✅ **Lista vazia para usuário sem contatos**: Retorna array vazio quando apropriado
- ✅ **Impedir listagem sem autenticação**: Requer token válido

#### Atualização de Contato (4 testes)
- ✅ **Atualizar contato existente**: Modifica dados do contato com sucesso
- ✅ **Erro 404 para contato inexistente**: Retorna erro quando contato não encontrado
- ✅ **Impedir atualização de contato de outro usuário**: Isolamento entre usuários
- ✅ **Impedir atualização sem autenticação**: Requer token válido

#### Exclusão de Contato (4 testes)
- ✅ **Deletar contato existente**: Remove contato do banco de dados
- ✅ **Erro 404 para contato inexistente**: Retorna erro quando contato não encontrado
- ✅ **Impedir exclusão de contato de outro usuário**: Isolamento entre usuários
- ✅ **Impedir exclusão sem autenticação**: Requer token válido

#### Teste de Autenticação (1 teste)
- ✅ **Impedir criação sem autenticação**: Todas as rotas de contatos requerem autenticação

## Recursos Testados

### Validações Implementadas
- **Username**: Mínimo 3 caracteres, único no sistema
- **Password**: Mínimo 6 caracteres
- **Nome do contato**: Mínimo 2 caracteres
- **Telefone**: Formato brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX

### Segurança
- **Autenticação JWT**: Tokens válidos requeridos para operações protegidas
- **Blacklist de tokens**: Tokens invalidados no logout são rejeitados
- **Isolamento de dados**: Usuários só acessam seus próprios contatos
- **Validação de entrada**: Middleware validateBody protege contra dados inválidos

### Integração
- **PostgreSQL**: Operações reais no banco de dados
- **Redis**: Cache e blacklist de tokens
- **Express**: Rotas e middlewares funcionais
- **Bcrypt**: Hash de senhas
- **JWT**: Geração e validação de tokens

## Resultado dos Testes

```
Test Suites: 2 passed, 2 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        7.374 s
```

**Todos os 30 testes passaram com sucesso!**

## Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar PostgreSQL e Redis locais**:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl start redis-server
   ```

3. **Criar banco de dados**:
   ```bash
   sudo -u postgres createdb bdaula
   sudo -u postgres psql -d bdaula -f src/configs/comandos.sql
   ```

4. **Executar testes**:
   ```bash
   NODE_ENV=test npx jest --detectOpenHandles --forceExit
   ```

## Arquitetura dos Testes

### Setup e Teardown
- **beforeAll**: Conecta ao PostgreSQL e Redis
- **beforeEach**: Limpa tabelas e cache antes de cada teste
- **afterEach**: Limpa tabelas e cache após cada teste
- **afterAll**: Fecha conexões e restaura mocks

### Isolamento
- Cada teste executa em ambiente limpo
- Transações independentes
- Dados de teste não interferem entre si

### Cobertura
- Todos os cenários especificados no PDF foram implementados
- Testes cobrem casos de sucesso e falha
- Validações de entrada e saída
- Comportamento de segurança e autenticação

## Conclusão

A implementação atende completamente aos requisitos da atividade, fornecendo testes de integração robustos que validam o funcionamento correto de toda a aplicação, desde as rotas HTTP até a persistência no banco de dados e cache no Redis.


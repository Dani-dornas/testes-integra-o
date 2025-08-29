# Lista de Tarefas - Testes de Integração

## Análise Completa ✓
- [x] Analisar PDF com requisitos dos testes
- [x] Extrair e examinar estrutura do projeto
- [x] Examinar controllers, middlewares e rotas existentes

## Implementar Testes de Integração ✓
### Testes de Usuário ✓
- [x] Criar testes de registro de usuário
  - [x] Teste: criar usuário válido com sucesso
  - [x] Teste: impedir criação com username muito curto
  - [x] Teste: impedir criação com password menor que 6 caracteres
  - [x] Teste: impedir criação de usuário duplicado
- [x] Criar testes de login
  - [x] Teste: permitir login com credenciais válidas
  - [x] Teste: bloquear login com senha incorreta
  - [x] Teste: bloquear login com usuário inexistente
  - [x] Teste: bloquear login com campos ausentes
- [x] Criar testes de logout
  - [x] Teste: permitir logout de usuário autenticado
  - [x] Teste: garantir que token deslogado seja rejeitado

### Testes de Contatos (CRUD) ✓
- [x] Implementar controller de contatos
- [x] Implementar rotas de contatos
- [x] Criar testes de criação de contato
  - [x] Teste: criar contato válido com sucesso
  - [x] Teste: impedir criação sem campo obrigatório (name/phone)
  - [x] Teste: impedir criação com name muito curto
  - [x] Teste: impedir criação com telefone em formato inválido
- [x] Criar testes de listagem de contatos
  - [x] Teste: listar somente contatos do usuário autenticado
  - [x] Teste: garantir formato correto da resposta
- [x] Criar testes de atualização de contato
  - [x] Teste: atualizar contato existente com sucesso
  - [x] Teste: retornar erro 404 para contato inexistente
- [x] Criar testes de exclusão de contato
  - [x] Teste: deletar contato existente com sucesso
  - [x] Teste: retornar erro 404 para contato inexistente

## Configuração do Ambiente ✓
- [x] Configurar PostgreSQL e Redis locais
- [x] Atualizar schema do banco para incluir tabela de contatos
- [x] Executar testes e validar funcionamento
- [x] Todos os 30 testes passaram com sucesso!
- [x] Ajustar Docker Compose para executar projeto e testes

## Entrega ✓
- [x] Documentar os testes implementados
- [x] Preparar arquivos para entrega


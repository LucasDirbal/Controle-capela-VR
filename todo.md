# Sistema de Controle de Capela - TODO

## Arquitetura e Banco de Dados
- [x] Criar schema de membros (name, email, phone, order, active)
- [x] Criar schema de rastreamento da capela (currentMemberId, startDate, notes)
- [x] Criar schema de histórico de passagem (memberId, startDate, endDate)
- [x] Criar schema de notificações (memberId, type, sent, scheduledFor)

## Backend - APIs
- [x] Implementar CRUD de membros (criar, listar, atualizar, deletar, reordenar)
- [x] Implementar API para registrar localização atual da capela
- [x] Implementar API para gerar calendário dos próximos 30 dias
- [x] Implementar API para obter histórico de passagem
- [ ] Implementar API para enviar notificações
- [x] Implementar testes unitários para APIs críticas

## Frontend - Interface
- [x] Criar layout elegante com tema consistente
- [x] Implementar dashboard principal com status atual da capela
- [x] Criar página de gerenciamento de membros (CRUD + reordenação)
- [x] Criar visualização de calendário com próximos responsáveis
- [x] Criar seção de histórico de passagem
- [x] Implementar responsividade para mobile

## Notificações e Automação
- [ ] Configurar sistema de notificações para lembrar responsável do dia
- [ ] Implementar agendamento de notificações automáticas
- [ ] Criar interface para visualizar notificações enviadas

## Testes e Deploy
- [x] Testar fluxo completo de cadastro e rotação
- [x] Testar geração de calendário com diferentes cenários
- [ ] Testar notificações
- [ ] Criar checkpoint para publicação
- [ ] Publicar sistema

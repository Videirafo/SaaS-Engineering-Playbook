# Especificação de fluxo — modelo reutilizável

> Copie para `docs/workflows/<id>.md` ou adapte o arquivo de requisitos equivalente existente. Não trate campos vazios como funcionalidades prontas.

## Identificação

- ID / nome: [PREENCHER]
- Projeto / repositório: [PREENCHER]
- Proprietário técnico / responsável pelo negócio: [PREENCHER]
- Módulo do guia (01 WhatsApp, 02 vídeos de imóveis, 03 voz, 04 sites, 05 carrosséis, 06 anúncios, 07 conhecimento): [PREENCHER]
- Status: [not_applicable | planned | partial | verified]
- Critério de aplicabilidade: [PREENCHER]
- Fonte de verdade: [PREENCHER + URL/arquivo + data]
- Canais e plataformas (Web, Android, iOS, desktop, offline): [PREENCHER]
- Custos adicionais autorizados? [não por padrão]
- Tenant, papel, capability e base legal/consentimento: [PREENCHER]

## Fluxo principal

| Etapa | Entrada / contrato | Saída verificável | Permissões / fonte | Erro / fallback |
| --- | --- | --- | --- | --- |
| Recepção | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| Interpretação (IA opcional) | [PREENCHER] | intenção, campos e incerteza | [PREENCHER] | dúvida -> humano |
| Ação autorizada | [PREENCHER] | recibo/ID real do serviço | [PREENCHER] | timeout -> estado pendente |
| Validação | [PREENCHER] | sucesso comprovado ou erro | [PREENCHER] | sem confirmação, não prometer sucesso |
| Auditoria | correlation_id e status | referência de execução | apenas metadados necessários | falha de log -> política explícita |

## Ferramentas e integrações

- Ferramentas já existentes reutilizadas: [PREENCHER]
- API/versão/endpoint e contrato de entrada: [PREENCHER]
- Segredos necessários (nomes, **não valores**): [PREENCHER]
- Timeout/retries/backoff: [PREENCHER]
- Chave de idempotência e escopo: [PREENCHER]
- Limites de taxa/custo: [PREENCHER]
- Operação manual de emergência: [PREENCHER]

## Cenários de aceitação

- [ ] Caminho feliz com resultado real verificado
- [ ] Dados de entrada incompletos
- [ ] Entrada malformada/contraditória
- [ ] Não autenticado / sem permissão
- [ ] Isolamento por tenant, quando aplicável
- [ ] Provider ausente/erro/timeout
- [ ] Eventos repetidos / reprocessamento sem efeitos duplicados
- [ ] Ação sensível bloqueada até aprovação
- [ ] Handoff humano e recuperação testados
- [ ] Uso de dado desatualizado/sem fonte recusa inventar
- [ ] Legibilidade em celular, quando aplicável
- [ ] CI no SHA testado / documentação de rollback

## Evidências

| Teste | SHA / ambiente | Resultado (não executado, passou, falhou) | Link de evidência | Responsável |
| --- | --- | --- | --- | --- |
| [PREENCHER] | [PREENCHER] | não executado | [PREENCHER] | [PREENCHER] |

## Próxima decisão

- Bloqueio atual: [PREENCHER]
- Próximo PR isolado: [PREENCHER]
- Alteração em produção autorizada? **Não**, até aprovação específica e gate verde.

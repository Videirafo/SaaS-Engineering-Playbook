# Padrão operacional: 7 sistemas adaptáveis (Videira)

> Status: padrão proposto para revisão. Não significa que os módulos já estejam integrados ou publicados nos projetos.
> Referência fornecida pelo proprietário: **7 Sistemas Claude | CS72** (19 páginas), sobretudo briefing único, 7 fluxos e checklist de validação.
> Complementa, sem substituir: `docs/AI_AGENTS.md`, `docs/VIDEIRA_TRUST_GATE.md` e `templates/PRODUCTION_READINESS_CHECKLIST.md`.

## 1. Regra universal

Em cada sistema existente ou futuro, documentar um fluxo mínimo verificável:

```text
entrada identificada
  -> validação + autenticação/autorização
  -> interpretação (regras de domínio e IA somente quando útil)
  -> proposta/decisão rastreável
  -> execução em ferramenta/API autorizada
  -> confirmação do resultado real
  -> registro de status/evidência
  -> handoff humano, retry limitado ou falha segura
```

Ação do modelo **não** equivale à autorização do servidor. Somente serviços do domínio podem executar efeitos externos. IA nunca é a fonte de verdade de agenda, valores, estoque, propriedade de registros ou pagamentos.

O padrão **não** obriga os sete módulos em todos os produtos. Cada módulo deve ser marcado `applicable`, `not_applicable`, `planned`, `partial` ou `verified` com evidências. Software offline, trabalho acadêmico e jogos não devem ganhar CRM, bot ou serviços pagos sem necessidade de produto.

## 2. Briefing único por sistema

Registrar em `docs/AUTOMATION_BRIEF.md`:
- nome do sistema, usuário final e problema prioritário;
- resultados esperados (indicador verificável, não promessa);
- fluxo de entrada e canais realmente disponíveis;
- fontes de dados autorizadas, atualização e responsável;
- ações permitidas/negadas, papéis, escopo de tenant e informações sensíveis;
- serviços locais/existentes, custos e limites de terceiros;
- aprovações humanas, exceções e plano de recuperação;
- status de cada módulo, testes, links de evidência e owner.

Nunca preencher preço, métrica, contato, credencial, disponibilidade ou vínculo de conta com dados fictícios.

## 3. Catálogo dos sete módulos

| ID | Módulo | Entrada -> saída | Testes mínimos | Contexto indicado |
| --- | --- | --- | --- | --- |
| 01 | WhatsApp + agenda | mensagem -> intenção -> disponibilidade real -> resposta/registro | FAQ; indisponibilidade; mensagens confusas; humano; deduplicação | MarcaIA/Alma, OrlaNexo; outros com contato real |
| 02 | Tour de imóvel | fotos e ficha verificadas -> storyboard -> vídeo revisado | ordem dos cômodos; proporção 9:16/16:9; texto mobile; sem atributos inventados | OrlaNexo |
| 03 | Atendimento por voz | ligação -> triagem -> resumo/retorno ou transferência | silêncio; ruído; erro de transcrição; pedido de humano; aviso de automação | MarcaIA/Alma; outros apenas com telefonia real |
| 04 | Criação de sites | perfil validado -> conteúdo/código -> revisão/publicação | responsividade; contraste; SEO; links e contatos reais | sites dos projetos e landing pages |
| 05 | Carrosséis | temas verificáveis -> roteiro -> template -> revisão | legibilidade; originalidade; não repetição; evidências | Pink Collection e produtos com marketing |
| 06 | Anúncios por dados | dados comparáveis -> hipóteses -> criativos -> medição | métricas presentes; atribuição incerta; comparabilidade; policy compliance | Pink Collection, MarcaIA, OrlaNexo |
| 07 | Assistente + conhecimento | fonte autorizada -> busca -> resposta citada -> resumo | fontes ausentes; fontes conflitantes; informação vencida; RBAC/RLS | MarcaIA, Videira MCP/Obsidian, gestão interna |

Os nomes de fornecedores no material de origem são sugestões. Claude, Twilio, Make, n8n, Canva, Meta ou provedores de vídeo não devem ser conectados automaticamente.

## 4. Adaptação por produto (escopo, não afirmação de entrega)

| Projeto | Priorizar | Não impor |
| --- | --- | --- |
| MarcaIA / Alma | 01, 03, 06, 07; integração com CRM/agenda/Chatwoot existentes | segundo remetente WhatsApp, sistemas paralelos, carga desnecessária na VPS |
| OrlaNexo | 02, 04, 01, 06; catálogo de fotos e contato real | atributos falsos de imóvel, checkout sem persistência |
| Pink Collection Perfumes | 05, 06, 07 e respostas comerciais revisadas | postagem sem autorização, campanhas com métricas inventadas |
| Rifa Pink Collection | 01 opcional, 04, 07 para suporte/documentação | confirmação automática de Pix sem reconciliação real |
| ContaViva | 04 para site, ajuda local/regras para operação offline, 07 opcional local | dependência permanente de rede ou IA paga no app offline |
| B.A.S.E. | 07 com autorização por gestão, professor, responsável e aluno | acesso amplo a dados de menores, canal irrestrito |
| Videira MCP / Obsidian | 07, observabilidade e governança de ferramentas | acesso a tudo por conta de um agente |
| Jogos mobile | pipeline, testes, documentação e indicadores locais; IA contextual se houver valor | marketing/WhatsApp/voz dentro da mecânica sem justificativa |

`verified` é reservado ao módulo com evidência de execução e testes **no repositório específico**, não à existência deste padrão.

## 5. Regras técnicas para implementação

1. **Sem sistemas paralelos:** priorize API, filas e tabelas já existentes; evite criar outro CRM, outra agenda ou segundo banco sem ADR explícito.
2. **Custo:** prefira código aberto, infraestrutura já disponível e execução sob demanda. Módulos com gasto por chamada ficam bloqueados até haver aprovação de orçamento.
3. **Segredos:** apenas servidor/secret manager; nunca no Git, log ou `NEXT_PUBLIC_*`.
4. **Identidade e escopo:** servidor identifica principal, tenant, capabilities e recurso; não confiar em dados enviados pela IA.
5. **Consentimento e privacidade:** informação sobre atendimento automatizado, minimização, LGPD, retenção e controle de acesso.
6. **Integridade:** verificar webhooks, idempotency key e resposta das APIs antes de confirmar ao usuário; não assumir êxito pela ausência de erro.
7. **Resiliência:** timeout, retries limitados com backoff, dead-letter/pendência, deduplicação e operador humano quando necessário.
8. **Auditoria:** `correlation_id`, `workflow_id`, `tenant_id` quando aplicável, `actor_id`, `action`, `status`, timestamp, referência de fonte e resultado sem dados sensíveis.
9. **Mídia e publicidade:** usar fontes autorizadas, revisar alegações, manter formatos mobile e separar rascunho de publicação.
10. **Produção:** nenhuma publicação, merge, migração, rotação de credencial, cobrança ou troca de provider sem gates e autorização específica.

## 6. Estrutura mínima (adaptar à stack existente)

```text
docs/
  AUTOMATION_BRIEF.md
  AUTOMATION_MATRIX.md
  WORKFLOW_ACCEPTANCE.md
  ...
src/                         # ou app/, lib/, engine/, conforme o projeto
  domain/                    # regras de negócio puras
  integrations/              # adaptadores com contratos explícitos
  workflows/                 # orquestração e handoff
tests/
  workflows/                 # cenários normais, exceções e segurança
```

Arquivos não precisam ser criados se um equivalente já existir; adicionar documentação sem duplicar. Usar `templates/SEVEN_SYSTEMS_FLOW_SPEC.md` e `templates/SEVEN_SYSTEMS_FLOW.schema.json` como ponto de partida, não como implementação automaticamente conectada.

## 7. Gate de aceite aplicável a cada fluxo

- [ ] fonte de verdade confirmada com responsável, data e permissões;
- [ ] pedido comum funciona de ponta a ponta;
- [ ] dado ausente ou contraditório gera pendência, não invenção;
- [ ] 401, 403 e, onde aplicável, acesso cruzado a tenant são negados;
- [ ] API externa lenta, desligada ou retornando erro tem recuperação definida;
- [ ] duplicação de webhook, mensagem ou retry não duplica efeito;
- [ ] ação sensível exige aprovação e guarda evidência;
- [ ] artefatos e textos são legíveis em mobile (inclusive largura 320 px onde o projeto exigir);
- [ ] logs não expõem segredos ou dados pessoais desnecessários;
- [ ] documentação, testes e CI no SHA exato estão verdes;
- [ ] rollback e restauração isolada comprovados antes de alteração de dados críticos.

## 8. Sequência de adoção

1. **Inventário somente leitura** de projetos ativos; diferenciar produto real, protótipo, exercício, legado ou arquivo.
2. **Matriz por repositório**: funções existentes, módulos aplicáveis, dependências, lacunas e estado comprovado.
3. **Implementação incremental**: uma worktree e branch por tarefa/agente, propriedade de arquivos separada, commits pequenos, PR sem merge automático.
4. **Validação independente** de fluxo, segurança, performance, acessibilidade, custos e evidências.
5. **Lançamento controlado**, por SHA quando aplicável, com monitoramento e rollback. Projeto acadêmico, desktop e jogo usam gate compatível à plataforma.

> Um PR que só acrescenta estes documentos **não** declara que todos os sistemas foram migrados; a adoção requer mudanças e testes individuais em cada repositório.

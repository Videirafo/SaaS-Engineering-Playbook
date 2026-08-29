# Contribuindo

## Antes de começar

1. procure issue existente;
2. confirme que a mudança é pública e genérica;
3. não copie código, dados ou configuração de sistemas privados;
4. prefira mudanças pequenas e verificáveis.

## Fluxo

```text
Issue
→ branch
→ alteração
→ validação local
→ Pull Request
→ review
→ merge
```

## Tipos de contribuição

- correção técnica;
- documentação;
- exemplos;
- diagramas como código;
- checklists;
- testes conceituais;
- referências oficiais;
- melhoria de acessibilidade/leitura.

## Branches

Sugestões:

```text
feat/<issue>-descricao
fix/<issue>-descricao
docs/<issue>-descricao
```

## Pull Request

Explique:

- problema;
- mudança;
- evidência/referência;
- riscos;
- como foi validado.

Quando houver issue relacionada, use `Closes #N`.

## Segurança

Nunca inclua:

- tokens;
- senhas;
- `.env` reais;
- chaves privadas;
- IPs/endpoints internos sensíveis;
- dumps;
- dados pessoais/de clientes;
- código proprietário sem autorização.

## Coautoria

Use `Co-authored-by` somente quando outra pessoa realmente participou da mudança e concorda com a atribuição.

## Qualidade

Uma contribuição deve melhorar pelo menos um destes pontos:

- correção;
- clareza;
- segurança;
- testabilidade;
- operabilidade;
- reutilização;
- aprendizado.
# Security Policy

## Escopo

Este repositório é um playbook público de engenharia. Ele não deve conter credenciais, dados de produção ou detalhes operacionais sensíveis.

## Não publique

- passwords ou API keys;
- tokens GitHub/cloud/provider;
- `.env` reais;
- private keys;
- IPs e endpoints internos sensíveis;
- dados de clientes;
- dumps de banco;
- logs com informação pessoal/sensível;
- screenshots sem sanitização;
- código proprietário de projetos privados.

## Se um secret for publicado

1. trate o secret como comprometido;
2. revogue/rotacione na origem;
3. remova da versão atual;
4. avalie histórico e caches;
5. documente o incidente sem republicar o secret.

Remover do Git não substitui rotação.

## Vulnerabilidades

Para vulnerabilidades em projetos privados relacionados, não abra issue pública neste repositório. Use o canal privado apropriado do projeto afetado.

## Conteúdo de segurança

Exemplos neste playbook são conceituais. A implementação final deve ser revisada conforme linguagem, framework, threat model e ambiente de produção.
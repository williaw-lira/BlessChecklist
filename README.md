# Projeto Bless — Segurança e preparo para publicar no GitHub

Pequeno guia para deixar o projeto pronto para publicar em um repositório público sem vazar segredos.

## O que eu alterei aqui (segurança mínima)
- Atualizei `.gitignore` para ignorar `node_modules/`, `temp/`, e arquivos de ambiente (`.env`, `.env.*`) — assim PII e segredos não serão comitados.
- Criei `.env.example` com variáveis necessárias (PORT, NODE_ENV, DB_CONNECTION, JWT_SECRET, ALLOWED_ORIGINS) — copie para `.env` e preencha antes de rodar.
- Adicionei `dotenv`, `helmet` e `express-rate-limit` e atualizei `app.js` para usar:
  - carregamento de `.env` (dotenv),
  - cabeçalhos de segurança (helmet),
  - rate limiting básico para reduzir ataques de força-bruta.
- Alterei `src/services/processamentoService.js` para mascarar dados sensíveis (CPF, emails, telefones) antes de gravar arquivos temporários.

## O que você precisa fazer antes de publicar
1. Não adicione seu `.env` ao repositório. Use `.env.example` como template.
2. Verifique a pasta `temp/` e confirme que arquivos sensíveis não foram adicionados acidentalmente ao histórico git.
   - Se já tiverem sido comitados, use `git rm --cached <file>` para removê-los e reescrever o histórico se necessário.
3. Configure `ALLOWED_ORIGINS` no `.env` com a origem correta do frontend (ex: `https://meu-site.com`).

## Recomendações adicionais (próximos passos)
- Use TLS/HTTPS em produção.
- Armazene segredos (DB, JWT secret) como GitHub Secrets/Runner secrets ao usar CI/CD, não no repo.
- Para autenticação de usuários, use hashing de senhas com `bcrypt` e gerencie tokens com expirations curtas.
- Valide/escape todos inputs no servidor (evitar injeção/BLR/JS). Use bibliotecas de validação como `joi` ou `zod`.
- Considere eliminar logs contendo PII e usar criptografia em repouso quando armazenar dados sensíveis.

## Como rodar localmente (rápido)
1. Instale dependências:
```bash
npm install
```
2. Copie `.env.example` para `.env` e preencha os valores.
3. Inicie o servidor:
```bash
npm start
```

Se quiser, posso te ajudar a adicionar autenticação + banco de dados com migrações e testes — quer que eu continue e implemente essa parte também?
# BlessChecklist

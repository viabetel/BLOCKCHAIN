# INSTALL · Como aplicar o v19 sem quebrar o build

## O problema do deploy anterior

O erro do Vercel era:

```
page.tsx doesn't have a root layout.
```

Isso significa que o `app/layout.tsx` sumiu do seu repositório. Next.js
14 (app router) exige que exista um `app/layout.tsx` como raiz, senão
nenhum `page.tsx` consegue ser renderizado.

Na v18, esse arquivo existia. Provavelmente ele foi deletado quando você
aplicou a v19, porque o zip anterior:

1. Tinha pastas lixo com nomes literais `{app/` e
   `{app/admin,components,lib,docs,contracts}/` por um bug de shell na
   minha máquina
2. NÃO incluía o `app/layout.tsx` (eu não mexi nele, então não coloquei
   no zip)

Se você extraiu o zip por cima do projeto de um jeito que substituiu a
pasta `app/` inteira (em vez de mesclar arquivo a arquivo), o
`layout.tsx` foi apagado nesse processo.

## Como aplicar este zip (versão corrigida)

Este zip agora inclui o `app/layout.tsx` intocado e não tem nenhuma
pasta lixo.

### Opção 1 · Aplicar por cima com Git limpo (recomendado)

```bash
# Na raiz do seu projeto
cd /caminho/para/BLOCKCHAIN

# Descompacta em uma pasta temporária, não no projeto
unzip limero-v19-fixed.zip -d /tmp/limero-v19

# Copia cada arquivo para o lugar certo (preserva tudo que não está no zip)
cp /tmp/limero-v19/limero-v19/app/layout.tsx app/layout.tsx
cp /tmp/limero-v19/limero-v19/app/page.tsx app/page.tsx
cp /tmp/limero-v19/limero-v19/app/admin/page.tsx app/admin/page.tsx
cp /tmp/limero-v19/limero-v19/components/Hero.tsx components/Hero.tsx
cp /tmp/limero-v19/limero-v19/components/VaultsSection.tsx components/VaultsSection.tsx
cp /tmp/limero-v19/limero-v19/components/AstronomicalJuice.tsx components/AstronomicalJuice.tsx
cp /tmp/limero-v19/limero-v19/lib/tokens.ts lib/tokens.ts

# Copia os docs
mkdir -p docs
cp /tmp/limero-v19/limero-v19/docs/*.md docs/
cp /tmp/limero-v19/limero-v19/CHANGES.md .

# Testa localmente antes de commitar
npm run dev
# Abre http://localhost:3000 e verifica se carrega
# Se carregar: commit

git add -A
git commit -m "v19: reposicionamento zkLTC-first para LitVM Builders Program"
git push
```

### Opção 2 · Se já está quebrado no GitHub agora

Se o deploy já falhou e você quer o fix mais rápido:

1. Descompacta este zip
2. Pega só o arquivo `limero-v19/app/layout.tsx`
3. Coloca ele em `app/layout.tsx` no seu projeto
4. Commit e push imediato — isso sozinho já resolve o erro do Vercel
5. Depois, com calma, aplica os outros arquivos para o reposicionamento
   v19

```bash
# Fix de emergência
cp /tmp/limero-v19/limero-v19/app/layout.tsx app/layout.tsx
git add app/layout.tsx
git commit -m "fix: restaurar app/layout.tsx"
git push
```

## Checklist antes de push para o main

Antes de dar `git push`, confirma que estes arquivos existem no seu
projeto local:

- [ ] `app/layout.tsx`
- [ ] `app/page.tsx`
- [ ] `app/globals.css`
- [ ] `app/admin/page.tsx`
- [ ] `app/dashboard/page.tsx`
- [ ] `app/market/[address]/page.tsx`
- [ ] `components/Hero.tsx`
- [ ] `components/VaultsSection.tsx`
- [ ] `components/AstronomicalJuice.tsx`
- [ ] `components/Providers.tsx`
- [ ] `components/MarketCard.tsx`
- [ ] `components/TradeBox.tsx`
- [ ] `lib/tokens.ts`
- [ ] `lib/contracts.ts`
- [ ] `lib/wagmi.ts`
- [ ] `package.json`
- [ ] `next.config.mjs`
- [ ] `tailwind.config.ts`
- [ ] `tsconfig.json`

Se qualquer um desses NÃO existe no seu projeto, é sinal de que a
extração anterior apagou arquivos além do `layout.tsx`. Nesse caso,
você vai precisar restaurar a partir do seu backup/zip v18 original
e só depois aplicar os arquivos do v19.

## Depois que o build passar

Execute uma vez para garantir que tudo está saudável:

```bash
npm run dev           # abrir http://localhost:3000 — deve mostrar novo Hero
npm run build         # simular o que o Vercel vai rodar — precisa passar sem erro
```

Se `npm run build` passa localmente, o Vercel também vai passar.

## Se ainda falhar no Vercel

Cole o log de erro completo (não apenas as primeiras linhas) numa nova
mensagem, que eu diagnóstico e corrijo.

# Site Vektra - Inteligência Contábil

Site estático de duas páginas. Sem build, sem dependências: é só abrir o
`index.html` no navegador (ou subir a pasta inteira em qualquer hospedagem).

---

## Estrutura

```
SITE VEKTRA/
├── index.html              Página inicial
├── servicos.html           Página de serviços (vídeos + simulador)
├── README.md               Este arquivo
│
├── assets/
│   ├── css/
│   │   ├── tokens.css      Cores, fontes e medidas, os dois temas
│   │   ├── base.css        Reset, tipografia, container, grão, reveal
│   │   ├── layout.css      Nav, menu mobile, rodapé, botão do WhatsApp
│   │   ├── components.css  Botões, cabeçalho de seção, formulários, mockups
│   │   ├── home.css        Seções exclusivas da index.html
│   │   └── servicos.css    Seções exclusivas da servicos.html
│   │
│   ├── js/
│   │   ├── theme-init.js   Aplica o tema antes da tela pintar (fica no <head>)
│   │   ├── config.js       >>> NÚMERO DO WHATSAPP FICA AQUI <<<
│   │   ├── theme.js        Botão sol/lua
│   │   ├── core.js         Nav, menu, reveal, botões magnéticos, rolagem suave
│   │   ├── home.js         Contadores, ticker, conversa, FAQ, formulário
│   │   └── servicos.js     Modal dos vídeos e simulador tributário
│   │
│   └── img/
│       └── favicon.svg     Ícone da aba
│
└── _backup/                Versões antigas (pode apagar quando quiser)
```

**A ordem dos arquivos CSS importa.** `tokens.css` precisa vir primeiro
(define as variáveis) e o CSS da página por último. O mesmo vale para o JS:
`config.js` antes de todos, porque cria o objeto `VEKTRA` que os outros usam.

---

## Tarefas do dia a dia

### Trocar o número do WhatsApp

Abra `assets/js/config.js` e edite uma linha:

```js
whatsapp: '5585989929146',   // 55 + DDD + número, só dígitos
```

Vale para os dois arquivos HTML, todos os botões, o formulário e o simulador.
O número configurado hoje é (85) 98992-9146.

### Publicar um vídeo na página de serviços

1. Abra `servicos.html` e ache o card do vídeo.
2. Preencha o `data-src` do botão `.play`:

```html
data-src="https://www.youtube.com/embed/SEU_ID_AQUI"
```

O modal reconhece sozinho: link de embed vira `<iframe>`, arquivo `.mp4`
vira player nativo.

3. Apague o `<span class="cover-soon">Em breve</span>` daquele card.

### Mudar uma cor

Só em `assets/css/tokens.css`. As cores aparecem duas vezes: uma no bloco
`[data-theme="dark"]` e outra em `[data-theme="light"]`. Nenhum outro arquivo
tem valor de cor fixo, todos usam as variáveis.

### Trocar textos

Direto no HTML. Duas exceções que vivem no JavaScript:

| Texto | Onde está |
|---|---|
| Conversa do celular na home | `assets/js/home.js` → `roteiro` |
| Termos da faixa laranja | `assets/js/home.js` → `termos` |
| Lista de escopo Construtora/Incorporadora | `assets/js/home.js` → `escopos` |

---

## VektraBot (chat com IA)

O botão flutuante abre o VektraBot. Ele não tem resposta pronta: cada pergunta
vai para um servidor pequeno na Cloudflare (pasta `bot-worker/`), que pergunta
ao Claude usando **só** o arquivo `base-de-conhecimento/base-vektra.md`.

```
bot-worker/
├── wrangler.toml     Nome do servidor e sites que podem usar o bot
├── package.json
└── src/index.js      Regras de formato, chamada ao Claude, resposta em JSON
base-de-conhecimento/
└── base-vektra.md    Tudo o que o bot sabe e como ele deve falar
```

### Publicar pela primeira vez

No terminal, dentro da pasta `bot-worker`:

```bash
npm install
npx wrangler login                          # abre o navegador para entrar na Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY   # cola a chave criada em console.anthropic.com
npx wrangler deploy                         # mostra o endereço, ex.: https://vektrabot.SEU-USUARIO.workers.dev
```

Depois cole o endereço em `assets/js/config.js`:

```js
botApi: 'https://vektrabot.SEU-USUARIO.workers.dev',
```

Enquanto `botApi` estiver vazio, o bot não chama a IA e oferece direto o WhatsApp.

### Mudar o que o bot sabe

Edite `base-de-conhecimento/base-vektra.md` e rode `npx wrangler deploy` de novo.
Sem esse passo, o bot continua respondendo com a versão anterior.

### Custo

Cada mensagem é cobrada pela Anthropic, por uso. O texto do `.md` fica em cache
entre mensagens, o que barateia bastante. Configure um limite de gasto mensal no
console da Anthropic: o servidor não limita quantas perguntas cada visitante faz.

### Testar localmente

Crie `bot-worker/.dev.vars` (não vai para o GitHub) com `ANTHROPIC_API_KEY=...`,
rode `npx wrangler dev --port 8787` e aponte `botApi` para `http://127.0.0.1:8787`.

---

## Rodando localmente

Abrir o arquivo direto (duplo clique) funciona para quase tudo. Mas o
navegador bloqueia o `localStorage` em alguns contextos `file://`, então o
tema pode não ser lembrado entre visitas.

Para testar igual ao ambiente real, use a extensão **Live Server** do
VS Code: clique com o botão direito no `index.html` → *Open with Live Server*.
Ela já está instalada nesta máquina (roda na porta 5500).

Alternativa por linha de comando, se instalar o Node:

```bash
npx serve .
```

---

## Pendências antes de publicar

- [x] Trocar o número do WhatsApp em `assets/js/config.js`
- [ ] Trocar CNPJ, CRC e e-mail no rodapé dos dois HTML
- [ ] Substituir depoimentos e logotipos fictícios por casos reais
      (ou manter o aviso que já está no rodapé)
- [ ] Gravar e publicar os 6 vídeos
- [ ] Revisar a estatística "R$ 4,2 milhões" da home

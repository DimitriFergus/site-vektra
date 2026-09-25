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

## VektraBot (só escolha, custo zero)

O botão flutuante abre o VektraBot. Ele não usa IA nem API: tudo roda no
navegador de quem visita. **Não existe campo de digitar**: o visitante
escolhe a pergunta numa trilha que rola para o lado, com setas laranja.

| Arquivo | O que tem |
|---|---|
| `assets/js/vektrabot-base.js` | **O conteúdo.** Catálogo de perguntas, respostas e o fluxo "Outro assunto" |
| `assets/js/vektrabot.js` | O motor: entende a pergunta escolhida e desenha a conversa |
| `base-de-conhecimento/base-vektra.md` | A fonte do texto das respostas |

### Incluir uma pergunta na trilha

1. Escreva a pergunta na lista `catalogo` do `vektrabot-base.js`, do jeito
   que o cliente escreveria.
2. Confira se ela cai na resposta certa. No site, aperte F12 e digite:

```js
VEKTRA.botResponder('o que é o ret na incorporação')
```

3. Se cair na resposta errada, acrescente a frase aos `exemplos` da
   resposta certa.

### As três perguntas da empresa

**Depois de qualquer resposta**, o bot pergunta nome da empresa
(digitado), faturamento e número de funcionários (escolha). Só então
aparece o botão do WhatsApp, com esses dados e a dúvida escritos na
mensagem. Uma vez respondidas, as perguntas não voltam: as respostas
seguintes já mostram o botão com os dados.

Duas exceções, de propósito:

- **Urgência** (intimação, fiscalização, certidão travada): o botão
  aparece na hora, porque tem prazo, e os dados são pedidos depois.
- **"Prefiro não informar"** não gera linha na mensagem, e aquele campo
  não é perguntado de novo.

"Outro assunto" é o último botão da trilha e serve para quem não achou a
dúvida: faz as mesmas três perguntas e leva ao especialista.

Para mudar as perguntas ou as faixas, edite `outro.passos` no
`vektrabot-base.js`.

### A conversa não fica guardada

A conversa vive só na memória da página. **Recarregar (F5) ou trocar de
página começa do zero**, e o bot volta a pedir os dados da empresa. Nada
é gravado no navegador do visitante, e as chaves que versões antigas
deixaram são apagadas na abertura.

Se um dia for preciso manter a conversa entre páginas, é só voltar a
gravar em `sessionStorage` no `vektrabot.js`.

### O que vai direto para o especialista

A lista `encaminhar` do mesmo arquivo: cálculo e simulação, lucro e
economia, escolha de regime para a empresa, leitura de contrato e
urgências (intimação, fiscalização, certidão travada). Pergunta não
reconhecida também vai para o WhatsApp, com a dúvida já escrita.

---

## Google Ads (tag de conversão)

A conta é **AW-18455568117**. A tag está nas 6 páginas da **versão
oficial**. A versão fictícia (`/ficticio/`) ficou de fora de propósito:
visita de teste não deve entrar nos dados do anúncio.

| Arquivo | O que tem |
|---|---|
| `<head>` de cada página | A biblioteca do Google e a chamada do arquivo abaixo |
| `assets/js/gtag.js` | A configuração e o evento de clique no WhatsApp |

A configuração fica num arquivo, e não dentro do HTML, porque a
política de segurança do site não permite script escrito na página. Por
isso, a política também precisou liberar os domínios do Google
(`googletagmanager.com`, `doubleclick.net`, `googleadservices.com`,
`google.com`). Está tudo na linha `Content-Security-Policy` de cada
página: **script novo de fora continua bloqueado**.

### Para medir conversão (falta o identificador)

Hoje o clique no WhatsApp gera o evento `clique_whatsapp`. Para virar
conversão no Google Ads:

1. No Google Ads, vá em Ferramentas > Conversões e crie a ação.
2. Copie o identificador que aparece (algo como `AW-18455568117/AbC-D_efG`).
3. Em `assets/js/gtag.js`, troque a linha do evento por:

```js
gtag('event', 'conversion', { send_to: 'AW-18455568117/SEU_ROTULO' });
```

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

## Publicação no domínio próprio (Hostinger)

O site oficial está em **https://vektracontabil.com**, hospedado na Hostinger
(plano Unlimited, servidor no Brasil), desde 25/09/2026. O GitHub continua
guardando o código; a pasta `teste/` segue só no computador para testar
novidades antes de publicar.

Para publicar uma atualização:

1. Na pasta do projeto: `python publicar/gerar-pacote.py`. Ele cria
   `vektra-site.zip` na Área de Trabalho, só com o que o site usa.
2. hPanel > Sites > vektracontabil.com > Arquivos > Gerenciador de arquivos >
   `public_html` > enviar o zip.
3. Botão direito no zip > Extract. Nome da pasta: `.` (ponto). Marcar
   "Sobrescrever arquivos existentes".
4. Mover o zip para fora da `public_html` (botão direito > Move file > `..`),
   para ele não ficar baixável.

O `.htaccess` (em `publicar/htaccess.txt`) força HTTPS, bloqueia a listagem
de pastas e define o cache: páginas sempre atualizadas, CSS e JS por 1 dia,
imagens por 30 dias.

---

## Pendências antes de publicar

Dados reais aplicados em 25/09/2026 a partir das respostas do Sandro
(tag `antes-dados-reais` guarda a versão anterior).

- [x] Trocar o número do WhatsApp em `assets/js/config.js`
- [x] CNPJ, CRC, razão social, endereço, horário e e-mail reais
- [x] Números reais (30+ obras, 31%, R$ 1,2 milhão, 14 anos) e clientes autorizados
- [x] História, marcos, missão, visão, propósito e equipe reais
- [x] Planos mensais (BASE, OBRA, ESTRATÉGICA, ENTERPRISE)
- [x] Política de privacidade (`politica-de-privacidade.html`)
- [ ] Frases de depoimento dos três clientes, com autorização por escrito
- [x] Site publicado em https://vektracontabil.com (Hostinger), em 25/09/2026
- [ ] Formulário gravando também em e-mail e planilha
- [ ] IDs do GA4 e do Meta Pixel para instalar
- [ ] Gravar e publicar os 6 vídeos (Alexandre, até 2 meses)

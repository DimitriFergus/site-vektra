/* ============================================================
   VEKTRA - VEKTRABOT
   Chat do botão flutuante, em todas as páginas.

   Versão 3: respostas prontas, sem IA e sem API, custo zero.
   O que o bot sabe está em assets/js/vektrabot-base.js
   (carregado antes deste arquivo). Aqui fica só o "motor":
   entender a pergunta, escolher a resposta e desenhar o chat.

   Ordem de decisão para cada pergunta:
   1. Mesma pergunta repetida      -> especialista
   2. Assunto de ENCAMINHAR        -> especialista (cálculo, lucro,
                                      economia, contrato, urgência)
   3. Resposta pronta reconhecida  -> responde
   4. Nada reconhecido             -> especialista
   ============================================================ */
(function () {
  'use strict';

  var V = window.VEKTRA;
  var BASE = window.VEKTRABOT_BASE;
  var botao = document.getElementById('botFloat');
  if (!V || !BASE) return;

  var CHAVE_SESSAO = 'vektrabot-v3';
  var PONTUACAO_MINIMA = 3;

  /* ============================================================
     ENTENDER A PERGUNTA
     ============================================================ */
  var PALAVRAS_VAZIAS = ('a o e os as um uma uns umas de do da dos das em no na nos nas num numa para pra pro ' +
    'por pelo pela com sem que qual quais se me te lhe eu voce voces vc vcs ele ela nos meu minha meus minhas ' +
    'seu sua isso esse essa este esta aquilo ai la aqui ja so mas ou tambem ao aos como sobre entre ate ' +
    'e ser sao foi era tem ter tenho temos ta to tou estou esta estao fica gostaria queria quero saber ' +
    'favor ola oi duvida pergunta alguem algum alguma').split(' ');
  var VAZIAS = {};
  PALAVRAS_VAZIAS.forEach(function (p) { VAZIAS[p] = true; });

  function normalizar(texto) {
    return String(texto || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9%$., ]+/g, ' ')
      .replace(/([a-z])[.,]+/g, '$1 ')
      .replace(/\s+/g, ' ').trim();
  }

  /* Radical simples: tira plural e terminações comuns, para
     "retenções" e "retenção" virarem a mesma coisa. */
  function radical(p) {
    if (p.length <= 4) return p;
    return p
      .replace(/coes$/, 'cao').replace(/soes$/, 'sao').replace(/oes$/, 'ao').replace(/aes$/, 'ao')
      .replace(/ais$/, 'al').replace(/eis$/, 'el').replace(/ns$/, 'm')
      .replace(/([^s])es$/, '$1').replace(/([^s])s$/, '$1');
  }

  function palavras(texto) {
    var vistas = {};
    return normalizar(texto).split(' ').filter(function (p) {
      if (!p || VAZIAS[p] || vistas[p]) return false;
      vistas[p] = true;
      return true;
    }).map(radical);
  }

  /* Tolera um erro de digitação em palavras maiores: "retencao" x "retencão", "presumdo" */
  function quase(a, b) {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 5) return false;
    var i = 0, j = 0, erros = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++erros > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    return erros + (a.length - i) + (b.length - j) <= 1;
  }

  function mesmaPalavra(a, b) {
    if (quase(a, b)) return true;
    // começo igual vale para palavras de 5 letras ou mais: "incorpora" x "incorporacao"
    var menor = a.length < b.length ? a : b;
    var maior = a.length < b.length ? b : a;
    return menor.length >= 5 && maior.indexOf(menor) === 0;
  }

  /* Prepara a base uma vez só */
  var RESPOSTAS = BASE.respostas.map(function (r) {
    return {
      item: r,
      peso: r.peso || 3,
      exemplos: (r.exemplos || []).map(palavras).filter(function (e) { return e.length; }),
      chaves: (r.chaves || []).map(function (c) {
        var n = normalizar(c);
        return { texto: n, varias: n.indexOf(' ') !== -1, raiz: radical(n) };
      })
    };
  });

  function pontuar(prep, texto, lista) {
    var pontos = 0;
    var comEspacos = ' ' + texto + ' ';

    prep.chaves.forEach(function (c) {
      if (c.varias) {
        if (comEspacos.indexOf(' ' + c.texto) !== -1) pontos += prep.peso + 1;
      } else if (c.texto.length <= 3) {
        // sigla curta ("ret", "iss", "cno") só vale se for a palavra inteira
        if (lista.indexOf(c.texto) !== -1) pontos += prep.peso;
      } else if (lista.some(function (p) { return p.indexOf(c.raiz) === 0 || quase(p, c.raiz); })) {
        pontos += prep.peso;
      }
    });

    // parecido com algum exemplo: palavras em comum sobre o tamanho das duas frases
    var melhor = 0;
    prep.exemplos.forEach(function (ex) {
      var comuns = ex.filter(function (w) {
        return lista.some(function (p) { return mesmaPalavra(p, w); });
      }).length;
      if (!comuns) return;
      var sim = comuns / Math.sqrt(ex.length * lista.length);
      if (sim > melhor) melhor = sim;
    });
    return pontos + melhor * 6;
  }

  function responder(pergunta, anterior) {
    var texto = normalizar(pergunta);
    var lista = palavras(pergunta);

    if (!texto) return null;

    if (anterior && texto === normalizar(anterior) && texto.length > 3) {
      return { tipo: 'repetida', resposta: BASE.repetida, especialista: true };
    }

    for (var i = 0; i < BASE.encaminhar.length; i++) {
      var e = BASE.encaminhar[i];
      if (e.padroes.some(function (re) { return re.test(texto); })) {
        return { tipo: e.id, resposta: e.resposta, especialista: true, urgente: !!e.urgente };
      }
    }

    var ranking = RESPOSTAS.map(function (prep) {
      return { prep: prep, pontos: pontuar(prep, texto, lista) };
    }).sort(function (a, b) { return b.pontos - a.pontos; });

    var topo = ranking[0];
    if (!topo || topo.pontos < PONTUACAO_MINIMA) {
      return { tipo: 'nao-entendi', resposta: BASE.naoEntendi, especialista: true };
    }

    var r = topo.prep.item;
    return {
      tipo: r.id,
      resposta: r.resposta,
      especialista: !!r.especialista,
      urgente: !!r.urgente,
      link: r.link,
      seguir: r.seguir,
      pontos: Math.round(topo.pontos * 10) / 10
    };
  }

  // exposto para teste e para quem for "treinar" o bot pelo console:
  // VEKTRA.botResponder('onde pago o iss')
  V.botResponder = function (pergunta, anterior) { return responder(pergunta, anterior); };

  if (!botao) return;

  /* ============================================================
     CHAT
     ============================================================ */
  var ESPECIALISTA = 'Quero falar com um especialista';
  var conversa = [];   // { papel: 'visitante' | 'bot', texto, especialista, urgente, link, pergunta }
  var ocupado = false;
  var montado = false;
  var painel, lista, sugestoes, campo, enviarBtn;

  function salvar() {
    try { sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(conversa.slice(-30))); } catch (e) {}
  }
  function recuperar() {
    try {
      var s = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null');
      if (Array.isArray(s)) conversa = s;
    } catch (e) {}
  }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto) n.textContent = texto;
    return n;
  }

  function rolarFim() { lista.scrollTop = lista.scrollHeight; }

  /* Resposta longa (RET, reforma) não pode chegar rolada até o fim:
     no celular o visitante perderia o começo. A tela para no início
     da resposta nova, e as sugestões aparecerem depois não mudam isso. */
  var ancora = null;
  function rolarPara(bolha) {
    var topo = bolha.getBoundingClientRect().top - lista.getBoundingClientRect().top + lista.scrollTop;
    lista.scrollTop = Math.max(0, topo - 10);
  }
  function reposicionar() {
    if (ancora && ancora.isConnected) rolarPara(ancora);
    else rolarFim();
  }

  function textoWhats(pergunta, urgente) {
    var linhas = ['Olá! Vim pelo VektraBot do site da Vektra' + (urgente ? ' e o assunto tem prazo.' : '.')];
    if (pergunta && pergunta !== ESPECIALISTA) linhas.push('Minha dúvida: ' + pergunta);
    return linhas.join('\n');
  }

  function linkWhats(pergunta, urgente) {
    var a = el('a', 'bot-link wa', urgente ? 'Falar agora com a equipe no WhatsApp' : 'Falar com um especialista no WhatsApp');
    a.href = V.link(textoWhats(pergunta, urgente));
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }

  function desenharDele(m) {
    var bolha = el('div', 'bot-msg dele', m.texto);
    if (m.link) {
      var a = el('a', 'bot-link', m.link.texto);
      a.href = m.link.href;
      bolha.appendChild(a);
    }
    if (m.especialista) bolha.appendChild(linkWhats(m.pergunta, m.urgente));
    lista.appendChild(bolha);
    return bolha;
  }

  function desenharMinha(texto) {
    lista.appendChild(el('div', 'bot-msg minha', texto));
    rolarFim();
  }

  /* Sugestões: as iniciais antes da primeira pergunta; depois, as
     da última resposta. "Falar com especialista" sempre por último. */
  function trocarSugestoes(opcoes) {
    sugestoes.innerHTML = '';
    var lista2 = (opcoes && opcoes.length ? opcoes : []).slice(0, 3);
    if (lista2.indexOf(ESPECIALISTA) === -1) lista2.push(ESPECIALISTA);
    lista2.forEach(function (s) {
      var b = el('button', '', s);
      b.type = 'button';
      b.addEventListener('click', function () { enviar(s); });
      sugestoes.appendChild(b);
    });
    sugestoes.hidden = ocupado;
    sugestoes.scrollLeft = 0;
    reposicionar();
  }

  function travar(sim) {
    ocupado = sim;
    campo.disabled = sim;
    enviarBtn.disabled = sim;
    sugestoes.hidden = sim;
    if (!sim) reposicionar();
    if (!sim && window.matchMedia('(pointer: fine)').matches) campo.focus();
  }

  function ultimaPerguntaDoVisitante() {
    for (var i = conversa.length - 1; i >= 0; i--) {
      if (conversa[i].papel === 'visitante') return conversa[i].texto;
    }
    return '';
  }

  function enviar(pergunta) {
    pergunta = String(pergunta || '').trim();
    if (!pergunta || ocupado) return;

    var anterior = ultimaPerguntaDoVisitante();
    ancora = null;
    conversa.push({ papel: 'visitante', texto: pergunta });
    desenharMinha(pergunta);
    travar(true);

    var digitando = el('div', 'bot-msg dele bot-digitando');
    digitando.setAttribute('aria-label', 'VektraBot está escrevendo');
    digitando.innerHTML = '<i></i><i></i><i></i>';
    lista.appendChild(digitando);
    rolarFim();

    setTimeout(function () {
      digitando.remove();

      var r = pergunta === ESPECIALISTA
        ? { tipo: 'pessoa', resposta: 'Claro. Um especialista da Vektra atende pelo WhatsApp (85) 98992-9146, em horário comercial. Toque abaixo e a sua mensagem já vai pronta.', especialista: true }
        : responder(pergunta, anterior);

      var msg = {
        papel: 'bot',
        texto: r.resposta,
        especialista: r.especialista,
        urgente: r.urgente,
        link: r.link,
        // na mensagem do WhatsApp vai a pergunta que gerou o encaminhamento
        pergunta: r.tipo === 'pessoa' || r.tipo === 'obrigado' ? anterior : pergunta,
        seguir: r.seguir
      };
      conversa.push(msg);
      ancora = desenharDele(msg);
      salvar();
      travar(false);
      trocarSugestoes(r.seguir);
    }, V.reduced ? 120 : 550);
  }

  function montar() {
    painel = el('section', 'bot');
    painel.id = 'vektrabot';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'VektraBot, atendimento rápido e eficiente');

    painel.innerHTML =
      '<header class="bot-topo">' +
        '<span class="bot-avatar" aria-hidden="true"><img src="assets/img/simbolo-claro.png" width="128" height="128" alt=""></span>' +
        '<span class="bot-nome"><b>VektraBot</b><small>Atendimento rápido e eficiente</small></span>' +
        '<button type="button" class="bot-fechar" aria-label="Fechar o VektraBot">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</header>' +
      '<div class="bot-msgs" aria-live="polite"></div>' +
      '<div class="bot-sugestoes"></div>' +
      '<form class="bot-form">' +
        '<label for="botCampo" class="sr-only">Escreva sua dúvida</label>' +
        '<input id="botCampo" type="text" placeholder="Escreva sua dúvida" autocomplete="off" maxlength="400">' +
        '<button type="submit" aria-label="Enviar">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>' +
        '</button>' +
      '</form>' +
      '<p class="bot-rodape">Respostas automáticas e gerais. Para o seu caso, fale com um especialista.</p>';

    document.body.appendChild(painel);

    lista = painel.querySelector('.bot-msgs');
    sugestoes = painel.querySelector('.bot-sugestoes');
    campo = painel.querySelector('input');
    enviarBtn = painel.querySelector('.bot-form button');

    painel.querySelector('.bot-fechar').addEventListener('click', fechar);
    painel.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var t = campo.value;
      campo.value = '';
      enviar(t);
    });
    painel.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') fechar();
    });

    recuperar();
    lista.appendChild(el('div', 'bot-msg dele', BASE.abertura));
    conversa.forEach(function (m) {
      if (m.papel === 'visitante') desenharMinha(m.texto);
      else ancora = desenharDele(m);
    });
    var ultima = conversa[conversa.length - 1];
    trocarSugestoes(ultima && ultima.papel === 'bot' ? ultima.seguir : BASE.sugestoesIniciais);
    montado = true;
  }

  function abrir() {
    if (!montado) montar();
    if (V.fecharMenu) V.fecharMenu();
    painel.classList.add('aberto');
    document.documentElement.classList.add('bot-aberto');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar o VektraBot');
    reposicionar();
    // no celular o teclado subindo cobre a conversa; só foca com mouse
    if (window.matchMedia('(pointer: fine)').matches) campo.focus();
  }

  function fechar() {
    if (!montado) return;
    painel.classList.remove('aberto');
    document.documentElement.classList.remove('bot-aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir o VektraBot');
    botao.focus();
  }

  botao.addEventListener('click', function () {
    if (montado && painel.classList.contains('aberto')) fechar();
    else abrir();
  });

  /* Qualquer elemento com [data-bot] abre o bot (ex.: página de dúvidas) */
  document.querySelectorAll('[data-bot]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      abrir();
    });
  });
})();

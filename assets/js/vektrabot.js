/* ============================================================
   VEKTRA - VEKTRABOT
   Chat do botão flutuante, em todas as páginas.

   Versão 2: não tem resposta pronta. Cada pergunta vai para o
   servidor do bot (pasta bot-worker, endereço em config.js ->
   botApi), que responde com IA usando só a base de conhecimento
   base-de-conhecimento/base-vektra.md.

   O servidor devolve { resposta, encaminhar, urgente, lead }.
   Quando "encaminhar" vem true, aparece o botão do WhatsApp com
   nome, empresa, município e a dúvida já escritos na mensagem.
   ============================================================ */
(function () {
  'use strict';

  var V = window.VEKTRA;
  var botao = document.getElementById('botFloat');
  if (!V || !botao) return;

  var ABERTURA = 'Oi. Aqui é o VektraBot, assistente da Vektra, contabilidade para construtoras e incorporadoras. Me conta qual é a situação da sua obra ou da sua empresa que eu te ajudo a entender o que está em jogo.';

  var SUGESTOES = [
    'Como é calculado o imposto no Lucro Presumido?',
    'O que é o RET na incorporação?',
    'Obra em outra cidade: onde pago o ISS?',
    'Quero falar com um especialista'
  ];

  var CHAVE_SESSAO = 'vektrabot-conversa';
  var TEMPO_LIMITE = 45000;
  var FALHA = 'Não consegui responder agora. Um especialista da Vektra te atende no WhatsApp em horário comercial, e a sua dúvida já vai anotada na mensagem.';

  var conversa = [];     // { papel: 'visitante' | 'bot', texto }
  var lead = { nome: '', empresa: '', municipio: '', assunto: '' };
  var ocupado = false;
  var montado = false;
  var painel, lista, sugestoes, campo, enviarBtn;

  /* ---------- memória da aba: fechar e abrir não apaga a conversa ---------- */
  function salvar() {
    try { sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ conversa: conversa, lead: lead })); } catch (e) {}
  }
  function recuperar() {
    try {
      var s = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null');
      if (s && Array.isArray(s.conversa)) { conversa = s.conversa; lead = s.lead || lead; }
    } catch (e) {}
  }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto) n.textContent = texto;
    return n;
  }

  function rolarFim() { lista.scrollTop = lista.scrollHeight; }

  /* ---------- mensagem do WhatsApp com o contexto do lead ---------- */
  function ultimaPergunta() {
    for (var i = conversa.length - 1; i >= 0; i--) {
      if (conversa[i].papel === 'visitante') return conversa[i].texto;
    }
    return '';
  }

  function textoWhats(urgente) {
    var linhas = ['Olá! Vim pelo VektraBot do site da Vektra' + (urgente ? ' e o assunto tem prazo.' : '.')];
    if (lead.nome) linhas.push('Nome: ' + lead.nome);
    if (lead.empresa) linhas.push('Empresa: ' + lead.empresa);
    if (lead.municipio) linhas.push('Município: ' + lead.municipio);
    var duvida = lead.assunto || ultimaPergunta();
    if (duvida) linhas.push('Dúvida: ' + duvida);
    return linhas.join('\n');
  }

  function linkWhats(urgente) {
    var a = el('a', 'bot-link wa', urgente ? 'Falar agora com a equipe no WhatsApp' : 'Continuar com um especialista no WhatsApp');
    a.target = '_blank';
    a.rel = 'noopener';
    // monta na hora do clique, com o nome e a empresa mais recentes
    a.href = V.link(textoWhats(urgente));
    a.addEventListener('click', function () { a.href = V.link(textoWhats(urgente)); });
    return a;
  }

  /* ---------- desenho das mensagens ---------- */
  function desenharDele(texto, encaminhar, urgente) {
    var m = el('div', 'bot-msg dele', texto);
    if (encaminhar) m.appendChild(linkWhats(urgente));
    lista.appendChild(m);
    rolarFim();
  }

  function desenharMinha(texto) {
    lista.appendChild(el('div', 'bot-msg minha', texto));
    rolarFim();
  }

  /* As sugestões só servem para puxar a primeira pergunta. Depois disso
     elas roubariam altura da conversa e cortariam o botão do WhatsApp. */
  function mostrarSugestoes() {
    sugestoes.hidden = ocupado || conversa.length > 0;
    rolarFim();
  }

  function travar(sim) {
    ocupado = sim;
    campo.disabled = sim;
    enviarBtn.disabled = sim;
    mostrarSugestoes();
    if (!sim && window.matchMedia('(pointer: fine)').matches) campo.focus();
  }

  /* ---------- conversa com o servidor ---------- */
  function perguntarServidor() {
    if (!V.botApi) return Promise.reject(new Error('botApi vazio em config.js'));

    var controle = 'AbortController' in window ? new AbortController() : null;
    var relogio = controle ? setTimeout(function () { controle.abort(); }, TEMPO_LIMITE) : null;

    return fetch(V.botApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagens: conversa.slice(-16).map(function (m) { return { papel: m.papel, texto: m.texto }; })
      }),
      signal: controle ? controle.signal : undefined
    }).then(function (r) {
      if (relogio) clearTimeout(relogio);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function (e) {
      if (relogio) clearTimeout(relogio);
      throw e;
    });
  }

  function juntarLead(novo) {
    if (!novo) return;
    ['nome', 'empresa', 'municipio', 'assunto'].forEach(function (k) {
      var v = String(novo[k] || '').trim();
      if (v) lead[k] = v;
    });
  }

  function enviar(pergunta) {
    pergunta = String(pergunta || '').trim();
    if (!pergunta || ocupado) return;

    conversa.push({ papel: 'visitante', texto: pergunta });
    desenharMinha(pergunta);
    salvar();
    travar(true);

    var digitando = el('div', 'bot-msg dele bot-digitando');
    digitando.setAttribute('aria-label', 'VektraBot está escrevendo');
    digitando.innerHTML = '<i></i><i></i><i></i>';
    lista.appendChild(digitando);
    rolarFim();

    perguntarServidor().then(function (dados) {
      digitando.remove();
      juntarLead(dados.lead);
      var texto = String(dados.resposta || '').trim() || FALHA;
      conversa.push({ papel: 'bot', texto: texto, encaminhar: !!dados.encaminhar, urgente: !!dados.urgente });
      desenharDele(texto, !!dados.encaminhar, !!dados.urgente);
    }).catch(function (e) {
      if (window.console) console.warn('VektraBot:', e.message);
      digitando.remove();
      // a falha só aparece na tela; não entra no histórico enviado à IA
      desenharDele(FALHA, true, false);
    }).then(function () {
      salvar();
      travar(false);
    });
  }

  /* ---------- janela ---------- */
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
        '<input id="botCampo" type="text" placeholder="Escreva sua dúvida" autocomplete="off" maxlength="1200">' +
        '<button type="submit" aria-label="Enviar">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>' +
        '</button>' +
      '</form>' +
      '<p class="bot-rodape">Respostas por IA, sem análise do seu caso. <a class="bot-direto" target="_blank" rel="noopener">Falar direto no WhatsApp</a></p>';

    document.body.appendChild(painel);

    lista = painel.querySelector('.bot-msgs');
    sugestoes = painel.querySelector('.bot-sugestoes');
    campo = painel.querySelector('input');
    enviarBtn = painel.querySelector('.bot-form button');

    SUGESTOES.forEach(function (s) {
      var b = el('button', '', s);
      b.type = 'button';
      b.addEventListener('click', function () { enviar(s); });
      sugestoes.appendChild(b);
    });

    // o link direto sempre leva o contexto mais recente
    var direto = painel.querySelector('.bot-direto');
    direto.href = V.link(textoWhats(false));
    direto.addEventListener('click', function () { direto.href = V.link(textoWhats(false)); });

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
    lista.appendChild(el('div', 'bot-msg dele', ABERTURA));
    conversa.forEach(function (m) {
      if (m.papel === 'visitante') desenharMinha(m.texto);
      else desenharDele(m.texto, m.encaminhar, m.urgente);
    });
    mostrarSugestoes();
    montado = true;
  }

  function abrir() {
    if (!montado) montar();
    if (V.fecharMenu) V.fecharMenu();
    painel.classList.add('aberto');
    document.documentElement.classList.add('bot-aberto');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar o VektraBot');
    rolarFim();
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

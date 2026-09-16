/* ============================================================
   VEKTRA - VEKTRABOT
   Chat do botão flutuante, em todas as páginas.

   Versão 4: só escolha, sem IA e sem API, custo zero.
   O que o bot sabe está em assets/js/vektrabot-base.js
   (carregado antes deste arquivo). Aqui fica só o "motor":
   entender a pergunta, escolher a resposta e desenhar o chat.

   O visitante escolhe a pergunta numa trilha que rola para o lado
   (não existe campo de digitar). "Outro assunto" coleta empresa,
   faturamento e funcionários e leva ao WhatsApp com esses dados.

   Ordem de decisão para cada pergunta escolhida:
   1. Assunto de ENCAMINHAR        -> especialista (cálculo, lucro,
                                      economia, contrato, urgência)
   2. Resposta pronta reconhecida  -> responde
   3. Nada reconhecido             -> especialista
   ============================================================ */
(function () {
  'use strict';

  var V = window.VEKTRA;
  var BASE = window.VEKTRABOT_BASE;
  var botao = document.getElementById('botFloat');
  if (!V || !BASE) return;

  /* Chaves que versões antigas do bot gravavam no navegador */
  var CHAVES_ANTIGAS = ['vektrabot-conversa', 'vektrabot-v3', 'vektrabot-v4'];
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
     CONVERSA
     Versão 4: o visitante só escolhe. Não existe campo de mensagem:
     as perguntas ficam numa trilha que rola para o lado, com setas.
     Quem não encontra a dúvida toca em "Outro assunto", responde
     três perguntas sobre a empresa e segue para o WhatsApp com
     esses dados já escritos na mensagem.
     ============================================================ */
  var OUTRO = BASE.outro;
  var conversa = [];      // { papel: 'visitante' | 'bot', texto, ... }
  var dados = {};         // Empresa, Faturamento, Funcionários
  var proximaTrilha = null;   // perguntas para retomar depois do formulário
  var ocupado = false;
  var montado = false;
  var painel, lista, trilha, sugestoes, passoBox, setaEsq, setaDir;

  /* Os três dados do formulário: empresa, faturamento e funcionários.
     Enquanto não estiverem completos, toda resposta termina pedindo eles,
     e só depois aparece o botão do WhatsApp (com tudo escrito na mensagem).
     A urgência é a exceção: ali o botão vem na hora, porque tem prazo. */
  function dadosCompletos() {
    // "Prefiro não informar" fica gravado como vazio: já foi perguntado,
    // não volta a ser perguntado e não entra na mensagem do WhatsApp.
    return OUTRO.passos.every(function (p) { return p.chave in dados; });
  }

  /* A conversa NÃO é guardada: ela vive só na memória desta página.
     Recarregar (F5) ou trocar de página começa do zero, sem sobra da
     visita anterior. Aqui também apagamos o que versões antigas do bot
     tinham deixado gravado no navegador. */
  function limparGravado() {
    try {
      CHAVES_ANTIGAS.forEach(function (k) {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      });
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
     da resposta nova. */
  var ancora = null;
  function rolarPara(bolha) {
    var topo = bolha.getBoundingClientRect().top - lista.getBoundingClientRect().top + lista.scrollTop;
    lista.scrollTop = Math.max(0, topo - 10);
  }
  function reposicionar() {
    if (ancora && ancora.isConnected) rolarPara(ancora);
    else rolarFim();
  }

  /* ---------- mensagem do WhatsApp ---------- */
  function ultimaDuvida() {
    for (var i = conversa.length - 1; i >= 0; i--) {
      var t = conversa[i];
      if (t.papel === 'visitante' && t.texto !== OUTRO.rotulo && !t.passo) return t.texto;
    }
    return '';
  }

  function textoWhats(pergunta, urgente) {
    var linhas = ['Olá! Vim pelo VektraBot do site da Vektra' + (urgente ? ' e o assunto tem prazo.' : '.')];
    ['Empresa', 'Faturamento', 'Funcionários'].forEach(function (k) {
      if (dados[k]) linhas.push(k + ': ' + dados[k]);
    });
    var duvida = pergunta && pergunta !== OUTRO.rotulo ? pergunta : ultimaDuvida();
    if (duvida) linhas.push('Minha dúvida: ' + duvida);
    return linhas.join('\n');
  }

  function linkWhats(pergunta, urgente) {
    var a = el('a', 'bot-link wa', urgente ? 'Falar agora com a equipe no WhatsApp' : 'Falar com um especialista no WhatsApp');
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = V.link(textoWhats(pergunta, urgente));
    // monta de novo no clique, para levar o que foi respondido depois
    a.addEventListener('click', function () { a.href = V.link(textoWhats(pergunta, urgente)); });
    return a;
  }

  /* ---------- mensagens ---------- */
  function desenharDele(m) {
    var bolha = el('div', 'bot-msg dele', m.texto);
    // Segurança: link só vira botão se for uma página deste site.
    if (m.link && /^[a-z0-9-]+\.html(#[a-z0-9-]+)?$/i.test(String(m.link.href))) {
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

  /* Tempo dos três pontinhos antes de cada mensagem.
     Proporcional ao tamanho do texto, porque mensagem longa precisa de
     um instante para o visitante perceber que vem coisa nova, e curta
     não deve fazer ninguém esperar. Nunca passa de 3 segundos. */
  function tempoDeDigitar(texto) {
    if (V.reduced) return 320;
    var t = 450 + String(texto || '').length * 12;
    return Math.min(3000, Math.max(650, t));
  }

  function falar(msg, depois) {
    ocupado = true;
    mostrarTrilha(false);
    var digitando = el('div', 'bot-msg dele bot-digitando');
    digitando.setAttribute('aria-label', 'VektraBot está escrevendo');
    digitando.innerHTML = '<i></i><i></i><i></i>';
    lista.appendChild(digitando);
    rolarFim();

    setTimeout(function () {
      digitando.remove();
      conversa.push(msg);
      ancora = desenharDele(msg);
      ocupado = false;
      if (depois) depois();
    }, tempoDeDigitar(msg.texto));
  }

  /* ---------- trilha de perguntas, com setas ---------- */
  function mostrarTrilha(sim) {
    trilha.hidden = !sim;
    if (sim) {
      passoBox.hidden = true;
      requestAnimationFrame(atualizarSetas);
    }
    reposicionar();
  }

  function atualizarSetas() {
    var maximo = sugestoes.scrollWidth - sugestoes.clientWidth - 2;
    /* O encaixe suave da rolagem para a trilha no respiro lateral, não em
       zero: o começo é "até o respiro", senão a seta da esquerda apareceria
       de saída, sem ter nada para trás. */
    var respiro = (parseFloat(getComputedStyle(sugestoes).paddingLeft) || 0) + 4;
    setaEsq.hidden = maximo <= 0 || sugestoes.scrollLeft <= respiro;
    setaDir.hidden = maximo <= 0 || sugestoes.scrollLeft >= maximo;
    trilha.classList.toggle('rola', maximo > 0);
  }

  function rolarLado(dir) {
    sugestoes.scrollBy({ left: dir * sugestoes.clientWidth * 0.85, behavior: V.reduced ? 'auto' : 'smooth' });
  }

  function botaoChip(texto, aoClicar) {
    var b = el('button', '', texto);
    b.type = 'button';
    b.addEventListener('click', function () { if (!ocupado) aoClicar(texto); });
    return b;
  }

  /* Perguntas sugeridas: primeiro as ligadas à última resposta,
     depois o catálogo inteiro, e "Outro assunto" por último. */
  function trocarSugestoes(seguir) {
    var vistas = {};
    var opcoes = [];
    (seguir || []).concat(BASE.catalogo).forEach(function (t) {
      if (t && !vistas[t]) { vistas[t] = true; opcoes.push(t); }
    });

    sugestoes.innerHTML = '';
    opcoes.forEach(function (t) { sugestoes.appendChild(botaoChip(t, escolher)); });
    var outro = botaoChip(OUTRO.rotulo, function () { iniciarOutro(); });
    outro.className = 'outro';
    sugestoes.appendChild(outro);

    sugestoes.scrollLeft = 0;
    mostrarTrilha(true);
  }

  /* ---------- pergunta escolhida ---------- */
  function escolher(pergunta) {
    var anterior = ultimaDuvida();
    ancora = null;
    conversa.push({ papel: 'visitante', texto: pergunta });
    desenharMinha(pergunta);

    var r = responder(pergunta, anterior);
    var completo = dadosCompletos();

    falar({
      papel: 'bot',
      texto: r.resposta,
      /* Sem os dados, o botão espera (quem tem prazo não espera).
         Com os dados na mão, toda resposta oferece o especialista:
         é o caminho que o visitante deve ter sempre à vista. */
      especialista: completo || !!r.urgente,
      urgente: r.urgente,
      link: r.link,
      pergunta: pergunta,
      seguir: r.seguir
    }, function () {
      if (completo) { trocarSugestoes(r.seguir); return; }
      proximaTrilha = r.seguir;
      falar({ papel: 'bot', texto: OUTRO.ponte }, function () { passo(0); });
    });
  }

  /* ---------- "Outro assunto": três perguntas e o WhatsApp ---------- */
  function iniciarOutro() {
    ancora = null;
    conversa.push({ papel: 'visitante', texto: OUTRO.rotulo });
    desenharMinha(OUTRO.rotulo);

    if (dadosCompletos()) {
      falar({ papel: 'bot', texto: OUTRO.jaTenho, especialista: true, pergunta: ultimaDuvida() },
            function () { trocarSugestoes(); });
      return;
    }
    proximaTrilha = null;
    falar({ papel: 'bot', texto: OUTRO.intro }, function () { passo(0); });
  }

  function passo(i) {
    if (i >= OUTRO.passos.length) {
      falar({
        papel: 'bot',
        texto: OUTRO.fim,
        especialista: true,
        pergunta: ultimaDuvida()
      }, function () { trocarSugestoes(proximaTrilha); proximaTrilha = null; });
      return;
    }

    var p = OUTRO.passos[i];
    falar({ papel: 'bot', texto: p.pergunta }, function () {
      if (p.tipo === 'texto') pedirTexto(p, i);
      else pedirEscolha(p, i);
    });
  }

  function guardar(p, valor, i) {
    conversa.push({ papel: 'visitante', texto: valor, passo: true });
    desenharMinha(valor);
    dados[p.chave] = valor.indexOf('Prefiro não informar') === -1 ? valor : '';
    passo(i + 1);
  }

  function pedirTexto(p, i) {
    trilha.hidden = true;
    passoBox.hidden = false;
    passoBox.innerHTML = '';

    var form = el('form', 'bot-passo-form');
    var rotulo = el('label', 'sr-only', p.marcador);
    rotulo.setAttribute('for', 'botPasso');
    var campo = el('input');
    campo.id = 'botPasso';
    campo.type = 'text';
    campo.placeholder = p.marcador;
    campo.maxLength = 80;
    campo.autocomplete = 'organization';
    var envia = el('button', '', p.botao || 'Continuar');
    envia.type = 'submit';

    form.appendChild(rotulo);
    form.appendChild(campo);
    form.appendChild(envia);
    passoBox.appendChild(form);
    reposicionar();
    if (window.matchMedia('(pointer: fine)').matches) campo.focus();

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = campo.value.trim();
      if (v.length < 2) { campo.focus(); return; }
      passoBox.hidden = true;
      passoBox.innerHTML = '';
      guardar(p, v, i);
    });
  }

  function pedirEscolha(p, i) {
    sugestoes.innerHTML = '';
    p.opcoes.forEach(function (o) {
      sugestoes.appendChild(botaoChip(o, function () { guardar(p, o, i); }));
    });
    sugestoes.scrollLeft = 0;
    mostrarTrilha(true);
  }

  /* ============================================================
     JANELA
     ============================================================ */
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
      '<div class="bot-trilha">' +
        '<button type="button" class="bot-seta esq" hidden aria-label="Ver as perguntas anteriores">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<div class="bot-sugestoes" role="group" aria-label="Perguntas frequentes"></div>' +
        '<button type="button" class="bot-seta dir" hidden aria-label="Ver mais perguntas">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="bot-passo" hidden></div>' +
      '<p class="bot-rodape">Respostas automáticas e gerais. Para o seu caso, fale com um especialista.</p>';

    document.body.appendChild(painel);

    lista = painel.querySelector('.bot-msgs');
    trilha = painel.querySelector('.bot-trilha');
    sugestoes = painel.querySelector('.bot-sugestoes');
    passoBox = painel.querySelector('.bot-passo');
    setaEsq = painel.querySelector('.bot-seta.esq');
    setaDir = painel.querySelector('.bot-seta.dir');

    setaEsq.addEventListener('click', function () { rolarLado(-1); });
    setaDir.addEventListener('click', function () { rolarLado(1); });
    sugestoes.addEventListener('scroll', atualizarSetas, { passive: true });
    window.addEventListener('resize', atualizarSetas, { passive: true });

    painel.querySelector('.bot-fechar').addEventListener('click', fechar);
    painel.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') fechar();
    });

    limparGravado();
    lista.appendChild(el('div', 'bot-msg dele', BASE.abertura));
    trocarSugestoes(null);
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
    requestAnimationFrame(atualizarSetas);
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

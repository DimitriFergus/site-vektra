/* ============================================================
   VEKTRA - PÁGINA INICIAL
   Contadores, ticker, conversa animada, toggle de escopo,
   FAQ, máscara de telefone e envio do formulário.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.VEKTRA.reduced;

  /* ============================================================
     CONTADORES ANIMADOS
     ============================================================ */
  function animarContador(el) {
    var alvo     = parseFloat(el.dataset.count);
    var decimais = parseInt(el.dataset.decimals || '0', 10);
    var sufixo   = el.dataset.suffix || '';
    var duracao  = 1500;
    var inicio   = null;

    function fmt(v) { return v.toFixed(decimais).replace('.', ','); }

    function quadro(ts) {
      if (!inicio) inicio = ts;
      var p = Math.min((ts - inicio) / duracao, 1);
      var suave = 1 - Math.pow(1 - p, 3);          // desacelera no fim
      el.textContent = fmt(alvo * suave) + sufixo;
      if (p < 1) requestAnimationFrame(quadro);
      else el.textContent = fmt(alvo) + sufixo;    // garante o valor exato
    }
    requestAnimationFrame(quadro);
  }

  var contadores = document.querySelectorAll('.count');

  if ('IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        animarContador(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    contadores.forEach(function (el) { cio.observe(el); });
  } else {
    contadores.forEach(function (el) {
      var d = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = parseFloat(el.dataset.count).toFixed(d).replace('.', ',') + (el.dataset.suffix || '');
    });
  }

  /* ============================================================
     TICKER
     A lista é duplicada porque o CSS anima até -50%,
     criando um loop sem emenda visível.
     ============================================================ */
  var termos = [
    'Lucro Presumido 8% / 12%', 'RET 4% · patrimônio de afetação', 'Custo por obra',
    'CPRB em transição', 'ISS no município da obra', 'CNO por obra', 'EFD-Reinf',
    'Retenção de 11%', 'Medição x resultado', 'Reforma tributária'
  ];
  var trilho = document.getElementById('marqueeTrack');
  if (trilho) {
    var html = termos.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    trilho.innerHTML = html + html;
  }

  /* ============================================================
     CONVERSA ANIMADA
     ============================================================ */
  var chat = document.getElementById('chat');

  var roteiro = [
    { side: 'out', t: 'Boa tarde. Entregamos 3 obras esse ano, o faturamento subiu, mas não sobra nada em caixa.', wait: 700 },
    { side: 'in',  t: 'Boa tarde. Isso acontece bastante quando todas as obras entram no mesmo resultado. Vocês separam o custo <b>por obra</b>?', wait: 1500 },
    { side: 'out', t: 'Não, vai tudo junto. A gente só olha o total do mês.', wait: 900 },
    { side: 'in',  t: 'Então a obra boa pode estar cobrindo o prejuízo da ruim, sem ninguém ver. E a presunção, vocês sabem qual usam?', wait: 1400 },
    { side: 'out', t: 'Acho que 32%. Isso é ruim?', wait: 800 },
    { side: 'in',  t: 'Depende do contrato. Empreitada com fornecimento dos materiais usa <b>8% de IRPJ e 12% de CSLL</b>; só mão de obra usa 32%.', wait: 1900 },
    { side: 'out', t: 'E como eu descubro qual é o meu caso?', wait: 800 },
    { side: 'in',  t: 'Numa conversa de 20 minutos sobre uma obra sua, olhando o contrato. <b>Sem custo e sem trocar de contador.</b>', wait: 1700 }
  ];

  if (chat) {
    var i = 0;
    var timers = [];

    function limparTimers() { timers.forEach(clearTimeout); timers = []; }
    function rolar() { chat.scrollTop = chat.scrollHeight; }

    function hora(indice) {
      var d = new Date(Date.now() - (roteiro.length - indice) * 60000);
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function balao(m, indice) {
      var b = document.createElement('div');
      b.className = 'msg ' + m.side;
      b.innerHTML = m.t + '<time>' + hora(indice) + (m.side === 'out' ? ' ✓✓' : '') + '</time>';
      chat.appendChild(b);
      rolar();
    }

    function mostrarDigitando() {
      var el = document.createElement('div');
      el.className = 'typing';
      el.id = 'typingEl';
      el.innerHTML = '<i></i><i></i><i></i>';
      chat.appendChild(el);
      rolar();
    }
    function esconderDigitando() {
      var el = document.getElementById('typingEl');
      if (el) el.remove();
    }

    function proxima() {
      // Fim do roteiro: espera e recomeça
      if (i >= roteiro.length) {
        timers.push(setTimeout(function () {
          chat.innerHTML = '';
          i = 0;
          timers.push(setTimeout(proxima, 600));
        }, 6000));
        return;
      }

      var m = roteiro[i];

      if (m.side === 'in') {
        mostrarDigitando();
        timers.push(setTimeout(function () {
          esconderDigitando();
          balao(m, i);
          i++;
          timers.push(setTimeout(proxima, m.wait));
        }, 1100));
      } else {
        balao(m, i);
        i++;
        timers.push(setTimeout(proxima, m.wait));
      }
    }

    if (reduced) {
      roteiro.forEach(function (m, idx) { balao(m, idx); });
    } else if ('IntersectionObserver' in window) {
      // Só roda enquanto visível, não gasta quadro fora da tela
      var chatIO = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            if (!chat.dataset.started) { chat.dataset.started = '1'; proxima(); }
          } else {
            limparTimers();
            delete chat.dataset.started;
            chat.innerHTML = '';
            i = 0;
          }
        });
      }, { threshold: 0.25 });
      chatIO.observe(chat);
    } else {
      proxima();
    }
  }

  /* ============================================================
     TOGGLE DE ESCOPO (Construtora / Incorporadora)
     ============================================================ */
  var escopos = {
    construtora: {
      sub: 'Análise de uma obra, com contrato, orçamento e notas. A devolutiva traz até três pontos que merecem decisão, cada um com o documento que sustenta.',
      itens: [
        'Leitura do contrato: natureza da empreitada e presunção',
        'Custo da obra separado do custo administrativo',
        'Retenção de 11% e recolhimento vinculado ao CNO',
        'ISS no município da obra e retenção pelo tomador',
        'Medição, faturamento e resultado da obra'
      ]
    },
    incorporadora: {
      sub: 'Análise de um empreendimento: estrutura, regime e o momento certo de cada decisão, antes que a comercialização feche as portas.',
      itens: [
        'Patrimônio de afetação e RET por empreendimento',
        'Janela de 2029 da transição da reforma para incorporações afetadas',
        'Permuta de terreno antes de assinar',
        'CNO, encerramento e certidão para averbação',
        'Receita reconhecida pelo avanço da obra'
      ]
    }
  };

  var seg = document.getElementById('seg');

  if (seg) {
    var pill    = document.getElementById('segPill');
    var segSub  = document.getElementById('segSub');
    var segList = document.getElementById('segList');
    var botoes  = seg.querySelectorAll('button');

    var CHECK = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
                '<path d="M2.5 8.5l3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2.2" ' +
                'stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function renderEscopo(chave) {
      var d = escopos[chave];
      segSub.textContent = d.sub;
      segList.innerHTML = d.itens.map(function (t) {
        return '<li>' + CHECK + t + '</li>';
      }).join('');

      segList.style.opacity = 0;
      requestAnimationFrame(function () {
        segList.style.transition = 'opacity .4s ease';
        segList.style.opacity = 1;
      });
    }

    botoes.forEach(function (b, indice) {
      b.addEventListener('click', function () {
        botoes.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        b.setAttribute('aria-selected', 'true');
        pill.style.transform = 'translateX(' + (indice * 100) + '%)';
        renderEscopo(b.dataset.seg);
      });
    });

    renderEscopo('construtora');
  }

  /* ============================================================
     NÚMEROS QUE CONTAM ATÉ O NOVO VALOR
     Os dois painéis usam isto quando a pessoa troca de aba, para
     que a mudança apareça em vez de simplesmente pular.
     ============================================================ */
  function moeda(v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); }

  function animarNum(el, para, molde) {
    var de = typeof el._v === 'number' ? el._v : para;
    el._v = para;

    if (reduced || de === para) { el.innerHTML = molde(para); return; }
    if (el._raf) cancelAnimationFrame(el._raf);

    var duracao = 600, inicio = null;

    function quadro(ts) {
      if (!inicio) inicio = ts;
      var p = Math.min((ts - inicio) / duracao, 1);
      var suave = 1 - Math.pow(1 - p, 3);
      el.innerHTML = molde(de + (para - de) * suave);
      if (p < 1) { el._raf = requestAnimationFrame(quadro); }
      else { el._raf = null; el.innerHTML = molde(para); }
    }
    el._raf = requestAnimationFrame(quadro);
  }

  function pct(v)   { return v.toFixed(1).replace('.', ',') + '%'; }

  /* Liga os botões de um seletor de abas dos mockups.
     Devolve a função de seleção, para outros elementos (as próprias
     faixas do comparativo) poderem acionar a mesma troca. */
  function marcarAbas(caixa, dado, render) {
    var botoes = caixa.querySelectorAll('button');

    function selecionar(chave) {
      botoes.forEach(function (x) {
        var meu = x.dataset[dado] === chave;
        x.classList.toggle('on', meu);
        x.setAttribute('aria-pressed', meu ? 'true' : 'false');
      });
      render(chave);
    }

    botoes.forEach(function (b) {
      b.addEventListener('click', function () { selecionar(b.dataset[dado]); });
    });

    return selecionar;
  }

  /* ============================================================
     PAINEL DE MARGEM POR OBRA (mockup 1)
     Três períodos de um painel ilustrativo. Os números são de
     exemplo e não representam resultado de cliente.
     ============================================================ */
  var periodos = {
    mes: { label: 'Margem consolidada · 1 mês',    margem: 11.2, pill: '▲ 1,4 p.p. vs. anterior',
           barras: [38, 52, 26, 61, 44, 55] },
    sem: { label: 'Margem consolidada · 6 meses',  margem: 14.6, pill: '▲ 3,8 p.p. vs. anterior',
           barras: [44, 63, 30, 76, 53, 68] },
    ano: { label: 'Margem consolidada · 12 meses', margem: 17.4, pill: '▲ 6,1 p.p. vs. anterior',
           barras: [46, 71, 34, 88, 60, 78] }
  };

  var m1Tabs = document.getElementById('m1Tabs');

  if (m1Tabs) {
    var m1Label   = document.getElementById('m1Label');
    var m1Val     = document.getElementById('m1Val');
    var m1Pill    = document.getElementById('m1Pill');
    var m1Barras  = document.querySelectorAll('#m1Bars .bar i');

    /* Valores que já estão no HTML, para a primeira animação partir deles */
    var base = periodos.mes;
    m1Val._v   = base.margem;

    var renderPeriodo = function (chave) {
      var d = periodos[chave];

      m1Label.textContent = d.label;
      m1Pill.textContent  = d.pill;

      animarNum(m1Val,   d.margem,      pct);

      m1Barras.forEach(function (barra, i) { barra.style.height = d.barras[i] + '%'; });

    };

    marcarAbas(m1Tabs, 'per', renderPeriodo);
  }

  /* ============================================================
     COMPARATIVO TRIBUTÁRIO (mockup 2)
     A pessoa clica no regime e o painel inteiro recalcula: imposto
     do mês, faixa destacada e o resultado em 12 meses.
     ============================================================ */
  var regimes = {
    p32:  { nome: 'Imposto no Presumido 32%',   mes: 41800, badge: 'exemplo', neutro: true,
            saidaLabel: 'Custo em 12 meses no exemplo',    saida: 501600, saidaNeutra: true },
    p812: { nome: 'Imposto no Presumido 8/12%', mes: 25900, badge: 'menor no exemplo', neutro: false,
            saidaLabel: 'Diferença em 12 meses no exemplo', saida: 190800, saidaNeutra: false },
    ret:  { nome: 'Imposto no RET 4%',          mes: 12100, badge: 'menor no exemplo',  neutro: false,
            saidaLabel: 'Diferença em 12 meses no exemplo', saida: 356400, saidaNeutra: false }
  };

  var m2Tabs = document.getElementById('m2Tabs');

  if (m2Tabs) {
    var m2Nome   = document.getElementById('m2Nome');
    var m2Mes    = document.getElementById('m2Mes');
    var m2Badge  = document.getElementById('m2Badge');
    var m2Label  = document.getElementById('m2Label');
    var m2Val    = document.getElementById('m2Val');
    var m2Linhas = document.querySelectorAll('.m2-line');

    m2Mes._v = regimes.p32.mes;
    m2Val._v = regimes.p32.saida;

    var porMes = function (v) { return moeda(v) + '<small>/mês</small>'; };

    var renderRegime = function (chave) {
      var d = regimes[chave];

      m2Nome.textContent  = d.nome;
      m2Label.textContent = d.saidaLabel;
      m2Badge.textContent = d.badge;
      m2Badge.classList.toggle('neutro', d.neutro);
      m2Val.classList.toggle('flat', d.saidaNeutra);

      animarNum(m2Mes, d.mes,   porMes);
      animarNum(m2Val, d.saida, moeda);

      m2Linhas.forEach(function (linha) {
        var meu = linha.dataset.reg === chave;
        linha.classList.toggle('on', meu);
        linha.setAttribute('aria-pressed', meu ? 'true' : 'false');
      });
    };

    var escolherRegime = marcarAbas(m2Tabs, 'reg', renderRegime);

    /* A faixa inteira também troca o regime, não só a aba de cima */
    m2Linhas.forEach(function (linha) {
      linha.addEventListener('click', function () { escolherRegime(linha.dataset.reg); });
      linha.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          escolherRegime(linha.dataset.reg);
        }
      });
    });
  }
})();

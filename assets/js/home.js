/* ============================================================
   VEKTRA — PÁGINA INICIAL
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
    'CPRB x folha', 'ISS retido na fonte', 'CNO regularizado', 'EFD-Reinf',
    'Recuperação de créditos', 'Margem por etapa', 'Defesa em autuação'
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
    { side: 'out', t: 'Boa tarde! Entregamos 3 obras esse ano, o faturamento subiu quase 40%… mas não sobra nada em caixa.', wait: 700 },
    { side: 'in',  t: 'Boa tarde, Ricardo. Esse é o cenário mais comum aqui. Vocês apuram o custo <b>por obra</b> ou tudo entra no mesmo resultado?', wait: 1500 },
    { side: 'out', t: 'Tudo junto, sinceramente. A gente só olha o total do mês.', wait: 900 },
    { side: 'in',  t: 'Entendi. E hoje vocês estão no Lucro Presumido com presunção de 32%?', wait: 1400 },
    { side: 'out', t: 'Acho que sim. Isso é ruim?', wait: 800 },
    { side: 'in',  t: 'Em empreitada com material aplicado, a presunção pode cair para <b>8% de IRPJ e 12% de CSLL</b>. Só essa mudança já reduz bastante a conta.', wait: 1900 },
    { side: 'out', t: 'Sério que isso muda tanto assim?', wait: 800 },
    { side: 'in',  t: 'Me envia as 3 últimas apurações que eu te mostro o número exato da sua operação. <b>A análise é gratuita.</b>', wait: 1700 }
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
      // Só roda enquanto visível — não gasta quadro fora da tela
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
      sub: 'Análise completa dos últimos 12 meses de apuração, relatório de oportunidades e proposta de honorários só depois — se fizer sentido para os dois lados.',
      itens: [
        'Revisão do regime e da presunção aplicada por tipo de contrato',
        'Levantamento de INSS de obra e ISS retido a maior',
        'Estrutura de centro de custo por obra e por etapa',
        'Diagnóstico de CNO, eSocial e EFD-Reinf',
        'Simulação CPRB x folha para as próximas obras'
      ]
    },
    incorporadora: {
      sub: 'Análise focada em empreendimentos: viabilidade tributária por torre, patrimônio de afetação e apuração de resultado por unidade vendida.',
      itens: [
        'Avaliação de enquadramento no RET (4%) por empreendimento',
        'Estudo de patrimônio de afetação e SPE por torre',
        'Apuração de resultado por unidade e por VGV',
        'Tratamento de permuta, distrato e receita de longo prazo',
        'Adequação para financiamento e auditoria de banco'
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
     FAQ (accordion — um aberto por vez)
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');

    btn.addEventListener('click', function () {
      var jaAberto = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (!jaAberto) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ============================================================
     FORMULÁRIO
     ============================================================ */
  var form = document.getElementById('leadForm');
  if (!form) return;

  var status = document.getElementById('formStatus');
  var whats  = document.getElementById('f-whats');

  /* --- Máscara (11) 91234-5678 --- */
  whats.addEventListener('input', function () {
    var v = whats.value.replace(/\D/g, '').slice(0, 11);

    if (v.length > 6) {
      var corte = v.length > 10 ? 7 : 6;           // celular tem 9 dígitos, fixo 8
      whats.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, corte) + '-' + v.slice(corte);
    } else if (v.length > 2) {
      whats.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    } else if (v.length > 0) {
      whats.value = '(' + v;
    } else {
      whats.value = '';
    }
  });

  function marcarErro(el, tem) { el.closest('.field').classList.toggle('err', tem); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    var nome = form.nome, tel = form.whatsapp, emp = form.empresa,
        fat  = form.faturamento, reg = form.regime, obr = form.obras,
        lgpd = document.getElementById('f-lgpd');

    var ok = true;

    [[nome, nome.value.trim().length < 2],
     [tel,  tel.value.replace(/\D/g, '').length < 10],
     [emp,  emp.value.trim().length < 2],
     [fat,  !fat.value],
     [reg,  !reg.value],
     [obr,  !obr.value]].forEach(function (par) {
      marcarErro(par[0], par[1]);
      if (par[1]) ok = false;
    });

    if (!lgpd.checked) {
      ok = false;
      status.classList.remove('ok');
      status.textContent = 'É necessário autorizar o contato para continuar.';
    }

    if (!ok) {
      if (lgpd.checked) {
        status.classList.remove('ok');
        status.textContent = 'Confira os campos destacados e tente novamente.';
      }
      var primeiroErro = form.querySelector('.field.err input, .field.err select');
      if (primeiroErro) primeiroErro.focus();
      return;
    }

    var perfil = seg
      ? seg.querySelector('button[aria-selected="true"]').textContent.trim()
      : 'Construtora';

    var msg =
      'Olá, Vektra! Quero a análise gratuita.\n\n' +
      '• Nome: ' + nome.value.trim() + '\n' +
      '• Empresa: ' + emp.value.trim() + '\n' +
      '• Perfil: ' + perfil + '\n' +
      '• WhatsApp: ' + tel.value.trim() + '\n' +
      '• Faturamento anual: ' + fat.value + '\n' +
      '• Regime atual: ' + reg.value + '\n' +
      '• Obras ativas: ' + obr.value;

    status.classList.add('ok');
    status.textContent = 'Tudo certo, ' + nome.value.trim().split(' ')[0] + '! Abrindo o WhatsApp…';

    window.open(window.VEKTRA.link(msg), '_blank', 'noopener');
  });
})();

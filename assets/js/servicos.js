/* ============================================================
   VEKTRA — PÁGINA DE SERVIÇOS
   Modal dos vídeos e simulador de carga tributária.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     MODAL DE VÍDEO

     Para publicar um vídeo, preencha o data-src do botão .play
     no HTML. O modal reconhece sozinho:
       - link de embed  -> <iframe>   (YouTube, Vimeo)
       - arquivo .mp4   -> <video>
     Enquanto data-src estiver vazio, mostra o painel
     "gravação em produção" com o CTA de WhatsApp.
     ============================================================ */
  var modal = document.getElementById('vmodal');

  if (modal) {
    var palco   = document.getElementById('vmStage');
    var vmTag   = document.getElementById('vmTag');
    var vmTitle = document.getElementById('vmTitle');
    var vmDesc  = document.getElementById('vmDesc');
    var ultimoFoco = null;

    var PAINEL_EM_BREVE =
      '<div class="soon-panel">' +
        '<span class="rec" aria-hidden="true">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">' +
            '<path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
            '<rect x="1" y="5" width="15" height="14" rx="2.5" stroke="currentColor" stroke-width="2"/>' +
          '</svg>' +
        '</span>' +
        '<b>Gravação em produção</b>' +
        '<span>Este episódio ainda está sendo gravado. Enquanto isso, você pode tirar exatamente ' +
        'essa dúvida com um especialista — sem custo e sem compromisso.</span>' +
      '</div>';

    function abrirModal(btn) {
      ultimoFoco = btn;

      vmTag.textContent   = btn.dataset.tag   || 'Vídeo';
      vmTitle.textContent = btn.dataset.title || '';
      vmDesc.textContent  = btn.dataset.desc  || '';

      var src = (btn.dataset.src || '').trim();

      if (!src) {
        palco.innerHTML = PAINEL_EM_BREVE;
      } else if (/\.(mp4|webm)$/i.test(src)) {
        palco.innerHTML = '<video src="' + src + '" controls autoplay playsinline></video>';
      } else {
        palco.innerHTML = '<iframe src="' + src + '" title="' + (btn.dataset.title || '') + '" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" ' +
          'allowfullscreen></iframe>';
      }

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('locked');
      modal.querySelector('.modal-close').focus();
    }

    function fecharModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('locked');

      // Esvazia depois da transição — para o vídeo e libera memória
      setTimeout(function () { palco.innerHTML = ''; }, 320);

      if (ultimoFoco) ultimoFoco.focus();
    }

    document.querySelectorAll('[data-video]').forEach(function (btn) {
      btn.addEventListener('click', function () { abrirModal(btn); });
    });

    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        // Links (ex.: "Abrir o simulador") só fecham e deixam navegar
        if (el.getAttribute('href')) { fecharModal(); return; }
        ev.preventDefault();
        fecharModal();
      });
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && modal.classList.contains('open')) fecharModal();
    });
  }

  /* ============================================================
     SIMULADOR DE CARGA TRIBUTÁRIA

     Estimativa simplificada: IRPJ, adicional de IRPJ, CSLL,
     PIS e COFINS sobre a receita. Não inclui INSS nem ISS.
     ============================================================ */
  var fat = document.getElementById('fat');
  if (!fat) return;

  var mat     = document.getElementById('mat');
  var tipo    = document.getElementById('tipo');
  var vFat    = document.getElementById('vFat');
  var vMat    = document.getElementById('vMat');
  var simEco  = document.getElementById('simEco');
  var simSide = document.getElementById('simSide');
  var simCta  = document.getElementById('simCta');
  var d812    = document.getElementById('d812');
  var dret    = document.getElementById('dret');

  /* Material mínimo na nota para caracterizar empreitada com
     emprego de materiais e habilitar a presunção reduzida. */
  var MATERIAL_MINIMO = 15;

  function brl(v) {
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  /* Pinta a trilha do slider até a posição atual */
  function pintarTrilha(el) {
    var p = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.background = 'linear-gradient(90deg, var(--clay) ' + p + '%, var(--line) ' + p + '%)';
  }

  /* IRPJ 15% + adicional de 10% sobre o que passa de R$ 20 mil
     de base mensal; CSLL 9%; PIS 0,65% + COFINS 3% sobre a receita. */
  function presumido(receita, presuncaoIR, presuncaoCS) {
    var baseIR = receita * presuncaoIR;
    var baseCS = receita * presuncaoCS;

    var irpj = baseIR * 0.15 + Math.max(0, baseIR - 20000) * 0.10;
    var csll = baseCS * 0.09;
    var pisCofins = receita * 0.0365;

    return irpj + csll + pisCofins;
  }

  function calcular() {
    var R = parseFloat(fat.value);
    var M = parseFloat(mat.value);
    var T = tipo.value;

    vFat.textContent = brl(R);
    vMat.textContent = M + '%';
    pintarTrilha(fat);
    pintarTrilha(mat);

    var podeReduzida = (T === 'empreitada' || T === 'incorporacao') && M >= MATERIAL_MINIMO;
    var podeRet = (T === 'incorporacao');

    d812.textContent = podeReduzida
      ? 'Habilitado: há material aplicado no contrato'
      : (T === 'maodeobra'
          ? 'Indisponível: contrato só de mão de obra'
          : 'Indisponível: material abaixo de ' + MATERIAL_MINIMO + '% da nota');

    dret.textContent = podeRet
      ? 'Habilitado: incorporação com patrimônio de afetação'
      : 'Indisponível: exige incorporação imobiliária';

    var cenarios = [
      { id: 'row-p32',  on: true,         v: presumido(R, 0.32, 0.32) },
      { id: 'row-p812', on: podeReduzida, v: presumido(R, 0.08, 0.12) },
      { id: 'row-ret',  on: podeRet,      v: R * 0.04 }
    ];

    var ativos = cenarios.filter(function (c) { return c.on; });

    // A barra usa o maior valor geral como escala, inclusive dos
    // cenários indisponíveis — assim a comparação visual não pula.
    var escala = Math.max.apply(null, cenarios.map(function (c) { return c.v; }));
    var melhor = Math.min.apply(null, ativos.map(function (c) { return c.v; }));
    var pior   = Math.max.apply(null, ativos.map(function (c) { return c.v; }));

    cenarios.forEach(function (c) {
      var linha = document.getElementById(c.id);
      linha.classList.toggle('off', !c.on);
      linha.classList.toggle('best', c.on && c.v === melhor && ativos.length > 1);

      linha.querySelector('[data-v]').textContent = brl(c.v) + '/mês';
      linha.querySelector('[data-r]').textContent =
        (c.v / R * 100).toFixed(1).replace('.', ',') + '% da receita';
      linha.querySelector('.sim-bar i').style.width = (c.v / escala * 100).toFixed(1) + '%';
    });

    var economia = (pior - melhor) * 12;
    simEco.textContent = brl(economia);
    simSide.textContent = ativos.length > 1
      ? 'entre o cenário mais caro e o mais barato disponível para esta operação'
      : 'nesta configuração só o Presumido cheio está disponível — o ganho vem de outras frentes';

    /* O CTA leva a simulação inteira pronta para o WhatsApp */
    var msg =
      'Olá, Vektra! Simulei na página de serviços e quero o cálculo exato.\n\n' +
      '• Faturamento mensal: ' + brl(R) + '\n' +
      '• Material aplicado: ' + M + '%\n' +
      '• Tipo de operação: ' + tipo.options[tipo.selectedIndex].text + '\n' +
      '• Melhor cenário na simulação: ' + brl(melhor) + '/mês\n' +
      '• Diferença estimada em 12 meses: ' + brl(economia);

    simCta.setAttribute('href', window.VEKTRA.link(msg));
    simCta.setAttribute('target', '_blank');
    simCta.setAttribute('rel', 'noopener');
  }

  [fat, mat].forEach(function (el) { el.addEventListener('input', calcular); });
  tipo.addEventListener('change', calcular);
  calcular();
})();

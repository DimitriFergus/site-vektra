/* ============================================================
   VEKTRA - PÁGINA DE DÚVIDAS
   Busca por texto e filtro por tema. A abertura de cada
   pergunta é do core.js, igual à home.
   ============================================================ */
(function () {
  'use strict';

  var campo    = document.getElementById('buscaDuvida');
  var filtros  = document.querySelectorAll('.filtros button');
  var grupos   = document.querySelectorAll('.faq-grupo');
  var vazio    = document.getElementById('semResultado');
  var termoTxt = document.getElementById('termoBusca');
  if (!campo || !grupos.length) return;

  var temaAtual = 'todas';

  function normalizar(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function aplicar() {
    var termo = normalizar(campo.value.trim());
    var total = 0;

    grupos.forEach(function (g) {
      var noTema = temaAtual === 'todas' || g.dataset.grupo === temaAtual;
      var visiveis = 0;

      g.querySelectorAll('.faq-item').forEach(function (item) {
        var bate = noTema && (!termo || normalizar(item.textContent).indexOf(termo) !== -1);
        item.hidden = !bate;
        if (bate) visiveis++;
      });

      g.hidden = visiveis === 0;
      total += visiveis;
    });

    vazio.hidden = total > 0;
    if (termoTxt) termoTxt.textContent = campo.value.trim() || 'esse filtro';
  }

  campo.addEventListener('input', aplicar);

  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      temaAtual = b.dataset.filtro;
      filtros.forEach(function (o) {
        var on = o === b;
        o.classList.toggle('on', on);
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      aplicar();
    });
  });
})();

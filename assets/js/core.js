/* ============================================================
   VEKTRA - NÚCLEO
   Comportamentos presentes nas duas páginas: links de WhatsApp,
   barra de navegação, menu mobile, reveal ao rolar, botões
   magnéticos, rolagem suave e o ano do rodapé.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.VEKTRA ? window.VEKTRA.reduced : false;

  /* ------------------------------------------------------------
     Links de WhatsApp
     Qualquer elemento com [data-wa] vira um link para o número
     de config.js. Se o atributo tiver texto, ele vira a mensagem.
     A página pode definir um padrão em <body data-wa-msg="...">
  ------------------------------------------------------------ */
  var msgDaPagina = document.body.getAttribute('data-wa-msg');

  document.querySelectorAll('[data-wa]').forEach(function (el) {
    var custom = el.getAttribute('data-wa');
    el.setAttribute('href', window.VEKTRA.link(custom || msgDaPagina));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ------------------------------------------------------------
     Ano corrente no rodapé
  ------------------------------------------------------------ */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------
     Rolagem: fundo da nav, esconder/mostrar a nav e a posição
     das manchas do fundo.

     Tudo num handler só, agendado por requestAnimationFrame para
     não recalcular a cada pixel rolado.
  ------------------------------------------------------------ */
  var nav = document.getElementById('nav');
  var raiz = document.documentElement;
  var aguardando = false;
  var ultimoY = window.scrollY;

  /* Só some depois de passar dessa altura, para o cabeçalho não
     piscar em rolagens curtas perto do topo. */
  var LIMITE_OCULTAR = 240;
  var MINIMO_GESTO = 6;        // ignora tremidas de trackpad

  function aoRolar() {
    if (aguardando) return;
    aguardando = true;

    window.requestAnimationFrame(function () {
      var y = window.scrollY;
      var alcance = raiz.scrollHeight - window.innerHeight;

      /* --sp vai de 0 no topo a 1 no fim: o CSS usa para deslocar
         as manchas de cor do fundo. */
      raiz.style.setProperty('--sp', alcance > 0 ? (y / alcance).toFixed(4) : '0');

      if (nav) {
        nav.classList.toggle('scrolled', y > 24);

        var delta = y - ultimoY;
        var menuAberto = menu && menu.classList.contains('open');

        if (Math.abs(delta) > MINIMO_GESTO && !menuAberto) {
          // desceu e já passou do limite: esconde. subiu: mostra.
          nav.classList.toggle('oculta', delta > 0 && y > LIMITE_OCULTAR);
        }
        if (y <= LIMITE_OCULTAR) nav.classList.remove('oculta');
      }

      ultimoY = y;
      aguardando = false;
    });
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar, { passive: true });
  aoRolar();

  /* ------------------------------------------------------------
     Menu mobile
  ------------------------------------------------------------ */
  var burger = document.getElementById('burger');
  var menu   = document.getElementById('mobileMenu');

  function fecharMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var aberto = menu.classList.toggle('open');
      burger.classList.toggle('open', aberto);
      // o painel abre logo abaixo da nav, então ela precisa estar à vista
      if (aberto && nav) nav.classList.remove('oculta');
      burger.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', fecharMenu);
    });
  }

  /* ------------------------------------------------------------
     Reveal ao rolar
     O atraso em cascata vem do inline style --d de cada elemento.
  ------------------------------------------------------------ */
  var alvos = document.querySelectorAll('.reveal, .step, #timeline');

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);          // anima uma vez só
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    alvos.forEach(function (el) { io.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('in'); });
  }

  /* ------------------------------------------------------------
     Botões magnéticos
     Só com mouse de verdade, em toque não faz sentido.
  ------------------------------------------------------------ */
  if (window.matchMedia('(pointer: fine)').matches && !reduced) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var raf = null, tx = 0, ty = 0;

      function aplicar() {
        btn.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
        raf = null;
      }
      btn.addEventListener('mousemove', function (ev) {
        var r = btn.getBoundingClientRect();
        tx = ((ev.clientX - r.left) / r.width  - 0.5) * 14;
        ty = ((ev.clientY - r.top)  / r.height - 0.5) * 12;
        if (!raf) raf = requestAnimationFrame(aplicar);
      });
      btn.addEventListener('mouseleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(aplicar);
      });
    });
  }

  /* ------------------------------------------------------------
     Rolagem suave com desconto da nav fixa
     Só intercepta âncoras internas (#...); links para outras
     páginas seguem o comportamento normal do navegador.
  ------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;

      var alvo = document.querySelector(id);
      if (!alvo) return;

      ev.preventDefault();
      fecharMenu();

      var altura = nav ? nav.offsetHeight : 0;
      var topo = alvo.getBoundingClientRect().top + window.pageYOffset - (altura + 14);
      window.scrollTo({ top: topo, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* Deixa disponível para os scripts de página */
  window.VEKTRA.fecharMenu = fecharMenu;
})();

/* ============================================================
   VEKTRA — NÚCLEO
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
     Barra de navegação: fundo ao rolar
     Usa requestAnimationFrame para não disparar a cada pixel.
  ------------------------------------------------------------ */
  var nav = document.getElementById('nav');
  var aguardando = false;

  function aoRolar() {
    if (aguardando) return;
    aguardando = true;
    window.requestAnimationFrame(function () {
      nav.classList.toggle('scrolled', window.scrollY > 24);
      aguardando = false;
    });
  }
  if (nav) {
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();
  }

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
     Só com mouse de verdade — em toque não faz sentido.
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

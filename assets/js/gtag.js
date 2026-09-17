/* ============================================================
   VEKTRA - GOOGLE ADS (gtag.js)
   Conta AW-18455568117.

   A biblioteca do Google é carregada no <head> de cada página, direto
   do googletagmanager.com. Este arquivo existe porque a política de
   segurança do site (CSP) não permite script escrito dentro do HTML:
   a configuração que o Google entrega em <script> inline mora aqui.
   ============================================================ */
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag('js', new Date());
gtag('config', 'AW-18455568117');

/* ------------------------------------------------------------
   Clique no WhatsApp
   Todo contato do site sai por um link wa.me (botões, bot, rodapé).
   Aqui isso vira um evento, para o anúncio saber o que gerou contato.

   PARA VIRAR CONVERSÃO DE VERDADE: no Google Ads, em
   Ferramentas > Conversões, crie a ação de conversão e copie o
   identificador que ela gera (algo como AW-18455568117/AbC-D_efG).
   Depois troque a linha do evento por:

     gtag('event', 'conversion', { send_to: 'AW-18455568117/SEU_ROTULO' });
------------------------------------------------------------ */
document.addEventListener('click', function (ev) {
  var alvo = ev.target && ev.target.closest ? ev.target.closest('a[href*="wa.me"]') : null;
  if (!alvo) return;
  gtag('event', 'clique_whatsapp', { pagina: window.location.pathname });
}, true);

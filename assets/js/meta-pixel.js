/* ============================================================
   VEKTRA - META PIXEL (Facebook/Instagram Ads)
   Pixel 1094074556576943.

   Mesmo motivo do gtag.js: a política de segurança do site (CSP)
   não permite script escrito dentro do HTML, então o código que o
   Meta entrega em <script> inline mora aqui.

   Eventos enviados:
   - PageView: toda página aberta.
   - Cadastro no Formulário: evento padrão "Lead" + evento
     personalizado "CadastroFormulario". Disparado em form.js,
     só quando o formulário passa na validação.
   - Lead no WhatsApp (VektraBot): evento padrão "Contact" +
     evento personalizado "LeadWhatsAppVektraBot". Disparado aqui,
     no clique do botão de WhatsApp dentro do VektraBot.
   Nenhum dado pessoal (nome, telefone, CNPJ) é enviado ao Meta.
   ============================================================ */
!function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
  if (!f._fbq) f._fbq = n;
  n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
  t = b.createElement(e); t.async = !0; t.src = v;
  s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
}(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1094074556576943');
fbq('track', 'PageView');

/* Função única para os outros arquivos registrarem conversões */
window.VEKTRA_META = {
  cadastroFormulario: function (dados) {
    var extra = { content_name: 'Formulário de diagnóstico', pagina: location.pathname };
    for (var k in (dados || {})) extra[k] = dados[k];
    fbq('track', 'Lead', extra);
    fbq('trackCustom', 'CadastroFormulario', extra);
  },
  leadWhatsAppBot: function () {
    var extra = { content_name: 'VektraBot', pagina: location.pathname };
    fbq('track', 'Contact', extra);
    fbq('trackCustom', 'LeadWhatsAppVektraBot', extra);
  }
};

/* Clique no botão de WhatsApp do VektraBot (os botões são criados
   pelo bot depois que a página abre, por isso a escuta é no documento) */
document.addEventListener('click', function (ev) {
  var alvo = ev.target && ev.target.closest ? ev.target.closest('a.bot-link.wa') : null;
  if (alvo) window.VEKTRA_META.leadWhatsAppBot();
}, true);

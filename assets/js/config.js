/* ============================================================
   VEKTRA — CONFIGURAÇÃO

   >>> É AQUI QUE VOCÊ TROCA O NÚMERO DO WHATSAPP. <<<
   Um lugar só, valendo para as duas páginas e para todos os
   botões, formulários e o simulador.
   ============================================================ */
window.VEKTRA = {

  /* Número no formato internacional, só dígitos:
     55 (Brasil) + DDD + número.
     O valor abaixo é FICTÍCIO — substitua pelo oficial. */
  whatsapp: '5511987654321',

  /* Mensagem usada quando o link não traz uma própria.
     Cada página pode sobrescrever com <body data-wa-msg="..."> */
  msgPadrao: 'Olá! Vim pelo site da Vektra e quero a análise gratuita da minha construtora.',

  /* E-mail exibido no rodapé (mantenha igual ao do HTML) */
  email: 'contato@vektracontabil.com.br',

  /* Monta o link do WhatsApp já com a mensagem codificada */
  link: function (texto) {
    var msg = (texto && String(texto).trim()) || this.msgPadrao;
    return 'https://wa.me/' + this.whatsapp + '?text=' + encodeURIComponent(msg);
  },

  /* Respeita quem pediu menos animação no sistema operacional */
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

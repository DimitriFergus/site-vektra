/* ============================================================
   VEKTRA - INICIALIZAÇÃO DO TEMA

   ATENÇÃO: este arquivo precisa continuar sendo carregado de
   forma SÍNCRONA dentro do <head>, ANTES do CSS renderizar.
   Não coloque "defer" nem "async" nele.

   Motivo: ele define o tema antes da primeira pintura da tela.
   Se rodasse depois, o visitante no modo claro veria a página
   piscar escura por uma fração de segundo.
   ============================================================ */
(function () {
  try {
    var t = localStorage.getItem('vektra-theme');

    // Sem preferência salva? Segue a configuração do sistema operacional.
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    // localStorage pode estar bloqueado (navegação anônima, data: URL).
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

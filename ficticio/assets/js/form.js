/* ============================================================
   VEKTRA - FORMULÁRIO DE CONTATO

   Usado pela home (#orcamento) e pela página de contato.
   Fica em arquivo próprio para as duas páginas usarem o mesmo
   código: corrigiu aqui, corrigiu nas duas.

   Só roda se a página tiver um #leadForm.
   ============================================================ */
(function () {
  'use strict';

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

  /* --- CNPJ: máscara e dígito verificador ---
     Aceita o CNPJ numérico de sempre e o alfanumérico que passou a valer
     em 2026. O cálculo do verificador é o mesmo nos dois casos: cada
     caractere entra como o código ASCII menos 48, o que para os dígitos
     dá o próprio valor. */
  var cnpjEl = document.getElementById('f-cnpj');

  function limparCnpj(v) {
    return String(v).toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14);
  }

  function formatarCnpj(v) {
    var s = limparCnpj(v);
    if (s.length > 12) return s.slice(0,2)+'.'+s.slice(2,5)+'.'+s.slice(5,8)+'/'+s.slice(8,12)+'-'+s.slice(12);
    if (s.length > 8)  return s.slice(0,2)+'.'+s.slice(2,5)+'.'+s.slice(5,8)+'/'+s.slice(8);
    if (s.length > 5)  return s.slice(0,2)+'.'+s.slice(2,5)+'.'+s.slice(5);
    if (s.length > 2)  return s.slice(0,2)+'.'+s.slice(2);
    return s;
  }

  function cnpjValido(v) {
    var s = limparCnpj(v);
    if (s.length !== 14) return false;
    if (/^(.)\1{13}$/.test(s)) return false;        // 14 caracteres iguais nunca é CNPJ

    function verificador(base) {
      var peso = 2, soma = 0;
      for (var i = base.length - 1; i >= 0; i--) {
        soma += (base.charCodeAt(i) - 48) * peso;
        peso = peso === 9 ? 2 : peso + 1;
      }
      var resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    }

    var d1 = verificador(s.slice(0, 12));
    var d2 = verificador(s.slice(0, 12) + d1);
    return s.slice(12) === String(d1) + String(d2);
  }

  if (cnpjEl) {
    cnpjEl.addEventListener('input', function () {
      cnpjEl.value = formatarCnpj(cnpjEl.value);
    });
  }

  function marcarErro(el, tem) { el.closest('.field').classList.toggle('err', tem); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    var nome = form.nome, tel = form.whatsapp, emp = form.empresa,
        cnpj = form.cnpj, func = form.funcionarios,
        fat  = form.faturamento, reg = form.regime, obr = form.obras,
        lgpd = document.getElementById('f-lgpd');

    var ok = true;

    [[nome, nome.value.trim().length < 2],
     [tel,  tel.value.replace(/\D/g, '').length < 10],
     [emp,  emp.value.trim().length < 2],
     [cnpj, !cnpjValido(cnpj.value)],
     [func, !func.value],
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

    /* O perfil vem do seletor Construtora/Incorporadora, que só existe
       na home. Sem ele, a linha simplesmente não entra na mensagem -
       melhor não enviar do que enviar um valor inventado. */
    var segBtn = document.querySelector('#seg button[aria-selected="true"]');
    var perfil = segBtn ? segBtn.textContent.trim() : '';

    var msg =
      'Olá, Vektra! Quero a análise gratuita.\n\n' +
      '• Nome: ' + nome.value.trim() + '\n' +
      '• Empresa: ' + emp.value.trim() + '\n' +
      '• CNPJ: ' + cnpj.value.trim() + '\n' +
      (perfil ? '• Perfil: ' + perfil + '\n' : '') +
      '• WhatsApp: ' + tel.value.trim() + '\n' +
      '• Faturamento anual: ' + fat.value + '\n' +
      '• Regime atual: ' + reg.value + '\n' +
      '• Obras ativas: ' + obr.value + '\n' +
      '• Funcionários ativos: ' + func.value;

    status.classList.add('ok');
    status.textContent = 'Tudo certo, ' + nome.value.trim().split(' ')[0] + '! Abrindo o WhatsApp…';

    window.open(window.VEKTRA.link(msg), '_blank', 'noopener');
  });
})();

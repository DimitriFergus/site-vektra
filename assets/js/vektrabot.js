/* ============================================================
   VEKTRA - VEKTRABOT
   Atendimento automático do botão flutuante, em todas as páginas.

   Versão 1: responde por palavra-chave, a partir da base abaixo.
   Quando não reconhece a pergunta, oferece o especialista no
   WhatsApp já com a pergunta escrita na mensagem.

   Para ensinar uma resposta nova, acrescente um item em BASE:
   - chaves: começos de palavra, sem acento e em minúsculas
             ("gratuit" pega gratuito e gratuita). Palavra genérica
             ("funciona", "quando") leva ~ na frente e vale menos,
             para "como funciona o RET" cair no RET e não no método.
   - resposta: o texto; quebra de linha com \n
   - link (opcional): { href, texto }
   ============================================================ */
(function () {
  'use strict';

  var V = window.VEKTRA;
  var botao = document.getElementById('botFloat');
  if (!V || !botao) return;

  var BASE = [
    {
      chaves: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'hello'],
      resposta: 'Olá! Sou o VektraBot. Posso explicar como funciona o método, prazos, custos, documentos e os pontos de tributação da sua construtora ou incorporadora. O que você quer saber?'
    },
    {
      chaves: ['metodo', 'processo', 'etapa', 'fase', 'passo a passo', '~como funciona', '~funciona'],
      resposta: 'O método tem quatro fases:\n1. Diagnóstico gratuito, em até 7 dias úteis.\n2. Transição com o seu contador atual, em cerca de 15 dias.\n3. Reestruturação (regime, custo por obra e pendências), até o dia 45.\n4. Gestão mensal, com relatório de margem todo dia 10.',
      link: { href: 'metodo.html', texto: 'Ver o método completo' }
    },
    {
      chaves: ['quanto tempo', 'prazo', 'demora', '~leva', '~dias', '~rapido', '~quando'],
      resposta: 'O diagnóstico sai em até 7 dias úteis depois que recebemos os documentos. Se você contratar, a transição leva cerca de 15 dias e a reestruturação fica pronta até o dia 45. O primeiro relatório gerencial chega no dia 10 do mês seguinte ao primeiro fechamento.',
      link: { href: 'metodo.html#cronograma', texto: 'Ver o cronograma dia a dia' }
    },
    {
      chaves: ['diagnostico', 'analise', 'gratuit', 'gratis', 'raio x', 'raio-x', 'sem custo'],
      resposta: 'O diagnóstico é gratuito e não gera obrigação. Analisamos 12 meses de apuração, contratos e notas, e você recebe um relatório com o valor de cada oportunidade. Se ele não apontar ao menos uma economia ou recuperação concreta, você leva o relatório do mesmo jeito.',
      link: { href: 'contato.html#formulario', texto: 'Pedir o diagnóstico' }
    },
    {
      chaves: ['quanto custa', 'preco', 'honorario', 'mensalidade', 'investimento', 'cobram', '~custa', '~valor', '~tabela'],
      resposta: 'O diagnóstico é R$ 0. O honorário mensal depende do número de obras e SPEs, do regime, do volume de notas e da folha, e vem aberto item a item junto com o relatório. Nosso critério: se a economia projetada não cobrir o honorário com folga, não recomendamos contratar.',
      link: { href: 'metodo.html#investimento', texto: 'Como o valor é definido' }
    },
    {
      chaves: ['comecar', 'comeco', 'iniciar', 'contratar', 'primeiro passo', '~inicio', '~como faco', '~quero'],
      resposta: 'Para começar são cinco passos:\n1. Peça o diagnóstico pelo formulário ou WhatsApp.\n2. Conversa de 30 minutos com um especialista.\n3. Envio dos documentos por link seguro.\n4. Apresentação do relatório e da proposta.\n5. Você decide, sem prazo.',
      link: { href: 'metodo.html#comecar', texto: 'Ver como dar início' }
    },
    {
      chaves: ['documento', 'balancete', '~papel', '~enviar', '~mandar', '~arquivo'],
      resposta: 'Para o diagnóstico pedimos: contrato social, balancetes dos últimos 12 meses, apurações e guias de tributos, DCTFWeb e EFD-Reinf, relação de obras com CNO, registro da incorporação e termo de afetação (se houver), contratos de venda, folha e notas de subempreitada. Não tem tudo? Começamos com o que existir.',
      link: { href: 'metodo.html#comecar', texto: 'Ver a lista completa' }
    },
    {
      chaves: ['ret', 'afetacao', 'regime especial', 'spe', '4%', 'patrimonio'],
      resposta: 'O RET tributa em 4% a receita de um empreendimento com patrimônio de afetação, somando IRPJ, CSLL, PIS e COFINS. No Lucro Presumido a mesma venda costuma pagar entre 5,93% e 6,73%. A estrutura precisa estar pronta antes das vendas, por isso avaliamos empreendimento a empreendimento.',
      link: { href: 'metodo.html#lucro', texto: 'Ver a simulação' }
    },
    {
      chaves: ['recuperar', 'recuperacao', 'restitui', 'creditos', 'credito tribut', 'pago a maior', 'compensa', 'pagamento indevido', 'retencao', '~devolv'],
      resposta: 'Na maioria dos casos dá para recuperar. A lei permite revisar os últimos 5 anos, e os erros mais comuns na construção (retenção de 11% não compensada, INSS de obra em duplicidade, ISS retido a maior) geram crédito. O relatório mostra o valor estimado e o caminho: compensação ou restituição.'
    },
    {
      chaves: ['trocar de contador', 'transicao', 'escritorio atual', '~contador', '~trocar', '~mudar'],
      resposta: 'Para o diagnóstico você não precisa trocar de contador. Se decidir trabalhar com a Vektra, a transição leva cerca de 15 dias e nós mesmos pedimos os arquivos ao escritório anterior, conferindo saldos para nenhuma competência ficar descoberta.'
    },
    {
      chaves: ['pequen', 'porte', 'faturamento minimo', '~tamanho', '~vale a pena', '~minimo'],
      resposta: 'Atendemos a partir de cerca de R$ 1,5 milhão de faturamento anual. Abaixo disso o ganho tributário normalmente não paga uma estrutura especializada, e dizemos isso no próprio diagnóstico.'
    },
    {
      chaves: ['cidade', 'fortaleza', 'online', 'remot', 'distancia', '~estado', '~brasil', '~fora', '~onde'],
      resposta: 'Atendemos em todo o Brasil. Documentos circulam por link seguro, as reuniões são por vídeo e o dia a dia é pelo WhatsApp, com o contador que conhece a sua operação.'
    },
    {
      chaves: ['lucro', 'margem', 'rentab', '~faturamento', '~resultado', '~ganhar', '~dinheiro'],
      resposta: 'O lucro vem de cinco frentes: tributo menor sobre a mesma venda, crédito recuperado, obra declarada com prova real (sem aferição por estimativa), margem medida por empreendimento e caixa que não trava por falta de certidão.',
      link: { href: 'metodo.html#lucro', texto: 'Ver de onde vem o lucro' }
    },
    {
      chaves: ['inss', 'iss', 'cno', 'sero', 'afericao', 'habite', 'certidao', 'cnd', 'fiscaliza', 'notificac', 'multa'],
      resposta: 'Cuidamos do CNO do início à baixa, da aferição da obra no SERO com folha e notas reais, do ISS no município de cada obra e das certidões necessárias para financiamento, averbação e Habite-se. Se chegar notificação, respondemos tecnicamente.'
    },
    {
      chaves: ['reforma', 'ibs', 'cbs', 'imposto novo'],
      resposta: 'A reforma tributária cria a CBS e o IBS, com transição a partir de 2026 e regras próprias para operações com imóveis. Simulamos o efeito nos empreendimentos em andamento e nos próximos lançamentos.'
    },
    {
      chaves: ['relatorio', 'reuniao', '~acompanha', '~mensal', '~todo mes'],
      resposta: 'Todo dia 10 você recebe o relatório gerencial: margem por obra, orçado x realizado e caixa projetado. A cada trimestre fazemos uma reunião de resultado. No dia a dia, o WhatsApp é com o contador responsável.',
      link: { href: 'metodo.html#rotina', texto: 'Ver a rotina mensal' }
    },
    {
      chaves: ['whatsapp', 'humano', 'atendente', 'especialista', 'telefone', '~pessoa', '~falar com', '~ligar', '~contato'],
      resposta: 'Claro. Nosso especialista atende no WhatsApp (85) 98992-9146. É só tocar no botão abaixo.',
      whatsapp: true
    },
    {
      chaves: ['obrigad', 'valeu', 'show', 'perfeito', 'otimo', 'entendi'],
      resposta: 'Por nada! Se surgir outra dúvida, é só escrever aqui.'
    }
  ];

  var SUGESTOES = ['Como funciona o método?', 'Quanto tempo leva?', 'Quanto custa?', 'Como começo?', 'Falar com especialista'];

  var reduced = V.reduced;
  var montado = false;
  var painel, lista, sugestoes, campo;

  function normalizar(txt) {
    return ' ' + String(txt).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9%\- ]+/g, ' ')
      .replace(/\s+/g, ' ').trim() + ' ';
  }

  /* A chave precisa começar uma palavra: "ret" não pode casar com "direto".
     Assunto vale 3 pontos; palavra genérica (~) vale 1. Só genérica, sem
     assunto nenhum, ainda responde: "quanto tempo leva?" é pergunta válida. */
  function responder(pergunta) {
    var texto = normalizar(pergunta);
    var melhor = null, melhorPontos = 0;

    BASE.forEach(function (item) {
      var pontos = 0;
      item.chaves.forEach(function (chave) {
        var generica = chave.charAt(0) === '~';
        var termo = generica ? chave.slice(1) : chave;
        if (texto.indexOf(' ' + termo) !== -1) pontos += generica ? 1 : 3;
      });
      if (pontos > melhorPontos) { melhor = item; melhorPontos = pontos; }
    });
    return melhor;
  }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto) n.textContent = texto;
    return n;
  }

  function rolarFim() { lista.scrollTop = lista.scrollHeight; }

  function linkWhats(pergunta) {
    var a = el('a', 'bot-link wa', 'Falar com o especialista no WhatsApp');
    var msg = pergunta
      ? 'Olá! Vim pelo VektraBot do site e tenho uma dúvida: ' + pergunta
      : 'Olá! Vim pelo VektraBot do site e quero falar com um especialista.';
    a.href = V.link(msg);
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }

  function mensagemDele(item, pergunta) {
    var m = el('div', 'bot-msg dele', item.resposta);
    if (item.link) {
      var a = el('a', 'bot-link', item.link.texto);
      a.href = item.link.href;
      m.appendChild(a);
    }
    if (item.whatsapp) m.appendChild(linkWhats(pergunta));
    lista.appendChild(m);
    rolarFim();
  }

  function mensagemMinha(texto) {
    lista.appendChild(el('div', 'bot-msg minha', texto));
    rolarFim();
  }

  function enviar(pergunta) {
    pergunta = String(pergunta || '').trim();
    if (!pergunta) return;

    mensagemMinha(pergunta);
    sugestoes.hidden = true;

    var digitando = el('div', 'bot-msg dele bot-digitando');
    digitando.setAttribute('aria-label', 'VektraBot está digitando');
    digitando.innerHTML = '<i></i><i></i><i></i>';
    lista.appendChild(digitando);
    rolarFim();

    setTimeout(function () {
      digitando.remove();
      var achou = responder(pergunta);
      if (achou) {
        mensagemDele(achou, pergunta);
      } else {
        mensagemDele({
          resposta: 'Essa eu ainda não sei responder com segurança. Nosso especialista responde 24h no WhatsApp, e a sua pergunta já vai escrita na mensagem.',
          whatsapp: true
        }, pergunta);
      }
      sugestoes.hidden = false;
    }, reduced ? 150 : 650);
  }

  function montar() {
    painel = el('section', 'bot');
    painel.id = 'vektrabot';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'VektraBot, atendimento rápido e eficiente');

    painel.innerHTML =
      '<header class="bot-topo">' +
        '<span class="bot-avatar" aria-hidden="true"><img src="assets/img/simbolo-claro.png" width="128" height="128" alt=""></span>' +
        '<span class="bot-nome"><b>VektraBot</b><small>Atendimento rápido e eficiente</small></span>' +
        '<button type="button" class="bot-fechar" aria-label="Fechar o VektraBot">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</header>' +
      '<div class="bot-msgs" aria-live="polite"></div>' +
      '<div class="bot-sugestoes"></div>' +
      '<form class="bot-form">' +
        '<label for="botCampo" class="sr-only">Escreva sua pergunta</label>' +
        '<input id="botCampo" type="text" placeholder="Escreva sua pergunta" autocomplete="off" maxlength="300">' +
        '<button type="submit" aria-label="Enviar pergunta">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>' +
        '</button>' +
      '</form>' +
      '<p class="bot-rodape">Respostas automáticas. Para o seu caso, fale com o especialista.</p>';

    document.body.appendChild(painel);

    lista = painel.querySelector('.bot-msgs');
    sugestoes = painel.querySelector('.bot-sugestoes');
    campo = painel.querySelector('input');

    SUGESTOES.forEach(function (s) {
      var b = el('button', '', s);
      b.type = 'button';
      b.addEventListener('click', function () { enviar(s); });
      sugestoes.appendChild(b);
    });

    painel.querySelector('.bot-fechar').addEventListener('click', fechar);
    painel.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      enviar(campo.value);
      campo.value = '';
    });
    painel.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') fechar();
    });

    mensagemDele({
      resposta: 'Olá! Eu sou o VektraBot. Tire suas dúvidas sobre o método, prazos, custos e tributação da sua construtora ou incorporadora. Escolha um tema ou escreva sua pergunta.'
    });
    montado = true;
  }

  function abrir() {
    if (!montado) montar();
    if (V.fecharMenu) V.fecharMenu();
    painel.classList.add('aberto');
    document.documentElement.classList.add('bot-aberto');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar o VektraBot');
    // no celular o teclado subindo cobre a conversa; só foca com mouse
    if (window.matchMedia('(pointer: fine)').matches) campo.focus();
  }

  function fechar() {
    if (!montado) return;
    painel.classList.remove('aberto');
    document.documentElement.classList.remove('bot-aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir o VektraBot');
    botao.focus();
  }

  botao.addEventListener('click', function () {
    if (montado && painel.classList.contains('aberto')) fechar();
    else abrir();
  });

  /* Qualquer elemento com [data-bot] abre o bot (ex.: página de dúvidas) */
  document.querySelectorAll('[data-bot]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      abrir();
    });
  });
})();

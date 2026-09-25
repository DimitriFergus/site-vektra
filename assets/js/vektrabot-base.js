/* ============================================================
   VEKTRA - VEKTRABOT: BASE DE RESPOSTAS
   Tudo o que o bot sabe responder. Não usa IA nem API: é só esta
   lista, lida no navegador de quem visita. Custo zero.

   O conteúdo vem de base-de-conhecimento/base-vektra.md.
   Mudou algo lá? Atualize a resposta correspondente aqui.

   ------------------------------------------------------------
   COMO "TREINAR" O BOT
   ------------------------------------------------------------
   Cada item de RESPOSTAS tem:

   - exemplos: jeitos reais de alguém perguntar aquilo. Servem
     para casar a pergunta escolhida no catálogo com a resposta,
     e aceitam falta de acento e erro de digitação.
   - chaves:   palavras ou expressões que, sozinhas, já indicam o
     assunto ("ret", "cno", "iss"). Uma palavra casa com o começo
     das palavras da pergunta ("retenc" pega retenção e retenções).
   - resposta: o texto. Curto, direto, sem travessão. \n quebra linha.
   - especialista: true mostra o botão do WhatsApp junto da resposta.
   - link:     botão para uma página do site (opcional).
   - seguir:   perguntas sugeridas depois da resposta (opcional).

   Quando o bot não reconhece a pergunta, ele encaminha para o
   especialista em vez de arriscar. Viu no WhatsApp uma pergunta
   que o bot errou? Copie a frase para os "exemplos" do item certo.

   ENCAMINHAR (mais abaixo) são os assuntos que nunca recebem
   resposta pronta: cálculo, lucro, economia, contrato específico
   e urgência. Esses vão sempre para o especialista.
   ============================================================ */
window.VEKTRABOT_BASE = {

  abertura: 'Oi. Aqui é o VektraBot, assistente da Vektra, contabilidade para construtoras e incorporadoras. Escolha uma pergunta abaixo. Se a sua dúvida não estiver na lista, toque em "Outro assunto" e eu te levo para um especialista.',

  /* ----------------------------------------------------------
     CATÁLOGO DE PERGUNTAS
     O visitante escolhe, não digita. A trilha rola para o lado,
     com setas, no celular e no computador.
     Para incluir uma pergunta nova: escreva aqui do jeito que o
     cliente escreveria e confira se cai na resposta certa com
     VEKTRA.botResponder('a pergunta') no console.
     ---------------------------------------------------------- */
  catalogo: [
    'O que é a análise gratuita?',
    'O que preciso mandar para a análise?',
    'Quanto custa o serviço?',
    'Preciso trocar de contador?',
    'Vocês atendem a minha cidade?',
    'Como separar o custo por obra?',
    'O que é o RET na incorporação?',
    'Como funciona o Lucro Presumido na construção?',
    'Onde pago o ISS da obra?',
    'O que é o CNO da obra?',
    'Retenção de 11%: o que fazer?',
    'A desoneração da folha ainda vale?',
    'Estou no Simples: está tudo pago no DAS?',
    'O que muda com a reforma tributária?',
    'Vou fazer permuta de terreno',
    'Faturei bem e não sobrou dinheiro',
    'Recebi uma notificação da Receita',
    'Quem é a Vektra?'
  ],

  /* ----------------------------------------------------------
     "OUTRO ASSUNTO"
     Antes de ir para o WhatsApp, três perguntas rápidas sobre a
     empresa. Só a primeira é digitada; as outras duas são escolha.
     ---------------------------------------------------------- */
  outro: {
    rotulo: 'Outro assunto',
    intro: 'Sem problema, isso o especialista responde melhor que eu. Para ele já chegar com contexto, me diga três coisas rápidas sobre a sua empresa.',
    /* Depois de qualquer resposta, antes de oferecer o especialista */
    ponte: 'Para o especialista continuar daqui com o seu caso na mão, me diga três coisas rápidas sobre a sua empresa.',
    /* Quando os dados já foram informados nesta visita */
    jaTenho: 'Já estou com os dados da sua empresa. Toque abaixo para falar com um especialista, ou escolha outra pergunta.',
    passos: [
      {
        chave: 'Empresa',
        pergunta: 'Primeiro: qual o nome da sua empresa?',
        tipo: 'texto',
        marcador: 'Nome da empresa',
        botao: 'Continuar'
      },
      {
        chave: 'Faturamento',
        pergunta: 'Qual o faturamento anual, mais ou menos?',
        tipo: 'opcoes',
        opcoes: ['Até R$ 1 milhão', 'R$ 1 a 4,8 milhões', 'R$ 4,8 a 15 milhões', 'Acima de R$ 15 milhões', 'Prefiro não informar']
      },
      {
        chave: 'Funcionários',
        pergunta: 'E quantos funcionários a empresa tem hoje?',
        tipo: 'opcoes',
        opcoes: ['1 a 10', '11 a 30', '31 a 60', 'Mais de 60', 'Prefiro não informar']
      }
    ],
    fim: 'Pronto. Toque abaixo: o especialista já recebe esses dados junto com a sua dúvida, pelo WhatsApp, em horário comercial.'
  },

  /* Sem resposta pronta: a pergunta segue para o especialista */
  naoEntendi: 'Essa eu não tenho resposta pronta aqui, e prefiro não arriscar. Um especialista da Vektra te responde com a fonte, pelo WhatsApp, em horário comercial.',

  /* A pessoa repetiu a mesma pergunta: sinal de que o bot não ajudou */
  repetida: 'Parece que eu não estou conseguindo te ajudar com isso. É melhor você falar com uma pessoa da equipe, que já recebe a sua pergunta escrita.',

  /* ----------------------------------------------------------
     ASSUNTOS QUE SEMPRE VÃO PARA O ESPECIALISTA
     Verificados antes das respostas prontas. "padroes" são
     expressões regulares sobre o texto sem acento e minúsculo.
     ---------------------------------------------------------- */
  encaminhar: [
    {
      id: 'urgente',
      urgente: true,
      padroes: [
        /\bintima/, /\bnotifica/, /auto de infra/, /\bautuad/, /\bautuac/, /\bfiscaliza/, /\bfiscal (veio|chegou|apareceu|esta)/,
        /\bmultad/, /\bmulta (da|de|na) receita/, /execucao fiscal/, /\bmalha fina/, /\bprazo (vence|acaba|termina)/,
        /(certidao|habite|financiamento|licitacao|repasse).{0,30}(travad|negad|bloque|nao sai|parad)/, /(travad|bloquead|negad).{0,30}(certidao|financiamento|habite|licitacao)/
      ],
      resposta: 'Isso tem prazo e é melhor falar com alguém da equipe agora, não comigo. Toque no botão abaixo: a sua mensagem já vai com o assunto.'
    },
    {
      id: 'calculo',
      padroes: [
        /\bcalcul/, /\bsimul/, /\bsimula/,
        /quanto (eu |que eu |a gente |minha empresa |a empresa )?(vou |iria |vai |teria que |tenho que |devo )?(pag|recolh|desembols)/,
        /quanto (de |que )?(imposto|tributo|inss|iss|irpj|csll|pis|cofins|das|ret)/,
        /quanto (da|fica|sai|seria|e) (o |a |de )?(imposto|tributo|inss|iss|ret|das)/,
        /\bfaturo\b/, /\bfaturamos\b/, /faturamento (de|e de|mensal de|anual de) ?(r\$ ?)?\d/, /\bfaturando\b/,
        /r\$ ?\d/, /\b\d+[.,]?\d* ?(mil|milhao|milhoes|mi|k)\b/, /\baliquota (da|do|de) (minha|meu|nossa)/,
        /minha carga/, /carga tributaria (da|de) (minha|meu|nossa)/
      ],
      resposta: 'Essa dúvida depende dos números e do contrato da sua empresa, e por aqui eu não faço cálculo nem simulação: um número errado dito num chat pode virar decisão de negócio.\nUm especialista da Vektra faz essa conta com você, olhando um contrato seu. Toque abaixo para falar com ele no WhatsApp.'
    },
    {
      id: 'lucro',
      padroes: [
        /\blucr(ar|aria|o vou|o eu vou|o vou ter|o terei|o da minha|o do meu|o na minha|o no meu)/, /quanto (de )?lucro/, /vou (ter|ganhar) (de )?lucro/,
        /\beconomiz/, /\bquanto (vou |eu vou |da pra |consigo )?(ganhar|sobrar|recuperar)/, /quanto (sobra|sobraria)/,
        /minha margem/, /margem (da|de|do) (minha|meu|nossa)/, /(vale|compensa) (a pena )?(financeiramente|em dinheiro)/,
        /retorno (do|de) investimento/, /\broi\b/
      ],
      resposta: 'Quanto sobra de lucro ou de economia depende do contrato, do município, da folha e dos documentos da sua obra, e qualquer número que eu desse aqui seria chute.\nO aconselhável é conversar com um especialista da Vektra, que olha uma obra sua e aponta o que merece decisão. Toque abaixo para falar com ele.'
    },
    {
      id: 'meu-caso',
      padroes: [
        /qual (o |e o )?(melhor )?regime (pra|para|da|de|na) (mim|minha|meu|nossa|a minha|o meu)/,
        /(devo|deveria|compensa|vale a pena) (mudar|trocar|optar|entrar|sair|migrar) (de |do |pro |para o |pelo )?(regime|presumido|lucro real|simples|ret)/,
        /(ler|analisar|revisar|olhar|avaliar|conferir) (o |meu |o meu |esse |este |um )?(contrato|documento|balanco|balancete|nota)/,
        /(posso|vou|quero) (te )?(mandar|enviar) (o |meu |um )?(contrato|documento|arquivo|balanco|nota)/,
        /(estou|to|tou|estamos) (pagando|recolhendo) .{0,25}(a mais|demais|errado|em dobro)/, /(eu |nos |a gente )?(paguei|pagamos) .{0,25}(a mais|demais|errado|em dobro)/
      ],
      resposta: 'Para responder isso de verdade é preciso olhar o seu contrato e os seus documentos, e isso não é conversa de chat. Prefiro te dizer isso a arriscar um palpite.\nUm especialista da Vektra resolve com você numa conversa sobre uma obra específica. Toque abaixo para falar com ele.'
    }
  ],

  /* ----------------------------------------------------------
     RESPOSTAS PRONTAS
     ---------------------------------------------------------- */
  respostas: [

    /* ---------- conversa ---------- */
    {
      id: 'saudacao',
      peso: 1,
      exemplos: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'opa', 'e ai'],
      chaves: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'tudo bem', 'hello'],
      resposta: 'Oi. Me conta qual é a situação da sua obra ou da sua empresa que eu te ajudo a entender o que está em jogo.'
    },
    {
      id: 'obrigado',
      peso: 1,
      exemplos: ['obrigado', 'obrigada', 'valeu', 'show', 'entendi', 'perfeito', 'beleza'],
      chaves: ['obrigad', 'valeu', 'agradec', 'entendi', 'beleza', 'perfeito'],
      resposta: 'Por nada. Se quiser olhar o seu caso com número de verdade, um especialista da Vektra atende pelo WhatsApp em horário comercial.',
      especialista: true
    },
    {
      id: 'robo',
      exemplos: ['voce e um robo', 'estou falando com uma pessoa', 'isso e um bot', 'voce e humano', 'e inteligencia artificial'],
      chaves: ['robo', 'bot', 'humano', 'inteligencia artificial', 'automatico'],
      resposta: 'Sou o assistente automático do site, com respostas prontas sobre os assuntos mais comuns. Para o seu caso específico, quem responde é um especialista da Vektra, pelo WhatsApp.',
      especialista: true
    },
    {
      id: 'pessoa',
      exemplos: ['quero falar com uma pessoa', 'falar com atendente', 'falar com um especialista', 'quero falar com o contador', 'me passa o whatsapp', 'qual o telefone', 'como entro em contato'],
      chaves: ['atendente', 'especialista', 'falar com', 'whatsapp', 'whats', 'zap', 'telefone', 'contato', 'ligar', 'pessoa'],
      resposta: 'Claro, é o melhor caminho mesmo. Um especialista da Vektra atende pelo WhatsApp (85) 98992-9146, em horário comercial. Toque abaixo e a sua mensagem já vai pronta.',
      especialista: true
    },

    /* ---------- a Vektra ---------- */
    {
      id: 'quem',
      exemplos: ['o que e a vektra', 'quem sao voces', 'o que voces fazem', 'voces sao contabilidade', 'que empresa e essa', 'com o que voces trabalham'],
      chaves: ['vektra', 'quem sao', 'o que voces fazem', 'que empresa'],
      resposta: 'A Vektra é a contabilidade dedicada à construção civil: construtoras, incorporadoras e empreiteiras. Cuidamos de custo por obra, tributos, documentação e obrigações.\nO diferencial é tratar cada obra como uma unidade econômica própria, não só o CNPJ da empresa.',
      link: { href: 'a-vektra.html', texto: 'Conhecer a Vektra' },
      seguir: ['O que é a análise gratuita?', 'Vocês atendem a minha cidade?']
    },
    {
      id: 'ordnas',
      exemplos: ['voces sao da ordnas', 'e o mesmo escritorio da ordnas', 'qual a relacao com a ordnas'],
      chaves: ['ordnas'],
      resposta: 'A Vektra é a unidade de construção civil da Ordnas Contabilidade, aqui de Fortaleza. Mesma operação, com foco dedicado a construtoras e incorporadoras.'
    },
    {
      id: 'cidade',
      exemplos: ['voces atendem a minha cidade', 'atendem fora de fortaleza', 'atendem em outro estado', 'onde voces ficam', 'atendem online', 'minha obra e em maracanau', 'atendem caucaia'],
      chaves: ['cidade', 'municipio', 'fortaleza', 'regiao', 'onde fica', 'endereco', 'estado', 'maracanau', 'caucaia', 'eusebio', 'aquiraz', 'maranguape', 'pacatuba', 'horizonte', 'itaitinga', 'online', 'remoto', 'distancia'],
      resposta: 'A Vektra atende construtoras em todo o Brasil. O escritório fica em Fortaleza/CE, na R. P, 150, Altos, Prefeito José Walter, e o atendimento é digital: documentos por canal seguro, reuniões por vídeo e WhatsApp com o contador.\nConte o município da obra para o especialista, porque o ISS muda de cidade para cidade.',
      especialista: true
    },
    {
      id: 'horario',
      exemplos: ['em quanto tempo voces respondem', 'qual o horario de atendimento', 'voces atendem sabado', 'atendem 24 horas', 'demora pra responder'],
      chaves: ['horario', 'quanto tempo respond', 'demora', 'sabado', 'domingo', 'feriado', '24 horas', '24h', 'fim de semana'],
      resposta: 'A equipe atende pelo WhatsApp de segunda a sexta, das 9h às 17h, e o primeiro retorno sai em até 1 dia útil. Se você deixar a mensagem com o nome da empresa e o município da obra, o contador já chega sabendo do que se trata.',
      especialista: true
    },
    {
      id: 'preco',
      exemplos: ['quanto custa', 'qual o valor do servico', 'quanto voces cobram', 'qual o preco da contabilidade', 'quanto e a mensalidade', 'tem tabela de precos', 'queria uma proposta', 'me manda um orcamento'],
      chaves: ['quanto custa', 'preco', 'valor do servico', 'cobram', 'mensalidade', 'honorario', 'tabela', 'proposta', 'orcamento da contabilidade', 'investimento'],
      resposta: 'São quatro planos mensais: Vektra BASE, 1 salário mínimo (R$ 1.621); Vektra OBRA, 2 salários mínimos (R$ 3.242); Vektra ESTRATÉGICA, 3 salários mínimos (R$ 4.863); e Vektra ENTERPRISE, sob consulta.\nO plano certo sai do diagnóstico, que é gratuito.',
      especialista: true,
      seguir: ['O que é a análise gratuita?', 'O que preciso mandar?']
    },
    {
      id: 'analise',
      exemplos: ['o que e a analise gratuita', 'como funciona a analise', 'como funciona o diagnostico', 'como comeco', 'qual o primeiro passo', 'como funciona o metodo de voces', 'e gratis mesmo'],
      chaves: ['analise', 'diagnostico', 'gratuit', 'gratis', 'sem custo', 'primeiro passo', 'como comec', 'metodo', 'como funciona'],
      resposta: 'Funciona assim: o diagnóstico é gratuito e sem obrigação. Depois de uma conversa inicial, você envia os documentos e, em até 10 dias úteis, recebe o relatório com cada oportunidade encontrada e a proposta.\nO relatório é seu: dá para implementar com a Vektra, com o seu contador atual ou não implementar.',
      especialista: true,
      link: { href: 'metodo.html', texto: 'Ver o método completo' },
      seguir: ['O que preciso mandar?', 'Preciso trocar de contador?']
    },
    {
      id: 'documentos',
      exemplos: ['o que preciso mandar', 'quais documentos voces precisam', 'o que preciso enviar para a analise', 'precisa de senha', 'tenho que mandar balanco'],
      chaves: ['documento', 'mandar', 'enviar', 'senha', 'acesso ao sistema', 'papelada'],
      resposta: 'Os dos últimos 12 meses: contrato social, balancetes, apurações e guias, DCTFWeb e EFD-Reinf, relação de obras com CNO, contratos de venda, folha e notas de subempreitada. Não tem tudo? Começamos com o que existir.\nOs documentos vão por canal seguro, com a equipe. Aqui no chat não precisa enviar nada.',
      especialista: true
    },
    {
      id: 'trocar-contador',
      exemplos: ['preciso trocar de contador', 'ja tenho contador', 'da trabalho trocar de contador', 'posso continuar com meu contador', 'como e a transicao de contador'],
      chaves: ['trocar de contador', 'trocar o contador', 'ja tenho contador', 'mudar de contador', 'transicao', 'contador atual'],
      resposta: 'Não precisa. A conversa é sobre uma obra, não sobre trocar de escritório. Tem empresa que faz a análise, leva o material para o contador atual e implementa com ele.\nSe um dia houver contratação, a transição segue uma lista, e a parte operacional fica com a Vektra.'
    },
    {
      id: 'reclamacao-contador',
      exemplos: ['meu contador nunca me mandou nada separado por obra', 'meu contador nao entende de construcao', 'meu contador errou', 'nao confio no meu contador', 'meu contador so manda guia'],
      chaves: ['meu contador'],
      resposta: 'Entendo. Isso acontece bastante quando a contabilidade é generalista: a rotina funciona, mas ela olha o CNPJ inteiro, e obra é outra unidade de análise.\nSeparar por obra é trabalho de estrutura, feito uma vez e mantido depois. Vale conversar com um especialista olhando uma obra sua.',
      especialista: true
    },
    {
      id: 'recuperar',
      exemplos: ['voces conseguem recuperar imposto', 'da pra recuperar o que paguei a mais', 'tem como pedir restituicao', 'imposto pago a maior volta', 'credito tributario'],
      chaves: ['recuper', 'restitui', 'pago a maior', 'pagou a mais', 'credito tribut', 'compensar imposto', 'devolver imposto'],
      resposta: 'Existe revisão retroativa em determinadas situações, mas eu não tenho como dizer se é o seu caso sem que alguém olhe os documentos. Prometer recuperação antes de analisar seria desonesto.\nIsso entra na conversa com o especialista.',
      especialista: true
    },
    {
      id: 'regime',
      exemplos: ['qual o melhor regime', 'lucro presumido ou lucro real', 'qual regime tributario usar', 'melhor regime para construtora'],
      chaves: ['melhor regime', 'qual regime', 'regime tributario', 'lucro real', 'presumido ou real'],
      resposta: 'Essa resposta está no seu contrato, não numa tabela. Empreitada com fornecimento de material, empreitada só de mão de obra, administração e incorporação puxam tratamentos diferentes, e a decisão muda a cada contrato novo.\nQuem responde isso é um especialista lendo o documento.',
      especialista: true,
      seguir: ['Como funciona o Lucro Presumido na construção?', 'O que é o RET?']
    },
    {
      id: 'pequeno',
      exemplos: ['sou pequeno vale a pena', 'minha construtora e pequena', 'tenho so uma obra', 'atendem empresa pequena', 'tem faturamento minimo'],
      chaves: ['pequen', 'porte', 'so uma obra', 'faturamento minimo', 'microempresa', 'comecando agora'],
      resposta: 'A Vektra atende construtoras a partir de R$ 1 milhão de faturamento anual. Abaixo disso, o ganho tributário normalmente não paga uma estrutura especializada, e o especialista diz isso na primeira conversa.\nConte quantas obras você tem ativas que ele te orienta.',
      especialista: true
    },
    {
      id: 'obra-publica',
      exemplos: ['atendem obra publica', 'trabalho com licitacao', 'tenho contrato com prefeitura', 'obra do governo'],
      chaves: ['obra publica', 'licitac', 'prefeitura', 'governo', 'orgao public', 'contrato public'],
      resposta: 'Sim, obra pública e privada. Obra pública normalmente traz três frentes ao mesmo tempo: cadastro da obra, retenções e prestação de contas do contrato.',
      especialista: true
    },
    {
      id: 'fora-escopo',
      exemplos: ['voces fazem orcamento de obra', 'fazem imposto de renda pessoa fisica', 'abrir mei', 'declaracao de imposto de renda', 'voces fazem projeto', 'indicam investimento', 'preciso de advogado'],
      chaves: ['orcamento de obra', 'orcamento da obra', 'pessoa fisica', 'imposto de renda pessoa', 'declaracao de ir', ' mei', 'abrir mei', 'investiment', 'advogad', 'projeto arquitet', 'engenheiro', 'aposentadoria'],
      resposta: 'Esse não é o nosso campo. A Vektra cuida especificamente da contabilidade de construtoras e incorporadoras: custo, tributos, documentação e obrigações. Orçamento de execução, por exemplo, é trabalho de engenharia.'
    },

    /* ---------- temas técnicos (seção 7 do .md) ---------- */
    {
      id: 'custo-obra',
      exemplos: ['nao sei qual obra da lucro', 'o mes fecha bem mas o caixa aperta', 'todas as obras estao no mesmo bolo', 'como separar custo por obra', 'centro de custo por obra'],
      chaves: ['custo por obra', 'centro de custo', 'qual obra da lucro', 'caixa aperta', 'mesmo bolo', 'custo da obra', 'custo administrativo', 'separar por obra'],
      resposta: 'Quando material, mão de obra, locação e retrabalho de todas as obras entram no mesmo centro de custo, a obra boa passa a cobrir o prejuízo da obra ruim, e ninguém consegue apontar qual é qual.\nA saída é o custeio por obra: cada contrato vira um centro de resultado com orçamento, custo já feito, custo que falta e recebimentos. Três erros comuns: jogar custo do escritório dentro da obra, não formalizar o BDI e não separar a folha por obra.',
      especialista: true,
      seguir: ['Por que faturei bem e não sobrou?', 'O que é BDI?']
    },
    {
      id: 'medicao',
      exemplos: ['faturei bem mas nao sobrou', 'por que o resultado nao bate com o que recebi', 'diferenca entre medicao e faturamento', 'como reconhecer receita de obra', 'o que e poc'],
      chaves: ['medicao', 'nao sobrou', 'resultado nao bate', 'reconhec', 'receita da obra', 'poc', 'avanco da obra', 'custo a incorrer'],
      resposta: 'São três coisas diferentes. Medição é o quanto da obra foi executado. Faturamento é a data em que a nota saiu. Resultado é o que sobra considerando o custo que ainda vai acontecer.\nContrato de construção é de longo prazo, e a receita se reconhece conforme o avanço do contrato, não pela emissão da nota. Quem fecha o mês pela nota lê um número que não existe.',
      especialista: true
    },
    {
      id: 'presumido',
      exemplos: ['como funciona o lucro presumido na construcao', 'ouvi falar de 8 por cento', 'meu contador usa 32', 'presuncao de 8 ou 32', 'o que e presuncao'],
      chaves: ['presumido', 'presuncao', '8%', '32%', '8 por cento', '32 por cento'],
      resposta: 'No Lucro Presumido, o imposto incide sobre um percentual presumido da receita, e na construção esse percentual muda conforme a natureza do contrato.\nEmpreitada com fornecimento de todos os materiais indispensáveis, incorporados à obra: 8% para IRPJ e 12% para CSLL. Só mão de obra ou obra por administração: 32% para os dois. E não basta ter algum material na nota: isso se prova pelo contrato.\nPor isso a resposta sobre a sua presunção está no contrato, não numa tabela.',
      especialista: true,
      seguir: ['Qual o melhor regime?', 'O que é o RET?']
    },
    {
      id: 'ret',
      exemplos: ['o que e o ret', 'vale a pena afetar', 'o que e patrimonio de afetacao', 'vou lancar um empreendimento', 'regime especial de tributacao', 'ret e a reforma tributaria', 'o que e spe'],
      chaves: ['ret', 'regime especial', 'afetac', 'patrimonio de afet', 'incorporac', 'empreendimento', 'lancamento', 'lancar', 'spe'],
      resposta: 'O RET, Regime Especial de Tributação, vale para incorporação imobiliária com patrimônio de afetação averbado. Ele unifica tributos federais num percentual sobre a receita recebida do empreendimento: 4% na regra geral e 1% em empreendimentos de interesse social.\nSem afetação averbada não há RET, e a estrutura precisa existir antes de a venda avançar. Pela reforma tributária, incorporações afetadas com opção feita antes de 1º de janeiro de 2029 seguem com tratamento equivalente ao atual na transição.\nSe você tem lançamento previsto, o momento de olhar a estrutura é antes de começar a vender.',
      especialista: true,
      seguir: ['O que muda com a reforma tributária?', 'Vou fazer permuta de terreno']
    },
    {
      id: 'cno',
      exemplos: ['preciso abrir cno', 'minha obra nao tem cadastro', 'o cartorio esta pedindo certidao', 'o que e cno', 'como baixar o cno', 'obra antiga sem cadastro', 'o que e cei'],
      chaves: ['cno', 'cadastro nacional de obra', 'cadastro da obra', 'matricula da obra', 'cei', 'baixa da obra', 'averba', 'cartorio', 'habite'],
      resposta: 'O CNO, Cadastro Nacional de Obras, é a matrícula da obra na Receita Federal, sucessor do antigo CEI. É por obra, não por empresa: cinco obras simultâneas são cinco CNOs.\nHá prazo para inscrever depois do início efetivo da obra, e o encerramento exige todas as competências regularizadas. É ele que libera a certidão para averbar a obra no cartório.\nObra antiga sem cadastro? Regularizar antes de ser cobrado costuma ser bem diferente de responder a uma autuação. Vale falar com a equipe logo.',
      especialista: true
    },
    {
      id: 'retencao',
      exemplos: ['retive 11 por cento e nao sei o que fazer', 'o subempreiteiro reclamou da retencao', 'retencao de 11', 'inss retido na nota', 'retencao previdenciaria', 'optante do simples sofre retencao'],
      chaves: ['retenc', 'retid', '11%', '11 por cento', 'subempreit', 'inss da nota', 'inss de obra', 'inss retido'],
      resposta: 'Na construção, a nota de serviço prestado por empresa contratada está sujeita, como regra, à retenção previdenciária de 11%, feita pelo contratante e recolhida vinculada ao CNO da obra.\nExistem hipóteses de dispensa, e reter onde há dispensa vira pedido de restituição depois. Empresa do Simples, como regra, não sofre a retenção, mas precisa declarar isso na nota.\nPara quem sofreu a retenção, o valor não é despesa: é crédito a compensar.',
      especialista: true,
      seguir: ['O que é aferição de obra?', 'O que é CNO?']
    },
    {
      id: 'afericao',
      exemplos: ['o que e afericao de obra', 'a receita cobrou inss que eu nao devia', 'inss calculado pela area da obra', 'sero', 'afericao indireta'],
      chaves: ['aferic', 'sero', 'area construida', 'cobrou inss', 'padrao construtivo'],
      resposta: 'Quando a documentação não sustenta a mão de obra empregada, a Receita pode apurar a contribuição por um cálculo próprio, baseado em parâmetros da obra como área e padrão construtivo, e cobrar a diferença.\nPor isso a documentação precisa ser montada durante a obra, não quando o fiscal pede.',
      especialista: true
    },
    {
      id: 'desoneracao',
      exemplos: ['ainda vale a pena a desoneracao', 'meu contador falou em cprb', 'desoneracao da folha acabou', 'contribuicao sobre receita bruta'],
      chaves: ['desonerac', 'cprb', 'receita bruta', 'folha de pagamento', 'inss patronal'],
      resposta: 'A construção civil podia recolher a contribuição previdenciária sobre a receita bruta, a CPRB, no lugar da contribuição sobre a folha. Isso está em extinção gradual: pela Lei 14.973/2024, a parcela sobre a receita cai ano a ano e a da folha cresce, até o fim da CPRB a partir de 2028.\nA comparação antiga "CPRB contra folha" não é mais a conta certa. Como muda a cada ano, vale rodar a comparação com os números da sua folha e dos seus contratos com um especialista.',
      especialista: true
    },
    {
      id: 'iss',
      exemplos: ['obra em outra cidade onde pago o iss', 'o tomador reteve iss', 'paguei iss duas vezes', 'iss de obra', 'posso deduzir material do iss'],
      chaves: ['iss', 'imposto sobre servico', 'outra cidade', 'municipio da obra', 'tomador', 'duas vezes', 'duplicidade', 'deduzir material'],
      resposta: 'Na construção civil, o ISS é devido, como regra, no município da obra, não no da sede da empresa (Lei Complementar 116/2003, item 7 da lista de serviços).\nObra fora da sede muda o cadastro, a alíquota, a emissão de nota e a regra de retenção. Os problemas mais comuns: recolher para duas prefeituras e o tomador reter a mais. Dedução de material da base só existe se a lei daquele município permitir.',
      especialista: true
    },
    {
      id: 'simples',
      exemplos: ['estou no simples esta tudo pago no das', 'construtora no simples nacional', 'anexo iv', 'o das inclui inss'],
      chaves: ['simples', 'das', 'anexo iv', 'anexo 4'],
      resposta: 'Atividades de construção civil costumam ficar no Anexo IV do Simples Nacional, que tem uma diferença importante: a contribuição previdenciária patronal não está no DAS. Ela é apurada e recolhida separadamente.\nÉ um erro frequente: a empresa paga o DAS em dia, acha que está tudo quitado e acumula passivo previdenciário sem perceber.',
      especialista: true
    },
    {
      id: 'icms',
      exemplos: ['posso creditar o icms do material', 'icms de material de construcao', 'credito de icms na obra'],
      chaves: ['icms'],
      resposta: 'Como regra, a construtora não se credita do ICMS sobre o material aplicado na obra: o material é consumido na prestação do serviço, que é tributada pelo ISS. Crédito indevido nesse ponto costuma virar autuação.\nCompra interestadual e substituição tributária têm regras próprias, que dependem do estado e do produto.',
      especialista: true
    },
    {
      id: 'permuta',
      exemplos: ['vou fazer permuta com o dono do terreno', 'permuta de terreno por apartamento', 'como funciona permuta', 'troca de terreno por unidades'],
      chaves: ['permuta', 'dono do terreno', 'terreno por', 'troca de terreno'],
      resposta: 'Permuta de terreno por unidades futuras é comum em incorporação e tem efeitos tributários para os dois lados, que mudam conforme o permutante seja pessoa física ou jurídica, haja ou não pagamento em dinheiro e conforme o regime da incorporadora.\nÉ um assunto em que a estrutura precisa estar certa antes de assinar. Vale conversar com um especialista antes de fechar.',
      especialista: true
    },
    {
      id: 'reforma',
      exemplos: ['o que muda com a reforma tributaria', 'vou ter que aumentar preco', 'ibs e cbs', 'reforma tributaria na construcao', 'fim do iss'],
      chaves: ['reforma', 'ibs', 'cbs', 'iva', 'aumentar preco', 'lei complementar 214', 'lc 214'],
      resposta: 'A resposta honesta é que depende das operações e dos contratos da empresa. PIS e Cofins dão lugar à CBS; ICMS e ISS dão lugar ao IBS, em transição. A Lei Complementar 214/2025 prevê um regime específico para operações com imóveis, e as incorporações afetadas têm regra de transição com o marco de 2029.\nO primeiro trabalho é montar o mapa: operações, contratos que atravessam a virada, sistemas de emissão e contratos de preço fechado de longo prazo. Como a regulamentação ainda avança, a orientação é conferida antes de afirmar qualquer coisa.',
      especialista: true
    },
    {
      id: 'contrato',
      exemplos: ['vou assinar um contrato novo', 'qual a diferenca de empreitada global', 'empreitada ou administracao', 'contrato de empreitada', 'o que olhar antes de assinar'],
      chaves: ['empreitada', 'contrato novo', 'assinar', 'administracao de obra', 'preco fechado', 'preco global'],
      resposta: 'O contrato define quase tudo do lado contábil e fiscal: se há fornecimento de material e em que extensão, quem é o responsável pela obra, onde ela acontece, como são as medições e quem retém o quê.\nPor isso a mesma construtora pode ter contratos com tratamentos diferentes ao mesmo tempo. O melhor momento para conversar é antes de assinar: depois, o que sobra é cumprir.',
      especialista: true
    },
    {
      id: 'bdi',
      exemplos: ['o que e bdi', 'bdi no orcamento', 'bonificacao e despesas indiretas'],
      chaves: ['bdi', 'bonificac', 'despesas indiretas'],
      resposta: 'BDI é a bonificação e despesas indiretas: a composição que fecha o preço no orçamento da obra. Sem ele formalizado, fica difícil defender a composição da margem de cada contrato.'
    },
    {
      id: 'habite-se',
      exemplos: ['o que e habite se', 'habite se travado', 'preciso do habite se'],
      chaves: ['habite'],
      resposta: 'O Habite-se é o documento que atesta a conclusão da obra e permite a ocupação. Problema de CNO e de certidão costuma aparecer justamente nessa hora, quando a obra já acabou.\nSe ele está travado por pendência, isso tem prazo: vale falar com a equipe agora.',
      especialista: true,
      urgente: true
    }
  ]
};

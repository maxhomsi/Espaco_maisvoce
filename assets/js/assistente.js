/*
 * Espaço Mais Você — assistente do balão do WhatsApp
 * Menu de perguntas frequentes + busca por palavra-chave.
 * Só responde com informações reais; o que não tiver resposta
 * vira "fale com a equipe", com a mensagem já preenchida.
 */
(function () {
  "use strict";
  var MV = window.MV, CFG = MV.cfg, esc = MV.esc, norm = MV.semAcento;

  /* Palavras comuns ignoradas na busca */
  var IGNORAR = ("a o as os um uma uns umas de da do das dos d e é eh ou que q quê como cm vocês voces voce você vc vcs " +
    "para pra pro pros por pelo pela no na nos nas num numa em me mim meu minha meus minhas se te ti tu " +
    "eu ela ele elas eles isso isto esse essa este esta aquele aquela ai aí la lá aqui ja já tbm tambem também " +
    "oi ola olá bom boa dia tarde noite tudo bem obrigado obrigada por favor favor gostaria queria quero saber " +
    "sobre qual quais tem têm ter tenho faz fazem fazer feito ser sao são é foi vai vou posso pode podem " +
    "durante mais muito muita algum alguma ao aos à às com sem até ate entao então ne né sim nao não").split(/\s+/);
  var IGN = {}; IGNORAR.forEach(function (w) { IGN[norm(w)] = 1; });

  function tokens(txt) {
    return norm(txt).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(function (w) { return w && !IGN[w]; });
  }
  function bate(tk, chave) {
    if (tk === chave) return true;
    if (chave.length <= 3) return false; // chaves curtas (dor, pix, dra) só valem exatas
    if (tk.indexOf(chave) === 0 && tk.length - chave.length <= 4) return true; // plural/variações
    return tk.length >= 4 && chave.indexOf(tk) === 0;
  }

  function endereco() {
    var e = CFG.endereco || {};
    return e.linha1 + "<br>" + e.linha2 + "<br>" + e.cidade + (e.cep ? " · CEP " + e.cep : "");
  }
  function horarios() {
    return (CFG.horarios || []).map(function (h) { return "<b>" + esc(h.dias) + ":</b> " + esc(h.horas); }).join("<br>");
  }

  /* Perguntas frequentes — respostas baseadas no material da clínica */
  var FAQ = [
    {
      id: "preco", rotulo: "Quanto custa?",
      chaves: { preco: 3, valor: 3, valores: 3, custa: 3, custo: 3, quanto: 1, pacote: 2, promocao: 2, promo: 2, desconto: 2, barato: 2, investimento: 2, orcamento: 3 },
      resposta: function () {
        return "<p>Os valores dependem do protocolo indicado na sua <b>avaliação personalizada</b>, por isso não publicamos preços no site.</p><p>A equipe informa valores e condições atuais pelo WhatsApp.</p>";
      },
      equipe: "Olá! Vim pelo site e gostaria de saber valores e condições"
    },
    {
      id: "duracao", rotulo: "Quanto tempo dura?",
      chaves: { tempo: 2, dura: 3, durar: 3, duracao: 3, efeito: 2, quanto: 0.5, manutencao: 3, resultado: 1, resultados: 1, sessoes: 2, sessao: 2, aplicacoes: 2, frequencia: 2 },
      resposta: function () {
        return "<p>Depende do procedimento e de cada pessoa:</p><p>• <b>Toxina botulínica (Botox):</b> o efeito é temporário — em geral são indicadas cerca de 3 aplicações ao ano (aprox. a cada 4 meses), conforme avaliação.<br>• <b>Criolipólise e bioestimulador de colágeno:</b> os resultados são progressivos, ao longo das semanas e meses seguintes.</p><p>Para o seu caso, a equipe orienta na avaliação.</p>";
      },
      equipe: "Olá! Vim pelo site e queria saber quanto tempo dura o resultado"
    },
    {
      id: "dor", rotulo: "Dói?",
      chaves: { doi: 3, dor: 3, doer: 3, dolorido: 3, dolorosa: 3, doloroso: 3, anestesia: 3, anestesico: 3, incomoda: 2, agulha: 2, agulhas: 2, medo: 2, sensivel: 1, invasivo: 2 },
      resposta: function () {
        return "<p>O conforto é prioridade. Alguns exemplos:</p><p>• No <b>preenchimento labial</b> é usada anestesia tópica.<br>• A <b>criolipólise</b> é não invasiva — sem cortes ou agulhas.</p><p>A sensação varia de pessoa para pessoa e de procedimento para procedimento; tire suas dúvidas com a equipe.</p>";
      },
      equipe: "Olá! Vim pelo site e queria saber se o procedimento dói"
    },
    {
      id: "contra", rotulo: "Contraindicações",
      chaves: { contraindicacao: 3, contraindicacoes: 3, contra: 2, indicado: 2, indicada: 2, gravida: 3, gestante: 3, gravidez: 3, amamentando: 3, amamentacao: 3, alergia: 3, alergica: 3, risco: 2, riscos: 2, seguro: 1, segura: 1, idade: 2, menor: 2, remedio: 2, medicamento: 2 },
      resposta: function () {
        return "<p>Indicações e contraindicações são analisadas <b>individualmente na avaliação</b>, considerando seu histórico e seus objetivos.</p><p>Para uma orientação segura, fale direto com a equipe.</p>";
      },
      equipe: "Olá! Vim pelo site e tenho uma dúvida sobre contraindicações"
    },
    {
      id: "agendar", rotulo: "Como agendar",
      chaves: { agendar: 3, agenda: 2, agendamento: 3, marcar: 3, marco: 2, horario: 1, vaga: 2, vagas: 2, consulta: 2, avaliacao: 2, atendimento: 1, reservar: 2 },
      resposta: function () {
        return "<p>Você pode agendar pelo <b>WhatsApp " + esc(CFG.whatsappExibicao) + "</b>, pelo Direct do Instagram " + esc(CFG.instagramUsuario) + " ou pelo formulário do site.</p><p>Todo tratamento começa com uma <b>avaliação individualizada</b>.</p>";
      },
      acoes: [["Formulário de agendamento", "contato.html#agendar"]],
      equipe: "Olá! Vim pelo site e gostaria de agendar uma avaliação"
    },
    {
      id: "local", rotulo: "Onde fica?",
      chaves: { onde: 3, fica: 2, endereco: 3, localizacao: 3, local: 2, chegar: 3, shopping: 2, nova: 1, america: 1, sala: 2, mapa: 3, del: 1, castilho: 2, bairro: 2 },
      resposta: function () { return "<p>Estamos no <b>Shopping Nova América</b>:</p><p>" + endereco() + "</p>"; },
      acoes: [["Abrir no mapa", "maps"]]
    },
    {
      id: "horario", rotulo: "Horário de funcionamento",
      chaves: { horario: 2, horarios: 3, funcionamento: 3, funciona: 3, abre: 3, aberto: 3, fecha: 3, fechado: 3, sabado: 3, domingo: 3, feriado: 2, segunda: 2, sexta: 2, hoje: 1, atende: 1, atendem: 1 },
      resposta: function () { return "<p>" + horarios() + "</p><p class='pequeno'>Atendimento com hora marcada.</p>"; }
    },
    {
      id: "pagamento", rotulo: "Formas de pagamento",
      chaves: { pagamento: 3, pagar: 3, cartao: 3, credito: 3, debito: 3, pix: 3, parcela: 3, parcelar: 3, parcelado: 3, parcelamento: 3, vezes: 2, dinheiro: 3, boleto: 3 },
      resposta: function () {
        return "<p>As formas de pagamento e condições são informadas pela equipe no momento do agendamento.</p>";
      },
      equipe: "Olá! Vim pelo site e queria saber as formas de pagamento"
    },
    {
      id: "quem", rotulo: "Quem atende?",
      chaves: { quem: 3, profissional: 3, doutora: 3, dra: 3, christianne: 3, cristiane: 3, chris: 3, cris: 3, responsavel: 3, formacao: 3, experiencia: 2, equipe: 2, medica: 2, enfermeira: 2 },
      resposta: function () {
        var r = CFG.responsavel || {};
        return "<p>Os protocolos são conduzidos pela <b>" + esc(r.nome) + "</b> (" + esc(r.titulo) + "), com mais de 10 anos de experiência em rejuvenescimento facial, corporal e glúteo." + (r.registro ? " " + esc(r.registro) + "." : "") + "</p>";
      },
      acoes: [["Conhecer a Dra.", "sobre.html"]]
    },
    {
      id: "homens", rotulo: "Atende homens?",
      chaves: { homem: 3, homens: 3, masculino: 3, marido: 2, namorado: 2, casal: 3, casais: 3 },
      resposta: function () { return "<p>Sim! Atendemos mulheres e homens — inclusive casais que fazem Botox juntos.</p>"; }
    },
    {
      id: "tratamentos", rotulo: "Quais tratamentos?",
      chaves: { tratamentos: 3, tratamento: 1, procedimentos: 3, procedimento: 1, servicos: 3, servico: 2, lista: 2, opcoes: 2, facial: 1, faciais: 2, corporal: 1, corporais: 2, corpo: 1, rosto: 1 },
      resposta: function () {
        return "<p>Fazemos tratamentos <b>faciais</b> (como Botox, Laser Lavieen, bioestimulador de colágeno, fios de PDO e limpeza de pele Premium) e <b>corporais</b> (como Master Combo, Criolipólise 360° e harmonização de glúteos).</p>";
      },
      acoes: [["Ver todos os tratamentos", "tratamentos.html"]]
    },
    {
      id: "antesdepois", rotulo: "Resultados",
      chaves: { antes: 3, depois: 2, fotos: 2, foto: 2, resultado: 1, resultados: 1, garantia: 3, garante: 3, natural: 2, exagero: 2, exagerado: 2, avaliacoes: 2, google: 2 },
      resposta: function () {
        return "<p>Nosso foco é realçar a sua beleza <b>sem exageros</b>, com resultados naturais. Cada caso é avaliado individualmente e os resultados variam de pessoa para pessoa.</p><p>Nossa nota no Google é <b>" + esc(CFG.google.nota) + "</b> (" + esc(CFG.google.avaliacoes) + " avaliações).</p>";
      },
      acoes: [["Ver no Instagram", "insta"]]
    }
  ];

  var tratamentos = [];
  var APELIDOS = { botox: "toxina-botulinica", toxina: "toxina-botulinica", botulinica: "toxina-botulinica", dysport: "toxina-botulinica",
    lavieen: "laser-lavieen", thulium: "laser-lavieen", crio: "criolipolise-360", criolipolise: "criolipolise-360",
    gluteo: "harmonizacao-de-gluteos", gluteos: "harmonizacao-de-gluteos", bumbum: "harmonizacao-de-gluteos",
    pdo: "fios-de-pdo", fios: "fios-de-pdo", labios: "preenchimento-labial", labial: "preenchimento-labial", boca: "preenchimento-labial",
    limpeza: "limpeza-de-pele-premium", colageno: "bioestimulador-de-colageno", bioestimulador: "bioestimulador-de-colageno",
    radiesse: "bioestimulador-de-colageno", sculptra: "bioestimulador-de-colageno", elleva: "bioestimulador-de-colageno",
    microagulhamento: "microagulhamento", pdrn: "microagulhamento", peeling: "blend-quimico", blend: "blend-quimico",
    mastercombo: "master-combo", combo: "master-combo", master: "master-combo", enzima: "lipo-enzimatica", enzimas: "lipo-enzimatica",
    enzimatica: "lipo-enzimatica", lipo: "lipo-enzimatica", mesolipoterapia: "lipo-enzimatica", gordura: "criolipolise-360",
    radiofrequencia: "radiofrequencia", manta: "manta-termica", celulite: "tratamento-de-celulite", ultrassom: "tratamento-de-celulite",
    melasma: "laser-lavieen", manchas: "laser-lavieen", mancha: "laser-lavieen", rugas: "toxina-botulinica", ruga: "toxina-botulinica",
    flacidez: "bioestimulador-de-colageno" };

  // palavras genéricas não identificam um tratamento sozinhas (ex.: "depilação a laser")
  var GENERICAS = { laser: 1, pele: 1, tratamento: 1, premium: 1, facial: 1, corporal: 1, harmonizacao: 1, preenchimento: 1, peeling: 0 };
  function acharTratamento(tks) {
    var melhor = null, nota = 0;
    tks.forEach(function (tk) {
      if (tk.length < 3) return;
      Object.keys(APELIDOS).forEach(function (a) {
        if (tk === a || (a.length >= 5 && tk.indexOf(a) === 0) || (tk.length >= 5 && a.indexOf(tk) === 0)) {
          var t = tratamentos.filter(function (x) { return x.id === APELIDOS[a]; })[0];
          if (t && 3 > nota) { melhor = t; nota = 3; }
        }
      });
      tratamentos.forEach(function (t) {
        var palavras = tokens(t.nome).filter(function (w) { return w.length >= 4 && !GENERICAS[w]; });
        palavras.forEach(function (w) {
          if ((tk === w || (tk.length >= 5 && w.indexOf(tk) === 0)) && 2 > nota) { melhor = t; nota = 2; }
        });
      });
    });
    return melhor;
  }

  function responder(pergunta) {
    var tks = tokens(pergunta);
    var placar = FAQ.map(function (f) {
      var s = 0;
      tks.forEach(function (tk) {
        var maior = 0;
        Object.keys(f.chaves).forEach(function (c) { if (bate(tk, c) && f.chaves[c] > maior) maior = f.chaves[c]; });
        s += maior;
      });
      return { f: f, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
    var trat = acharTratamento(tks);
    var top = placar[0];
    return { faq: top && top.s >= 2 ? top.f : null, trat: trat, tokens: tks };
  }

  /* ---------- interface ---------- */
  var ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICO_ENV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 16-2-6-8-2z"/></svg>';

  var balao, painel, corpo, campo;

  function linkAcao(a) {
    if (a[1] === "maps") return '<a class="btn btn-secundario btn-pequeno" target="_blank" rel="noopener" href="' + esc(CFG.mapsLink) + '">' + esc(a[0]) + "</a>";
    if (a[1] === "insta") return '<a class="btn btn-secundario btn-pequeno" target="_blank" rel="noopener" href="' + esc(CFG.instagram) + '">' + esc(a[0]) + "</a>";
    return '<a class="btn btn-secundario btn-pequeno" href="' + esc(a[1]) + '">' + esc(a[0]) + "</a>";
  }
  function botaoEquipe(msg, rotulo) {
    return '<a class="btn btn-primario btn-pequeno" target="_blank" rel="noopener" href="' + esc(MV.waLink(msg)) + '">' + MV.icones.whats + esc(rotulo || "Falar com a equipe") + "</a>";
  }
  function addMsg(html, eu) {
    var d = document.createElement("div");
    d.className = "msg " + (eu ? "msg-eu" : "msg-bot");
    if (eu) d.textContent = html; else d.innerHTML = html;
    corpo.appendChild(d);
    corpo.scrollTop = corpo.scrollHeight;
    return d;
  }
  function chips() {
    var d = document.createElement("div");
    d.className = "as-chips";
    d.innerHTML = FAQ.slice(0, 9).map(function (f) { return '<button type="button" data-faq="' + f.id + '">' + esc(f.rotulo) + "</button>"; }).join("");
    corpo.appendChild(d);
  }

  function mostrarFAQ(f, perguntaOriginal, trat) {
    var html = f.resposta();
    var acoes = (f.acoes || []).map(linkAcao);
    if (trat) acoes.unshift('<a class="btn btn-secundario btn-pequeno" href="tratamento.html?t=' + encodeURIComponent(trat.id) + '">Sobre ' + esc(trat.nome) + "</a>");
    if (f.equipe) {
      var m = f.equipe + (trat ? " — " + trat.nome : "") + "." + (perguntaOriginal ? "\nMinha pergunta: " + perguntaOriginal : "");
      acoes.push(botaoEquipe(m));
    }
    addMsg(html + (acoes.length ? '<div class="acoes">' + acoes.join("") + "</div>" : ""));
  }

  function perguntar(txt) {
    txt = String(txt || "").trim(); if (!txt) return;
    addMsg(txt, true);
    var r = responder(txt);
    setTimeout(function () {
      if (r.faq) { mostrarFAQ(r.faq, txt, r.trat); return; }
      if (r.trat) {
        var t = r.trat;
        addMsg("<p><b>" + esc(t.nome) + "</b></p>" +
          (t.descricao ? "<p>" + esc(MV.resumo(t.descricao, 230)) + "</p>" : "<p>Sim, realizamos este tratamento. A equipe explica tudo na avaliação.</p>") +
          '<div class="acoes"><a class="btn btn-secundario btn-pequeno" href="tratamento.html?t=' + encodeURIComponent(t.id) + '">Ver detalhes</a>' +
          botaoEquipe(MV.agendarMsg(t.nome), "Agendar") + "</div>");
        return;
      }
      addMsg("<p>Não encontrei essa resposta por aqui. A nossa equipe responde rapidinho pelo WhatsApp — sua pergunta já vai preenchida:</p>" +
        '<div class="acoes">' + botaoEquipe("Olá! Vim pelo site e tenho uma dúvida: " + txt) + "</div>");
    }, 250);
  }

  function abrir() {
    painel.classList.add("aberto");
    balao.setAttribute("aria-expanded", "true");
    var p = balao.querySelector(".ponto"); if (p) p.remove();
    if (!corpo.childElementCount) {
      addMsg("<p>Olá! 🤍 Sou o assistente do <b>" + esc(CFG.nomeCurto) + "</b>.</p><p>Escolha uma dúvida ou digite sua pergunta:</p>");
      chips();
      addMsg('<div class="acoes" style="margin-top:0">' + botaoEquipe(MV.agendarMsg(), "Falar direto no WhatsApp") + "</div>");
    }
    setTimeout(function () { campo.focus(); }, 50);
  }
  function fechar() {
    painel.classList.remove("aberto");
    balao.setAttribute("aria-expanded", "false");
    balao.focus();
  }

  function montar() {
    balao = document.createElement("button");
    balao.className = "balao"; balao.type = "button";
    balao.setAttribute("aria-label", "Abrir atendimento: dúvidas e WhatsApp");
    balao.setAttribute("aria-expanded", "false");
    balao.setAttribute("aria-controls", "assistente");
    balao.innerHTML = MV.icones.whats + '<span class="ponto" aria-hidden="true"></span>';

    painel = document.createElement("section");
    painel.className = "assistente"; painel.id = "assistente";
    painel.setAttribute("role", "dialog"); painel.setAttribute("aria-label", "Assistente de atendimento");
    painel.innerHTML =
      '<div class="as-topo"><div class="av"><img src="assets/img/simbolo-espaco-mais-voce.png" alt=""></div>' +
      "<div><strong>" + esc(CFG.nomeCurto) + "</strong><span>Dúvidas frequentes · WhatsApp " + esc(CFG.whatsappExibicao) + "</span></div>" +
      '<button type="button" class="as-fechar" aria-label="Fechar assistente">' + ICO_X + "</button></div>" +
      '<div class="as-corpo" aria-live="polite"></div>' +
      '<form class="as-form" autocomplete="off"><label class="sr-only" for="as-campo">Digite sua pergunta</label>' +
      '<input id="as-campo" type="text" maxlength="200" placeholder="Ex.: botox dói? quanto custa?">' +
      '<button type="submit" aria-label="Enviar pergunta">' + ICO_ENV + "</button></form>";

    document.body.appendChild(painel);
    document.body.appendChild(balao);
    corpo = painel.querySelector(".as-corpo");
    campo = painel.querySelector("#as-campo");

    balao.addEventListener("click", function () { painel.classList.contains("aberto") ? fechar() : abrir(); });
    painel.querySelector(".as-fechar").addEventListener("click", fechar);
    painel.querySelector(".as-form").addEventListener("submit", function (e) { e.preventDefault(); var v = campo.value; campo.value = ""; perguntar(v); });
    corpo.addEventListener("click", function (e) {
      var b = e.target.closest("[data-faq]"); if (!b) return;
      var f = FAQ.filter(function (x) { return x.id === b.getAttribute("data-faq"); })[0];
      addMsg(f.rotulo, true);
      setTimeout(function () { mostrarFAQ(f, "", null); }, 200);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && painel.classList.contains("aberto")) fechar(); });
    $$abrirLinks();
  }
  function $$abrirLinks() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-abrir-assistente]"), function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); abrir(); });
    });
  }

  // exposto para testes
  window.MVAssistente = { responder: responder, perguntar: perguntar, abrir: abrir, tokens: tokens };

  document.addEventListener("DOMContentLoaded", function () {
    montar();
    MV.carregarTratamentos().then(function (l) { tratamentos = l; });
  });
})();

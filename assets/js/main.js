/*
 * Espaço Mais Você — interações do site
 */
(function () {
  "use strict";
  var MV = window.MV, CFG = MV.cfg, esc = MV.esc;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduzir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dados do config nas páginas ---------- */
  function preencherConfig() {
    $$("[data-cfg]").forEach(function (el) {
      var caminho = el.getAttribute("data-cfg").split(".");
      var v = caminho.reduce(function (o, k) { return o == null ? o : o[k]; }, CFG);
      if (v == null || v === "") { if (el.hasAttribute("data-ocultar-vazio")) el.hidden = true; return; }
      el.textContent = v;
    });
    $$("[data-cfg-esconder]").forEach(function (el) {
      var caminho = el.getAttribute("data-cfg-esconder").split(".");
      var v = caminho.reduce(function (o, k) { return o == null ? o : o[k]; }, CFG);
      if (v == null || v === "") el.hidden = true;
    });
    $$("[data-wa]").forEach(function (a) {
      var msg = a.getAttribute("data-wa") || MV.agendarMsg();
      a.href = MV.waLink(msg);
      a.target = "_blank"; a.rel = "noopener";
    });
    $$("[data-email]").forEach(function (a) {
      if (!CFG.email) { var p = a.closest("[data-email-bloco]"); (p || a).hidden = true; return; }
      a.href = "mailto:" + CFG.email; a.textContent = CFG.email;
    });
    $$("[data-insta]").forEach(function (a) { a.href = CFG.instagram; a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-maps]").forEach(function (a) { a.href = CFG.mapsLink; a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-google]").forEach(function (a) { a.href = CFG.google.link; a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-horarios]").forEach(function (t) {
      t.innerHTML = "<tbody>" + (CFG.horarios || []).map(function (h) {
        return "<tr><td>" + esc(h.dias) + "</td><td>" + esc(h.horas) + "</td></tr>";
      }).join("") + "</tbody>";
    });
    $$("[data-registro]").forEach(function (el) {
      var r = (CFG.responsavel || {}).registro;
      if (r) el.textContent = r; else el.hidden = true;
    });
    $$("[data-ano]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Cabeçalho ---------- */
  function cabecalho() {
    var topo = $(".topo"); if (!topo) return;
    var btn = $(".btn-menu", topo);
    function rolou() { topo.classList.toggle("rolou", window.scrollY > 10); }
    window.addEventListener("scroll", rolou, { passive: true }); rolou();
    if (btn) {
      btn.addEventListener("click", function () {
        var aberto = topo.classList.toggle("aberto");
        btn.setAttribute("aria-expanded", aberto ? "true" : "false");
        btn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      });
      $$(".menu a", topo).forEach(function (a) {
        a.addEventListener("click", function () { topo.classList.remove("aberto"); btn.setAttribute("aria-expanded", "false"); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && topo.classList.contains("aberto")) { topo.classList.remove("aberto"); btn.setAttribute("aria-expanded", "false"); btn.focus(); }
      });
    }
  }

  /* ---------- Animações ao rolar ---------- */
  var observador = null;
  function revelar(raiz) {
    var itens = $$(".revelar:not(.visivel)", raiz);
    if (!("IntersectionObserver" in window) || reduzir) { itens.forEach(function (el) { el.classList.add("visivel"); }); return; }
    if (!observador) {
      observador = new IntersectionObserver(function (ent) {
        ent.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visivel"); observador.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    itens.forEach(function (el) { observador.observe(el); });
  }

  /* ---------- Palavra que gira ---------- */
  function palavraGira() {
    $$(".palavra-gira").forEach(function (el) {
      var lista = (el.getAttribute("data-palavras") || "").split("|").filter(Boolean);
      if (lista.length < 2 || reduzir) return;
      var i = 0;
      setInterval(function () {
        el.classList.add("saindo");
        setTimeout(function () {
          i = (i + 1) % lista.length;
          el.textContent = lista[i];
          el.classList.remove("saindo"); el.classList.add("entrando");
          void el.offsetWidth;
          el.classList.remove("entrando");
        }, 450);
      }, 2600);
    });
  }

  /* ---------- Moldura de fotos ---------- */
  function moldura() {
    $$(".moldura").forEach(function (m) {
      var imgs = $$(".slide", m); if (imgs.length < 2 || reduzir) return;
      var i = 0;
      setInterval(function () {
        imgs[i].classList.remove("ativa");
        i = (i + 1) % imgs.length;
        imgs[i].classList.add("ativa");
      }, 5200);
    });
  }

  /* ---------- Carrossel (arrastar + setas) ---------- */
  function carrossel(wrap) {
    var trilho = $(".carrossel", wrap); if (!trilho) return;
    var ant = $(".seta-ant", wrap), prox = $(".seta-prox", wrap);
    function passo() {
      var c = trilho.firstElementChild; if (!c) return 300;
      return c.getBoundingClientRect().width + 16;
    }
    function estado() {
      var max = trilho.scrollWidth - trilho.clientWidth - 2;
      if (ant) ant.disabled = trilho.scrollLeft <= 2;
      if (prox) prox.disabled = trilho.scrollLeft >= max;
    }
    if (ant) ant.addEventListener("click", function () { trilho.scrollBy({ left: -passo(), behavior: "smooth" }); });
    if (prox) prox.addEventListener("click", function () { trilho.scrollBy({ left: passo(), behavior: "smooth" }); });
    trilho.addEventListener("scroll", estado, { passive: true });
    window.addEventListener("resize", estado);
    // arrastar com o mouse (links e imagens não podem iniciar "arrastar arquivo")
    trilho.addEventListener("dragstart", function (e) { e.preventDefault(); });
    var ativo = false, moveu = false, x0 = 0, s0 = 0;
    trilho.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      ativo = true; moveu = false; x0 = e.clientX; s0 = trilho.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!ativo) return;
      var dx = e.clientX - x0;
      if (!moveu && Math.abs(dx) > 5) { moveu = true; trilho.classList.add("arrastando"); }
      if (moveu) { trilho.scrollLeft = s0 - dx; e.preventDefault(); }
    });
    window.addEventListener("pointerup", function () {
      if (!ativo) return; ativo = false;
      if (moveu) {
        // encaixa no card mais próximo
        var p = passo();
        var alvo = Math.round(trilho.scrollLeft / p) * p;
        trilho.classList.remove("arrastando");
        trilho.scrollTo({ left: alvo, behavior: "smooth" });
      }
    });
    trilho.addEventListener("click", function (e) { if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; } }, true);
    trilho.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { trilho.scrollBy({ left: passo(), behavior: "smooth" }); }
      if (e.key === "ArrowLeft") { trilho.scrollBy({ left: -passo(), behavior: "smooth" }); }
    });
    estado();
    setTimeout(estado, 400);
  }

  /* ---------- Página: Início ---------- */
  function paginaInicio() {
    var alvo = $("#carrossel-tratamentos");
    MV.carregarTratamentos().then(function (lista) {
      var dest = lista.filter(function (t) { return t.destaque; });
      if (!dest.length) dest = lista.filter(function (t) { return t.descricao; }).slice(0, 8);
      alvo.innerHTML = dest.map(function (t) { return MV.cardHTML(t); }).join("");
      carrossel(alvo.closest(".carrossel-wrap"));
    });
    var ag = $("#agenda");
    if (ag) MV.carregarAgenda().then(function (itens) {
      if (!itens.length) return;
      $(".agenda", ag).innerHTML = itens.map(function (a) {
        var msg = "Olá! Vi no site: " + a.titulo + (a.data ? " (" + a.data + ")" : "") + ". Gostaria de mais informações.";
        return '<div class="agenda-item revelar">' +
          (a.data ? '<span class="data">' + esc(a.data) + "</span>" : "") +
          "<h3>" + esc(a.titulo) + "</h3>" +
          (a.descricao ? "<p>" + esc(a.descricao) + "</p>" : "") +
          '<div style="margin-top:8px"><a class="btn btn-linha btn-pequeno" target="_blank" rel="noopener" href="' +
          esc(a.link || MV.waLink(msg)) + '">Quero saber mais</a></div></div>';
      }).join("");
      ag.hidden = false; revelar(ag);
    });
  }

  /* ---------- Página: Tratamentos ---------- */
  function paginaTratamentos() {
    var grade = $("#grade-tratamentos"), busca = $("#busca-tratamentos");
    var chips = $$(".filtros .chip");
    var params = new URLSearchParams(location.search);
    var cat = params.get("cat") || "Todos";
    var todos = [];
    function desenhar() {
      var q = MV.semAcento(busca.value).trim();
      var lista = todos.filter(function (t) {
        if (!t.descricao) return false;
        if (cat !== "Todos" && MV.semAcento(t.categoria) !== MV.semAcento(cat)) return false;
        if (!q) return true;
        return MV.semAcento(t.nome + " " + t.descricao + " " + t.indicacao + " " + t.categoria).indexOf(q) >= 0;
      });
      grade.innerHTML = lista.length ? lista.map(function (t) { return MV.cardHTML(t); }).join("") :
        '<div class="card vazio" style="grid-column:1/-1">Nenhum tratamento encontrado. <a data-wa="" href="#">Pergunte à equipe pelo WhatsApp</a>.</div>';
      if (!lista.length) preencherConfig();
      // lista de "outros"
      var outros = todos.filter(function (t) { return !t.descricao; });
      var blocos = { Facial: [], Corporal: [], Outros: [] };
      outros.forEach(function (t) {
        var k = /facial/i.test(t.categoria) ? "Facial" : /corpo/i.test(t.categoria) ? "Corporal" : "Outros";
        if (q && MV.semAcento(t.nome).indexOf(q) < 0) return;
        if (cat !== "Todos" && k !== cat) return;
        blocos[k].push(t);
      });
      var caixa = $("#outros-tratamentos");
      var html = Object.keys(blocos).filter(function (k) { return blocos[k].length; }).map(function (k) {
        return "<div><h3>" + (k === "Outros" ? "Outros" : k === "Facial" ? "Faciais" : "Corporais") + "</h3><ul>" +
          blocos[k].map(function (t) { return "<li>" + esc(t.nome) + "</li>"; }).join("") + "</ul></div>";
      }).join("");
      caixa.hidden = !html;
      $(".outros-grid", caixa).innerHTML = html;
    }
    chips.forEach(function (c) {
      var v = c.getAttribute("data-cat");
      c.setAttribute("aria-pressed", v === cat ? "true" : "false");
      c.addEventListener("click", function () {
        cat = v;
        chips.forEach(function (o) { o.setAttribute("aria-pressed", o === c ? "true" : "false"); });
        var u = new URL(location.href);
        if (cat === "Todos") u.searchParams.delete("cat"); else u.searchParams.set("cat", cat);
        history.replaceState(null, "", u);
        desenhar();
      });
    });
    busca.addEventListener("input", desenhar);
    MV.carregarTratamentos().then(function (l) { todos = l; desenhar(); });
  }

  /* ---------- Página: Tratamento (detalhe) ---------- */
  function paginaTratamento() {
    var id = new URLSearchParams(location.search).get("t") || "";
    var alvo = $("#tratamento");
    MV.carregarTratamentos().then(function (lista) {
      var t = lista.filter(function (x) { return x.id === id; })[0];
      if (!t) {
        alvo.innerHTML = '<div class="card p404"><div class="grande">Ops.</div><h1>Tratamento não encontrado</h1>' +
          '<p class="suave">Ele pode ter sido renomeado ou retirado do site.</p>' +
          '<div class="grupo-btn" style="justify-content:center"><a class="btn btn-primario" href="tratamentos.html">Ver todos os tratamentos</a></div></div>';
        document.title = "Tratamento não encontrado | " + CFG.nome;
        return;
      }
      document.title = t.nome + " | " + CFG.nome + " — Shopping Nova América";
      var md = $('meta[name="description"]');
      if (md && t.descricao) md.setAttribute("content", MV.resumo(t.descricao, 155));
      var msg = MV.agendarMsg(t.nome);
      var linkAg = t.link || MV.waLink(msg);
      var info = [];
      if (t.indicacao) info.push(["alvo", "Para que serve", t.indicacao]);
      if (t.duracao) info.push(["relogio", "Duração", t.duracao]);
      if (t.preco && CFG.mostrarPrecos) info.push(["etiqueta", "Valor", t.preco]);
      info.push(["folha", "Primeiro passo", "Avaliação individualizada para indicar o protocolo ideal para você."]);
      var fotos = t.fotos.length ? '<div class="galeria-mini">' + t.fotos.map(function (f) {
        return '<img src="' + esc(f) + '" alt="' + esc(t.nome) + '" loading="lazy">';
      }).join("") + "</div>" : "";
      alvo.innerHTML =
        '<nav class="migalhas" aria-label="Você está em"><a href="index.html">Início</a> · <a href="tratamentos.html">Tratamentos</a> · ' + esc(t.nome) + "</nav>" +
        '<div class="trat-grid">' +
        '<div class="revelar"><div class="trat-foto">' + MV.imgOuPlaceholder(t, "eager") + "</div>" + fotos + "</div>" +
        '<div class="card trat-info revelar d1">' +
        '<span class="sobretitulo">' + esc(t.categoria || "Tratamento") + "</span>" +
        "<h1>" + esc(t.nome) + "</h1>" +
        (t.descricao ? '<p class="desc">' + esc(t.descricao) + "</p>" : '<p class="desc suave">Fale com a nossa equipe para saber como este tratamento funciona e se ele é indicado para você.</p>') +
        '<div class="info-lista">' + info.map(function (i) {
          return '<div class="info-item">' + MV.icones[i[0]] + "<div><b>" + i[1] + "</b><span>" + esc(i[2]) + "</span></div></div>";
        }).join("") + "</div>" +
        '<div class="grupo-btn"><a class="btn btn-primario" target="_blank" rel="noopener" href="' + esc(linkAg) + '">' + MV.icones.whats + "Agendar avaliação</a>" +
        '<a class="btn btn-secundario" href="contato.html?t=' + encodeURIComponent(t.id) + '">Preencher formulário</a></div>' +
        '<p class="aviso">Cada caso é avaliado individualmente e os resultados variam de pessoa para pessoa. A indicação do procedimento é feita somente após avaliação profissional.</p>' +
        "</div></div>";
      // relacionados
      var rel = lista.filter(function (x) { return x.id !== t.id && x.descricao && x.categoria === t.categoria; }).slice(0, 8);
      if (rel.length) {
        var sec = $("#relacionados");
        $(".carrossel", sec).innerHTML = rel.map(function (x) { return MV.cardHTML(x); }).join("");
        sec.hidden = false;
        carrossel($(".carrossel-wrap", sec));
      }
      revelar(document);
    });
  }

  /* ---------- Página: Contato (formulário → WhatsApp) ---------- */
  function paginaContato() {
    var form = $("#form-agendamento"); if (!form) return;
    var sel = $("#f-procedimento"), dia = $("#f-dia");
    var hoje = new Date(); hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
    dia.min = hoje.toISOString().slice(0, 10);
    var pre = new URLSearchParams(location.search).get("t");
    MV.carregarTratamentos().then(function (lista) {
      var grupos = { Facial: [], Corporal: [], Outros: [] };
      lista.forEach(function (t) {
        var k = /facial/i.test(t.categoria) ? "Facial" : /corpo/i.test(t.categoria) ? "Corporal" : "Outros";
        grupos[k].push(t);
      });
      Object.keys(grupos).forEach(function (k) {
        if (!grupos[k].length) return;
        var og = document.createElement("optgroup");
        og.label = k === "Facial" ? "Faciais" : k === "Corporal" ? "Corporais" : "Outros";
        grupos[k].forEach(function (t) {
          var o = document.createElement("option"); o.value = t.nome; o.textContent = t.nome;
          if (pre && pre === t.id) o.selected = true;
          og.appendChild(o);
        });
        sel.appendChild(og);
      });
    });
    var avisoDomingo = $("#aviso-dia");
    dia.addEventListener("change", function () {
      if (!dia.value) { avisoDomingo.classList.remove("mostrar"); return; }
      var d = new Date(dia.value + "T12:00:00");
      avisoDomingo.classList.toggle("mostrar", d.getDay() === 0);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("#f-nome").value.trim();
      var ok = true;
      $("#erro-nome").classList.toggle("mostrar", !nome); if (!nome) ok = false;
      var aceite = $("#f-lgpd").checked;
      $("#erro-lgpd").classList.toggle("mostrar", !aceite); if (!aceite) ok = false;
      if (!ok) { (nome ? $("#f-lgpd") : $("#f-nome")).focus(); return; }
      var dataTxt = "";
      if (dia.value) {
        var d = new Date(dia.value + "T12:00:00");
        var sem = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"][d.getDay()];
        dataTxt = dia.value.split("-").reverse().join("/") + " (" + sem + ")";
      }
      var linhas = ["Olá! Vim pelo site do " + CFG.nome + " e gostaria de agendar.", "", "*Nome:* " + nome];
      linhas.push("*Procedimento de interesse:* " + (sel.value || "Avaliação — ainda não sei qual"));
      if (dataTxt) linhas.push("*Melhor dia:* " + dataTxt);
      var hora = $("#f-horario").value; if (hora) linhas.push("*Melhor horário:* " + hora);
      var m = $("#f-mensagem").value.trim(); if (m) linhas.push("*Mensagem:* " + m);
      var url = MV.waLink(linhas.join("\n"));
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (err) {} } else { location.href = url; }
      $("#form-ok").classList.add("mostrar");
    });
    // mapa só carrega quando a pessoa pede (evita cookies de terceiros antes do clique)
    var bm = $("#carregar-mapa");
    if (bm) bm.addEventListener("click", function () {
      var cx = $("#mapa");
      cx.innerHTML = '<iframe title="Mapa: Espaço Mais Você no Shopping Nova América" src="' + esc(CFG.mapsEmbed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
    });
  }

  /* ---------- Inicialização ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    preencherConfig();
    cabecalho();
    revelar(document);
    palavraGira();
    moldura();
    var p = document.body.getAttribute("data-pagina");
    if (p === "inicio") paginaInicio();
    if (p === "tratamentos") paginaTratamentos();
    if (p === "tratamento") paginaTratamento();
    if (p === "contato") paginaContato();
    // revela cards que chegam depois (planilha)
    if ("MutationObserver" in window) {
      new MutationObserver(function () { revelar(document); }).observe(document.body, { childList: true, subtree: true });
    }
  });
})();

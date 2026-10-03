/*
 * Espaço Mais Você — leitura da planilha (CSV) e utilidades
 * A planilha do Google publicada como CSV tem prioridade;
 * se não houver link ou ela falhar, usa /data/*.csv do repositório.
 */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function semAcento(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function sim(v) {
    var t = semAcento(v).trim();
    return t === "sim" || t === "s" || t === "x" || t === "1" || t === "true" || t === "yes" || t === "verdadeiro";
  }
  function waLink(msg) {
    var n = String(CFG.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + n + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  /* Converte links do Google Drive em links de imagem diretos */
  function imagemUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/drive\.google\.com|docs\.google\.com/.test(u)) {
      var m = u.match(/\/d\/([a-zA-Z0-9_-]{10,})/) || u.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
      if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1600";
    }
    return u;
  }

  /* Aceita tanto o link "Publicar na web (CSV)" quanto o link normal da planilha */
  function planilhaUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/output=csv|format=csv|tqx=out:csv/.test(u)) return u;
    var m = u.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/);
    if (m && m[1] !== "e") {
      var gid = (u.match(/[#&?]gid=(\d+)/) || [])[1] || "0";
      return "https://docs.google.com/spreadsheets/d/" + m[1] + "/gviz/tq?tqx=out:csv&gid=" + gid;
    }
    return u;
  }

  /* Parser de CSV (aspas, vírgulas e quebras de linha dentro de campos) */
  function parseCSV(texto) {
    texto = String(texto || "").replace(/^﻿/, "");
    var linhas = [], campo = "", linha = [], i = 0, aspas = false, c;
    // detecta separador (vírgula ou ponto e vírgula)
    var primeira = texto.split(/\r?\n/)[0] || "";
    var sep = (primeira.split(";").length > primeira.split(",").length) ? ";" : ",";
    while (i < texto.length) {
      c = texto[i];
      if (aspas) {
        if (c === '"') {
          if (texto[i + 1] === '"') { campo += '"'; i++; } else { aspas = false; }
        } else { campo += c; }
      } else if (c === '"') { aspas = true; }
      else if (c === sep) { linha.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = "";
      } else { campo += c; }
      i++;
    }
    if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); }
    linhas = linhas.filter(function (l) { return l.some(function (x) { return String(x).trim() !== ""; }); });
    if (!linhas.length) return [];
    var cab = linhas[0].map(function (h) { return semAcento(h).trim().replace(/\s+/g, "_"); });
    return linhas.slice(1).map(function (l) {
      var o = {};
      cab.forEach(function (h, k) { o[h] = (l[k] == null ? "" : String(l[k])).trim(); });
      return o;
    });
  }

  function buscarTexto(url, ms) {
    return new Promise(function (ok, falha) {
      var t = setTimeout(function () { falha(new Error("tempo esgotado")); }, ms || 7000);
      fetch(url, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (txt) { clearTimeout(t); ok(txt); })
        .catch(function (e) { clearTimeout(t); falha(e); });
    });
  }

  /* Tenta a planilha; se falhar ou vier vazia, usa o CSV local */
  function carregarCSV(urlPlanilha, local, colunaObrigatoria) {
    var remoto = planilhaUrl(urlPlanilha);
    function doLocal() {
      return buscarTexto(local, 8000).then(parseCSV).catch(function () { return []; });
    }
    if (!remoto) return doLocal();
    return buscarTexto(remoto, 7000).then(function (txt) {
      if (/^\s*</.test(txt)) throw new Error("resposta não é CSV");
      var dados = parseCSV(txt);
      if (!dados.length || !(colunaObrigatoria in dados[0])) throw new Error("planilha sem colunas esperadas");
      return dados;
    }).catch(function (e) {
      if (window.console) console.warn("[Espaço Mais Você] Planilha indisponível, usando CSV local:", e.message);
      return doLocal();
    });
  }

  var cacheTrat = null;
  function carregarTratamentos() {
    if (cacheTrat) return cacheTrat;
    cacheTrat = carregarCSV((CFG.planilha || {}).tratamentosCSV, "data/tratamentos.csv", "nome").then(function (lista) {
      return lista.filter(function (t) { return t.nome && sim(t.publicar); }).map(function (t, i) {
        var id = t.id || semAcento(t.nome).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        var fotos = String(t.fotos || "").split(/[\s|;,]+/).map(imagemUrl).filter(Boolean);
        return {
          id: id,
          ordem: i,
          destaque: sim(t.destaque),
          nome: t.nome,
          categoria: t.categoria || "",
          descricao: t.descricao || "",
          indicacao: t.indicacao || "",
          duracao: t.duracao || "",
          preco: t.preco || "",
          capa: imagemUrl(t.capa),
          fotos: fotos,
          link: t.link_agendamento || ""
        };
      });
    });
    return cacheTrat;
  }

  function carregarAgenda() {
    return carregarCSV((CFG.planilha || {}).agendaCSV, "data/agenda.csv", "titulo").then(function (l) {
      return l.filter(function (a) { return a.titulo && sim(a.publicar); });
    });
  }

  var ICONES = {
    seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    relogio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    alvo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
    etiqueta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.3"/></svg>',
    folha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/></svg>',
    whats: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.69 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.05-.11-.22-.17-.47-.29z"/></svg>'
  };

  var SIMBOLO = "assets/img/simbolo-espaco-mais-voce.png";

  function imgOuPlaceholder(t, carregamento) {
    if (t.capa) {
      return '<img src="' + esc(t.capa) + '" alt="' + esc(t.nome) + '" loading="' + (carregamento || "lazy") + '" decoding="async" draggable="false" onerror="this.outerHTML=\'<div class=&quot;t-placeholder&quot;><img src=&quot;' + SIMBOLO + '&quot; alt=&quot;&quot;></div>\'">';
    }
    return '<div class="t-placeholder"><img src="' + SIMBOLO + '" alt=""></div>';
  }

  function resumo(txt, max) {
    txt = String(txt || "");
    if (txt.length <= max) return txt;
    var corte = txt.slice(0, max);
    var ponto = corte.lastIndexOf(". ");
    if (ponto > max * 0.55) return corte.slice(0, ponto + 1);
    return corte.slice(0, corte.lastIndexOf(" ")) + "…";
  }

  function cardHTML(t, carregamento) {
    var meta = [];
    if (t.duracao) meta.push("<span><b>Duração:</b> " + esc(t.duracao) + "</span>");
    if (t.preco && CFG.mostrarPrecos) meta.push("<span><b>Valor:</b> " + esc(t.preco) + "</span>");
    return '<a class="card t-card" href="tratamento.html?t=' + encodeURIComponent(t.id) + '">' +
      '<div class="t-img">' + imgOuPlaceholder(t, carregamento) +
      (t.categoria ? '<span class="t-tag">' + esc(t.categoria) + "</span>" : "") + "</div>" +
      '<div class="t-corpo"><h3>' + esc(t.nome) + "</h3>" +
      (t.indicacao ? "<p>" + esc(resumo(t.indicacao, 120)) + "</p>" : "") +
      (meta.length ? '<div class="t-meta">' + meta.join("") + "</div>" : "") +
      '<span class="t-mais">Saiba mais ' + ICONES.seta + "</span></div></a>";
  }

  function agendarMsg(nome) {
    return "Olá! Vim pelo site do " + (CFG.nome || "Espaço Mais Você") +
      " e gostaria de agendar uma avaliação" + (nome ? " para " + nome : "") + ".";
  }

  window.MV = {
    cfg: CFG,
    esc: esc,
    semAcento: semAcento,
    sim: sim,
    waLink: waLink,
    imagemUrl: imagemUrl,
    planilhaUrl: planilhaUrl,
    parseCSV: parseCSV,
    carregarTratamentos: carregarTratamentos,
    carregarAgenda: carregarAgenda,
    cardHTML: cardHTML,
    imgOuPlaceholder: imgOuPlaceholder,
    agendarMsg: agendarMsg,
    resumo: resumo,
    icones: ICONES
  };
})();

#!/usr/bin/env python3
"""
Baixa para o repositório todas as imagens que hoje vêm de fora do site
(Google Drive, Instagram, site antigo etc.) e troca os links pelos arquivos locais.

Rode ANTES de trocar o domínio ou de desligar o site/Drive antigo, para nada quebrar.

Uso (na pasta do projeto):
    python3 scripts/baixar_imagens.py                 # verifica CSVs em data/ e as páginas .html
    python3 scripts/baixar_imagens.py --planilha       # antes, salva a planilha online em data/*.csv
    python3 scripts/baixar_imagens.py --simular        # só lista o que seria baixado

Não precisa instalar nada: usa só a biblioteca padrão do Python 3.
"""
import csv, hashlib, io, mimetypes, os, re, sys, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join("assets", "img", "baixadas")
SIMULAR = "--simular" in sys.argv
UA = {"User-Agent": "Mozilla/5.0 (baixar_imagens.py)"}


def drive_direto(url):
    m = re.search(r"/d/([A-Za-z0-9_-]{10,})", url) or re.search(r"[?&]id=([A-Za-z0-9_-]{10,})", url)
    if m and ("drive.google" in url or "docs.google" in url):
        return "https://drive.google.com/uc?export=download&id=" + m.group(1)
    return url


def baixar(url):
    """Baixa a imagem e devolve o caminho local (relativo à raiz do site)."""
    real = drive_direto(url)
    nome_base = hashlib.sha1(url.encode()).hexdigest()[:12]
    os.makedirs(os.path.join(RAIZ, DESTINO), exist_ok=True)
    for ext in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"):
        existente = os.path.join(DESTINO, nome_base + ext)
        if os.path.exists(os.path.join(RAIZ, existente)):
            return existente.replace(os.sep, "/")
    if SIMULAR:
        print("  [simulação] baixaria:", url)
        return None
    req = urllib.request.Request(real, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        tipo = (r.headers.get("Content-Type") or "").split(";")[0]
        dados = r.read()
    if not tipo.startswith("image/"):
        print("  ! não é imagem (verifique se o arquivo está público):", url)
        return None
    ext = mimetypes.guess_extension(tipo) or ".jpg"
    if ext == ".jpe":
        ext = ".jpg"
    caminho = os.path.join(DESTINO, nome_base + ext)
    with open(os.path.join(RAIZ, caminho), "wb") as f:
        f.write(dados)
    print("  ✓", url, "→", caminho)
    return caminho.replace(os.sep, "/")


def eh_externa(v):
    return bool(re.match(r"https?://", v or ""))


def salvar_planilha():
    sys.path.insert(0, RAIZ)
    cfg = open(os.path.join(RAIZ, "assets", "js", "config.js"), encoding="utf-8").read()
    for chave, arquivo in (("tratamentosCSV", "tratamentos.csv"), ("agendaCSV", "agenda.csv")):
        m = re.search(chave + r'\s*:\s*"([^"]*)"', cfg)
        url = m.group(1).strip() if m else ""
        if not url:
            print(f"- {chave} vazio no config.js (mantendo data/{arquivo})")
            continue
        if "output=csv" not in url and "format=csv" not in url and "tqx=out:csv" not in url:
            m2 = re.search(r"/spreadsheets/d/([A-Za-z0-9_-]{20,})", url)
            gid = (re.search(r"gid=(\d+)", url) or [None, "0"])[1]
            if m2 and m2.group(1) != "e":
                url = f"https://docs.google.com/spreadsheets/d/{m2.group(1)}/gviz/tq?tqx=out:csv&gid={gid}"
        print(f"- Baixando planilha {chave} …")
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
            texto = r.read().decode("utf-8")
        with open(os.path.join(RAIZ, "data", arquivo), "w", encoding="utf-8", newline="") as f:
            f.write(texto)
        print(f"  ✓ data/{arquivo} atualizado")


def processar_csv(arquivo):
    caminho = os.path.join(RAIZ, "data", arquivo)
    if not os.path.exists(caminho):
        return
    texto = open(caminho, encoding="utf-8").read()
    sep = ";" if texto.splitlines()[0].count(";") > texto.splitlines()[0].count(",") else ","
    linhas = list(csv.reader(io.StringIO(texto), delimiter=sep))
    if not linhas:
        return
    cab = [c.strip().lower() for c in linhas[0]]
    colunas = [i for i, c in enumerate(cab) if c in ("capa", "fotos", "imagem", "foto")]
    mudou = False
    print(f"- data/{arquivo}")
    for linha in linhas[1:]:
        for i in colunas:
            if i >= len(linha):
                continue
            partes = re.split(r"([\s|;,]+)", linha[i])
            for k, p in enumerate(partes):
                if eh_externa(p):
                    try:
                        novo = baixar(p)
                    except Exception as e:  # noqa
                        print("  ! erro ao baixar", p, "-", e)
                        novo = None
                    if novo:
                        partes[k] = novo
                        mudou = True
            linha[i] = "".join(partes)
    if mudou and not SIMULAR:
        with open(caminho, "w", encoding="utf-8", newline="") as f:
            csv.writer(f, delimiter=sep).writerows(linhas)
        print(f"  ✓ data/{arquivo} atualizado com os caminhos locais")


def processar_html():
    padrao = re.compile(r'(src|href|content)="(https?://[^"]+\.(?:jpe?g|png|webp|gif|avif)(?:\?[^"]*)?)"', re.I)
    for nome in sorted(os.listdir(RAIZ)):
        if not nome.endswith(".html"):
            continue
        caminho = os.path.join(RAIZ, nome)
        html = open(caminho, encoding="utf-8").read()
        achados = padrao.findall(html)
        if not achados:
            continue
        print("-", nome)
        for _attr, url in achados:
            if "og-espaco-mais-voce" in url:
                continue  # imagem de compartilhamento usa o endereço do próprio site
            try:
                novo = baixar(url)
            except Exception as e:  # noqa
                print("  ! erro ao baixar", url, "-", e)
                novo = None
            if novo and not SIMULAR:
                html = html.replace(url, novo)
        if not SIMULAR:
            open(caminho, "w", encoding="utf-8").write(html)


if __name__ == "__main__":
    os.chdir(RAIZ)
    if "--planilha" in sys.argv:
        salvar_planilha()
    processar_csv("tratamentos.csv")
    processar_csv("agenda.csv")
    processar_html()
    print("\nPronto. Confira as imagens em", DESTINO, "e faça commit.")

# Espaço Mais Você — site

Site da clínica de estética **Espaço Mais Você** (Shopping Nova América — Del Castilho, Rio de Janeiro).
HTML + CSS + JavaScript puros, **sem etapa de build**, pronto para o GitHub Pages.

## Estrutura

```
index.html              Início (hero, faixa de marcas, carrossel, quem somos, chamada final)
sobre.html              Sobre / Equipe
tratamentos.html        Lista de tratamentos (filtro + busca) — vem da planilha
tratamento.html?t=ID    Página de cada tratamento (gerada a partir da planilha)
resultados.html         Resultados & galeria (sem antes/depois por enquanto)
contato.html            Formulário de agendamento → WhatsApp, horários, mapa
privacidade.html        Política de Privacidade (LGPD)
nao-encontrada.html     Página "não encontrada"
404.html                Usado pelo GitHub Pages; redireciona para nao-encontrada.html

assets/css/style.css    Todo o visual (cores em :root)
assets/js/config.js     ← WhatsApp, e-mail, redes, endereço, horários, link da planilha
assets/js/dados.js      Leitura da planilha (CSV), conversão de links do Drive, cards
assets/js/main.js       Menu, animações, carrossel, páginas, formulário
assets/js/assistente.js Balão do WhatsApp com perguntas frequentes e busca
assets/fonts/           Instrument Serif + Plus Jakarta Sans (licença SIL OFL, arquivos incluídos)
assets/img/             Logo, ícones (favicon, icone-512), fotos e imagens dos tratamentos

data/tratamentos.csv    Cópia de reserva da planilha (usada se a planilha falhar ou não estiver configurada)
data/agenda.csv         Cópia de reserva da aba "agenda"
docs/COMO-ATUALIZAR.md  Guia simples para a cliente usar a planilha
scripts/baixar_imagens.py  Baixa imagens externas (Drive, site antigo) para o repositório
```

## Como funciona o conteúdo

1. `dados.js` tenta ler a planilha publicada como CSV (`config.js → planilha`).
2. Se o link estiver vazio, a planilha cair ou vier sem as colunas esperadas, usa `data/*.csv`.
3. Links do Google Drive nas colunas `capa`/`fotos` são convertidos automaticamente.
4. Linhas com `publicar = sim` e sem `descricao` entram só na lista "Também realizamos".

Colunas: `id, publicar, destaque, nome, categoria, descricao, indicacao, duracao, preco, capa, fotos, link_agendamento`.
Preços não aparecem enquanto `mostrarPrecos: false` no `config.js`.

## Rodar localmente

O site lê arquivos CSV, então precisa de um servidor (abrir o arquivo direto no navegador não carrega a lista):

```bash
cd ~/Sites/maisvoce
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar no GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
Endereço: https://maxhomsi.github.io/Espaco_maisvoce/

**Ao trocar para um domínio próprio:**
1. Rode o script de imagens (abaixo) para trazer tudo que ainda vem de fora.
2. Atualize `siteUrl` em `assets/js/config.js` e troque `https://maxhomsi.github.io/Espaco_maisvoce/` pelo novo domínio nas tags `canonical`/`og:` das páginas, em `sitemap.xml` e em `robots.txt`
   (ex.: `grep -rl "maxhomsi.github.io/Espaco_maisvoce" . | xargs sed -i '' 's#https://maxhomsi.github.io/Espaco_maisvoce/#https://NOVODOMINIO/#g'`).
3. Crie o arquivo `CNAME` com o domínio.

## Script: baixar imagens antes de trocar o domínio

```bash
python3 scripts/baixar_imagens.py --simular     # mostra o que seria baixado
python3 scripts/baixar_imagens.py --planilha    # salva a planilha em data/*.csv e baixa as imagens dela
python3 scripts/baixar_imagens.py               # baixa imagens externas citadas em data/*.csv e nas páginas
```

As imagens vão para `assets/img/baixadas/` e os links são trocados pelos arquivos locais. Use antes de desligar o Drive/site antigo e faça commit.

## Origem das fotos

- **Fotos da Dra. Christianne e da clínica** (`assets/img/fotos/`) e **logo**: retiradas do Instagram oficial @espaco.maisvoce (conteúdo da própria cliente). Substituir pelas fotos oficiais quando chegarem.
  A foto de jaleco teve o texto sobreposto do post removido/recortado.
- **Imagens ilustrativas dos tratamentos** (`assets/img/tratamentos/`): Unsplash (licença Unsplash — uso gratuito, sem necessidade de atribuição). Autores:
  botox — MohammadReza BaBaei · laser — karelys Ruiz · pdo — Mariia Belinska · bioestimulador — Mina Rad ·
  labios — Sam Moghadam · limpeza — engin akyurt · microagulhamento — Look Studio · peeling — Rosa Rafael ·
  mastercombo — Studio Michael França · radiofrequencia — Patient Perfect · lipo — Huha Inc. ·
  gluteos — Dynamic Wang · drenagem — Simon HUMLER · rosto2 — Fleur Kaan.
- Nenhuma imagem foi gerada por IA.

## Fontes de informação usadas no conteúdo

Instagram @espaco.maisvoce (bio, legendas e artes de "Tratamentos faciais/corporais" e apresentação da Dra.) e perfil do Google Maps (endereço, horários e nota). Nada foi inventado: preços, duração das sessões, formas de pagamento e contraindicações ficaram de fora porque não constam no material — o assistente encaminha essas perguntas para a equipe no WhatsApp.

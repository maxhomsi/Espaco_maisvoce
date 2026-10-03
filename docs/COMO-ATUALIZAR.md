# Como atualizar o site do Espaço + Você

Você não precisa mexer em código nem pagar manutenção: **os tratamentos do site vêm de uma planilha do Google**. Edite a planilha e, em alguns minutos, o site se atualiza sozinho.

---

## 1. A planilha

A planilha tem duas abas:

- **tratamentos** — a lista de tratamentos do site.
- **agenda** — avisos e condições especiais (ex.: “Criolipólise Day”). Se não houver nada marcado para publicar, essa parte simplesmente não aparece.

Cada **linha** é um tratamento (ou um aviso). Não mude os nomes da primeira linha (os títulos das colunas).

### Colunas da aba “tratamentos”

| Coluna | O que escrever | Exemplo |
|---|---|---|
| **id** | Um “apelido” sem acento e sem espaço. Vira o endereço da página. Depois de publicado, evite mudar. | `toxina-botulinica` |
| **publicar** | `sim` para aparecer no site, `não` para esconder. | `sim` |
| **destaque** | `sim` para aparecer no carrossel da página inicial. | `sim` |
| **nome** | Nome do tratamento como as clientes conhecem. | `Toxina botulínica (Botox)` |
| **categoria** | `Facial` ou `Corporal`. | `Facial` |
| **descricao** | Explicação curta: o que é e como funciona. | `Suaviza as linhas de expressão…` |
| **indicacao** | Para que serve / para quem é indicado. | `Linhas de expressão na testa…` |
| **duracao** | Duração da sessão (opcional). Se ficar vazio, não aparece. | `40 minutos` |
| **preco** | Opcional. **Hoje o site está configurado para NÃO mostrar preços**, mesmo que você preencha. | |
| **capa** | Link da foto principal (veja como pegar o link do Google Drive abaixo). | |
| **fotos** | Fotos extras, separadas por vírgula (opcional). | |
| **link_agendamento** | Opcional. Se ficar vazio, o botão “Agendar” abre o WhatsApp com a mensagem pronta. | |

**Dica:** um tratamento com `publicar = sim` mas **sem descrição** aparece só na lista “Também realizamos”, sem página própria. Quando você escrever a descrição, ele ganha card e página.

### Colunas da aba “agenda”

| Coluna | O que escrever |
|---|---|
| **publicar** | `sim` ou `não` |
| **titulo** | Ex.: `Lavieen Day` |
| **data** | Ex.: `17/11` ou `17 a 21 de novembro` |
| **descricao** | Uma frase curta |
| **link** | Opcional. Vazio = abre o WhatsApp com a mensagem pronta. |

Quando a data passar, troque `publicar` para `não`.

---

## 2. Fotos pelo Google Drive

1. Suba a foto para uma pasta do Google Drive.
2. Clique com o botão direito na foto → **Compartilhar** → em “Acesso geral”, escolha **Qualquer pessoa com o link** (Leitor).
3. Clique em **Copiar link** e cole na coluna **capa** (ou **fotos**).

O site converte o link do Drive automaticamente. Se a foto não aparecer, quase sempre é porque ela **não está compartilhada** como “qualquer pessoa com o link”.

**Sobre as fotos:**
- Prefira fotos na **vertical ou quadradas**, bem iluminadas, com pelo menos 1000 pixels de largura.
- Fotos de pacientes (inclusive antes e depois) **só com autorização por escrito** da paciente.
- Não use fotos baixadas da internet sem licença.

---

## 3. Quanto tempo demora para aparecer?

O Google atualiza a planilha publicada a cada **5 minutos, aproximadamente**. Depois disso, é só recarregar a página.

Se nada mudar depois de 10 minutos:
- confira se a linha está com `publicar = sim`;
- confira se você não apagou ou renomeou os títulos das colunas;
- abra o site numa aba anônima (para não pegar uma versão antiga guardada pelo navegador).

---

## 4. Se a planilha falhar

O site tem uma **cópia de reserva** da lista de tratamentos. Se a planilha sair do ar, o site continua funcionando com essa cópia. De tempos em tempos, peça ao Max para atualizar a reserva (ele roda um comando que salva a planilha no site).

---

## 5. O que NÃO está na planilha

Telefone, horários, endereço, Instagram e textos das páginas ficam no arquivo `assets/js/config.js` e nas páginas do site. Para mudar algo disso, fale com o Max.

---

## Para o Max: como a planilha está ligada ao site

- Planilha: https://docs.google.com/spreadsheets/d/1D2ujV7AfmaKenH4gKLS96obyCnmaqTwGF45_4-Ge6xA/edit
- Compartilhada como **Qualquer pessoa com o link: Leitor** — é isso que permite o site ler. Não tire esse acesso.
- Em `assets/js/config.js`, `planilha.tratamentosCSV` aponta para a aba `tratamentos` (`#gid=0`) e `planilha.agendaCSV` para a aba `agenda` (`#gid=1`). Se criar uma aba nova, o número do `gid` aparece no fim do endereço quando você clica nela.
- As colunas `duracao`, `preco` e toda a aba `agenda` estão formatadas como texto, para o Google não transformar "10/09" em data.
- Para passar para a cliente: Compartilhar → adicionar o e-mail dela como Editora → depois, nos três pontinhos ao lado do nome dela, **Transferir propriedade**. O link continua o mesmo, então o site não muda.
- Alternativa: Arquivo → Compartilhar → Publicar na web → CSV, e colar esse link no `config.js` (também funciona).

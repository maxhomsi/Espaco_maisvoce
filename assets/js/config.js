/*
 * ESPAÇO MAIS VOCÊ — configurações do site
 * ------------------------------------------------------------
 * Este é o ÚNICO arquivo que precisa ser editado para trocar
 * telefone, e-mail, redes sociais, horários ou o link da planilha.
 * Deixe um campo vazio ("") para escondê-lo do site.
 */
window.SITE_CONFIG = {
  nome: "Espaço Mais Você",
  nomeCurto: "Espaço + Você",
  slogan: "Seja + Você",

  // WhatsApp: só números, com 55 + DDD (usado nos botões e no formulário)
  whatsapp: "5521985712248",
  whatsappExibicao: "(21) 98571-2248",

  // E-mail ainda não informado pela cliente — fica escondido enquanto estiver vazio
  email: "",

  instagram: "https://www.instagram.com/espaco.maisvoce/",
  instagramUsuario: "@espaco.maisvoce",

  endereco: {
    linha1: "Shopping Nova América — Office 1000, sala 1206",
    linha2: "Av. Pastor Martin Luther King Jr., 126 — Del Castilho",
    cidade: "Rio de Janeiro — RJ",
    cep: "20765-000"
  },
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+Mais+Voc%C3%AA+Shopping+Nova+Am%C3%A9rica",
  mapsEmbed: "https://www.google.com/maps?q=-22.879029,-43.2706057&z=17&output=embed",

  // Horários conforme o perfil do Google (confirmar com a cliente)
  horarios: [
    { dias: "Segunda a sexta", horas: "9h às 20h" },
    { dias: "Sábado", horas: "9h às 13h" },
    { dias: "Domingo", horas: "Fechado" }
  ],

  // Preços: a cliente optou por NÃO mostrar valores no site.
  // Se um dia quiser, troque para true e preencha a coluna "preco" da planilha.
  mostrarPrecos: false,

  // Avaliação no Google (atualizar de tempos em tempos)
  google: {
    nota: "5,0",
    avaliacoes: 36,
    link: "https://www.google.com/maps/place/Espa%C3%A7o+Mais+Voc%C3%AA/@-22.879029,-43.2706057,17z/data=!4m6!3m5!1s0x997dfe59733e55:0xd953de2fd958ed7a!8m2!3d-22.879029!4d-43.2706057!16s%2Fg%2F11nftddtjt"
  },

  // Responsável técnica — o número do conselho só aparece quando preenchido
  responsavel: {
    nome: "Dra. Christianne Moreno",
    titulo: "Pós-graduação em Estética · CEO do Espaço + Você",
    registro: "" // ex.: "COREN-RJ nº 000000" — preencher antes de publicar
  },

  // Dados da empresa para a Política de Privacidade (preencher)
  empresa: {
    razaoSocial: "",
    cnpj: ""
  },

  /*
   * PLANILHA DO GOOGLE (conteúdo atualizável)
   * Cole aqui o link de cada aba (o link normal da planilha, com o #gid= da aba,
   * compartilhada como "Qualquer pessoa com o link: Leitor"), ou o link
   * "Publicar na web → CSV".
   * Se ficar vazio (ou a planilha falhar), o site usa os arquivos
   * de reserva em /data/*.csv que estão no repositório.
   */
  planilha: {
    tratamentosCSV: "https://docs.google.com/spreadsheets/d/1D2ujV7AfmaKenH4gKLS96obyCnmaqTwGF45_4-Ge6xA/edit#gid=0",
    agendaCSV: "https://docs.google.com/spreadsheets/d/1D2ujV7AfmaKenH4gKLS96obyCnmaqTwGF45_4-Ge6xA/edit#gid=1"
  },

  siteUrl: "https://maxhomsi.github.io/Espaco_maisvoce/"
};

const CODIGO_SECRETO = "1234";
const CHAVE_STORAGE = "noticias_builu_v2";
const CHAVE_CURTIDAS = "curtidas_builu_v2";

let noticias = JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [
  {
    id: 1,
    classe: "10ª Classe",
    titulo: "Início das Aulas Práticas",
    texto: "Os alunos da 10ª classe devem comparecer pontualmente às salas indicadas.",
    midiaUrl: "",
    midiaTipo: "",
    curtidas: 0,
    data: "20/11/2026"
  },
  {
    id: 2,
    classe: "12ª Classe",
    titulo: "Aviso de Provas Trimestrais",
    texto: "Consulte o calendário afixado na secretaria e prepare-se com antecedência.",
    midiaUrl: "",
    midiaTipo: "",
    curtidas: 0,
    data: "20/11/2026"
  }
];

let postsCurtidos = JSON.parse(localStorage.getItem(CHAVE_CURTIDAS)) || [];
let filtroAtual = "Todas";
let autenticado = false;

function salvarNoticias() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(noticias));
  } catch (err) {
    alert("O ficheiro é demasiado grande para guardar no navegador. Use um vídeo menor ou um link.");
  }
}

function salvarCurtidas() {
  localStorage.setItem(CHAVE_CURTIDAS, JSON.stringify(postsCurtidos));
}

function abrirAlunos() {
  document.getElementById("areaAlunos").classList.remove("oculto");
  document.getElementById("areaAdmin").classList.add("oculto");
  renderizar();
}

function abrirAdmin() {
  document.getElementById("areaAlunos").classList.add("oculto");
  document.getElementById("areaAdmin").classList.remove("oculto");
  document.getElementById("telaCodigo").classList.toggle("oculto", autenticado);
  document.getElementById("painelPost").classList.toggle("oculto", !autenticado);
}

function entrarCodigo(e) {
  e.preventDefault();
  const digitado = document.getElementById("codigoInput").value.trim();

  if (digitado === CODIGO_SECRETO) {
    autenticado = true;
    document.getElementById("msgErro").classList.add("oculto");
    document.getElementById("codigoInput").value = "";
    abrirAdmin();
  } else {
    document.getElementById("msgErro").classList.remove("oculto");
  }
}

function sairCodigo() {
  autenticado = false;
  abrirAlunos();
}

function filtrar(classe, botao) {
  filtroAtual = classe;
  document.querySelectorAll(".filtros button").forEach(b => b.classList.remove("ativo"));
  botao.classList.add("ativo");
  renderizar();
}

function lerArquivo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      url: reader.result,
      tipo: file.type.startsWith("video/") ? "video" : "image"
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function publicarNoticia(e) {
  e.preventDefault();

  const fileInput = document.getElementById("arquivoMidia");
  const urlInput = document.getElementById("urlMidia").value.trim();

  let midiaUrl = "";
  let midiaTipo = "";

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const lido = await lerArquivo(fileInput.files[0]);
    midiaUrl = lido.url;
    midiaTipo = lido.tipo;
  } else if (urlInput) {
    midiaUrl = urlInput;
    midiaTipo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(urlInput) ? "video" : "image";
  }

  const nova = {
    id: Date.now(),
    classe: document.getElementById("classe").value,
    titulo: document.getElementById("titulo").value.trim(),
    texto: document.getElementById("texto").value.trim(),
    midiaUrl,
    midiaTipo,
    curtidas: 0,
    data: new Date().toLocaleDateString("pt-PT")
  };

  noticias.unshift(nova);
  salvarNoticias();
  e.target.reset();
  alert("Notícia publicada com sucesso!");
  abrirAlunos();
}

// Função para curtir ou remover curtida
function curtirNoticia(id) {
  const noticia = noticias.find(n => n.id === id);
  if (!noticia) return;

  const totalAtual = Number(noticia.curtidas) || 0;
  const jaCurtiu = postsCurtidos.includes(id);

  if (jaCurtiu) {
    noticia.curtidas = Math.max(0, totalAtual - 1);
    postsCurtidos = postsCurtidos.filter(postId => postId !== id);
  } else {
    noticia.curtidas = totalAtual + 1;
    postsCurtidos.push(id);
  }

  salvarNoticias();
  salvarCurtidas();
  renderizar();
}

// Função para apagar: só apaga se digitar o código correto
function solicitarApagarNoticia(id) {
  const codigoDigitado = prompt("Digite o código de autorização para apagar este post:");

  if (codigoDigitado === null) {
    return; // Cancelou
  }

  if (codigoDigitado.trim() !== CODIGO_SECRETO) {
    alert("Código incorreto! Apenas quem tem o código pode apagar posts.");
    return;
  }

  noticias = noticias.filter(n => n.id !== id);
  postsCurtidos = postsCurtidos.filter(postId => postId !== id);
  salvarNoticias();
  salvarCurtidas();
  renderizar();
  alert("Post apagado com sucesso.");
}

function renderMidia(n) {
  if (!n.midiaUrl) return "";
  if (n.midiaTipo === "video") {
    return `<video class="card-midia" src="${n.midiaUrl}" controls playsinline></video>`;
  }
  return `<img class="card-midia" src="${n.midiaUrl}" alt="${n.titulo}">`;
}

function renderizar() {
  const lista = document.getElementById("listaNoticias");
  const filtradas = filtroAtual === "Todas"
    ? noticias
    : noticias.filter(n => n.classe === filtroAtual);

  if (filtradas.length === 0) {
    lista.innerHTML = "<p>Nenhuma notícia nesta classe.</p>";
    return;
  }

  lista.innerHTML = filtradas.map(n => {
    const curtido = postsCurtidos.includes(n.id);
    const qtdCurtidas = Number(n.curtidas) || 0;

    return `
      <article class="card">
        ${renderMidia(n)}
        <div class="card-corpo">
          <button class="btn-apagar" onclick="solicitarApagarNoticia(${n.id})">Apagar</button>
          <span class="classe-tag">${n.classe}</span>
          <h3>${n.titulo}</h3>
          <p>${n.texto}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <small>Publicado em ${n.data}</small>
            <button
              type="button"
              onclick="curtirNoticia(${n.id})"
              style="background:${curtido ? "#691416" : "#fff"}; color:${curtido ? "#fff" : "#691416"}; border:1px solid #691416; padding:5px 10px; cursor:pointer; font-size:0.82rem; font-weight:bold;"
            >
              ${curtido ? "Curtido" : "Curtir"} (${qtdCurtidas})
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

renderizar();

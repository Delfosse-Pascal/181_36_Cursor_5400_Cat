const fs = require("fs");
const path = require("path");

const root = process.cwd();
const cursorRoot = path.join(root, "Les_Curseurs");
const musicRoot = path.join(root, "Musiques");
const pageSize = 84;

const imageExt = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico"]);
const audioExt = new Set([".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma"]);
const pageShapes = ["round", "square", "wide", "tall", "soft", "diamond"];
const accents = [
  "#d8aa3f", "#f0d787", "#b9934c", "#e7c15f", "#c9a04f", "#fff1b4",
  "#a8843b", "#dfbd73", "#bfa56a", "#f4ce6a", "#d0b06a", "#ffd86f"
];

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function rel(from, to) {
  return encodeURI(toPosix(path.relative(from, to)));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function prettyName(value) {
  return value
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  const units = ["Ko", "Mo", "Go"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (entry.isFile()) return [full];
    return [];
  });
}

function naturalSort(a, b) {
  return a.localeCompare(b, "fr", { numeric: true, sensitivity: "base" });
}

function readDimensions(file) {
  const buffer = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();

  if (ext === ".png" && buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (ext === ".gif" && buffer.length >= 10 && buffer.toString("ascii", 0, 3) === "GIF") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if ((ext === ".jpg" || ext === ".jpeg") && buffer.length > 4) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      offset += 2 + length;
    }
  }

  if (ext === ".webp" && buffer.length >= 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3)
      };
    }
    if (chunk === "VP8 " && buffer.length >= 30) {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L" && buffer.length >= 25) {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }

  return { width: null, height: null };
}

function externalHead() {
  return `
<link rel="canonical" href="https://filedn.eu/llN3kr5vmyEBPIWCwFj3O6h/">
<link rel="icon" href="https://filedn.eu/llN3kr5vmyEBPIWCwFj3O6h/Site_Web/favicondepascal.png" type="image/png">
<link rel="icon" href="https://filedn.eu/llN3kr5vmyEBPIWCwFj3O6h/Site_Web/favicondepascal.ico" type="image/x-icon">
<link rel="stylesheet" type="text/css" href="https://filedn.eu/llN3kr5vmyEBPIWCwFj3O6h/Site_Web/style.css">
<script src="https://filedn.eu/llN3kr5vmyEBPIWCwFj3O6h/Site_Web/script.js" defer></script>
<script src="https://filedn.eu/llN3kr5vmyEBPIWCwFj3O6h/Site_Web/menu.js" defer></script>
<link rel="stylesheet" href="https://filedn.eu/llN3kr5vmyEBPIWCwFj3O6h/Site_Web/basedusite.css">`;
}

function socialBlock() {
  return `
<!-- menu social -->
<nav class="social-menu" aria-label="Liens sociaux">
  <ul>
    <li><a href="https://fr.pinterest.com/pascal509/mes-tableaux-tous-genre/" target="_blank" rel="noopener">Pinterest</a></li>
    <li><a href="https://www.flickr.com/photos/delfossepascal" target="_blank" rel="noopener">Flickr</a></li>
    <li><a href="https://www.tumblr.com/lestoilesdepascal" target="_blank" rel="noopener">Tumblr</a></li>
    <li><a href="https://x.com/PascalDelfossee" target="_blank" rel="noopener">X</a></li>
    <li><a href="https://www.youtube.com/c/DelfossePascal" target="_blank" rel="noopener">YouTube</a></li>
  </ul>
</nav>

<!-- Le menu sera injecte ici -->
<header></header>`;
}

function shell({ title, description, rootPrefix, body, accent = "#d8aa3f", layout = 0 }) {
  return `<!doctype html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  ${externalHead()}
  <link rel="stylesheet" href="${rootPrefix}site.css">
  <script src="${rootPrefix}site.js" defer></script>
  <style>:root{--accent:${accent};--layout-tilt:${layout % 2 === 0 ? "-1deg" : "1deg"};}</style>
</head>
<body class="layout-${layout}">
  ${socialBlock()}
  <main class="page-shell">
    <section class="hero-panel">
      <div>
        <p class="eyebrow">Collection locale</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
      <div class="hero-actions">
        <button class="theme-toggle" type="button" data-theme-toggle>Mode clair / sombre</button>
        <a class="home-link" href="${rootPrefix}index.html">Retour a l'accueil</a>
      </div>
    </section>
    ${body}
  </main>
  <div class="lightbox" data-lightbox hidden>
    <button class="lightbox-close" type="button" data-lightbox-close>Fermer</button>
    <img src="" alt="" data-lightbox-img>
    <p data-lightbox-caption></p>
  </div>
</body>
</html>
`;
}

function pagination(folderName, pageCount, current, rootPrefix) {
  if (pageCount <= 1) return "";
  const links = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    const file = page === 1 ? "index.html" : `page-${page}.html`;
    const active = page === current ? " aria-current=\"page\"" : "";
    return `<a${active} href="${file}">${page}</a>`;
  }).join("");
  const previous = current > 1 ? `<a href="${current === 2 ? "index.html" : `page-${current - 1}.html`}">Page precedente</a>` : "";
  const next = current < pageCount ? `<a href="page-${current + 1}.html">Page suivante</a>` : "";
  return `<nav class="pagination" aria-label="Navigation ${escapeHtml(folderName)}">${previous}<div>${links}</div>${next}<a href="${rootPrefix}index.html">Accueil</a></nav>`;
}

function galleryPage(folder, files, page, pageCount, folders) {
  const folderName = path.basename(folder);
  const folderIndex = folders.findIndex((entry) => entry.dir === folder);
  const rootPrefix = "../../";
  const start = (page - 1) * pageSize;
  const items = files.slice(start, start + pageSize);
  const cards = items.map((item) => {
    const dims = item.width && item.height ? `${item.width} x ${item.height} px` : "Dimensions non detectees";
    const caption = `${item.name} - ${formatBytes(item.size)} - ${dims}`;
    return `<article class="media-card">
      <button type="button" class="image-button" data-full="${rel(folder, item.full)}" data-caption="${escapeHtml(caption)}">
        <img src="${rel(folder, item.full)}" alt="${escapeHtml(item.name)}" loading="lazy">
      </button>
      <h2>${escapeHtml(prettyName(item.name))}</h2>
      <p>${escapeHtml(formatBytes(item.size))} - ${escapeHtml(dims)}</p>
      <small>${escapeHtml(toPosix(path.relative(folder, item.full)))}</small>
    </article>`;
  }).join("\n");
  const allLinks = folders.map((entry) => {
    const active = entry.dir === folder ? " aria-current=\"page\"" : "";
    return `<a${active} href="../${encodeURI(path.basename(entry.dir))}/index.html">${escapeHtml(path.basename(entry.dir))}</a>`;
  }).join("");
  const body = `
    <nav class="folder-strip" aria-label="Toutes les collections">${allLinks}</nav>
    ${pagination(folderName, pageCount, page, rootPrefix)}
    <section class="collection-note">
      <p>${escapeHtml(folderName)} rassemble ${files.length} image${files.length > 1 ? "s" : ""} de curseurs. Cette page ${page} sur ${pageCount} presente une selection locale, avec poids du fichier et dimensions sous chaque miniature.</p>
    </section>
    <section class="gallery" aria-label="Galerie ${escapeHtml(folderName)}">
      ${cards}
    </section>
    ${pagination(folderName, pageCount, page, rootPrefix)}
  `;
  return shell({
    title: `${folderName}${pageCount > 1 ? ` - page ${page}` : ""}`,
    description: "Galerie locale de curseurs avec agrandissement au clic, lecture hors ligne et navigation complete.",
    rootPrefix,
    body,
    accent: accents[folderIndex % accents.length],
    layout: folderIndex % 6
  });
}

function rootIndex(folders, musicFiles) {
  const cards = folders.map((entry, index) => {
    const thumb = entry.files[0] ? rel(root, entry.files[0].full) : "";
    const shape = pageShapes[index % pageShapes.length];
    const dims = entry.files[0] && entry.files[0].width ? `${entry.files[0].width} x ${entry.files[0].height} px` : "Galerie locale";
    return `<a class="portal-card ${shape}" href="${rel(root, path.join(entry.dir, "index.html"))}" style="--accent:${accents[index % accents.length]}">
      ${thumb ? `<img src="${thumb}" alt="" loading="lazy">` : `<span>${escapeHtml(path.basename(entry.dir))}</span>`}
      <strong>${escapeHtml(path.basename(entry.dir))}</strong>
      <em>${entry.files.length} images - ${escapeHtml(dims)}</em>
    </a>`;
  }).join("\n");
  const playlist = musicFiles.map((file, index) => {
    return `<button type="button" data-audio-src="${rel(root, file.full)}">${String(index + 1).padStart(2, "0")} - ${escapeHtml(prettyName(file.name))}</button>`;
  }).join("");
  const body = `
    <section class="music-panel" data-music-panel>
      <button class="music-button" type="button" data-music-toggle>Musique</button>
      <div class="music-box" hidden>
        <p>Choisis une piste locale. La lecture ne demarre jamais automatiquement.</p>
        <audio controls data-audio-player></audio>
        <div class="playlist">${playlist || "<span>Aucune musique locale detectee.</span>"}</div>
      </div>
    </section>
    <section class="collection-note home-note">
      <p>Bienvenue dans la porte d'entree locale de la collection. Chaque case mene vers une galerie Curseurs_*, avec miniatures, mode clair/sombre, agrandissement au clic et navigation entre toutes les pages creees.</p>
    </section>
    <section class="portal-grid" aria-label="Acces aux galeries">
      ${cards}
    </section>
  `;
  return shell({
    title: "181_36_Cursor_5400_Cat",
    description: "Accueil general des galeries locales de curseurs, avec lecteur audio manuel et acces rapide a chaque collection.",
    rootPrefix: "",
    body,
    accent: "#d8aa3f",
    layout: 0
  });
}

function css() {
  return `:root {
  --black: #090807;
  --white: #fffdf7;
  --gold: #d8aa3f;
  --warm-gray: #8e877c;
  --panel: rgba(255, 253, 247, .09);
  --line: rgba(216, 170, 63, .35);
  --text: #fff8e7;
  --muted: #d8d0c2;
  color-scheme: dark;
}

[data-theme="light"] {
  --black: #fffdf7;
  --white: #11100e;
  --panel: rgba(30, 27, 22, .06);
  --line: rgba(166, 124, 37, .35);
  --text: #181511;
  --muted: #5f584e;
  color-scheme: light;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive;
  background:
    linear-gradient(115deg, rgba(216,170,63,.12), transparent 32%),
    repeating-linear-gradient(90deg, transparent 0 37px, rgba(216,170,63,.1) 38px, transparent 39px),
    radial-gradient(circle at 20% 10%, rgba(255,255,255,.16), transparent 28%),
    var(--black);
  color: var(--text);
  letter-spacing: 0;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(135deg, rgba(255,255,255,.08), transparent 30%, rgba(216,170,63,.08) 55%, transparent),
    repeating-linear-gradient(145deg, transparent 0 18px, rgba(142,135,124,.13) 19px, transparent 20px);
  mix-blend-mode: soft-light;
}

a { color: inherit; }

.social-menu,
header {
  width: min(1120px, calc(100% - 28px));
  margin: 12px auto 0;
  text-align: center;
  position: relative;
  z-index: 2;
}

.social-menu ul {
  margin: 0;
  padding: 8px;
  list-style: none;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  border: 1px solid var(--line);
  background: rgba(12, 11, 9, .7);
  backdrop-filter: blur(10px);
}

[data-theme="light"] .social-menu ul { background: rgba(255, 253, 247, .82); }

.social-menu a,
.folder-strip a,
.pagination a,
.home-link,
.theme-toggle,
.music-button,
.playlist button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid var(--line);
  padding: 8px 13px;
  background: linear-gradient(135deg, rgba(255,255,255,.08), rgba(216,170,63,.12));
  color: var(--text);
  text-decoration: none;
  cursor: pointer;
  font: inherit;
  transition: transform .2s ease, border-color .2s ease, background .2s ease;
}

.social-menu a:hover,
.folder-strip a:hover,
.pagination a:hover,
.home-link:hover,
.theme-toggle:hover,
.playlist button:hover {
  transform: translateY(-2px);
  border-color: var(--accent, var(--gold));
}

.page-shell {
  width: min(1200px, calc(100% - 28px));
  margin: 18px auto 44px;
  position: relative;
  z-index: 1;
}

.hero-panel {
  min-height: 260px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 24px;
  padding: clamp(24px, 5vw, 58px);
  border: 1px solid var(--line);
  background:
    linear-gradient(120deg, rgba(255,255,255,.11), transparent 30%),
    linear-gradient(145deg, rgba(216,170,63,.24), rgba(142,135,124,.08)),
    var(--panel);
  box-shadow: 0 20px 60px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.18);
  overflow: hidden;
  transform: rotate(var(--layout-tilt));
}

.hero-panel h1 {
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 6.8rem);
  line-height: .9;
  font-weight: 500;
}

.hero-panel p {
  max-width: 720px;
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  margin: 12px 0 0;
  color: var(--muted);
}

.eyebrow {
  color: var(--accent, var(--gold)) !important;
  text-transform: uppercase;
  font-family: Georgia, serif;
  font-size: .8rem !important;
  letter-spacing: .12em;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.collection-note {
  margin: 22px 0;
  padding: 18px 20px;
  border-left: 4px solid var(--accent, var(--gold));
  background: var(--panel);
  font-size: 1.35rem;
  color: var(--muted);
}

.folder-strip,
.pagination {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 22px 0;
}

.folder-strip a[aria-current="page"],
.pagination a[aria-current="page"] {
  color: #11100e;
  background: var(--accent, var(--gold));
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px;
}

.media-card {
  padding: 10px;
  border: 1px solid rgba(216,170,63,.26);
  background:
    linear-gradient(160deg, rgba(255,255,255,.1), transparent 42%),
    var(--panel);
  animation: rise .55s ease both;
  min-width: 0;
}

.media-card:nth-child(3n) { transform: translateY(7px); }
.media-card:nth-child(5n) { border-radius: 28px 4px 28px 4px; }
.media-card:nth-child(7n) { border-radius: 50% 50% 8px 8px; }

.image-button {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  border: 0;
  padding: 12px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.16), rgba(216,170,63,.12)),
    rgba(0,0,0,.18);
  cursor: zoom-in;
}

.image-button img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(0,0,0,.35));
  transition: transform .24s ease;
}

.image-button:hover img { transform: scale(1.08) rotate(-2deg); }

.media-card h2 {
  font-size: 1.2rem;
  margin: 10px 0 4px;
  line-height: 1.05;
}

.media-card p,
.media-card small {
  display: block;
  margin: 0;
  color: var(--muted);
  font-family: Georgia, serif;
  font-size: .78rem;
  overflow-wrap: anywhere;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 18px;
  align-items: stretch;
}

.portal-card {
  min-height: 210px;
  padding: 18px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  text-align: center;
  text-decoration: none;
  border: 1px solid var(--line);
  background:
    linear-gradient(140deg, rgba(255,255,255,.15), transparent 45%),
    linear-gradient(40deg, color-mix(in srgb, var(--accent) 30%, transparent), transparent),
    var(--panel);
  box-shadow: inset 0 1px rgba(255,255,255,.18);
  transition: transform .25s ease, box-shadow .25s ease;
  animation: floaty 5s ease-in-out infinite;
}

.portal-card:hover {
  transform: translateY(-7px) rotate(1deg);
  box-shadow: 0 22px 42px rgba(0,0,0,.28);
}

.portal-card img {
  width: 78px;
  height: 78px;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(0,0,0,.38));
}

.portal-card strong { font-size: 1.7rem; }
.portal-card em { font-family: Georgia, serif; font-size: .84rem; color: var(--muted); }
.portal-card.round { border-radius: 999px; aspect-ratio: 1; }
.portal-card.square { aspect-ratio: 1; }
.portal-card.wide { grid-column: span 2; }
.portal-card.tall { min-height: 280px; }
.portal-card.soft { border-radius: 36px 6px; }
.portal-card.diamond { clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); padding: 36px; }

.music-panel { margin: 24px 0; text-align: center; }
.music-button { background: #b50909; border-color: #ff8a8a; color: white; border-radius: 999px; font-size: 1.4rem; }
.music-box {
  margin: 12px auto 0;
  max-width: 820px;
  padding: 18px;
  border: 1px solid var(--line);
  background: var(--panel);
}
.music-box audio { width: 100%; margin: 10px 0; }
.playlist { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
  padding: 18px;
  background: rgba(0,0,0,.88);
  place-items: center;
}

.lightbox[hidden] { display: none; }

.lightbox img {
  max-width: min(92vw, 1100px);
  max-height: 78vh;
  object-fit: contain;
  background: rgba(255,255,255,.08);
  padding: 18px;
  border: 1px solid rgba(216,170,63,.45);
}

.lightbox p {
  margin: 0;
  color: #fff8e7;
  font-family: Georgia, serif;
  text-align: center;
}

.lightbox-close {
  justify-self: end;
  border: 1px solid rgba(216,170,63,.6);
  background: #11100e;
  color: #fff8e7;
  padding: 9px 14px;
  cursor: pointer;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes floaty {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -8px; }
}

@media (max-width: 760px) {
  .hero-panel { grid-template-columns: 1fr; transform: none; }
  .hero-actions { align-items: start; }
  .portal-card.wide { grid-column: auto; }
  .portal-card.diamond { clip-path: none; }
  .gallery { grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); }
}
`;
}

function js() {
  return `(() => {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("cursorSiteTheme");
  if (savedTheme) html.dataset.theme = savedTheme;

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      html.dataset.theme = html.dataset.theme === "light" ? "dark" : "light";
      localStorage.setItem("cursorSiteTheme", html.dataset.theme);
    });
  });

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImg = document.querySelector("[data-lightbox-img]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lightboxImg) lightboxImg.removeAttribute("src");
  };

  document.querySelectorAll("[data-full]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!lightbox || !lightboxImg || !lightboxCaption) return;
      lightboxImg.src = button.dataset.full;
      lightboxImg.alt = button.dataset.caption || "";
      lightboxCaption.textContent = button.dataset.caption || "";
      lightbox.hidden = false;
    });
  });

  document.querySelectorAll("[data-lightbox-close]").forEach((button) => button.addEventListener("click", closeLightbox));
  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  const musicPanel = document.querySelector("[data-music-panel]");
  const musicBox = musicPanel ? musicPanel.querySelector(".music-box") : null;
  const player = document.querySelector("[data-audio-player]");
  document.querySelectorAll("[data-music-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      if (musicBox) musicBox.hidden = !musicBox.hidden;
    });
  });
  document.querySelectorAll("[data-audio-src]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!player) return;
      player.src = button.dataset.audioSrc;
      player.play().catch(() => {});
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeLightbox();
    if (musicBox && !musicBox.hidden) {
      musicBox.hidden = true;
      if (player) player.pause();
    }
  });
})();`;
}

function build() {
  const folders = fs.readdirSync(cursorRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("Curseurs_"))
    .map((entry) => path.join(cursorRoot, entry.name))
    .sort(naturalSort)
    .map((dir) => {
      const files = walk(dir)
        .filter((file) => imageExt.has(path.extname(file).toLowerCase()))
        .sort(naturalSort)
        .map((full) => {
          const stat = fs.statSync(full);
          const dims = readDimensions(full);
          return { full, name: path.basename(full), size: stat.size, ...dims };
        });
      return { dir, files };
    })
    .filter((entry) => entry.files.length > 0);

  const musicFiles = walk(musicRoot)
    .filter((file) => audioExt.has(path.extname(file).toLowerCase()))
    .sort(naturalSort)
    .map((full) => ({ full, name: path.basename(full), size: fs.statSync(full).size }));

  fs.writeFileSync(path.join(root, "site.css"), css(), "utf8");
  fs.writeFileSync(path.join(root, "site.js"), js(), "utf8");
  fs.writeFileSync(path.join(root, "index.html"), rootIndex(folders, musicFiles), "utf8");

  let pageCountTotal = 1;
  for (const folder of folders) {
    const pageCount = Math.ceil(folder.files.length / pageSize);
    for (let page = 1; page <= pageCount; page += 1) {
      const fileName = page === 1 ? "index.html" : `page-${page}.html`;
      fs.writeFileSync(path.join(folder.dir, fileName), galleryPage(folder.dir, folder.files, page, pageCount, folders), "utf8");
      pageCountTotal += 1;
    }
  }

  console.log(`Generated ${pageCountTotal} HTML pages for ${folders.length} cursor folders.`);
}

build();

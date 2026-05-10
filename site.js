(() => {
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
})();
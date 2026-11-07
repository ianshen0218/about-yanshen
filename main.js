/* ============================================================
   严沈 · 作品坨集 — interactions
   ============================================================ */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const canHover = window.matchMedia("(hover:hover)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* anchor offset for fixed nav */
  $$("section[id]").forEach((s) => (s.style.scrollMarginTop = "84px"));

  /* ---------- nav scrolled state ---------- */
  const nav = $("#nav");
  const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScrollNav();

  /* ---------- mouse glow ---------- */
  const glow = $("#cursorGlow");
  if (canHover && !reduce) {
    document.body.classList.add("has-glow");
    let gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (window.__modalOpen) return; // freeze glow behind modal
      gx = tx; gy = ty;
      glow.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
    });
  }

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- parallax ---------- */
  const parallaxEls = $$("[data-parallax]");
  let ticking = false;
  function applyParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const sp = parseFloat(el.dataset.speed) || 0;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * sp).toFixed(1)}px, 0)`;
    });
    ticking = false;
  }
  function reqParallax() {
    if (!ticking && !reduce) {
      ticking = true;
      requestAnimationFrame(applyParallax);
    }
  }
  if (!reduce) {
    window.addEventListener("scroll", () => {
      onScrollNav();
      reqParallax();
    });
    window.addEventListener("resize", reqParallax);
    applyParallax();
  }

  /* ---------- 3D tilt ---------- */
  if (canHover && !reduce) {
    $$("[data-tilt]").forEach((el) => {
      const max = parseFloat(el.dataset.tiltMax) || 8;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", (px * max * 2).toFixed(2) + "deg");
        el.style.setProperty("--ry", (-py * max * 2).toFixed(2) + "deg");
      });
      el.addEventListener("mouseleave", () => {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (canHover && !reduce) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- image stack flip (图片堆叠翻牌) ---------- */
  const deck = $("#flipDeck");
  if (deck) {
    const cards = $$(".flip-card", deck);
    let idx = cards.length - 1; // top card
    function layout(spread) {
      cards.forEach((c, i) => {
        const off = i - idx;
        const x = off * (spread ? 56 : 26);
        const y = Math.abs(off) * (spread ? 6 : 10);
        const rot = off * (spread ? 6 : 7);
        const sc = off === 0 ? 1.04 : 0.92;
        c.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`;
        c.style.zIndex = String(10 - Math.abs(off));
      });
    }
    layout(false);
    deck.addEventListener("mouseenter", () => layout(true));
    deck.addEventListener("mouseleave", () => layout(false));
    deck.addEventListener("click", () => {
      idx = (idx + 1) % cards.length;
      layout(true);
      setTimeout(() => layout(false), 360);
    });
  }

  /* ---------- video modal (click to play) ---------- */
  const modal = $("#vmodal");
  const video = $("#vmodalVideo");
  const mTitle = $("#vmodalTitle");
  const mDesc = $("#vmodalDesc");

  function openVideo(name, title, desc) {
    video.src = `assets/videos/${name}.mp4`;
    mTitle.textContent = title || "";
    mDesc.textContent = desc || "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.__modalOpen = true;
    document.body.style.overflow = "hidden";
    video.play().catch(() => {});
  }
  function closeVideo() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    window.__modalOpen = false;
    document.body.style.overflow = "";
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  $$("[data-video]").forEach((el) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      openVideo(el.dataset.video, el.dataset.title, el.dataset.desc);
    });
  });
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeVideo));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeVideo();
  });

  /* ---------- reply popup (给我回复) ---------- */
  const replyModal = $("#replyModal");
  const replyBtn = $("#replyBtn");
  function openReply() {
    replyModal.classList.add("open");
    replyModal.setAttribute("aria-hidden", "false");
    window.__modalOpen = true;
    document.body.style.overflow = "hidden";
  }
  function closeReply() {
    replyModal.classList.remove("open");
    replyModal.setAttribute("aria-hidden", "true");
    window.__modalOpen = false;
    document.body.style.overflow = "";
  }
  if (replyBtn) replyBtn.addEventListener("click", openReply);
  if (replyModal) {
    $$("[data-reply-close]", replyModal).forEach((b) => b.addEventListener("click", closeReply));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && replyModal.classList.contains("open")) closeReply();
    });
  }
})();

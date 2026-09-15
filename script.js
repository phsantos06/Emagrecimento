(() => {
  document.documentElement.classList.add("js");

  /* ---------- Menu mobile ---------- */
  const btn = document.querySelector(".menu-btn");
  const menu = document.getElementById("menu");
  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open);
    btn.textContent = open ? "Fechar" : "Menu";
  });
  menu.addEventListener("click", (e) => {
    if (e.target.tagName !== "A") return;
    menu.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "Menu";
  });

  /* ---------- Progresso de leitura + nav ---------- */
  const bar = document.querySelector(".read-progress span");
  const top = document.querySelector(".top");
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? scrollY / max : 0);
    top.classList.toggle("is-scrolled", scrollY > 10);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => {
    // pequenos atrasos em grupos (cards, cadeia)
    const sib = el.parentElement.querySelectorAll(":scope > .reveal");
    if (sib.length > 2) el.style.transitionDelay = [...sib].indexOf(el) * 90 + "ms";
    io.observe(el);
  });

  /* ---------- Link ativo no menu ---------- */
  const links = [...menu.querySelectorAll("a")];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) spy.observe(s); });

  /* ---------- Calculadora ---------- */
  const form = document.getElementById("calc");
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Math.round(n).toLocaleString("pt-BR");
  const limits = { idade: [15, 90], peso: [35, 250], altura: [130, 220] };

  function imcLabel(v) {
    if (v < 18.5) return "Abaixo do peso";
    if (v < 25) return "Faixa saudável";
    if (v < 30) return "Sobrepeso";
    return "Obesidade";
  }

  function calc() {
    const d = new FormData(form);
    let ok = true;
    const val = {};
    for (const k of Object.keys(limits)) {
      const n = parseFloat(String(d.get(k)).replace(",", "."));
      const bad = !(n >= limits[k][0] && n <= limits[k][1]);
      form.elements[k].closest(".field").classList.toggle("is-invalid", bad);
      if (bad) ok = false;
      val[k] = n;
    }
    form.querySelector(".calc__error").hidden = ok;
    if (!ok) return;

    const tmb = 10 * val.peso + 6.25 * val.altura - 5 * val.idade + (d.get("sexo") === "m" ? 5 : -161);
    const tdee = tmb * parseFloat(d.get("atividade"));
    const meta = Math.max(tdee * 0.8, tmb); // não sugere abaixo do basal
    const imc = val.peso / Math.pow(val.altura / 100, 2);

    $("o-tmb").textContent = fmt(tmb);
    $("o-tdee").textContent = fmt(tdee);
    $("o-meta").textContent = fmt(meta);
    $("o-prot").textContent = `${fmt(val.peso * 1.6)}–${fmt(val.peso * 2.2)}`;
    $("o-imc").textContent = imc.toFixed(1).replace(".", ",");
    $("o-imc-label").textContent = imcLabel(imc);
  }
  form.addEventListener("input", calc);
  form.addEventListener("submit", (e) => e.preventDefault());
  calc();

  /* ---------- Hábitos (salvo no navegador) ---------- */
  const KEY = "vidaleve:habitos";
  const boxes = [...document.querySelectorAll("#habits input")];
  const ring = document.querySelector(".ring");
  const msgs = ["Comece por um. Só um.", "Um passo já conta.", "Está criando ritmo.", "Bom progresso!", "Mais da metade!", "Quase lá.", "Falta só um.", "Semana completa. Constância é tudo."];
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY)) || []; } catch {}
  boxes.forEach((b) => (b.checked = saved.includes(b.value)));

  function update() {
    const n = boxes.filter((b) => b.checked).length;
    ring.style.setProperty("--p", (n / boxes.length) * 100);
    $("habit-count").textContent = `${n}/${boxes.length}`;
    $("habit-msg").textContent = msgs[n];
    try { localStorage.setItem(KEY, JSON.stringify(boxes.filter((b) => b.checked).map((b) => b.value))); } catch {}
  }
  boxes.forEach((b) => b.addEventListener("change", update));
  update();
})();

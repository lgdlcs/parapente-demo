/* Aéris Parapente — version Anime : navbar, burger, reveal, carrousel, lightbox + anime.js hero */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar : état au scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("nav--scrolled");
    else nav.classList.remove("nav--scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu burger (mobile) ---------- */
  var burger = document.getElementById("burger");
  var links = document.getElementById("navLinks");
  function closeMenu() {
    links.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });

  /* ---------- Reveal au scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Carrousel avis ---------- */
  var track = document.getElementById("reviewsTrack");
  if (track && !reduceMotion) {
    var clone = track.cloneNode(true);
    Array.prototype.forEach.call(clone.children, function (c) { c.setAttribute("aria-hidden", "true"); });
    while (clone.firstChild) track.appendChild(clone.firstChild);
  }

  /* ---------- Lightbox galerie ---------- */
  var gallery = document.getElementById("gallery");
  if (gallery) {
    var imgs = Array.prototype.map.call(gallery.querySelectorAll("img"), function (i) {
      return { src: i.getAttribute("src"), alt: i.getAttribute("alt") || "" };
    });
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      '<button class="lightbox__close" aria-label="Fermer">&times;</button>' +
      '<button class="lightbox__nav lightbox__prev" aria-label="Précédent">&#8249;</button>' +
      '<img class="lightbox__img" alt="">' +
      '<button class="lightbox__nav lightbox__next" aria-label="Suivant">&#8250;</button>';
    document.body.appendChild(box);

    var bigImg = box.querySelector(".lightbox__img");
    var current = 0;
    function show(i) { current = (i + imgs.length) % imgs.length; bigImg.src = imgs[current].src; bigImg.alt = imgs[current].alt; }
    function open(i) { show(i); box.classList.add("is-open"); box.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
    function close() { box.classList.remove("is-open"); box.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
    Array.prototype.forEach.call(gallery.querySelectorAll(".gallery__item"), function (btn, i) {
      btn.addEventListener("click", function () { open(i); });
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function (e) { e.stopPropagation(); show(current - 1); });
    box.querySelector(".lightbox__next").addEventListener("click", function (e) { e.stopPropagation(); show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------- Pré-remplissage du formulaire ---------- */
  var msgField = document.querySelector('.contact__form [name="message"]');
  var nameField = document.querySelector('.contact__form [name="nom"]');
  var canFocus = window.matchMedia("(pointer: fine)").matches;
  Array.prototype.forEach.call(document.querySelectorAll("[data-prefill]"), function (el) {
    el.addEventListener("click", function () {
      if (!msgField) return;
      msgField.value = el.getAttribute("data-prefill");
      msgField.classList.add("is-prefilled");
      if (canFocus && nameField) nameField.focus({ preventScroll: true });
    });
  });

  /* ---------- Formulaire : envoi AJAX ---------- */
  var form = document.querySelector(".contact__form");
  if (form) {
    var statusEl = form.querySelector(".contact__status");
    var submitBtn = form.querySelector('button[type="submit"]');
    function setStatus(ok, msg) {
      statusEl.hidden = false; statusEl.textContent = msg;
      statusEl.classList.toggle("is-ok", ok); statusEl.classList.toggle("is-err", !ok);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.hasAttribute("data-demo")) {
        form.reset();
        setStatus(true, "Merci ! Votre demande a bien été envoyée (démo). Réponse sous 24 h.");
        return;
      }
      var label = submitBtn.textContent;
      submitBtn.disabled = true; submitBtn.textContent = "Envoi…";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) { form.reset(); setStatus(true, "Merci ! Votre demande a bien été envoyée. Réponse sous 24 h."); }
          else { setStatus(false, "Envoi impossible. Contactez-nous par téléphone ou WhatsApp."); }
        })
        .catch(function () { setStatus(false, "Envoi impossible. Contactez-nous par téléphone ou WhatsApp."); })
        .then(function () { submitBtn.disabled = false; submitBtn.textContent = label; });
    });
  }

  /* ---------- Animations anime.js (chargé en defer) ---------- */
  function startAnime() {
    document.documentElement.classList.add("anime-on");

    /* Entrée du hero en cascade */
    anime.timeline({ easing: "easeOutCubic" })
      .add({ targets: ".hero__content .eyebrow", opacity: [0, 1], translateY: [18, 0], duration: 600 })
      .add({ targets: ".hero__title", opacity: [0, 1], translateY: [28, 0], duration: 850 }, "-=350")
      .add({ targets: ".hero__sub", opacity: [0, 1], translateY: [20, 0], duration: 700 }, "-=550")
      .add({ targets: ".hero__cta", opacity: [0, 1], translateY: [18, 0], duration: 600 }, "-=480");

    /* Deux parapentes traversent le ciel (sens opposés, profondeurs différentes) */
    var g1 = document.querySelector(".hero__glider--1");
    if (g1) anime({
      targets: g1, translateX: ["-12vw", "120vw"],
      translateY: [{ value: "-3vh", duration: 4200 }, { value: "3vh", duration: 5200 }, { value: "-1vh", duration: 4200 }],
      rotate: [{ value: -5, duration: 3600 }, { value: 5, duration: 4600 }, { value: -2, duration: 3600 }],
      duration: 23000, easing: "easeInOutSine", loop: true
    });
    var g2 = document.querySelector(".hero__glider--2");
    if (g2) anime({
      targets: g2, translateX: ["122vw", "-14vw"],
      translateY: [{ value: "2vh", duration: 5000 }, { value: "-2vh", duration: 5200 }, { value: "1vh", duration: 5000 }],
      rotate: [{ value: 4, duration: 4200 }, { value: -4, duration: 4600 }],
      duration: 33000, delay: 3000, easing: "easeInOutSine", loop: true
    });

    /* Volée d'oiseaux : traversée + battements d'ailes */
    var birds = document.querySelector(".hero__birds");
    if (birds) {
      anime({
        targets: birds, translateX: ["-16vw", "118vw"],
        translateY: [{ value: "4vh", duration: 6000 }, { value: "-2vh", duration: 6000 }],
        duration: 34000, delay: 2000, easing: "easeInOutSine", loop: true
      });
      anime({
        targets: ".hero__birds .bird", scaleY: [1, 0.5], direction: "alternate",
        duration: 360, easing: "easeInOutSine", loop: true, delay: anime.stagger(90)
      });
    }

    /* Snowboarder qui descend la piste, en boucle (coordonnées SVG → suit la piste) */
    var boarder = document.querySelector(".hero__boarder");
    if (boarder) anime({
      targets: boarder,
      keyframes: [
        { translateX: 0, translateY: 0, opacity: 0, duration: 1 },
        { opacity: 1, duration: 500 },
        { translateX: 196, translateY: 286, duration: 4200, easing: "easeInQuad" },
        { opacity: 0, duration: 500 }
      ],
      loop: true, delay: 1800
    });

    /* Cards des stages : apparition décalée à l'entrée dans le viewport */
    var cardWrap = document.getElementById("stageCards");
    if (cardWrap && "IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            anime({ targets: "#stageCards .card", opacity: [0, 1], translateY: [34, 0], delay: anime.stagger(130), duration: 750, easing: "easeOutCubic" });
            cio.disconnect();
          }
        });
      }, { threshold: 0.2 });
      cio.observe(cardWrap);
    } else if (cardWrap) {
      cardWrap.querySelectorAll(".card").forEach(function (c) { c.style.opacity = 1; });
    }
  }

  /* anime.js est chargé en defer : on démarre au load. Si le CDN échoue ou que
     l'utilisateur réduit les animations, on retire le masque pour tout révéler. */
  function boot() {
    if (!reduceMotion && window.anime) startAnime();
    else document.documentElement.classList.remove("anime-on");
  }
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();

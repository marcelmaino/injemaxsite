/* ===================================================================
   INJEMAX — interações (Lenis smooth scroll + GSAP/ScrollTrigger)
   =================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------- Header scroll state ---------------- */
  const header = document.querySelector(".site-header");
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  const toggle = document.querySelector(".nav-toggle");
  const mobileLinks = document.querySelectorAll(".mobile-menu a");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }
  mobileLinks.forEach((l) =>
    l.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      if (lenis) lenis.start();
    })
  );

  /* ---------------- Anchor smooth scroll ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -90 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------------- GSAP animations ---------------- */
  if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero load timeline
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".hero [data-hero]", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        delay: 0.15,
      })
      .from(
        ".hero-media img",
        { scale: 1.25, duration: 2, ease: "power2.out" },
        0
      );

    // Parallax hero media
    gsap.to(".hero-media img", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Generic reveals
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    });

    gsap.utils.toArray(".reveal-x").forEach((el) => {
      gsap.to(el, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    });

    // Staggered groups
    gsap.utils.toArray("[data-stagger]").forEach((group) => {
      const items = group.children;
      gsap.from(items, {
        y: 48,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 82%" },
      });
    });

    // Count-up numbers
    gsap.utils.toArray("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onUpdate: () => {
          el.textContent = Math.round(obj.v).toLocaleString("pt-BR") + suffix;
        },
      });
    });

    // Section heading line wipe
    gsap.utils.toArray("[data-line]").forEach((el) => {
      gsap.from(el, {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1,
        ease: "power3.inOut",
        scrollTrigger: { trigger: el, start: "top 90%" },
      });
    });
  } else {
    // No GSAP -> show everything
    document.querySelectorAll(".reveal, .reveal-x").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    document.querySelectorAll("[data-count]").forEach((el) => {
      el.textContent = el.dataset.count + (el.dataset.suffix || "");
    });
  }

  /* ---------------- Year ---------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- Demo form ---------------- */
  document.querySelectorAll("form[data-demo]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.querySelector(".form-success");
      if (ok) ok.style.display = "flex";
      form.reset();
      setTimeout(() => { if (ok) ok.style.display = "none"; }, 5000);
    });
  });
})();

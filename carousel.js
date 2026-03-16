(() => {
  const root = document.querySelector(".carousel");
  if (!root) return;

  const viewport = root.querySelector(".carousel__viewport");
  const track = root.querySelector(".carousel__track");
  const slides = Array.from(root.querySelectorAll(".carousel__slide"));
  const prevBtn = root.querySelector('[data-carousel="prev"]');
  const nextBtn = root.querySelector('[data-carousel="next"]');
  const dots = Array.from(root.querySelectorAll('[data-carousel="dot"]'));
  const status = document.getElementById("carouselStatus");

  let index = 0;

  // Optional autoplay
  const AUTOPLAY = true;
  const AUTOPLAY_MS = 4500;
  let timer = null;

  const clampIndex = (i) => (i + slides.length) % slides.length;

  function update(i, { focus = false } = {}) {
    index = clampIndex(i);
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;

    slides.forEach((slide, sIdx) => {
      const active = sIdx === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach((dot, dIdx) => {
      const active = dIdx === index;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    if (status) status.textContent = `Slide ${index + 1} of ${slides.length}`;

    if (focus) viewport?.focus();
  }

  function next(opts) { update(index + 1, opts); }
  function prev(opts) { update(index - 1, opts); }

  // Buttons
  prevBtn?.addEventListener("click", () => prev({ focus: true }));
  nextBtn?.addEventListener("click", () => next({ focus: true }));

  // Dots
  dots.forEach((dot) => {
    dot.addEventListener("click", () => update(Number(dot.dataset.index), { focus: true }));
  });

  // Keyboard support on viewport
  viewport?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev({ focus: false }); }
    if (e.key === "ArrowRight") { e.preventDefault(); next({ focus: false }); }
    if (e.key === "Home") { e.preventDefault(); update(0); }
    if (e.key === "End") { e.preventDefault(); update(slides.length - 1); }
  });

  // Touch swipe
  let startX = 0;
  let deltaX = 0;
  let pointerDown = false;

  viewport?.addEventListener("pointerdown", (e) => {
    pointerDown = true;
    startX = e.clientX;
    deltaX = 0;
    viewport.setPointerCapture?.(e.pointerId);
    stopAutoplay();
  });

  viewport?.addEventListener("pointermove", (e) => {
    if (!pointerDown) return;
    deltaX = e.clientX - startX;
  });

  viewport?.addEventListener("pointerup", () => {
    if (!pointerDown) return;
    pointerDown = false;

    const threshold = 50; // px
    if (deltaX > threshold) prev();
    else if (deltaX < -threshold) next();

    startAutoplay();
  });

  viewport?.addEventListener("pointercancel", () => {
    pointerDown = false;
    startAutoplay();
  });

  // Autoplay (pauses on hover/focus)
  function startAutoplay() {
    if (!AUTOPLAY) return;
    stopAutoplay();
    timer = window.setInterval(() => next(), AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  viewport?.addEventListener("focusin", stopAutoplay);
  viewport?.addEventListener("focusout", startAutoplay);

  // Init
  update(0);
  startAutoplay();
})();
 
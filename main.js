/* =====================================================
   main.js — Jatin Choudhary Portfolio v2 ULTRA
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===================================================
  // LOADER
  // ===================================================
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loaderBar');
  let loadProgress  = 0;

  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 14 + 4;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(loadInterval);
      loaderBar.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('done');
        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.style.overflow = '';
          revealHero();
        }, 960);
      }, 300);
    }
    loaderBar.style.width = Math.min(loadProgress, 100) + '%';
  }, 60);

  document.body.style.overflow = 'hidden';


  // ===================================================
  // CANVAS BACKGROUND — Flowing particles + connections
  // ===================================================
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '#E85B64' : '#86A8CF';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: 80 }, () => new Particle());
  }
  initParticles();

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#86A8CF';
          ctx.globalAlpha = (1 - dist / 110) * 0.07;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  let rafId;
  function animateCanvas() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    rafId = requestAnimationFrame(animateCanvas);
  }
  animateCanvas();


  // ===================================================
  // CINEMATIC 3D HERO SCROLL CONTROLLER (1.5s inspo3 sequence)
  // ===================================================
  const heroScrollTrack = document.getElementById('heroScrollTrack');
  const pfpStage        = document.getElementById('heroPfpStage');
  const frame2Left      = document.getElementById('frame2LeftText');
  const frame2Right     = document.getElementById('frame2RightText');
  const frame3Settled   = document.getElementById('frame3SettledStage');

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  });

  // Track scroll direction for one-way 3D intro animation
  let lastScrollY = window.scrollY;
  let isScrollingUp = false;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    isScrollingUp = currentY < lastScrollY;
    lastScrollY = currentY;
  }, { passive: true });

  let initialCoinFlipDone = false;

  function updateHeroScroll() {
    if (!heroScrollTrack) return;

    const isMobile = window.innerWidth <= 992;

    const rect = heroScrollTrack.getBoundingClientRect();
    const trackHeight = rect.height - window.innerHeight;
    if (trackHeight <= 0) return;

    let p = -rect.top / trackHeight;
    p = Math.max(0, Math.min(1, p));

    document.documentElement.style.setProperty('--hero-progress', p.toFixed(4));

    if (isMobile) {
      // ── MOBILE 3-STAGE SCROLL FLOW ──

      // 1. Frame 1 (Landing View: 0.0 -> 0.28)
      const f1Opacity = Math.max(0, 1 - p * 3.8);
      document.querySelectorAll('.frame1-el').forEach(el => {
        el.style.opacity = f1Opacity.toFixed(3);
        el.style.pointerEvents = f1Opacity > 0.3 ? 'auto' : 'none';
      });

      // 2. Frame 2 (Statement & Resume View: 0.20 -> 0.58, peaks at 0.38)
      let f2Opacity = 0;
      if (p >= 0.20 && p <= 0.58) {
        const distFromPeak = Math.abs(p - 0.38);
        f2Opacity = Math.max(0, 1 - distFromPeak * 5.5);
      }
      if (frame2Left) frame2Left.style.opacity = f2Opacity.toFixed(3);
      if (frame2Right) frame2Right.style.opacity = f2Opacity.toFixed(3);

      // 3. Frame 3 (Settled View matching screenshot: 0.55 -> 1.0)
      let f3Opacity = 0;
      if (p > 0.55) {
        f3Opacity = Math.min(1, (p - 0.55) * 2.8);
      }
      if (frame3Settled) {
        frame3Settled.style.opacity = f3Opacity.toFixed(3);
        frame3Settled.style.transform = `translateX(-50%) translate3d(0, ${((1 - f3Opacity) * 20).toFixed(1)}px, 0)`;
        frame3Settled.style.pointerEvents = f3Opacity > 0.4 ? 'auto' : 'none';
      }

      // Profile Circle Photo & Resume Button on Mobile
      if (pfpStage) {
        pfpStage.style.left = '50%';

        // Top position: Frame 1 (46%) -> Frame 2 (43.5%) -> Frame 3 (20%)
        let topPct;
        if (p < 0.30) {
          topPct = 46;
        } else if (p < 0.60) {
          let t = (p - 0.30) / 0.30;
          topPct = (1 - t) * 46 + t * 43.5;
        } else {
          let t = (p - 0.60) / 0.40;
          topPct = (1 - t) * 43.5 + t * 20;
        }
        pfpStage.style.top = `${topPct.toFixed(2)}%`;

        // Scale: Frame 1 (0.72) -> Frame 2 (0.78) -> Frame 3 (0.50)
        let mobScale;
        if (p < 0.30) {
          mobScale = 0.72 + (p * 0.20);
        } else if (p < 0.60) {
          mobScale = 0.78;
        } else {
          let t = (p - 0.60) / 0.40;
          mobScale = (1 - t) * 0.78 + t * 0.50;
        }

        // NO 3D ROTATION ON MOBILE: Flat, steady, smooth photo!
        pfpStage.style.transform = `translate(-50%, -50%) scale(${mobScale.toFixed(3)})`;

        // In Frame 3 (p > 0.65), profile coin fades out on mobile so screenshot cards scroll cleanly
        if (p > 0.65) {
          pfpStage.style.opacity = Math.max(0, 1 - (p - 0.65) * 5).toFixed(3);
        } else {
          pfpStage.style.opacity = '1';
        }
      }

      // Resume/CV Button: Appears ONLY in Frame 2 (p >= 0.22 and p <= 0.65)
      const tagResume = document.getElementById('tagResume');
      if (tagResume) {
        if (p >= 0.22 && p <= 0.65) {
          tagResume.style.opacity = '1';
          tagResume.style.pointerEvents = 'auto';
        } else {
          tagResume.style.opacity = '0';
          tagResume.style.pointerEvents = 'none';
        }
      }

      return;
    }

    // Once user reaches Frame 3 for the first time, mark initial coin flip as permanently DONE until page refresh
    if (p >= 0.65) {
      initialCoinFlipDone = true;
    }

    // 1. Frame 1 Elements (Title, Blurry Card, Specs) fade out (0.0 -> 0.28)
    const f1Opacity = isMobile ? Math.max(0, 1 - p * 4.2) : Math.max(0, 1 - p * 3.3);
    document.querySelectorAll('.frame1-el').forEach(el => {
      el.style.opacity = f1Opacity.toFixed(3);
      if (isMobile) {
        el.style.transform = `translate3d(0, ${(p * -40).toFixed(1)}px, 0)`;
      } else {
        el.style.transform = `translate3d(${(p * -120).toFixed(1)}px, 0, 0)`;
      }
      el.style.pointerEvents = f1Opacity > 0.3 ? 'auto' : 'none';
    });

    // 2. Frame 2 Statement Elements (ONLY active on INITIAL FIRST scroll down from home page)
    let f2Opacity = 0;
    if (!initialCoinFlipDone && !isScrollingUp) {
      if (isMobile) {
        if (p >= 0.20 && p <= 0.50) {
          const distFromPeak = Math.abs(p - 0.35);
          f2Opacity = Math.max(0, 1 - distFromPeak * 6.6);
        }
      } else {
        if (p >= 0.25 && p <= 0.72) {
          const distFromPeak = Math.abs(p - 0.485);
          f2Opacity = Math.max(0, 1 - distFromPeak * 4.8);
        }
      }
    }
    if (frame2Left) frame2Left.style.opacity = f2Opacity.toFixed(3);
    if (frame2Right) frame2Right.style.opacity = f2Opacity.toFixed(3);

    // 3. Frame 3 Settled Stage
    let f3Opacity = 0;
    const f3Start = isMobile ? 0.50 : 0.68;
    if (p > f3Start) {
      f3Opacity = Math.min(1, (p - f3Start) * (isMobile ? 3.5 : 3.125));
    }
    if (frame3Settled) {
      frame3Settled.style.opacity = f3Opacity.toFixed(3);
      frame3Settled.style.transform = `translateX(-50%) translate3d(0, ${((1 - f3Opacity) * 20).toFixed(1)}px, 0)`;
      frame3Settled.style.pointerEvents = f3Opacity > 0.4 ? 'auto' : 'none';
    }

    // 4. Central Profile Disc Motion Controller
    if (pfpStage) {
      let leftPct, topPct;
      if (isMobile) {
        leftPct = 50;
        if (p > 0.50) {
          let t = (p - 0.50) / 0.50;
          topPct = (1 - t) * 48 + t * 14;
        } else {
          topPct = 46 + (p * 4);
        }
      } else {
        leftPct = 58 - (p * 8);
        topPct  = 48 + (p * 2);
      }

      // 3D Coin Rotation Dynamics: ACTIVE ONLY ON INITIAL FIRST SCROLL DOWN (Never re-triggers on subsequent scrolls)
      let rotX = 0, rotY = 0, rotZ = 0;
      if (!initialCoinFlipDone && !isScrollingUp) {
        rotX = Math.sin(p * Math.PI) * 72;
        rotY = Math.sin(p * Math.PI) * -24;
        rotZ = p * 360;
      }

      // Scale interpolation
      let baseScale = isMobile ? 0.72 : 1;
      let settledScale = isMobile ? 0.46 : 0.6815;

      let scale = baseScale + Math.sin(p * Math.PI) * 0.16;
      if (p > 0.50) {
        let t = (p - 0.50) / 0.50;
        scale = (1 - t) * (baseScale + Math.sin(0.50 * Math.PI) * 0.16) + t * settledScale;
      }
      if (isScrollingUp) {
        scale = settledScale + (1 - p) * (baseScale - settledScale);
      }



      // Solid metallic coin cylinder edge wall fades out as coin settles flat
      const coinCylinder = document.getElementById('coinSolidCylinder');
      if (coinCylinder) {
        const cylinderOpacity = p > 0.68 ? Math.max(0, 1 - (p - 0.68) * 4) : 1;
        coinCylinder.style.opacity = cylinderOpacity.toFixed(3);
      }

      // Profile coin is always 100% visible
      pfpStage.style.opacity = '1';

      // Resume/CV button visible in Frame 3 on BOTH mobile and desktop
      const tagResume = document.getElementById('tagResume');
      if (tagResume) {
        const threshold = isMobile ? 0.45 : 0.62;
        if (p < threshold) {
          tagResume.style.opacity = '0';
          tagResume.style.pointerEvents = 'none';
        } else {
          tagResume.style.opacity = '1';
          tagResume.style.pointerEvents = 'auto';
        }
      }

      let tiltMouseX = (mouseX * 12 * (1 - p)).toFixed(1);
      let tiltMouseY = (mouseY * 12 * (1 - p)).toFixed(1);

      pfpStage.style.left = `${leftPct.toFixed(2)}%`;
      pfpStage.style.top  = `${topPct.toFixed(2)}%`;
      pfpStage.style.transform = `translate(-50%, -50%) translate3d(${tiltMouseX}px, ${tiltMouseY}px, 0) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
    }
  }

  window.addEventListener('scroll', updateHeroScroll, { passive: true });
  window.addEventListener('resize', updateHeroScroll, { passive: true });
  updateHeroScroll();

  function revealHero() {
    const titleStage = document.getElementById('heroTitleStage');
    if (titleStage) titleStage.classList.add('in-view');
  }


  // ===================================================
  // CUSTOM CURSOR
  // ===================================================
  const cursor     = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');
  const cursorText  = document.getElementById('cursorText');
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    cursorText.style.left = mx + 'px';
    cursorText.style.top  = (my + 30) + 'px';
  });

  (function trailLoop() {
    tx += (mx - tx) * 0.1;
    ty += (my - ty) * 0.1;
    cursorTrail.style.left = tx + 'px';
    cursorTrail.style.top  = ty + 'px';
    requestAnimationFrame(trailLoop);
  })();

  document.querySelectorAll('a, button, .proj-card, .scard, .exp-item, .tab-btn, .ptab-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '50px';
      cursor.style.height = '50px';
      cursor.style.background = 'transparent';
      cursor.style.border = '1.5px solid var(--pink, #E85B64)';
      cursorTrail.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '10px';
      cursor.style.height = '10px';
      cursor.style.background = '#E85B64';
      cursor.style.border = 'none';
      cursorTrail.style.opacity = '0.45';
    });
  });

  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      cursorText.textContent = 'VIEW';
      cursorText.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      cursorText.style.opacity = '0';
    });
  });


  // ===================================================
  // SCROLL PROGRESS BAR
  // ===================================================
  const scrollBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollBar.style.width = pct + '%';
  }, { passive: true });


  // ===================================================
  // NAVBAR SCROLL + TIME
  // ===================================================
  const navbar  = document.getElementById('navbar');
  const navTime = document.getElementById('navTime');

  function updateTime() {
    const opts = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    navTime.textContent = 'IST · ' + new Date().toLocaleTimeString('en-IN', opts);
  }
  updateTime();
  setInterval(updateTime, 1000);

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });


  // ===================================================
  // HAMBURGER / MOBILE MENU
  // ===================================================
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
  });

  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });


  // ===================================================
  // INTERSECTION OBSERVER — AOS
  // ===================================================
  const aosEls = document.querySelectorAll('[data-aos]');

  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Handle bh-line and cbig-line children
        entry.target.querySelectorAll('.bh-line, .cbig-line, .cbig-sub').forEach(line => {
          line.classList.add('in-view');
        });
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  aosEls.forEach(el => aosObserver.observe(el));

  // Also observe bh-lines directly
  document.querySelectorAll('.bh-line').forEach(line => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    obs.observe(line);
  });

  // cbig lines — wrap text content in span for clip animation
  document.querySelectorAll('.cbig-line').forEach(line => {
    if (!line.querySelector('span') && line.textContent.trim()) {
      const txt = line.innerHTML;
      line.innerHTML = `<span>${txt}</span>`;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    obs.observe(line);
  });


  // ===================================================
  // STAT COUNTER ANIMATION
  // ===================================================
  function countUp(el, target) {
    let start = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      el.textContent = Math.round(start) + '+';
    }, 35);
  }

  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const val = parseInt(e.target.dataset.val);
        countUp(e.target, val);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.snum').forEach(el => counterObs.observe(el));


  // ===================================================
  // HERO TYPEWRITER ANIMATION
  // ===================================================
  (function initHeroTypewriter() {
    const textEl   = document.getElementById('typewriterText');
    const cursorEl = document.getElementById('typewriterCursor');
    if (!textEl) return;

    const titles = [
      'FULL-STACK DEVELOPER',
      'AI ENGINEER',
      'PROBLEM SOLVER',
      'PRODUCT BUILDER'
    ];

    const TYPE_SPEED      = 90;   // ~80-100ms per character
    const PAUSE_TIME      = 1800; // ~1.8s pause after title complete
    const BACKSPACE_SPEED = 55;   // ~45-65ms per character
    const DELETE_PAUSE    = 300;  // ~300ms pause after deletion

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      textEl.textContent = titles[0];
      if (cursorEl) cursorEl.style.display = 'none';
      return;
    }

    let titleIndex = 0;
    let charIndex  = titles[0].length;
    let isDeleting = false;

    function step() {
      const currentTitle = titles[titleIndex];

      if (!isDeleting) {
        // Typing phase
        if (charIndex < currentTitle.length) {
          charIndex++;
          textEl.textContent = currentTitle.slice(0, charIndex);
          setTimeout(step, TYPE_SPEED);
        } else {
          // Complete title typed -> Pause 1.8s then backspace
          isDeleting = true;
          setTimeout(step, PAUSE_TIME);
        }
      } else {
        // Backspacing phase
        if (charIndex > 0) {
          charIndex--;
          textEl.textContent = currentTitle.slice(0, charIndex);
          setTimeout(step, BACKSPACE_SPEED);
        } else {
          // Title deleted -> Pause 300ms then move to next title
          isDeleting = false;
          titleIndex = (titleIndex + 1) % titles.length;
          setTimeout(step, DELETE_PAUSE);
        }
      }
    }

    // Initial state displays "FULL-STACK DEVELOPER|", pause 1.8s then start sequence
    setTimeout(step, PAUSE_TIME);
  })();


  // ===================================================
  // ABOUT TABS
  // ===================================================
  const tabBtns     = document.querySelectorAll('.tab-btn');
  const tabPanes    = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById(t);
      if (pane) pane.classList.add('active');
    });
  });


  // ===================================================
  // PROJECTS — WATERMARK HEADING CHANGES ON SCROLL
  // ===================================================
  const projCards   = document.querySelectorAll('.psc');
  const projWmark   = document.getElementById('projWatermark');
  const wmarkText   = document.getElementById('projWatermarkText');
  let currentCat    = '';

  if (projCards.length && wmarkText) {
    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cat = entry.target.dataset.catshort || 'AI';
          if (cat !== currentCat) {
            currentCat = cat;
            // Fade out, change text, fade in
            projWmark.classList.add('fading');
            setTimeout(() => {
              wmarkText.textContent = cat;
              projWmark.classList.remove('fading');
            }, 280);
          }
        }
      });
    }, { threshold: 0.45, rootMargin: '-80px 0px -20% 0px' });

    projCards.forEach(card => cardObs.observe(card));
  }


  // ===================================================
  // MOBILE PROJECT CARDS — Staggered reveal on scroll
  // (sticky stack: cards revealed via IntersectionObserver)
  // ===================================================
  (function initMobileCardReveal() {
    if (window.innerWidth > 768) return; // desktop handles its own scroll

    const cards = Array.from(document.querySelectorAll('.psc'));
    if (!cards.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mob-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(card => obs.observe(card));

    // Re-run on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        cards.forEach(c => c.classList.remove('mob-revealed'));
        obs.disconnect();
      }
    }, { once: true, passive: true });
  })();


  // ===================================================
  // 3D TILT ON STACKING PROJECT CARDS (desktop only)
  // ===================================================
  if (window.innerWidth > 768) {
  document.querySelectorAll('.psc').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateZ(6px)`;
      card.style.transition = 'box-shadow 0.3s, border-color 0.3s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s var(--ease-out)';
    });
  });
  }


  // ===================================================
  // MAGNETIC BUTTONS
  // ===================================================
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r    = el.getBoundingClientRect();
      const xOff = (e.clientX - r.left - r.width / 2) * 0.3;
      const yOff = (e.clientY - r.top - r.height / 2) * 0.3;
      el.style.transform = `translate(${xOff}px, ${yOff}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });


  // ===================================================
  // PFP PARALLAX on mouse move
  // ===================================================
  const pfpImg = document.getElementById('pfpImg');
  if (pfpImg) {
    document.addEventListener('mousemove', e => {
      const xRel = (e.clientX / window.innerWidth  - 0.5) * 8;
      const yRel = (e.clientY / window.innerHeight - 0.5) * 8;
      pfpImg.style.transform = `scale(1.08) translate(${xRel}px, ${yRel}px)`;
    });
  }


  // ===================================================
  // ACTIVE NAV LINK ON SCROLL
  // ===================================================
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => secObs.observe(s));


  // ===================================================
  // TEXT SCRAMBLE on section labels hover
  // ===================================================
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  document.querySelectorAll('.section-label').forEach(el => {
    const orig = el.textContent;
    let raf;
    el.addEventListener('mouseenter', () => {
      let iter = 0;
      clearInterval(raf);
      raf = setInterval(() => {
        el.textContent = orig.split('').map((c, i) => {
          if (i < iter || c === ' ' || c === '—') return c;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iter >= orig.length) clearInterval(raf);
        iter += 1.5;
      }, 35);
    });
    el.addEventListener('mouseleave', () => { clearInterval(raf); el.textContent = orig; });
  });


  // ===================================================
  // SMART MAIL TRIGGER HANDLER
  // Desktop: opens Gmail Web Compose in new tab with pre-filled To:
  // Mobile: opens native Mail app with pre-filled To:
  // ===================================================
  document.querySelectorAll('a[href^="mailto:"], .contact-connect-btn, .mail-trigger').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const isMobile = window.innerWidth <= 768;
      const targetEmail = 'jatinchoudhary07.05@gmail.com';
      const subject = encodeURIComponent("Portfolio Inquiry - Let's Connect");

      if (isMobile) {
        window.location.href = `mailto:${targetEmail}?subject=${subject}`;
      } else {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${subject}`, '_blank');
      }
    });
  });

  // ===================================================
  // CONTACT FORM SUBMISSION HANDLER
  // Sends message directly to jatinchoudhary07.05@gmail.com
  // ===================================================
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSucc  = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      
      const nameVal  = document.getElementById('nameInput')?.value.trim();
      const emailVal = document.getElementById('emailInput')?.value.trim();
      const msgVal   = document.getElementById('msgInput')?.value.trim();

      if (!nameVal || !emailVal || !msgVal) return;

      const btnSpan = submitBtn?.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'Sending...';
      if (submitBtn) submitBtn.disabled = true;

      let sentSuccess = false;

      // 1. Primary: FormSubmit API to jatinchoudhary07.05@gmail.com
      try {
        const response = await fetch('https://formsubmit.co/ajax/jatinchoudhary07.05@gmail.com', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal,
            message: msgVal,
            _subject: `New Portfolio Inquiry from ${nameVal}`
          })
        });

        const data = await response.json();
        if (response.ok || data.success === "true" || data.success === true) {
          sentSuccess = true;
        }
      } catch (err) {
        console.warn('FormSubmit attempt failed, trying Web3Forms backup...', err);
      }

      // 2. Backup: Web3Forms API
      if (!sentSuccess) {
        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_key: 'b9d5c58a-8a4c-4735-86ef-d75d5e5cf64d',
              email: 'jatinchoudhary07.05@gmail.com',
              name: nameVal,
              replyto: emailVal,
              message: msgVal,
              subject: `New Portfolio Inquiry from ${nameVal}`
            })
          });
          const resData = await res.json();
          if (res.ok || resData.success) {
            sentSuccess = true;
          }
        } catch (err) {
          console.warn('Web3Forms backup attempt failed', err);
        }
      }

      // 3. Response handling
      if (sentSuccess) {
        if (formSucc) {
          formSucc.style.display = 'block';
          formSucc.style.color = '#10B981';
          formSucc.innerHTML = '✔ Message sent successfully! I will get back to you soon.';
        }
        form.reset();
      } else {
        // Fallback: Open Gmail / Mail Client with pre-filled message
        const isMobile = window.innerWidth <= 768;
        const subject = encodeURIComponent(`Portfolio Inquiry from ${nameVal}`);
        const body    = encodeURIComponent(`Name: ${nameVal}\nEmail: ${emailVal}\n\nMessage:\n${msgVal}`);
        
        if (isMobile) {
          window.location.href = `mailto:jatinchoudhary07.05@gmail.com?subject=${subject}&body=${body}`;
        } else {
          window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=jatinchoudhary07.05@gmail.com&su=${subject}&body=${body}`, '_blank');
        }

        if (formSucc) {
          formSucc.style.display = 'block';
          formSucc.style.color = 'var(--pink)';
          formSucc.innerHTML = 'Opening Gmail compose with your message pre-filled...';
        }
      }

      if (btnSpan) btnSpan.textContent = "Let's Go!";
      if (submitBtn) submitBtn.disabled = false;
      setTimeout(() => { if (formSucc) formSucc.style.display = 'none'; }, 7000);
    });
  }


  // ===================================================
  // MARQUEE — pause on hover
  // ===================================================
  const track = document.querySelector('.marquee-track');
  if (track) {
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }


  // ===================================================
  // GLITCH effect on hero name on click
  // ===================================================
  const nameJatin = document.querySelector('.name-jatin');
  if (nameJatin) {
    nameJatin.addEventListener('click', () => {
      nameJatin.style.animation = 'none';
      nameJatin.style.textShadow = `
        4px 0 var(--blue, #86A8CF), -4px 0 var(--pink, #E85B64),
        0 4px rgba(255,255,255,0.3)
      `;
      setTimeout(() => { nameJatin.style.textShadow = ''; }, 300);
    });
  }


  // More button in Skills -> Scrolls to #about section and switches to Skills tab
  document.querySelectorAll('.settled-skills-more-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const aboutSec = document.getElementById('about');
      if (aboutSec) aboutSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const skillsTab = document.querySelector('.tab-btn[data-tab="skills-tab"]');
      if (skillsTab) skillsTab.click();
    });
  });

  // SMOOTH SCROLL for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ===================================================
  // SMART EMAIL LINK HANDLER
  // Laptop/Desktop: Opens Gmail web compose directly in new tab with to= prefilled
  // Mobile: Fires mailto: to trigger native app picker & mail app with to= prefilled
  // ===================================================
  function isMobileUser() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }

  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    link.addEventListener('click', function(e) {
      if (!isMobileUser()) {
        e.preventDefault();
        const rawHref = this.getAttribute('href');
        let emailTo = 'jatinchoudhary07.05@gmail.com';
        let subject = '';
        let body = '';

        if (rawHref.includes('?')) {
          const parts = rawHref.split('?');
          emailTo = parts[0].replace('mailto:', '').trim() || emailTo;
          const params = new URLSearchParams(parts[1]);
          subject = params.get('subject') || '';
          body = params.get('body') || '';
        } else {
          emailTo = rawHref.replace('mailto:', '').trim() || emailTo;
        }

        let gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo)}`;
        if (subject) gmailComposeUrl += `&su=${encodeURIComponent(subject)}`;
        if (body) gmailComposeUrl += `&body=${encodeURIComponent(body)}`;

        window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });

});

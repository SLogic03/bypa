/* ========================================================================
   BYRON ALTAMIRANO - WEBSITE INTERACTIONS
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========================= NAVBAR =========================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // Scroll behavior for navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    allNavLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);

    // ========================= SCROLL ANIMATIONS =========================
    const animatedElements = document.querySelectorAll('[data-animate]');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => animationObserver.observe(el));

    // ========================= COUNTER ANIMATION =========================
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    function animateCounter(el) {
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            el.textContent = current.toLocaleString('es-ES');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ========================= SMOOTH SCROLL =========================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================= WHATSAPP CHATBOX WIDGET =========================
    const waFab = document.getElementById('waFab');
    const waChatbox = document.getElementById('waChatbox');
    const waClose = document.getElementById('waChatboxClose');
    const waTextarea = document.getElementById('waTextarea');
    const waSendBtn = document.getElementById('waSendBtn');
    const waQuickBtns = document.querySelectorAll('.wa-quick-btn');
    const waBadge = document.querySelector('.wa-fab-badge');
    const waWidget = document.getElementById('waWidget');
    let waChatboxOpen = false;

    function toggleChatbox() {
        waChatboxOpen = !waChatboxOpen;
        waChatbox.classList.toggle('open', waChatboxOpen);
        waFab.classList.toggle('active', waChatboxOpen);
        if (waChatboxOpen && waBadge) {
            waBadge.style.display = 'none';
        }
    }

    if (waFab) waFab.addEventListener('click', toggleChatbox);
    if (waClose) waClose.addEventListener('click', toggleChatbox);

    // Close chatbox on click outside
    document.addEventListener('click', (e) => {
        if (waChatboxOpen && waWidget && !waWidget.contains(e.target)) {
            toggleChatbox();
        }
    });

    // Send button → open WhatsApp
    let waSelectedQuickOption = null;

    // Quick option buttons
    waQuickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            waQuickBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            waSelectedQuickOption = btn.dataset.msg;
            waTextarea.value = btn.dataset.msg;
            waTextarea.focus();
        });
    });

    // Clear quick option tracking when user types manually
    if (waTextarea) {
        waTextarea.addEventListener('input', () => {
            if (waTextarea.value.trim() !== waSelectedQuickOption) {
                waSelectedQuickOption = null;
                waQuickBtns.forEach(b => b.classList.remove('selected'));
            }
        });
    }

    if (waSendBtn) {
        waSendBtn.addEventListener('click', () => {
            const userMsg = waTextarea.value.trim();
            if (!userMsg) {
                waTextarea.classList.add('wa-shake');
                setTimeout(() => waTextarea.classList.remove('wa-shake'), 500);
                waTextarea.focus();
                return;
            }
            // If a quick option was selected, wrap it; otherwise send raw message
            const fullMsg = waSelectedQuickOption
                ? `Hola, me interesa: ${userMsg}`
                : userMsg;
            const url = `https://wa.me/593963528767?text=${encodeURIComponent(fullMsg)}`;
            window.open(url, '_blank');
        });
    }

    // Show FAB after scrolling past hero
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            waFab.style.opacity = '1';
            waFab.style.pointerEvents = 'auto';
        } else {
            waFab.style.opacity = '0';
            waFab.style.pointerEvents = 'none';
            if (waChatboxOpen) toggleChatbox();
        }
    });
    if (waFab) {
        waFab.style.opacity = '0';
        waFab.style.pointerEvents = 'none';
        waFab.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }

    // ========================= PARALLAX EFFECT ON HERO SHAPES =========================
    const heroShapes = document.querySelectorAll('.hero-bg-shapes .shape');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            heroShapes.forEach((shape, i) => {
                const speed = (i + 1) * 0.15;
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }
    });

    // ========================= TYPING EFFECT ON HERO TAG =========================
    const heroTag = document.querySelector('.hero-tag');
    if (heroTag) {
        const text = heroTag.textContent;
        heroTag.textContent = '';
        heroTag.style.opacity = '1';
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                heroTag.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        setTimeout(typeWriter, 800);
    }

    // ========================= VIDEO CAROUSEL =========================
    const carousel = document.querySelector('.video-carousel');
    if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let currentSlide = 0;
        const totalSlides = slides.length;

        // Create dots
        slides.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Ir al video ${idx + 1}`);
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(idx));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        function goToSlide(index) {
            // Pause all videos
            slides.forEach(slide => {
                const video = slide.querySelector('.carousel-video');
                const overlay = slide.querySelector('.video-overlay');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
                if (overlay) overlay.classList.remove('hidden');
            });

            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
        });

        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
        });

        // Play/Pause on click
        slides.forEach(slide => {
            const video = slide.querySelector('.carousel-video');
            const overlay = slide.querySelector('.video-overlay');
            const playBtn = slide.querySelector('.video-play-btn');

            function togglePlay() {
                if (video.paused) {
                    // Pause all other videos first
                    slides.forEach(s => {
                        const v = s.querySelector('.carousel-video');
                        const o = s.querySelector('.video-overlay');
                        if (v !== video) {
                            v.pause();
                            if (o) o.classList.remove('hidden');
                        }
                    });
                    video.play();
                    overlay.classList.add('hidden');
                } else {
                    video.pause();
                    overlay.classList.remove('hidden');
                }
            }

            playBtn.addEventListener('click', togglePlay);
            video.addEventListener('click', togglePlay);

            video.addEventListener('ended', () => {
                overlay.classList.remove('hidden');
            });
        });

        // Touch/Swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
                } else {
                    goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
                }
            }
        }, { passive: true });

        // Keyboard navigation
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
            }
        });
    }

});

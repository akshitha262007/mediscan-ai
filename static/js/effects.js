/**
 * effects.js — MediScan AI Visual Effects
 * - Custom cursor with magnetic hover
 * - Particle network canvas background
 * - Scroll-reveal entrance animations
 * - Page load animations
 */

/* ═══════════════════════════════════════════ CUSTOM CURSOR */
(function initCursor() {
    // Skip on touch-only devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX  = mouseX;
    let ringY  = mouseY;
    let isHovering = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
    });

    // Smooth lag ring
    function animateRing() {
        const lerpFactor = isHovering ? 0.08 : 0.1;
        ringX += (mouseX - ringX) * lerpFactor;
        ringY += (mouseY - ringY) * lerpFactor;
        ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Expand on interactive elements
    const interactives = 'a, button, input, .stat-card, .module-score-card, ' +
                         '.history-row, .dropzone, .finding-item, .module-info-card, ' +
                         '.action-btn, .nav-link, .verdict-banner';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactives)) {
            isHovering = true;
            ring.classList.add('cursor-ring--hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactives)) {
            isHovering = false;
            ring.classList.remove('cursor-ring--hover');
        }
    });

    document.addEventListener('mousedown', () => {
        dot.classList.add('cursor-dot--click');
        ring.classList.add('cursor-ring--click');
    });
    document.addEventListener('mouseup', () => {
        dot.classList.remove('cursor-dot--click');
        ring.classList.remove('cursor-ring--click');
    });
})();


/* ═══════════════════════════════════════════ PARTICLE NETWORK */
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let W, H, particles;

    const CONFIG = {
        count:       60,
        maxDist:     140,
        speed:       0.35,
        radius:      1.8,
        color:       '0, 212, 170',   // teal
        lineOpacity: 0.15,
        dotOpacity:  0.45,
    };

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function makeParticle() {
        return {
            x:  Math.random() * W,
            y:  Math.random() * H,
            vx: (Math.random() - 0.5) * CONFIG.speed,
            vy: (Math.random() - 0.5) * CONFIG.speed,
            r:  Math.random() * CONFIG.radius + 0.5,
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: CONFIG.count }, makeParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update + draw dots
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${CONFIG.color}, ${CONFIG.dotOpacity})`;
            ctx.fill();
        }

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.maxDist) {
                    const alpha = CONFIG.lineOpacity * (1 - dist / CONFIG.maxDist);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
                    ctx.lineWidth   = 0.6;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        // Reposition particles within new bounds
        for (const p of particles) {
            p.x = Math.min(p.x, W);
            p.y = Math.min(p.y, H);
        }
    });

    init();
    draw();
})();


/* ═══════════════════════════════════════════ SCROLL REVEAL */
(function initScrollReveal() {
    const revealEls = document.querySelectorAll(
        '.stat-card, .module-score-card, .detail-card, ' +
        '.history-card, .tech-details-card, .module-info-card, ' +
        '.verdict-banner, .scan-info-panel, .upload-section, ' +
        '.finding-item, .history-row'
    );

    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger based on index within parent
                const siblings = Array.from(
                    entry.target.parentElement.children
                );
                const idx = siblings.indexOf(entry.target);
                const delay = Math.min(idx * 60, 300);

                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => {
        el.classList.add('will-reveal');
        observer.observe(el);
    });
})();


/* ═══════════════════════════════════════════ PAGE LOAD ENTRANCE */
(function initEntrance() {
    document.body.classList.add('page-loaded');

    // Animate the creator banner text
    const bannerText = document.querySelector('.creator-banner-text');
    if (bannerText) {
        bannerText.style.opacity = '0';
        bannerText.style.transform = 'translateY(-8px)';
        setTimeout(() => {
            bannerText.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            bannerText.style.opacity = '1';
            bannerText.style.transform = 'translateY(0)';
        }, 300);
    }

    // Navbar slide in
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => {
            navbar.style.transform = 'translateY(0)';
        }, 100);
    }

    // Page content fade up
    const content = document.querySelector('.page-content, .auth-layout');
    if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(16px)';
        content.style.transition = 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s';
        requestAnimationFrame(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        });
    }
})();


/* ═══════════════════════════════════════════ MOUSE GLOW ON CARDS */
(function initCardGlow() {
    const cards = document.querySelectorAll(
        '.module-score-card, .stat-card, .detail-card, ' +
        '.tech-details-card, .history-card, .scan-info-panel'
    );

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
            const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });
})();

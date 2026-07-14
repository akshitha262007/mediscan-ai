/**
 * MediScan AI — 3D Animated Background
 *
 * Effects (all pure Canvas 2D, no libraries):
 *   1. Perspective receding grid (Tron-style floor)
 *   2. Floating wireframe 3-D cubes / octahedrons rotating in space
 *   3. Star-field with depth (particles moving toward viewer)
 *   4. Ambient colour nebula orbs (teal / purple / blue)
 *   5. Vignette edge darkening
 *   6. Pause when tab hidden (saves CPU / battery)
 */
(function () {
    'use strict';

    /* ── canvas setup ───────────────────────────────────────────── */
    const canvas = document.getElementById('bg3dCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, cx, cy, raf;
    let t = 0;              // master time counter

    /* colour shortcuts */
    const C_TEAL   = '0,212,170';
    const C_PURPLE = '147,51,234';
    const C_BLUE   = '59,130,246';
    const C_CYAN   = '6,182,212';

    function resize () {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cx = W / 2;
        cy = H / 2;
    }

    /* ══════════════════════════════════════════════════════════════
       1. NEBULA / COLOUR ORBS
       ══════════════════════════════════════════════════════════════ */
    const ORBS = [
        { bx: 0.18, by: 0.20, r: 0.42, c: C_TEAL,   s: 0.00025, ph: 0    },
        { bx: 0.80, by: 0.75, r: 0.36, c: C_PURPLE,  s: 0.00035, ph: 2.1  },
        { bx: 0.55, by: 0.45, r: 0.28, c: C_BLUE,    s: 0.00045, ph: 4.2  },
        { bx: 0.08, by: 0.82, r: 0.22, c: C_CYAN,    s: 0.00055, ph: 1.05 },
        { bx: 0.92, by: 0.15, r: 0.20, c: C_TEAL,    s: 0.00030, ph: 3.14 },
    ];

    function drawOrbs () {
        ORBS.forEach(o => {
            const ox = W * (o.bx + Math.sin(t * o.s * 6000 + o.ph) * 0.07);
            const oy = H * (o.by + Math.cos(t * o.s * 6000 + o.ph * 1.4) * 0.055);
            const r  = Math.min(W, H) * o.r;
            const g  = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
            g.addColorStop(0,   `rgba(${o.c},0.13)`);
            g.addColorStop(0.5, `rgba(${o.c},0.06)`);
            g.addColorStop(1,   `rgba(${o.c},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(ox, oy, r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /* ══════════════════════════════════════════════════════════════
       2. STAR-FIELD (depth particles)
       ══════════════════════════════════════════════════════════════ */
    const STAR_COUNT = 220;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
        x  : (Math.random() - 0.5) * 3000,
        y  : (Math.random() - 0.5) * 3000,
        z  : Math.random() * 1600 + 50,
        spd: Math.random() * 1.2 + 0.3,
        col: Math.random() < 0.15 ? C_TEAL : (Math.random() < 0.1 ? C_CYAN : '255,255,255'),
    }));

    function drawStars () {
        const FOV = 420;
        stars.forEach(s => {
            s.z -= s.spd * 1.5;
            if (s.z <= 1) {
                s.z = 1600;
                s.x = (Math.random() - 0.5) * 3000;
                s.y = (Math.random() - 0.5) * 3000;
            }
            const scale = FOV / s.z;
            const sx    = cx + s.x * scale;
            const sy    = cy + s.y * scale;
            if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) return;
            const r   = Math.max(0.2, scale * 1.6);
            const alp = Math.min(1, scale * 0.85);
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.col},${alp})`;
            ctx.fill();
        });
    }

    /* ══════════════════════════════════════════════════════════════
       3. PERSPECTIVE GRID (floor sweeping away)
       ══════════════════════════════════════════════════════════════ */
    function drawGrid () {
        const horizon  = cy * 0.62;
        const FOV      = 380;
        const CELL     = 130;
        const LINES    = 22;
        const scroll   = (t * 40) % CELL;   // grid moves toward viewer

        ctx.save();

        /* — horizontal rows — */
        for (let i = 0; i <= LINES; i++) {
            const z     = ((i * CELL) - scroll + CELL) % (CELL * LINES);
            const scale = FOV / (FOV + z);
            const y     = horizon + (H - horizon) * (1 - scale) * 1.9;
            if (y > H + 4) continue;
            const hw    = W * 0.7 * scale;
            const alp   = Math.min(0.45, scale * 0.55);
            const gr    = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
            gr.addColorStop(0,   `rgba(${C_TEAL},0)`);
            gr.addColorStop(0.5, `rgba(${C_TEAL},${alp})`);
            gr.addColorStop(1,   `rgba(${C_TEAL},0)`);
            ctx.beginPath();
            ctx.moveTo(cx - hw, y);
            ctx.lineTo(cx + hw, y);
            ctx.strokeStyle = gr;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
        }

        /* — vertical columns converging to horizon — */
        const VCOLS = 18;
        for (let i = 0; i <= VCOLS; i++) {
            const frac  = i / VCOLS;
            const nearX = cx + (frac - 0.5) * W * 1.4;
            const farX  = cx + (frac - 0.5) * 30;
            const alp   = 0.28 * (1 - Math.abs(frac - 0.5) * 1.8);
            const gr    = ctx.createLinearGradient(farX, horizon, nearX, H);
            gr.addColorStop(0, `rgba(${C_TEAL},0)`);
            gr.addColorStop(1, `rgba(${C_TEAL},${Math.max(0, alp)})`);
            ctx.beginPath();
            ctx.moveTo(farX, horizon);
            ctx.lineTo(nearX, H);
            ctx.strokeStyle = gr;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
        }

        /* — horizon glow — */
        const hg = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 60);
        hg.addColorStop(0,   `rgba(${C_TEAL},0)`);
        hg.addColorStop(0.5, `rgba(${C_TEAL},0.18)`);
        hg.addColorStop(1,   `rgba(${C_TEAL},0)`);
        ctx.fillStyle = hg;
        ctx.fillRect(0, horizon - 50, W, 110);

        ctx.restore();
    }

    /* ══════════════════════════════════════════════════════════════
       4. WIREFRAME 3-D CUBES
       ══════════════════════════════════════════════════════════════ */
    const EDGES = [
        [0,1],[1,2],[2,3],[3,0],  // front
        [4,5],[5,6],[6,7],[7,4],  // back
        [0,4],[1,5],[2,6],[3,7],  // sides
    ];

    function verts (s) {
        const h = s / 2;
        return [
            [-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],
            [-h,-h, h],[h,-h, h],[h,h, h],[-h,h, h],
        ];
    }

    /* rotation helpers */
    const rx = (p, a) => [p[0], p[1]*Math.cos(a)-p[2]*Math.sin(a), p[1]*Math.sin(a)+p[2]*Math.cos(a)];
    const ry = (p, a) => [p[0]*Math.cos(a)+p[2]*Math.sin(a), p[1], -p[0]*Math.sin(a)+p[2]*Math.cos(a)];
    const rz = (p, a) => [p[0]*Math.cos(a)-p[1]*Math.sin(a), p[0]*Math.sin(a)+p[1]*Math.cos(a), p[2]];

    function project (p, tx, ty, tz, FOV) {
        const pz = p[2] + tz + FOV;
        if (pz <= 10) return null;
        const sc = FOV / pz;
        return [cx + (p[0] + tx) * sc, cy + (p[1] + ty) * sc, sc];
    }

    /* cube definitions  — position, size, rotation speeds, colour */
    const CUBES = [
        { x:-310, y:-110, z:180, sz:85,  ax:0.41, ay:0.72, az:0.18, c:C_TEAL   },
        { x: 360, y:  55, z:310, sz:60,  ax:0.62, ay:0.30, az:0.50, c:C_PURPLE },
        { x:-160, y: 210, z:520, sz:110, ax:0.22, ay:0.85, az:0.12, c:C_BLUE   },
        { x: 210, y:-210, z:140, sz:50,  ax:0.90, ay:0.42, az:0.70, c:C_TEAL   },
        { x:-430, y: 110, z:420, sz:72,  ax:0.33, ay:0.60, az:0.40, c:C_CYAN   },
        { x: 460, y:-160, z:640, sz:95,  ax:0.52, ay:0.20, az:0.82, c:C_PURPLE },
        { x:  80, y: 280, z:260, sz:55,  ax:0.70, ay:0.55, az:0.35, c:C_BLUE   },
    ];

    function drawCube (cube) {
        const FOV = 520;
        let vs = verts(cube.sz);
        vs = vs.map(p => rx(p, t * cube.ax));
        vs = vs.map(p => ry(p, t * cube.ay));
        vs = vs.map(p => rz(p, t * cube.az));
        const pr = vs.map(p => project(p, cube.x, cube.y, cube.z, FOV));
        if (pr.some(p => p === null)) return;

        const avgSc = pr.reduce((s, p) => s + (p ? p[2] : 0), 0) / pr.length;
        const alp   = Math.min(0.75, avgSc * 0.7);

        ctx.save();
        ctx.strokeStyle = `rgba(${cube.c},${alp})`;
        ctx.lineWidth   = Math.max(0.4, avgSc * 1.2);
        ctx.shadowColor = `rgba(${cube.c},0.4)`;
        ctx.shadowBlur  = 6;

        EDGES.forEach(([a, b]) => {
            if (!pr[a] || !pr[b]) return;
            ctx.beginPath();
            ctx.moveTo(pr[a][0], pr[a][1]);
            ctx.lineTo(pr[b][0], pr[b][1]);
            ctx.stroke();
        });
        ctx.restore();
    }

    /* ══════════════════════════════════════════════════════════════
       5. FLOATING RING / TORUS-LIKE CIRCLE OUTLINES
       ══════════════════════════════════════════════════════════════ */
    const RINGS = [
        { x:-200, y: 100, z:350, r:70,  ax:0.3,  ay:0.5,  c:C_TEAL   },
        { x: 300, y:-180, z:250, r:50,  ax:0.5,  ay:0.25, c:C_PURPLE },
        { x: 100, y: 250, z:480, r:90,  ax:0.2,  ay:0.6,  c:C_BLUE   },
    ];

    function drawRings () {
        const FOV = 520;
        RINGS.forEach(ring => {
            /* approximate a tilted ellipse via parametric points */
            const pts = 48;
            const projected = [];
            for (let i = 0; i < pts; i++) {
                const a = (i / pts) * Math.PI * 2;
                let p = [Math.cos(a) * ring.r, Math.sin(a) * ring.r, 0];
                p = rx(p, t * ring.ax);
                p = ry(p, t * ring.ay);
                const pr = project(p, ring.x, ring.y, ring.z, FOV);
                projected.push(pr);
            }
            if (projected.some(p => p === null)) return;
            const avgSc = projected.reduce((s, p) => s + p[2], 0) / projected.length;
            const alp   = Math.min(0.55, avgSc * 0.65);

            ctx.save();
            ctx.strokeStyle = `rgba(${ring.c},${alp})`;
            ctx.lineWidth   = Math.max(0.3, avgSc * 0.8);
            ctx.shadowColor = `rgba(${ring.c},0.3)`;
            ctx.shadowBlur  = 5;
            ctx.beginPath();
            projected.forEach((p, i) => {
                if (!p) return;
                i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]);
            });
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        });
    }

    /* ══════════════════════════════════════════════════════════════
       6. VIGNETTE
       ══════════════════════════════════════════════════════════════ */
    function drawVignette () {
        const g = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.3, cx, cy, Math.max(W,H)*0.85);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    /* ══════════════════════════════════════════════════════════════
       MAIN RENDER LOOP
       ══════════════════════════════════════════════════════════════ */
    function render () {
        /* base background */
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#03080f');
        bg.addColorStop(0.5, '#050d1e');
        bg.addColorStop(1, '#03080f');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        drawOrbs();
        drawStars();
        drawGrid();
        CUBES.forEach(drawCube);
        drawRings();
        drawVignette();

        t   += 0.007;
        raf  = requestAnimationFrame(render);
    }

    /* ── init ── */
    window.addEventListener('resize', resize);
    resize();
    render();

    /* pause when tab hidden — saves CPU/battery */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(raf);
        } else {
            render();
        }
    });
}());

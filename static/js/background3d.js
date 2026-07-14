/**
 * MediScan AI — 3D Animated Background
 * Medical colour palette: light blues, ice white, sky, clinical cyan
 *
 * Effects (pure Canvas 2D):
 *   1. Perspective receding grid
 *   2. Wireframe cubes/rings spread across the full viewport
 *   3. Star-field with depth
 *   4. Ambient nebula orbs
 *   5. Vignette
 */
(function () {
    'use strict';

    const canvas = document.getElementById('bg3dCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, cx, cy, raf;
    let t = 0;

    /* ── Medical colour palette ─────────────────────────────────── */
    const C_SKYBLUE  = '100,180,255';   // bright sky blue
    const C_ICE      = '200,230,255';   // near-white ice blue
    const C_CYAN     = '0,200,230';     // clinical cyan
    const C_ROYAL    = '60,120,220';    // royal medical blue
    const C_WHITE    = '230,245,255';   // soft white

    function resize () {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cx = W / 2;
        cy = H / 2;
    }

    /* ══════════════════════════════════════════════════════════════
       1. NEBULA ORBS — muted blue/white tones
    ══════════════════════════════════════════════════════════════ */
    const ORBS = [
        { bx: 0.15, by: 0.18, r: 0.40, c: C_SKYBLUE, s: 0.00022, ph: 0    },
        { bx: 0.82, by: 0.72, r: 0.34, c: C_ROYAL,   s: 0.00032, ph: 2.1  },
        { bx: 0.52, by: 0.48, r: 0.26, c: C_CYAN,    s: 0.00042, ph: 4.2  },
        { bx: 0.06, by: 0.80, r: 0.20, c: C_ICE,     s: 0.00052, ph: 1.05 },
        { bx: 0.90, by: 0.12, r: 0.18, c: C_WHITE,   s: 0.00028, ph: 3.14 },
    ];

    function drawOrbs () {
        ORBS.forEach(o => {
            const ox = W * (o.bx + Math.sin(t * o.s * 6000 + o.ph) * 0.07);
            const oy = H * (o.by + Math.cos(t * o.s * 6000 + o.ph * 1.4) * 0.055);
            const r  = Math.min(W, H) * o.r;
            const g  = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
            g.addColorStop(0,   `rgba(${o.c},0.10)`);
            g.addColorStop(0.5, `rgba(${o.c},0.04)`);
            g.addColorStop(1,   `rgba(${o.c},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(ox, oy, r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /* ══════════════════════════════════════════════════════════════
       2. STAR-FIELD — white/ice blue stars
    ══════════════════════════════════════════════════════════════ */
    const STAR_COUNT = 200;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
        x  : (Math.random() - 0.5) * 3000,
        y  : (Math.random() - 0.5) * 3000,
        z  : Math.random() * 1600 + 50,
        spd: Math.random() * 1.0 + 0.3,
        col: Math.random() < 0.2 ? C_SKYBLUE : (Math.random() < 0.1 ? C_CYAN : C_ICE),
    }));

    function drawStars () {
        const FOV = 420;
        stars.forEach(s => {
            s.z -= s.spd * 1.4;
            if (s.z <= 1) {
                s.z = 1600;
                s.x = (Math.random() - 0.5) * 3000;
                s.y = (Math.random() - 0.5) * 3000;
            }
            const scale = FOV / s.z;
            const sx    = cx + s.x * scale;
            const sy    = cy + s.y * scale;
            if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) return;
            const r   = Math.max(0.2, scale * 1.4);
            const alp = Math.min(0.9, scale * 0.80);
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.col},${alp})`;
            ctx.fill();
        });
    }

    /* ══════════════════════════════════════════════════════════════
       3. PERSPECTIVE GRID — icy blue lines
    ══════════════════════════════════════════════════════════════ */
    function drawGrid () {
        const horizon  = cy * 0.60;
        const FOV      = 380;
        const CELL     = 130;
        const LINES    = 22;
        const scroll   = (t * 38) % CELL;

        ctx.save();

        /* horizontal rows */
        for (let i = 0; i <= LINES; i++) {
            const z     = ((i * CELL) - scroll + CELL) % (CELL * LINES);
            const scale = FOV / (FOV + z);
            const y     = horizon + (H - horizon) * (1 - scale) * 1.9;
            if (y > H + 4) continue;
            const hw    = W * 0.7 * scale;
            const alp   = Math.min(0.35, scale * 0.45);
            const gr    = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
            gr.addColorStop(0,   `rgba(${C_SKYBLUE},0)`);
            gr.addColorStop(0.5, `rgba(${C_SKYBLUE},${alp})`);
            gr.addColorStop(1,   `rgba(${C_SKYBLUE},0)`);
            ctx.beginPath();
            ctx.moveTo(cx - hw, y);
            ctx.lineTo(cx + hw, y);
            ctx.strokeStyle = gr;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
        }

        /* vertical columns */
        const VCOLS = 18;
        for (let i = 0; i <= VCOLS; i++) {
            const frac  = i / VCOLS;
            const nearX = cx + (frac - 0.5) * W * 1.4;
            const farX  = cx + (frac - 0.5) * 30;
            const alp   = 0.22 * (1 - Math.abs(frac - 0.5) * 1.8);
            const gr    = ctx.createLinearGradient(farX, horizon, nearX, H);
            gr.addColorStop(0, `rgba(${C_SKYBLUE},0)`);
            gr.addColorStop(1, `rgba(${C_SKYBLUE},${Math.max(0, alp)})`);
            ctx.beginPath();
            ctx.moveTo(farX, horizon);
            ctx.lineTo(nearX, H);
            ctx.strokeStyle = gr;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
        }

        /* horizon glow */
        const hg = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 60);
        hg.addColorStop(0,   `rgba(${C_CYAN},0)`);
        hg.addColorStop(0.5, `rgba(${C_CYAN},0.14)`);
        hg.addColorStop(1,   `rgba(${C_CYAN},0)`);
        ctx.fillStyle = hg;
        ctx.fillRect(0, horizon - 50, W, 110);

        ctx.restore();
    }

    /* ══════════════════════════════════════════════════════════════
       4. WIREFRAME 3-D CUBES — spread across FULL viewport
          Key fix: use screenX/Y offsets so cubes appear at screen
          edges, not just the centre
    ══════════════════════════════════════════════════════════════ */
    const EDGES = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7],
    ];

    function verts (s) {
        const h = s / 2;
        return [
            [-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],
            [-h,-h, h],[h,-h, h],[h,h, h],[-h,h, h],
        ];
    }

    const rx = (p, a) => [p[0], p[1]*Math.cos(a)-p[2]*Math.sin(a), p[1]*Math.sin(a)+p[2]*Math.cos(a)];
    const ry = (p, a) => [p[0]*Math.cos(a)+p[2]*Math.sin(a), p[1], -p[0]*Math.sin(a)+p[2]*Math.cos(a)];
    const rz = (p, a) => [p[0]*Math.cos(a)-p[1]*Math.sin(a), p[0]*Math.sin(a)+p[1]*Math.cos(a), p[2]];

    /* Project using SCREEN-SPACE offset (sx, sy) so cubes are
       pinned to specific screen regions instead of all converging
       to the same vanishing point.                                */
    function projectScreen (p, sz, sx, sy) {
        /* sz = depth offset (z-axis); sx/sy = screen-space anchor */
        const pz = p[2] + sz + 300;
        if (pz <= 10) return null;
        const sc = 300 / pz;
        return [sx + p[0] * sc, sy + p[1] * sc, sc];
    }

    /* Each cube has a screenX/Y (fraction of W/H) anchor so they
       spread across all four corners and edges of the display.    */
    const CUBES = [
        // top-left region
        { fx:0.08, fy:0.15, sz:120, sz3:80,  ax:0.41, ay:0.72, az:0.18, c:C_SKYBLUE },
        // top-right region
        { fx:0.90, fy:0.12, sz:140, sz3:65,  ax:0.55, ay:0.30, az:0.44, c:C_ICE     },
        // bottom-left region
        { fx:0.07, fy:0.80, sz:100, sz3:90,  ax:0.28, ay:0.60, az:0.15, c:C_CYAN    },
        // bottom-right region
        { fx:0.92, fy:0.82, sz:130, sz3:75,  ax:0.62, ay:0.45, az:0.55, c:C_ROYAL   },
        // mid-left
        { fx:0.04, fy:0.48, sz:160, sz3:55,  ax:0.38, ay:0.82, az:0.30, c:C_WHITE   },
        // mid-right
        { fx:0.96, fy:0.52, sz:150, sz3:60,  ax:0.70, ay:0.25, az:0.65, c:C_SKYBLUE },
        // upper-mid-left
        { fx:0.22, fy:0.06, sz:180, sz3:50,  ax:0.50, ay:0.55, az:0.40, c:C_ICE     },
        // upper-mid-right
        { fx:0.78, fy:0.08, sz:170, sz3:70,  ax:0.33, ay:0.68, az:0.22, c:C_CYAN    },
        // lower-mid-left
        { fx:0.18, fy:0.92, sz:190, sz3:85,  ax:0.45, ay:0.38, az:0.58, c:C_ROYAL   },
        // lower-mid-right
        { fx:0.82, fy:0.90, sz:145, sz3:62,  ax:0.60, ay:0.50, az:0.35, c:C_WHITE   },
    ];

    function drawCube (cube) {
        const sx = cube.fx * W;
        const sy = cube.fy * H;
        let vs = verts(cube.sz3);
        vs = vs.map(p => rx(p, t * cube.ax));
        vs = vs.map(p => ry(p, t * cube.ay));
        vs = vs.map(p => rz(p, t * cube.az));
        const pr = vs.map(p => projectScreen(p, cube.sz, sx, sy));
        if (pr.some(p => p === null)) return;

        const avgSc = pr.reduce((s, p) => s + (p ? p[2] : 0), 0) / pr.length;
        const alp   = Math.min(0.65, avgSc * 1.8);

        ctx.save();
        ctx.strokeStyle = `rgba(${cube.c},${alp})`;
        ctx.lineWidth   = Math.max(0.4, avgSc * 1.0);
        ctx.shadowColor = `rgba(${cube.c},0.35)`;
        ctx.shadowBlur  = 5;

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
       5. FLOATING RINGS — spread across screen similarly
    ══════════════════════════════════════════════════════════════ */
    const RINGS = [
        { fx:0.12, fy:0.42, sz:140, r:55, ax:0.32, ay:0.50, c:C_SKYBLUE },
        { fx:0.88, fy:0.38, sz:160, r:45, ax:0.48, ay:0.26, c:C_ICE     },
        { fx:0.50, fy:0.88, sz:180, r:70, ax:0.22, ay:0.62, c:C_CYAN    },
        { fx:0.50, fy:0.10, sz:150, r:40, ax:0.55, ay:0.40, c:C_ROYAL   },
    ];

    function drawRings () {
        RINGS.forEach(ring => {
            const sx = ring.fx * W;
            const sy = ring.fy * H;
            const pts = 48;
            const projected = [];
            for (let i = 0; i < pts; i++) {
                const a = (i / pts) * Math.PI * 2;
                let p = [Math.cos(a) * ring.r, Math.sin(a) * ring.r, 0];
                p = rx(p, t * ring.ax);
                p = ry(p, t * ring.ay);
                const pr = projectScreen(p, ring.sz, sx, sy);
                projected.push(pr);
            }
            if (projected.some(p => p === null)) return;
            const avgSc = projected.reduce((s, p) => s + p[2], 0) / projected.length;
            const alp   = Math.min(0.50, avgSc * 1.6);

            ctx.save();
            ctx.strokeStyle = `rgba(${ring.c},${alp})`;
            ctx.lineWidth   = Math.max(0.3, avgSc * 0.7);
            ctx.shadowColor = `rgba(${ring.c},0.25)`;
            ctx.shadowBlur  = 4;
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
        g.addColorStop(1, 'rgba(0,0,0,0.60)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    /* ══════════════════════════════════════════════════════════════
       MAIN LOOP
    ══════════════════════════════════════════════════════════════ */
    function render () {
        /* Dark navy-to-midnight background (looks clinical/medical) */
        const bg = ctx.createLinearGradient(0, 0, W * 0.5, H);
        bg.addColorStop(0,   '#020810');
        bg.addColorStop(0.5, '#030c1c');
        bg.addColorStop(1,   '#020810');
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

    window.addEventListener('resize', resize);
    resize();
    render();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else render();
    });
}());

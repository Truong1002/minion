// ==========================================
// MINION 2D FULLSCREEN HAND-DRAWN CANVAS ENGINE (PERFECT SMILE & LAYER ORDER FIX)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainWrapper = document.getElementById('mainWrapper');
    const btnStart = document.getElementById('btnStart');
    const btnFloatingReset = document.getElementById('btnFloatingReset');
    const pencilTool = document.getElementById('pencilTool');
    const pencilIcon = pencilTool.querySelector('.pencil-icon');
    const drawStatusBadge = document.getElementById('drawStatusBadge');
    const statusTitle = document.getElementById('statusTitle');
    const statusPercent = document.getElementById('statusPercent');
    const progressFillMini = document.getElementById('progressFillMini');

    const particleCanvas = document.getElementById('particle-canvas');
    const particleCtx = particleCanvas.getContext('2d');
    
    const mainArtCanvas = document.getElementById('mainArtCanvas');
    const artCtx = mainArtCanvas.getContext('2d');

    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');

    let width = mainArtCanvas.width = particleCanvas.width = confettiCanvas.width = window.innerWidth;
    let height = mainArtCanvas.height = particleCanvas.height = confettiCanvas.height = window.innerHeight;

    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: 140 };

    let isDrawing = false;
    let drawAnimFrame = null;
    const DRAW_DURATION = 13000; // phác chì ~7,5 giây rồi tô màu ~5,5 giây

    // Resize Handler
    window.addEventListener('resize', () => {
        width = mainArtCanvas.width = particleCanvas.width = confettiCanvas.width = window.innerWidth;
        height = mainArtCanvas.height = particleCanvas.height = confettiCanvas.height = window.innerHeight;
        initParticles();
        scheduleSketchRebuild();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    // Particle Dot Class for glowing background particles
    class DotParticle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            const colors = ['#FFE838', '#2365BF', '#F7C910', '#FF4757', '#00D2D3'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = Math.random() * 2 + 2;
        }

        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius && distance > 0) {
                let force = (mouse.radius - distance) / mouse.radius;
                let angle = Math.atan2(dy, dx);
                let push = force * 8;
                this.vx -= Math.cos(angle) * push;
                this.vy -= Math.sin(angle) * push;
            }

            this.vx *= 0.95;
            this.vy *= 0.95;

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < 150; i++) {
            particles.push(new DotParticle());
        }
    }

    function animateParticles() {
        particleCtx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(particleCtx);
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // Audio Synth: Minion cheerful sound
    function playMinionSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const audioCtx = new AudioCtx();

            const playNote = (freq, duration, type = 'sine', delay = 0) => {
                setTimeout(() => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                    
                    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.start();
                    osc.stop(audioCtx.currentTime + duration);
                }, delay * 1000);
            };

            playNote(400, 0.15, 'triangle', 0);
            playNote(600, 0.2, 'sine', 0.12);
            playNote(850, 0.4, 'triangle', 0.28);
        } catch (e) {}
    }

    // Confetti Engine
    let confettiParticles = [];
    let confettiFrameId = null;

    function createConfetti() {
        confettiParticles = [];
        const colors = ['#FFE838', '#2365BF', '#FF4757', '#2ED573', '#FFA502', '#00D2D3'];
        
        for (let i = 0; i < 180; i++) {
            confettiParticles.push({
                x: width / 2,
                y: height / 2,
                vx: (Math.random() - 0.5) * 24,
                vy: (Math.random() - 0.7) * 24,
                size: Math.random() * 10 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 12,
                gravity: 0.35,
                opacity: 1
            });
        }
    }

    function drawConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let activeCount = 0;

        confettiParticles.forEach(p => {
            if (p.opacity > 0) {
                activeCount++;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.vRot;
                p.opacity -= 0.007;

                confettiCtx.save();
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate((p.rotation * Math.PI) / 180);
                confettiCtx.globalAlpha = Math.max(0, p.opacity);
                confettiCtx.fillStyle = p.color;
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                confettiCtx.restore();
            }
        });

        if (activeCount > 0) {
            confettiFrameId = requestAnimationFrame(drawConfetti);
        } else {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    function startConfetti() {
        if (confettiFrameId) cancelAnimationFrame(confettiFrameId);
        createConfetti();
        drawConfetti();
    }

    // ==========================================
    // ĐỘNG CƠ TRANH CHÌ - dựng bức chì trực tiếp từ ảnh gốc "images (1).jpg"
    // Khử màu -> đảo âm bản -> làm nhòe -> color-dodge -> viền Sobel
    // -> gạch chéo vùng tối -> vân giấy, rồi hiện dần theo từng nét bút chì.
    // ==========================================

    const SKETCH = { blur: 8, dark: 0.63, edge: 0.54, hatch: 0.40 };
    const STROKE_COUNT = 74;
    const SKETCH_SPLIT = 0.58;   // phần đầu của tiến trình dành cho phác chì, phần sau để tô màu
    const COLOR_BANDS = 22;      // số dải sáp màu tô từ trên xuống

    let sketchInk = null;     // lớp "mực chì" (canvas)
    let sketchPaper = null;   // lớp giấy vẽ
    let sketchBox = null;     // vị trí tờ giấy trên màn hình {x, y, w, h}
    let maskCv = null, tmpCv = null;
    let colorCv = null, colorMaskCv = null, colorTmpCv = null;   // lớp màu + mặt nạ tô dần
    let sketchReady = false;
    let sketchShown = false;   // tranh đã được vẽ ra màn hình hay chưa
    let sketchTainted = false;
    let rebuildTimer = null;

    const photo = new Image();

    function mkCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w));
        c.height = Math.max(1, Math.round(h));
        return c;
    }

    // Làm nhòe hộp tách trục, 3 lượt ~ Gauss
    function blurArr(src, w, h, r) {
        if (r < 1) return src;
        let a = src, b = new Float32Array(w * h);
        for (let pass = 0; pass < 3; pass++) {
            for (let y = 0; y < h; y++) {
                const row = y * w;
                let sum = 0;
                for (let i = -r; i <= r; i++) sum += a[row + Math.min(w - 1, Math.max(0, i))];
                for (let x = 0; x < w; x++) {
                    b[row + x] = sum / (2 * r + 1);
                    sum += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
                }
            }
            for (let x = 0; x < w; x++) {
                let sum = 0;
                for (let i = -r; i <= r; i++) sum += b[Math.min(h - 1, Math.max(0, i)) * w + x];
                for (let y = 0; y < h; y++) {
                    a[y * w + x] = sum / (2 * r + 1);
                    sum += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
                }
            }
        }
        return a;
    }

    // Mẫu gạch chéo 16x16 dùng lại cho mọi lần dựng
    const HATCH = (function () {
        const p = mkCanvas(16, 16), g = p.getContext('2d');
        g.strokeStyle = '#3A3A42';
        g.lineWidth = 1.6;
        g.lineCap = 'round';
        for (let i = -16; i < 32; i += 6) {
            g.beginPath();
            g.moveTo(i, -2);
            g.lineTo(i + 18, 18);
            g.stroke();
        }
        return p;
    })();

    function buildPaperLayer(w, h) {
        const c = mkCanvas(w, h), g = c.getContext('2d');
        g.fillStyle = '#F4EEE1';
        g.fillRect(0, 0, w, h);

        // Hạt giấy: dựng trên canvas riêng rồi chồng lên bằng drawImage.
        // putImageData ghi đè cả kênh alpha, đặt thẳng lên nền sẽ làm giấy trong suốt.
        const grain = mkCanvas(w, h), gg = grain.getContext('2d');
        const n = gg.createImageData(w, h), d = n.data;
        for (let i = 0; i < w * h; i++) {
            const v = 236 + (Math.random() * 36 - 18);
            d[i * 4] = v; d[i * 4 + 1] = v - 3; d[i * 4 + 2] = v - 12; d[i * 4 + 3] = 52;
        }
        gg.putImageData(n, 0, 0);
        g.drawImage(grain, 0, 0);

        g.globalAlpha = 0.05;
        g.strokeStyle = '#8C8677';
        g.lineWidth = 1;
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * w, y = Math.random() * h;
            const len = 30 + Math.random() * 120, a = Math.random() * Math.PI;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
            g.stroke();
        }

        g.globalAlpha = 1;
        const vg = g.createRadialGradient(w / 2, h * 0.45, w * 0.25, w / 2, h * 0.5, w * 0.78);
        vg.addColorStop(0, 'rgba(120,108,86,0)');
        vg.addColorStop(1, 'rgba(120,108,86,0.3)');
        g.fillStyle = vg;
        g.fillRect(0, 0, w, h);
        return c;
    }

    // Tranh phủ kín màn hình: giấy trải toàn bộ viewport, hình vẽ phóng hết cỡ
    // (giữ đúng tỉ lệ ảnh) và chỉ chừa chỗ cho badge phía trên, nút "Thử lại"
    function computeSketchBox() {
        const ratio = (photo.naturalHeight || 1) / (photo.naturalWidth || 1);
        const narrow = width < 600;
        const padX = narrow ? 8 : 24;
        const padTop = narrow ? 64 : 76;       // nằm dưới badge tiến trình
        const padBottom = narrow ? 72 : 24;    // mobile: nút "Thử lại" ở góc dưới
        const availH = height - padTop - padBottom;
        const maxW = Math.min(width - padX * 2, 1400);
        const maxH = Math.min(availH, 1400);
        let w = Math.max(160, maxW);
        let h = w * ratio;
        if (h > maxH) { h = Math.max(160, maxH); w = h / ratio; }
        return {
            x: Math.round((width - w) / 2),
            y: Math.round(padTop + (availH - h) / 2),
            w: Math.round(w),
            h: Math.round(h)
        };
    }

    // Dựng lớp mực chì từ ảnh gốc
    function buildSketchLayers() {
        if (!photo.complete || !photo.naturalWidth) return false;

        sketchBox = computeSketchBox();
        const W = sketchBox.w, H = sketchBox.h;

        const srcCv = mkCanvas(W, H), sg = srcCv.getContext('2d', { willReadFrequently: true });
        sg.imageSmoothingQuality = 'high';
        sg.drawImage(photo, 0, 0, W, H);

        let px;
        try {
            px = sg.getImageData(0, 0, W, H).data;
        } catch (err) {
            sketchTainted = true;   // ảnh tải từ ổ đĩa -> canvas bị chặn đọc pixel
            return false;
        }

        // 1. khử màu theo trọng số mắt người
        const gray = new Float32Array(W * H);
        for (let i = 0; i < W * H; i++) {
            gray[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
        }

        // 2. đảo âm bản + làm nhòe
        const r = Math.max(2, Math.round(SKETCH.blur * W / 820));
        const inv = new Float32Array(W * H);
        for (let i = 0; i < W * H; i++) inv[i] = 255 - gray[i];
        const bl = blurArr(inv, W, H, r);

        // 3. color-dodge -> nền tranh chì
        const val = new Float32Array(W * H);
        for (let i = 0; i < W * H; i++) {
            const v = gray[i] * 256 / (256 - bl[i]);
            val[i] = v > 255 ? 255 : v;
        }

        // 4. điểm trắng + gamma cho giấy trắng bong, nét đậm
        const white = 255 - SKETCH.dark * 52, gm = 1 + SKETCH.dark * 2.1;
        for (let i = 0; i < W * H; i++) {
            let t = val[i] / white;
            if (t > 1) t = 1;
            val[i] = 255 * Math.pow(t, gm);
        }

        // 5. viền nét bằng bộ lọc Sobel
        if (SKETCH.edge > 0.01) {
            const sm = blurArr(Float32Array.from(gray), W, H, 1);
            for (let y = 1; y < H - 1; y++) {
                for (let x = 1; x < W - 1; x++) {
                    const i = y * W + x;
                    const gx = -sm[i - W - 1] - 2 * sm[i - 1] - sm[i + W - 1] + sm[i - W + 1] + 2 * sm[i + 1] + sm[i + W + 1];
                    const gy = -sm[i - W - 1] - 2 * sm[i - W] - sm[i - W + 1] + sm[i + W - 1] + 2 * sm[i + W] + sm[i + W + 1];
                    let m = Math.sqrt(gx * gx + gy * gy) / 4.2;
                    if (m > 255) m = 255;
                    m = m * SKETCH.edge * 1.5;
                    const v = val[i] * (255 - m) / 255;
                    val[i] = v < 0 ? 0 : v;
                }
            }
        }

        // 6. lớp mực chì: màu than, độ mờ = độ tối
        const ink = mkCanvas(W, H), ig = ink.getContext('2d');
        const id = ig.createImageData(W, H), dd = id.data;
        for (let i = 0; i < W * H; i++) {
            const a = 255 - val[i];
            dd[i * 4] = 43; dd[i * 4 + 1] = 43; dd[i * 4 + 2] = 52; dd[i * 4 + 3] = a < 0 ? 0 : a;
        }
        ig.putImageData(id, 0, 0);

        // 7. gạch chéo, chỉ ở vùng tối
        if (SKETCH.hatch > 0.01) {
            const hc = mkCanvas(W, H), hg = hc.getContext('2d');
            hg.fillStyle = hg.createPattern(HATCH, 'repeat');
            hg.fillRect(0, 0, W, H);

            const mk = mkCanvas(W, H), mg = mk.getContext('2d');
            const mi = mg.createImageData(W, H), md = mi.data;
            for (let i = 0; i < W * H; i++) {
                let a = ((255 - val[i]) / 255 - 0.18) * 1.9;
                if (a < 0) a = 0;
                if (a > 1) a = 1;
                md[i * 4 + 3] = a * 255 * SKETCH.hatch;
            }
            mg.putImageData(mi, 0, 0);
            hg.globalCompositeOperation = 'destination-in';
            hg.drawImage(mk, 0, 0);

            ig.globalAlpha = 0.85;
            ig.drawImage(hc, 0, 0);
            ig.globalAlpha = 1;
        }

        sketchInk = ink;
        sketchPaper = buildPaperLayer(width, height);
        maskCv = mkCanvas(W, H);
        tmpCv = mkCanvas(W, H);

        // 8. lớp màu: ảnh gốc đúng khung hình vẽ, sẽ được "tô" dần lên giấy sau khi phác chì
        colorCv = mkCanvas(W, H);
        const cg = colorCv.getContext('2d');
        cg.imageSmoothingQuality = 'high';
        cg.drawImage(photo, 0, 0, W, H);
        colorMaskCv = mkCanvas(W, H);
        colorTmpCv = mkCanvas(W, H);

        sketchReady = true;
        return true;
    }

    // Một nét chì chéo thứ i quét qua tờ giấy
    function strokeLine(i, W, H) {
        const slant = H * 0.62;
        const start = -slant - 40, end = W + 40;
        const span = (end - start) / STROKE_COUNT;
        const p = start + i * span;
        return { x1: p, y1: -20, x2: p + slant, y2: H + 20, w: span * 1.7 };
    }

    // Dải sáp màu thứ i: đường zíc-zắc ngang, chiều đi đổi luân phiên như tay người tô
    function colorBandPath(i, W, H) {
        const bandH = H / COLOR_BANDS;
        const y0 = (i + 0.5) * bandH;
        const steps = Math.max(6, Math.round(W / 34));
        const pts = [];
        for (let k = 0; k <= steps; k++) {
            pts.push({
                x: -20 + (k / steps) * (W + 40),
                y: y0 + (k % 2 ? 1 : -1) * bandH * 0.45
            });
        }
        if (i % 2) pts.reverse();
        return { pts, w: bandH * 2.1 };
    }

    // Vẽ một phần (frac) của đường, trả về điểm đầu bút đang đứng
    function drawPartialPath(ctx, band, frac) {
        const pts = band.pts, segs = pts.length - 1;
        const pos = frac * segs, full = Math.floor(pos), f = pos - full;
        ctx.lineWidth = band.w;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let k = 1; k <= full; k++) ctx.lineTo(pts[k].x, pts[k].y);
        let end = pts[Math.min(full, segs)];
        if (full < segs) {
            const a = pts[full], c = pts[full + 1];
            end = { x: a.x + (c.x - a.x) * f, y: a.y + (c.y - a.y) * f };
            ctx.lineTo(end.x, end.y);
        }
        ctx.stroke();
        return end;
    }

    // Chép lớp nguồn qua mặt nạ vào canvas tạm
    function maskInto(tmp, src, mask) {
        const tg = tmp.getContext('2d');
        tg.globalCompositeOperation = 'source-over';
        tg.clearRect(0, 0, tmp.width, tmp.height);
        tg.drawImage(src, 0, 0);
        tg.globalCompositeOperation = 'destination-in';
        tg.drawImage(mask, 0, 0);
        tg.globalCompositeOperation = 'source-over';
        return tmp;
    }

    let currentTool = 'pencil';

    function renderPencilSketch(progress) {
        artCtx.clearRect(0, 0, width, height);

        if (!sketchReady) {
            if (sketchTainted) {
                // Dự phòng: không đọc được pixel thì vẫn cho xem ảnh gốc
                const b = computeSketchBox();
                artCtx.drawImage(photo, b.x, b.y, b.w, b.h);
            }
            return;
        }

        const b = sketchBox, W = b.w, H = b.h;
        const sketchP = Math.min(1, progress / SKETCH_SPLIT);
        const colorP = progress <= SKETCH_SPLIT ? 0 : Math.min(1, (progress - SKETCH_SPLIT) / (1 - SKETCH_SPLIT));

        // giấy vẽ trải kín màn hình
        artCtx.drawImage(sketchPaper, 0, 0, width, height);

        // --- LỚP MÀU: tô dần theo từng dải sáp, chồng kiểu multiply để giữ vân giấy ---
        let colorTip = null;
        if (colorP > 0) {
            const mg = colorMaskCv.getContext('2d');
            mg.clearRect(0, 0, W, H);
            mg.strokeStyle = '#000';
            mg.lineCap = 'round';
            mg.lineJoin = 'round';
            const upto = colorP * COLOR_BANDS;
            const last = Math.ceil(upto) - 1;
            for (let i = 0; i <= last; i++) {
                const end = drawPartialPath(mg, colorBandPath(i, W, H), Math.min(1, upto - i));
                if (i === last) colorTip = end;
            }
            artCtx.save();
            artCtx.globalCompositeOperation = 'multiply';
            artCtx.globalAlpha = 0.92;
            artCtx.drawImage(colorP < 1 ? maskInto(colorTmpCv, colorCv, colorMaskCv) : colorCv, b.x, b.y);
            artCtx.restore();
        }

        // --- LỚP CHÌ: hiện dần theo từng nét chéo, luôn nằm trên lớp màu ---
        const e = sketchP < 0.5 ? 2 * sketchP * sketchP : 1 - Math.pow(-2 * sketchP + 2, 2) / 2;
        const upto = e * STROKE_COUNT;
        if (sketchP >= 1) {
            artCtx.drawImage(sketchInk, b.x, b.y);
        } else {
            const mg = maskCv.getContext('2d');
            mg.clearRect(0, 0, W, H);
            mg.strokeStyle = '#000';
            mg.lineCap = 'round';
            for (let i = 0; i < Math.ceil(upto); i++) {
                const st = strokeLine(i, W, H);
                const frac = Math.min(1, upto - i);
                mg.lineWidth = st.w;
                mg.globalAlpha = 0.55 + 0.45 * frac;
                mg.beginPath();
                mg.moveTo(st.x1, st.y1);
                mg.lineTo(st.x1 + (st.x2 - st.x1) * frac, st.y1 + (st.y2 - st.y1) * frac);
                mg.stroke();
            }
            mg.globalAlpha = 1;
            artCtx.drawImage(maskInto(tmpCv, sketchInk, maskCv), b.x, b.y);
        }

        // --- ĐẦU BÚT: bút chì khi phác, bút sáp khi tô màu ---
        let tx, ty;
        if (colorTip) {
            tx = colorTip.x;
            ty = colorTip.y;
        } else {
            const cur = strokeLine(Math.min(STROKE_COUNT - 1, Math.floor(upto)), W, H);
            const f = upto - Math.floor(upto);
            tx = cur.x1 + (cur.x2 - cur.x1) * f;
            ty = cur.y1 + (cur.y2 - cur.y1) * f;
        }
        const px = b.x + Math.max(0, Math.min(W, tx));
        const py = b.y + Math.max(0, Math.min(H, ty));
        pencilTool.style.transform = `translate(${px - 6}px, ${py - 42}px)`;

        const tool = colorP > 0 ? 'crayon' : 'pencil';
        if (tool !== currentTool) {
            pencilIcon.textContent = tool === 'crayon' ? '\u{1F58D}\uFE0F' : '\u270F\uFE0F';
            currentTool = tool;
        }
    }

    // Nạp ảnh gốc, dựng sẵn các lớp để bấm "Đồng ý" là vẽ được ngay
    photo.onload = () => { buildSketchLayers(); };
    photo.src = (typeof SKETCH_PHOTO !== 'undefined') ? SKETCH_PHOTO : 'images%20(1).jpg';

    // Đổi kích thước màn hình thì dựng lại cho vừa khung
    function scheduleSketchRebuild() {
        if (rebuildTimer) clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
            const box = computeSketchBox();
            if (sketchReady && sketchBox && box.w === sketchBox.w && box.h === sketchBox.h) {
                sketchBox = box;            // chi doi vi tri, khoi dung lai lop muc
                sketchPaper = buildPaperLayer(width, height);
            } else {
                sketchReady = false;
                buildSketchLayers();
            }
            if (!isDrawing && sketchShown) renderPencilSketch(1);
        }, 200);
    }

    // Badge tiến trình phác chì trên cùng
    function updateDrawBadge(progress) {
        if (progress < 1) {
            const title = progress < SKETCH_SPLIT ? 'Đang phác chì bức tranh...' : 'Đang tô màu...';
            if (statusTitle.textContent !== title) statusTitle.textContent = title;
        }
        const pct = Math.round(progress * 100);
        statusPercent.textContent = pct + '%';
        progressFillMini.style.width = pct + '%';
    }

    // Vòng lặp vẽ: phác chì rồi tô màu
    function startDrawing() {
        if (drawAnimFrame) cancelAnimationFrame(drawAnimFrame);
        if (!sketchReady) buildSketchLayers();   // phòng khi ảnh vừa nạp xong

        pencilTool.classList.remove('hidden');
        drawStatusBadge.classList.remove('hidden');
        statusTitle.textContent = 'Đang phác chì bức tranh...';
        updateDrawBadge(0);

        sketchShown = true;
        isDrawing = true;
        const startTime = performance.now();

        function animateStep(currentTime) {
            let elapsed = currentTime - startTime;
            let progress = Math.min(1.0, elapsed / DRAW_DURATION);

            renderPencilSketch(progress);
            updateDrawBadge(progress);

            if (progress < 1.0) {
                drawAnimFrame = requestAnimationFrame(animateStep);
            } else {
                finishDrawing();
            }
        }

        drawAnimFrame = requestAnimationFrame(animateStep);
    }

    function finishDrawing() {
        isDrawing = false;
        pencilTool.classList.add('hidden');
        statusTitle.textContent = 'Bức tranh đã tô màu xong!';
        updateDrawBadge(1);
        setTimeout(() => drawStatusBadge.classList.add('hidden'), 2200);
        playMinionSound();
        startConfetti();
    }

    // ==========================================
    // BUTTON EVENT LISTENERS
    // ==========================================

    btnStart.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        mainWrapper.classList.add('hidden');
        btnFloatingReset.classList.remove('hidden');

        startDrawing();
    });

    btnFloatingReset.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        if (drawAnimFrame) cancelAnimationFrame(drawAnimFrame);

        isDrawing = false;
        sketchShown = false;
        artCtx.clearRect(0, 0, width, height);
        drawStatusBadge.classList.add('hidden');

        mainWrapper.classList.remove('hidden');
        pencilTool.classList.add('hidden');
        btnFloatingReset.classList.add('hidden');
    });
});

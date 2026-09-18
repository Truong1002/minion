// ==========================================
// MINION 2D FULLSCREEN HAND-DRAWN CANVAS ENGINE (PERFECT SMILE & LAYER ORDER FIX)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainWrapper = document.getElementById('mainWrapper');
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const btnFloatingReset = document.getElementById('btnFloatingReset');
    const pencilTool = document.getElementById('pencilTool');

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
    const DRAW_DURATION = 10000; // 10 seconds

    // Resize Handler
    window.addEventListener('resize', () => {
        width = mainArtCanvas.width = particleCanvas.width = confettiCanvas.width = window.innerWidth;
        height = mainArtCanvas.height = particleCanvas.height = confettiCanvas.height = window.innerHeight;
        initParticles();
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
    // 10-SECOND HAND-DRAWN 2D MINION CANVAS ENGINE (PERFECT LAYER ORDER & SMILE)
    // ==========================================

    function renderHandDrawnMinion(progress) {
        artCtx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2 - 10;
        const s = Math.min(width, height) / 600;

        artCtx.save();
        artCtx.translate(cx, cy);
        artCtx.scale(s, s);
        artCtx.lineCap = 'round';
        artCtx.lineJoin = 'round';

        let currentPencilPos = { x: cx, y: cy - 200 * s };

        const toScreen = (rx, ry) => ({
            x: cx + rx * s,
            y: cy + ry * s
        });

        // ----------------------------------------------------
        // LAYER 1: Head & Upper Yellow Body (0% -> 20%)
        // ----------------------------------------------------
        if (progress > 0) {
            const p1 = Math.min(1.0, progress / 0.2);

            // Upper Yellow Body Fill
            artCtx.fillStyle = '#FFE838';
            artCtx.beginPath();
            artCtx.arc(0, -70, 95, Math.PI, 0, false); // top dome
            artCtx.lineTo(95, 30);
            artCtx.lineTo(-95, 30);
            artCtx.closePath();
            artCtx.fill();

            // Head Outlines
            artCtx.strokeStyle = '#222222';
            artCtx.lineWidth = 6;

            artCtx.beginPath();
            artCtx.arc(0, -70, 95, Math.PI, Math.PI + Math.PI * p1, false);
            artCtx.stroke();

            if (p1 >= 0.5) {
                artCtx.beginPath();
                artCtx.arc(0, -70, 95, 0, Math.PI * (p1 - 0.5) * 2, false);
                artCtx.stroke();
            }

            // Hair Tufts on Top
            artCtx.beginPath();
            artCtx.moveTo(-20, -165);
            artCtx.quadraticCurveTo(-35, -195, -45, -205);
            artCtx.moveTo(0, -168);
            artCtx.quadraticCurveTo(-5, -200, -10, -215);
            artCtx.moveTo(20, -165);
            artCtx.quadraticCurveTo(35, -195, 40, -205);
            artCtx.stroke();

            let hairAngle = Math.PI + (p1 * Math.PI);
            currentPencilPos = toScreen(95 * Math.cos(hairAngle), -70 + 95 * Math.sin(hairAngle));
        }

        // ----------------------------------------------------
        // LAYER 2: Blue Overalls, Chest Bib, Pocket & Straps (20% -> 42%)
        // (Drawn BEFORE Goggles & Smile so overalls bib doesn't cover mouth!)
        // ----------------------------------------------------
        if (progress > 0.2) {
            const p2 = Math.min(1.0, (progress - 0.2) / 0.22);

            artCtx.fillStyle = '#2365BF'; // Denim Blue
            artCtx.strokeStyle = '#222222';
            artCtx.lineWidth = 6;

            // Overalls Pants & Bib (Top of bib at y = 0, below mouth!)
            artCtx.beginPath();
            artCtx.moveTo(-95, 25);
            artCtx.lineTo(-65, 25);
            artCtx.lineTo(-65, 0); // Top of bib at y = 0
            artCtx.lineTo(65, 0);
            artCtx.lineTo(65, 25);
            artCtx.lineTo(95, 25);
            artCtx.lineTo(95, 45);
            artCtx.arc(0, 45, 95, 0, Math.PI, false); // Bottom rounded curve
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();

            // Left & Right Shoulder Straps
            artCtx.beginPath();
            artCtx.moveTo(-92, -25);
            artCtx.lineTo(-60, 20);
            artCtx.lineTo(-44, 20);
            artCtx.lineTo(-76, -25);
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();

            artCtx.beginPath();
            artCtx.moveTo(92, -25);
            artCtx.lineTo(60, 20);
            artCtx.lineTo(44, 20);
            artCtx.lineTo(76, -25);
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();

            // Black Buttons
            artCtx.fillStyle = '#222222';
            artCtx.beginPath();
            artCtx.arc(-52, 28, 6, 0, Math.PI * 2);
            artCtx.arc(52, 28, 6, 0, Math.PI * 2);
            artCtx.fill();

            // Center Pocket with Logo 'G'
            if (p2 > 0.5) {
                artCtx.fillStyle = '#164387';
                artCtx.beginPath();
                artCtx.rect(-30, 38, 60, 44);
                artCtx.fill();
                artCtx.stroke();

                artCtx.fillStyle = '#FFFFFF';
                artCtx.font = 'bold 20px Fredoka, sans-serif';
                artCtx.textAlign = 'center';
                artCtx.fillText('G', 0, 68);
            }

            currentPencilPos = toScreen(-95 + p2 * 190, 25 + Math.sin(p2 * Math.PI * 4) * 20);
        }

        // ----------------------------------------------------
        // LAYER 3: Goggles, Eyes, Pupil Shine & SMILE WITH TEETH (42% -> 65%)
        // (Drawn ON TOP of overalls so mouth is 100% visible and sharp!)
        // ----------------------------------------------------
        if (progress > 0.42) {
            const p3 = Math.min(1.0, (progress - 0.42) / 0.23);

            artCtx.strokeStyle = '#222222';
            artCtx.lineWidth = 6;

            // Goggle Strap
            artCtx.fillStyle = '#333333';
            artCtx.fillRect(-95, -95, 190, 28);
            artCtx.strokeRect(-95, -95, 190, 28);

            // Two Big Silver Goggles
            const drawGoggle = (gx) => {
                artCtx.fillStyle = '#CCCCCC';
                artCtx.beginPath();
                artCtx.arc(gx, -80, 40, 0, Math.PI * 2 * Math.min(1, p3 * 1.3));
                artCtx.fill();
                artCtx.stroke();

                if (p3 > 0.3) {
                    artCtx.fillStyle = '#FFFFFF';
                    artCtx.beginPath();
                    artCtx.arc(gx, -80, 25, 0, Math.PI * 2);
                    artCtx.fill();
                    artCtx.stroke();
                }

                if (p3 > 0.5) {
                    artCtx.fillStyle = '#4E342E';
                    artCtx.beginPath();
                    artCtx.arc(gx, -80, 11, 0, Math.PI * 2);
                    artCtx.fill();

                    artCtx.fillStyle = '#FFFFFF';
                    artCtx.beginPath();
                    artCtx.arc(gx + 3, -83, 4, 0, Math.PI * 2);
                    artCtx.fill();
                }
            };

            drawGoggle(-36);
            drawGoggle(36);

            // HAPPY CUTE MINION SMILE WITH TEETH 👄😁
            if (p3 > 0.6) {
                // Mouth cavity fill (Deep Maroon/Red)
                artCtx.fillStyle = '#85144B';
                artCtx.beginPath();
                artCtx.arc(0, -32, 26, 0.1 * Math.PI, 0.9 * Math.PI, false);
                artCtx.closePath();
                artCtx.fill();
                artCtx.stroke();

                // Top Teeth (White)
                artCtx.fillStyle = '#FFFFFF';
                artCtx.beginPath();
                artCtx.rect(-14, -30, 28, 8);
                artCtx.fill();
                artCtx.stroke();

                // Tongue (Cute Pink)
                artCtx.fillStyle = '#FF4757';
                artCtx.beginPath();
                artCtx.arc(0, -12, 12, 0.8 * Math.PI, 0.2 * Math.PI, true);
                artCtx.fill();
            }

            currentPencilPos = toScreen(36 + 40 * Math.cos(p3 * Math.PI * 2), -80 + 40 * Math.sin(p3 * Math.PI * 2));
        }

        // ----------------------------------------------------
        // LAYER 4: Pant Legs, Boots & Waving Arms (65% -> 85%)
        // ----------------------------------------------------
        if (progress > 0.65) {
            const p4 = Math.min(1.0, (progress - 0.65) / 0.20);

            // Left Pant Leg
            artCtx.fillStyle = '#1E51A4';
            artCtx.fillRect(-52, 125, 36, 26);
            artCtx.strokeRect(-52, 125, 36, 26);

            // Left Black Boot
            artCtx.fillStyle = '#222222';
            artCtx.beginPath();
            artCtx.moveTo(-56, 151);
            artCtx.lineTo(-14, 151);
            artCtx.lineTo(-14, 168);
            artCtx.arcTo(-60, 168, -60, 151, 10);
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();

            // Right Pant Leg
            artCtx.fillStyle = '#1E51A4';
            artCtx.fillRect(16, 125, 36, 26);
            artCtx.strokeRect(16, 125, 36, 26);

            // Right Black Boot
            artCtx.fillStyle = '#222222';
            artCtx.beginPath();
            artCtx.moveTo(14, 151);
            artCtx.lineTo(56, 151);
            artCtx.arcTo(60, 151, 60, 168, 10);
            artCtx.lineTo(14, 168);
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();

            // Left Arm (Hanging at side)
            artCtx.fillStyle = '#FFE838';
            artCtx.beginPath();
            artCtx.rect(-104, 10, 22, 65);
            artCtx.fill();
            artCtx.stroke();

            // Left Glove
            artCtx.fillStyle = '#222222';
            artCtx.beginPath();
            artCtx.arc(-93, 80, 15, 0, Math.PI * 2);
            artCtx.fill();

            // RIGHT ARM WAVING HELLO! 🖐️
            artCtx.fillStyle = '#FFE838';
            artCtx.beginPath();
            artCtx.moveTo(85, 15);
            artCtx.quadraticCurveTo(135, -20, 145, -55);
            artCtx.lineTo(162, -45);
            artCtx.quadraticCurveTo(148, -10, 100, 30);
            artCtx.closePath();
            artCtx.fill();
            artCtx.stroke();

            // Right Waving 3-Finger Glove
            artCtx.fillStyle = '#222222';
            artCtx.beginPath();
            artCtx.arc(155, -52, 16, 0, Math.PI * 2);
            artCtx.fill();

            // Fingers
            artCtx.beginPath();
            artCtx.arc(146, -68, 7, 0, Math.PI * 2);
            artCtx.arc(162, -71, 7, 0, Math.PI * 2);
            artCtx.arc(174, -61, 7, 0, Math.PI * 2);
            artCtx.fill();

            currentPencilPos = toScreen(-52 + p4 * 110, 151 + Math.sin(p4 * Math.PI * 4) * 20);
        }

        // ----------------------------------------------------
        // LAYER 5: Eye Shine & Highlights (85% -> 100%)
        // ----------------------------------------------------
        if (progress > 0.85) {
            const p5 = Math.min(1.0, (progress - 0.85) / 0.15);

            artCtx.fillStyle = '#FFFFFF';
            artCtx.beginPath();
            artCtx.arc(-42, -115, 5, 0, Math.PI * 2);
            artCtx.arc(42, -115, 5, 0, Math.PI * 2);
            artCtx.fill();

            currentPencilPos = toScreen(Math.sin(p5 * Math.PI * 8) * 80, Math.cos(p5 * Math.PI * 8) * 80);
        }

        artCtx.restore();

        // Update Pencil Tip Position
        pencilTool.style.transform = `translate(${currentPencilPos.x - 6}px, ${currentPencilPos.y - 42}px)`;
    }

    // Start 10s Animation Loop
    function start10SecondPencilDrawing() {
        if (drawAnimFrame) cancelAnimationFrame(drawAnimFrame);
        pencilTool.classList.remove('hidden');

        isDrawing = true;
        const startTime = performance.now();

        function animateStep(currentTime) {
            let elapsed = currentTime - startTime;
            let progress = Math.min(1.0, elapsed / DRAW_DURATION);

            renderHandDrawnMinion(progress);

            if (progress < 1.0) {
                drawAnimFrame = requestAnimationFrame(animateStep);
            } else {
                finishHandDrawnMinion();
            }
        }

        drawAnimFrame = requestAnimationFrame(animateStep);
    }

    function finishHandDrawnMinion() {
        isDrawing = false;
        pencilTool.classList.add('hidden');
        playMinionSound();
        startConfetti();
    }

    // ==========================================
    // BUTTON EVENT LISTENERS
    // ==========================================

    btnYes.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        mainWrapper.classList.add('hidden');
        btnFloatingReset.classList.remove('hidden');

        start10SecondPencilDrawing();
    });

    let noCount = 0;
    const noTexts = ["Không nha 😜", "Chắc chưa? 🥺", "Suy nghĩ lại đi mà! 🍌", "Nút này hỏng rồi 💥", "Đồng ý đi năn nỉ đó ❤️"];

    function moveNoBtn(e) {
        if (e) e.stopPropagation();
        noCount++;
        const maxOffset = 130;
        const rx = (Math.random() - 0.5) * maxOffset;
        const ry = (Math.random() - 0.5) * maxOffset;
        btnNo.style.transform = `translate(${rx}px, ${ry}px)`;
        btnNo.textContent = noTexts[noCount % noTexts.length];
    }

    btnNo.addEventListener('mouseenter', moveNoBtn);
    btnNo.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        if (noCount >= 4) {
            btnNo.textContent = "Đồng ý luôn! 🥰";
            btnNo.style.background = "#FFE838";
            btnNo.style.color = "#164387";
            btnNo.onclick = () => btnYes.click();
        } else {
            moveNoBtn(e);
        }
    });

    btnFloatingReset.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        if (drawAnimFrame) cancelAnimationFrame(drawAnimFrame);

        isDrawing = false;
        artCtx.clearRect(0, 0, width, height);

        noCount = 0;
        btnNo.style.transform = 'none';
        btnNo.textContent = noTexts[0];
        btnNo.onclick = null;
        btnNo.style.background = 'rgba(255, 255, 255, 0.15)';
        btnNo.style.color = '#f8fafc';

        mainWrapper.classList.remove('hidden');
        pencilTool.classList.add('hidden');
        btnFloatingReset.classList.add('hidden');
    });
});

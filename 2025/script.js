/**
 * FLOWER & CONFETTI ANIMATION ENGINE
 */
const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// --- EMOJI LIST ---
// Lavender, Sunflower, Cherry Blossom
const flowerTypes = ['🪻', '🌻', '🌸'];

// Resize Canvas to fit screen
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Particle Class
class Particle {
    constructor(x, y, isExplosion = false) {
        this.x = x || Math.random() * width;
        this.y = y || -20; // Start just above screen
        this.size = Math.random() * 20 + 15; // Size between 15px and 35px
        this.speedY = Math.random() * 2 + 1; // Fall speed
        this.speedX = Math.random() * 2 - 1; // Horizontal drift
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        
        // If created by button click (explosion)
        if (isExplosion) {
            this.speedY = Math.random() * 10 - 5; // Go up or down
            this.speedX = Math.random() * 10 - 5; // Go left or right
            this.gravity = 0.2; // Pull back down
        } else {
            this.gravity = 0;
        }
        this.isExplosion = isExplosion;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.isExplosion) {
            this.speedY += this.gravity;
        }

        // Reset if off screen (bottom)
        if (this.y > height + 50) {
            if (this.isExplosion) {
                this.active = false; // Remove explosion particles
            } else {
                // Reset raining particles to top
                this.y = -50;
                this.x = Math.random() * width;
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Add a slight shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 5;
        ctx.fillText(this.type, 0, 0);
        ctx.restore();
    }
}

// Initialize Background Rain
function initParticles() {
    // Create 30 floating particles initially
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Filter out inactive particles (from explosions)
    particles = particles.filter(p => p.active !== false);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

// --- INTERACTION LOGIC ---
const btn = document.getElementById('wishBtn');
const messageArea = document.getElementById('messageArea');

// Function to create an explosion of flowers
function createExplosion(x, y) {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y, true));
    }
}

btn.addEventListener('click', (e) => {
    // 1. Reveal Message
    messageArea.style.display = 'block';
    btn.textContent = "Enjoy your day! 🎉";
    
    // 2. Trigger Explosion at button center
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    createExplosion(centerX, centerY);

    // 3. Intensify the rain for a few seconds
    let intenseInterval = setInterval(() => {
        particles.push(new Particle(Math.random() * width, -50));
    }, 100);

    // Stop intensifying after 2 seconds
    setTimeout(() => clearInterval(intenseInterval), 2000);
});

// Start the engine
initParticles();
animate();

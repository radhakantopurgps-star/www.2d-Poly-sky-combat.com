// --- CANVAS & GAME SETUP ---
const container = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- DOM ELEMENTS CACHING ---
const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');
const distEl = document.getElementById('distance');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const highScoreEl = document.getElementById('high-score');
const highDistEl = document.getElementById('high-distance');

// --- STATE & INPUTS ---
let score = 0, health = 100, distance = 0, gameOver = false, gameStarted = false;
let killedEnemiesCount = 0; 
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, ' ': false };
let joystickVector = { x: 0, y: 0 };
let isFiring = false;
let lastShotTime = 0;

// Delta Time Frame Scaling
let lastFrameTime = performance.now();

// --- HIGH SCORE & HIGH DISTANCE SYSTEM ---
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let highDistance = localStorage.getItem('highDistance') ? parseInt(localStorage.getItem('highDistance')) : 0;

// --- POWER-UPS & SHIELD SYSTEM ---
let powerUps = [];
let isShieldActive = false; 

// --- BOSS FIGHT & ENDLESS SYSTEM VARIABLES ---
let boss = null;
let nextBossDistance = 1000;
let bossCount = 0;
let currentEnemyThemeIndex = 0; 

let enemyBullets = [];
let homingOrbs = []; 
let bullets = [];
let enemies = [];
let polyMountains = [];

// Shared color themes cycling on boss defeat
const sharedColorThemes = [
    { primary: '#ff2a6d', secondary: '#aa1144', core: '#00fff0' },
    { primary: '#0000ff', secondary: '#000099', core: '#00ffff' },
    { primary: '#00ff00', secondary: '#009900', core: '#ffff00' },
    { primary: '#800080', secondary: '#4d004d', core: '#ff00ee' },
    { primary: '#ffa500', secondary: '#b37400', core: '#00fff0' },
    { primary: '#ffff00', secondary: '#b3b300', core: '#ff0055' },
    { primary: '#ff66b2', secondary: '#990066', core: '#ffffff' },
    { primary: '#00ffff', secondary: '#008888', core: '#ffaa00' }
];

// --- ULTRA-SMOOTH PLAYER PHYSICS STATE ---
const player = {
    x: width / 2,
    y: height - 120,
    vx: 0,
    vy: 0,
    maxSpeed: 2.0,       
    acceleration: 0.22,  
    friction: 0.88,      
    tilt: 0,
    targetTilt: 0
};

// --- STYLISH BOSS NOTIFICATION BOX SYSTEM ---
let bossAlertEl = null;

function createBossAlertElement() {
    if (!bossAlertEl) {
        bossAlertEl = document.createElement('div');
        bossAlertEl.id = 'boss-alert-box';
        document.body.appendChild(bossAlertEl);

        Object.assign(bossAlertEl.style, {
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-20px) scale(0.8)',
            padding: '12px 28px',
            background: 'rgba(13, 14, 21, 0.85)',
            border: '2px solid #00fff0',
            borderRadius: '8px',
            boxShadow: '0 0 15px rgba(0, 255, 240, 0.5), inset 0 0 10px rgba(0, 255, 240, 0.3)',
            color: '#00fff0',
            fontFamily: "'Courier New', Courier, monospace, sans-serif",
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textAlign: 'center',
            zIndex: '999',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.27)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        });
    }
}

function showBossDistanceNotification(targetDistance) {
    createBossAlertElement();

    bossAlertEl.innerHTML = `<span style="color: #ff2a6d;">⚠️</span> NEXT BOSS: <span style="color: #ffffff;">${targetDistance}m</span>`;

    setTimeout(() => {
        bossAlertEl.style.opacity = '1';
        bossAlertEl.style.transform = 'translateX(-50%) translateY(0px) scale(1)';
    }, 50);

    setTimeout(() => {
        if (bossAlertEl) {
            bossAlertEl.style.opacity = '0';
            bossAlertEl.style.transform = 'translateX(-50%) translateY(-20px) scale(0.8)';
        }
    }, 2200);
}

// --- COUNTDOWN ANIMATION SYSTEM ---
let isCountingDown = false;

function startCountdownSequence(onComplete) {
    isCountingDown = true;
    gameStarted = false;

    let countdownEl = document.getElementById('countdown');
    
    if (!countdownEl) {
        countdownEl = document.createElement('div');
        countdownEl.id = 'countdown';
        document.body.appendChild(countdownEl);
    }

    countdownEl.style.position = 'absolute';
    countdownEl.style.top = '50%';
    countdownEl.style.left = '50%';
    countdownEl.style.transform = 'translate(-50%, -50%) scale(1)';
    countdownEl.style.fontSize = '90px';
    countdownEl.style.fontWeight = '900';
    countdownEl.style.color = '#00fff0';
    countdownEl.style.textShadow = '0 0 25px #00fff0, 0 0 50px #00fff0';
    countdownEl.style.zIndex = '1000';
    countdownEl.style.pointerEvents = 'none';
    countdownEl.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.27), opacity 0.3s ease-out';
    countdownEl.style.display = 'block';

    const sequence = ['3', '2', '1', 'Go!'];
    let index = 0;

    function showNext() {
        if (index < sequence.length) {
            countdownEl.innerText = sequence[index];
            countdownEl.style.opacity = '1';
            countdownEl.style.transform = 'translate(-50%, -50%) scale(1.4)';

            setTimeout(() => {
                countdownEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
                countdownEl.style.opacity = '0.2';
            }, 400);

            index++;
            setTimeout(showNext, 800);
        } else {
            countdownEl.style.display = 'none';
            isCountingDown = false;
            gameStarted = true;

            setTimeout(() => {
                showBossDistanceNotification(nextBossDistance);
            }, 1000);

            if (onComplete) onComplete();
        }
    }

    showNext();
}

// --- HIGH-TECH JOYSTICK BUILDER ---
let base = document.getElementById('joystick-base');
let thumb = document.getElementById('joystick-thumb');

function initProfessionalJoystickUI() {
    if (!base) {
        base = document.createElement('div');
        base.id = 'joystick-base';
        document.body.appendChild(base);
    }
    
    Object.assign(base.style, {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        width: '110px',
        height: '110px',
        background: 'radial-gradient(circle, rgba(0, 255, 240, 0.15) 0%, rgba(13, 14, 21, 0.85) 80%)',
        border: '2px solid #00fff0',
        borderRadius: '50%',
        boxShadow: '0 0 20px rgba(0, 255, 240, 0.4), inset 0 0 12px rgba(0, 255, 240, 0.2)',
        backdropFilter: 'blur(8px)',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: '990',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    if (!thumb) {
        thumb = document.createElement('div');
        thumb.id = 'joystick-thumb';
        base.appendChild(thumb);
    }

    Object.assign(thumb.style, {
        width: '45px',
        height: '45px',
        background: 'radial-gradient(circle, #00fff0 0%, #0088aa 100%)',
        borderRadius: '50%',
        boxShadow: '0 0 15px #00fff0, inset 0 0 8px #ffffff',
        border: '2px solid #ffffff',
        pointerEvents: 'none',
        transition: 'transform 0.03s ease-out, box-shadow 0.2s ease',
        transform: 'translate(0px, 0px)'
    });
}

initProfessionalJoystickUI();

let joystickActive = false;
let joystickPointerId = null;
let joystickCenter = { x: 0, y: 0 };
const maxRadius = 38;

if (base) {
    base.addEventListener('pointerdown', (e) => {
        joystickActive = true;
        joystickPointerId = e.pointerId;
        try { base.setPointerCapture(e.pointerId); } catch(err) {}

        const rect = base.getBoundingClientRect();
        joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        
        base.style.borderColor = '#00fff0';
        base.style.boxShadow = '0 0 30px rgba(0, 255, 240, 0.6), inset 0 0 15px rgba(0, 255, 240, 0.3)';

        updateJoystick(e);
    });

    window.addEventListener('pointermove', (e) => {
        if (joystickActive && e.pointerId === joystickPointerId) {
            updateJoystick(e);
        }
    });

    const handleJoystickRelease = (e) => {
        if (joystickActive && e.pointerId === joystickPointerId) {
            joystickActive = false;
            joystickPointerId = null;
            joystickVector = { x: 0, y: 0 };
            
            if (thumb) thumb.style.transform = `translate(0px, 0px)`;
            
            base.style.borderColor = '#00fff0';
            base.style.boxShadow = '0 0 20px rgba(0, 255, 240, 0.4), inset 0 0 12px rgba(0, 255, 240, 0.2)';

            try { base.releasePointerCapture(e.pointerId); } catch(err) {}
        }
    };

    window.addEventListener('pointerup', handleJoystickRelease);
    window.addEventListener('pointercancel', handleJoystickRelease);
}

function updateJoystick(e) {
    const dx = e.clientX - joystickCenter.x;
    const dy = e.clientY - joystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, maxRadius);
    const moveX = Math.cos(angle) * clampedDist;
    const moveY = Math.sin(angle) * clampedDist;

    if (thumb) thumb.style.transform = `translate(${moveX}px, ${moveY}px)`;
    joystickVector = { x: moveX / maxRadius, y: moveY / maxRadius };
}

// --- FIRE BUTTON SYSTEM ---
const fireBtn = document.getElementById('fire-btn');
if (fireBtn) {
    let firePointerId = null;
    fireBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        isFiring = true;
        firePointerId = e.pointerId;
        try { fireBtn.setPointerCapture(e.pointerId); } catch(err) {}
    });

    const handleFireRelease = (e) => {
        if (e.pointerId === firePointerId) {
            isFiring = false;
            firePointerId = null;
            try { fireBtn.releasePointerCapture(e.pointerId); } catch(err) {}
        }
    };

    fireBtn.addEventListener('pointerup', handleFireRelease);
    fireBtn.addEventListener('pointercancel', handleFireRelease);
}

// Keyboard Listeners
window.addEventListener('keydown', e => { if (e.key in keys) keys[e.key] = true; });
window.addEventListener('keyup', e => { if (e.key in keys) keys[e.key] = false; });

const restartBtn = document.getElementById('restart-btn');
if (restartBtn) restartBtn.addEventListener('click', resetGame);

// --- 2D LOW-POLY BACKGROUND ---
function initMountains() {
    polyMountains = [];
    for (let i = 0; i < 8; i++) spawnMountain((i * 120) - 100);
}

function spawnMountain(yPos) {
    const peakX = Math.random() * width;
    const size = 100 + Math.random() * 150;
    polyMountains.push({
        y: yPos,
        speed: 1.5,
        peakX: peakX,
        size: size
    });
}

function getCurrentTheme() {
    const index = currentEnemyThemeIndex % sharedColorThemes.length;
    return sharedColorThemes[index];
}

// --- Enemy Spawning ---
function spawnEnemy() {
    const theme = getCurrentTheme();
    
    const enemySpeed = Math.min(5.0, 2.0 + Math.random() * 1.0 + (distance * 0.0005));
    const bulletSpeed = Math.min(10, 6 + (distance * 0.001));
    const shootCooldown = Math.max(300, 1000 - (distance * 0.2));

    enemies.push({
        x: Math.random() * (width - 80) + 40,
        y: -40,
        speed: enemySpeed,
        bulletSpeed: bulletSpeed,
        shootCooldown: shootCooldown,
        lastShot: Date.now() - 900,
        theme: theme
    });
}

// --- POWER-UP SPAWNER ---
function spawnPowerUp(x, y) {
    const rand = Math.random();
    let type = rand < 0.5 ? 'health' : 'shield';

    powerUps.push({
        x: x,
        y: y,
        type: type,
        speed: 2,
        radius: 14
    });
}

// --- ENDLESS BOSS LOGIC ---
function spawnBoss() {
    const currentTheme = getCurrentTheme();
    const baseHealth = 1500 * Math.pow(2, bossCount); 

    boss = {
        x: width / 2,
        y: -120,
        targetY: 100,
        width: 140,
        height: 100,
        health: baseHealth,
        maxHealth: baseHealth,
        dirX: 1,
        speed: Math.min(4.5, 2.0 + (bossCount * 0.2)),
        lastAttackTime: Date.now(),
        attackCooldown: Math.max(600, 1500 - (bossCount * 50)),
        attackMode: 0,
        isChargingBeam: false,
        beamActive: false,
        beamChargeStartTime: 0,
        theme: currentTheme,
        maxOrbAttacks: Math.min(8, 3 + Math.floor(bossCount / 2)), 
        orbAttackCount: 0 
    };
}

function handleBossAttacks(now) {
    if (!boss || boss.y < boss.targetY) return;

    if (boss.isChargingBeam) {
        let chargeTime = now - boss.beamChargeStartTime;
        if (chargeTime > 1200 && !boss.beamActive) { 
            boss.beamActive = true;
        }
        if (chargeTime > 2600) { 
            boss.isChargingBeam = false;
            boss.beamActive = false;
            boss.lastAttackTime = now;
        }
        return;
    }

    const cooldown = boss.attackCooldown || 1500;
    if (now - boss.lastAttackTime > cooldown) {
        const rand = Math.random();
        
        if (rand < 0.7) {
            boss.attackMode = 0;
            const bSpeed = Math.min(9, 5.5 + (bossCount * 0.3));
            
            enemyBullets.push({ x: boss.x - 50, y: boss.y + 40, speed: bSpeed, color: boss.theme.primary });
            enemyBullets.push({ x: boss.x - 30, y: boss.y + 45, speed: bSpeed + 0.3, color: boss.theme.primary });
            enemyBullets.push({ x: boss.x - 10, y: boss.y + 50, speed: bSpeed + 0.6, color: boss.theme.primary });
            enemyBullets.push({ x: boss.x + 10, y: boss.y + 50, speed: bSpeed + 0.6, color: boss.theme.primary });
            enemyBullets.push({ x: boss.x + 30, y: boss.y + 45, speed: bSpeed + 0.3, color: boss.theme.primary });
            enemyBullets.push({ x: boss.x + 50, y: boss.y + 40, speed: bSpeed, color: boss.theme.primary });
            
            boss.lastAttackTime = now;
        } 
        else if (rand < 0.85) {
            boss.attackMode = 1;
            boss.isChargingBeam = true;
            boss.beamChargeStartTime = now;
        } 
        else {
            if (boss.orbAttackCount < boss.maxOrbAttacks) {
                boss.attackMode = 2;
                homingOrbs.push({
                    x: boss.x,
                    y: boss.y + 30,
                    radius: 12,
                    speed: Math.min(5.5, 3.0 + (bossCount * 0.2)),
                    color: boss.theme.core
                });
                boss.orbAttackCount++;
            } else {
                enemyBullets.push({ x: boss.x - 20, y: boss.y + 40, speed: 6, color: boss.theme.primary });
                enemyBullets.push({ x: boss.x + 20, y: boss.y + 40, speed: 6, color: boss.theme.primary });
            }
            boss.lastAttackTime = now;
        }
    }
}

// --- PLAYER SHOOTING ---
function shootLaser() {
    bullets.push({ x: player.x - 15, y: player.y - 10, speed: 26 });
    bullets.push({ x: player.x + 15, y: player.y - 10, speed: 26 });
}

function enemyShootLaser(enemy) {
    const speed = enemy.bulletSpeed || 6;
    enemyBullets.push({ x: enemy.x, y: enemy.y + 15, speed: speed, color: enemy.theme.primary });
}

// --- GAME LOOP UPDATE ---
function update(dt) {
    if (gameOver || !gameStarted) return;

    if (boss) {
        if (distEl) {
            distEl.innerText = Math.floor(distance) + 'm';
            distEl.style.color = '#ff2a6d'; 
        }
    } else {
        distance += 0.2 * dt;
        if (distEl) {
            distEl.innerText = Math.floor(distance) + 'm';
            distEl.style.color = '#00fff0'; 
        }
    }

    if (distance >= nextBossDistance && !boss) {
        spawnBoss();
        enemies = [];
    }

    // --- ULTRA-SMOOTH PLAYER MOVEMENT PHYSICS ---
    let inputX = joystickVector.x;
    let inputY = joystickVector.y;

    if (keys.a || keys.ArrowLeft) inputX = -1;
    if (keys.d || keys.ArrowRight) inputX = 1;
    if (keys.w || keys.ArrowUp) inputY = -1;
    if (keys.s || keys.ArrowDown) inputY = 1;

    if (inputX !== 0 && inputY !== 0) {
        const len = Math.hypot(inputX, inputY);
        inputX /= len;
        inputY /= len;
    }

    const targetVx = inputX * player.maxSpeed;
    const targetVy = inputY * player.maxSpeed;

    const safeDt = Math.min(dt, 2.0);
    player.vx += (targetVx - player.vx) * player.acceleration * safeDt;
    player.vy += (targetVy - player.vy) * player.acceleration * safeDt;

    player.x += player.vx * safeDt * 3.5;
    player.y += player.vy * safeDt * 3.5;

    player.x = Math.max(30, Math.min(width - 30, player.x));
    player.y = Math.max(50, Math.min(height - 50, player.y));

    player.targetTilt = player.vx * 0.04;
    player.tilt += (player.targetTilt - player.tilt) * 0.15 * safeDt;

    const now = Date.now();
    if ((isFiring || keys[' ']) && now - lastShotTime > 120) {
        shootLaser();
        lastShotTime = now;
    }

    // --- OPTIMIZED BULLETS REMOVAL ---
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed * dt;
        if (bullets[i].y < -20) bullets.splice(i, 1);
    }

    // Power-Ups
    for (let pIdx = powerUps.length - 1; pIdx >= 0; pIdx--) {
        const p = powerUps[pIdx];
        p.y += p.speed * dt;

        if (Math.hypot(player.x - p.x, player.y - p.y) < 30) {
            if (p.type === 'health') {
                health = Math.min(100, health + (Math.random() < 0.3 ? 20 : 10));
                if (healthEl) healthEl.innerText = Math.floor(health);
            } else if (p.type === 'shield') {
                isShieldActive = true; 
            }
            powerUps.splice(pIdx, 1);
            continue;
        }

        if (p.y > height + 30) powerUps.splice(pIdx, 1);
    }

    // --- OPTIMIZED ENEMY BULLETS REMOVAL ---
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.y += eb.speed * dt; 

        if (Math.hypot(eb.x - player.x, eb.y - player.y) < 22) {
            enemyBullets.splice(i, 1);
            if (isShieldActive) {
                isShieldActive = false; 
            } else {
                health -= 10;
                if (healthEl) healthEl.innerText = Math.max(0, Math.floor(health));
                if (health <= 0) triggerGameOver();
            }
            continue;
        }

        if (eb.y > height + 50 || eb.y < -50 || eb.x < -50 || eb.x > width + 50) {
            enemyBullets.splice(i, 1);
        }
    }

    // --- OPTIMIZED HOMING ORBS REMOVAL ---
    for (let oIdx = homingOrbs.length - 1; oIdx >= 0; oIdx--) {
        const orb = homingOrbs[oIdx];
        const angle = Math.atan2(player.y - orb.y, player.x - orb.x);
        orb.x += Math.cos(angle) * orb.speed * dt;
        orb.y += Math.sin(angle) * orb.speed * dt;

        if (Math.hypot(orb.x - player.x, orb.y - player.y) < orb.radius + 15) {
            homingOrbs.splice(oIdx, 1);
            if (isShieldActive) {
                isShieldActive = false;
            } else {
                health -= 10;
                if (healthEl) healthEl.innerText = Math.max(0, Math.floor(health));
                if (health <= 0) triggerGameOver();
            }
            continue;
        }

        if (orb.y > height + 50 || orb.y < -50 || orb.x < -50 || orb.x > width + 50) {
            homingOrbs.splice(oIdx, 1);
        }
    }

    // Background Scroll
    for (let idx = polyMountains.length - 1; idx >= 0; idx--) {
        const m = polyMountains[idx];
        m.y += m.speed * dt;

        if (m.y > height + 200) {
            polyMountains.splice(idx, 1);
            spawnMountain(-200);
        }
    }

    // Boss Fight
    if (boss) {
        if (boss.y < boss.targetY) boss.y += 2 * dt;

        let currentSpeed = boss.isChargingBeam ? boss.speed * 0.3 : boss.speed;
        boss.x += currentSpeed * boss.dirX * dt;
        if (boss.x > width - 80 || boss.x < 80) boss.dirX *= -1;

        handleBossAttacks(now);

        if (boss.beamActive) {
            if (Math.abs(player.x - boss.x) < 40 && player.y > boss.y) {
                if (isShieldActive) {
                    isShieldActive = false; 
                } else {
                    health -= 0.8 * dt;
                    if (healthEl) healthEl.innerText = Math.max(0, Math.floor(health));
                    if (health <= 0) triggerGameOver();
                }
            }
        }

        for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = bullets[bIdx];
            if (Math.abs(b.x - boss.x) < boss.width / 2 && Math.abs(b.y - boss.y) < boss.height / 2 + 20) {
                bullets.splice(bIdx, 1);
                boss.health -= 10;

                if (boss.health <= 0) {
                    spawnPowerUp(boss.x, boss.y);
                    bossCount++; 
                    boss = null; 
                    currentEnemyThemeIndex++;
                    homingOrbs = []; 
                    enemyBullets = [];
                    score += 1000 + (bossCount * 200);
                    nextBossDistance += 1000;

                    if (scoreEl) scoreEl.innerText = score;
                    if (healthEl) healthEl.innerText = Math.floor(health);

                    setTimeout(() => {
                        showBossDistanceNotification(nextBossDistance);
                    }, 1500);

                    break;
                }
            }
        }
    } else {
        const maxEnemiesOnScreen = Math.min(8, 3 + Math.floor(distance / 700));
        const spawnChance = Math.min(0.05, 0.02 + (distance * 0.00003));
        
        if (Math.random() < spawnChance && enemies.length < maxEnemiesOnScreen) {
            spawnEnemy();
        }
    }

    // Enemies
    for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
        const e = enemies[eIdx];
        e.y += e.speed * dt;

        const cooldown = e.shootCooldown || 1000;
        if (e.y > 0 && e.y < player.y - 30 && (now - e.lastShot > cooldown)) {
            enemyShootLaser(e);
            e.lastShot = now;
        }

        for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = bullets[bIdx];
            if (Math.hypot(b.x - e.x, b.y - e.y) < 25) {
                killedEnemiesCount++;
                if (killedEnemiesCount % 10 === 0) spawnPowerUp(e.x, e.y);

                enemies.splice(eIdx, 1);
                bullets.splice(bIdx, 1);
                score += 100;
                if (scoreEl) scoreEl.innerText = score;
                break;
            }
        }

        if (e && Math.hypot(player.x - e.x, player.y - e.y) < 30) {
            enemies.splice(eIdx, 1);
            if (isShieldActive) {
                isShieldActive = false; 
            } else {
                health -= 25;
                if (healthEl) healthEl.innerText = Math.max(0, Math.floor(health));
                if (health <= 0) triggerGameOver();
            }
        }

        if (e && e.y > height + 50) enemies.splice(eIdx, 1);
    }
}

// --- RENDER GRAPHICS ---
function draw(time) {
    const dt = Math.min((time - lastFrameTime) / 16.66, 2.0) || 1.0;
    lastFrameTime = time;

    update(dt);

    ctx.fillStyle = '#0d0e15';
    ctx.fillRect(0, 0, width, height);

    // 1. Background Mountains
    polyMountains.forEach(m => {
        const peakX = m.peakX;
        const size = m.size;
        const yPos = m.y;

        ctx.fillStyle = '#181b2b';
        ctx.beginPath();
        ctx.moveTo(peakX, yPos);
        ctx.lineTo(peakX - size, yPos + size);
        ctx.lineTo(peakX, yPos + size);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#22263d';
        ctx.beginPath();
        ctx.moveTo(peakX, yPos);
        ctx.lineTo(peakX, yPos + size);
        ctx.lineTo(peakX + size, yPos + size);
        ctx.closePath();
        ctx.fill();
    });

    // 2. Player Lasers
    ctx.fillStyle = '#00fff0';
    bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 10, 4, 16));

    // 3. Enemy Lasers
    enemyBullets.forEach(eb => {
        ctx.fillStyle = eb.color || '#ff2a6d';
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Homing Orbs
    homingOrbs.forEach(orb => {
        ctx.save();
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // 4. Power-Ups
    powerUps.forEach(p => {
        ctx.save();
        if (p.type === 'health') {
            ctx.fillStyle = '#ff0055';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('HP', p.x, p.y + 4);
        } else if (p.type === 'shield') {
            ctx.fillStyle = '#00fff0';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0d0e15';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛡️', p.x, p.y + 4);
        }
        ctx.restore();
    });

    // 5. Draw Player Jet
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.tilt);
    drawPoly([[0, -25], [-12, 10], [0, 5]], '#00fff0');
    drawPoly([[0, -25], [0, 5], [12, 10]], '#00d5e6');
    drawPoly([[0, -5], [-25, 15], [0, 10]], '#111322');
    drawPoly([[0, -5], [25, 15], [0, 10]], '#1a1d36');
    drawPoly([[0, -15], [-4, -5], [0, 0]], '#ff2a6d');
    drawPoly([[0, -15], [0, 0], [4, -5]], '#d51b53');

    if (isShieldActive) {
        ctx.strokeStyle = '#00fff0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();

    // 6. Draw Regular Enemies
    enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);
        drawPoly([[0, 20], [-18, -15], [0, -5]], e.theme.primary);
        drawPoly([[0, 20], [0, -5], [18, -15]], e.theme.secondary);
        drawPoly([[0, 0], [-12, -20], [12, -20]], '#000000');
        ctx.restore();
    });

    // 7. DRAW BOSS FIGHT & BEAMS
    if (boss) {
        const theme = boss.theme;

        if (boss.isChargingBeam) {
            ctx.save();
            if (boss.beamActive) {
                ctx.fillStyle = theme.primary;
                ctx.fillRect(boss.x - 25, boss.y + 20, 50, height - boss.y);
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(boss.x - 10, boss.y + 20, 20, height - boss.y);
            } else {
                ctx.strokeStyle = theme.primary;
                ctx.lineWidth = 4;
                ctx.setLineDash([10, 10]);
                ctx.beginPath();
                ctx.moveTo(boss.x, boss.y + 20);
                ctx.lineTo(boss.x, height);
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.save();
        ctx.translate(boss.x, boss.y);

        drawPoly([[0, 50], [-65, -35], [0, -15]], theme.primary);
        drawPoly([[0, 50], [0, -15], [65, -35]], theme.secondary);
        drawPoly([[0, -40], [-30, 15], [30, 15]], '#181b2b');
        drawPoly([[0, -25], [-10, 5], [10, 5]], boss.isChargingBeam ? theme.primary : theme.core);

        ctx.restore();

        // Boss Health UI
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(width / 2 - 100, 20, 200, 16);
        ctx.strokeStyle = theme.primary;
        ctx.strokeRect(width / 2 - 100, 20, 200, 16);

        const healthPct = Math.max(0, boss.health / boss.maxHealth);
        ctx.fillStyle = theme.primary;
        ctx.fillRect(width / 2 - 100, 20, 200 * healthPct, 16);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`WARNING: MEGA BOSS ${bossCount + 1}`, width / 2, 14);
    }

    requestAnimationFrame(draw);
}

function drawPoly(points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
}

// --- GAME OVER LOGIC ---
function triggerGameOver() {
    gameOver = true;
    gameStarted = false;
    isShieldActive = false;

    const currentDist = Math.floor(distance);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    if (currentDist > highDistance) {
        highDistance = currentDist;
        localStorage.setItem('highDistance', highDistance);
    }

    if (finalScoreEl) finalScoreEl.innerText = score;
    if (highScoreEl) highScoreEl.innerText = highScore;
    if (highDistEl) highDistEl.innerText = highDistance;

    if (gameOverEl) gameOverEl.style.display = 'block';
}

function resetGame() {
    score = 0;
    health = 100;
    distance = 0;
    nextBossDistance = 1000;
    bossCount = 0;
    currentEnemyThemeIndex = 0;
    killedEnemiesCount = 0; 
    boss = null;
    gameOver = false;
    enemies = [];
    bullets = [];
    enemyBullets = [];
    homingOrbs = []; 
    powerUps = [];
    isShieldActive = false;
    player.x = width / 2;
    player.y = height - 120;
    player.vx = 0;
    player.vy = 0;
    player.tilt = 0;

    if (scoreEl) scoreEl.innerText = '0';
    if (healthEl) healthEl.innerText = '100';
    if (gameOverEl) gameOverEl.style.display = 'none';

    initMountains();
    startCountdownSequence();
}

// Start Game Loop
initMountains();
startCountdownSequence();
requestAnimationFrame(draw);

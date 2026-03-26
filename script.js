const gameEl   = document.getElementById("game");
const playerEl = document.getElementById("player");
const cheeseEl = document.getElementById("cheese");

// Game state
let score, lives, time, level;
let px, py, speed;
let cats, keys, gameRunning, timerInterval;

// Input
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});
document.addEventListener("keyup", e => { keys[e.key] = false; });

// ── Start ──────────────────────────────────────────────
function startGame() {
  // Reset state
  score = 0; lives = 3; time = 60; level = 1; speed = 3;
  px = 100;  py = 100;
  cats = [];  keys = {};
  gameRunning = true;

  // Remove leftover cats from previous game
  document.querySelectorAll(".cat").forEach(c => c.remove());

  // Update HUD
  updateHUD();

  // Show game, hide others
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameOver").style.display    = "none";
  const hud = document.getElementById("hud");
  hud.style.display = "flex";
  gameEl.style.display = "block";
  gameEl.style.background = "#fff4cc";

  placeRandom(cheeseEl);
  spawnCat();

  startTimer();
  requestAnimationFrame(gameLoop);
}

// ── Game Loop ──────────────────────────────────────────
function gameLoop() {
  if (!gameRunning) return;

  // Move player
  if (keys["ArrowUp"])    py -= speed;
  if (keys["ArrowDown"])  py += speed;
  if (keys["ArrowLeft"])  px -= speed;
  if (keys["ArrowRight"]) px += speed;

  // Clamp to game bounds (account for emoji size ~36px)
  px = Math.max(0, Math.min(764, px));
  py = Math.max(0, Math.min(414, py));

  playerEl.style.left = px + "px";
  playerEl.style.top  = py + "px";

  moveCats();
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

// ── Timer ──────────────────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameRunning) return;
    time--;
    document.getElementById("time").textContent = time;
    if (time <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

// ── Cats ───────────────────────────────────────────────
function spawnCat() {
  const cat = document.createElement("div");
  cat.className = "cat";
  cat.textContent = "🐱";

  // Spawn away from player
  cat.x = Math.random() < 0.5 ? Math.random() * 300 + 400 : Math.random() * 200;
  cat.y = Math.random() * 414;

  const baseSpeed = 1.5 + level * 0.4;
  cat.vx = (Math.random() < 0.5 ? -1 : 1) * baseSpeed;
  cat.vy = (Math.random() < 0.5 ? -1 : 1) * baseSpeed;

  gameEl.appendChild(cat);
  cats.push(cat);
}

function moveCats() {
  cats.forEach(cat => {
    cat.x += cat.vx;
    cat.y += cat.vy;

    if (cat.x <= 0 || cat.x >= 764) cat.vx *= -1;
    if (cat.y <= 0 || cat.y >= 414) cat.vy *= -1;

    cat.style.left = cat.x + "px";
    cat.style.top  = cat.y + "px";
  });
}

// ── Collisions ─────────────────────────────────────────
function checkCollisions() {
  const p = playerEl.getBoundingClientRect();

  // Cheese
  if (hit(p, cheeseEl.getBoundingClientRect())) {
    score += 10;
    cheeseEl.style.transform = "scale(1.6)";
    setTimeout(() => cheeseEl.style.transform = "scale(1)", 150);
    placeRandom(cheeseEl);
    flash("flash-cheese");

    // Level up every 50 points
    if (score >= level * 50) {
      level++;
      spawnCat();
    }
    updateHUD();
  }

  // Cats
  cats.forEach(cat => {
    if (hit(p, cat.getBoundingClientRect())) {
      lives--;
      flash("flash-hit");

      // Bounce player back to start
      px = 100; py = 100;

      if (lives <= 0) {
        endGame();
      } else {
        updateHUD();
      }
    }
  });
}

// ── Helpers ────────────────────────────────────────────
function hit(a, b) {
  return a.left < b.right && a.right > b.left &&
         a.top  < b.bottom && a.bottom > b.top;
}

function placeRandom(el) {
  el.style.left = Math.random() * 750 + "px";
  el.style.top  = Math.random() * 400 + "px";
}

function flash(cls) {
  gameEl.classList.add(cls);
  setTimeout(() => gameEl.classList.remove(cls), 200);
}

function updateHUD() {
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = "❤️".repeat(Math.max(0, lives));
  document.getElementById("time").textContent  = time;
  document.getElementById("level").textContent = level;
}

// ── End Game ───────────────────────────────────────────
function endGame() {
  gameRunning = false;
  clearInterval(timerInterval);

  gameEl.style.display = "none";
  document.getElementById("hud").style.display    = "none";
  document.getElementById("gameOver").style.display = "flex";
  document.getElementById("finalScore").textContent = score;
}

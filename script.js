// ==========================================
// CONFIGURATION ET VARIABLES INITIALES
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20; // Taille d'un carré sur la grille
const tileCount = canvas.width / gridSize;

let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';

let redApple = { x: 0, y: 0 };
let goldApple = { x: 0, y: 0 };

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

let isPaused = false;
let isGameOver = false;
let gameInterval = null;
const gameSpeed = 100; // Vitesse du jeu en ms (plus bas = plus rapide)

// ==========================================
// DÉMARRAGE ETRÉINITIALISATION
// ==========================================
function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  score = 0;
  isPaused = false;
  isGameOver = false;

  placeApple(redApple);
  placeApple(goldApple);

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
}

// Positionne une pomme sur une case libre
function placeApple(apple) {
  let validPosition = false;
  while (!validPosition) {
    apple.x = Math.floor(Math.random() * tileCount);
    apple.y = Math.floor(Math.random() * tileCount);

    // Vérifie qu'elle n'apparaît pas sur le serpent
    validPosition = !snake.some(segment => segment.x === apple.x && segment.y === apple.y);

    // Vérifie que les deux pommes ne sont pas l'une sur l'autre
    if (apple === goldApple && apple.x === redApple.x && apple.y === redApple.y) {
      validPosition = false;
    }
  }
}

// ==========================================
// BOUCLE PRINCIPALE
// ==========================================
function gameLoop() {
  if (isPaused || isGameOver) return;

  update();
  draw();
}

function update() {
  // Valide la direction pour éviter le demi-tour instantané (anti-suicide)
  direction = nextDirection;

  // Calcul de la nouvelle position de la tête
  const head = { ...snake[0] };
  if (direction === 'UP') head.y -= 1;
  if (direction === 'DOWN') head.y += 1;
  if (direction === 'LEFT') head.x -= 1;
  if (direction === 'RIGHT') head.x += 1;

  // Collision avec les murs
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    triggerGameOver();
    return;
  }

  // Collision avec soi-même
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    triggerGameOver();
    return;
  }

  // Ajout de la nouvelle tête
  snake.unshift(head);

  // Manger la pomme rouge (+1 point)
  if (head.x === redApple.x && head.y === redApple.y) {
    score += 1;
    placeApple(redApple);
  }
  // Manger la pomme dorée (+3 points)
  else if (head.x === goldApple.x && head.y === goldApple.y) {
    score += 3;
    placeApple(goldApple);
  } 
  // Déplacement normal (on retire la queue)
  else {
    snake.pop();
  }

  // Mise à jour du meilleur score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
  }
}

// ==========================================
// AFFICHAGE GRAPHIQUE (CANVAS)
// ==========================================
function draw() {
  // Effacer le fond
  ctx.fillStyle = '#1A1A24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessiner la pomme rouge
  ctx.fillStyle = '#FF4D4D';
  ctx.beginPath();
  ctx.arc(
    redApple.x * gridSize + gridSize / 2,
    redApple.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Dessiner la pomme dorée
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(
    goldApple.x * gridSize + gridSize / 2,
    goldApple.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Dessiner le serpent
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784'; // Tête plus foncée
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });

  // Affichage des scores
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Top: ${highScore}`, 10, 40);

  // Overlay Pause
  if (isPaused) {
    drawOverlay('PAUSE', 'Appuie sur P ou Espace pour reprendre');
  }
}

function triggerGameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  drawOverlay('GAME OVER', `Score final : ${score} - Appuie sur ESPACE pour rejouer`);
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#FF4D4D';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px sans-serif';
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 25);
}

// ==========================================
// GESTION DES TOUCHES
// ==========================================
document.addEventListener('keydown', (e) => {
  // Contrôles directionnels (Flèches & ZQSD)
  if ((e.key === 'ArrowUp' || e.key === 'z') && direction !== 'DOWN') {
    nextDirection = 'UP';
  } else if ((e.key === 'ArrowDown' || e.key === 's') && direction !== 'UP') {
    nextDirection = 'DOWN';
  } else if ((e.key === 'ArrowLeft' || e.key === 'q') && direction !== 'RIGHT') {
    nextDirection = 'LEFT';
  } else if ((e.key === 'ArrowRight' || e.key === 'd') && direction !== 'LEFT') {
    nextDirection = 'RIGHT';
  }

  // Pause (Touche P ou Échap)
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    if (!isGameOver) {
      isPaused = !isPaused;
      draw();
    }
  }

  // Rejouer après Game Over (Touche Espace)
  if (e.code === 'Space') {
    if (isGameOver) {
      initGame();
    } else if (isPaused) {
      isPaused = false;
    }
  }
});

// Démarrage initial
initGame();

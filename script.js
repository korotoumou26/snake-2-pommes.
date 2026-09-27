const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20; // Taille d'une case (20x20 pixels)
const tileCount = canvas.width / gridSize; // 20x20 cases sur la grille

let score = 0;
let snake = [{ x: 10, y: 10 }]; // Position de départ du serpent
let dx = 1; // Déplacement horizontal (+1 = droite)
let dy = 0; // Déplacement vertical

// Tableau contenant les 2 POMMES
let apples = [];

// Fonction pour générer une position aléatoire valide
function getRandomPosition() {
    let newPos;
    let collision;
    do {
        collision = false;
        newPos = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Vérifier que la pomme n'apparaît pas sur le serpent
        for (let segment of snake) {
            if (segment.x === newPos.x && segment.y === newPos.y) {
                collision = true;
                break;
            }
        }

        // Vérifier que la nouvelle pomme n'apparaît pas sur l'autre pomme
        for (let apple of apples) {
            if (apple.x === newPos.x && apple.y === newPos.y) {
                collision = true;
                break;
            }
        }
    } while (collision);

    return newPos;
}

// Initialiser les 2 pommes au début du jeu
function initApples() {
    apples = [];
    apples.push(getRandomPosition());
    apples.push(getRandomPosition());
}

// Écoute des touches du clavier pour déplacer le serpent
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const keyPressed = event.key;
    if ((keyPressed === "ArrowLeft" || keyPressed === "q") && dx === 0) {
        dx = -1; dy = 0;
    } else if ((keyPressed === "ArrowUp" || keyPressed === "z") && dy === 0) {
        dx = 0; dy = -1;
    } else if ((keyPressed === "ArrowRight" || keyPressed === "d") && dx === 0) {
        dx = 1; dy = 0;
    } else if ((keyPressed === "ArrowDown" || keyPressed === "s") && dy === 0) {
        dx = 0; dy = 1;
    }
}

// Boucle principale du jeu
function gameLoop() {
    // 1. Déplacer la tête du serpent
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 2. Vérifier les collisions avec les murs
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        alert("Game Over ! Score final : " + score);
        resetGame();
        return;
    }

    // 3. Vérifier les collisions avec soi-même
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            alert("Game Over ! Score final : " + score);
            resetGame();
            return;
        }
    }

    snake.unshift(head); // Ajouter la nouvelle tête

    // 4. Vérifier si le serpent mange l'une des 2 POMMES
    let ateAppleIndex = -1;
    for (let i = 0; i < apples.length; i++) {
        if (head.x === apples[i].x && head.y === apples[i].y) {
            ateAppleIndex = i;
            break;
        }
    }

    if (ateAppleIndex !== -1) {
        // Le serpent a mangé une pomme !
        score += 10;
        document.getElementById("score").innerText = score;
        
        // Remplacer la pomme mangée par une nouvelle (il y en a toujours 2 !)
        apples[ateAppleIndex] = getRandomPosition();
    } else {
        // Si aucune pomme n'est mangée, on retire le dernier morceau de la queue
        snake.pop();
    }

    // 5. Dessiner la grille et les éléments
    drawGame();
}

function drawGame() {
    // Nettoyer l'écran
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner les 2 POMMES (rouges)
    ctx.fillStyle = "#ef4444";
    for (let apple of apples) {
        ctx.beginPath();
        ctx.arc(
            apple.x * gridSize + gridSize / 2,
            apple.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Dessiner le SERPENT (vert)
    ctx.fillStyle = "#22c55e";
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    }
}

function resetGame() {
    score = 0;
    document.getElementById("score").innerText = score;
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    initApples();
}

// Lancement du jeu
initApples();
setInterval(gameLoop, 120); // Vitesse du jeu (toutes les 120ms)

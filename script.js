const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menu-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let bestScore = 0;
let snake = [];
let dx = 1;
let dy = 0;
let apples = [];
let gameInterval = null;
let gameRunning = false;

function getRandomPosition() {
    let newPos;
    let collision;
    do {
        collision = false;
        newPos = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        for (let segment of snake) {
            if (segment.x === newPos.x && segment.y === newPos.y) {
                collision = true;
                break;
            }
        }

        for (let apple of apples) {
            if (apple.x === newPos.x && apple.y === newPos.y) {
                collision = true;
                break;
            }
        }
    } while (collision);

    return newPos;
}

function initApples() {
    apples = [];
    apples.push(getRandomPosition());
    apples.push(getRandomPosition());
}

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    if (!gameRunning) return;

    const keyPressed = event.key;
    if ((keyPressed === "ArrowLeft" || keyPressed === "q" || keyPressed === "Q") && dx === 0) {
        dx = -1; dy = 0;
    } else if ((keyPressed === "ArrowUp" || keyPressed === "z" || keyPressed === "Z") && dy === 0) {
        dx = 0; dy = -1;
    } else if ((keyPressed === "ArrowRight" || keyPressed === "d" || keyPressed === "D") && dx === 0) {
        dx = 1; dy = 0;
    } else if ((keyPressed === "ArrowDown" || keyPressed === "s" || keyPressed === "S") && dy === 0) {
        dx = 0; dy = 1;
    }
}

function startGame() {
    menuScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    score = 0;
    document.getElementById("score").innerText = score;
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    initApples();

    gameRunning = true;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120);
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);

    if (score > bestScore) {
        bestScore = score;
        document.getElementById("best-score").innerText = bestScore;
    }

    document.getElementById("final-score").innerText = score;
    gameOverScreen.classList.remove("hidden");
}

function gameLoop() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    let ateAppleIndex = -1;
    for (let i = 0; i < apples.length; i++) {
        if (head.x === apples[i].x && head.y === apples[i].y) {
            ateAppleIndex = i;
            break;
        }
    }

    if (ateAppleIndex !== -1) {
        score += 10;
        document.getElementById("score").innerText = score;
        apples[ateAppleIndex] = getRandomPosition();
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let apple of apples) {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(
            apple.x * gridSize + gridSize / 2,
            apple.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#78350f";
        ctx.fillRect(apple.x * gridSize + gridSize / 2 - 1, apple.y * gridSize + 2, 2, 4);
    }

    for (let i = 0; i < snake.length; i++) {
        let segment = snake[i];
        let x = segment.x * gridSize;
        let y = segment.y * gridSize;

        if (i === 0) {
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            let eyeOffset1 = { x: 5, y: 5 };
            let eyeOffset2 = { x: 15, y: 5 };

            if (dx === 1)  { eyeOffset1 = { x: 14, y: 5 };  eyeOffset2 = { x: 14, y: 15 }; }
            if (dx === -1) { eyeOffset1 = { x: 5, y: 5 };   eyeOffset2 = { x: 5, y: 15 }; }
            if (dy === 1)  { eyeOffset1 = { x: 5, y: 14 };  eyeOffset2 = { x: 15, y: 14 }; }
            if (dy === -1) { eyeOffset1 = { x: 5, y: 5 };   eyeOffset2 = { x: 5, y: 15 }; }

            ctx.beginPath();
            ctx.arc(x + eyeOffset1.x, y + eyeOffset1.y, 3, 0, Math.PI * 2);
            ctx.arc(x + eyeOffset2.x, y + eyeOffset2.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(x + eyeOffset1.x, y + eyeOffset1.y, 1.5, 0, Math.PI * 2);
            ctx.arc(x + eyeOffset2.x, y + eyeOffset2.y, 1.5, 0, Math.PI * 2);
            ctx.fill();

        } else {
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

drawGame();

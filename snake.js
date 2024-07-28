const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const levelText = document.querySelector("#levelText");
const resetBtn = document.querySelector("#resetBtn");
const increaseSpeedBtn = document.querySelector("#increaseSpeedBtn");
const decreaseSpeedBtn = document.querySelector("#decreaseSpeedBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const resumeBtn = document.querySelector("#resumeBtn");
const boardBackground = "black";
const snakeColor = "lightgreen";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 25;
let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;
let level = 1;
let speed = 200;
let snake = [{ x: 0, y: 0 }];
let levelCompleted = false;
let paused = false;

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
increaseSpeedBtn.addEventListener("click", () => adjustSpeed(-25));
decreaseSpeedBtn.addEventListener("click", () => adjustSpeed(25));
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
window.addEventListener("resize", resizeCanvas);

loadGameState();
gameStart();
resizeCanvas();

function gameStart() {
    running = true;
    scoreText.textContent = `Score: ${score}`;
    levelText.textContent = `Level: ${level}`;
    createFood();
    drawFood();
    nextTick();
}

function nextTick() {
    if (running && !paused) {
        setTimeout(() => {
            clearBoard();
            drawFood();
            moveSnake();
            drawSnake();
            checkGameOver();
            if (!levelCompleted) {
                nextTick();
            }
        }, speed);
    } else if (!running && !paused) {
        displayGameOver();
    }
}

function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameBoard.width, gameBoard.height);
}

function createFood() {
    function randomFood(min, max) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameBoard.width - unitSize);
    foodY = randomFood(0, gameBoard.height - unitSize);
}

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
}

function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
    snake.unshift(head);
    if (snake[0].x === foodX && snake[0].y === foodY) {
        score += 1;
        scoreText.textContent = `Score: ${score}`;
        if (score % 5 === 0) {
            levelCompleted = true;
            level += 1;
            levelText.textContent = `Level: ${level}`;
            adjustSpeed(-10); // Increase speed every 5 points
            displayLevelCompleted();
            setTimeout(() => {
                levelCompleted = false;
                createFood();
                nextTick();
            }, 2000); // Pause for 2 seconds before starting the next level
        } else {
            createFood();
        }
    } else {
        snake.pop();
    }
    saveGameState();
}

function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    });

    // Display level on the game board
    ctx.font = "20px MV Boli";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(`Level: ${level}`, 10, 20);
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = (yVelocity === -unitSize);
    const goingDown = (yVelocity === unitSize);
    const goingRight = (xVelocity === unitSize);
    const goingLeft = (xVelocity === -unitSize);

    switch (true) {
        case (keyPressed === LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case (keyPressed === RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
    }
}

function checkGameOver() {
    if (paused) return; // Do not check for game over if the game is paused

    switch (true) {
        case (snake[0].x < 0):
        case (snake[0].x >= gameBoard.width):
        case (snake[0].y < 0):
        case (snake[0].y >= gameBoard.height):
            running = false;
            break;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            running = false;
        }
    }
}

function displayGameOver() {
    ctx.font = "10vw MV Boli"; // Use viewport width units
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameBoard.width / 2, gameBoard.height / 2);
    running = false;
    localStorage.removeItem("snakeGameState");
}

function resetGame() {
    score = 0;
    level = 1;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [{ x: 0, y: 0 }];
    gameStart();
}

function adjustSpeed(change) {
    speed = Math.max(50, speed + change);
}

function saveGameState() {
    const gameState = {
        snake: snake,
        foodX: foodX,
        foodY: foodY,
        xVelocity: xVelocity,
        yVelocity: yVelocity,
        score: score,
        level: level,
        speed: speed,
        running: running
    };
    localStorage.setItem("snakeGameState", JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = JSON.parse(localStorage.getItem("snakeGameState"));
    if (savedState) {
        snake = savedState.snake;
        foodX = savedState.foodX;
        foodY = savedState.foodY;
        xVelocity = savedState.xVelocity;
        yVelocity = savedState.yVelocity;
        score = savedState.score;
        level = savedState.level;
        speed = savedState.speed;
        running = savedState.running;
    }
}

function displayLevelCompleted() {
    ctx.font = "8vw MV Boli"; // Use viewport width units
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Level ${level - 1} Completed!`, gameBoard.width / 2, gameBoard.height / 2);
}

function pauseGame() {
    paused = true;
    running = false;
    pauseBtn.style.display = "none";
    resumeBtn.style.display = "inline";
    saveGameState();
}

function resumeGame() {
    paused = false;
    running = true;
    resumeBtn.style.display = "none";
    pauseBtn.style.display = "inline";
    nextTick();
}

function resizeCanvas() {
    const containerWidth = document.getElementById('gameContainer').clientWidth;
    gameBoard.width = containerWidth - 20; // Sub
    gameBoard.height = gameBoard.width; // Make it square
    console.log(`Canvas resized to: ${gameBoard.width} x ${gameBoard.height}`);
    drawSnake();
    drawFood();
}
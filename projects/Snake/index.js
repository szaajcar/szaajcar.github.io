var firebaseConfig = {
    apiKey: "AIzaSyAlkTB1bgwbFtM0JO4M5uosDbqnLMA5ngw",
    authDomain: "snake-2afde.firebaseapp.com",
    projectId: "snake-2afde",
    storageBucket: "snake-2afde.appspot.com",
    messagingSenderId: "1075761476027",
    appId: "1:1075761476027:web:47bce9548815cd5d4f549e",
    measurementId: "G-FMDRY5QJTH"
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.clientWidth;
const height = canvas.clientHeight - 100;
let snake, food, lost, score, foodCountSetting, snakeColorSetting;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
const restartButton = document.getElementById("resetButton");
const resetLeaderboardButton = document.getElementById("resetLeaderboardButton");

// Connect to input elements
const foodCountInput = document.getElementById("foodCount");
const snakeColorInput = document.getElementById("snakeColor");

// Event listeners
document.addEventListener("keypress", inputHandler);
restartButton.addEventListener("click", defaultSetUp);
resetLeaderboardButton.addEventListener("click", resetLeaderboard);
snakeColorInput.addEventListener("input", updateSnakeColor);



function defaultSetUp() {
    lost = false;
    foodCountSetting = parseInt(foodCountInput.value);
    snakeColorSetting = snakeColorInput.value;
    food = new Food();
    snake = new Snake();
    score = 0;
    restartButton.style.display = "none";
    foodCountInput.disabled = true;
    updateLeaderboard();
}

function updateSnakeColor() {
    snakeColorSetting = snakeColorInput.value;
    snake.drawSnake(); // Redraw snake with new color
}

const Directions = {
    up: [0, -20],
    down: [0, 20],
    left: [-20, 0],
    right: [20, 0]
};

class Snake {
    constructor() {
        this.snakeParts = [];
        this.length = 1;
        this.snakeParts.push(this.createPart(60, 180, Directions.down));
    }

    getSnakeHead() {
        return this.snakeParts[0];
    }

    turn(dir) {
        const oppositeDir = [this.snakeParts[0].dir[0] * (-1), this.snakeParts[0].dir[1] * (-1)];
        if (dir[0] == oppositeDir[0] && dir[1] == oppositeDir[1] && this.length > 1)
            return;
        this.snakeParts[0].dir = dir;
    }

    move() {
        if (lost) return; // Stop movement if the game is lost
        const snakeHead = this.getSnakeHead();
        const newPos = [snakeHead.posX + snakeHead.dir[0], snakeHead.posY + snakeHead.dir[1]];
        if (newPos[0] >= width || newPos[0] < 0 || newPos[1] >= height || newPos[1] < 0) {
            this.gameOver();
            return;
        }
        this.snakeParts.pop();
        this.snakeParts.unshift(this.createPart(newPos[0], newPos[1], snakeHead.dir));
        this.checkFoodCollision();
    }

    checkFoodCollision() {
        const head = this.getSnakeHead();
        for (let i = 0; i < food.foodPos.length; i++) {
            if (head.posX === food.foodPos[i][0] && head.posY === food.foodPos[i][1]) {
                this.eat(i);
                break;
            }
        }
    }

    eat(index) {
        const head = this.getSnakeHead();
        this.snakeParts.unshift({ posX: food.foodPos[index][0], posY: food.foodPos[index][1], dir: head.dir });
        food.foodPos.splice(index, 1);
        food.nextFood();
        score++;
    }

    drawSnake() {
        ctx.clearRect(0, 0, width, height + 100);
        board();
        food.drawFood();
        ctx.fillStyle = snakeColorSetting;
        for (let i = 0; i < this.snakeParts.length; i++) {
            ctx.fillRect(this.snakeParts[i].posX, this.snakeParts[i].posY, 20, 20);
        }
        border();
        if (lost) {
            this.gameOver();
        }
        ctx.fillStyle = "black"; // Reset fill style to default (black)
    }

    createPart(x, y, dir) {
        const part = {
            posX: x,
            posY: y,
            dir: dir
        };
        return part;
    }

    gameOver() {
        if (lost) return; // Prevent multiple gameOver calls
        lost = true;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Game Over!", (width - 170) / 2, height / 2);
        restartButton.style.display = "block";
        foodCountInput.disabled = false; // Enable food count input on game over

        // Add score to leaderboard and update local storage
        updateLeaderboard(score);
    }
}

class Food {
    constructor() {
        this.foodPos = [];
        this.spawnFood();
    }

    spawnFood() {
        this.foodPos = [];
        for (let i = 0; i < foodCountSetting; i++) {
            this.foodPos.push([random(0, 20) * 20, random(0, 20) * 20]);
        }
    }

    drawFood() {
        ctx.fillStyle = "red";
        for (let pos of this.foodPos) {
            ctx.fillRect(pos[0], pos[1], 20, 20);
        }
    }

    nextFood() {
        if (this.foodPos.length < foodCountSetting) {
            this.foodPos.push([random(0, 20) * 20, random(0, 20) * 20]);
        }
    }
}

function random(min = 0, max = 20) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function inputHandler(e) {
    e = e || window.event;
    switch (e.keyCode) {
        case 97:
            snake.turn(Directions.left);
            break;
        case 119:
            snake.turn(Directions.up);
            break;
        case 115:
            snake.turn(Directions.down);
            break;
        case 100:
            snake.turn(Directions.right);
            break;
    }
}

function border() {
    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, width, height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "black"; // Set default fill style for text
    ctx.fillText("Score: " + score, 0, height + 30);
}

function board() {
    for (let w = 0; w < width / 20; w++) {
        for (let h = 0; h < height / 20; h++) {
            if (h % 2 === 0) {
                ctx.fillStyle = w % 2 === 0 ? "#a2d149" : "#aad751";
            } else {
                ctx.fillStyle = w % 2 === 0 ? "#aad751" : "#a2d149";
            }
            ctx.fillRect(w * 20, h * 20, 20, 20);
        }
    }
}


function updateLeaderboard(newScore) {
    if (newScore !== undefined) {
        leaderboard.push({ score: newScore });
        leaderboard.sort((a, b) => b.score - a.score);
        if (leaderboard.length > 8) {
            leaderboard = leaderboard.slice(0, 8);
        }
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    const leaderboardTable = document.getElementById("leaderboardTable").getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = "";
    leaderboard.forEach((entry, index) => {
        const row = leaderboardTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerHTML = index + 1;
        cell2.innerHTML = entry.score;
        // Add delete button to each row
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteScore(index)); // Call deleteScore function with index
        const cell4 = row.insertCell(2);
        cell4.appendChild(deleteButton);
        cell4.classList.add('action-cell');
    });
}

function resetLeaderboard() {
    leaderboard = [];
    localStorage.removeItem('leaderboard');
    updateLeaderboard();
}

function deleteScore(indexToDelete) {
    leaderboard.splice(indexToDelete, 1);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
}

defaultSetUp();

function gameLoop() {
    if (!lost) {
        snake.move();
        snake.drawSnake();
    }
}

setInterval(gameLoop, 250);

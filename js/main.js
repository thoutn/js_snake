

/*
 *  Rounded rectangle method for Canvas
 *  
 *  Credit and src: 
 *  https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
 */
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
}


// Canvas
const canvas = document.querySelector('canvas');
const title = document.querySelector('h2');
const ctx = canvas.getContext('2d');


// Game setup
// Grid
const tileSize = 30;
const tileCountY = canvas.height / tileSize; 
const tileCountX = canvas.width / tileSize;

// Frame per sec
let fps = 10;

// Limits event to one per frame-update
let isEventDetected = false; 

// Condition for self-collision
let isGameOver = false;

// Score
let score = 0; 
let pointPerFood = 20; 


// Snake
let yStartPos = canvas.height / 2; 

const snake = {
    x: 0,
    y: yStartPos,

    speed: tileSize, 

    velX: 1,
    velY: 0,

    tail: [
        {x: -tileSize, y: yStartPos},
        {x: -2*tileSize, y: yStartPos}
    ]
}


// Food
let genFoodPos = function() {
    foodPosX = Math.floor(Math.random() * tileCountX) * tileSize;
    foodPosY = Math.floor(Math.random() * tileCountY) * tileSize;
}

genFoodPos(); 


// Snake and wall collision
let checkWallCollision = function() {
    if (snake.x > canvas.width - tileSize) {
        snake.x = 0;
    }
    
    if (snake.x < 0) {
        snake.x = canvas.width - tileSize;
    }

    if (snake.y > canvas.height - tileSize) {
        snake.y = 0;
    }

    if (snake.y < 0) {
        snake.y = canvas.height - tileSize;
    }
}


// Snake and food collision
let checkFoodCollision = function() {
    if (snake.x === foodPosX && snake.y === foodPosY) {
        genFoodPos();

        score ++;
    } else {
        snake.tail.pop();
    }
}


let checkSelfCollision = function() {
    snake.tail.forEach(part => {
        if (snake.x === part.x && snake.y === part.y) {
            isGameOver = true;
        }
    });
}


// Move snake
let moveSnake = function() {
    checkSelfCollision();
    
    snake.tail.unshift({x: snake.x, y: snake.y});
    snake.x += snake.velX * snake.speed; 
    snake.y += snake.velY * snake.speed; 

    checkWallCollision();
    checkFoodCollision();
}


// Draw grid
let drawGrid = function() {
    for (let i = 0; i < tileCountY; i++) {
        for (let j = 0; j < tileCountX; j++) {
            drawRect(j*tileSize, i*tileSize, tileSize - 1, tileSize - 1, '#f9f9f9');
        }
    }
}


// Draw game frame
let drawGameFrame = function() {
    // background
    drawRect(0, 0, canvas.width, canvas.height, '#dfb5e0');

    // grid
    drawGrid();

    // snake HEAD
    //drawRect(snake.x, snake.y, tileSize, tileSize, 'black');
    drawSnake(snake.x, snake.y, tileSize, tileSize, 'black');
    
    // snake TAIL
    snake.tail.forEach(part => 
        //drawRect(part.x, part.y, tileSize, tileSize, '#4c4c4c'));
        drawSnake(part.x, part.y, tileSize, tileSize, '#4c4c4c'));

    // food
    drawRect(foodPosX, foodPosY, tileSize - 1, tileSize - 1, '#b5b6e0');

    // score
    title.textContent = score * pointPerFood; 
}


// Draw rectangle
let drawRect = function(x, y, width, height, colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(x, y, width, height);
}


// Draw snake
let drawSnake = function(x, y, width, height, colour) {
    ctx.fillStyle = colour;
    ctx.roundRect(x + 1, y + 1, width - 3, height - 3, 5).fill();
}


// Event handler
let checkKeyPush = function(event) {
    switch (event.key) {
        case 'ArrowUp':
            if (snake.velY !== 1 && !isEventDetected) {
                snake.velY = -1;
                snake.velX = 0; 
                isEventDetected = true;
            }
            break;
        case 'ArrowDown':
            if (snake.velY !== -1 && !isEventDetected) {
                snake.velY = 1;
                snake.velX = 0; 
                isEventDetected = true;
            }
            break;
        case 'ArrowLeft':
            if (snake.velX !== 1 && !isEventDetected) {
                snake.velX = -1; 
                snake.velY = 0;
                isEventDetected = true;
            }
            break;
        case 'ArrowRight':
            if (snake.velX !== -1 && !isEventDetected) {
                snake.velX = 1;
                snake.velY = 0;
                isEventDetected = true;
            }
            break;
        case 'Enter': // to restart game
            if (isGameOver) {
                location.reload();
            }
            break; 
        default:
            break;
    }
}


let sayGameOver = function() {
    let lineHeight = 70; 
    ctx.strokeStyle = 'grey';
    ctx.fillStyle = 'white';
    ctx.font = '80px Arial black';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2); 
    ctx.strokeText('Game Over', canvas.width / 2, canvas.height / 2);
    
    ctx.fillStyle = 'grey';
    ctx.font = '40px Arial';
    ctx.fillText('Your score is ' + score*pointPerFood, canvas.width / 2, canvas.height / 2 + lineHeight); 

    title.textContent = '💀  Hit "Enter" to restart  💀';
}


// Listener
document.addEventListener('keydown', checkKeyPush);


// Game loop
let runGame = function() {
    if (!isGameOver) {
        isEventDetected = false; 
        drawGameFrame();
        moveSnake();

        //requestAnimationFrame(runGame);
        setTimeout(runGame, 1000 / fps);
    } else {
        sayGameOver();
    }
}

runGame();
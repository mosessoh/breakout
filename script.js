// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 3;
let gameRunning = false;

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    dx: 4,
    dy: -4,
    color: '#0095DD'
};

// Paddle properties
const paddle = {
    width: 75,
    height: 10,
    x: (canvas.width - 75) / 2,
    color: '#0095DD'
};

// Brick properties
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Create bricks array
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Event listeners
document.addEventListener('mousemove', movePaddle);
document.getElementById('startButton').addEventListener('click', startGame);

// Move paddle with mouse
function movePaddle(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        resetGame();
        draw();
    }
}

// Reset game state
function resetGame() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = (canvas.width - paddle.width) / 2;
    
    // Reset bricks
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
    
    // Reset score if all lives were lost
    if (lives === 0) {
        score = 0;
        lives = 3;
        updateScoreDisplay();
        updateLivesDisplay();
    }
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = getRowColor(r);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Get color based on row
function getRowColor(row) {
    const colors = ['#FF5252', '#FFEB3B', '#4CAF50'];
    return colors[row % colors.length];
}

// Detect collisions
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ball.x > b.x &&
                    ball.x < b.x + brickWidth &&
                    ball.y > b.y &&
                    ball.y < b.y + brickHeight
                ) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    updateScoreDisplay();
                    
                    // Check if all bricks are broken
                    if (score === brickRowCount * brickColumnCount) {
                        showWinMessage();
                        gameRunning = false;
                    }
                }
            }
        }
    }
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}

// Update lives display
function updateLivesDisplay() {
    document.getElementById('lives').textContent = lives;
}

// Show win message
function showWinMessage() {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN! Click Start to play again', canvas.width / 2, canvas.height / 2);
}

// Show game over message
function showGameOverMessage() {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#FF5252';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER! Click Start to play again', canvas.width / 2, canvas.height / 2);
}

// Main drawing function
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawBricks();
    drawBall();
    drawPaddle();
    
    // Collision detection
    collisionDetection();
    
    // Ball movement and collision with walls
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // Check if ball hits the paddle
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
            
            // Add some randomness to ball direction
            ball.dx = ball.dx * (Math.random() * 0.4 + 0.8);
        } else {
            // Ball missed the paddle
            lives--;
            updateLivesDisplay();
            
            if (lives === 0) {
                // Game over
                showGameOverMessage();
                gameRunning = false;
            } else {
                // Reset ball position
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                ball.dx = 4;
                ball.dy = -4;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        }
    }
    
    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Continue animation if game is running
    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

// Initial draw to show the game board
function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.textAlign = 'center';
    ctx.fillText('Click Start to begin', canvas.width / 2, canvas.height / 2);
}

// Initialize the game
window.onload = init;

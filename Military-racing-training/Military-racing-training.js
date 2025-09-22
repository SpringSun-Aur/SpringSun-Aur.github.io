// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 游戏元素
    const dino = document.getElementById('dino');
    const obstaclesContainer = document.getElementById('obstacles');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreElement = document.getElementById('finalScore');
    const startButton = document.getElementById('startGameButton');
    const restartButton = document.getElementById('restartButton');
    const gameArea = document.getElementById('gameArea');
    const ground = document.getElementById('ground');
    const startMainButton = document.getElementById('startButton');
    
    // 游戏状态
    let isJumping = false;
    let isGameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('militaryRacingHighScore') || 0;
    let gameSpeed = 5;
    let obstacleInterval;
    let scoreInterval;
    let animationId;
    let clouds = [];
    
    // 更新高分显示
    highScoreElement.textContent = `最高分: ${highScore}`;
    
    // 恐龙跳跃函数
    function jump() {
        if (!isJumping && !isGameOver) {
            isJumping = true;
            let jumpHeight = 0;
            let jumpVelocity = 15;
            const gravity = 0.8;
            
            function animateJump() {
                jumpHeight += jumpVelocity;
                jumpVelocity -= gravity;
                
                if (jumpHeight <= 0) {
                    jumpHeight = 0;
                    isJumping = false;
                    dino.style.bottom = '30px';
                } else {
                    dino.style.bottom = (30 + jumpHeight) + 'px';
                    requestAnimationFrame(animateJump);
                }
            }
            
            animateJump();
        }
    }
    
    // 创建障碍物
    function createObstacle() {
        if (isGameOver) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.right = '-20px';
        obstaclesContainer.appendChild(obstacle);
        
        // 随机障碍物高度
        const height = Math.random() * 30 + 30;
        obstacle.style.height = height + 'px';
        obstacle.style.bottom = '30px';
        
        let position = gameArea.offsetWidth;
        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }
            
            position -= gameSpeed;
            obstacle.style.right = (gameArea.offsetWidth - position) + 'px';
            
            // 检查是否超出屏幕
            if (position < -20) {
                obstacle.remove();
                clearInterval(moveInterval);
                // 增加分数
                score++;
                scoreElement.textContent = `分数: ${score}`;
            }
            
            // 碰撞检测
            if (checkCollision(dino, obstacle)) {
                gameOver();
                clearInterval(moveInterval);
            }
        }, 16);
    }
    
    // 创建云朵
    function createCloud() {
        if (isGameOver) return;
        
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // 随机云朵大小和位置
        const size = Math.random() * 30 + 20;
        const top = Math.random() * 150 + 20;
        
        cloud.style.width = size + 'px';
        cloud.style.height = size / 2 + 'px';
        cloud.style.right = '-' + size + 'px';
        cloud.style.top = top + 'px';
        
        gameArea.appendChild(cloud);
        clouds.push(cloud);
        
        let position = gameArea.offsetWidth;
        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }
            
            position -= 1;
            cloud.style.right = (gameArea.offsetWidth - position) + 'px';
            
            // 移除屏幕外的云朵
            if (position < -size) {
                cloud.remove();
                clouds = clouds.filter(c => c !== cloud);
                clearInterval(moveInterval);
            }
        }, 16);
    }
    
    // 碰撞检测
    function checkCollision(dino, obstacle) {
        const dinoRect = dino.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        
        // 调整碰撞检测区域，使其更精确
        const dinoAdjusted = {
            left: dinoRect.left + 5,
            right: dinoRect.right - 5,
            top: dinoRect.top + 5,
            bottom: dinoRect.bottom - 5
        };
        
        const obstacleAdjusted = {
            left: obstacleRect.left + 2,
            right: obstacleRect.right - 2,
            top: obstacleRect.top + 2,
            bottom: obstacleRect.bottom - 2
        };
        
        return !(
            dinoAdjusted.right < obstacleAdjusted.left ||
            dinoAdjusted.left > obstacleAdjusted.right ||
            dinoAdjusted.bottom < obstacleAdjusted.top ||
            dinoAdjusted.top > obstacleAdjusted.bottom
        );
    }
    
    // 更新分数
    function updateScore() {
        if (isGameOver) return;
        score++;
        scoreElement.textContent = `分数: ${score}`;
        
        // 每100分增加难度
        if (score % 100 === 0) {
            gameSpeed += 0.5;
        }
    }
    
    // 游戏结束
    function gameOver() {
        isGameOver = true;
        clearInterval(obstacleInterval);
        clearInterval(scoreInterval);
        gameOverScreen.style.display = 'flex';
        finalScoreElement.textContent = score;
        
        // 更新高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = `最高分: ${highScore}`;
            localStorage.setItem('militaryRacingHighScore', highScore);
        }
    }
    
    // 开始游戏
    function startGame() {
        // 重置游戏状态
        isGameOver = false;
        score = 0;
        gameSpeed = 5;
        scoreElement.textContent = '分数: 0';
        obstaclesContainer.innerHTML = '';
        
        // 移除所有云朵
        clouds.forEach(cloud => cloud.remove());
        clouds = [];
        
        // 隐藏开始和结束界面
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        
        // 开始生成障碍物
        obstacleInterval = setInterval(createObstacle, 1500);
        
        // 开始计分
        scoreInterval = setInterval(updateScore, 100);
        
        // 开始生成云朵
        setInterval(createCloud, 3000);
    }
    
    // 事件监听
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    startMainButton.addEventListener('click', startGame);
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') && !isGameOver) {
            e.preventDefault(); // 防止空格键滚动页面
            if (startScreen.style.display === 'none') {
                jump();
            } else {
                startGame();
            }
        }
    });
    
    // 触摸控制（移动设备）
    gameArea.addEventListener('click', () => {
        if (!isGameOver) {
            if (startScreen.style.display === 'none') {
                jump();
            } else {
                startGame();
            }
        }
    });
});
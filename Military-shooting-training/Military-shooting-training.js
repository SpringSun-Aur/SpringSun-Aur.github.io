class ShootingGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ShootingGame' });
        this.score = 0;
        this.timeLeft = 60;
        this.gameActive = false;
        this.targets = [];
        this.lastTargetTime = 0;
        this.timerEvent = null; // 用于存储计时器事件
        this.gameEndTimer = null; // 用于存储游戏结束定时器
        this.isMobile = this.checkMobileDevice(); // 检测是否为移动设备
    }

    // 检测是否为移动设备
    checkMobileDevice() {
        return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry|WebOS|Mobile/i.test(navigator.userAgent);
    }

    preload() {
        // 根据设备类型创建不同大小的标靶
        const targetSize = this.isMobile ? 150 : 150;
        
        const targetGraphic = this.make.graphics({ x: 0, y: 0, width: targetSize, height: targetSize });
        targetGraphic.fillStyle(0xff6666);
        targetGraphic.fillCircle(targetSize/2, targetSize/2, targetSize/2);
        targetGraphic.fillStyle(0xffffff);
        targetGraphic.fillCircle(targetSize/2, targetSize/2, targetSize/2 - 20);
        targetGraphic.fillStyle(0xff6666);
        targetGraphic.fillCircle(targetSize/2, targetSize/2, targetSize/2 - 40);
        targetGraphic.fillStyle(0x000000);
        targetGraphic.fillCircle(targetSize/2, targetSize/2, targetSize/2 - 60);
        
        targetGraphic.generateTexture('target', targetSize, targetSize);
    }

    create() {
        // 创建背景
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // 等待DOM元素加载完成后再初始化UI元素
        this.time.delayedCall(100, () => {
            this.initUI();
        });
        
        // 创建标靶组
        this.targets = this.add.group();
        
        // 监听点击/触摸事件
        this.input.on('pointerdown', (pointer) => {
            if (!this.gameActive) return;
            
            // 检查是否点击到标靶
            const hit = this.checkTargetHit(pointer.x, pointer.y);
            
            // 如果没有击中目标，则扣分
            if (!hit) {
                this.score = Math.max(0, this.score - 250); // 扣250分，但不低于0分
                this.updateScore();
                
                // 显示扣分动画
                const penaltyText = this.add.text(pointer.x, pointer.y, '-250', {
                    fontSize: '24px',
                    fill: '#ff0000',
                    fontStyle: 'bold'
                });
                this.tweens.add({
                    targets: penaltyText,
                    y: pointer.y - 50,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        penaltyText.destroy();
                    }
                });
            }
        });
    }

    initUI() {
        // 初始化UI元素
        this.scoreDisplay = document.getElementById('score-display');
        this.timerDisplay = document.getElementById('timer-display');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        
        // 绑定按钮事件
        if (this.startButton) {
            this.startButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startGame();
            });
        }
        
        if (this.restartButton) {
            this.restartButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.restartGame();
            });
        }
    }

    update(time, delta) {
        if (!this.gameActive) return;
        
        // 每隔一段时间生成新标靶
        if (time > this.lastTargetTime + Phaser.Math.Between(300, 800)) {
            this.createTarget();
            this.lastTargetTime = time;
        }
        
        // 更新标靶位置
        this.targets.children.each(target => {
            // 随机移动标靶
            target.x += target.vx * (delta / 1000);
            target.y += target.vy * (delta / 1000);
            
            // 检查标靶是否已经离开屏幕，如果是则移除
            if (this.isTargetOffScreen(target)) {
                target.destroy();
            }
        });
    }

    // 检查标靶是否已经离开屏幕
    isTargetOffScreen(target) {
        const buffer = 100; // 缓冲区，确保标靶完全离开屏幕
        return (
            target.x < -buffer || 
            target.x > this.game.config.width + buffer || 
            target.y < -buffer || 
            target.y > this.game.config.height + buffer
        );
    }

    startGame() {
        if (this.startScreen) {
            this.startScreen.style.display = 'none';
        }
        
        this.gameActive = true;
        this.score = 0;
        this.timeLeft = 60;
        this.updateScore();
        this.updateTimer();
        
        // 清除之前的计时器（如果存在）
        if (this.timerEvent) {
            this.timerEvent.remove(false);
        }
        
        // 清除之前的游戏结束定时器（如果存在）
        if (this.gameEndTimer) {
            this.gameEndTimer.remove(false);
        }
        
        // 开始倒计时
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        // 游戏结束定时器
        this.gameEndTimer = this.time.delayedCall(60000, this.endGame, [], this);
    }

    restartGame() {
        // 清除所有标靶
        this.targets.clear(true, true);
        if (this.gameOverScreen) {
            this.gameOverScreen.style.display = 'none';
        }
        this.startGame();
    }

    createTarget() {
        // 随机选择一个边出现标靶
        const side = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
        let x, y, vx, vy;
        
        // 更高的速度范围
        const speed = Phaser.Math.Between(200, 400); // 速度范围从200-400
        
        // 根据设备类型调整生成位置范围
        const horizontalRange = this.isMobile ? 
            [this.game.config.width * 0.1, this.game.config.width * 0.9] : 
            [this.game.config.width * 0.2, this.game.config.width * 0.8];
            
        const verticalRange = this.isMobile ? 
            [this.game.config.height * 0.1, this.game.config.height * 0.9] : 
            [this.game.config.height * 0.2, this.game.config.height * 0.8];
        
        const targetSize = this.isMobile ? 100 : 75; // 标靶半径
        
        switch (side) {
            case 0: // 从顶部出现（更靠近中间区域）
                x = Phaser.Math.Between(horizontalRange[0], horizontalRange[1]);
                y = -targetSize;
                vx = Phaser.Math.Between(-speed, speed);
                vy = Phaser.Math.Between(speed/2, speed);
                break;
            case 1: // 从右侧出现（更靠近中间区域）
                x = this.game.config.width + targetSize;
                y = Phaser.Math.Between(verticalRange[0], verticalRange[1]);
                vx = Phaser.Math.Between(-speed, -speed/2);
                vy = Phaser.Math.Between(-speed, speed);
                break;
            case 2: // 从底部出现（更靠近中间区域）
                x = Phaser.Math.Between(horizontalRange[0], horizontalRange[1]);
                y = this.game.config.height + targetSize;
                vx = Phaser.Math.Between(-speed, speed);
                vy = Phaser.Math.Between(-speed, -speed/2);
                break;
            case 3: // 从左侧出现（更靠近中间区域）
                x = -targetSize;
                y = Phaser.Math.Between(verticalRange[0], verticalRange[1]);
                vx = Phaser.Math.Between(speed/2, speed);
                vy = Phaser.Math.Between(-speed, speed);
                break;
        }
        
        const target = this.add.sprite(x, y, 'target');
        target.setScale(0.7);
        target.vx = vx;
        target.vy = vy;
        target.creationTime = this.time.now;
        this.targets.add(target);
    }

    checkTargetHit(x, y) {
        let hitTarget = null;
        let minDistance = Infinity;
        
        // 根据设备类型调整检测范围
        const detectionRadius = this.isMobile ? 100 : 75;
        
        // 查找最近的标靶
        this.targets.children.each(target => {
            const distance = Phaser.Math.Distance.Between(x, y, target.x, target.y);
            // 增大检测范围以匹配更大的标靶
            if (distance <= detectionRadius && distance < minDistance) {
                minDistance = distance;
                hitTarget = target;
            }
        });
        
        if (hitTarget) {
            // 计算得分：基于反应时间和标靶位置
            const reactionTime = this.time.now - hitTarget.creationTime;
            const positionBonus = 1 - (hitTarget.y / this.game.config.height); // 越高得分越高
            const speedBonus = Math.max(0, 1000 - reactionTime) / 1000; // 越快得分越高
            
            const points = Math.floor((100 + positionBonus * 50 + speedBonus * 100) * (1 + (60 - this.timeLeft) / 60));
            
            this.score += points;
            this.updateScore();
            
            // 显示得分动画
            const scoreText = this.add.text(hitTarget.x, hitTarget.y, `+${points}`, {
                fontSize: '24px',
                fill: '#ffffff',
                fontStyle: 'bold'
            });
            this.tweens.add({
                targets: scoreText,
                y: hitTarget.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    scoreText.destroy();
                }
            });
            
            // 移除被击中的标靶
            hitTarget.destroy();
            
            return true; // 返回击中目标
        }
        
        return false; // 返回未击中目标
    }

    updateScore() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `得分: ${this.score}`;
        }
    }

    updateTimer() {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `时间: ${this.timeLeft}`;
        }
        
        if (this.gameActive) {
            this.timeLeft--;
            
            if (this.timeLeft < 0) {
                this.endGame();
            }
        }
    }

    endGame() {
        this.gameActive = false;
        
        // 清除计时器
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
        
        if (this.gameEndTimer) {
            this.gameEndTimer.remove(false);
            this.gameEndTimer = null;
        }
        
        if (this.finalScoreDisplay) {
            this.finalScoreDisplay.textContent = `得分: ${this.score}`;
        }
        if (this.gameOverScreen) {
            this.gameOverScreen.style.display = 'flex';
        }
        
        // 清除所有标靶
        this.targets.clear(true, true);
    }
}

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 750,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: ShootingGame,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antiAlias: true,
        roundPixels: true
    }
};

// 初始化游戏
let game;
window.addEventListener('load', function() {
    // 检测是否为移动设备
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry|WebOS|Mobile/i.test(navigator.userAgent);
    
    // 如果是移动设备，使用竖屏16:9比例 (9:16)
    if (isMobile) {
        config.width = 450;
        config.height = 800;
    }
    
    // 确保DOM完全加载后再初始化游戏
    setTimeout(() => {
        game = new Phaser.Game(config);
    }, 100);
});
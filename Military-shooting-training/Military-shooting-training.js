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
        this.highScore = 0; // 最高分
        this.loadHighScore(); // 加载最高分
    }

    // 检测是否为移动设备
    checkMobileDevice() {
        return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry|WebOS|Mobile/i.test(navigator.userAgent);
    }

    // 加载最高分
    loadHighScore() {
        const savedHighScore = localStorage.getItem('militaryShootingHighScore');
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore);
        }
    }

    // 保存最高分
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('militaryShootingHighScore', this.highScore.toString());
        }
    }

    preload() {
        // 根据设备类型创建不同大小的标靶
        const targetSize = this.isMobile ? 200 : 150;
        
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
                this.score = Math.max(0, this.score - 250); 
                this.updateScore();
                
                // 播放未命中音效
                this.playMissSound();
                
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

    // 播放命中音效
    playHitSound() {
        try {
            // 直接使用Web Audio API创建和播放声音
            const context = this.sound.context;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 440; // 高音调
            gainNode.gain.value = 7.0; // 音量
            
            oscillator.start();
            // 淡出效果
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
            oscillator.stop(context.currentTime + 0.2);
        } catch (e) {
            console.log("无法播放命中音效:", e);
        }
    }

    // 播放未命中音效
    playMissSound() {
        try {
            // 直接使用Web Audio API创建和播放声音
            const context = this.sound.context;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 220; // 低音调
            gainNode.gain.value = 7.0; // 音量
            
            oscillator.start();
            // 淡出效果
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
            oscillator.stop(context.currentTime + 0.3);
        } catch (e) {
            console.log("无法播放未命中音效:", e);
        }
    }

    initUI() {
        // 初始化UI元素
        this.scoreDisplay = document.getElementById('score-display');
        this.timerDisplay = document.getElementById('timer-display');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.highScoreDisplay = document.getElementById('high-score');
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
        
        // 初始化时显示最高分
        if (this.highScoreDisplay) {
            this.highScoreDisplay.textContent = `最高分: ${this.highScore}`;
        }
    }

    update(time, delta) {
        if (!this.gameActive) return;
        
        // 每隔一段时间生成新标靶
        if (time > this.lastTargetTime + Phaser.Math.Between(300, 800)) {
            this.createTarget();
            this.lastTargetTime = time;
        }
        
        // 移除移动标靶的代码，标靶现在是静止的
    }

    // 检查标靶是否已经离开屏幕
    // isTargetOffScreen(target) {
    //     const buffer = 100; // 缓冲区，确保标靶完全离开屏幕
    //     return (
    //         target.x < -buffer || 
    //         target.x > this.game.config.width + buffer || 
    //         target.y < -buffer || 
    //         target.y > this.game.config.height + buffer
    //     );
    // }

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
        // 在屏幕随机位置生成标靶
        const targetSize = this.isMobile ? 100 : 75;
        
        // 确保标靶完全在屏幕内
        const x = Phaser.Math.Between(targetSize, this.game.config.width - targetSize);
        const y = Phaser.Math.Between(targetSize, this.game.config.height - targetSize);
        
        const target = this.add.sprite(x, y, 'target');
        target.setScale(0.7);
        target.creationTime = this.time.now;
        
        // 设置标靶的生命周期为3秒
        const lifetime = 3000;
        
        // 在标靶生命周期的最后1秒开始闪烁
        this.time.delayedCall(lifetime - 1000, () => {
            if (target.active) {
                // 添加闪烁效果
                this.tweens.add({
                    targets: target,
                    alpha: 0,
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        if (target.active) {
                            target.alpha = 1;
                        }
                    }
                });
            }
        }, [], this);
        
        // 生命周期结束后自动销毁
        this.time.delayedCall(lifetime, () => {
            if (target.active) {
                target.destroy();
            }
        }, [], this);
        
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
            
            // 播放命中音效
            this.playHitSound();
            
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
        
        // 保存最高分
        this.saveHighScore();
        
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
        
        // 更新最高分显示
        if (this.highScoreDisplay) {
            // 检查是否创造了新纪录
            if (this.score > this.highScore) {
                this.highScore = this.score;
            }
            this.highScoreDisplay.textContent = `最高分: ${this.highScore}`;
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
    },
    audio: {
        disableWebAudio: false
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
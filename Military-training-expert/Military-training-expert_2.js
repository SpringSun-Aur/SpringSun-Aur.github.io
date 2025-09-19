// game.js

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 预加载军衔图片
        for (let i = 0; i < 13; i++) {
            this.load.image(`rank-${i}`, `image/${i}.png`);
        } 
        // 预加载音频文件
        this.load.audio('click', 'audio/click.mp3');
        this.load.audio('perfectClick', 'audio/perfect_click.mp3');
        this.load.audio('levelUp', 'audio/level_up.mp3');
        this.load.audio('fail', 'audio/fail.mp3');
    }

    create() {
        console.log("BootScene is created!");
        this.scene.start('StandAtEaseScene');
    }
}

class StandAtEaseScene extends Phaser.Scene {
constructor() {
    // 必须首先调用父类构造函数
    super({ key: 'StandAtEaseScene' });
    this.gameOverElements = {
        bg: null,
        titleText: null,
        scoreText: null,
        restartBtn: null,
        rankImage: null,
        btnText: null
    };
    this.gameOverdes = {
        bg: null,
        titleText: null,
        scoreText: null,
        restartBtn: null,
        btnText: null
    };
     this.isShowingLeaderboard = false;
     this.wasShrinking = false;
    this.LevelName=['预备兵','列兵','上等兵','军士','少尉','中尉','上尉','少校',
                    '中校','上校','少将','中将','上将'];
    this.leveldesc=[
        "预备兵：新兵预备入伍，考察预备阶段。军训刚开始，你脚步不稳，意志不定，新兵，你还得好好练",
        "列兵：最低士兵衔，新兵入伍授予，基础训练阶段。你已习惯军训的作息，学的倒是不慢，继续加油",
        "上等兵：服役满一年列兵晋升，担任老兵骨干。经过连续多天的训练，你已从茫茫新生中脱颖而出，能做成这样，已经很好了",
        "下士：军士初级衔，班长或技术岗位，服役满三年。你担任了军训管理的职责，帮助教官指导其他学生，但你仍需继续学习",
        "少尉：军官最低阶，排职干部，军校毕业授予。军训过去小半，你挺拔的身姿和生风的步伐赢得了全排学生的赞叹与敬佩",
        "中尉：少尉满两年晋升，副连职或技术军官。教官推荐你去别的排进行军训表演，你被更多人赞叹了！",
        "上尉：中尉满三年晋升，连职主官或机关参谋。军训过半，你已是全营的风云人物，继续晋升吧！",
        "少校：上尉满四年晋升，营职主官或机关科长。不可思议！训练使你反应迅速，像是真正的军人！",
        "中校：少校满四年晋升，团副职或正营职军官。大局观日益重要。你的专注力和快速反应能力大幅提高，这与整体训练成效密不可分。",
        "上校：中校满四年晋升，团职主官或师旅副职。汇演在即，每个排都需要为整体荣誉而努力。你必须和其他同学目标一致，才能成功。",
        "少将：将官初级，副战区职，肩章一星金枝叶。战略思维开始体现，需要分析、判断和决策。你参加的拉练活动和定向越野，正需要这样的智慧与魄力。",
        "中将：正战区职或副战区职，肩章两星金枝叶。明天将是最终检验，所有的汗水与努力都将汇聚成一场精彩的演出，需要你像将领一样沉稳指挥自己的身体部队",
        "上将：最高常设军衔，战区正职，肩章三星金枝叶。阅兵日！你是接受检阅的“士兵将军”！坚持到最后，你收获了钢铁般的意志、深厚的友谊和无比的骄傲。恭喜你，圆满完成军训这门大学第一课！"
    ];
    this.levelsc=[
        300,
        700,
        1300,
        1800,
        2700,
        3600,
        5400,
        7200,
        8100,
        9000,
        9900,
        10800,
        11600,
        12400
    ];


    this.circle = null;
    this.isShrinking = false;
    this.shrinkSpeed = 10;
    this.targetScale = 0.3;
    this.currentScore = 0;
    this.highScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.level = 1;
    this.lives = 3;
    this.isGameOver = false;
    this.isTimerStarted = false;

    this.playerName = '匿名玩家';
    this.highScores = []; // 存储排行榜数据
    this.nameInput = null; // 用户名输入框
    this.leaderboardElements = {}; // 排行榜界面元素
    
    // 游戏UI元素
    this.currentScoreText = null;
    this.highScoreText = null;
    this.comboText = null;
    this.levelText = null;
    this.livesText = null;
    this.qualityText = null;
    this.timerText = null;
    this.feedbackText = null;
    this.feedbackTextLevel = null;
    
    // 添加提交状态标志
    this.isScoreSubmitted = false;
    
    // 游戏状态
    //this.isMobile = false;
    //this.scaleRatio = 1;
    this.gameTimer = 60;
    this.timerEvent = null;
    this.scaleRatio = Math.min(window.innerWidth / 9, window.innerHeight / 16) * 0.045;
    
    // 音效
    this.sounds = {};
    
    // 后端接口基础地址（可根据部署修改）。
    // 若页面与 PHP 在同域同目录，可留空字符串表示相对路径。
    this.apiBaseUrl = this.apiBaseUrl || '';
}
init() {
    this.isMobile = this.sys.game.device.os.android || 
                   this.sys.game.device.os.iOS;
    this.scaleRatio = Math.min(window.innerWidth / 9, window.innerHeight / 16) * 0.045;
}

create() {
    // 创建游戏界面
    this.createTopInfoBar();
    // 加载资源
    this.getHighScoreFromStorage();
    // 尝试从服务器加载排行榜（失败回退本地）
    this.loadHighScoresFromServer();
    
    // 初始化音频
    this.sounds.click = this.sound.add('click');
    this.sounds.perfectClick = this.sound.add('perfectClick');
    this.sounds.levelUp = this.sound.add('levelUp');
    this.sounds.fail = this.sound.add('fail');
 
    // 计算中心点坐标
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    
    // 创建主游戏元素
    
    
    // 添加小圈作为目标
    this.initialSmallRadius = 150 * this.scaleRatio; // 存储初始半径
    this.targetCircle = this.add.circle(centerX, centerY, this.initialSmallRadius, 0x00000, 0);
    this.targetCircle.setStrokeStyle(6, 0xffffff);
    
    // 修改大圈创建方式 - 仅保留圆周
    this.circle = this.add.circle(centerX, centerY, 210 * this.scaleRatio, 0x000000, 0); // 透明填充
    this.circle.setStrokeStyle(4, 0xff0000); // 红色圆周
    
    // 创建生命值显示
    this.createLivesDisplay();
    
    // 开始倒计时
    //this.startGameTimer();
    
    // 显示开始提示
    this.showStartPrompt();
    
    // 添加键盘支持（桌面端）
    if (!this.isMobile) {
        this.setupKeyboardControls();
    }
}
updateUI() {
    const hearts = '❤️'.repeat(this.lives) + '♡'.repeat(3 - this.lives);
    if (this.playerNameText) {
        this.playerNameText.setText(`玩家: ${this.playerName}`);
    }
    this.levelText.setText(`⭐${this.LevelName[this.level-1]}`);
    this.timerText.setText(`⏱${this.gameTimer}s`);
    this.currentScoreText.setText(`💯${this.currentScore}`);  
    this.comboText.setText(`🔥${this.combo}`);
    this.livesText.setText(hearts);
    
    // 连击数高亮
    if (this.combo >= 3) {
        this.comboText.setColor('#ff00ff');
    } else {
        this.comboText.setColor('#9b59b6');
    }
}


createTopInfoBar() {
    const centerX = this.cameras.main.width / 2; 
    const barHeight = 60 * this.scaleRatio; // 降低高度
    const startX = 10 * this.scaleRatio; // 减少起始间距
    
    // 更简洁的背景
    this.add.rectangle(centerX, barHeight/2, this.cameras.main.width, barHeight, 0x2ecc71, 0.3)
        .setStrokeStyle(1, 0x27ae60);
    
    // 使用图标+数值的紧凑布局
    let xPos = startX;
    const yPos = barHeight/2;
    const spacing = 90 * this.scaleRatio; // 减少间距

    this.playerNameText = this.add.text(
        10 * this.scaleRatio, 
        this.cameras.main.height - 10 * this.scaleRatio, 
        `玩家: ${this.playerName}`, 
        {
            fontSize: Math.floor(18 * this.scaleRatio) + 'px',
            fill: '#2c3e50'
        }
    ).setOrigin(0, 1);

    // 等级显示
    this.levelText = this.add.text(xPos, yPos, `⭐${this.LevelName[this.level-1]}`, { 
        fontSize: Math.floor(22 * this.scaleRatio) + 'px',
        fill: '#e67e22'
    }).setOrigin(0, 0.5);
    xPos += spacing;
    
    // 时间显示
    this.timerText = this.add.text(xPos, yPos, `  ⏱${this.gameTimer}s`, { 
        fontSize: Math.floor(22 * this.scaleRatio) + 'px',
        fill: '#3498db'
    }).setOrigin(0, 0.5);
    xPos += spacing;
    
    // 当前得分
    this.currentScoreText = this.add.text(xPos, yPos, `💯${this.currentScore}`, { 
        fontSize: Math.floor(22 * this.scaleRatio) + 'px',
        fill: '#2c3e50'
    }).setOrigin(0, 0.5);
    xPos += spacing;
    
    // 连击数
    this.comboText = this.add.text(xPos, yPos, `🔥${this.combo}`, { 
        fontSize: Math.floor(22 * this.scaleRatio) + 'px',
        fill: '#9b59b6'
    }).setOrigin(0, 0.5);
    xPos += spacing;
    
    // 生命值
    const hearts = '❤️'.repeat(this.lives) + '♡'.repeat(3 - this.lives);
    this.livesText = this.add.text(xPos, yPos, hearts, { 
        fontSize: Math.floor(22 * this.scaleRatio) + 'px',
        fill: '#e74c3c'
    }).setOrigin(0, 0.5);
    
    // 质量显示
    this.qualityText = this.add.text(xPos + spacing, yPos, '', { 
        fontSize: Math.floor(22 * this.scaleRatio) + 'px',
        fill: '#7f8c8d'
    }).setOrigin(0, 0.5);
    
    // 反馈文本
    const feedbackY = this.cameras.main.height * 0.25;
    this.feedbackText = this.add.text(centerX, feedbackY, '', {
        fontSize: Math.floor(32 * this.scaleRatio) + 'px', // 增大字号
        fill: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#eeeeee',
        padding: { x: 20, y: 10 },
        align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    

    this.feedbackTextLevel = this.add.text(centerX, yPos + 80 * this.scaleRatio, '', {
        fontSize: Math.floor(24 * this.scaleRatio) + 'px',
        fill: '#e67e22',
        fontStyle: 'bold',
        backgroundColor: '#eeeeee',
        padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setAlpha(0);


    this.leaderboardButton = this.add.text(
        this.cameras.main.width - 10 * this.scaleRatio,
        this.cameras.main.height - 10 * this.scaleRatio,
        '排行榜',
        {
            fontSize: Math.floor(18 * this.scaleRatio) + 'px',
            fill: '#3498db',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }
    ).setOrigin(1, 1)
    .setInteractive();

    this.leaderboardButton.on('pointerdown', () => {
        this.showLeaderboard();
    });

    this.instructionsText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 40 * this.scaleRatio,
        '游戏说明：点击屏幕在红圈缩小时与白圈重合以获得高分',
        {
            fontSize: Math.floor(16 * this.scaleRatio) + 'px',
            fill: '#2c3e50',
            fontStyle: 'italic'
        }
    ).setOrigin(0.5);
}

createLivesDisplay() {
    const heartX = 50 * this.scaleRatio;
    const heartY = 50 * this.scaleRatio;
}

startGameTimer() {
    // 如果游戏已经结束，不启动计时器
    if (this.isGameOver) {
        return;
    }
    
    if (!this.isTimerStarted) {
        this.isTimerStarted = true;
        // 在创建新事件前先清理可能存在的旧事件
        if (this.timerEvent) {
            this.time.removeEvent(this.timerEvent);
        }
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }
}

updateTimer() {
    // 添加检查确保游戏没有结束
    if (this.isGameOver) {
        return;
    }
    
    this.gameTimer--;
    this.timerText.setText(`  ⏱${this.gameTimer}s`);
    
    if (this.gameTimer <= 0) {
        this.endGame('时间到！');
    }
}
levelUp() {
    this.level++;
    this.levelText.setText(`⭐${this.LevelName[this.level-1]}`).setColor('#e67e22');
    this.showFeedbackLevel(`军衔提升！当前为${this.LevelName[this.level-1]}`, '#e67e22');
    this.cameras.main.shake(100, 0.01);
    
    // 播放升级音效
    if (this.sounds.levelUp) {
        this.sounds.levelUp.play();
    }
    
    if (this.level <= 3||this.level>=7&&this.level<=10||this.level>13) {
        this.shrinkSpeed += 5;
    } 
    else {
        const newRadius = Math.max(10, this.targetCircle.radius - 15 * this.scaleRatio);
        this.targetCircle.setRadius(newRadius);
    }
}


showStartPrompt() {
    const centerX = this.cameras.main.width /2;
    const centerY = this.cameras.main.height / 2 + 150 * this.scaleRatio;

    const startText = this.add.text(centerX, centerY, '🎯 点击屏幕开始训练！', { 
        fontSize: Math.floor(this.isMobile ? 36 : 40 * this.scaleRatio) + 'px', 
        fill: '#2c3e50',
        fontStyle: 'bold',
        backgroundColor: '#ecf0f1',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 闪烁动画
    this.tweens.add({
        targets: startText,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    this.input.once('pointerdown', () => {
        startText.destroy();
        this.startShrinking();
    });
}
setupKeyboardControls() {
    this.input.keyboard.on('keydown-SPACE', () => {
        // 如果正在显示排行榜，不处理空格键
        if (this.isShowingLeaderboard) {
            return;
        }
        
        // 如果是第一次按键，启动计时器
        if (!this.isTimerStarted && !this.isGameOver) {
            this.startGameTimer();
        }
        
        if (this.isShrinking) {
            this.onPointerDown({}, this.circle);
        }
    });
}// 替换原有的 showComboFeedback 方法
showComboFeedback() {
    // 只在连击数大于等于3时显示
    if (this.combo >= 3) {
        const comboText = `连击x${this.combo}`;
        
        // 创建一个新的文本对象用于显示连击信息，位置在屏幕右侧并竖直显示
        const comboFeedback = this.add.text(
            this.cameras.main.width - 30 * this.scaleRatio,     // 屏幕右侧
            this.cameras.main.height / 2,                       // 垂直居中
            comboText,
            {
                fontSize: Math.floor(20 * this.scaleRatio) + 'px',
                fill: '#ff00ff', // 粉色，与高亮连击数颜色一致
                fontStyle: 'bold',
                backgroundColor: '#eeeeee',
                padding: { x: 5, y: 10 }
            }
        ).setOrigin(0.5, 0.5); // 中心点锚点

        // 设置文本竖直显示
        comboFeedback.setAngle(90); // 旋转90度使文本竖直显示

        // 添加淡入淡出动画
        this.tweens.add({
            targets: comboFeedback,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            delay: 500,
            onComplete: () => {
                comboFeedback.destroy();
            }
        });
    }
}

missClick() {
    // 添加游戏状态检查，防止在游戏结束后继续处理
    if (this.isGameOver) {
        return;
    }
    
    this.lives--;
    this.updateLivesDisplay();
    this.combo = 0;
    
    console.log(`剩余生命:${this.lives}`); 
    // 播放失败音效
    if (this.sounds.fail) {
        this.sounds.fail.play();
    }
    
    if (this.comboText) {
        this.comboText.setText('🔥0').setColor('#9b59b6');
    }
    
    if (this.qualityText) {
        this.qualityText.setText('偏离太远!').setColor('#e74c3c');
    }
    
    this.showFeedback('点击偏离目标区域！-1生命', '#e74c3c');
    
    if (this.lives <= 0) {
        this.endGame('训练失败！');
    } else {
        this.resetCircle();
    }
}

// 修改 onPointerDown 方法，在开头添加额外的检查
onPointerDown(pointer) {
    // 如果正在显示排行榜，不处理点击事件
    if (this.isShowingLeaderboard) {
        return;
    }
    
    // 添加更多检查以防止重复触发
    if (!this.isTimerStarted && !this.isGameOver) {
        this.startGameTimer();
    }
    
    // 如果游戏已结束或圆圈未收缩，直接返回
    if (this.isGameOver || !this.isShrinking) {
        return;
    }
    
    // 额外检查确保不会在游戏结束后处理点击
    if (this.isGameOver) {
        // 清理所有可能的事件监听器
        this.input.off('pointerdown', this.onPointerDown, this);
        return;
    }
    
    // 计算当前大圆和小圆的半径比例
    const currentBigRadius = this.circle.radius * this.circle.scaleX;
    const currentSmallRadius = this.targetCircle.radius;
    const radiusRatio = currentBigRadius / currentSmallRadius;
    
    let points = 0;
    let quality = '';
    let textColor = '#7f8c8d';
    let feedback = '';
    
    // 根据半径比例判定
    if (radiusRatio >= 0.95 && radiusRatio <= 1.05) {
        points = 100 + (this.level * 10);
        quality = '完美!';
        textColor = '#27ae60';
        feedback = '优秀！时机完美！';
        this.combo++;
        
        // 播放完美点击音效
        if (this.sounds.perfectClick) {
            this.sounds.perfectClick.play();
        }
        
        if (this.combo >= 3) {
            this.showComboFeedback();
        }
    } 
    else if ((radiusRatio >= 0.85 && radiusRatio < 0.95) || 
             (radiusRatio > 1.05 && radiusRatio <= 1.15)) {
        points = 60 + (this.level * 5);
        quality = '良好';
        textColor = '#f39c12';
        feedback = '不错，接近完美时机！';
        if(this.combo%2)this.combo=(this.combo-1)/2;
        else this.combo/=2;
        
        // 播放普通点击音效
        if (this.sounds.click) {
            this.sounds.click.play();
        }
    }
    else if ((radiusRatio >= 0.75 && radiusRatio < 0.85) || 
             (radiusRatio > 1.15 && radiusRatio <= 1.25)) {
        points = Math.max(20, Math.floor(40 - Math.abs(radiusRatio - 1) * 40));
        quality = '普通';
        textColor = '#3498db';
        feedback = '时机把握还需练习！';
        this.combo-=2;
        
        // 播放普通点击音效
        if (this.sounds.click) {
            this.sounds.click.play();
        }
    }
    else { // 比例过远视为失败
        this.combo=0;
        this.missClick();
        return;
    }
    
    if(this.combo<=0)this.combo=0;
    if(this.combo>=10)points+=(this.level * 15);
    else if(this.combo>=6)points+=(this.level * 10);
    else if(this.combo>=3)points+=(this.level * 5);
    this.showFeedback(quality,textColor);
    this.updateScore(points, quality, textColor, feedback);
    this.time.delayedCall(200, this.resetCircle, [], this);
    this.isShrinking = false;
}

startShrinking() {
    this.isShrinking = true;
    // 在绑定新事件前先解绑旧事件，防止重复绑定
    this.input.off('pointerdown', this.onPointerDown, this);
    this.input.on('pointerdown', this.onPointerDown, this);
}

update(time, delta) {
    if (this.isShrinking && !this.isGameOver) {
        const scaleDelta = (this.shrinkSpeed / 1000) * (delta / 16.67);
        this.circle.scaleX -= scaleDelta;
        this.circle.scaleY -= scaleDelta;

        if (this.circle.scaleX <= 0.1) {
            // 修改为直接重置圆圈而不扣血
            this.resetCircle();
        }
    }
}


missClick() {
    this.lives--;
    this.updateLivesDisplay();
    this.combo = 0;
    
    console.log(`Input value:${this.lives}`); 
    // 播放失败音效
    if (this.sounds.fail) {
        this.sounds.fail.play();
    }
    
    if (this.comboText) {
        this.comboText.setText('🔥0').setColor('#9b59b6');
    }
    
    if (this.qualityText) {
        this.qualityText.setText('偏离太远!').setColor('#e74c3c');
    }
    
    this.showFeedback('点击偏离目标区域！-1生命', '#e74c3c');
    
    if (this.lives <= 0) {
        this.endGame('训练失败！');
    } else {
        this.resetCircle();
    }
    return;
}



resetCircle() {
    if (this.isGameOver) return;
    // 直接重置到最大尺寸，不视为失败
    this.circle.scaleX = 1;
    this.circle.scaleY = 1;
    this.isShrinking = true;
}

updateLivesDisplay() {
    const hearts = '❤️'.repeat(this.lives) + '♡'.repeat(3 - this.lives);
    this.livesText.setText(hearts);
}

resetGame() {
    // 清理游戏结束界面
    this.cleanupGameOverScreen();
    
    // 重置游戏状态
    this.isGameOver = false;
    this.isTimerStarted = false;
    this.currentScore = 0;
    this.combo = 0;
    this.level = 1;
    this.lives = 3;
    this.shrinkSpeed = 10;
    this.gameTimer = 60;
    this.targetCircle.setRadius(150 * this.scaleRatio);
    
    // 添加提交状态标志
    this.isScoreSubmitted = false;
    
    // 彻底清理计时器
    if (this.timerEvent) {
        this.time.removeEvent(this.timerEvent);
        this.timerEvent = null;
    }
    
    // 重置UI显示
    this.updateUI();
    
    // 重置游戏元素
    this.resetCircle();
    
    // 清理所有可能的旧事件监听器
    this.input.off('pointerdown', this.onPointerDown, this);
    
    // 重新绑定交互事件
    this.input.on('pointerdown', this.onPointerDown, this);
    
    // 重置计时器
    this.resetTimer();
    
    // 重新开始游戏
    this.startShrinking();
}

updateScore(points, quality, textColor, feedback) {
    this.currentScore += points;
    
    if (this.level < this.levelsc.length && this.currentScore >= this.levelsc[this.level - 1] && this.level <= 12) {
        this.levelUp();
    }

    // 添加null检查
    if (this.currentScoreText) {
        this.currentScoreText.setText(`💯${this.currentScore}`);
    }
    
    if (this.comboText) {
        if (this.combo >= 3) {
            this.comboText.setColor('#ff00ff');
        } else {
            this.comboText.setColor('#9b59b6');
        }
        this.comboText.setText(`🔥${this.combo}`);
    }

    if (this.highScoreText && this.currentScore > this.highScore) {
        this.highScore = this.currentScore;
        this.highScoreText.setText(this.highScore.toString()).setColor('#e74c3c');
        this.saveHighScore();
    }

    if (this.qualityText) {
        this.qualityText.setText(`  +${points}分`).setColor(textColor);
    }
    
    this.showFeedback(feedback, textColor);
}

// 修改 getHighScoreFromStorage 方法
getHighScoreFromStorage() {
    if (typeof Storage !== 'undefined') {
        const savedHighScore = localStorage.getItem('militaryTrainingHighScore');
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore);
        }
        
        // 同时加载排行榜数据
        this.loadHighScores();
    }
}

// 修改 saveHighScore 方法
saveHighScore() {
    if (typeof Storage !== 'undefined') {
        // 保存最高分
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            localStorage.setItem('militaryTrainingHighScore', this.highScore.toString());
        }
        
        // 保存到排行榜
        this.highScores.push({
            name: this.playerName,
            score: this.currentScore,
            date: new Date().toISOString()
        });
        
        // 只保留前100名
        this.highScores.sort((a, b) => b.score - a.score);
        if (this.highScores.length > 100) {
            this.highScores = this.highScores.slice(0, 100);
        }
        
        localStorage.setItem(
            'militaryTrainingLeaderboard', 
            JSON.stringify(this.highScores)
        );
    }
}


showFeedbackLevel(text, color) {
    if (!this.feedbackTextLevel) {
        console.warn('feedbackTextLevel not initialized');
        return;
    }
    
    // 先停止所有现有动画
    this.tweens.killTweensOf(this.feedbackTextLevel);
    
    // 重置文本状态
    this.feedbackTextLevel
        .setText(text)
        .setColor(color)
        .setAlpha(1)
        .setY(this.cameras.main.height * 0.80); // 确保位置正确
    
    // 添加新的淡出动画
    this.tweens.add({
        targets: this.feedbackTextLevel,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        delay: 500 // 显示500ms后再开始淡出
    });
}


showFeedback(text, color) {
    if (!this.feedbackText) {
        console.warn('feedbackText not initialized');
        return;
    }
    
    // 先停止所有现有动画
    this.tweens.killTweensOf(this.feedbackText);
    
    // 重置文本状态
    this.feedbackText
        .setText(text)
        .setColor(color)
        .setAlpha(1)
        .setY(this.cameras.main.height * 0.2); // 确保位置正确
    
    // 添加新的淡出动画
    this.tweens.add({
        targets: this.feedbackText,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        delay: 500 // 显示500ms后再开始淡出
    });
}




resetCircle() {
    if (this.isGameOver) return;
    
    this.circle.scaleX = 1;
    this.circle.scaleY = 1;
    this.circle.fillColor = 0xff0000;
    this.isShrinking = true;
}

resetTimer() {
    // 清理旧的计时器事件
    if (this.timerEvent) {
        this.time.removeEvent(this.timerEvent);
        this.timerEvent = null;
    }
    this.gameTimer = 60;
    this.timerText.setText(`  ⏱${this.gameTimer}s`);
    
    // 重新创建计时器事件
    this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
    });
}

// 修改 cleanupGameOverScreen 方法
cleanupGameOverScreen() {
    // 移除所有游戏结束界面元素
    if (this.gameOverElements.bg) this.gameOverElements.bg.destroy();
    if (this.gameOverElements.titleText) this.gameOverElements.titleText.destroy();
    if (this.gameOverElements.scoreText) this.gameOverElements.scoreText.destroy();
    if (this.gameOverElements.nameInput) this.gameOverElements.nameInput.destroy();
    if (this.gameOverElements.usernamePrompt) this.gameOverElements.usernamePrompt.destroy();
    if (this.gameOverElements.submitBtn) this.gameOverElements.submitBtn.destroy();
    if (this.gameOverElements.submitText) this.gameOverElements.submitText.destroy();
    if (this.gameOverElements.leaderboardBtn) this.gameOverElements.leaderboardBtn.destroy();
    if (this.gameOverElements.leaderboardText) this.gameOverElements.leaderboardText.destroy();
    if (this.gameOverElements.restartBtn) this.gameOverElements.restartBtn.destroy();
    if (this.gameOverElements.btnText) this.gameOverElements.btnText.destroy();
    if (this.gameOverElements.rankImage) this.gameOverElements.rankImage.destroy(); // 添加这一行
    if (this.gameOverdes.titleText) this.gameOverdes.titleText.destroy();
    
    // 重置引用
    this.gameOverElements = {
        bg: null,
        titleText: null,
        scoreText: null,
        nameInput: null,
        usernamePrompt: null,
        submitBtn: null,
        submitText: null,
        leaderboardBtn: null,
        leaderboardText: null,
        restartBtn: null,
        btnText: null,
        rankImage: null // 添加这一行
    };
    
    this.gameOverdes = {
        bg: null,
        titleText: null,
        scoreText: null,
        nameInput: null,
        submitBtn: null,
        submitText: null,
        leaderboardBtn: null,
        leaderboardText: null,
        restartBtn: null,
        btnText: null
    };
}

// 添加文本换行辅助方法
wrapText(text, maxWidth) {
    // 使用 Phaser 的内置换行功能
    return text;
}

// 修改 endGame 方法中的文字大小和位置
endGame(reason) {
    // 如果游戏已经结束，直接返回
    if (this.isGameOver) {
        return;
    }

    this.lives = 3;
    // 清理倒计时事件
    this.leaderboardButton.setInteractive(true);

    // 确保彻底清理计时器
    if (this.timerEvent) {
        this.time.removeEvent(this.timerEvent);
        this.timerEvent = null;
    }
    this.isTimerStarted = false;
    
    this.isGameOver = true;
    this.isShrinking = false;
    
    // 清理所有输入事件监听器
    this.input.off('pointerdown', this.onPointerDown, this);
    if (this.circle) {
        this.circle.disableInteractive();
    }
    
    // 如果有键盘控制，也需要清理
    if (this.input.keyboard) {
        this.input.keyboard.off('keydown-SPACE');
    }
    
    // 获取屏幕尺寸
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // 创建全屏半透明背景
    this.gameOverElements.bg = this.add.rectangle(
        centerX, centerY, 
        screenWidth, screenHeight, 
        0x000000, 0.7
    ).setDepth(1000); // 设置高深度值确保在最上层
    
    // 创建游戏结束标题（放大文字并上移）
    this.gameOverElements.titleText = this.add.text(
        centerX, centerY - 150, 
        `训练结束\n当前军衔为: ${this.LevelName[this.level-1]}`, 
        {
            fontSize: '70px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#8B4513',
            strokeThickness: 6,
            align: 'center'
        }
    ).setOrigin(0.5).setDepth(1001);

    const rankIndex = Math.min(this.level - 1, 12); // 确保索引不超过12
    // 上移军衔图片
    this.gameOverElements.rankImage = this.add.image(
        centerX, 
        centerY - 690, 
        `rank-${rankIndex}`
    ).setDepth(1001);

    // 根据需要调整图片大小
    this.gameOverElements.rankImage.setScale(0.8); // 稍微增大图片
    
    // 修改军衔描述显示，支持多行文本（放大文字并上移）
    this.gameOverdes.titleText = this.add.text(
        centerX, centerY - 450, 
        `${this.leveldesc[this.level-1]}`, 
        {
            fontSize: '48px',  // 增大字体
            fontFamily: 'Arial',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 700, useAdvancedWrap: true },  // 增加换行宽度
            lineSpacing: 12  // 增加行间距
        }
    ).setOrigin(0.5).setDepth(1001);

    // 创建得分显示（放大文字）
    this.gameOverElements.scoreText = this.add.text(
        centerX, centerY + 50, 
        `最终得分: ${this.currentScore}`, 
        {
            fontSize: '52px',
            color: '#4cd964',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5).setDepth(1001);
    
    const buttonSpacing = 75 * this.scaleRatio;

    // 添加提示文字"请输入用户名"（放大文字）
    this.gameOverElements.usernamePrompt = this.add.text(
        centerX,
        centerY + 130,
        '请输入用户名',
        {
            fontSize: Math.floor(26 * this.scaleRatio) + 'px',
            fill: '#7f8c8d',
            fontStyle: 'italic'
        }
    ).setOrigin(0.5).setDepth(1001);

    // 用户名输入框 - 正确加载保存的用户名（调整位置和大小）
    this.gameOverElements.nameInput = this.add.dom(
        centerX - 155,
        centerY + 180,
        'input',
        {
            type: 'text',
            placeholder: '输入你的名字',
            value: '', // 初始为空
            style: `
                width: ${570 * this.scaleRatio}px; 
                height: ${30 * this.scaleRatio}px; 
                font-size: ${16 * this.scaleRatio}px; 
                text-align: center;
                background-color: white;
                border: 3px solid #3498db;
                border-radius: 8px;
                padding: 8px;
                color: #2c3e50;
                outline: none;
            `
        }
    ).setDepth(1001);

    // 在DOM元素创建后设置值
    this.time.delayedCall(100, () => {
        if (this.gameOverElements.nameInput && this.gameOverElements.nameInput.node) {
            const inputElement = this.gameOverElements.nameInput.node;
            // 只有当用户名不是默认值时才填充
            if (this.playerName && this.playerName !== '匿名玩家') {
                inputElement.value = this.playerName;
            }
        }
    });

    // 强制显示输入框
    const inputElement = this.gameOverElements.nameInput.node;

    // 确保输入框可见
    inputElement.style.zIndex = '1001';
    inputElement.style.position = 'absolute';
    inputElement.style.display = 'block';

    // 确保输入框附加到DOM
    if (!document.body.contains(this.gameOverElements.nameInput.node)) {
        document.body.appendChild(this.gameOverElements.nameInput.node);
    }

    this.gameOverElements.nameInput.setInteractive();
    this.gameOverElements.nameInput.setScrollFactor(0);
    
    if (this.isMobile) {
        this.gameOverElements.nameInput.node.style.fontSize = '40px';
        this.gameOverElements.nameInput.node.style.height = '85px';
    }

    // 提交按钮（放大按钮和文字）
    this.gameOverElements.submitBtn = this.add.rectangle(
        centerX, 
        centerY + 160 + buttonSpacing, 
        270 * this.scaleRatio, 
        55 * this.scaleRatio, 
        0x4CAF50
    )
    .setInteractive()
    .setDepth(1001);
    this.gameOverElements.submitText = this.add.text(
        centerX, 
        centerY + 160 + buttonSpacing, 
        '提交分数', 
        { 
            fontSize: Math.floor(26 * this.scaleRatio) + 'px', 
            color: '#FFFFFF',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5).setDepth(1001);
    
    if (this.isScoreSubmitted) {
        this.gameOverElements.submitBtn.setFillStyle(0xCCCCCC); // 更改按钮颜色为灰色
        this.gameOverElements.submitText.setText('已提交');
    }
    
    // 排行榜按钮（放大按钮和文字）
    this.gameOverElements.leaderboardBtn = this.add.rectangle(
        centerX, 
        centerY + 160 + buttonSpacing * 2, 
        270 * this.scaleRatio, 
        55 * this.scaleRatio, 
        0x2196F3
    )
    .setInteractive()
    .setDepth(1001);

    this.gameOverElements.leaderboardText = this.add.text(
        centerX, 
        centerY + 160 + buttonSpacing * 2, 
        '查看排行榜', 
        { 
            fontSize: Math.floor(26 * this.scaleRatio) + 'px', 
            color: '#FFFFFF',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5).setDepth(1001);

    // 重新训练按钮（放大按钮和文字）
    this.gameOverElements.restartBtn = this.add.rectangle(
        centerX, 
        centerY + 160 + buttonSpacing * 3, 
        270 * this.scaleRatio, 
        55 * this.scaleRatio, 
        0x556B2F
    )
    .setInteractive()
    .setDepth(1001);

    this.gameOverElements.btnText = this.add.text(
        centerX, 
        centerY + 160 + buttonSpacing * 3, 
        '重新训练', 
        { 
            fontSize: Math.floor(26 * this.scaleRatio) + 'px', 
            color: '#FFFFFF',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5).setDepth(1001);
    
    // 修改 endGame 方法中的提交按钮事件，添加用户名长度验证
    this.gameOverElements.submitBtn.on('pointerdown', () => {
        // 检查是否已经提交过分数
        if (this.isScoreSubmitted) {
            return; // 如果已经提交过，直接返回
        }
        
        const inputElement = this.gameOverElements.nameInput.node;
        const username = inputElement.value.trim(); // 去除首尾空格
        
        // 验证用户名长度
        if (username.length <= 0 || username.length > 15) {
            // 显示错误提示在最前面
            this.showFeedback('用户名长度不合理，需要1-15个字符之间', '#e74c3c');
            // 确保反馈文本在最前面显示
            if (this.feedbackText) {
                this.feedbackText.setDepth(1002); // 设置更高的深度值确保在最前面
            }
            return;
        }
        
        if (username) {
            // 设置提交状态标志
            this.isScoreSubmitted = true;
            
            // 更改按钮外观以表示已提交
            this.gameOverElements.submitBtn.setFillStyle(0xCCCCCC); // 更改按钮颜色为灰色
            this.gameOverElements.submitText.setText('已提交').setColor('#666666');
            
            this.playerName = username; // 更新玩家名称变量
            this.saveHighScore();
            this.showLeaderboard();
        }
    });
    
    this.gameOverElements.leaderboardBtn.on('pointerdown', () => {
        this.showLeaderboard();
    });
    
    this.gameOverElements.restartBtn.on('pointerdown', () => {
        this.cleanupGameOverScreen();
        this.resetGame();
    });
}

hideGameOverScreen() {
    // 隐藏游戏结束界面的所有元素
    if (this.gameOverElements.bg) this.gameOverElements.bg.setVisible(false);
    if (this.gameOverElements.titleText) this.gameOverElements.titleText.setVisible(false);
    if (this.gameOverElements.scoreText) this.gameOverElements.scoreText.setVisible(false);
    if (this.gameOverElements.nameInput) this.gameOverElements.nameInput.setVisible(false);
    if (this.gameOverElements.usernamePrompt) this.gameOverElements.usernamePrompt.setVisible(false);
    if (this.gameOverElements.submitBtn) this.gameOverElements.submitBtn.setVisible(false);
    if (this.gameOverElements.submitText) this.gameOverElements.submitText.setVisible(false);
    if (this.gameOverElements.leaderboardBtn) this.gameOverElements.leaderboardBtn.setVisible(false);
    if (this.gameOverElements.leaderboardText) this.gameOverElements.leaderboardText.setVisible(false);
    if (this.gameOverElements.restartBtn) this.gameOverElements.restartBtn.setVisible(false);
    if (this.gameOverElements.btnText) this.gameOverElements.btnText.setVisible(false);
    if (this.gameOverElements.rankImage) this.gameOverElements.rankImage.setVisible(false);
    if (this.gameOverdes.titleText) this.gameOverdes.titleText.setVisible(false);
}

// 添加 showGameOverScreen 方法
showGameOverScreen() {
    // 显示游戏结束界面的所有元素
    if (this.gameOverElements.bg) this.gameOverElements.bg.setVisible(true);
    if (this.gameOverElements.titleText) this.gameOverElements.titleText.setVisible(true);
    if (this.gameOverElements.scoreText) this.gameOverElements.scoreText.setVisible(true);
    if (this.gameOverElements.nameInput) this.gameOverElements.nameInput.setVisible(true);
    if (this.gameOverElements.usernamePrompt) this.gameOverElements.usernamePrompt.setVisible(true);
    if (this.gameOverElements.submitBtn) this.gameOverElements.submitBtn.setVisible(true);
    if (this.gameOverElements.submitText) this.gameOverElements.submitText.setVisible(true);
    if (this.gameOverElements.leaderboardBtn) this.gameOverElements.leaderboardBtn.setVisible(true);
    if (this.gameOverElements.leaderboardText) this.gameOverElements.leaderboardText.setVisible(true);
    if (this.gameOverElements.restartBtn) this.gameOverElements.restartBtn.setVisible(true);
    if (this.gameOverElements.btnText) this.gameOverElements.btnText.setVisible(true);
    if (this.gameOverElements.rankImage) this.gameOverElements.rankImage.setVisible(true);
    if (this.gameOverdes.titleText) this.gameOverdes.titleText.setVisible(true);
}
// 修改 showLeaderboard 方法
showLeaderboard() {
    // 禁用排行榜按钮防止重复点击
    this.leaderboardButton.disableInteractive();
    
    // 暂停游戏计时器
    if (this.timerEvent) {
        this.timerEvent.paused = true;
    }
    
    // 设置标志位，表示正在显示排行榜
    this.isShowingLeaderboard = true;
    
    // 暂停圆圈动画
    this.wasShrinking = this.isShrinking; // 保存当前收缩状态
    this.isShrinking = false; // 暂停圆圈收缩
    
    // 隐藏游戏结束界面
    this.hideGameOverScreen();
    
    // 加载排行榜数据（优先服务器，失败本地）
    this.loadHighScoresFromServer(() => {
        // 服务器失败时回退本地
        this.loadHighScores();
    });
    
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 创建排行榜背景
    this.leaderboardElements.bg = this.add.rectangle(
        centerX, centerY, 600, 500, 0x000000, 0.8
    ).setStrokeStyle(3, 0x8B4513).setDepth(1000);
    
    // 排行榜标题
    this.leaderboardElements.title = this.add.text(
        centerX, centerY - 200, '排行榜', 
        { fontSize: '48px', color: '#FFD700' }
    ).setOrigin(0.5).setDepth(1001);
    
    // 显示前10名分数
    for (let i = 0; i < Math.min(10, this.highScores.length); i++) {
        const score = this.highScores[i];
        this.leaderboardElements[`score${i}`] = this.add.text(
            centerX, 
            centerY - 150 + (i * 40), 
            `${i+1}. ${score.name}: ${score.score}`, 
            { fontSize: '24px', color: '#FFFFFF' }
        ).setOrigin(0.5).setDepth(1001);
    }
    
    // 返回按钮
    this.leaderboardElements.backBtn = this.add.rectangle(
        centerX, centerY + 270, 200, 50, 0x556B2F
    ).setInteractive().setDepth(1001);
    
    this.leaderboardElements.backText = this.add.text(
        centerX, centerY + 270, '返回', 
        { fontSize: '24px', color: '#FFFFFF' }
    ).setOrigin(0.5).setDepth(1001);
    
    this.leaderboardElements.backBtn.on('pointerdown', () => {
        this.cleanupLeaderboard();
        // 显示游戏结束界面
        this.showGameOverScreen();
        // 重新启用排行榜按钮
        this.leaderboardButton.setInteractive(true);
        
        // 恢复游戏计时器
        if (this.timerEvent) {
            this.timerEvent.paused = false;
        }
        
        // 恢复圆圈动画
        this.isShrinking = this.wasShrinking;
        
        // 重置标志位
        this.isShowingLeaderboard = false;
    });
}
// 从服务器加载排行榜数据（带本地回退）
loadHighScoresFromServer(fallback) {
    const base = (this.apiBaseUrl || '').replace(/\/$/, '');
    const url = base ? `${base}/leaderboard.php` : 'leaderboard.php';
    fetch(url, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.highScores = (data && Array.isArray(data.scores)) ? data.scores : [];
            this.highScores.sort((a, b) => b.score - a.score);
        })
        .catch(error => {
            console.error('加载排行榜数据失败:', error);
            if (typeof fallback === 'function') {
                fallback();
            } else {
                this.loadHighScores();
            }
        });
}

// 保存分数到服务器
saveHighScoreToServer(entry) {
    const base = (this.apiBaseUrl || '').replace(/\/$/, '');
    const url = base ? `${base}/leaderboard.php` : 'leaderboard.php';
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    });
}
loadHighScores() {
    if (typeof Storage !== 'undefined') {
        const savedScores = localStorage.getItem('militaryTrainingLeaderboard');
        if (savedScores) {
            this.highScores = JSON.parse(savedScores);
        }
    }
    // 本地排序作为兜底
    this.highScores.sort((a, b) => b.score - a.score);
}

saveHighScore() {
    const entry = {
        name: this.playerName,
        score: this.currentScore,
        date: new Date().toISOString()
    };
    // 先写到服务器，失败再回退到本地
    this.saveHighScoreToServer(entry)
        .then(() => {
            // 成功后刷新排行榜
            this.loadHighScoresFromServer();
        })
        .catch(() => {
            // 服务器失败则写入本地
            this.highScores.push(entry);
            if (typeof Storage !== 'undefined') {
                localStorage.setItem(
                    'militaryTrainingLeaderboard', 
                    JSON.stringify(this.highScores)
                );
            }
        });
}

cleanupLeaderboard() {
    // 移除排行榜界面元素
    if (this.leaderboardElements.bg) this.leaderboardElements.bg.destroy();
    if (this.leaderboardElements.title) this.leaderboardElements.title.destroy();
    
    for (let i = 0; i < 10; i++) {
        if (this.leaderboardElements[`score${i}`]) {
            this.leaderboardElements[`score${i}`].destroy();
        }
    }
    
    if (this.leaderboardElements.backBtn) this.leaderboardElements.backBtn.destroy();
    if (this.leaderboardElements.backText) this.leaderboardElements.backText.destroy();
    
    this.leaderboardElements = {};
}

}

// Phaser游戏配置
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#9bd4ff',
    scene: [BootScene, StandAtEaseScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    audio: {
        disableWebAudio: false
    },
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1200,
        height: 1600
    }
};

// 初始化游戏
const game = new Phaser.Game(config);
document.getElementById('game-container').style.overflow = 'visible';
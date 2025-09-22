document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('game-grid');
    const scoreDisplay = document.getElementById('score-display');
    const bestScoreDisplay = document.getElementById('best-score-display'); // 新增
    const gameMessage = document.getElementById('game-message');
    const messageText = document.getElementById('message-text');
    const restartButton = document.getElementById('restart-button');
    const tryAgainButton = document.getElementById('try-again-button');
    const undoButton = document.getElementById('undo-button');
    const ranksList = document.getElementById('ranks-list');
    const rankModal = document.getElementById('rank-modal');
    const rankModalTitle = document.getElementById('rank-modal-title');
    const rankModalDescription = document.getElementById('rank-modal-description');
    const rankModalClose = document.getElementById('rank-modal-close');
    
    // 军衔映射表 - 对应2048数值
    const rankMap = {
        2: '列兵',
        4: '军士',
        8: '少尉',
        16: '中尉',
        32: '上尉',
        64: '少校',
        128: '中校',
        256: '上校',
        512: '少将',
        1024: '中将',
        2048: '上将',
        4096: '上将+1',
        8192: '上将+2',
        16384: '上将+3',
        32768: '上将+4',
        65536: '上将+5',
        131072: '上将+6',
    };
    
    // 军衔描述信息
    const rankDescriptions = {
        2: "列兵：最低士兵衔，新兵入伍授予，基础训练阶段。你已习惯军训的作息，学的倒是不慢，继续加油",
        4: "军士：军士初级衔，班长或技术岗位，服役满三年。你担任了军训管理的职责，帮助教官指导其他学生，但你仍需继续学习",
        8: "少尉：军官最低阶，排职干部，军校毕业授予。军训过去小半，你挺拔的身姿和生风的步伐赢得了全排学生的赞叹与敬佩",
        16: "中尉：少尉满两年晋升，副连职或技术军官。教官推荐你去别的排进行军训表演，你被更多人赞叹了！",
        32: "上尉：中尉满三年晋升，连职主官或机关参谋。军训过半，你已是全营的风云人物，继续晋升吧！",
        64: "少校：上尉满四年晋升，营职主官或机关科长。不可思议！训练使你反应迅速，像是真正的军人！",
        128: "中校：少校满四年晋升，团副职或正营职军官。大局观日益重要。你的专注力和快速反应能力大幅提高，这与整体训练成效密不可分。",
        256: "上校：中校满四年晋升，团职主官或师旅副职。汇演在即，每个排都需要为整体荣誉而努力。你必须和其他同学目标一致，才能成功。",
        512: "少将：将官初级，副战区职，肩章一星金枝叶。战略思维开始体现，需要分析、判断和决策。你参加的拉练活动和定向越野，正需要这样的智慧与魄力。",
        1024: "中将：正战区职或副战区职，肩章两星金枝叶。明天将是最终检验，所有的汗水与努力都将汇聚成一场精彩的演出，需要你像将领一样沉稳指挥自己的身体部队",
        2048: "上将：最高常设军衔，战区正职，肩章三星金枝叶。阅兵日！你是接受检阅的“士兵将军”！坚持到最后，你收获了钢铁般的意志、深厚的友谊和无比的骄傲。恭喜你，圆满完成军训这门大学第一课！",
    };
    
    let grid = [];
    let score = 0;
    let bestScore = 0; // 新增变量记录最高分
    let gameOver = false;
    let gameWon = false;
    let moved = false;
    let previousGrid = [];
    let previousScore = 0;
    let maxUnlockedRank = 2; // 初始解锁列兵
    
    // 初始化游戏
    function initGame() {
        createGrid();
        score = 0;
        gameOver = false;
        gameWon = false;
        
        // 从 localStorage 恢复最高分
        const savedBestScore = localStorage.getItem('bestScore');
        if (savedBestScore) {
            bestScore = parseInt(savedBestScore);
        }
        
        // 从 localStorage 恢复最大解锁军衔
        const savedMaxUnlockedRank = localStorage.getItem('maxUnlockedRank');
        if (savedMaxUnlockedRank) {
            maxUnlockedRank = Math.max(maxUnlockedRank, parseInt(savedMaxUnlockedRank));
        }
        
        scoreDisplay.textContent = '分数: 0';
        bestScoreDisplay.textContent = `最高分: ${bestScore}`; // 显示最高分
        gameMessage.style.display = 'none';
        
        // 关闭可能打开的军衔介绍弹窗
        closeRankModal();
        
        // 添加两个初始方块
        addRandomTile();
        addRandomTile();
        
        updateView();
        updateRanksDisplay();
    }

    
    // 创建网格
    function createGrid() {
        grid = [];
        for (let i = 0; i < 4; i++) {
            grid[i] = [];
            for (let j = 0; j < 4; j++) {
                grid[i][j] = 0;
            }
        }
        
        // 创建网格UI
        gameGrid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                gameGrid.appendChild(cell);
            }
        }
    }
    
    // 添加随机方块
    function addRandomTile() {
        const emptyCells = [];
        
        // 找出所有空单元格
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90%概率生成2(列兵)，10%概率生成4(军士)
            grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    // 更新视图
    function updateView() {
        const cells = document.querySelectorAll('.grid-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = grid[row][col];
            
            // 清空单元格
            cell.innerHTML = '';
            
            if (value !== 0) {
                const tile = document.createElement('div');
                tile.classList.add('tile', `tile-${value}`);
                // 显示军衔名称而不是数值
                tile.textContent = rankMap[value] || value;
                cell.appendChild(tile);
            }
        });
        
        // 更新分数显示
        scoreDisplay.textContent = `分数: ${score}`;
        
        // 检查并更新最高分
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
            bestScoreDisplay.textContent = `最高分: ${bestScore}`;
        }
        
        // 更新军衔解锁状态
        updateMaxUnlockedRank();
        updateRanksDisplay();
    }
    
    // 更新最大解锁军衔
    function updateMaxUnlockedRank() {
        let updated = false;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] > maxUnlockedRank) {
                    maxUnlockedRank = grid[i][j];
                    updated = true;
                }
            }
        }
        
        // 如果有更新，保存到 localStorage
        if (updated) {
            localStorage.setItem('maxUnlockedRank', maxUnlockedRank.toString());
            updateRanksDisplay(); // 重新更新显示
        }
    }
    
    // 更新军衔展示
    function updateRanksDisplay() {
        ranksList.innerHTML = '';
        
        // 按数值顺序显示所有军衔
        const rankValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
        
        rankValues.forEach(value => {
            const rankName = rankMap[value];
            if (rankName) { // 确保军衔存在
                const rankItem = document.createElement('div');
                rankItem.classList.add('rank-item');
                rankItem.textContent = rankName;
                rankItem.dataset.value = value;
                
                // 根据是否解锁设置样式
                if (value <= maxUnlockedRank) {
                    rankItem.classList.add('unlocked');
                } else {
                    rankItem.classList.add('locked');
                }
                
                // 添加点击事件
                rankItem.addEventListener('click', () => {
                    if (value <= maxUnlockedRank) {
                        showRankDescription(rankName, rankDescriptions[value]);
                    }
                });
                
                ranksList.appendChild(rankItem);
            }
        });
    }
    
    // 显示军衔介绍
    function showRankDescription(title, description) {
        rankModalTitle.textContent = title;
        rankModalDescription.textContent = description;
        rankModal.style.display = 'flex';
    }
    
    // 关闭军衔介绍弹窗
    function closeRankModal() {
        rankModal.style.display = 'none';
    }
    
    // 移动方块
    function move(direction) {
        if (gameOver) return;
        
        // 保存当前状态用于撤销
        saveState();
        
        moved = false;
        
        // 根据方向处理移动
        switch(direction) {
            case 'up':
                moveUp();
                break;
            case 'down':
                moveDown();
                break;
            case 'left':
                moveLeft();
                break;
            case 'right':
                moveRight();
                break;
        }
        
        if (moved) {
            addRandomTile();
            updateView();
            checkGameStatus();
        }
    }
    
    // 向上移动
    function moveUp() {
        for (let j = 0; j < 4; j++) {
            for (let i = 1; i < 4; i++) {
                if (grid[i][j] !== 0) {
                    let row = i;
                    while (row > 0) {
                        if (grid[row-1][j] === 0) {
                            grid[row-1][j] = grid[row][j];
                            grid[row][j] = 0;
                            row--;
                            moved = true;
                        } else if (grid[row-1][j] === grid[row][j]) {
                            grid[row-1][j] *= 2;
                            score += grid[row-1][j];
                            grid[row][j] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        updateScore();
    }
    
    // 向下移动
    function moveDown() {
        for (let j = 0; j < 4; j++) {
            for (let i = 2; i >= 0; i--) {
                if (grid[i][j] !== 0) {
                    let row = i;
                    while (row < 3) {
                        if (grid[row+1][j] === 0) {
                            grid[row+1][j] = grid[row][j];
                            grid[row][j] = 0;
                            row++;
                            moved = true;
                        } else if (grid[row+1][j] === grid[row][j]) {
                            grid[row+1][j] *= 2;
                            score += grid[row+1][j];
                            grid[row][j] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        updateScore();
    }
    
    // 向左移动
    function moveLeft() {
        for (let i = 0; i < 4; i++) {
            for (let j = 1; j < 4; j++) {
                if (grid[i][j] !== 0) {
                    let col = j;
                    while (col > 0) {
                        if (grid[i][col-1] === 0) {
                            grid[i][col-1] = grid[i][col];
                            grid[i][col] = 0;
                            col--;
                            moved = true;
                        } else if (grid[i][col-1] === grid[i][col]) {
                            grid[i][col-1] *= 2;
                            score += grid[i][col-1];
                            grid[i][col] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        updateScore();
    }
    
    // 向右移动
    function moveRight() {
        for (let i = 0; i < 4; i++) {
            for (let j = 2; j >= 0; j--) {
                if (grid[i][j] !== 0) {
                    let col = j;
                    while (col < 3) {
                        if (grid[i][col+1] === 0) {
                            grid[i][col+1] = grid[i][col];
                            grid[i][col] = 0;
                            col++;
                            moved = true;
                        } else if (grid[i][col+1] === grid[i][col]) {
                            grid[i][col+1] *= 2;
                            score += grid[i][col+1];
                            grid[i][col] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        updateScore();
    }
    
    // 更新分数显示和最高分
    function updateScore() {
        scoreDisplay.textContent = `分数: ${score}`;
        
        // 检查并更新最高分
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
            bestScoreDisplay.textContent = `最高分: ${bestScore}`;
        }
    }
    
// 修改 checkGameStatus 函数
function checkGameStatus() {
    // 检查是否达到最高军衔
    let maxRankReached = 0;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] > maxRankReached) {
                maxRankReached = grid[i][j];
            }
            
            // 当首次达到2048时显示获胜消息但允许继续游戏
            if (grid[i][j] === 2048 && !gameWon) {
                gameWon = true;
                showMessage('恭喜晋升为上将！', false);
                // 3秒后自动隐藏消息，允许继续游戏
                setTimeout(() => {
                    if (gameMessage.style.display === 'flex') {
                        gameMessage.style.display = 'none';
                    }
                }, 3000);
            }
        }
    }
    
    // 检查是否还有空单元格
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                return;
            }
        }
    }
    
    // 检查是否还有可合并的方块
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i < 3 && grid[i][j] === grid[i+1][j]) ||
                (j < 3 && grid[i][j] === grid[i][j+1])) {
                return;
            }
        }
    }
    
    // 如果没有空单元格且没有可合并的方块，游戏结束
    gameOver = true;
    showMessage('训练结束！', true);
}
    
    // 显示消息
    function showMessage(text, isGameOver) {
        messageText.textContent = text;
        gameMessage.style.display = 'flex';
        
        if (!isGameOver) {
            tryAgainButton.style.display = 'none';
        } else {
            tryAgainButton.style.display = 'block';
        }
    }
    
    // 保存状态用于撤销
    function saveState() {
        previousScore = score;
        previousGrid = JSON.parse(JSON.stringify(grid));
    }
    
    // 撤销操作
    function undo() {
        if (previousGrid.length === 0) return;
        
        grid = JSON.parse(JSON.stringify(previousGrid));
        score = previousScore;
        scoreDisplay.textContent = `分数: ${score}`;
        gameOver = false;
        gameMessage.style.display = 'none';
        updateView();
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        switch(e.key) {
            case 'ArrowUp':
                move('up');
                break;
            case 'ArrowDown':
                move('down');
                break;
            case 'ArrowLeft':
                move('left');
                break;
            case 'ArrowRight':
                move('right');
                break;
        }
    });
    
    // 触摸控制
    let touchStartX, touchStartY, touchEndX, touchEndY;
    
    gameGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    gameGrid.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (dx > 0) {
                move('right');
            } else {
                move('left');
            }
        } else {
            // 垂直滑动
            if (dy > 0) {
                move('down');
            } else {
                move('up');
            }
        }
    }, false);
    
    // 按钮事件
    restartButton.addEventListener('click', initGame);
    tryAgainButton.addEventListener('click', initGame);
    undoButton.addEventListener('click', undo);
    
    // 军衔介绍弹窗关闭事件
    rankModalClose.addEventListener('click', closeRankModal);
    rankModal.addEventListener('click', (e) => {
        if (e.target === rankModal) {
            closeRankModal();
        }
    });
    
    // 初始化游戏
    initGame();
});
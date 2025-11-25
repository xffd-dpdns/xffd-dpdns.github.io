// 实用工具箱 JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all utility functions
    initCalculator();
    initUnitConverter();
    initTextFormatter();
    initSmoothScrolling();
    
    // Initialize games
    setTimeout(() => {
        init2048Game();
        initMemoryGame();
        initGuessGame();
    }, 100); // Short delay to ensure DOM is fully rendered
});

/**
 * 计算器功能
 */
function initCalculator() {
    const display = document.getElementById('calc-display');
    const buttons = document.querySelectorAll('.calc-btn');
    let currentValue = '0';
    let previousValue = null;
    let operator = null;
    let shouldResetDisplay = false;
    
    // Add event listeners to calculator buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            handleButtonClick(value);
        });
    });
    
    // Add keyboard support
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        
        // Numbers 0-9
        if (/^[0-9]$/.test(key)) {
            handleButtonClick(key);
        }
        // Decimal point
        else if (key === '.') {
            handleButtonClick('.');
        }
        // Operators
        else if (['+', '-', '*', '/', '='].includes(key)) {
            handleButtonClick(key);
        }
        // Enter key (equals)
        else if (key === 'Enter') {
            handleButtonClick('=');
        }
        // Backspace (delete)
        else if (key === 'Backspace') {
            handleButtonClick('delete');
        }
        // Escape (clear)
        else if (key === 'Escape') {
            handleButtonClick('clear');
        }
        // Parentheses
        else if (key === '(' || key === ')') {
            handleButtonClick(key);
        }
    });
    
    function handleButtonClick(value) {
        // Clear button
        if (value === 'clear') {
            currentValue = '0';
            previousValue = null;
            operator = null;
            updateDisplay();
            return;
        }
        
        // Delete button
        if (value === 'delete') {
            if (currentValue.length > 1) {
                currentValue = currentValue.slice(0, -1);
            } else {
                currentValue = '0';
            }
            updateDisplay();
            return;
        }
        
        // Operator buttons
        if (['+', '-', '*', '/'].includes(value)) {
            if (operator && !shouldResetDisplay) {
                // If an operator is already set and we're not resetting, calculate first
                calculate();
            }
            
            previousValue = currentValue;
            operator = value;
            shouldResetDisplay = true;
            return;
        }
        
        // Equals button
        if (value === '=') {
            if (operator) {
                calculate();
                operator = null;
                previousValue = null;
            }
            return;
        }
        
        // Decimal point
        if (value === '.') {
            if (shouldResetDisplay) {
                currentValue = '0.';
                shouldResetDisplay = false;
            } else if (!currentValue.includes('.')) {
                currentValue += '.';
            }
            updateDisplay();
            return;
        }
        
        // Parentheses
        if (value === '(' || value === ')') {
            if (shouldResetDisplay) {
                currentValue = value;
                shouldResetDisplay = false;
            } else {
                currentValue += value;
            }
            updateDisplay();
            return;
        }
        
        // Number buttons
        if (!isNaN(value) || value === '0') {
            if (shouldResetDisplay) {
                currentValue = value;
                shouldResetDisplay = false;
            } else {
                if (currentValue === '0') {
                    currentValue = value;
                } else {
                    currentValue += value;
                }
            }
            updateDisplay();
            return;
        }
    }
    
    function calculate() {
        try {
            // Use Function constructor for safer expression evaluation than eval
            const result = new Function(`return ${parseFloat(previousValue)} ${operator} ${parseFloat(currentValue)}`)();
            
            // Format large numbers and avoid scientific notation for numbers with many decimal places
            if (Math.abs(result) >= 1e10) {
                currentValue = result.toExponential(6);
            } else {
                // Round to avoid floating point precision issues
                currentValue = parseFloat(result.toFixed(10)).toString();
            }
            
            shouldResetDisplay = true;
            updateDisplay();
        } catch (error) {
            currentValue = 'Error';
            updateDisplay();
            setTimeout(() => {
                currentValue = '0';
                updateDisplay();
            }, 1000);
        }
    }
    
    function updateDisplay() {
        display.value = currentValue;
        // Add aria-live notification for screen readers
        display.setAttribute('aria-label', 'Calculator display shows ' + currentValue);
    }
}

/**
 * 单位转换器功能
 */
function initUnitConverter() {
    const converterType = document.getElementById('converter-type');
    const inputValue = document.getElementById('input-value');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const outputValue = document.getElementById('output-value');
    const convertBtn = document.getElementById('convert-btn');
    const swapBtn = document.getElementById('swap-units');
    
    // 定义单位转换数据
    const unitData = {
        length: {
            units: [
                { id: 'meter', name: '米 (m)', factor: 1 },
                { id: 'kilometer', name: '千米 (km)', factor: 0.001 },
                { id: 'centimeter', name: '厘米 (cm)', factor: 100 },
                { id: 'millimeter', name: '毫米 (mm)', factor: 1000 },
                { id: 'inch', name: '英寸 (in)', factor: 39.3701 },
                { id: 'foot', name: '英尺 (ft)', factor: 3.28084 },
                { id: 'yard', name: '码 (yd)', factor: 1.09361 },
                { id: 'mile', name: '英里 (mi)', factor: 0.000621371 }
            ],
            convert: (value, fromFactor, toFactor) => (value / fromFactor) * toFactor
        },
        weight: {
            units: [
                { id: 'kilogram', name: '千克 (kg)', factor: 1 },
                { id: 'gram', name: '克 (g)', factor: 1000 },
                { id: 'milligram', name: '毫克 (mg)', factor: 1000000 },
                { id: 'metric-ton', name: '吨 (t)', factor: 0.001 },
                { id: 'pound', name: '磅 (lb)', factor: 2.20462 },
                { id: 'ounce', name: '盎司 (oz)', factor: 35.274 }
            ],
            convert: (value, fromFactor, toFactor) => (value / fromFactor) * toFactor
        },
        temperature: {
            units: [
                { id: 'celsius', name: '摄氏度 (°C)' },
                { id: 'fahrenheit', name: '华氏度 (°F)' },
                { id: 'kelvin', name: '开尔文 (K)' }
            ],
            convert: (value, fromUnit, toUnit) => {
                let celsius;
                
                // 先转换为摄氏度
                if (fromUnit === 'celsius') {
                    celsius = value;
                } else if (fromUnit === 'fahrenheit') {
                    celsius = (value - 32) * 5/9;
                } else if (fromUnit === 'kelvin') {
                    celsius = value - 273.15;
                }
                
                // 然后从摄氏度转换到目标单位
                if (toUnit === 'celsius') {
                    return celsius;
                } else if (toUnit === 'fahrenheit') {
                    return celsius * 9/5 + 32;
                } else if (toUnit === 'kelvin') {
                    return celsius + 273.15;
                }
            }
        },
        volume: {
            units: [
                { id: 'liter', name: '升 (L)', factor: 1 },
                { id: 'milliliter', name: '毫升 (mL)', factor: 1000 },
                { id: 'cubic-meter', name: '立方米 (m³)', factor: 0.001 },
                { id: 'gallon-us', name: '美制加仑 (gal)', factor: 0.264172 },
                { id: 'fluid-ounce-us', name: '美制液盎司 (fl oz)', factor: 33.814 },
                { id: 'cup-us', name: '美制杯', factor: 4.22675 },
                { id: 'cubic-inch', name: '立方英寸 (in³)', factor: 61.0237 }
            ],
            convert: (value, fromFactor, toFactor) => (value / fromFactor) * toFactor
        }
    };
    
    // Populate unit selectors based on conversion type
    function populateUnitSelectors(type) {
        const units = unitData[type].units;
        
        // Clear existing options
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        
        // Add new options
        units.forEach(unit => {
            const fromOption = document.createElement('option');
            fromOption.value = unit.id;
            fromOption.textContent = unit.name;
            fromUnit.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = unit.id;
            toOption.textContent = unit.name;
            toUnit.appendChild(toOption);
        });
        
        // Set default to/from units
        if (type === 'temperature') {
            toUnit.selectedIndex = 1; // Fahrenheit
        } else {
            toUnit.selectedIndex = 1; // Second unit in the list
        }
        
        // Trigger conversion if input has value
        if (inputValue.value) {
            convert();
        }
    }
    
    // Perform conversion
    function convert() {
        const value = parseFloat(inputValue.value);
        
        if (isNaN(value)) {
            outputValue.value = '';
            return;
        }
        
        const type = converterType.value;
        const fromUnitId = fromUnit.value;
        const toUnitId = toUnit.value;
        
        let result;
        
        if (type === 'temperature') {
            // Temperature conversion uses a different approach
            result = unitData[type].convert(value, fromUnitId, toUnitId);
        } else {
            // For other types, find the factors
            const fromUnitObj = unitData[type].units.find(unit => unit.id === fromUnitId);
            const toUnitObj = unitData[type].units.find(unit => unit.id === toUnitId);
            
            result = unitData[type].convert(value, fromUnitObj.factor, toUnitObj.factor);
        }
        
        // Format the result to avoid too many decimal places
        if (Math.abs(result) >= 1e6 || Math.abs(result) < 0.000001) {
            outputValue.value = result.toExponential(6);
        } else {
            // Round to a reasonable number of decimal places
            const precision = Math.max(0, 6 - Math.floor(Math.log10(Math.abs(result))));
            outputValue.value = parseFloat(result.toFixed(precision)).toString();
        }
    }
    
    // Swap from and to units
    function swapUnits() {
        const tempUnit = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = tempUnit;
        
        // Swap values if both exist
        if (inputValue.value && outputValue.value) {
            const tempValue = inputValue.value;
            inputValue.value = outputValue.value;
            outputValue.value = tempValue;
        } else if (inputValue.value) {
            // If only input has value, convert with swapped units
            convert();
        }
    }
    
    // Event listeners
    converterType.addEventListener('change', () => populateUnitSelectors(converterType.value));
    convertBtn.addEventListener('click', convert);
    inputValue.addEventListener('input', convert);
    fromUnit.addEventListener('change', convert);
    toUnit.addEventListener('change', convert);
    swapBtn.addEventListener('click', swapUnits);
    
    // Initialize with default unit type
    populateUnitSelectors('length');
}

/**
 * 文本格式化器功能
 */
function initTextFormatter() {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const formatUpperBtn = document.getElementById('format-upper');
    const formatLowerBtn = document.getElementById('format-lower');
    const formatTitleBtn = document.getElementById('format-title');
    const formatClearBtn = document.getElementById('format-clear');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');
    
    // Update text statistics (character, word, and line counts)
    function updateTextStatistics() {
        const text = inputText.value;
        
        // Character count
        charCount.textContent = text.length;
        
        // Word count - split by whitespace, filter out empty strings
        const words = text.trim() ? text.trim().split(/\s+/) : [];
        wordCount.textContent = words.length;
        
        // Line count
        const lines = text ? text.split('\n').length : 0;
        lineCount.textContent = lines;
    }
    
    // 格式化为大写
        function formatToUppercase() {
            const text = inputText.value;
            outputText.value = text.toUpperCase();
            outputText.setAttribute('aria-label', '大写格式的文本');
        }
        
        // 格式化为小写
        function formatToLowercase() {
            const text = inputText.value;
            outputText.value = text.toLowerCase();
            outputText.setAttribute('aria-label', '小写格式的文本');
        }
        
        // 格式化为标题格式
        function formatToTitleCase() {
            const text = inputText.value;
            const titleCaseText = text.toLowerCase().replace(/\b\w/g, match => match.toUpperCase());
            outputText.value = titleCaseText;
            outputText.setAttribute('aria-label', '标题格式的文本');
        }
    
    // Clear both text areas
    function clearText() {
        inputText.value = '';
        outputText.value = '';
        updateTextStatistics();
        inputText.focus();
    }
    
    // 复制格式化文本到剪贴板
        function copyToClipboard() {
            if (outputText.value) {
                outputText.select();
                document.execCommand('copy');
                
                // 显示用户反馈（可以扩展为toast通知）
                const originalLabel = outputText.getAttribute('aria-label') || '';
                outputText.setAttribute('aria-label', '文本已复制到剪贴板');
                
                setTimeout(() => {
                    outputText.setAttribute('aria-label', originalLabel);
                }, 2000);
            }
        }
    
    // Event listeners
    inputText.addEventListener('input', () => {
        updateTextStatistics();
        // Re-apply the last formatting operation when input changes
        const activeFormatButton = document.querySelector('.format-btn.active');
        if (activeFormatButton) {
            activeFormatButton.click();
        }
    });
    
    formatUpperBtn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        formatUpperBtn.classList.add('active');
        formatToUppercase();
    });
    
    formatLowerBtn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        formatLowerBtn.classList.add('active');
        formatToLowercase();
    });
    
    formatTitleBtn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        formatTitleBtn.classList.add('active');
        formatToTitleCase();
    });
    
    formatClearBtn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
        clearText();
    });
    
    // Add double-click event to copy formatted text
    outputText.addEventListener('dblclick', copyToClipboard);
    
    // Add keyboard shortcut support
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + Shift + U for uppercase
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'U') {
            event.preventDefault();
            formatUpperBtn.click();
        }
        // Ctrl/Cmd + Shift + L for lowercase
        else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
            event.preventDefault();
            formatLowerBtn.click();
        }
        // Ctrl/Cmd + Shift + T for title case
        else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
            event.preventDefault();
            formatTitleBtn.click();
        }
    });
    
    // Initialize statistics
    updateTextStatistics();
}

/**
 * Smooth scrolling for navigation links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 200, // Offset for header and nav
                    behavior: 'smooth'
                });
                
                // Focus on the target section for accessibility
                setTimeout(() => {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                }, 1000);
            }
        });
    });
}

/**
 * 2048游戏功能
 */
function init2048Game() {
    const gameBoard = document.querySelector('#board-2048');
    const scoreElement = document.querySelector('#score-2048');
    const bestElement = document.querySelector('#best-2048');
    const resetBtn = document.querySelector('#new-game-2048');
    
    let board = [];
    let score = 0;
    let best = localStorage.getItem('2048-best') || 0;
    let gameWon = false;
    let gameOver = false;
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        score = 0;
        gameWon = false;
        gameOver = false;
        
        // 更新显示
        scoreElement.textContent = score;
        bestElement.textContent = best;
        
        // 添加两个初始方块
        addRandomTile();
        addRandomTile();
        
        // 渲染棋盘
        renderBoard();
    }
    
    // 渲染棋盘
    function renderBoard() {
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                
                const value = board[row][col];
                if (value > 0) {
                    tile.classList.add(`tile-${value}`);
                    tile.textContent = value;
                }
                
                gameBoard.appendChild(tile);
            }
        }
    }
    
    // 添加随机方块
    function addRandomTile() {
        const emptyCells = [];
        
        // 找出所有空单元格
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        // 如果没有空单元格，游戏结束
        if (emptyCells.length === 0) {
            checkGameOver();
            return;
        }
        
        // 随机选择一个空单元格
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // 90%概率生成2，10%概率生成4
        const value = Math.random() < 0.9 ? 2 : 4;
        
        board[randomCell.row][randomCell.col] = value;
    }
    
    // 处理移动
    function move(direction) {
        if (gameOver || gameWon) return;
        
        let moved = false;
        
        // 根据方向移动方块
        switch (direction) {
            case 'up':
                moved = moveUp();
                break;
            case 'down':
                moved = moveDown();
                break;
            case 'left':
                moved = moveLeft();
                break;
            case 'right':
                moved = moveRight();
                break;
        }
        
        // 如果有移动，添加新方块并更新显示
        if (moved) {
            addRandomTile();
            renderBoard();
            checkGameWon();
            checkGameOver();
        }
    }
    
    // 向上移动
    function moveUp() {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            // 合并相同值的方块
            for (let row = 1; row < 4; row++) {
                if (board[row][col] !== 0) {
                    for (let k = row - 1; k >= 0; k--) {
                        if (board[k][col] === 0) {
                            // 移动到空位置
                            board[k][col] = board[k + 1][col];
                            board[k + 1][col] = 0;
                            moved = true;
                        } else if (board[k][col] === board[k + 1][col]) {
                            // 合并相同值的方块
                            board[k][col] *= 2;
                            score += board[k][col];
                            board[k + 1][col] = 0;
                            moved = true;
                            break;
                        } else {
                            // 无法继续移动
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
        }
        
        return moved;
    }
    
    // 向下移动
    function moveDown() {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            // 合并相同值的方块
            for (let row = 2; row >= 0; row--) {
                if (board[row][col] !== 0) {
                    for (let k = row + 1; k < 4; k++) {
                        if (board[k][col] === 0) {
                            // 移动到空位置
                            board[k][col] = board[k - 1][col];
                            board[k - 1][col] = 0;
                            moved = true;
                        } else if (board[k][col] === board[k - 1][col]) {
                            // 合并相同值的方块
                            board[k][col] *= 2;
                            score += board[k][col];
                            board[k - 1][col] = 0;
                            moved = true;
                            break;
                        } else {
                            // 无法继续移动
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
        }
        
        return moved;
    }
    
    // 向左移动
    function moveLeft() {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            // 合并相同值的方块
            for (let col = 1; col < 4; col++) {
                if (board[row][col] !== 0) {
                    for (let k = col - 1; k >= 0; k--) {
                        if (board[row][k] === 0) {
                            // 移动到空位置
                            board[row][k] = board[row][k + 1];
                            board[row][k + 1] = 0;
                            moved = true;
                        } else if (board[row][k] === board[row][k + 1]) {
                            // 合并相同值的方块
                            board[row][k] *= 2;
                            score += board[row][k];
                            board[row][k + 1] = 0;
                            moved = true;
                            break;
                        } else {
                            // 无法继续移动
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
        }
        
        return moved;
    }
    
    // 向右移动
    function moveRight() {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            // 合并相同值的方块
            for (let col = 2; col >= 0; col--) {
                if (board[row][col] !== 0) {
                    for (let k = col + 1; k < 4; k++) {
                        if (board[row][k] === 0) {
                            // 移动到空位置
                            board[row][k] = board[row][k - 1];
                            board[row][k - 1] = 0;
                            moved = true;
                        } else if (board[row][k] === board[row][k - 1]) {
                            // 合并相同值的方块
                            board[row][k] *= 2;
                            score += board[row][k];
                            board[row][k - 1] = 0;
                            moved = true;
                            break;
                        } else {
                            // 无法继续移动
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
        }
        
        return moved;
    }
    
    // 更新分数
    function updateScore() {
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > best) {
            best = score;
            bestElement.textContent = best;
            localStorage.setItem('2048-best', best);
        }
    }
    
    // 检查是否获胜
    function checkGameWon() {
        if (gameWon) return;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (board[row][col] === 2048) {
                    gameWon = true;
                    alert('恭喜！你赢了！');
                    return;
                }
            }
        }
    }
    
    // 检查是否游戏结束
    function checkGameOver() {
        if (gameWon) return;
        
        // 检查是否有空单元格
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (board[row][col] === 0) {
                    return; // 还有空单元格，游戏继续
                }
            }
        }
        
        // 检查是否有可合并的方块
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = board[row][col];
                
                // 检查右侧
                if (col < 3 && board[row][col + 1] === current) {
                    return;
                }
                
                // 检查下方
                if (row < 3 && board[row + 1][col] === current) {
                    return;
                }
            }
        }
        
        // 没有空单元格且没有可合并的方块，游戏结束
        gameOver = true;
        alert('游戏结束！你的分数：' + score);
    }
    
    // 添加键盘事件监听
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                move('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                move('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                move('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                move('right');
                break;
        }
    });
    
    // 添加重置按钮事件监听
    resetBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
}

/**
 * 记忆翻牌游戏功能
 */
function initMemoryGame() {
    const memoryBoard = document.querySelector('#memory-board');
    const movesElement = document.querySelector('#moves');
    const timeElement = document.querySelector('#time');
    const resetBtn = document.querySelector('#new-game-memory');
    const difficultySelect = document.querySelector('#difficulty');
    
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let time = 0;
    let timerId = null;
    let isGameActive = false;
    let difficulty = 'easy';
    
    // 生成卡片数据
    function generateCards() {
        const symbols = ['🎯', '🎨', '🎭', '🎪', '🎮', '🎲', '🎳', '🎸', '🎹', '🎺', '🎻', '🎷', '🎤', '🎧', '🎬', '🎭'];
        let pairs = 8;
        
        // 根据难度调整卡片数量
        if (difficulty === 'medium') {
            pairs = 18;
        } else if (difficulty === 'hard') {
            pairs = 32;
        }
        
        // 生成卡片对
        const cardSymbols = symbols.slice(0, pairs);
        cards = [...cardSymbols, ...cardSymbols].sort(() => Math.random() - 0.5);
    }
    
    // 渲染卡片
    function renderCards() {
        memoryBoard.innerHTML = '';
        
        // 设置棋盘大小
        memoryBoard.className = `memory-board ${difficulty}`;
        
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            card.textContent = symbol;
            card.style.transform = 'rotateY(180deg)';
            
            card.addEventListener('click', () => flipCard(card));
            memoryBoard.appendChild(card);
        });
    }
    
    // 翻转卡片
    function flipCard(card) {
        // 如果卡片已经匹配、翻转或游戏未开始，则不执行操作
        if (card.classList.contains('matched') || 
            card.classList.contains('flipped') || 
            flippedCards.length >= 2 || 
            !isGameActive) {
            return;
        }
        
        // 翻转卡片
        card.classList.add('flipped');
        flippedCards.push(card);
        
        // 如果翻转了两张卡片，检查是否匹配
        if (flippedCards.length === 2) {
            moves++;
            movesElement.textContent = moves;
            
            setTimeout(() => {
                checkMatch();
            }, 1000);
        }
    }
    
    // 检查是否匹配
    function checkMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            // 匹配成功
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            
            // 检查游戏是否结束
            if (matchedPairs === cards.length / 2) {
                setTimeout(() => {
                    alert('恭喜！你完成了游戏！\n移动次数：' + moves + '\n用时：' + time + '秒');
                    stopTimer();
                }, 500);
            }
        } else {
            // 匹配失败，翻回卡片
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }
        
        // 清空已翻转卡片数组
        flippedCards = [];
    }
    
    // 启动计时器
    function startTimer() {
        isGameActive = true;
        timerId = setInterval(() => {
            time++;
            // 格式化时间为 MM:SS
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // 停止计时器
    function stopTimer() {
        clearInterval(timerId);
        isGameActive = false;
    }
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        moves = 0;
        time = 0;
        matchedPairs = 0;
        flippedCards = [];
        
        // 更新显示
        movesElement.textContent = moves;
        timeElement.textContent = "00:00";
        
        // 生成和渲染卡片
        generateCards();
        renderCards();
        
        // 停止之前的计时器
        stopTimer();
        
        // 3秒后开始游戏
        setTimeout(() => {
            // 翻转所有卡片显示
            const allCards = document.querySelectorAll('.memory-card');
            allCards.forEach(card => {
                card.style.transform = 'rotateY(0deg)';
            });
            
            // 2秒后翻回卡片并开始游戏
            setTimeout(() => {
                allCards.forEach(card => {
                    card.classList.remove('flipped');
                    card.classList.remove('matched');
                    card.style.transform = 'rotateY(180deg)';
                });
                
                // 启动计时器
                startTimer();
            }, 2000);
        }, 1000);
    }
    
    // 添加事件监听
    resetBtn.addEventListener('click', initGame);
    
    difficultySelect.addEventListener('change', () => {
        difficulty = difficultySelect.value;
        initGame();
    });
    
    // 初始化游戏
    initGame();
}

/**
 * 数字猜谜游戏功能
 */
function initGuessGame() {
    const guessInput = document.querySelector('.guess-input input');
    const guessBtn = document.querySelector('#submit-guess');
    const resetBtn = document.querySelector('#new-game-guess');
    const feedback = document.querySelector('.guess-feedback');
    const guessStats = document.querySelector('.guess-stats');
    
    let targetNumber = 0;
    let attempts = 0;
    let minRange = 1;
    let maxRange = 100;
    
    // 生成随机目标数字
    function generateTargetNumber() {
        targetNumber = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
        console.log('目标数字：' + targetNumber); // 用于调试
    }
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        attempts = 0;
        guessInput.value = '';
        guessInput.disabled = false;
        guessBtn.disabled = false;
        
        // 生成新的目标数字
        generateTargetNumber();
        
        // 更新显示
        updateFeedback('请输入一个数字进行猜测！');
        updateStats();
        
        // 聚焦输入框
        guessInput.focus();
    }
    
    // 更新反馈信息
    function updateFeedback(message, type = '') {
        feedback.textContent = message;
        feedback.className = `guess-feedback ${type}`;
    }
    
    // 更新统计信息
    function updateStats() {
        const guessCountElement = document.querySelector('#guess-count');
        guessCountElement.textContent = attempts;
    }
    
    // 处理猜测
    function handleGuess() {
        const guess = parseInt(guessInput.value);
        
        // 验证输入
        if (isNaN(guess) || guess < minRange || guess > maxRange) {
            updateFeedback('请输入' + minRange + '-' + maxRange + '之间的有效数字！');
            guessInput.focus();
            return;
        }
        
        attempts++;
        
        // 检查猜测是否正确
        if (guess === targetNumber) {
            updateFeedback('恭喜你猜对了！目标数字是 ' + targetNumber + '！', 'correct');
            updateStats();
            guessInput.disabled = true;
            guessBtn.disabled = true;
        } else {
            // 计算与目标数字的差距
            const difference = Math.abs(guess - targetNumber);
            let feedbackType = '';
            let feedbackMessage = '';
            
            // 根据差距给出提示
            if (difference <= 5) {
                feedbackType = 'hot';
                feedbackMessage = '非常接近！你的猜测是 ' + guess + '。';
            } else if (difference <= 15) {
                feedbackType = 'warm';
                feedbackMessage = '接近了！你的猜测是 ' + guess + '。';
            } else {
                feedbackType = 'cold';
                feedbackMessage = '有点远！你的猜测是 ' + guess + '。';
            }
            
            // 添加高低提示
            if (guess < targetNumber) {
                feedbackMessage += ' 猜大一点！';
            } else {
                feedbackMessage += ' 猜小一点！';
            }
            
            updateFeedback(feedbackMessage, feedbackType);
            updateStats();
            
            // 清空输入框并聚焦
            guessInput.value = '';
            guessInput.focus();
        }
    }
    
    // 添加事件监听
    guessBtn.addEventListener('click', handleGuess);
    
    guessInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleGuess();
        }
    });
    
    resetBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
}
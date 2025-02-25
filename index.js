const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';
const WINNER_COLOR = "red";

const container = document.getElementById('fieldWrapper');

let field = [];
let currentPlayer = CROSS;
let gameOver = false;
let dimension = 3;
let totalSteps = 0;
startGame(3);
addResetListener();


function generateField(dimension) {
    field = [];
    for (let i = 0; i < dimension; i++) {
        let row = []
        for (let j = 0; j < dimension; j++) {
            row.push(EMPTY);
        }
        field.push(row);
    }
}

function startGame(size) {
    currentPlayer = CROSS;
    gameOver = false;
    dimension = size;
    totalSteps = 0;
    generateField(dimension);
    renderGrid(dimension);
}

function renderGrid(dimension) {
    container.innerHTML = '';

    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            cell.textContent = field[i][j];
            cell.addEventListener('click', () => cellClickHandler(i, j));
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

function checkDiagFor(player, cellSelector) {
    for (let row = 0; row < dimension; row++) {
        if (field[row][cellSelector(row)] !== player) {
            return false;
        }
    }
    let mask = []
    for (let row = 0; row < dimension; row++) {
        mask.push([row, row]);
    }
    return mask;
}

function checkWinFor(player) {
    // по строкам
    for (let row = 0; row < dimension; row++) {
        if (field[row].every(cell => cell === player)) {
            let mask = []
            for (let col = 0; col < dimension; col++) {
                mask.push([row, col]);
            }
            return mask;
        }
    }
    // по столбцам
    for (let col = 0; col < dimension; col++) {
        if (field.every(row => row[col] === player)) {
            let mask = []
            for (let row = 0; row < dimension; row++) {
                mask.push([row, col]);
            }
            return mask;
        }
    }
    //по главной диагоналям
    let mainDiag = checkDiagFor(player, r => r);
    if (mainDiag) {
        return mainDiag;
    }
    //по второй диагонали
    let secondDiag = checkDiagFor(player, r => dimension - 1 - r);
    if (secondDiag) {
        return secondDiag;
    }

    return false;
}

function renderWinnerColors(winner, fillMask) {
    const loser = winner === CROSS ? ZERO : CROSS;
    for (const [row, col] of fillMask){
        renderSymbolInCell(winner, row, col, WINNER_COLOR);
    }
}

function checkGameEnded() {
    let zeroWin = checkWinFor(ZERO);
    if (zeroWin) {
        alert("Нолики выиграли");
        renderWinnerColors(ZERO, zeroWin);
        return true;
    }
    let crossWin = checkWinFor(CROSS);
    if (crossWin) {
        alert("Крестики выиграли");
        renderWinnerColors(CROSS, crossWin);
        return true;
    }

    for (const row of field) {
        for (const cell of row) {
            if (cell === EMPTY) {
                return false;
            }
        }
    }
    alert("Победила дружба!");
    return true;
}

function cellClickHandler(row, col) {
    if (gameOver) {
        return;
    }
    console.log(`Clicked on cell: ${row}, ${col}`);
    if (field[row][col] !== EMPTY) {
        return;
    }
    field[row][col] = currentPlayer;
    renderSymbolInCell(currentPlayer, row, col);
    currentPlayer = currentPlayer === CROSS ? ZERO : CROSS;
    totalSteps++;
    
    /* Пользоваться методом для размещения символа в клетке так:
    renderSymbolInCell(ZERO, row, col);
    */
   gameOver = checkGameEnded();
   if (gameOver) {
    return;
   }
   resizeIfHalf();
   
   makeAiStep();
}

function resizeIfHalf() {
    if (totalSteps >= dimension * dimension / 2) {
        field = expandField(field);
        dimension += 2;
        renderGrid(dimension);
    }
}

function expandField(field) {
    const oldSize = field.length;
    const size = oldSize + 2;
    const newField = [];
    for (let i = 0; i < size; i++) {
        newField.push([]);
        for (let j = 0; j < size; j++) {
            if (i === 0 || j === 0 || i == size - 1 || j == size - 1) {
                newField[i].push(EMPTY);
            } else {
                newField[i].push(field[i - 1][j - 1]);
            }
        }
    }
    return newField;
}

function makeAiStep() {
    const [row, col] = getAiStep(field, currentPlayer);
    field[row][col] = currentPlayer;
    renderSymbolInCell(currentPlayer, row, col);
    currentPlayer = currentPlayer === CROSS ? ZERO : CROSS;
    totalSteps++;
    gameOver = checkGameEnded();
    if (!gameOver)
        resizeIfHalf();
}

function getAiStep(field, player) {
    const size = field.length;
    for (const line of foreachAllLines(size)) {
        let wasEmpty = false;
        let step = null;
        for (let [value, i, j] of foreachLine(field, line)) {
            if (value !== player) {
                if (value === EMPTY) {
                    if (wasEmpty) {
                        step = null;
                        break;
                    }
                    wasEmpty = true;
                    step = [i, j];
                    continue;
                }
                step = null;
                break;
            }
        }
        if (step) {
            return step;
        }
    }
    for (let t = 0; t < 1000; t++) {
        const i = Math.floor(Math.random() * size);
        const j = Math.floor(Math.random() * size);
        if (field[i][j] === EMPTY)
            return [i, j];
    }
    return null;
}

function* foreachLine(field, line) {
    const size = field.length;
    if (line[0] === 'd') {
        for (let i = 0; i < size; i++) {
            if (line[1] === 0) {
                yield [field[i][i], i, i];
            } else {
                yield [field[i][size - i - 1], i, size - i - 1];
            }
        }
    } else if (line[0] === 'h') {
        for (let i = 0; i < size; i++) {
            yield [field[i][line[1]], i, line[1]];
        }
    } else if (line[0] === 'v') {
        for (let i = 0; i < size; i++) {
            yield [field[line[1]][i], line[1], i];
        }
    }
}

function* foreachAllLines(size) {
    for (let i = 0; i < size; i++) {
        yield ['h', i];
        yield ['v', i];
    }
    yield ['d', 0];
    yield ['d', 1];
}

function renderSymbolInCell(symbol, row, col, color = '#333') {
    const targetCell = findCell(row, col);

    targetCell.textContent = symbol;
    targetCell.style.color = color;
}

function findCell(row, col) {
    const targetRow = container.querySelectorAll('tr')[row];
    return targetRow.querySelectorAll('td')[col];
}

function addResetListener() {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetClickHandler);
}

function resetClickHandler() {
    const startSize = document.getElementById('startSize');
    let raw = Number(startSize.value);
    if (Number.isNaN(raw) || raw < 3)
        raw = 3;
    startGame(raw);
}


/* Test Function */

/* Победа первого игрока */
function testWin() {
    clickOnCell(0, 2);
    clickOnCell(0, 0);
    clickOnCell(2, 0);
    clickOnCell(1, 1);
    clickOnCell(2, 2);
    clickOnCell(1, 2);
    clickOnCell(2, 1);
}

/* Ничья */
function testDraw() {
    clickOnCell(2, 0);
    clickOnCell(1, 0);
    clickOnCell(1, 1);
    clickOnCell(0, 0);
    clickOnCell(1, 2);
    clickOnCell(1, 2);
    clickOnCell(0, 2);
    clickOnCell(0, 1);
    clickOnCell(2, 1);
    clickOnCell(2, 2);
}

function clickOnCell(row, col) {
    findCell(row, col).click();
}

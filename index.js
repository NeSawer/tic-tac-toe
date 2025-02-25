const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';
const WINNER_COLOR = "green";
const LOSER_COLOR = "red";

const container = document.getElementById('fieldWrapper');

let field = [];
let currentPlayer = CROSS;
let gameOver = false;
let dimension = 3;
startGame();
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

function startGame() {
    generateField(dimension);
    renderGrid(dimension);
}

function renderGrid(dimension) {
    container.innerHTML = '';

    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            cell.textContent = EMPTY;
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
    return true;
}

function checkWinFor(player) {
    // по строкам
    for (const row of field) {
        if (row.every(cell => cell === player)) {
            return true;
        }
    }
    // по столбцам
    for (let col = 0; col < dimension; col++) {
        if (field.every(row => row[col] === player)) {
            return true;
        }
    }
    //по главной диагоналям
    if (checkDiagFor(player, r => r)) {
        return true;
    }
    //по второй диагонали
    else if (checkDiagFor(player, r => dimension - 1 - r)) {
        return true;
    }
    return false;
}

function renderWinnerColors(winner) {
    const loser = winner === CROSS ? ZERO : CROSS;
    for (let row = 0; row < dimension; row++) {
        for (let col = 0; col < dimension; col++) {
            if (field[row][col] === EMPTY) {
                continue;
            }
            if (field[row][col] === winner) {
                renderSymbolInCell(winner, row, col, WINNER_COLOR);
            } else {
                renderSymbolInCell(loser, row, col, LOSER_COLOR);
            }

        }
    }
}

function checkGameEnded() {
    if (checkWinFor(ZERO)) {
        alert("Нолики выиграли");
        renderWinnerColors(ZERO);
        return true;
    } else if (checkWinFor(CROSS)) {
        alert("Крестики выиграли");
        renderWinnerColors(CROSS);
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

    /* Пользоваться методом для размещения символа в клетке так:
        renderSymbolInCell(ZERO, row, col);
     */
    gameOver = checkGameEnded();

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
    console.log('reset!');
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

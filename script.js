document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game__container');
    const chessBoard = document.getElementById('chess__board');
    const resetButton = document.getElementById('reset__button');
    const gameStatus = document.getElementById('game__status');
    
    
//chess board 8x8

const initialBoardState = [
    ["b__rook", "b__knight", "b__bishop", "b__queen", "b__king", "b__bishop", "b__knight", "b__rook"],
    ["b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn"],
    ["w__rook", "w__knight", "w__bishop", "w__queen", "w__king", "w__bishop", "w__knight", "w__rook"]
];

let board = [];
let selectedPiece = null;

//map and create pieces 

function initializeBoard() {
    board = initialBoardState.map(row => row.slice());

    function createPiece(piece, row, col) {
        if (!piece) return null;
        let imgElement = document.createElement('img');
        imgElement.src = `/assets/${piece}.svg`;
        imgElement.classList.add('chess__piece');
        imgElement.alt = piece.replace('__',' ');
        imgElement.setAttribute('draggable', true);

        imgElement.addEventListener('dragstart', (event) => {
            dragStart(event, row, col);
        })

        return imgElement;
    }

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            board[row][col] = createPiece(board[row][col], row, col);
        }
    }
}


//create dragging implementation

function dragStart(event, row, col) {
    if (board[row][col]) {
        selectedPiece= { piece: board[row][col], row, col };
        event.dataTransfer.setData("text/plain", `${row}__${col}`);
        event.dataTransfer.effectAllowed = "move";
    }
}

//handle drag over
function allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

//check if pieces are legal moves
function isLegalMove(piece, oldRow, oldCol, newRow, newCol, board) {
    let isLegal = false;
    let deltaRow = oldRow - newRow;
    let deltaCol = newCol - oldCol;

    switch (piece) {
        case 'w__pawn':
            //if white pawn moves one space up
            if (deltaCol === 0 && deltaRow === -1) {
                isLegal = board[newRow][newCol] === null;
            //if white pawn moves 2 spaces up. checks if its in starting position
            } else if (deltaCol === 0 && deltaRow === -2 && oldRow === 6) {
                isLegal = board[newRow][newCol] === null && board[oldRow - 1][oldCol] === null;
            } else if (Math.abs(deltaCol) === 1 && deltaRow === -1) {
            // en passant :)))))))
            isLegal = board[newRow][newCol] !== null && board[newRow][newCol].alt.startsWith("b__");
            }
            break;
        case 'b__pawn':
            //if black pawn moves one space down
            if (deltaCol === 0 && deltaRow === 1) {
                isLegal = board[newRow][newCol] === null;
            //if white pawn moves 2 spaces down. checks if its in starting position
            } else if (deltaCol === 0 && deltaRow === 2 && oldRow === 1) {
                isLegal = board[newRow][newCol] === null && board[oldRow + 1][oldCol] === null;
            } else if (Math.abs(deltaCol) === 1 && deltaRow == 1) {
                isLegal = board[newRow][newCol] !== null && board[newRow][newCol].alt.startsWith("w__");
            }
            break;
        //Knights and Pawns don't need isPathClear
        case 'w__knight':
        case 'b__knight':
            // Knights move L shape all directions
            isLegal = (Math.abs(newRow - oldRow) === 2 && Math.abs(newCol - oldCol) === 1) || (Math.abs(newRow - oldRow) === 1 && Math.abs(newCol - oldCol) === 2);
            break;
        case 'w__bishop':
        case 'b__bishop':
            // Bishop moving diagnolly 
            if (Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol)) {
                isLegal = isPathClear(oldRow, oldCol, newRow, newCol, board);
            }
            break;
        case 'w__rook':
        case 'b__rook':
            //Rooks moving horizontally/vertically
            if (newRow === oldRow || newCol === oldCol) {
                isLegal = isPathClear(oldRow, oldCol, newRow, newCol, board);
            }
            break;
        case 'w__queen':
        case 'b__queen':
            // ALL DIRECTIONS TO THE QUEEN
            if (newRow === oldRow || newCol === oldCol || Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol)) {
                isLegal = isPathClear(oldRow, oldCol, newRow, newCol, board);
            }
            break;
        case 'w__king':
        case 'b__king':
            isLegal = Math.abs(newRow - oldRow) <= 1 && Math.abs(newCol - oldCol) <= 1;
    }
    console.log('Is Legal Move:', isLegal, piece, oldRow, oldCol, newRow, newCol);   
    return isLegal;
}


//check path

function isPathClear(oldRow, oldCol, newRow, newCol, board) {
    let deltaRow = Math.sign(newRow - oldRow);
    let deltaCol = Math.sign(newCol - oldCol);

    for (let row = oldRow + deltaRow, col = oldCol + deltaCol; 
         row !== newRow || col !== newCol; 
         row += deltaRow, col += deltaCol) {
        if (board[row][col] !== null) {
            return false;
        }
    }
    return true;
}



//handle drop
function drop(event, newRow, newCol) {
    event.preventDefault();
    if (!selectedPiece) return;
    console.log('Drop Event:', newRow, newCol);
    const oldPosition = event.dataTransfer.getData("text/plain");
    console.log("Old Position String:", oldPosition);
    const [oldRow, oldCol] = oldPosition.split('__').map(Number);
    console.log("Parsed Old Position:", oldRow, oldCol);
    if (isLegalMove(selectedPiece.piece.alt, oldRow, oldCol, newRow, newCol, board)) {
        // Valid move, update the board
        board[oldRow][oldCol] = null;
        board[newRow][newCol] = selectedPiece.piece;

        // Optionally, you can add code here to switch turns between players

    } else {
        // Invalid move, maybe show an error or revert the piece
        // This could involve returning the piece to its original position or displaying a message
    }
    selectedPiece = null;

    // Re-render the board to reflect the new state
    
    renderBoard();

}

function renderBoard() {
    chessBoard.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((piece, colIndex) => {
            let square = document.createElement('div');
            square.classList.add('chess__square');

            square.ondragover = allowDrop;

            square.ondrop = (event) => drop(event, rowIndex, colIndex);

            if (piece) {
                square.appendChild(piece);
            }
            chessBoard.appendChild(square);
        });
    });
}

resetButton.addEventListener('click', () => {
    initializeBoard();
    renderBoard();
});

initializeBoard();
renderBoard();

});


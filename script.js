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
        console.log(board);
        console.log('board in initializeBoard: ', board)
        function createPiece(piece, row, col) {
            if (!piece) return null;
            let imgElement = document.createElement('img');
            imgElement.src = `/assets/${piece}.svg`;
            imgElement.classList.add('chess__piece');
            imgElement.alt = piece;
            imgElement.setAttribute('draggable', true);

            imgElement.addEventListener('dragstart', (event) => {
                console.log('event in addeventlistener dragstart: ', event);
                console.log('row and col in initializeBoard: ', row, col)
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

        console.log('event: ', event);
        console.log('row and column: ', row, col);

    if (board[row][col]) {
        selectedPiece = { piece: board[row][col], row, col };
        console.log('selected piece: ', selectedPiece);

        event.dataTransfer.setData("text/plain", `${row}__${col}`);
        event.dataTransfer.effectAllowed = "move";
    }
        console.log('row: ', row, 'column: ', col);
        console.log('board in dragstart: ', board);
    }

    //handle drag over
    function allowDrop(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    //check if pieces are legal moves
    function isLegalMove(piece, oldRow, oldCol, newRow, newCol, deltaRow, board) {
        console.log('Entering isLegalMove Function:', piece, oldRow, oldCol, newRow, newCol);
        console.log('Piece value before switch:', piece);
        let isLegal = false;
        let deltaCol = newCol - oldCol;

        switch (piece) {
            case 'w__pawn':
                console.log('Inside w__pawn case');
                console.log('Delta Row:', deltaRow, 'Delta Col:', deltaCol);

                if (deltaCol === 0 && deltaRow === -1) {
                    console.log('Checking 1 space move. Destination Square:', board[newRow][newCol]);
                    isLegal = board[newRow][newCol] === null;
                    console.log('White Pawn Move 1 Space:', isLegal);
                } else if (deltaCol === 0 && deltaRow === -2 && oldRow === 6) {
                    console.log('Checking 2 space move. Destination Square:', board[newRow][newCol], 'Square in front:', board[oldRow - 1][oldCol]);
                    isLegal = board[newRow][newCol] === null && board[oldRow - 1][oldCol] === null;
                    console.log('White Pawn Move 2 Spaces:', isLegal);
                } else if (Math.abs(deltaCol) === 1 && deltaRow === -1) {
                    console.log('Checking capture move. Destination Square:', board[newRow][newCol]);
                    isLegal = board[newRow][newCol] !== null && board[newRow][newCol].alt.startsWith("b__");
                    console.log('White Pawn Capture:', isLegal);
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
                    let rowDirection = 0;
                    let columnDirection = 0;
                    if (oldRow < newRow) {
                        rowDirection = 1;
                    }
                    else rowDirection = -1;

                    if (oldCol < newCol) {
                        columnDirection = 1;
                    }
                    else columnDirection = -1;
         
                    let currentRow = oldRow + rowDirection;
                    let currentCol = oldCol + columnDirection;

                    isLegal = isPathClear(currentRow, newRow, currentCol, newCol, board, 'bishop', rowDirection, columnDirection);
                }
                break;
            case 'w__rook': 
            case 'b__rook':
                //Rooks moving horizontally/vertically
                if (newRow === oldRow || newCol === oldCol) {
                    console.log('LEGAL!!!!')

                    isLegal = isPathClear(oldRow, newRow, oldCol, newCol, board, 'rook');
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
        console.log('Move Legal:', isLegal);
        console.log('board: ', board);
        return isLegal;
    }

//check path

    function isPathClear(currentRow, newRow, currentCol, newCol, board, piece, rowDirection=0, colDirection=0,) {
        if (piece === 'bishop') {
            while (currentRow !== newRow && currentCol !== newCol) {
                if (board[currentRow][currentCol] !== null) {
                    // There is a piece in the path, not a clear path
                    return false;
                }
                currentRow += rowDirection;
                currentCol += colDirection;
            }
            
            return true;
        }
        else if (piece === 'rook') {
            //check if rook is moving vertically or horizontally
            if (currentRow === newRow) {
                //get start and end for loop
                const start = Math.min(currentCol, newCol);
                const end = Math.max(currentCol, newCol);
            
                for (let column = start + 1; column < end; column++) {
                if (board[currentRow][column] !== null) {
                    // There is a piece in the path, not a clear path
                    return false;
                }
                }
            } else {
                //get start and end for loop
                const start = Math.min(currentRow, newRow);
                const end = Math.max(currentRow, newRow);
            
                for (let row = start + 1; row < end; row++) {
                if (board[row][currentCol] !== null) {
                    // There is a piece in the path, not a clear path
                    return false;
                }
                }
                
            }
            return true;
        }
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
        const deltaRow = newRow - oldRow;
        if (isLegalMove(selectedPiece.piece.alt, oldRow, oldCol, newRow, newCol, deltaRow, board)) {
            // Valid move, update the board
            board[oldRow][oldCol] = null;
            board[newRow][newCol] = selectedPiece.piece;

            //remove previous event listener
            selectedPiece.piece.removeEventListener('dragstart', (event) => {
                dragStart(event, newRow, newCol);
            }); 
            console.log('selected piece in drop function: ',selectedPiece)
            //added new event listener
            selectedPiece.piece.addEventListener('dragstart', (event) => {
                dragStart(event, newRow, newCol);
            }); 
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
        console.log('chess board: ', chessBoard);
        }

    resetButton.addEventListener('click', () => {
        initializeBoard();
        renderBoard();
    });

    initializeBoard();
    renderBoard();

});


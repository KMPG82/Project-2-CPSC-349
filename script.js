const gameContainer = document.getElementById('game__container');
const chessBoard = document.getElementById('chess__board');
const resetButton = document.getElementById('reset__button');
const gameStatus = document.getElementById('game__status');

const initialBoardState = [
  "b__rook", "b__knight", "b__bishop", "b__queen", "b__king", "b__bishop", "b__knight", "b__rook",
  "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn",
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn",
  "w__rook", "w__knight", "w__bishop", "w__queen", "w__king", "w__bishop", "w__knight", "w__rook"
];

let board = [];
let selectedPiece;
let playerTurn;

// Creates <div class= chess__square>  elements

function createBoard() {
  board = initialBoardState;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      let square = document.createElement('div');
      square.setAttribute('square-id', rank * 8 + file);
      square.classList.add('chess__square');

      // Alternating square color
      if ((rank + file) % 2 === 0) {
          square.classList.add('dark');
      }

      // Adding events to each square
      square.addEventListener('dragover', dragOver);
      square.addEventListener('drop', dragDrop);
      chessBoard.appendChild(square);
    }
  }
}


// Add pieces to chess__square from variable: board

function initializePieces() {
  let squares = document.querySelectorAll('.chess__square')
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      let index = (rank * 8) + file;
      let pieceName = board[index];

      if (pieceName !== null) {
        let color = pieceName[0];
        let pieceImg = document.createElement('img');
        pieceImg.src = `/assets/${pieceName}.svg`;
        pieceImg.classList.add('chess__piece');
        pieceImg.classList.add(color);
        pieceImg.alt = pieceName;
        pieceImg.setAttribute('draggable', true);

        squares[index].appendChild(pieceImg);
      }
    }
  }

  let pieces = document.querySelectorAll('.chess__piece');
  console.log(pieces);

  pieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
  });
}

// Whenever a piece is dragged selected piece is set to it
function dragStart(event) {
  selectedPiece = event.target;
}

// When the piece is dropped onto a new square
function dragDrop(event) {
  event.stopPropagation();
  console.log(event.target);
  let square = event.target;

  // Checks if moved piece color matches current player turn color
  const turn = selectedPiece.classList.contains(playerTurn);
  if (!turn) { return; }
  // Finding the opponent color of current player
  const opponent = playerTurn === 'w' ? 'b' : 'w';
  // Checks if the square dropped onto contains a piece
  const capture = square.classList.contains('chess__piece') 
  // Checks if the square dropped onto contains a piece from the opponent
  const capture_opp = square.classList.contains(opponent);
  const piece = selectedPiece.alt;
  const startPos = selectedPiece.parentNode.getAttribute('square-id');

  if (capture && capture_opp) {
    const parent = square.parentNode;
    const endPos = parent.getAttribute('square-id');
    const legal = isLegalMove(piece, startPos, endPos);
    if (!legal) { return; }

    square.remove();
    parent.appendChild(selectedPiece);
    board[endPos] = startPos;
    board[startPos] = null;
    changePlayer();
    console.log(board);
  } else if (!capture) {
    const endPos = square.getAttribute('square-id');
    const legal = isLegalMove(piece, startPos, endPos);
    if (!legal) { return; }
    square.appendChild(selectedPiece);
    board[endPos] = startPos;
    board[startPos] = null;
    changePlayer();
    console.log(board);
  }


}

function dragOver(event) {
  event.preventDefault();
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
    console.log('Move Legal:', isLegal);
    console.log('board: ', board);
    return isLegal;
}


//check path

function isPathClear(startPos, endPos) {
  let startRank = Math.floor(startPos / 8);
  let startFile = startPos % 8;
  let endRank = Math.floor(endPos / 8);
  let endFile = endPos % 8;

  let deltaRank = Math.sign(endRank- startRank);
  let deltaFile = Math.sign(endFile - startFile);

  for (let rank = startRank + deltaRank, file = startFile + deltaFile; 
       rank !== endRank || file !== endFile; 
       rank += deltaRank, file += deltaFile) {
      console.log(rank, file);
      let index = Math.abs(rank) * 8 + Math.abs(file);
      if (index === endPos) { console.log("valid move"); return true; }
      if (board[index] !== null) {
          console.log("invalid move:", index);
          return false;
      }
  }
  console.log("Valid Move!")
  return true;
}

function isKingSafe() {
 // NEED TO IMPLEMENT
}


// DRIVER START

createBoard();

// Temporary will change to load with game save
playerTurn = 'w';
gameStatus.textContent = "White's turn."


initializePieces();

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

// Switches player turn status and updates game status
function changePlayer() {
  if (playerTurn === 'w') {
    playerTurn = 'b';
    gameStatus.textContent = "Black's turn."
  } else {
    playerTurn = 'w';
    gameStatus.textContent = "White's turn."
  }
}

// CHESS LOGIC
function isLegalMove(piece, startPos, endPos) {
  console.log(piece, startPos, endPos);
  let legal = false;

  startPos = Number(startPos);
  endPos = Number(endPos);
  switch (piece) {
    case 'w__pawn':
      const w_startRank = [48,49,50,51,52,53,54,55];
      if (w_startRank.includes(startPos) && startPos + (-8) * 2 === endPos) {
        legal = true;
      } else if (startPos + (-8) === endPos) {
        legal = true;
      } else if ((startPos - 7 === endPos || startPos - 9 === endPos) && board[endPos] !== null) {
        legal = true;
      }
      break;
    
    case 'b__pawn':
      const b_startRank = [8,9,10,11,12,13,14,15];
      if (b_startRank.includes(startPos) && startPos + 8 * 2 === endPos) {
        legal = true;
      } if (startPos + 8 === endPos) {
        legal = true;
      }
      break;
    case 'w__knight':
    case 'b__knight':
      const knightOffset = [15, 17, 10, 6];
      if (knightOffset.includes(Math.abs(startPos - endPos))) {
        legal = true;
       }
      break;
    case 'w__bishop':
    case 'b__bishop':
      if (Math.abs(startPos - endPos) % 9 === 0 || Math.abs(startPos - endPos) % 7 === 0) {
        legal = isPathClear(startPos, endPos);
      }
      break;
    case 'w__rook':
    case 'b__rook':
      if (Math.abs(startPos - endPos) % 8 === 0 || Math.abs(startPos - endPos) < startPos + 8) {
        legal = isPathClear(startPos, endPos);
      }
    case 'w__queen':
    case 'b__queen':
      if (Math.abs(startPos - endPos) % 9 === 0 || Math.abs(startPos - endPos) % 7 === 0 ||
          Math.abs(startPos - endPos) % 8 === 0 || Math.abs(startPos - endPos) < startPos + 8
      ) {
        legal = isPathClear(startPos, endPos);
      }
    case 'w__king':
    case 'b__king':
      const kingOffset = [1, 7, 8, 9];
      if (kingOffset.includes(Math.abs(startPos - endPos))) {
        legal = isPathClear(startPos, endPos);
      }
  }
  
  return legal;
}

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

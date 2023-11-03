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
  board = [...initialBoardState];
  console.log('board: ', board);
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

      console.log('pieceName in intiliaze: ', pieceName);
      if (pieceName !== null) {
        let color = pieceName[0];
        let pieceImg = document.createElement('img');
        pieceImg.src = `assets/${pieceName}.svg`;
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
    piece.addEventListener('dragend', dragEnd);
  });
}

// Whenever a piece is dragged selected piece is set to it
function dragStart(event) {
  selectedPiece = event.target;
  if (!selectedPiece.classList.contains(playerTurn)) { return; }
  let startPos = selectedPiece.parentNode.getAttribute('square-id');

  for (let i = 0; i < 64; i++) {
    if (isLegalMove(selectedPiece.alt, startPos, i)) {
      let square = document.querySelector('[square-id="' + i + '"]');
      square.classList.add("move__legal");
    }
  }
}

function dragEnd(event) {
  let squares = document.querySelectorAll('.move__legal');
  squares.forEach(square => {
    square.classList.remove('move__legal')
  });

}

// When the piece is dropped onto a new square
function dragDrop(event) {
  event.stopPropagation();
  console.log(event.target);
  let square = event.target;

  // Checks if moved piece color matches current player turn color
  if (!selectedPiece.classList.contains(playerTurn)) { return; }
  // Finding the opponent color of current player
  const opponent = playerTurn === 'w' ? 'b' : 'w';
  // Checks if the square dropped onto contains a piece
  const capture = square.classList.contains('chess__piece')
  // Checks if the square dropped onto contains a piece from the opponent
  const piece = selectedPiece.alt;
  const startPos = selectedPiece.parentNode.getAttribute('square-id');

  let child = null;
  if (capture) {
    child = square;
    square = square.parentNode;
  }

  const endPos = square.getAttribute('square-id');
  console.log('is legal move: ', !isLegalMove(piece, startPos, endPos));
  if (!isLegalMove(piece, startPos, endPos)) { return; }

  console.log("the child: ", child);
  if (child !== null) {
    child.remove();
    //check if the piece being taken is a king piece
    if (child.alt === 'b__king' || child.alt === 'w__king') {
      if (child.alt === 'b__king') {
        alert('White has won!');
      }
      else if (child.alt === 'w__king') {
        alert('Black has won!');
      }
      reset();
      createBoard();
      initializePieces();
    }
  }

  if (piece === 'w__pawn' || piece === 'b__pawn') {
    //check if its a pawn that can be promoted
    console.log('isPromotion(): ', isPromotion(piece, startPos, endPos));
    if (isPromotion(piece, startPos, endPos)) {
      Promote();
    }
  }

  square.appendChild(selectedPiece);
  board[endPos] = board[startPos];
  board[startPos] = null;

  if (piece === 'w__king' || piece === 'b__king') {
    //check if castling
    console.log('isCastling: ', isCastling(piece, startPos, endPos));
    if (isCastling(piece, startPos, endPos)) {
      //move rook
      castle(piece, startPos, endPos);
    }
  }

  changePlayer();
  saveGame();
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
      const w_startRank = [48, 49, 50, 51, 52, 53, 54, 55];
      //move two spaces if in starting position
      if (w_startRank.includes(startPos) && startPos + -8 * 2 === endPos) {
        console.log('1');
        legal = isPathClear(startPos, endPos) && board[endPos] === null;
      }//move one space
      else if (startPos - 8 === endPos) {
        console.log('2');
        legal = isPathClear(startPos, endPos) && board[endPos] === null;
      }//diagonal capture
      else if ((startPos - 7 === endPos || startPos - 9 === endPos) && board[endPos] !== null) {
        console.log('3');

        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'b__pawn':
      const b_startRank = [8, 9, 10, 11, 12, 13, 14, 15];
      if (b_startRank.includes(startPos) && startPos + 8 * 2 === endPos) {
        legal = isPathClear(startPos, endPos) && board[endPos] === null;

      } else if (startPos + 8 === endPos) {
        legal = isPathClear(startPos, endPos) && board[endPos] === null;
      } else if ((startPos + 7 === endPos || startPos + 9 === endPos) && board[endPos] !== null) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'w__knight':
    case 'b__knight':
      const knightOffset = [15, 17, 10, 6];
      if (knightOffset.includes(Math.abs(startPos - endPos))) {
        let startRank = Math.floor(startPos / 8);
        let startFile = startPos % 8;
        // horizontal edge case
        if (startRank > 5 || startRank < 2 || startFile > 5 || startFile < 2) {
          let endFile = endPos % 8;
          if (Math.abs(endFile - startFile) < 3) {
            legal = board[endPos] === null ? true : (board[endPos] === null ? true : board[endPos][0] !== playerTurn)
          }
        } else {
          legal = (board[endPos] === null ? true : board[endPos][0] !== playerTurn)
        }
      }
      break;

    case 'w__bishop':
    case 'b__bishop':
      if (Math.abs(startPos - endPos) % 9 === 0 || Math.abs(startPos - endPos) % 7 === 0) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'w__rook':
    case 'b__rook':
      if (Math.abs(startPos - endPos) % 8 === 0 || Math.floor(startPos / 8) === Math.floor(endPos / 8)) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      }
      break;
    case 'w__queen':
    case 'b__queen':
      if (Math.abs(startPos - endPos) % 9 === 0 || Math.abs(startPos - endPos) % 7 === 0 ||
        Math.abs(startPos - endPos) % 8 === 0 || Math.abs(startPos - endPos) < startPos + 8
      ) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'w__king':
    case 'b__king':
      const kingOffset = [1, 7, 8, 9];
      if (kingOffset.includes(Math.abs(startPos - endPos))) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      } //castling
      else if (piece === 'w__king' && startPos == 60 && ((endPos == 62 && 'w__rook' === board[63]) || (endPos == 58 && 'w__rook' === board[56]))) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      } //castling
      else if (piece === 'b__king' && startPos == 4 && ((endPos == 2 && 'b__rook' === board[0]) || (endPos == 6 && 'b__rook' === board[7]))) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === null ? true : board[endPos][0] !== playerTurn);
      }
      break;
  }
  console.log(legal);
  return legal;
}

//check if pawn will promote
function isPromotion(piece, startPos, endPos) {
  if (piece === 'w__pawn') {
    //const otherSidePos = ['0', '1', '2', '3', '4', '5', '6', '7'];
    if (endPos >= 0 && endPos <= 7) {
      return true;
    }
    else return false;
  }
  else if (piece === 'b__pawn') {
    //const otherSidePos = ['56', '57', '58', '59', '60', '61', '62', '63'];
    if (endPos >= 56 && endPos <= 63) {
      return true;
    }
    else return false;
  }
}

function Promote() {
  console.log('promotion piece', selectedPiece);
  console.log(selectedPiece.src);
  choices = ['Queen', 'Rook', 'Knight', 'Bishop'];
  let userChoice = '';
  let validChoice = true;
  while (validChoice) {
    userChoice = prompt(`Promotion choices: ${choices.join(', ')}`, 'Queen');
    //userChoice = userChoice.charAt(0).toUpperCase() + userChoice.slice(1);
    if (choices.includes(userChoice.charAt(0).toUpperCase() + userChoice.slice(1))) {
      validChoice = false;
    }
  }
  console.log('alt:', selectedPiece.alt);
  console.log('alt:', selectedPiece.alt[0]);

  const lowerCase = userChoice.charAt(0).toLowerCase() + userChoice.slice(1);
  console.log('lowCase: ', lowerCase)
  selectedPiece.src = `${selectedPiece.alt[0]}` + '__' + `${lowerCase}.svg`;
  selectedPiece.alt = `${selectedPiece.alt[0]}__${lowerCase}`;

  console.log('alt after promote:', selectedPiece.alt);
}

function isCastling(piece, startPos, endPos) {
  if (piece === 'w__king' && startPos == 60 && ((endPos == 62 && 'w__rook' === board[63]) || (endPos == 58 && 'w__rook' === board[56]))) {
    return true;
  }
  else
    if (piece === 'b__king' && startPos == 4 && ((endPos == 6 && 'b__rook' === board[7]) || (endPos == 2 && 'b__rook' === board[0]))) {
      return true;
    }
    else return false;
}

function castle(piece, startPos, endPos) {
  if (piece === 'w__king') {
    if (startPos == 60 && endPos == 62 && 'w__rook' === board[63]) {
      let rookSquare = document.querySelector('[square-id="63"]');
      let rook = rookSquare.querySelector('img');
      let emptySquare = document.querySelector('[square-id="61"]');

      let temp = board[63]; //rook
      board[63] = board[61]; //swap empty space
      board[61] = temp; //swap rook

      emptySquare.appendChild(rook);

      console.log('im rooksquare', rookSquare);
      console.log('im rook', rook);
      console.log('im emptysquare', emptySquare);
    }
    else {
      let rookSquare = document.querySelector('[square-id="56"]');
      let rook = rookSquare.querySelector('img');
      let emptySquare = document.querySelector('[square-id="59"]');

      let temp = board[56]; //rook
      board[56] = board[59]; //swap empty space
      board[59] = temp; //swap rook

      emptySquare.appendChild(rook);

      console.log('im rooksquare', rookSquare);
      console.log('im rook', rook);
      console.log('im emptysquare', emptySquare);
    }
  }
  if (piece === 'b__king') {
    if (startPos == 4 && endPos == 6 && 'b__rook' === board[7]) {
      let rookSquare = document.querySelector('[square-id="7"]');
      let rook = rookSquare.querySelector('img');
      let emptySquare = document.querySelector('[square-id="5"]');

      let temp = board[7]; //rook
      board[7] = board[5]; //swap empty space
      board[5] = temp; //swap rook

      emptySquare.appendChild(rook);

      console.log('im rooksquare', rookSquare);
      console.log('im rook', rook);
      console.log('im emptysquare', emptySquare);
    }
    else {
      let rookSquare = document.querySelector('[square-id="0"]');
      let rook = rookSquare.querySelector('img');
      let emptySquare = document.querySelector('[square-id="3"]');

      let temp = board[0]; //rook
      board[0] = board[3]; //swap empty space
      board[3] = temp; //swap rook

      emptySquare.appendChild(rook);

      console.log('im rooksquare', rookSquare);
      console.log('im rook', rook);
      console.log('im emptysquare', emptySquare);
    }
  }
  console.log('board in castle: ', board);
}

function isPathClear(startPos, endPos) {
  let startRank = Math.floor(startPos / 8);
  let startFile = startPos % 8;
  let endRank = Math.floor(endPos / 8);
  let endFile = endPos % 8;

  let deltaRank = Math.sign(endRank - startRank);
  let deltaFile = Math.sign(endFile - startFile);

  for (let rank = startRank + deltaRank, file = startFile + deltaFile;
    rank !== endRank || file !== endFile;
    rank += deltaRank, file += deltaFile) {
    console.log(rank, file);
    let index = Math.abs(rank) * 8 + Math.abs(file);
    if (board[index] !== null) {
      console.log("invalid move:", index);
      return false;
    }
  }
  return true;
}

function isKingSafe() {
  // NEED TO IMPLEMENT
}

resetButton.addEventListener('click', () => {
  reset();
  createBoard();
  initializePieces();
});

function reset() {
  selectedPiece = null;
  playerTurn = 'w';
  gameStatus.textContent = "White's turn."

  while (chessBoard.hasChildNodes()) {
    chessBoard.removeChild(chessBoard.firstChild);
  }
}

function saveGame() {
  console.log('initial board before saving: ', initialBoardState);
  console.log('board before saving: ', board);
  localStorage.setItem('savedGame', board);
}

// DRIVER START

createBoard();

// Temporary will change to load with game save
playerTurn = 'w';
gameStatus.textContent = "White's turn."
initializePieces();
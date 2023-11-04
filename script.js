//select html elements
const gameContainer = document.getElementById('game__container');
const chessBoard = document.getElementById('chess__board');
const resetButton = document.getElementById('reset__button');
const gameStatus = document.getElementById('game__status');

//state of the game at start
const initialBoardState = [
  "b__rook", "b__knight", "b__bishop", "b__queen", "b__king", "b__bishop", "b__knight", "b__rook",
  "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn", "b__pawn",
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn", "w__pawn",
  "w__rook", "w__knight", "w__bishop", "w__queen", "w__king", "w__bishop", "w__knight", "w__rook"
];

//initialize the board, current selected piece, and who's turn it is
let board = [];
let selectedPiece;
let playerTurn;

//create <div class=chess__square>  elements
function createBoard(loadBoard) {
  board = [...loadBoard];
  console.log('board: ', board);
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      let square = document.createElement('div');
      square.setAttribute('square-id', rank * 8 + file);
      square.classList.add('chess__square');

      //alternate square color
      if ((rank + file) % 2 === 0) {
        square.classList.add('dark');
      }

      //adding events
      square.addEventListener('dragover', dragOver);
      square.addEventListener('drop', dragDrop);
      chessBoard.appendChild(square);
    }
  }
}


//add pieces to chess__square from array: board
function initializePieces() {
  let squares = document.querySelectorAll('.chess__square')
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      let index = (rank * 8) + file;
      let pieceName = board[index];

      console.log('pieceName in intiliaze: ', pieceName);
      //inject piece into square if not an empty space
      if (pieceName !== '') {
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

  //add event listeners to each piece
  pieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
    piece.addEventListener('dragend', dragEnd);
  });
}

//whenever a piece is dragged, selected piece is set to it
function dragStart(event) {
  selectedPiece = event.target;
  if (!selectedPiece.classList.contains(playerTurn)) { return; }
  let startPos = selectedPiece.parentNode.getAttribute('square-id');

  for (let i = 0; i < 64; i++) {
    //check if legal move, if legal, highlight the legal squares
    if (isLegalMove(selectedPiece.alt, startPos, i)) {
      let square = document.querySelector('[square-id="' + i + '"]');
      square.classList.add("move__legal");
    }
  }
}

//after dragging is stopped
function dragEnd(event) {
  let squares = document.querySelectorAll('.move__legal');
  squares.forEach(square => {
    //take off legal move highlights
    square.classList.remove('move__legal')
  });
  // Check if the king is in check after the move
  if (!isKingSafe(playerTurn)) {
    if (isCheckmate(playerTurn)) {
      gameStatus.textContent = (playerTurn === 'w' ? "White" : "Black") + " is in checkmate!";
      // End the game or reset the board
    } else {
      gameStatus.textContent = (playerTurn === 'w' ? "White" : "Black") + " is in check!";
      // Highlight the king or indicate check in some other way
    }
  }
}

function dragDrop(event) {
  event.stopPropagation();
  console.log(event.target);
  let square = event.target;

  // Check if moved piece color matches current player turn color
  if (!selectedPiece.classList.contains(playerTurn)) { return; }

  // Find the opponent color of current player
  const opponentColor = playerTurn === 'w' ? 'b' : 'w';

  // Checks if the square dropped onto contains a piece
  const capture = square.classList.contains('chess__piece');
  
  // Checks if the square dropped onto contains a piece from the opponent
  const piece = selectedPiece.alt;
  const startPos = selectedPiece.parentNode.getAttribute('square-id');

  // If a capture is taking place
  let child = '';
  if (capture) {
    child = square;
    square = square.parentNode;
  }

  const endPos = square.getAttribute('square-id');

  // Check if this is a legal move
  console.log('is legal move: ', isLegalMove(piece, startPos, endPos));
  if (!isLegalMove(piece, startPos, endPos)) { return; }

  // If a piece is being captured, remove it from the board
  if (child !== '') {
    // Do not remove the king, but handle check or checkmate logic
    if (child.alt.includes('__king')) {
      // Handle check or checkmate logic here
      // For now, we'll just prevent the king from being captured
      return;
    } else {
      // Remove the captured piece
      child.remove();
    }
  }

  // Move the piece to its new home
  square.appendChild(selectedPiece);
  board[endPos] = board[startPos];
  board[startPos] = '';

  // Check for promotion
  if (piece.includes('__pawn')) {
    console.log('isPromotion(): ', isPromotion(piece, startPos, endPos));
    if (isPromotion(piece, startPos, endPos)) {
      Promote(startPos);
    }
  }

  // Check if castling
  if (piece.includes('__king')) {
    console.log('isCastling: ', isCastling(piece, startPos, endPos));
    if (isCastling(piece, startPos, endPos)) {
      castle(piece, startPos, endPos); // Move rook
    }
  }

  // After the move, check for check or checkmate
  if (isKingInCheck(opponentColor)) {
    if (isCheckmate(opponentColor)) {
      // End the game with checkmate
      alert((playerTurn === 'w' ? "White" : "Black") + " wins by checkmate!");
      reset();
    } else {
      // Notify the players of a check
      alert((opponentColor === 'w' ? "White" : "Black") + " is in check!");
    }
  }

  // Change player turn
  changePlayer();

  // Save the current game state after move to keep game save up to date
  saveGame();
}

//dragging over a square
function dragOver(event) {
  event.preventDefault();
}

//switches player turn
function changePlayer() {
  if (playerTurn === 'w') {
    playerTurn = 'b';
    gameStatus.textContent = "Black's turn."
  } else {
    playerTurn = 'w';
    gameStatus.textContent = "White's turn."
  }
}

//CHESS LOGIC
function isLegalMove(piece, startPos, endPos) {
  console.log(piece, startPos, endPos);
  let legal = false;

  startPos = Number(startPos);
  endPos = Number(endPos);

  //CHECK IF PATH CLEAR FOR PAWN, QUEEN, KING, ROOK, AND BISHOP
  switch (piece) {
    case 'w__pawn': //white pawn
      const w_startRank = [48, 49, 50, 51, 52, 53, 54, 55];
      //move two spaces if in starting position
      if (w_startRank.includes(startPos) && startPos + -8 * 2 === endPos) {
        legal = isPathClear(startPos, endPos) && board[endPos] === '';
      }//move one space
      else if (startPos - 8 === endPos) {
        legal = isPathClear(startPos, endPos) && board[endPos] === '';
      }//diagonal capture
      else if ((startPos - 7 === endPos || startPos - 9 === endPos) && board[endPos] !== '') {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'b__pawn': //black pawn
      const b_startRank = [8, 9, 10, 11, 12, 13, 14, 15];
      //move two spaces if in starting position
      if (b_startRank.includes(startPos) && startPos + 8 * 2 === endPos) {
        legal = isPathClear(startPos, endPos) && board[endPos] === '';
      }//move one space
      else if (startPos + 8 === endPos) {
        legal = isPathClear(startPos, endPos) && board[endPos] === '';
      }//diagonal capture
      else if ((startPos + 7 === endPos || startPos + 9 === endPos) && board[endPos] !== '') {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'w__knight': //knights
    case 'b__knight':
      const knightOffset = [15, 17, 10, 6];
      if (knightOffset.includes(Math.abs(startPos - endPos))) {
        let startRank = Math.floor(startPos / 8);
        let startFile = startPos % 8;
        // horizontal edge case
        if (startRank > 5 || startRank < 2 || startFile > 5 || startFile < 2) {
          let endFile = endPos % 8;
          if (Math.abs(endFile - startFile) < 3) {
            legal = board[endPos] === '' ? true : (board[endPos] === '' ? true : board[endPos][0] !== playerTurn)
          }
        } else {
          legal = (board[endPos] === '' ? true : board[endPos][0] !== playerTurn)
        }
      }
      break;

    case 'w__bishop': //bishops
    case 'b__bishop':
      if (Math.abs(startPos - endPos) % 9 === 0 || Math.abs(startPos - endPos) % 7 === 0) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'w__rook': //rooks
    case 'b__rook':
      if (Math.abs(startPos - endPos) % 8 === 0 || Math.floor(startPos / 8) === Math.floor(endPos / 8)) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      }
      break;
    case 'w__queen': //queens
    case 'b__queen':
      if (Math.abs(startPos - endPos) % 9 === 0 || Math.abs(startPos - endPos) % 7 === 0 ||
        Math.abs(startPos - endPos) % 8 === 0 || Math.abs(startPos - endPos) < startPos + 8
      ) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      }
      break;

    case 'w__king':
    case 'b__king':
      const kingOffset = [1, 7, 8, 9];
      if (kingOffset.includes(Math.abs(startPos - endPos))) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      } //castling
      else if (piece === 'w__king' && startPos == 60 && ((endPos == 62 && 'w__rook' === board[63]) || (endPos == 58 && 'w__rook' === board[56]))) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      } //castling
      else if (piece === 'b__king' && startPos == 4 && ((endPos == 2 && 'b__rook' === board[0]) || (endPos == 6 && 'b__rook' === board[7]))) {
        legal = isPathClear(startPos, endPos) && (board[endPos] === '' ? true : board[endPos][0] !== playerTurn);
      }
      break;
  }

  //return legal if the path is clear and it moves according to the piece's limits
  console.log(legal);
  return legal;
}

//check if pawn will promote
function isPromotion(piece, startPos, endPos) {
  if (piece === 'w__pawn') {
    if (endPos >= 0 && endPos <= 7) {
      return true;
    }
    else return false;
  }
  else if (piece === 'b__pawn') {
    if (endPos >= 56 && endPos <= 63) {
      return true;
    }
    else return false;
  }
}

//WOO PROMOTION
function Promote(startPos) {
  console.log('promotion piece', selectedPiece);
  console.log(selectedPiece.src);

  //promotion choices
  choices = ['Queen', 'Rook', 'Knight', 'Bishop'];
  let userChoice = '';
  let validChoice = true;

  //until user enters a valid option, loop (case insensitive)
  while (validChoice) {
    userChoice = prompt(`Promotion choices: ${choices.join(', ')}`, 'Queen');
    if (choices.includes(userChoice.charAt(0).toUpperCase() + userChoice.slice(1))) {
      validChoice = false;
    }
  }
  console.log('alt:', selectedPiece.alt);
  console.log('alt:', selectedPiece.alt[0]);

  //convert first letter of choice to lower case
  const lowerCase = userChoice.charAt(0).toLowerCase() + userChoice.slice(1);
  console.log('lowCase: ', lowerCase)

  //set the source for the <img> to the new piece svg
  selectedPiece.src = `assets/${selectedPiece.alt[0]}` + '__' + `${lowerCase}.svg`;
  console.log('selected piece src: ', selectedPiece.src);

  //set the alt for the <img> to the new piece name
  selectedPiece.alt = `${selectedPiece.alt[0]}__${lowerCase}`;
  console.log('alt after promote:', selectedPiece.alt);

  //update the name on the board array
  board[startPos] = `${selectedPiece.alt[0]}` + '__' + `${lowerCase}`;
}

//check if king is castling
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

//PROTECT THE KING
function castle(piece, startPos, endPos) {
  //could've been implemented better (DRY)
  if (piece === 'w__king') {
    //castle w/ rook closest to king
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
      //castle w/ rook farthest from king
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
    //castle w/ rook closest to king
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
      //castle w/ rook farthest from king
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

//check if path is clear
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
    if (board[index] !== '') {
      console.log("invalid move:", index);
      return false;
    }
  }
  return true;
}

// Check if the king of the current player is in check
function isKingSafe(player) {
  // Find the king's position
  let kingPos = findKing(player);
  if (kingPos === -1) return true; // If the king is not found, assume safe (shouldn't happen in a valid game)

  // Check for checks from pawns
  if (pawnCheck(kingPos, player)) return false;

  // Check for checks from knights
  if (knightCheck(kingPos, player)) return false;

  // Check for checks from bishops, rooks, and queens
  if (slidingCheck(kingPos, player)) return false;

  // Check for checks from the opposing king (shouldn't happen normally, but included for completeness)
  if (kingCheck(kingPos, player)) return false;

  // If none of the checks return true, the king is safe
  return true;
}

function findKing(player) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === player + '__king') {
      return i;
    }
  }
  return -1; // King not found (this should not happen if the board is a valid chess position)
}

function pawnCheck(kingPos, player) {
  // Calculate pawn attack positions based on player color
  let attackPositions = player === 'w' ? [kingPos - 7, kingPos - 9] : [kingPos + 7, kingPos + 9];
  for (let pos of attackPositions) {
    if (pos >= 0 && pos < 64 && board[pos] === (player === 'w' ? 'b' : 'w') + '__pawn') {
      return true;
    }
  }
  return false;
}

function knightCheck(kingPos, player) {
  // Calculate knight move positions
  let knightMoves = [kingPos - 17, kingPos - 15, kingPos - 10, kingPos - 6, kingPos + 6, kingPos + 10, kingPos + 15, kingPos + 17];
  for (let pos of knightMoves) {
    if (pos >= 0 && pos < 64 && board[pos] === (player === 'w' ? 'b' : 'w') + '__knight') {
      return true;
    }
  }
  return false;
}

function slidingCheck(kingPos, player) {
  // Directions that bishops, rooks, and queens can move
  let directions = [-9, -8, -7, -1, 1, 7, 8, 9];
  let opponent = player === 'w' ? 'b' : 'w';
  for (let dir of directions) {
    for (let pos = kingPos + dir; pos >= 0 && pos < 64; pos += dir) {
      // If we hit our own piece, break out of the loop
      if (board[pos][0] === player) break;
      // If we hit an opponent's piece, check if it's a bishop, rook, or queen
      if (board[pos][0] === opponent) {
        if ((Math.abs(dir) === 1 || Math.abs(dir) === 8) && board[pos][2] === 'rook') return true;
        if ((Math.abs(dir) === 7 || Math.abs(dir) === 9) && board[pos][2] === 'bishop') return true;
        if (board[pos][2] === 'queen') return true;
        break;
      }
      // If we've moved to a different rank, break out of the loop (for horizontal/vertical moves)
      if (Math.floor(pos / 8) !== Math.floor((pos - dir) / 8)) break;
    }
  }
  return false;
}

function kingCheck(kingPos, player) {
  // Calculate king move positions
  let kingMoves = [kingPos - 9, kingPos - 8, kingPos - 7, kingPos - 1, kingPos + 1, kingPos + 7, kingPos + 8, kingPos + 9];
  for (let pos of kingMoves) {
    if (pos >= 0 && pos < 64 && board[pos] === (player === 'w' ? 'b' : 'w') + '__king') {
      return true;
    }
  }
  return false;
}

//reset game button
resetButton.addEventListener('click', () => {
  reset();
  createBoard(initialBoardState);
  initializePieces();
});

//reset the game
function reset() {
  localStorage.clear();
  selectedPiece = '';
  playerTurn = 'w';
  gameStatus.textContent = "White's turn."

  while (chessBoard.hasChildNodes()) {
    chessBoard.removeChild(chessBoard.firstChild);
  }
}

//save to local storage
function saveGame() {
  console.log('initial board before saving: ', initialBoardState);
  console.log('board before saving: ', board);
  localStorage.setItem('savedGame', board);
  localStorage.setItem('savedPlayerTurn', playerTurn);
}

//load saved game from local storage
function loadGame() {
  let loadedGame = localStorage.getItem('savedGame');

  console.log('loadedGame: ', loadedGame);

  const loadedGameArray = loadedGame.split(',');
  console.log('arary: ', loadedGameArray);

  return loadedGameArray;
}

//load player turn from local storage
function loadPlayerTurn() {
  const loadedPlayerTurn = localStorage.getItem('savedPlayerTurn');

  console.log('loadedPlayerTurn: ', loadedPlayerTurn);

  return loadedPlayerTurn;
}

//check if there was a game saved in local storage
function checkForSavedGame() {
  //get saved game if present
  const gameSave =  localStorage.getItem('savedGame');

  //check for saved game in local storage
  if (gameSave === null) {
    return false; //no game save
  }
  else return true; //game save

}

// DRIVER START

//if theres a saved game, load it
 if (checkForSavedGame()) {
   const loadedGame = loadGame();
   const loadedPlayerTurn = loadPlayerTurn();

   playerTurn = loadedPlayerTurn;

   if (playerTurn === 'w') {
    gameStatus.textContent = "White's turn.";
   }
   else gameStatus.textContent = "Black's turn.";

   createBoard(loadedGame);
   initializePieces();
} 
 else { //if there isn't a saved game, load as if its a new game
   createBoard(initialBoardState);
   initializePieces();
   playerTurn = 'w';
   gameStatus.textContent = "White's turn.";
}
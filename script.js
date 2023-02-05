const COLOR = Object.freeze({
    WHITE: 'WHITE',
    BLACK: 'BLACK',
})

const GAMESTATE = Object.freeze({
    ACTIVE: 'ACTIVE',
    CHECKMATE: 'CHECKMATE',
    STALEMATE: 'STALEMATE',
    DRAWN: 'DRAWN',
})

const PIECE = Object.freeze({
    KING: 'KING',
    ROOK: 'ROOK',
    QUEEN: 'QUEEN',
    BISHOP: 'BISHOP',
    KNIGHT: 'KNIGHT',
    PAWN: 'PAWN',
})

const BOARDSIZE = Object.freeze({
    HEIGHT: 8,
    WIDTH: 8,
})

function togglePlayer(player) {
    return player === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
}

class abstractPiece {
    type;
    color;

    constructor() {
        if (this.constructor === abstractPiece) {
            throw new Error("Abstract Class Piece cannot be instantiated!");
        }
    }

    //Return an array of moves. All validation done EXCEPT king safety.
    getMoves(src, board) {
        var straightMoves = [];
        var diagonalMoves = [];
        var moveDir = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        var maxSize = Math.max(BOARDSIZE.HEIGHT, BOARDSIZE.WIDTH);
        for (var i = 0; i < moveDir.length; i++) {
            for (var j = 0; j < maxSize; j++) {
                var currSquare = board.getSquare(src.getX() + j * moveDir[i][0], src.getY() + j * moveDir[i][1]);
                if (currSquare === src) continue;
                if (currSquare !== null) {
                    if (currSquare.isEmpty()) {
                        if (i < 4) {
                            straightMoves.push(currSquare);
                        } else {
                            diagonalMoves.push(currSquare);
                        }
                        continue;
                    }
                    if (currSquare.getPiece().getColor() === togglePlayer(src.getPiece().getColor())) {
                        if (i < 4) {
                            straightMoves.push(currSquare);
                        } else {
                            diagonalMoves.push(currSquare);
                        }
                    }
                    break;
                }
            }
        }
        return [straightMoves, diagonalMoves];
    }

    //Raw move. Board is responsible for validation.
    moveTo(src, moveSquare) {
        moveSquare.setPiece(this);
        src.setPiece(null);
    }

    getType() {
        return this.type;
    }

    getColor() {
        return this.color;
    }

    getCopyPiece() {

    }
}

class Pawn extends abstractPiece {
    constructor(color) {
        super(color);
        this.color = color;
        this.type = PIECE.PAWN;
    }

    getMoves(src, board) {
        console.log("In getmoves");
        var moveList = [];
        var moveDir = (this.color === COLOR.WHITE ? 1 : -1);
        var startY = (this.color === COLOR.WHITE ? 1 : 6);
        //console.log(src);
        var nextSquare = board.getSquare(src.getX(), src.getY() + moveDir);
        //console.log(nextSquare);
        if (nextSquare.isEmpty()) {
            moveList.push(nextSquare);
            var nextToNextSquare = board.getSquare(src.getX(), src.getY() + 2 * moveDir);
            //console.log(nextToNextSquare);
            if (src.getY() === startY && nextToNextSquare.isEmpty()) {
                moveList.push(nextToNextSquare);
            }
        }
        //console.log(moveList);
        var diagonalSquare1 = board.getSquare(src.getX() - 1, src.getY() + moveDir);
        var diagonalSquare2 = board.getSquare(src.getX() + 1, src.getY() + moveDir);
        var rival = togglePlayer(src.getPiece().getColor());
        if (diagonalSquare1 !== null && !diagonalSquare1.isEmpty() && diagonalSquare1.getPiece().getColor() === rival) moveList.push(diagonalSquare1);
        if (diagonalSquare2 !== null && !diagonalSquare2.isEmpty() && diagonalSquare2.getPiece().getColor() === rival) moveList.push(diagonalSquare2);

        if (board.getTurn() !== 1) {
            var lastMove = board.getMoveRecord(board.getTurn() - 1);
            console.log(board.getTurn() - 1);
            console.log(lastMove);
            if (diagonalSquare1 !== null && lastMove.Piece === PIECE.PAWN && Math.abs(lastMove.From[1] - lastMove.To[1]) === 2 && diagonalSquare1 === board.getSquare(lastMove.From[0], (lastMove.From[1] + lastMove.To[1]) / 2)) moveList.push(diagonalSquare1);
            if (diagonalSquare2 !== null && lastMove.Piece === PIECE.PAWN && Math.abs(lastMove.From[1] - lastMove.To[1]) === 2 && diagonalSquare2 === board.getSquare(lastMove.From[0], (lastMove.From[1] + lastMove.To[1]) / 2)) moveList.push(diagonalSquare2);
        }
        //console.log(moveList);
        return moveList;
    }

    moveTo(src, moveSquare) {
        super.moveTo(src, moveSquare);
        if (moveSquare.getY() === 0 || moveSquare.getY() === BOARDSIZE.HEIGHT - 1) {
            this.promote(moveSquare);
        }
        //TODO: EN Passant
    }

    promote(square) {

        var promoteTo = prompt("Promote pawn to which piece? (Q/R/B/N)");
        if (promoteTo === "Q") {
            square.setPiece(new Queen(square.getPiece().getColor));
        } else if (promoteTo === "R") {
            square.setPiece(new Rook(square.getPiece().getColor));
        } else if (promoteTo === "B") {
            square.setPiece(new Bishop(square.getPiece().getColor));
        } else if (promoteTo === "N") {
            square.setPiece(new Knight(square.getPiece().getColor));
        } else {
            alert("Unrecognized piece. Promoting to Queen. You are welcome.");
            square.setPiece(new Queen(square.getPiece().getColor));
        }
    }

    getCopyPiece() {
        return new Pawn(this.color);
    }
}

class King extends abstractPiece {
    hasMoved;
    constructor(color) {
        super(color);
        this.color = color;
        this.type = PIECE.KING;
        this.hasMoved = false;
    }

    getMoves(src, board) {
        var moveList = [];

        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var currSquare = board.getSquare(src.getX() + i, src.getY() + j);
                if (currSquare !== null && (currSquare.isEmpty() || currSquare.getPiece().getColor() === togglePlayer(src.getPiece().getColor()))) {
                    moveList.push(currSquare);
                }
            }
        }

        //TODO:Castling
        return moveList;
    }

    moveTo(src, moveSquare) {
        super.moveTo(src, moveSquare);
        this.hasMoved = true;
    }

    getCopyPiece() {
        return new King(this.color);
    }
}

class Queen extends abstractPiece {
    constructor(color) {
        super(color);
        this.color = color;
        this.type = PIECE.QUEEN;
    }

    getMoves(src, board) {
        var moveList = super.getMoves(src, board);
        return moveList[0].concat(moveList[1]);
    }

    getCopyPiece() {
        return new Queen(this.color);
    }
}

class Rook extends abstractPiece {
    hasMoved;
    constructor(color) {
        super(color);
        this.color = color;
        this.type = PIECE.ROOK;
        this.hasMoved = false;
    }

    getMoves(src, board) {
        var moveList = super.getMoves(src, board);
        return moveList[0];
    }

    moveTo(src, moveSquare) {
        super.moveTo(src, moveSquare);
        this.hasMoved = true;
    }

    getCopyPiece() {
        return new Rook(this.color);
    }
}

class Bishop extends abstractPiece {
    constructor(color) {
        super(color);
        this.color = color;
        this.type = PIECE.BISHOP;
    }

    getMoves(src, board) {
        var moveList = super.getMoves(src, board);
        return moveList[1];
    }

    getCopyPiece() {
        return new Bishop(this.color);
    }
}

class Knight extends abstractPiece {
    constructor(color) {
        super(color);
        this.color = color;
        this.type = PIECE.KNIGHT;
    }

    getMoves(src, board) {
        var moveList = [];

        for (var i = -2; i <= 2; i++) {
            for (var j = -2; j <= 2; j++) {
                if ((Math.abs(i) === 2 && Math.abs(j) === 1) || (Math.abs(i) === 1 && Math.abs(j) === 2)) {
                    var currSquare = board.getSquare(src.getX() + i, src.getY() + j);
                    if (currSquare !== null && (currSquare.isEmpty() || currSquare.getPiece().getColor() === togglePlayer(src.getPiece().getColor()))) {
                        moveList.push(currSquare);
                    }
                }
            }
        }
        console.log(moveList);
        return moveList;
    }

    getCopyPiece() {
        return new Knight(this.color);
    }
}

class Square {
    x;
    y;
    color;
    piece;

    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    isEmpty() {
        return this.piece === null;
    }

    setPiece(piece) {
        this.piece = piece;
    }

    getPiece() {
        return this.piece;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getColor() {
        return this.color;
    }
}

class Board {
    squares = [];
    capturedPieces = [];
    moveHistory = [];
    turn = 1;

    constructor(board = null) {
        if (board === null) return;
        this.squares = [];
        for (var i = 0; i < BOARDSIZE.WIDTH; i++) {
            this.squares[i] = [];
            for (var j = 0; j < BOARDSIZE.HEIGHT; j++) {
                this.squares[i][j] = new Square(i, j, board.getSquare(i, j).getColor());
                var currPiece = board.getSquare(i, j).getPiece();
                if (currPiece !== null) {
                    this.squares[i][j].setPiece(currPiece.getCopyPiece());
                } else {
                    this.squares[i][j].setPiece(null);
                }
            }
        }
        this.turn = board.turn;
        this.capturedPieces = JSON.parse(JSON.stringify(board.getCapturedPieces()));
        this.moveHistory = JSON.parse(JSON.stringify(board.getMoveHistory()));
    }

    init() {
        this.squares = [];
        for (var i = 0; i < BOARDSIZE.WIDTH; i++) {
            this.squares[i] = [];
            for (var j = 0; j < BOARDSIZE.HEIGHT; j++) {
                var color = ((i + j) % 2) === 0 ? COLOR.BLACK : COLOR.WHITE;
                this.squares[i][j] = new Square(i, j, color);

                var pieceColor = (j <= 1 ? COLOR.WHITE : COLOR.BLACK);
                if (j === 0 || j === 7) {
                    if (i === 0 || i === 7) {
                        this.squares[i][j].setPiece(new Rook(pieceColor));
                    } else if (i === 1 || i === 6) {
                        this.squares[i][j].setPiece(new Knight(pieceColor));
                    } else if (i === 2 || i === 5) {
                        this.squares[i][j].setPiece(new Bishop(pieceColor));
                    } else if (i === 3) {
                        this.squares[i][j].setPiece(new Queen(pieceColor));
                    } else {
                        this.squares[i][j].setPiece(new King(pieceColor));
                    }
                } else if (j === 1 || j === 6) {
                    this.squares[i][j].setPiece(new Pawn(pieceColor));
                } else {
                    this.squares[i][j].setPiece(null);
                }
            }
        }
        this.setTurn(1);
        this.print();
    }

    move(src, dest) {
        if (src.getPiece().getColor() !== this.getCurrentPlayer()) {
            console.log("Move attempted out of turn");
            return;
        }

        if (src === dest) {
            return;
        }

        if (this.validateMove(src, dest)) {
            var destPiece = dest.getPiece();
            src.getPiece().moveTo(src, dest);
            if (destPiece !== null) {
                this.addCapturedPiece(destPiece);
            }

            this.addMoveRecord(src, dest);
            this.toggleTurn();
        }
    }

    addCapturedPiece(piece) {
        this.capturedPieces.push(piece);
    }
    getCapturedPieces() {
        return this.capturedPieces;
    }
    addMoveRecord(src, dest) {
        this.moveHistory.push({
            Piece: dest.getPiece().getType(),
            Color: dest.getPiece().getColor(),
            From: [src.getX(), src.getY()],
            To: [dest.getX(), dest.getY()],
        })
    }
    getMoveHistory() {
        return this.moveHistory;
    }
    getMoveRecord(turn) {
        if (turn >= this.turn || turn <= 0) {
            throw new Error("Move Record out of bounds.");
        } else {
            return this.moveHistory[turn - 1];
        }
    }

    toggleTurn() {
        this.turn++;
    }

    //Doesn't check for turn.
    validateMove(src, dest) {
        console.log("In validate move");
        var moves = src.getPiece().getMoves(src, this);

        var moveFound = false;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].getX() === dest.getX() && moves[i].getY() === dest.getY()) {
                moveFound = true;
                break;
            }
        }
        if (!moveFound) return false;

        //Make the move in a temporary board to see if it leads to check against the moving player.
        //This test not necessary if the target is enemy king. Also avoids infinite loop.
        if (!(dest.getPiece() !== null && dest.getPiece().getType() === PIECE.KING)) {
            var tempBoard = new Board(this);

            var tempSrc = tempBoard.getSquare(src.getX(), src.getY());
            var tempDest = tempBoard.getSquare(dest.getX(), dest.getY());
            tempSrc.getPiece().moveTo(tempSrc, tempDest);

            if (tempBoard.isCheck(this.getCurrentPlayer())) {
                return false;
            }
        }
        return true;
    }

    getAllPieces() {
        var allPieces = [];
        allPieces[COLOR.WHITE] = [];
        allPieces[COLOR.BLACK] = [];
        for (var i = 0; i < BOARDSIZE.WIDTH; i++) {
            for (var j = 0; j < BOARDSIZE.HEIGHT; j++) {
                var currSquare = this.getSquare(i, j);
                //console.log(i+" "+j);
                //console.log(currSquare);
                if (currSquare.getPiece() !== null) {
                    allPieces[currSquare.getPiece().getColor()].push(currSquare);
                }
            }
        }
        return allPieces;
    }

    isCheck(player) {
        console.log("In isCheck()");
        var rival = togglePlayer(player);

        var allPieces = this.getAllPieces();

        var kingSquare;
        for (var i = 0; i < allPieces[player].length; i++) {
            if (allPieces[player][i].getPiece().getType() === PIECE.KING) {
                kingSquare = allPieces[player][i];
                break;
            }
        }
        for (var i = 0; i < allPieces[rival].length; i++) {
            if (this.validateMove(allPieces[rival][i], kingSquare)) {
                return true;
            }
        }

        return false;
    }

    isAnyMovePossible() {
        var allPieces = this.getAllPieces();
        console.log("In isAnyMovePossible()");

        for (var i = 0; i < allPieces[this.getCurrentPlayer()].length; i++) {

            var currSquare = allPieces[this.getCurrentPlayer()][i];
            var currPiece = currSquare.getPiece();
            var moves = currPiece.getMoves(currSquare, this);

            for (var j = 0; j < moves.length; j++) {
                if (this.validateMove(currSquare, moves[j])) {
                    console.log("Move valid");
                    return true;
                }
            }
        }

        console.log("Returning False");
        return false;
    }

    getGameState() {
        if (!this.isAnyMovePossible()) {
            console.log("No moves possible. Checking for Checkmate/Stalemate.");
            if (this.isCheck(this.getCurrentPlayer())) {
                return GAMESTATE.CHECKMATE;
            } else {
                return GAMESTATE.STALEMATE;
            }
        } else if (this.isThreeFoldRepetition()) {
            return GAMESTATE.DRAWN;
        } else {
            return GAMESTATE.ACTIVE;
        }
    }

    isThreeFoldRepetition() {
        if (this.turn <= 6) {
            return false;
        }

        if (this.getMoveRecord(this.turn - 1) === this.getMoveRecord(this.turn - 5) && this.getMoveRecord(this.turn - 2) === this.getMoveRecord(this.turn - 6)) return true;
        return false;
    }

    getTurn() {
        return this.turn;
    }

    setTurn(turn) {
        this.turn = turn;
    }

    getCurrentPlayer() {
        if (this.turn % 2 === 0) {
            return COLOR.BLACK;
        } else {
            return COLOR.WHITE;
        }
    }

    getRivalPlayer() {
        return togglePlayer(this.getCurrentPlayer);
    }

    getSquare(x, y) {
        if (x < 0 || y < 0 || x > BOARDSIZE.WIDTH - 1 || y > BOARDSIZE.HEIGHT - 1) {
            console.log("Out of bounds. Returning null");
            return null;
        } else {
            return this.squares[x][y];
        }
    }

    print() {
        var row = " ";

        for (var i = 0; i < BOARDSIZE.WIDTH; i++) {
            row += "_";
        }

        console.log(row);

        for (var j = BOARDSIZE.HEIGHT - 1; j >= 0; j--) {
            row = "|";
            for (var i = 0; i < BOARDSIZE.WIDTH; i++) {
                if (this.squares[i][j].isEmpty()) {
                    row += ".";
                } else {
                    if (this.squares[i][j].getPiece().getType() === PIECE.PAWN) {
                        row += "p";
                    } else if (this.squares[i][j].getPiece().getType() === PIECE.KING) {
                        row += "K";
                    } else if (this.squares[i][j].getPiece().getType() === PIECE.QUEEN) {
                        row += "Q";
                    } else if (this.squares[i][j].getPiece().getType() === PIECE.BISHOP) {
                        row += "B";
                    } else if (this.squares[i][j].getPiece().getType() === PIECE.ROOK) {
                        row += "R";
                    } else if (this.squares[i][j].getPiece().getType() === PIECE.KNIGHT) {
                        row += "N";
                    }
                }
            }
            row += "|";
            console.log(row);
        }
    }

    render() {
        console.log("Rendering new board.");
        var boardHTML = "";
        for (var j = 0; j < BOARDSIZE.HEIGHT; j++) {
            var rowHTML = "";
            for (var i = 0; i < BOARDSIZE.WIDTH; i++) {
                var square = this.getSquare(i, j);
                var color = square.getColor();
                var pieceImageHTML = "";
                var id = square.getY() * BOARDSIZE.HEIGHT + square.getX();
                if (!square.isEmpty()) {
                    pieceImageHTML = "<img class='noselect' src='./Images/" + square.getPiece().getColor() + square.getPiece().getType() + ".png' ondragstart='onDragStart(event)'>";  //event listener for drag event. img draggable by default.
                }
                //console.log(pieceImageHTML);
                rowHTML += "<div ondragover='onDragOver(event)' ondrop='onDrop(event)' id=" + id + " class='" + color + " square'>" + pieceImageHTML + "</div>";
            }
            boardHTML = rowHTML + boardHTML; //Order important 
        }
        //console.log(boardHTML);
        $(".chessboard").html(boardHTML);
    }
}


function onDragStart(event) {               //TODO: The piece should not have a copy at the original position while it is beign dragged
    event.dataTransfer.effectAllowed = "move";
    var id = event.target.parentElement.id;
    event.dataTransfer.setData("text/plain", id);
    $("#" + id)
    var img = new Image();
    img.src = event.target.getAttribute("src");
    event.dataTransfer.setDragImage(img, 30, 30); //30px offset may need to be calculated in relative terms for resposiveness on smaller screens.
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

function onDrop(event) {
    event.preventDefault();
    var src = event.dataTransfer.getData("text/plain");
    var dest;
    if (event.target.getAttribute("id") === null) {                               //incase target is img element instead of div square. TODO: This is hacky. Find a better solution.
        dest = event.target.parentElement.getAttribute("id");
    } else {
        dest = event.target.getAttribute("id")
    }
    board.move(board.getSquare(src % BOARDSIZE.WIDTH, Math.floor(src / BOARDSIZE.WIDTH)), board.getSquare(dest % BOARDSIZE.WIDTH, Math.floor(dest / BOARDSIZE.WIDTH)));
    board.render();
    if (board.getGameState() !== GAMESTATE.ACTIVE) {
        alert("Game Over by " + board.getGameState());
    }
}
/*
class GameController {
    result;
    score;
    players;

    play() {
        var board = new Board();
        board.init();

        while (board.getGameState() === GAMESTATE.ACTIVE) {
            var nextMove = this.getNextMove();
            board.move(board.getSquare(nextMove[0][0], nextMove[0][1]), board.getSquare(nextMove[1][0], nextMove[1][1]));
            board.print();
        }
    }

    getNextMove() {

        var nextMove = [[4, 1], [4, 2]];
        console.log("Enter next move in array form");
        return nextMove;
    }
}
*/
var board = new Board();
board.init();
board.render();
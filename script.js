const boardSize = 8; //Number of squares in one row or column.
const totalSquares = boardSize * boardSize;

//Unicode Symbols for Chess pieces. No longer needed on board as png images are in use. Useful in the future in annotation etc.
// const unicodeSymbols = {
//     "Br": "&#9820",
//     "Bn": "&#9822",
//     "Bb": "&#9821",
//     "Bq": "&#9819",
//     "Bk": "&#9818",
//     "Bp": "&#9823",
//     "Wr": "&#9814",
//     "Wn": "&#9816",
//     "Wb": "&#9815",
//     "Wq": "&#9813",
//     "Wk": "&#9812",
//     "Wp": "&#9817",
//     "": ""
// }

//Generate the board HTML.
//Generating from white side and moving to black side.
function renderBoard(board) {
    console.log("Rendering new board.");
    let boardHTML = "";
    for (let i = 0; i < boardSize; i++) {
        let rowHTML = "";
        for (let j = 0; j < boardSize; j++) {
            let square = boardSize * i + j;
            //Color based on distance from A1 square
            let color = (((square % boardSize + Math.floor(square / boardSize)) % 2) === 0) ? "white" : "black";
            let pieceImageHTML="";
            if(board[square].piece!==""){
                pieceImageHTML= "<img class='noselect' src='images/"+board[square].piece+".png' ondragstart='onDragStart(event)'>";  //event listener for drag event. img draggable by default.
            }
            rowHTML += "<div ondragover='onDragOver(event)' ondrop='onDrop(event)' id="+square+" class='" + color + " square'>"+pieceImageHTML+"</div>";
        }
        boardHTML = rowHTML + boardHTML; //Order important 
    }
    //console.log(boardHTML);
    $(".chessboard").html(boardHTML);
}

//Pieces at a particular position in the beginning.
//First letter denotes color, 'n' is Knight to avoid conflict with King.
//Empty squares return empty string.
//Does not use boardSize constant. Not usable for custom board.
function initPieceAtPos(i) {
    switch (i) {
        case 0:
        case 7:
            return "Wr";
        case 1:
        case 6:
            return "Wn";
        case 2:
        case 5:
            return "Wb";
        case 3:
            return "Wq";
        case 4:
            return "Wk";
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
            return "Wp";
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
            return "Bp";
        case 56:
        case 63:
            return "Br";
        case 57:
        case 62:
            return "Bn";
        case 58:
        case 61:
            return "Bb";
        case 59:
            return "Bq";
        case 60:
            return "Bk";
        default:
            return "";
    }
};

function onDragStart(event) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", event.target.parentElement.id);
    let img = new Image();
    img.src= event.target.getAttribute("src");
    event.dataTransfer.setDragImage(img, 30 , 30 ); //30px offset may need to be calculated in relative terms for resposiveness on smaller screens.
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}
function onDrop(event) {
    event.preventDefault();
    console.log("In onDrop()");
    let source = event.dataTransfer.getData("text/plain");
    let dest = event.target.getAttribute("id");
    if(validateMove(source,dest)===true){
        console.log(board);
        board[dest].piece=board[source].piece;
        board[source].piece="";
        console.log(board);
        renderBoard(board);
    }
}

function validateMove(source, dest){
    console.log(source + " " + dest);
    return true;
}
function generateBoard() {
    let board = [];
    for (let i = 0; i < totalSquares; i++) {
        board.push({
            pos: i,     //TODO: Remove this property as the array index does the same job.
            piece: initPieceAtPos(i)
        });
    }
    console.log("Generated board.");
    //console.log(board);
    return board;
}

let board = generateBoard();
renderBoard(board);
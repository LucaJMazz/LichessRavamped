var boardOrientation = null;
var boardStatus = null;
document.body.classList.add("my-ext-enabled");
console.log("Script loaded");

let moveData = document.getElementsByTagName('l4x')[0];
if (!moveData) console.log("movelist element not found")
else {
    const movesObserver = new MutationObserver(testStatus); // observes moves, calls function
    movesObserver.observe(moveData, { // observse children, and attributes of children
        childList: true,     
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]        
    });
    testStatus();
}

function testStatus() { // called when mutation occurs in move list
    const size = moveData.childElementCount;

    const currentMove = moveData.getElementsByClassName("a1t")[0];
    console.log('Current Move', currentMove.innerText);

    const result = moveData.getElementsByClassName("result-wrap")[0];

    if (currentMove == moveData.children[size-2] && result) { // current move is second last, and last move is status
        boardStatus = moveData.getElementsByClassName("result-wrap")[0].getElementsByClassName('status')[0].innerText;
        console.log(boardStatus);
        boardStatus = boardStatus.split(' ');
        console.log(boardStatus[boardStatus.length-3]); // gets victor colour from string array
        if (boardStatus[boardStatus.length-3] === 'White') {
            loser("Black")
        } else if (boardStatus[boardStatus.length-3] === 'Black') {
            loser("White")
        }
    } else { // removes mate classes
        let king = document.getElementsByClassName('white king')[0];
        king.classList.remove('mated');
        king = document.getElementsByClassName('black king')[0];
        king.classList.remove('mated');
    }
}

function loser(colour) { 
    let pieceStr = (colour+" king").toLowerCase();
    console.log(pieceStr);
    const king = document.getElementsByClassName(pieceStr)[0];
    king.classList.add('mated');
}

/**
 * 
 * @returns move list as an array
 */
function getMoves() { 
    moveData = document.getElementsByTagName('l4x')[0];
    if (!moveData) return -1; // returns -1 if no movelist found
    let movelist = [];
    for (let i = 0; i<moveData.children.length; i++) {
        if ( i%3 != 0) {
            movelist.push(moveData.children[i].innerText);
        }
    }
    console.log(moveData);
    console.log(movelist);
    return movelist;
}

function getOrientation() {
    const bk = document.getElementsByClassName('black king')[0];
    
    if (boardOrientation!=null) return boardOrientation;
    else if (bk.style.webkitTransform == "translate(211.5px, 493.5px)") {
        boardOrientation = 'black';
        return 'black';
    } else {
        return 'white'
    };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getOrientation") {
        let ornt = getOrientation(); // your existing function
        sendResponse(ornt);
    }
    if (request.action === "getMoves") {
        let list = getMoves(); // your existing function
        sendResponse(list);
    }
    if (request.action === "setOrientation") {
        boardOrientation = request.boardOrientation;
    }
    if (request.action === "toggleCSS") {
        if (request.state) {
            document.body.classList.add("my-ext-enabled");
        } else {
            document.body.classList.remove("my-ext-enabled");
        }
    }
});

getOrientation();

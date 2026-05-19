var boardOrientation = null;
var boardStatus = null;
document.body.classList.add("my-ext-enabled");
console.log("Script loaded");

const moveData = document.getElementsByTagName('l4x')[0];
if (!moveData) console.log("movelist element not found")
else {
    const movesObserver = new MutationObserver(onMoveMade);
    movesObserver.observe(moveData, {
        childList: true,     
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]        
    });
    testStatus();
}
function onMoveMade(mutationList) {
    testStatus();
};

function testStatus() {
    const size = moveData.childElementCount;

    const currentMove = moveData.getElementsByClassName("a1t")[0];
    console.log('Current Move', currentMove.innerText);

    const result = moveData.getElementsByClassName("result-wrap")[0];

    if (currentMove == moveData.children[size-2] && result) {
        boardStatus = moveData.getElementsByClassName("result-wrap")[0].getElementsByClassName('status')[0].innerText;
        console.log(boardStatus);
        boardStatus = boardStatus.split(' ');
        console.log(boardStatus[boardStatus.length-3]);
        if (boardStatus[boardStatus.length-3] === 'White') {
            loser("Black")
        } else if (boardStatus[boardStatus.length-3] === 'Black') {
            loser("White")
        }
    } else {
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


function getMoves() {
    let movelist = [];
    for (let i = 0; i<moveData.children.length; i++) {
        if ( i%3 != 0) {
            movelist.push(moveData.children[i].innerText);
        }
    }
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
    if (request.action === "getMoveList") {
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

"use strict";
import { Chess } from 'chess.js';

// Handle the ON/OFF switch
const styleCheckbox = document.getElementById("styleCheckbox");
const boardDiv = document.getElementById('myBoard');
const reloadButton = document.getElementById("reload");
const flipButton = document.getElementById("flip");
const backButton = document.getElementById("back");
const forwardButton = document.getElementById("forward");

var movelist = null; 
var currMoveIndex = 0;

var config = {
    draggable: true,
    dropOffBoard: 'trash', 
    position: 'start',
    pieceTheme: (piece) => chrome.runtime.getURL(`chessboardJs/img/chesspieces/wikipedia/${piece}.png`)
}
var board = Chessboard('myBoard', config);

flipButton.addEventListener("click", (event) => {
    board.flip();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { // get orientation
        chrome.tabs.sendMessage(tabs[0].id, { action: "setOrientation", boardOrientation: board.orientation() });
    });
})
reloadButton.addEventListener("click", reloadFen);

chrome.storage.sync.get(["styleCheck"], (data) => {
    styleCheckbox.checked = !!data.styleCheck;
    setBadgeText(data.styleCheck, data.scriptCheck);
})

styleCheckbox.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement) {
        chrome.storage.sync.set({"styleCheck": event.target.checked});
        setBadgeText(event.target.checked)
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleCSS", state: styleCheckbox.checked });
    });
})

function setBadgeText(style) {
    let text = style ? "On" : "Off";
    chrome.action.setBadgeText({text: text})
}

function movesToFen(movelist) {
    const counterElement = document.getElementById('counter');
    counterElement.textContent = currMoveIndex+1;
    const chess = new Chess();

    for (const move of movelist) { 
        try {
            chess.move(move);
        } catch {
            console.log('error reading move');
            break;
        }
    }

    return chess.fen();
}

function reloadFen() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getMoves" }, (response) => {
            if (!response) {
                console.log("No response from content script");
                boardDiv.classList.add('hidden');
                return;
            } else if (response == -1) {
                console.log("No movelist found");
                boardDiv.classList.add('hidden');
                return;
            }
            try {
                movelist = response;
                currMoveIndex = movelist.length-1;
                let FEN = movesToFen(movelist);
                boardDiv.classList.remove('hidden');
                board.position(FEN);
            }
            catch (err) {
                boardDiv.classList.add('hidden');
                console.log("FEN conversion failed:", err);
            }
        });
    });
}

document.addEventListener('keydown', (event) => {
    console.log(`Key pressed: ${event.key} | Code: ${event.code}`);
    if (event.key == 'ArrowRight') forward();
    else if (event.key == 'ArrowLeft') back();
});
backButton.addEventListener('click', back);
forwardButton.addEventListener('click', forward);

function back() {
    if (movelist == null) return;
    console.log(movelist);
    
    currMoveIndex--;
    if (currMoveIndex < -1) {
        currMoveIndex = -1;
        board.start();
        return;
    }
    let subMovelist = movelist.slice(0,currMoveIndex+1);

    let FEN = movesToFen(subMovelist);
    board.position(FEN);
}

function forward() {
    if (movelist == null) return;
    console.log(movelist);

    let size = movelist.length-1;
    currMoveIndex++;
    if (currMoveIndex > size) currMoveIndex = size;
    let subMovelist = movelist.slice(0,currMoveIndex+1);

    let FEN = movesToFen(subMovelist);
    board.position(FEN);
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { // get orientation
        chrome.tabs.sendMessage(tabs[0].id, { action: "getOrientation" }, (response) => {
            board.orientation(response);
        });
    });

    reloadFen();
});
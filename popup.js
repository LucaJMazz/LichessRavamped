"use strict";
import { Chess } from 'chess.js';

// Handle the ON/OFF switch
const styleCheckbox = document.getElementById("styleCheckbox");
const reloadButton = document.getElementById("reload");
const flipButton = document.getElementById("flip");

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
            console.log(response);
            let FEN = movesToFen(response);
            board.position(FEN)
        });
    });
}





document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { // get orientation
        chrome.tabs.sendMessage(tabs[0].id, { action: "getOrientation" }, (response) => {
            board.orientation(response);
        });
    });

    reloadFen();
});
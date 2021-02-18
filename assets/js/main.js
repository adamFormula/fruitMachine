"use strict";
const debug = true

const { log, warn, error } = console;

const genRandomNumber = (max) => {
    return Math.floor(Math.random() * (max + 1));
};

const getEl = (selector) => {
    switch (selector[0]) {
        case "#":
            return document.getElementById(selector.slice(1, selector.length));
        case ".":
            return document.getElementsByClassName(
                selector.slice(1, selector.length)
            );
        default:
            return document.getElementsByTagName(selector);
    }
};

const roundHundreds = (num) => Math.round(num / 100) * 100;

const simulateWin = () => {
    game.simulateWin()
};

let game = new SlotMachine(3, 500, 25, "🍎,🍌,🍒,🥕,🍉,🍅,🥥,🥝,💎,💯", 100, debug);
game.startGame()

//DONE Reset reels always with exception of hold reels
//TODO Add events and drive logic with events where appropariate
//TODO Create sound object, control sounds, playing, non-blocking - blocking playing, sounds queue
//TODO Create console object to handle playing game in console
//TODO Add debuging in console
//TODO Create logger and log to file if debugging
//TODO better animations with restarting or non-blocking way should be done in just CSS possibly
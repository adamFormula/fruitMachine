"use strict";
export const debug = true;
export let vh, vhoffset;
import { SlotMachine } from "./slotMachine.js";
import { displayWelcomeMsg } from "./console.js";
export const { log, warn, error, table, clear, group, groupEnd } = console;
export const genRandomNumber = (max) => Math.floor(Math.random() * (max + 1));
export const allEqual = (arr) => arr.every((val) => val === arr[0]);

const adjustReels = () => {
  const lnHeight = Math.round((vhoffset * 72) / 100 / 5);
  game.playField.reels.forEach((reel) => {
    const top = reel.scrollTop / reel.lnHeight;
    reel.style.lineHeight = lnHeight + "px";
    reel.lnHeight = lnHeight;
    reel.scrollTop = top * reel.lnHeight;
  });
};

const handleResize = () => {
  vh = window.innerHeight;
  vhoffset = vh - (vh * 16) / 100;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty("--vh", `${Math.round(vh)}px`);
  document.documentElement.style.setProperty("--vhoffset", `${Math.round(vh - (vh * 16) / 100)}px`);
  adjustReels();
};

export const getEl = (selector) => {
  switch (selector[0]) {
    case "#":
      return document.getElementById(selector.slice(1, selector.length));
    case ".":
      return document.getElementsByClassName(selector.slice(1, selector.length));
    default:
      return document.getElementsByTagName(selector);
  }
};

const roundTOlnHeight = (num, lnHeight) => Math.round(num / lnHeight) * lnHeight;

const simulateWin = () => game.simulateWin();
clear();
window.game = new SlotMachine(3, 500, 25, "🍎,🍌,🍒,🥕,🍉,🍅,🥥,🥝,💎,💯", 100, debug);
displayWelcomeMsg();
window.onresize = handleResize;
handleResize();
game.startGame();

//DONE Reset reels always with exception of hold reels
//DONE buttons object extended with properties: isActive, isSelected etc...
//DONE Add events and drive logic with events where appropariate
//DONE Replace events with Promise
//DONE in playField.js processResults needs to be split and refactored. Some parts belong to overlay
//TODO Create sound object, control sounds, playing, non-blocking - blocking playing, sounds queue
//TODO Create console object to handle playing game in console
//TODO Add debuging in console
//TODO Create logger and log to file if debugging
//TODO better screen animations (not reels) with restarting or non-blocking way should be done in just CSS possibly

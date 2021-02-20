"use strict";
class Overlay {
    constructor(options) {
        this.options = options;
        this._msg = "";
        this._msgObj = getEl(".popup")[0];
    }

    showMsg = (time) => {
        let overlay = getEl("#game-overlay");
        if (!overlay.classList.contains("show")) {
            overlay.classList.add("show");
        }
        overlay.classList.remove("hide");
        if (time > 0) setTimeout(this.hideMsg.bind(this), time);
    };

    set msg(txt) {
        this._msg = txt;
        this._msgObj.innerHTML = this._msg;
    }

    get msg() {
        return this._msg;
    }

    hideMsg = () => {
        let overlay = getEl("#game-overlay");
        if (!overlay.classList.contains("hide")) {
            overlay.classList.add("hide");
        }
        overlay.classList.remove("show");
    };

    loose = () => {
        this.msg = "No win this TIME!!!";
        this.showMsg(this.options.timeouts.overlay.lose); //show overlay message
    };

    hold = () => {
        this.msg = `<span style='color:red'>HOLD!!!</span>\n<span style='color:yellow'>Select reels to hold</span>`;
        this.showMsg(this.options.timeouts.overlay.hold); //display message in screen overlay
    };

    win = (fruit, prize) => {
        this.msg = `3 x ${fruit}${fruit}${fruit}\n<span style='color:green'>WIN!!!</span>\n<span style='color:yellow'>$${prize}</span>`;
        this.showMsg(this.options.timeouts.overlay.win); //show overlay message informing about winning
    };

    gameOver = () => {
        this.msg = `GAME OVER!!!
                <button class="start comicFont" onclick="game.overlay.hideMsg(); game.playField._sounds.start.play();game.playField.resetReels();game.rulesField.makeRules();game.resultsField.reset()">START AGAIN</button>`;
        this.showMsg(-1);
    };
    startGame = () => {
        this.msg = `Welcome to <span style='color: blue'>F</span><span style='color: red'>R</span><span style='color: yellow'>U</span><span style='color: blue'>I</span><span style='color: green'>T</span> <span style='color: red'>M</span><span style='color: blue'>A</span><span style='color: red'>C</span><span style='color: yellow'>H</span><span style='color: blue'>I</span><span style='color: green'>N</span>E!
        Press start to begin
        <button class="start comicFont" onclick="game.overlay.hideMsg(); game.playField._sounds.start.play();game.playField.resetReels();game.rulesField.makeRules()">START</button>`;
        this.showMsg(-1);
    };
}

"use strict";

class PlayField {
    constructor(parent, options) {
        this.parent = parent;
        this.options = options;
        this.hldButtons = getEl(".btnHold");
        this._reels = Array.from(getEl(".reel"));
        this._hold = [];
        this._holdEnabled = false;
        this._flags = { spin: false, spinning: false, hold: false, lastReel: 0 };
        this._sounds = {
            hold: new Audio("./assets/snd/hold.wav"),
            spin: new Audio("./assets/snd/spin.wav"),
            reelStop: new Audio("./assets/snd/reelStop.wav"),
            reelSpins: new Audio("./assets/snd/reelSpins.wav"),
            win: new Audio("./assets/snd/win.wav"),
            loseTracks: [
                "./assets/snd/loses1.wav",
                "./assets/snd/loses2.wav",
                "./assets/snd/loses3.wav",
                "./assets/snd/loses4.wav",
                "./assets/snd/loses5.wav",
                "./assets/snd/loses6.wav",
                "./assets/snd/loses7.wav",
                "./assets/snd/loses8.wav",
                "./assets/snd/loses9.wav",
                "./assets/snd/loses10.wav",
                "./assets/snd/loses11.wav",
            ],
            loses: new Audio(), //crowd-groan.wav'),
            getsHold: new Audio("./assets/snd/getsHold.wav"), //car_break.wav'),
            start: new Audio("./assets/snd/gameStart.wav"),
            gameOver: new Audio("./assets/snd/gameOver.wav"),
        };
        this.initEventListeners();
        this.extendReelsProp();
    }
    get isSpin() {
        return this._flags.spin;
    }
    get isSpinning() {
        return this._flags.spinning;
    }

    set isSpin(value) {
        this._flags.spin = value;
    }
    set isSpinning(value) {
        this._flags.spinning = value;
    }
    initEventListeners() {
        document.addEventListener(
            "reel",
            function(event) {
                // (1)
                if (event.detail.status == "completed") {
                    this.isSpinning = false;
                    log("asas");
                    this.clearHold();
                    this.displayOverlay(false);
                }
                if (event.detail.status == "scrolling") {
                    if (this.parent.debug) log(`Reel ${event.detail.index} is spinning`);
                }
                // log(event, event.detail.index); // Hello from H1
            }.bind(this)
        );
        document.addEventListener("scrolling", function(event) {
            // (1)
            log(event, event.type, event.detail.index); // Hello from H1
        });
    }

    sendEvent(elem, type, obj) {
        elem.dispatchEvent(
            new CustomEvent(type, {
                bubbles: true,
                detail: obj,
            })
        );
    }

    set hold(value) {
        if (!this._hold.includes(value)) {
            this._hold.push(value);
        }
    }

    get hold() {
        return this._hold;
    }

    get reels() {
        return this._reels;
    }

    getFruits(value) {
        return Array.from(this.reels[value].innerHTML);
    }

    extendReelsProp() {
        this.reels.forEach((reel, index) => {
            reel.lnHeight = parseInt(
                window
                .getComputedStyle(this.reels[index])
                .getPropertyValue("line-height")
                .replace("px", "")
            );
            reel.index = index;
            reel.isLast = function() {
                return this._flags.lastReel == index ? true : false;
            }.bind(this);
            reel.events = {
                idle: function() {
                    this.sendEvent(this.reels[index], "reel", {
                        index: index,
                        status: "idle",
                    });
                }.bind(this),
                scrolling: function() {
                    this.sendEvent(this.reels[index], "reel", {
                        index: index,
                        status: "scrolling",
                    });
                }.bind(this),
                spinFinished: function() {
                    this.sendEvent(this.reels[index], "reel", {
                        index: index,
                        status: "completed",
                    });
                }.bind(this),
            };
        });
    }

    set unHold(value) {
        if (this._hold.includes(value)) {
            const index = this._hold.indexOf(value);
            if (index !== -1) {
                this._hold.splice(index, 1);
            }
        }
    }

    set holdEnabled(bool) {
        this._holdEnabled = bool;
    }

    get holdEnabled() {
        return this._holdEnabled;
    }

    scrollReel = (index, distance) => {
        const reel = this.reels[index];
        reel.scrollTop += distance;
    };

    onHold = (value) => {
        return this._hold.includes(value);
    };

    reelSpinsSound = () => {
        this._sounds.spin.play();
        const tick = this._sounds.reelSpins;
        const sounds = [];
        const obj = this;
        for (let index = 0; index < 22; index++) {
            sounds.push(
                setInterval(function() {
                    tick.play();
                }, 22 * (index + 1))
            );
            setTimeout(clearInterval, (index + 1) * 100, sounds[index]);
        }
        let keeper = setInterval(function() {
            if (!obj.isSpinning) {
                sounds.forEach((sound) => {
                    clearInterval(sound);
                });
                clearInterval(keeper);
            }
        }, 40);
    };

    activateHold = () => {
        const buttons = Array.from(this.hldButtons);
        buttons.forEach((button) => {
            button.classList.add("holdActive");
            button.classList.remove("holdNormal");
        });
        this.holdEnabled = true;
        log(buttons, this.holdEnabled);
    };

    scrollTo = (to, duration, easingFn, element) => {
        let start = element.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20;
        const animateScroll = () => {
            // increment the time
            currentTime += increment;
            // move scrollTop of element by result of in-out easing function
            element.scrollTop = easingFn(currentTime, start, change, duration);

            // do the animation unless its over
            if (currentTime < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                if (
                    element.events.spinFinished &&
                    typeof element.events.spinFinished === "function" &&
                    element.isLast()
                ) {
                    // the animation is done so lets callback
                    element.events.spinFinished();
                    if (this.parent.debug) log(
                        currentTime,
                        duration,
                        element.scrollTop,
                        element.isLast(),
                        element.index
                    );
                }
            }
        };
        animateScroll();
    };

    clearHold = () => {
        const buttons = Array.from(this.hldButtons);
        buttons.forEach((button) => {
            button.classList.remove("holdActive", "holdSelected");
            button.classList.add("holdNormal");
        });
        this._hold = [];
        this.holdEnabled = false;
    };

    toogleHoldBtn = (element, index) => {
        if (this.holdEnabled) {
            this._sounds.hold.play();
            if (element.classList.contains("holdActive")) {
                this.hold = index;
                element.classList.add("holdSelected");
                element.classList.remove("holdActive");
            } else {
                this.unHold = index;
                element.classList.remove("holdSelected");
                element.classList.add("holdActive");
            }
        }
    };
    resetReels = () => {
        const reels = this.reels;
        let reelsTotHeight = 0;
        while (reelsTotHeight != 53000 * (3 - this.hold.length)) {
            reelsTotHeight = 0;
            reels.forEach((reel, index) => {
                if (!this.hold.includes(index)) {
                    reel.innerHTML = this.parent
                        .shuffle3Times(this.parent.generateReel())
                        .join("");
                    reel.scrollTop = 0;
                    if (this.parent.debug) log(reel.scrollHeight);
                    reelsTotHeight += reel.scrollHeight;
                }
            });
        }
    };

    play = () => {
        if (!this.isSpin) {
            this.resetReels();
            this.isSpin = true;
            this.parent.resultsField.spins++;
            this.parent.resultsField.inOut = -1;
            this.animateReels();
        }
    };

    spinReels = () => {
        this.reels.forEach((reel) => {
            if (!this.onHold(reel.index)) {
                this._flags.lastReel = reel.index;
            }
            this.scrollTo(7950, 2500 + reel.index * 500, easeOutQuad, reel);
        });
    };

    animateReels = () => {
        this.reelSpinsSound();
        this.isSpinning = true;
        this.spinReels();
        this.holdEnabled = false;
    };

    displayOverlay = (simulate = false) => {
        let results;
        if (simulate) results = Array(3).fill(this.parent.generateFruit());
        else {
            results = [
                this.getFruits(0)[this.reels[0].scrollTop / this.reels[0].lnHeight + 2],
                this.getFruits(1)[this.reels[1].scrollTop / this.reels[1].lnHeight + 2],
                this.getFruits(2)[this.reels[2].scrollTop / this.reels[2].lnHeight + 2],
            ];
        }
        if (this.parent.debug) log(results);
        if (
            Math.floor(Math.random() * (100 / game.holdChance) + 1) == 1 &&
            !results.every(function(val, i, arr) {
                return val === arr[0];
            })
        ) {
            this.activateHold();
            this._sounds.getsHold.play();
            this.parent.overlay.msg = `<span style='color:red'>HOLD!!!</span>\n<span style='color:yellow'>Select reels to hold</span>`;
            this.parent.overlay.showMsg(this.options.timeouts.overlay.hold);
        } else if (
            results.every(function(val, i, arr) {
                return val === arr[0];
            })
        ) {
            this.parent.fruits.forEach((fruit) => {
                if (results.includes(fruit)) {
                    let prize = this.parent.getPrize(fruit);
                    this._sounds.win.play();
                    if (this.parent.debug)
                        log(
                            `%cYou win :o) %c£${prize}}`,
                            "color:green,font-weight:bold",
                            "color:yellow,background-color:brown"
                        );
                    this.parent.resultsField.wins = [prize, fruit];
                    this.parent.overlay.msg = `3 x ${fruit}${fruit}${fruit}\n<span style='color:green'>WIN!!!</span>\n<span style='color:yellow'>$${prize}</span>`;
                    this.parent.overlay.showMsg(this.options.timeouts.overlay.win);
                }
            });
        } else {
            this.parent.resultsField.loses = 1;
            if (this.parent.resultsField.cash <= 0) {
                this._sounds.gameOver.play();
                this.parent.rulesField.clearRules();
                this.parent.overlay.gameOver();
            } else {
                this.parent.overlay.msg = "No win this TIME!!!";
                this._sounds.loses.src = this._sounds.loseTracks[
                    genRandomNumber(this._sounds.loseTracks.length - 1)
                ];
                this._sounds.loses.load();
                this._sounds.loses.play();
                this.parent.overlay.showMsg(this.options.timeouts.overlay.lose);
            }
        }
        this.isSpin = false;
    };
}
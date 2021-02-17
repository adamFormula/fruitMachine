class PlayField {
    constructor(parent, options) {
        this.parent = parent;
        this.options = options;
        this.hldButtons = getEl(".btnHold");
        this._reels = getEl(".reel");
        this._reelsObj = null;
        this._hold = [];
        this._holdEnabled = false;
        this._spinEnabled = false;
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
            getsHold: new Audio(
                "./assets/snd/getsHold.wav"
            ), //car_break.wav'),
            start: new Audio("./assets/snd/gameStart.wav"),
            gameOver: new Audio(
                "./assets/snd/gameOver.wav"
            ),
        };
        this.spinning = false;
    }

    set hold(value) {
        if (!this._hold.includes(value)) {
            this._hold.push(value);
        }
    }

    set spin(value) {
        this._spinEnabled = value;
    }

    set reelsObj(reels) {
        this._reelsObj = [{
                lnHeight: parseInt(
                    window
                    .getComputedStyle(reels[0])
                    .getPropertyValue("line-height")
                    .replace("px", "")
                ),
                fruits: Array.from(reels[0].innerHTML),
                index: 0,
            },
            {
                lnHeight: parseInt(
                    window
                    .getComputedStyle(reels[1])
                    .getPropertyValue("line-height")
                    .replace("px", "")
                ),
                fruits: Array.from(reels[1].innerHTML),
                index: 1,
            },
            {
                lnHeight: parseInt(
                    window
                    .getComputedStyle(reels[2])
                    .getPropertyValue("line-height")
                    .replace("px", "")
                ),
                fruits: Array.from(reels[2].innerHTML),
                index: 2,
            },
        ];
    }

    get reelsObj() {
        return this._reelsObj;
    }

    get spin() {
        return this._spinEnabled;
    }

    get hold() {
        return this._hold;
    }

    get reels() {
        this._reels = getEl(".reel");
        return this._reels;
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
            if (!obj.spinning) {
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
        const reels = Array.from(this.reels);
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
        if (this.spin) {
            this.animateReels();
            this.spin = false;
            this.resetReels();
            this.reelsObj = this.reels;
            this.parent.resultsField.spins++;
            this.parent.resultsField.inOut = -1;
            this._sounds.spin.play();
            this.reelSpinsSound();
        }
    };

    spinReel = (index) => {
        const fps = 60;
        const interval = 1000 / fps;
        const duration = this.options.spinDurations[index];
        for (let counter = 0; counter < duration; counter++) {
            if (counter == duration - 1) {
                setTimeout(
                    this.finalAnimiation.bind(this),
                    10 * interval * counter,
                    index
                );
            } else {
                let distance =
                    ((index == 0 ? 110 : index == 1 ? 106 : 102) / (counter + 2)) * 1;
                let intervalId = setInterval(
                    this.scrollReel.bind(this),
                    interval,
                    index,
                    distance
                );
                setTimeout(clearInterval, 10 * interval * (counter + 1), intervalId);
            }
        }
    };

    finalAnimiation = (index) => {
        const lnHeight = this.reelsObj[index].lnHeight;
        const reel = this.reels[index];
        const lastReel = Array.from(Array(this.reels.length).keys())
            .filter((ele) => !this.onHold(ele))
            .slice(-1);
        if (this.parent.debug) log(lastReel, index);

        const offset =
            reel.scrollTop - Math.round(reel.scrollTop / lnHeight) * lnHeight;
        const target = roundHundreds(reel.scrollTop);
        const fps = 250;
        const interval = 1000 / fps;
        const timer = interval * Math.abs(offset);
        if (this.parent.debug) log(offset, target, interval, Math.abs(offset));
        if (offset < 0) {
            let timerId = setInterval(this.scrollReel.bind(this), interval, index, 1);
            setTimeout(clearInterval, timer, timerId);
            this._sounds.reelStop.play();
            if (lastReel == index) {
                setTimeout(this.displayOverlay.bind(this), 250);
                this.clearHold();
                this.spinning = false;
            }
        } else {
            let timerId = setInterval(
                this.scrollReel.bind(this),
                interval,
                index, -1
            );
            this._sounds.reelStop.play();
            setTimeout(clearInterval, timer, timerId);
            if (lastReel == index) {
                setTimeout(this.displayOverlay.bind(this), timer);
                this.clearHold();
                this.spinning = false;
            }
        }
    };

    animateReels = () => {
        this.spinning = true;
        for (let index = 0; index < this.reels.length; index++) {
            if (!this.onHold(index)) {
                this.spinReel(index);
            }
        }
    };

    displayOverlay = (simulate = false) => {
        let results;
        if (simulate) results = Array(3).fill(this.parent.generateFruit());
        else {
            results = [
                this.reelsObj[0].fruits[
                    this.reels[0].scrollTop / this.reelsObj[0].lnHeight + 2
                ],
                this.reelsObj[1].fruits[
                    this.reels[1].scrollTop / this.reelsObj[1].lnHeight + 2
                ],
                this.reelsObj[2].fruits[
                    this.reels[2].scrollTop / this.reelsObj[2].lnHeight + 2
                ],
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
        this.spin = true;
    };
}
"use strict";

class PlayField {
    constructor(parent, options) {
        this.parent = parent;
        this.options = options;
        this.hldButtons = getEl(".btnHold");
        this._reels = Array.from(getEl(".reel"));
        this._hold = [];
        this._holdEnabled = false;
        this._flags = { spinning: false, hold: false, lastReel: 0 };
        this._sounds = {
            hold: new Audio("./assets/snd/hold.wav"),
            reelStarting: new Audio("./assets/snd/spin.wav"),
            reelStopping: new Audio("./assets/snd/reelStop.wav"),
            reelSpinning: new Audio("./assets/snd/reelSpins.wav"),
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
            loses: new Audio(),
            getsHold: new Audio("./assets/snd/getsHold.wav"),
            start: new Audio("./assets/snd/gameStart.wav"),
            gameOver: new Audio("./assets/snd/gameOver.wav"),
        };
        this.initEventListeners();
        this.extendReelsProp();
    }

    get isSpinning() {
        return this._flags.spinning;
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
                    this.clearHold();
                    this.displayOverlay(false);
                }
                if (event.detail.status == "scrolling") {
                    if (this.parent.debug) log(`Reel ${event.detail.index} is spinning`);
                }
            }.bind(this)
        );
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
            reel.sounds = {
                spinning: function() {
                    this._sounds.reelSpinning.play();
                }.bind(this),
                stopping: function() {
                    this._sounds.reelStopping.play();
                }.bind(this),
                starting: function() {
                    this._sounds.reelStarting.play();
                }.bind(this),
            };
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
            Object.defineProperty(reel, "isLast", {
                get: function() {
                    return this._flags.lastReel == reel.index ? true : false;
                }.bind(this),
            });
            Object.defineProperty(reel, "isOnHold", {
                get: function() {
                    return this._hold.includes(reel.index);
                }.bind(this),
                set: function(value) {
                    this.hold = reel.index;
                }.bind(this),
            });
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

    activateHold = () => {
        const buttons = Array.from(this.hldButtons);
        buttons.forEach((button) => {
            button.classList.add("holdActive");
            button.classList.remove("holdNormal");
        });
        this.holdEnabled = true;
    };

    scrollReel = (to, duration, easingFn, element) => {
        let start = element.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20,
            displacement;
        element.sounds.starting();
        const animateScroll = () => {
            // increment the time
            currentTime += increment;
            displacement =
                typeof displacement === "undefined" ? 0 : element.scrollTop;
            // move scrollTop of element by result of easing function
            element.scrollTop = easingFn(currentTime, start, change, duration);
            displacement -= element.scrollTop;
            if (Math.abs(displacement) > 10 && element.isLast) {
                element.sounds.spinning();
            }
            // do the animation unless its over
            if (currentTime < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                element.sounds.stopping();
                if (
                    element.events.spinFinished &&
                    typeof element.events.spinFinished === "function" &&
                    element.isLast
                ) {
                    // the animation is done so lets callback
                    setTimeout(element.events.spinFinished, 100); //little delay before calling event to let sounds finish before
                    if (this.parent.debug)
                        log(
                            currentTime,
                            duration,
                            element.scrollTop,
                            element.isLast,
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

    spinBtnClick = () => { //fired when spin button is pressed
        if (!this.isSpinning) { //check if reels are not spinning, stop if true
            this.isSpinning = true; //mark flag to stop spin button functionality
            this.holdEnabled = false; //mark flag to disable hold buttons functionality
            this.resetReels(); //re-generate reels, reset topScroll for each reel to 0
            this.parent.resultsField.spins++; //increment by 1 number of spins, update results sidebar with new value
            this.parent.resultsField.inOut = -1; //chagne balance of cash, display animation and update results sidebar
            this.spinReels(); //call method to spin reels
        }
    };

    resetReels = () => {
        const reels = this.reels; //reels object assigned to variable
        let reelsTotHeight = 0; //variable to keep sum of reels heights
        while (reelsTotHeight != 53000 * (3 - this.hold.length)) { //keep randmosing reels untill total sum of their heights is equal to 3 * 500 * 106 (number of reels * number of slots * line height)
            reelsTotHeight = 0; // zero value of height at each iteration
            reels.forEach(reel => { //iterate reels object
                if (!reel.isOnHold) { //if reel is not on hold
                    reel.innerHTML = this.parent //call parent method to generate and shuffle 3 times reel, before returning as string
                        .shuffle3Times(this.parent.generateReel())
                        .join("");
                    reel.scrollTop = 0; //reset reel scrollTop position to 0
                    if (this.parent.debug) log(reel.scrollHeight); //show debug msg
                    reelsTotHeight += reel.scrollHeight; //increment total reels height by reel height
                }
            });
        }
    };

    spinReels = () => {
        this.reels.forEach((reel) => { //iterate reels object
            if (!reel.isOnHold) { //check if reel is not on hold
                this._flags.lastReel = reel.index; //mark reel as last
                let distance = reel.lnHeight * (Math.floor(Math.random() * 10) + 20); //randomise reel animation distance
                let duration = 2500 + reel.index * 500; //calculate duration as time in ms + (reel index * 500 ms) to give delay to reels
                let easingFunction = easeOutQuad; //callback easing function for animation
                this.scrollReel(distance, duration, easingFunction, reel); //call reel animation method
            }
        });
    };

    displayOverlay = (simulate = false) => {
        let results; //create variabe to hold results
        if (simulate) results = Array(3).fill(this.parent.generateFruit()); //if simulate : true generate random winning result
        else {
            results = [
                this.getFruits(0)[this.reels[0].scrollTop / this.reels[0].lnHeight + 2], //read each reel fruit based on current scrollTop position / line height of each icon
                this.getFruits(1)[this.reels[1].scrollTop / this.reels[1].lnHeight + 2], //read each reel fruit based on current scrollTop position / line height of each icon
                this.getFruits(2)[this.reels[2].scrollTop / this.reels[2].lnHeight + 2], //read each reel fruit based on current scrollTop position / line height of each icon
            ];
        }
        if (this.parent.debug) log(results);
        if ( //if random number is within accepted range and you are not having a winning result you will get hold
            Math.floor(Math.random() * (100 / game.holdChance) + 1) == 1 && //check if you got hold
            !results.every(function(val, i, arr) { //check if all elements of array are NOT the same (not winning)
                return val === arr[0];
            })
        ) {
            this.activateHold(); //run method to handle hold
            this._sounds.getsHold.play(); //play sound for hold
            this.parent.overlay.msg = `<span style='color:red'>HOLD!!!</span>\n<span style='color:yellow'>Select reels to hold</span>`;
            this.parent.overlay.showMsg(this.options.timeouts.overlay.hold); //display message in screen overlay
        } else if (
            results.every(function(val, i, arr) { //otherwise check if all elements of array are the same (winning)
                return val === arr[0];
            })
        ) {
            this.parent.fruits.forEach((fruit) => { //iterate throug all kinds of fruits we have
                if (results.includes(fruit)) { //to find matching fruit
                    let prize = this.parent.getPrize(fruit); //get prize generaed for that fruit from parent object
                    this._sounds.win.play(); //play wining sound
                    if (this.parent.debug) //debug msg
                        log(
                        `%cYou win :o) %c£${prize}}`,
                        "color:green,font-weight:bold",
                        "color:yellow,background-color:brown"
                    );
                    this.parent.resultsField.wins = [prize, fruit]; //add history to results sidebar
                    this.parent.overlay.msg = `3 x ${fruit}${fruit}${fruit}\n<span style='color:green'>WIN!!!</span>\n<span style='color:yellow'>$${prize}</span>`;
                    this.parent.overlay.showMsg(this.options.timeouts.overlay.win); //show overlay message informing about winning
                }
            });
        } else {
            this.parent.resultsField.loses = 1; //otherwise if no luck increment loses and update result sidebar
            if (this.parent.resultsField.cash <= 0) { //if out of money...
                this._sounds.gameOver.play(); //play game over sound
                this.parent.rulesField.clearRules(); //clear content of rules sidebar
                this.parent.overlay.gameOver(); //display overlay infomring about game over
            } else { //otherwise...
                this.parent.overlay.msg = "No win this TIME!!!";
                this._sounds.loses.src = this._sounds.loseTracks[ //play choose random loosing sound from array
                    genRandomNumber(this._sounds.loseTracks.length - 1)
                ];
                this._sounds.loses.load(); //load into player
                this._sounds.loses.play(); //play sound
                this.parent.overlay.showMsg(this.options.timeouts.overlay.lose); //show overlay message
            }
        }
        this.isSpinning = false; //mark flag to re-enable spin button functionality
    };
}
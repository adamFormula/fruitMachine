"use strict";

// PlayField object is handling interactions between HTML elements placed in playField - central part
// with reels. It handles reels animation, sounds and communicates with other objects including parent SlotMachine.

class PlayField {
    constructor(parent, options) {
            this.parent = parent;
            this.options = options;
            this._hldButtons = Array.from(getEl(".btnHold"));
            this._reels = Array.from(getEl(".reel"));
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
            this.addPropertiesToReels();
        }
        //PROPERTIES
    get isSpinning() {
        //returns isSpinning flag
        return this._flags.spinning;
    }

    set isSpinning(value) {
        //sets isSpinning flag
        this._flags.spinning = value;
    }

    set isHoldEnabled(bool) {
        //sets hold flag
        this._flags.hold = bool;
    }

    get isHoldEnabled() {
        //returns hold flag
        return this._flags.hold;
    }

    get sizeReelsOnHold() {
        // returns number of reels on hold
        return this.reels.filter((reel) => {
            return reel.isOnHold;
        }).length;
    }

    get reels() {
            //returns reels obj
            return this._reels;
        }
        //METHODS
    initEventListeners() {
        //initialise custom events listener
        document.addEventListener(
            //adds event listener for events coming from reels animation
            "reel",
            (event) => {
                // (1)
                if (event.detail.status == "completed") {
                    this.clearHold();
                    this.processResults(false);
                }
            }
        );
    }

    sendEvent = (elem, type, obj) => {
        //dispatches events from elements
        elem.dispatchEvent(
            new CustomEvent(type, {
                bubbles: true,
                detail: obj,
            })
        );
    };

    addPropertiesToReels = () => {
        //extends reels object with additional properties
        this.reels.forEach((reel, index) => {
            //iterating reels
            reel.lnHeight = parseInt(
                //adding property of line height to object
                window
                .getComputedStyle(this.reels[index])
                .getPropertyValue("line-height")
                .replace("px", "")
            );
            reel.index = index;
            reel.sounds = {
                //adding sounds callbacks
                spinning: () => {
                    this._sounds.reelSpinning.play();
                },
                stopping: () => {
                    this._sounds.reelStopping.play();
                },
                starting: () => {
                    this._sounds.reelStarting.play();
                },
            }; //adding events callbacks
            reel.events = {
                idle: () => {
                    this.sendEvent(this.reels[index], "reel", {
                        index: index,
                        status: "idle",
                    });
                },
                scrolling: () => {
                    this.sendEvent(this.reels[index], "reel", {
                        index: index,
                        status: "scrolling",
                    });
                },
                spinFinished: () => {
                    this.sendEvent(this.reels[index], "reel", {
                        index: index,
                        status: "completed",
                    });
                },
            };
            reel._isOnHold = false;
            Object.defineProperty(reel, "isLast", {
                get: () => {
                    return this._flags.lastReel == reel.index ? true : false;
                },
            });
            Object.defineProperty(reel, "isOnHold", {
                get: () => {
                    return reel._isOnHold;
                },
                set: (value) => {
                    reel._isOnHold = value;
                },
            });
            Object.defineProperty(reel, "fruitsList", {
                get: () => {
                    return Array.from(reel.innerHTML); //returns list of fruits based on reel innerHTML, useful for checking results
                },
                set: (fruits) => {
                    reel.innerHTML = fruits
                }
            });
        });
    };

    scrollReel = (to, duration, easingFn, reel) => {
        //reel scroll animation with easing function
        let start = reel.scrollTop, //init variables
            change = to - start,
            currentTime = 0,
            increment = 20,
            displacement;
        reel.sounds.starting(); //play sound of starting reel spin
        const animateScroll = () => {
            //animation main function
            // increment the time
            currentTime += increment; //adjust current animation time by increment
            displacement = typeof displacement === "undefined" ? 0 : reel.scrollTop; //stores distance moved between animation iterations
            // move scrollTop of reel by result of easing function
            reel.scrollTop = easingFn(currentTime, start, change, duration);
            displacement -= reel.scrollTop; //check how much movment happened since last animation iteration
            if (Math.abs(displacement) > 10 && reel.isLast) {
                //if displacement > 10 play spinnning reel sound
                reel.sounds.spinning();
            }
            // do the animation unless its over
            if (currentTime < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                reel.sounds.stopping(); //play reel stoping sound
                if (
                    reel.events.spinFinished &&
                    typeof reel.events.spinFinished === "function" &&
                    reel.isLast //checking if reel is last reel to spin
                ) {
                    // the animation is done so lets callback
                    setTimeout(reel.events.spinFinished, 100); //little delay before calling event to let sounds finish before
                    if (this.parent.debug)
                        log(currentTime, duration, reel.scrollTop, reel.isLast, reel.index);
                }
            }
        };
        animateScroll(); //init animation iteration
    };

    activateHold = () => {
        this._sounds.getsHold.play(); //play sound for hold
        //method activates hold functionality. Enables buttons and activates visual styles by modyfing classes of elements.
        const buttons = this._hldButtons; //creates variable holding buttons object
        buttons.forEach((button) => {
            //iterates buttons
            button.classList.add("holdActive"); //activates button by adding class
            button.classList.remove("holdNormal"); //removes default class
        });
        this.isHoldEnabled = true; //isHoldEnabled flag is set to inform about state
    };

    toogleHoldBtn = (button) => {
        let index = parseInt(button.getAttribute("data-reel-number")); // get reel/button index from button data attribute
        //fired by pressing hold button
        if (this.isHoldEnabled) {
            //verifying if hold is active
            this._sounds.hold.play(); //playing hold button toggle sound
            if (button.classList.contains("holdActive")) {
                //checking if buttons elements have class holdActive
                this.reels[index].isOnHold = true; //flaging reel coresponding to pressed button isOnHold property
                button.classList.add("holdSelected"); //adding class to button
                button.classList.remove("holdActive"); //removing class from button
            } else {
                this.reels[index].isOnHold = false; //checking reel isOnHold flag state
                button.classList.remove("holdSelected"); //removing class from button
                button.classList.add("holdActive"); //adding class to button
            }
        }
    };

    clearHold = () => {
        //removing hold flag and modyfying hold buttons classes, trigering buttons animation
        const buttons = this._hldButtons;
        //assigning buttons object to variqable
        buttons.forEach((button) => {
            //iterating buttons
            button.classList.remove("holdActive", "holdSelected"); //removing classes from buttons
            button.classList.add("holdNormal"); //adding class to buttons
        });
        this.reels.forEach((reel) => {
            //iterating reels
            reel.isOnHold = false; //setting each reel isOnHold flag to false
        });
        this.isHoldEnabled = false; //flag isHoldEnabled = false
    };

    spinBtnClick = () => {
        //fired when spin button is pressed
        if (!this.isSpinning) {
            //check if reels are not spinning, stop if true
            this.isSpinning = true; //mark flag to stop spin button functionality
            this.isHoldEnabled = false; //mark flag to disable hold buttons functionality
            this.resetReels(); //re-generate reels, reset topScroll for each reel to 0
            this.parent.resultsField.spins++; //increment by 1 number of spins, update results sidebar with new value
            this.parent.resultsField.inOut = -1; //chagne balance of cash, display animation and update results sidebar
            this.spinReels(); //call method to spin reels
        }
    };

    resetReels = () => {
        let reelsTotHeight = 0; //variable to keep sum of reels heights
        while (reelsTotHeight != 53000 * (3 - this.sizeReelsOnHold)) {
            //keep randmosing reels untill total sum of their heights is equal to 3 * 500 * 106 (number of reels * number of slots * line height)
            reelsTotHeight = 0; // zero value of height at each iteration
            this.reels.forEach((reel) => {
                //iterate reels object
                if (!reel.isOnHold) {
                    //if reel is not on hold
                    reel.fruitsList = this.parent //call parent method to generate and shuffle 3 times reel, before returning as string
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
        this.reels.forEach((reel) => {
            //iterate reels object
            if (!reel.isOnHold) {
                //check if reel is not on hold
                this._flags.lastReel = reel.index; //mark reel as last
                let distance = reel.lnHeight * (Math.floor(Math.random() * 10) + 20); //randomise reel animation distance
                let duration = 2500 + reel.index * 500; //calculate duration as time in ms + (reel index * 500 ms) to give delay to reels
                let easingFunction = easeOutQuad; //callback easing function for animation
                this.scrollReel(distance, duration, easingFunction, reel); //call reel animation method
            }
        });
    };

    processResults = (simulate = false) => {
        let results; //create variabe to hold results
        if (simulate) results = Array(3).fill(this.parent.generateFruit());
        //if simulate : true generate random winning result
        else {
            //iterate reels and return fruit based on current scrollTop position / reel line height + offset (3rd fruit in visible reel)
            results = this.reels.map((reel) => {
                return reel.fruitsList[reel.scrollTop / reel.lnHeight + 2];
            });
        }
        if (this.parent.debug) log(results);
        if (
            //if random number is within accepted range and you are not having a winning result you will get hold
            Math.floor(Math.random() * (100 / game.holdChance) + 1) == 1 && //check if you got hold
            !results.every(function(val, i, arr) {
                //check if all elements of array are NOT the same (not winning)
                return val === arr[0];
            })
        ) {
            this.activateHold(); //run method to handle hold
            this.parent.overlay.msg = `<span style='color:red'>HOLD!!!</span>\n<span style='color:yellow'>Select reels to hold</span>`;
            this.parent.overlay.showMsg(this.options.timeouts.overlay.hold); //display message in screen overlay
        } else if (
            results.every(function(val, i, arr) {
                //otherwise check if all elements of array are the same (winning)
                return val === arr[0];
            })
        ) {
            this.parent.fruits.forEach((fruit) => {
                //iterate throug all kinds of fruits we have
                if (results.includes(fruit)) {
                    //to find matching fruit
                    let prize = this.parent.getPrize(fruit); //get prize generaed for that fruit from parent object
                    this._sounds.win.play(); //play wining sound
                    if (this.parent.debug)
                    //debug msg
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
            if (this.parent.resultsField.cash <= 0) {
                //if out of money...
                this._sounds.gameOver.play(); //play game over sound
                this.parent.rulesField.clearRules(); //clear content of rules sidebar
                this.parent.overlay.gameOver(); //display overlay infomring about game over
            } else {
                //otherwise...
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
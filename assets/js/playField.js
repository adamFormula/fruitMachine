"use strict";

// PlayField object is handling interactions between HTML elements placed in playField - central part
// with reels. It handles reels animation, sounds and communicates with other objects including parent SlotMachine.

class PlayField {
  constructor(parent, options) {
    this.parent = parent;
    this.options = options;
    this._hldButtons = Array.from(getEl(".btnHold"));
    this._spinButton = document.querySelector("#spinBtn>button");
    this._reels = Array.from(getEl(".reel"));
    this._flags = { spinning: false, hold: false };
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
    this._promisesList = [];
    this._promise = null;
    this.#addPropertiesToReels();
    this.#addMethodToLoseSound();
    this.#addPropertiesToButtons();
  }
  //PROPERTIES
  get isSpinning() {
    //returns isSpinning flag
    return this._flags.spinning;
  }

  set isSpinning(value) {
    //sets isSpinning flag
    this._flags.spinning = value;
    this.spinButton.isEnabled = !value;
  }

  set isHoldEnabled(bool) {
    //sets hold flag
    this._flags.hold = bool;
    this.holdButtons.forEach((holdButton) => {
      holdButton.disabled = !bool;
    });
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

  get holdButtons() {
    //returns hldButtons obj
    return this._hldButtons;
  }

  get spinButton() {
    //returns spinButton obj
    return this._spinButton;
  }

  get promisesList() {
    //returns promisesList obj
    return this._promisesList;
  }

  set pushPromise(promise) {
    //push promise to promisesList
    this._promisesList.push(promise);
  }

  set promise(promise) {
    //Set promise to Promise.all
    this._promise = promise;
  }

  //METHODS
  #clearPromises = () => (this._promisesList = []);

  #addPropertiesToButtons = () => {
    this.holdButtons.forEach((holdButton) => {
      holdButton._isSelected = false;
      holdButton._sounds = { toggle: this._sounds.hold }; //hold button toggle sound}
      holdButton._isEnabled = false;
      Object.defineProperty(holdButton, "isSelected", {
        get: () => {
          return holdButton._isSelected;
        },
        set: (value) => {
          holdButton._isSelected = value;
          holdButton._sounds.toggle.play(); //playing hold button toggle sound
          holdButton.classList.toggle("holdSelected", value); //toggle class on button
          holdButton.classList.toggle("holdActive", !value); //toggle class on button
          this.reels[holdButton.dataset.reelNumber].isOnHold = value; //flaging reel coresponding to pressed button isOnHold property
        },
      });
      Object.defineProperty(holdButton, "isEnabled", {
        get: () => {
          return holdButton._isEnabled;
        },
        set: (value) => {
          holdButton._isEnabled = value;
          holdButton.disabled = !value;
          holdButton.classList.toggle("holdActive", value); //toggle class on button
          holdButton.classList.toggle("holdNormal", !value); //toggle class on button
        },
      });
    });
    this.spinButton._isEnabled = true;
    Object.defineProperty(this.spinButton, "isEnabled", {
      get: () => {
        return this.spinButton._isEnabled;
      },
      set: (value) => {
        this.spinButton._isEnabled = value; //set button property
        this.spinButton.disabled = !value;
      },
    });
  };

  #addPropertiesToReels = () => {
    //extends reels object with additional properties
    this.reels.forEach((reel, index) => {
      //iterating reels
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
      reel.getResult = () => reel.fruitsList[Math.round(reel.scrollTop / reel.lnHeight) + 2];
      reel._isOnHold = false;
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
          reel.innerHTML = fruits;
        },
      });
    });
  };

  #addMethodToLoseSound = () => {
    this._sounds.loses.playRandom = () => {
      this._sounds.loses.src = this._sounds.loseTracks[genRandomNumber(this._sounds.loseTracks.length - 1)]; //play choose random loosing sound from array
      this._sounds.loses.load(); //load into player
      this._sounds.loses.play(); //play sound}
    };
  };

  #scrollReel = (to, duration, easingFn, reel, resolve) => {
    //reel scroll animation with easing function
    let start = reel.scrollTop, //init variables
      change = to - start,
      currentTime = 0,
      increment = 16.6,
      displacement;
    reel.sounds.starting(); //play sound of starting reel spin
    const animateScroll = () => {
      //animation main function
      // increment the time
      currentTime += increment; //adjust current animation time by increment
      displacement = typeof displacement === "undefined" ? 0 : reel.scrollTop; //stores distance moved between animation frames
      // move scrollTop of reel by result of easing function
      reel.scrollTop = Math.round(easingFn(currentTime, start, change, duration));
      displacement -= reel.scrollTop; //check how much movment happened since last animation frame
      if (Math.abs(displacement) > 3) {
        //if displacement > 10 play spinnning reel sound
        reel.sounds.spinning();
      }
      // do the animation unless its over
      if (currentTime < duration) {
        window.requestAnimationFrame(animateScroll);
      } else {
        // the animation is done so lets resolve
        resolve(`Reel ${reel.index} completed spin. Duration of spin: ${duration}ms`);
        reel.sounds.stopping(); //play reel stoping sound
        //
        // if (this.parent.debug) log(currentTime, duration);
      }
    };
    animateScroll(); //init animation recursion
  };

  #activateHold = () => {
    this._sounds.getsHold.play(); //play sound for hold
    this.parent.overlay.hold(); //display hold overlay message
    //method activates hold functionality. Enables buttons and activates visual styles by modyfing classes of elements.
    const buttons = this.holdButtons; //creates variable holding buttons object
    buttons.forEach((button) => {
      //iterates buttons
      button.isEnabled = true; //enabling button
      button.isSelected = false; //setting isSelected button property to false
    });
    this.isHoldEnabled = true; //isHoldEnabled flag is set to inform about state
  };

  toogleHoldBtnClick = (button) => {
    //fired by pressing hold button
    if (this.isHoldEnabled) {
      //verifying if hold is active
      button.isSelected = !button.isSelected; // toggle button state
    }
  };

  #clearHold = () => {
    //removing hold flag and modyfying hold buttons classes, trigering buttons animation
    const buttons = this.holdButtons;
    //assigning buttons object to variqable
    buttons.forEach((button) => {
      //iterating buttons
      button.isSelected = false; //removing classes from buttons
      button.isEnabled = false; // disabling button
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
      this.#spinReels(); //call method to spin reels
    }
  };

  resetReels = () => {
    let countActiveReelsSlots = 0; //variable to keep sum of reels lengths
    let countActiveReels = false;
    while (!countActiveReels) {
      //keep randmosing reels untill total sum of their lenghts is equal to number of reels not on hold * slots number
      //this is to confirm that correct number of slots was generated for all active reels
      this.reels.forEach((reel) => {
        //iterate reels object
        const lnHeight = Math.round((vhoffset * 14) / 100);
        reel.style.lineHeight = lnHeight + "px";
        reel.lnHeight = lnHeight;
        if (!reel.isOnHold) {
          countActiveReels++;
          //if reel is not on hold
          reel.fruitsList = this.parent //call parent method to generate and shuffle 3 times reel, before returning as string
            .shuffle3Times(this.parent.generateReel())
            .join("");
          reel.scrollTop = 0; //reset reel scrollTop position to 0
          countActiveReelsSlots += reel.scrollHeight; //increment total slots count of active reels by reel slots size
        }
      });
      countActiveReels = allEqual(this.reels.map((reel) => reel.scrollHeight));
    }
  };

  #spinReels = () => {
    this.#clearPromises(); //remove old promises
    this.reels.forEach((reel) => {
      //iterate reels object
      if (!reel.isOnHold) {
        //check if reel is not on hold
        let distance = reel.lnHeight * (Math.floor(Math.random() * 100) + 20); //randomise reel animation distance
        let duration = 2500 + reel.index * 500; //calculate duration as time in ms + (reel index * 500 ms) to give incremental delay to reels based on order
        let easingFunction = easeOutQuad; //callback easing function for animation
        this.pushPromise = new Promise((resolve, reject) => {
          //create new promise which calls reel animation method
          this.#scrollReel(distance, duration, easingFunction, reel, resolve); //call reel animation method)
        });
      }
    });
    this.promise = Promise.all(this.promisesList).then((values) => {
      //run if all reels finished spinning
      setTimeout(this.#processResults, 150, false); //add little delay to finish playing sound before processing results
      this.#clearHold(); //clear hold flags
      if (this.parent.debug) {
        table(values);
      } //debug log
    });
  };

  #processResults = (simulate = false) => {
    this.isSpinning = false; //mark flag to re-enable spin button functionality
    let results; //create variabe to hold results
    if (simulate) results = Array(3).fill(this.parent.generateFruit());
    //if simulate : true generate random winning result
    else {
      results = this.#getResults();
    }
    let win = this.#checkWin(results); //check if winning
    if (win) {
      this.#handleWin(results); //run method to handle win
      return;
    } //else generate and check hold chance
    if (this.#generateHoldChance()) {
      this.#activateHold(); //run method to handle hold
      return;
    }
    this.#handleLoose(); //otherwise run method to handle loose
  };

  #generateHoldChance = () => (Math.floor(Math.random() * (100 / game.holdChance) + 1) == 1 ? true : false);

  #handleLoose = () => {
    this.parent.resultsField.loses = 1; //otherwise if no luck increment loses and update result sidebar
    if (this.parent.resultsField.cash <= 0) {
      //if out of money...
      this._sounds.gameOver.play(); //play game over sound
      this.parent.rulesField.clearRules(); //clear content of rules sidebar
      this.parent.overlay.gameOver(); //display overlay infomring about game over
    } else {
      //otherwise...
      this._sounds.loses.playRandom(); //play random loosing sound
      this.parent.overlay.loose(); // show loose overlay message
    }
  };

  #handleWin = (results) => {
    this.parent.fruits.forEach((fruit) => {
      //iterate throug all kinds of fruits we have
      if (results.includes(fruit)) {
        //to find the matching fruit
        let prize = this.parent.getPrize(fruit); //get prize generaed for that fruit from parent object
        this._sounds.win.play(); //play wining sound
        this.parent.resultsField.wins = [prize, fruit]; //add history to results sidebar
        this.parent.overlay.win(fruit, prize);
      }
    });
  };

  #getResults = () => {
    //iterate reels and return fruit based on current scrollTop position / reel line height + offset (3rd fruit in visible reel)
    if (debug)
      table(
        this.reels.map((reel) => {
          return {
            fruit: reel.getResult(),
            scrollTop: reel.scrollTop,
            "line-height": reel.lnHeight,
            "Fruit index": reel.scrollTop / reel.lnHeight + 2,
            "Reel size": reel.fruitsList.length,
            clientHeight: reel.clientHeight,
            scrollHeight: reel.scrollHeight,
          };
        })
      );
    return this.reels.map((reel) => reel.getResult());
  };

  //otherwise check if all elements of array are the same (winning);
  #checkWin = (results) => results.every((val, i, arr) => val === arr[0]);
}

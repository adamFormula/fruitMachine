"use strict";

class SlotMachine {
  constructor(
    reelsNumber = 3,
    reelSize = 500,
    holdChance = 5,
    fruits = "🍎,🍌,🍒,🥕,🍉,🥭,🥝,💎",
    money = 100,
    debug = false
  ) {
    this.reelsNumber = reelsNumber;
    this.reelSize = reelSize;
    this.holdChance = holdChance;
    this.fruits = fruits.split(",");
    this.slotsPopulation = this.genSlotsPopulation();
    this.reel = this.shuffle3Times(this.generateReel());
    this.prizePower = 2;
    this.prizeBonus = 3.3;
    this.money = money;
    SlotMachine.options = {
      startCash: this.money,
      spinDurations: [5, 10, 15],
      timeouts: { inOut: { win: 3000 }, overlay: { win: 5000, lose: 2000, hold: 3000 } },
    };
    this.resultsField = new ResultsField(SlotMachine.options);
    this.playField = new PlayField(this, SlotMachine.options);
    this.overlay = new Overlay(SlotMachine.options);
    this.rulesField = new RulesField(this);
    this.debug = debug;
    if (this.debug) this.makeWinningTable();
  }

  generateReel = () => {
    let temp = this.slotsPopulation;
    return [].concat.apply(
      [],
      this.fruits.map(function (fruit, index) {
        return new Array(temp[index]).fill(fruit, 0);
      })
    );
  };

  genSlotsPopulation = () => {
    // function y=ax^2
    let list = [];
    let sum = 0;
    let factor = 1;
    while (Number(sum.toFixed(2)) != Number(this.reelSize + ".00")) {
      factor += 0.001;
      list = [];
      for (let index = 1; index < this.fruits.length + 1; index++) {
        list.push(Math.round(Math.pow(factor, 1.5 - index / 10)));
      }
      sum = this.sumArrayElements(list);
      // log(sum)
    }
    // log(this.sumArrayElements(list), factor);
    return list;
  };

  sumArrayElements = (array) => {
    let result = 0;
    array.forEach(function (ele) {
      result += ele;
    });
    return result;
  };

  shuffle3Times = (reel) => {
    //Fisher-Yates shuffle https://bost.ocks.org/mike/shuffle/
    for (let index = 0; index < 3; index++) {
      var m = reel.length,
        t,
        i;
      while (m) {
        i = Math.floor(Math.random() * m--);
        t = reel[m];
        reel[m] = reel[i];
        reel[i] = t;
      }
    }
    return reel;
  };

  generateRandomFruitNumber = () => Math.floor(Math.random() * this.reelSize);

  generateFruit = () => this.reel[this.generateRandomFruitNumber()];

  getPrize = (fruit) =>
    Math.round(
      Math.round((this.getIndexOfFruit(fruit) + 1) * 10 + Math.pow(1.9, this.getIndexOfFruit(fruit) + 1)) / 5
    ) * 5;

  getRet1Coin = (fruit) => this.getWinningCombinations(fruit) * this.getPrize(fruit);

  getIndexOfFruit = (fruit) => this.fruits.indexOf(fruit);

  getWinningCombinations = (fruit) => Math.pow(this.getPopulationOfFruit(fruit), this.reelsNumber);

  getTotalCombinations = () => Math.pow(this.reelSize, this.reelsNumber);

  getPopulationOfFruit = (fruit) => this.slotsPopulation[this.getIndexOfFruit(fruit)];

  getChanceToWin = (fruit, totalRet1Coin) => (100 / totalRet1Coin) * this.getRet1Coin(fruit);

  startGame = () => this.overlay.startGame();

  makeWinningTable = () => {
    const goodiesTable = [];
    this.fruits.forEach((fruit, idx) =>
      goodiesTable.push({
        Fruit: `3 x ${fruit}`,
        "Slot population": this.slotsPopulation[idx],
        Prize: "£" + this.getPrize(fruit),
        "Winning combinations": this.getWinningCombinations(fruit),
        "Return for 1 coin": "£" + this.getRet1Coin(fruit),
        "Winning chance": this.getChanceToWin(
          fruit,
          this.sumArrayElements(this.fruits.map((fruit) => this.getRet1Coin(fruit)))
        ),
      })
    );
    table(goodiesTable);
    table({
      "Total winning combinations": this.getTotalCombinations(),
      "Payout %":
        (this.sumArrayElements(this.fruits.map((fruit) => this.getRet1Coin(fruit))) / this.getTotalCombinations()) *
        100,
      "HOLD chance": this.holdChance + "%",
    });
  };
}

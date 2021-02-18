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
        SlotMachine.options = { startCash: this.money, spinDurations: [5, 10, 15], timeouts: { inOut: { win: 4000 }, overlay: { win: 5000, lose: 2000, hold: 3000 } } };
        this.resultsField = new ResultsField(SlotMachine.options);
        this.playField = new PlayField(this, SlotMachine.options)
        this.overlay = new Overlay(SlotMachine.options)
        this.rulesField = new RulesField(this)
        this.debug = debug
    }

    generateReel() {
        let temp = this.slotsPopulation;
        return [].concat.apply(
            [],
            this.fruits.map(function(fruit, index) {
                return new Array(temp[index]).fill(fruit, 0);
            })
        );
    }

    genSlotsPopulation() {
        let list = [];
        let sum = 0;
        let num = 1.5;
        let factor = 0.7;
        while (Number(sum.toFixed(2)) != Number(this.reelSize + ".00")) {
            factor += 0.00001;
            list = [];
            for (let index = 1; index < this.fruits.length + 1; index++) {
                list.push((this.reelSize / Math.pow(4 * index, factor)) * num);
            }
            sum = this.sumArrayElements(list);
            // log(sum)
        }
        list = list.map(function(number) {
            return Math.round(number);
        });
        if (this.sumArrayElements(list) == this.reelSize) return list;
        else if (this.sumArrayElements(list) > this.reelSize) {
            list[0] = list[0] - (this.sumArrayElements(list) - this.reelSize);
        } else list[0] = list[0] + (this.reelSize - this.sumArrayElements(list));
        return list;
    }

    sumArrayElements(array) {
        let result = 0;
        array.forEach(function(ele) {
            result += ele;
        });
        return result;
    }

    shuffle3Times(reel) {
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
    }

    generateRandomFruitNumber() {
        return Math.floor(Math.random() * this.reelSize);
    }

    generateFruit() {
        return this.reel[this.generateRandomFruitNumber()];
    }
    getPrize(fruit) {
        return Math.round(
            Math.pow(this.getIndexOfFruit(fruit) + this.prizeBonus, this.prizePower)
        );
    }

    getRet1Coin(fruit) {
        return this.getWinningCombinations(fruit) * this.getPrize(fruit);
    }

    getIndexOfFruit(fruit) {
        return this.fruits.indexOf(fruit);
    }

    getWinningCombinations(fruit) {
        return Math.pow(this.getPopulationOfFruit(fruit), this.reelsNumber);
    }

    getTotalCombinations() {
        return Math.pow(this.reelSize, this.reelsNumber);
    }

    getPopulationOfFruit(fruit) {
        return this.slotsPopulation[this.getIndexOfFruit(fruit)];
    }

    getChanceToWin(fruit, totalRet1Coin) {
        return (100 / totalRet1Coin) * this.getRet1Coin(fruit);
    }

    startGame() {
        this.overlay.startGame()
    }

    simulateWin() {
        this.playField.processResults(true)
    }
}
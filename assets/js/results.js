"use strict";

class ResultsField {
    constructor(options, debug) {
        this.options = options;
        this._cash = { amount: this.options.startCash, index: 0 };
        this._inOut = { amount: 0, index: 1 };
        this._spins = { amount: 0, index: 2 };
        this._wins = {
            amount: 0,
            count: 0,
            total: 0,
            history: { fruits: [], amounts: [] },
            index: 3,
        };
        this._lastWins = { indexes: [4, 5, 6, 7] };
        this._loses = { amount: 0, count: 0, index: 8 };
        this._wlRatio = { amount: 0, index: 9 };
        this.items = getEl(".grid-results-item");
        this.prefixes = getEl(".grid-results-prefix");
        this.counts = getEl(".grid-results-count");
        this.affixes = getEl(".grid-results-affix");
        this.cash = this.options.startCash;
        this.debug = debug
    }

    set cash(value) {
        this._cash.amount = value;
        this.counts[this._cash.index].innerHTML = this._cash.amount;
    }

    get cash() {
        return this._cash.amount;
    }

    set inOut(value) {
        this._inOut.amount = value;
        this.cash += this._inOut.amount;
        let prefix = this.prefixes[this._inOut.index];
        let count = this.counts[this._inOut.index];
        let timeout = this.options.timeouts.inOut.win;
        count.innerHTML = Math.abs(this._inOut.amount);
        if (this._inOut.amount < 0) {
            prefix.innerHTML = "-$";
            prefix.classList.add("red", "fadeOut");
            count.classList.add("red", "fadeOut");
            setTimeout(()=> {
                prefix.classList.remove("red", "fadeOut");
                count.classList.remove("red", "fadeOut");
            }, timeout);
        } else {
            prefix.innerHTML = "+$";
            prefix.classList.add("green", "fadeOut");
            count.classList.add("green", "fadeOut");
            setTimeout(()=> {
                prefix.classList.remove("green", "fadeOut");
                count.classList.remove("green", "fadeOut");
            }, timeout);
        }
    }

    get inOut() {
        return this._inOut.amount;
    }

    set spins(value) {
        this._spins.amount = value;
        this.counts[this._spins.index].innerHTML = this._spins.amount;
    }

    get spins() {
        return this._spins.amount;
    }

    set wins(value) {
        this._wins.amount = value[0];
        this._wins.history.amounts.push(this._wins.amount);
        this._wins.history.fruits.push(value[1]);
        this._wins.total += this._wins.amount;
        this.winsCount++;
        this.counts[this._wins.index].innerHTML = this._wins.total;
        this.inOut = this._wins.amount;
        this.wlRatio();
        this.lastWins();
    }

    get wins() {
        return this._wins.total;
    }
    get winsCount() {
        return this._wins.count;
    }

    set winsCount(value) {
        this._wins.count = value;
        this.items[this._wins.index].children[0].innerHTML = this._wins.count;
    }

    get last() {
        return {
            amounts: [
                this._wins.history.amounts[this._wins.history.amounts.length - 1],
            ],
            fruits: [this._wins.history.fruits[this._wins.history.fruits.length - 1]],
        };
    }
    get last3() {
        if (this._wins.history.amounts.length > 2)
            return {
                amounts: this._wins.history.amounts.slice(-3),
                fruits: this._wins.history.fruits.slice(-3),
            };
        else if (this._wins.history.amounts.length > 1)
            return {
                amounts: this._wins.history.amounts.slice(-2),
                fruits: this._wins.history.fruits.slice(-2),
            };
        else return this.last;
    }
    get history() {
        return this._wins.history;
    }

    lastWins(reset = false) {
        if (reset) {
            this._lastWins.indexes.forEach((index) => {
                this.items[index + 1].children[0].innerHTML = "";
                this.counts[index + 1].innerHTML = 0;
            });
        } else {
            let last3 = this.last3;
            let counter = 1;
            this.counts[this._lastWins.indexes[0]].innerHTML = last3.amounts.reduce(
                (partial_sum, a) => partial_sum + a,
                0
            );
            this._lastWins.indexes.forEach((index) => {
                if (counter - 1 < last3.amounts.length) {
                    this.items[index + 1].children[0].innerHTML = `${
            last3.fruits[counter - 1]
          }`;
                    this.counts[index + 1].innerHTML = `${last3.amounts[counter - 1]}`;
                }
                counter++;
            });
        }
    }

    set loses(value) {
        this._loses.amount += value;
        this.counts[this._loses.index].innerHTML = this._loses.amount;
        this.losesCount++;
        this.items[this._loses.index].children.innerHTML = this._loses.amount;
        this.wlRatio();
    }

    set losesCount(value) {
        if (this.debug) log(value);
        this._loses.count = value;
        this.items[this._loses.index].children[0].innerHTML = this._loses.count;
    }

    get losesCount() {
        return this._loses.count;
    }

    get loses() {
        return this._loses.amount;
    }

    wlRatio() {
        const result = ((this.wins / this.loses) * 100).toPrecision(4);
        this._wlRatio.amount = result == Infinity ? 0 : isNaN(result) ? 0 : result;
        this.counts[this._wlRatio.index].innerHTML = this._wlRatio.amount;
    }

    reset = () => {
        this.cash = this.options.startCash;
        this.spins = 0;
        this.winsCount = 0;
        this.loses = 0;
        this._wins = {
            amount: 0,
            count: 0,
            total: 0,
            history: { fruits: [], amounts: [] },
            index: 3,
        };
        this._loses = { amount: 0, count: 0, index: 8 };
        this._wlRatio = { amount: 0, index: 9 };
        this.losesCount = 0;
        this.lastWins(true);
        this.wlRatio();
    };
}
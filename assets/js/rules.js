"use strict";
class RulesField {
    constructor(parent) {
        this.parent = parent;
        this._itemsObj = Array.from(getEl(".grid-rules-item"));
        this._fruitsObj = Array.from(getEl(".grid-rules-fruits"));
        this._amountsObj = Array.from(getEl(".grid-rules-amount"));
    }

    makeRules = () => {
        const items = this._itemsObj
        const fruits = this._fruitsObj
        const amounts = this._amountsObj
        const parent = this.parent
        this.parent.fruits.forEach((fruit, index) => {
            setTimeout(function() { items[index].innerHTML = "3 x " }, 50 * (index + 1))
            setTimeout(function() { fruits[index].innerHTML = `${fruit} ${fruit} ${fruit}` }, 70 * (index + 1))
            setTimeout(function() { amounts[index].innerHTML = `$${parent.getPrize(fruit)}` }, 90 * (index + 1))
        });
    };


    clearRules = () => {
        const items = this._itemsObj
        const fruits = this._fruitsObj
        const amounts = this._amountsObj
        items.forEach((item, index) => {
            item.innerHTML = ""
            fruits[index].innerHTML = ""
            amounts[index].innerHTML = ""
        });
    };
}
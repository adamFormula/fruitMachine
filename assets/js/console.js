function displayWelcomeMsg() {
    console.group(
        "%cW%ce%cl%cc%co%cm%ce %cM%ce%cs%cs%ca%cg%ce",
        "color:rgb(238, 130, 171); background-color:grey",
        "color:rgb(115, 0, 130); background-color:grey",
        "color:blue; background-color:grey",
        "color:green; background-color:grey",
        "color:yellow; background-color:grey",
        "color:orange; background-color:grey",
        "color:rgb(255, 115, 0); background-color:grey",
        "color:rgb(255, 51, 0); background-color:grey",
        "color:rgb(130, 0, 0); background-color:grey",
        "color:rgb(238, 130, 130); background-color:grey",
        "color:red; background-color:grey",
        "color:red; background-color:grey",
        "color:red; background-color:grey",
        "color:red;background-color:grey"
    );
    log(
        `This 🎮 has been developed by Adam R. (2021©️) during Generation JWD program`
    );
    log(`Got any ❓. Contact me on Slack.\n`);
    log(
        `%cEach reel has ${game.reelSize} fruits of ${
      game.fruits.length
    } different types with population as follows: \n${game.slotsPopulation.map(
      function (qty, index) {
        return qty + " x " + game.fruits[index];
      }
    )}\n`,
        "color: green; font-style: italic;padding: 2px"
    );
    log(`%cPrize list:`, "color: yellow;background-color: brown; padding: 2px");
    log(
        `%c3 x OF A KIND: \tWIN\tTotal combinations:\t ${game.getTotalCombinations()} \tReturn for 1 COIN:\tChance to win:`,
        "text-decoration: underline;padding: 2px"
    );
    let totalWin = 0;
    let totalRet1Coin = 0;
    game.fruits.forEach(function(fruit) {
        totalRet1Coin += game.getRet1Coin(fruit);
    });
    game.fruits.forEach(function(fruit) {
        let ret1coin = game.getRet1Coin(fruit);
        let winningComb = game.getWinningCombinations(fruit);
        let prize = game.getPrize(fruit);
        totalWin += game.getWinningCombinations(fruit);
        log(
            `3 x ${[fruit, fruit, fruit]}: %c ${
        fruit.length > 6 ? "\t£" : "\t£"
      }${prize}\t%c Winning combinations:\t ${winningComb}${
        winningComb > 1000000 ? "\t" : "\t\t"
      }%c £${ret1coin} %c${
        ret1coin > 1000000
          ? ret1coin > 10000000
            ? "\t\t"
            : "\t\t"
          : "\t\t\t%c"
      }${game.getChanceToWin(fruit, totalRet1Coin).toFixed(2)} %`,
            "color: yellow; background-color: brown",
            "color: blue;",
            "color: yellow; background-color: brown;",
            "color: cyan;"
        );
    });
    log(
        `\n%cTotal winning combinations:%c ${totalWin} %cPayouts: ${(
      (totalRet1Coin / game.getTotalCombinations()) *
      100
    ).toFixed(2)} % %cChance of hitting HOLD: ${
      game.holdChance
    } %\nHOLD effects are not icluded in calculations.\n`,
        "color: green;",
        "color: blue;",
        "color: cyan;",
        "color: black;"
    );
    log(`You have %c£${game.money}\n`, "color: yellow; background-color: brown");
    console.groupEnd();
}

console.clear();
displayWelcomeMsg();
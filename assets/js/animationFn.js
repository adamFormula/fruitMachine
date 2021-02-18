"use strict";
// easing functions http://goo.gl/5HLl8

const easeInOutExpo = (t, b, c, d) => {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
}
const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) {
        return (c / 2) * t * t + b;
    }
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
};

const easeInOutSine = (t, b, c, d) => {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}

const easeOutQuad = (t, b, c, d) => {
    return -c * (t /= d) * (t - 2) + b;
};

const easeInCubic = (t, b, c, d) => {
    var tc = (t /= d) * t * t;
    return b + c * tc;
};

const inOutQuintic = (t, b, c, d) => {
    var ts = (t /= d) * t,
        tc = ts * t;
    return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
};

const easeInQuad = (t, b, c, d) => {
    return c * (t /= d) * t + b;
};
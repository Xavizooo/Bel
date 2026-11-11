const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newTimer, startTimer, pauseTimer, remainingTime, displaySeconds } = require('../src/timer');
test('el reloj arranca manualmente y termina según tiempo real, aunque se retrasen los intervalos', () => {
 const ready = newTimer(30);
 assert.equal(remainingTime(ready, 100000), 30000);
 const timer = startTimer(ready, 1000);
 assert.equal(remainingTime(timer, 4500), 26500);
 assert.equal(remainingTime(timer, 90000), 0);
 assert.equal(startTimer(timer, 2000), timer);
});
test('pausar y continuar conserva el tiempo exacto sin consumir durante la pausa', () => {
 const paused = pauseTimer(startTimer(newTimer(15), 1000), 4500);
 assert.equal(paused.remaining, 11500);
 assert.equal(remainingTime(paused, 999999), 11500);
 const resumed = startTimer(paused, 1000000);
 assert.equal(remainingTime(resumed, 1001500), 10000);
 assert.equal(newTimer(15).remaining, 15000);
});
test('el contador no muestra valores negativos ni agrega tiempo si el reloj retrocede', () => {
 const timer = startTimer(newTimer(5), 1000);
 assert.equal(remainingTime(timer, 0), 5000);
 assert.equal(displaySeconds(999), 1);
 assert.equal(displaySeconds(0), 0);
 assert.equal(displaySeconds(-10), 0);
 assert.equal(startTimer(newTimer(0), 1000).deadline, null);
});

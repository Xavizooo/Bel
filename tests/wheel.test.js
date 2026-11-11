const { test } = require('node:test');
const assert = require('node:assert/strict');
const { wheelTarget, sectorPath } = require('../src/wheel');
test('el sector elegido queda exactamente debajo de la flecha fija', () => {
 for (const count of [2, 3, 5, 10, 17, 41, 100]) {
  for (let index = 0; index < count; index++) {
   const target = wheelTarget(index, count);
   const angle = (target + index * 360 / count) % 360;
   assert.ok(Math.min(angle, 360 - angle) < 1e-8);
   assert.ok(target >= 6 * 360);
  }
 }
});
test('la rueda rechaza índices fuera de sus participantes', () => {
 for (const args of [[0, 1], [-1, 3], [3, 3], [1.5, 3]]) assert.throws(() => wheelTarget(...args));
});
test('cada sector se dibuja con arco y coordenadas finitas', () => {
 for (const count of [2, 3, 17]) for (let i = 0; i < count; i++) {
  const path = sectorPath(i, count);
  assert.ok(path.startsWith('M 160 160 L '));
  assert.ok(path.endsWith(' Z'));
  assert.ok(!/NaN|Infinity/.test(path));
 }
});

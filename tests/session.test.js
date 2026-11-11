const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pickParticipant } = require('../src/session');
test('la ruleta exige al menos dos participantes', () => {
 for (const value of [undefined, [], ['Ana']]) assert.throws(() => pickParticipant(value));
});
test('puede elegir a todos, incluidos el primero y el último', () => {
 const players = ['Ana', 'Luis', 'Sofía', 'David'];
 assert.equal(pickParticipant(players, () => 0), 0);
 assert.equal(pickParticipant(players, () => 0.999999), 3);
 const selections = players.map((_, i) => pickParticipant(players, () => (i + 0.5) / players.length));
 assert.deepEqual(selections, [0, 1, 2, 3]);
});
test('nombres coincidentes representan participantes distintos y no se altera la lista', () => {
 const players = Object.freeze(['Ana', 'Ana']);
 assert.equal(pickParticipant(players, () => 0.1), 0);
 assert.equal(pickParticipant(players, () => 0.9), 1);
});

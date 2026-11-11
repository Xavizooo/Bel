const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateItems, validateOptions } = require('../src/domain');
const { availableCards, playerCards, recordCard, nameText, makeDeal } = require('../src/game');
const defaults = require('../src/data/defaults.json');
test('un jugador agota cada tipo sin repetir, incluso si cambia pregunta', () => {
 const used = new Set();
 for (const tipo of ['verdad', 'reto']) {
  const total = availableCards(defaults, tipo, 'todos', used).length;
  for (let i = 0; i < total; i++) {
   const deal = makeDeal(defaults, tipo, 'todos', used, ['Ana', 'Luis'], 0, () => .999999);
   assert.ok(deal); assert.ok(!used.has(deal.card.id)); used.add(deal.card.id);
  }
  assert.equal(makeDeal(defaults, tipo, 'todos', used, ['Ana', 'Luis'], 0), null);
 }
 assert.equal(used.size, defaults.length);
});
test('una tarjeta puede salir a cada jugador una vez y se agota solo para quienes la recibieron', () => {
 const card = { ...defaults[0], id: 'shared', tipo: 'verdad' };
 const names = ['Ana', 'Luis'];
 let history = {};
 for (const participant of [0, 1]) {
  const result = makeDeal([card], 'verdad', 'todos', playerCards(history, participant), names, participant, () => 0, participant === 1 ? card.id : null);
  assert.equal(result.card.id, card.id);
  history = recordCard(history, participant, card.id);
  assert.equal(makeDeal([card], 'verdad', 'todos', playerCards(history, participant), names, participant), null);
 }
 assert.deepEqual(history, { 0: ['shared'], 1: ['shared'] });
});
test('los contadores de una persona no se reducen por tarjetas de otra', () => {
 const history = recordCard({}, 0, defaults[0].id);
 const tipo = defaults[0].tipo;
 assert.equal(availableCards(defaults, tipo, 'todos', playerCards(history, 0)).length, 19);
 assert.equal(availableCards(defaults, tipo, 'todos', playerCards(history, 1)).length, 20);
});
test('el registro distingue posiciones con el mismo nombre y conserva el historial anterior', () => {
 const before = Object.freeze({ 0: Object.freeze(['a']) });
 const next = recordCard(before, 1, 'a');
 assert.deepEqual(before, { 0: ['a'] });
 assert.deepEqual(next, { 0: ['a'], 1: ['a'] });
 assert.equal(recordCard(next, 1, 'a'), next);
});
test('evita la tarjeta más reciente para otro jugador cuando tiene alternativas', () => {
 const cards = ['a', 'b', 'c'].map(id => ({ ...defaults[0], id }));
 const result = makeDeal(cards, cards[0].tipo, 'todos', [], ['Ana', 'Luis'], 1, () => 0, 'a');
 assert.equal(result.card.id, 'b');
 assert.equal(availableCards(cards, cards[0].tipo, 'todos', []).length, 3);
});
test('la variedad no bloquea la última tarjeta pendiente ni permite repetir una ya recibida', () => {
 const cards = ['a', 'b', 'c'].map(id => ({ ...defaults[0], id }));
 const result = makeDeal(cards, cards[0].tipo, 'todos', ['a', 'b'], ['Ana', 'Luis'], 1, () => 0, 'c');
 assert.equal(result.card.id, 'c');
 assert.equal(makeDeal(cards, cards[0].tipo, 'todos', ['a', 'b', 'c'], ['Ana', 'Luis'], 1, () => 0, 'c'), null);
});
test('al reiniciar la ronda vuelven las tarjetas para todos los jugadores', () => {
 const history = { 0: defaults.map(c => c.id), 1: defaults.map(c => c.id) };
 for (const participant of [0, 1]) {
  assert.equal(availableCards(defaults, 'verdad', 'todos', playerCards(history, participant)).length, 0);
  assert.equal(availableCards(defaults, 'verdad', 'todos', playerCards({}, participant)).length, 20);
 }
});
test('las preguntas vistas siguen excluidas al cambiar de categoría a Todos', () => {
 const first = makeDeal(defaults, 'reto', 'picante', [], ['Ana', 'Luis'], 0);
 assert.ok(!availableCards(defaults, 'reto', 'todos', [first.card.id]).some(c => c.id === first.card.id));
 assert.equal(availableCards(defaults, 'reto', 'todos', []).length, 20);
});
test('personalización elige otra persona y conserva todos los marcadores del mismo destinatario', () => {
 for (const participant of [0, 1, 2]) for (const r of [0, .9999]) {
  const names = ['Ana', 'Luis', 'Sam'];
  const result = nameText('{jugador}, saluda a {otro}. {otro} responde a {jugador}.', names, participant, () => r);
  assert.notEqual(result.partner, participant);
  assert.equal(result.text, `${names[participant]}, saluda a ${names[result.partner]}. ${names[result.partner]} responde a ${names[participant]}.`);
 }
 const result = nameText('{jugador} habla con {otro}', ['Ana', 'Ana'], 0, () => 0);
 assert.equal(result.partner, 1);
 assert.equal(nameText('{jugador}', ['$&', 'Luis'], 0).text, '$&');
});
test('el resultado personalizado se crea una vez y conserva duración y texto base', () => {
 const card = { ...defaults[0], conNombres: true, segundos: 30, texto: '{jugador}, canta con {otro}.' };
 const result = makeDeal([card], card.tipo, 'todos', [], ['Ana', 'Luis'], 0, () => 0);
 assert.equal(result.text, 'Ana, canta con Luis.');
 assert.equal(result.card.segundos, 30);
 assert.equal(card.texto, '{jugador}, canta con {otro}.');
});
test('tarjetas anteriores y opciones nuevas se validan sin cambiar su formato', () => {
 assert.equal(validateItems(defaults), defaults);
 assert.equal(validateOptions({ texto: 'Texto anterior {otro}' }), null);
 for (const segundos of [0, 5, 15, 30, 60, 600]) assert.equal(validateOptions({ texto: 'Hola', segundos }), null);
 for (const segundos of [-1, 4, 601, 10.5, '30', NaN]) assert.ok(validateOptions({ texto: 'Hola', segundos }));
 assert.ok(validateOptions({ texto: 'Hola', conNombres: true }));
 assert.ok(validateOptions({ texto: '{jugador} y {desconocido}', conNombres: true }));
 assert.ok(validateOptions({ texto: '{otro}', conNombres: false }));
 assert.equal(validateOptions({ texto: '{jugador}, saluda a {otro}', conNombres: true, segundos: 60 }), null);
});

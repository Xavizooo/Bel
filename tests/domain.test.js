const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateItems, candidates, pick } = require('../src/domain');
const items = require('../src/data/defaults.json');
test('40 tarjetas válidas, 20 de cada tipo, todas las categorías jugables', () => {
 assert.equal(validateItems(items).length, 40);
 for (const type of ['verdad','reto']) {
  assert.equal(candidates(items,type,'todos').length,20);
  for (const c of ['divertido','romantico','picante']) assert.ok(candidates(items,type,c).length >= 2);
 }
});
test('Cambiar nunca repite la actual y respeta la categoría', () => {
 const pool = candidates(items,'verdad','picante');
 for (let n=0;n<100;n++) {const next=pick(pool,pool[0].id);assert.notEqual(next.id,pool[0].id);assert.equal(next.categoria,'picante');}
 assert.equal(pick([pool[0]],pool[0].id),null);assert.equal(pick([]),null);
});
test('borrar todas es válido y no reinicializa las semillas', () => assert.deepEqual(validateItems(JSON.parse('[]')),[]));
test('datos dañados o IDs repetidos se rechazan', () => {
 assert.throws(()=>validateItems({}));assert.throws(()=>validateItems([items[0],items[0]]));assert.throws(()=>validateItems([{...items[0],texto:'  '}]));
});

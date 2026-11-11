const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadItems, saveItems } = require('../src/storage');
const defaults = require('../src/data/defaults.json');
function fake(raw = null) { return { raw, writes: 0, async getItem() {return this.raw;}, async setItem(key, value) {this.writes++;this.raw=value;} }; }
test('primer arranque siembra una vez; siguientes arranques conservan cambios', async () => {
 const db=fake(); assert.equal((await loadItems(db,defaults)).length,40);assert.equal(db.writes,1);
 await saveItems(db,[{...defaults[0],texto:'Texto editado'}]);
 assert.equal((await loadItems(db,defaults))[0].texto,'Texto editado');assert.equal(db.writes,2);
});
test('borrado total persiste al volver a abrir', async () => {
 const db=fake('[]');assert.deepEqual(await loadItems(db,defaults),[]);assert.equal(db.writes,0);
});
test('JSON corrupto no se sobrescribe', async () => {
 const db=fake('{broken');await assert.rejects(loadItems(db,defaults));assert.equal(db.writes,0);assert.equal(db.raw,'{broken');
});
test('fallo de escritura se propaga y no se informa éxito', async () => {
 const db=fake('[]'); db.setItem=async()=>{throw Error('disk full');};
 await assert.rejects(saveItems(db,defaults),/disk full/);assert.equal(db.raw,'[]');
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { act, create } = require('react-test-renderer');
const babel = require('@babel/core');
const { KEY } = require('../src/storage');
const { LABELS, CATEGORIES } = require('../src/domain');
global.IS_REACT_ACT_ENVIRONMENT = true;

// Se ejecutan List, ItemForm, Store y storage reales. Solo se simulan la
// superficie nativa/animada y el dispositivo de almacenamiento; no sus reglas.
const disk = new Map();
let writes = 0;
let failNext = false;
const storage = {
 async getItem(key) { return disk.has(key) ? disk.get(key) : null; },
 async setItem(key, value) { writes++; if (failNext) { failNext = false; throw new Error('Disco no disponible'); } disk.set(key, value); },
};
const host = name => function Host(props) { return React.createElement(name, props, props.children); };
const native = {
 Text: host('Text'), View: host('View'), TextInput: host('TextInput'), Switch: host('Switch'), ScrollView: host('ScrollView'),
 StyleSheet: { create: value => value },
 Modal: props => props.visible ? React.createElement('Modal', props, props.children) : null,
 FlatList: props => React.createElement('FlatList', { style: props.style, accessibilityLabel: props.accessibilityLabel }, props.ListHeaderComponent,
  props.data.length ? props.data.map((item, index) => React.createElement(React.Fragment, { key: props.keyExtractor(item) }, props.renderItem({ item, index }))) : props.ListEmptyComponent),
};
const ui = {
 Screen: host('Screen'), GameScreen: host('Screen'), Button: props => React.createElement('Button', props),
 CategoryPicker: ({ value, onChange, all, disabled }) => React.createElement('View', null, (all ? ['todos', ...CATEGORIES] : CATEGORIES).map(c => React.createElement('Button', { key: c, title: LABELS[c], selected: value === c, disabled, onPress: () => onChange(c) }))),
 TypePicker: ({ onChange, disabled }) => React.createElement('View', null, ['verdad', 'reto'].map(t => React.createElement('Button', { key: t, title: t === 'verdad' ? 'Verdad' : 'Reto', disabled, onPress: () => onChange(t) }))),
};
const src = path.resolve(__dirname, '../src') + path.sep;
const originalLoad = Module._load;
const originalExtension = Module._extensions['.js'];
let List, StoreProvider, useStore;
try {
 Module._load = function(request, parent, isMain) {
  if (request === 'react-native') return native;
  if (request === '@react-native-async-storage/async-storage') return storage;
  if (parent?.filename.startsWith(src)) {
   const resolved = Module._resolveFilename(request, parent);
   if (resolved === path.join(src, 'components/UI.js')) return ui;
   if (resolved === path.join(src, 'components/Motion.js')) return { useMotion: () => true };
  }
  return originalLoad.call(this, request, parent, isMain);
 };
 Module._extensions['.js'] = function(module, filename) {
  if (!filename.startsWith(src)) return originalExtension(module, filename);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
   filename, babelrc: false, configFile: false,
   plugins: [require.resolve('@babel/plugin-transform-react-jsx'), require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  module._compile(code, filename);
 };
 List = require('../src/screens/List').default;
 ({ StoreProvider, useStore } = require('../src/Store'));
} finally { Module._load = originalLoad; Module._extensions['.js'] = originalExtension; }

const cards = [
 { id: 'a', tipo: 'verdad', categoria: 'divertido', texto: '{jugador}, saluda a {otro}.', conNombres: true, segundos: 30 },
 { id: 'b', tipo: 'reto', categoria: 'picante', texto: 'Inventa un baile.', conNombres: false, segundos: 0 },
];
function Harness() { const state = useStore(); return state.loading ? React.createElement('Text', null, 'Cargando') : React.createElement(List); }
function flatten(node) { if (!node) return ''; if (Array.isArray(node)) return node.map(flatten).join(' '); if (typeof node === 'string' || typeof node === 'number') return String(node); return flatten(node.children); }
async function fixture(t, seed = cards) {
 disk.clear(); disk.set(KEY, JSON.stringify(seed)); writes = 0; failNext = false;
 let renderer;
 async function mount() { await act(async () => { renderer = create(React.createElement(StoreProvider, null, React.createElement(Harness))); }); }
 await mount();
 t.after(async () => { await act(async () => renderer.unmount()); });
 return {
  get root() { return renderer.root; },
  text() { return flatten(renderer.toJSON()).replace(/\s+/g, ' ').trim(); },
  button(title, index = 0) { const found = renderer.root.findAllByType('Button').filter(node => node.props.title === title); assert.ok(found[index], `Botón ausente: ${title}`); return found[index]; },
  input(label) { const found = renderer.root.findAllByType('TextInput').find(node => node.props.accessibilityLabel === label); assert.ok(found, `Campo ausente: ${label}`); return found; },
  switch(label) { const found = renderer.root.findAllByType('Switch').find(node => node.props.accessibilityLabel === label); assert.ok(found, `Interruptor ausente: ${label}`); return found; },
  async press(title, index = 0) { const button = this.button(title, index); assert.ok(!button.props.disabled, `Botón deshabilitado: ${title}`); await act(async () => { await button.props.onPress(); }); },
  async fill(label, value) { await act(async () => this.input(label).props.onChangeText(value)); },
  async toggle(label, value) { await act(async () => this.switch(label).props.onValueChange(value)); },
  async reload() { await act(async () => renderer.unmount()); await mount(); },
 };
}

test('Lista muestra metadatos, filtra categorías y conserva el estado vacío', async t => {
 const f = await fixture(t);
 assert.ok(f.text().includes('2 tarjetas'));
 assert.ok(f.text().includes('Con nombres de participantes · 30 s'));
 assert.equal(f.root.findAllByType('FlatList').length, 1);
 await f.press('Picantes');
 assert.ok(f.text().includes('1 tarjetas'));
 assert.ok(!f.text().includes(cards[0].texto));
 assert.ok(f.text().includes(cards[1].texto));
 await f.press('Románticos'); assert.ok(f.text().includes('No hay tarjetas aquí.'));
 await f.press('Todos'); assert.ok(f.text().includes('2 tarjetas'));
 assert.equal(writes, 0);
});
test('Editar guarda texto, tipo, categoría, nombres y duración conservando el ID; persiste al recargar', async t => {
 const f = await fixture(t);
 await f.press('Divertidos'); await f.press('Editar');
 assert.equal(f.input('Duración en segundos').props.value, '30');
 assert.equal(f.switch('Usar nombres en la tarjeta').props.value, true);
 await f.fill('Texto de la verdad o reto', '{jugador}, cuenta un chiste a {otro}.');
 await f.fill('Duración en segundos', '60');
 await f.press('Reto'); await f.press('Románticos'); await f.press('Guardar');
 assert.ok(f.text().includes('Cambios guardados.'));
 assert.ok(f.text().includes('No hay tarjetas aquí.'));
 const saved = JSON.parse(disk.get(KEY));
 assert.deepEqual(saved[0], { id: 'a', tipo: 'reto', categoria: 'romantico', texto: '{jugador}, cuenta un chiste a {otro}.', conNombres: true, segundos: 60 });
 assert.deepEqual(saved[1], cards[1]);
 await f.reload(); await f.press('Románticos');
 assert.ok(f.text().includes('cuenta un chiste'));
 await f.press('Editar'); assert.equal(f.input('Duración en segundos').props.value, '60');
});
test('Cancelar edición conserva los datos y no escribe en almacenamiento', async t => {
 const f = await fixture(t);
 await f.press('Editar'); await f.fill('Texto de la verdad o reto', 'Cambio sin guardar'); await f.press('Cancelar edición');
 assert.ok(f.text().includes(cards[0].texto));
 assert.ok(!f.text().includes('Cambio sin guardar'));
 assert.equal(writes, 0);
});
test('Editar valida nombres y duración y permite desactivar ambas opciones', async t => {
 const f = await fixture(t);
 await f.press('Editar'); await f.fill('Duración en segundos', '601');
 assert.equal(f.button('Guardar').props.disabled, true);
 await f.fill('Duración en segundos', '15');
 await f.fill('Texto de la verdad o reto', 'Sin marcadores');
 assert.equal(f.button('Guardar').props.disabled, true);
 await f.toggle('Usar nombres en la tarjeta', false);
 await f.toggle('Activar cuenta regresiva en la tarjeta', false);
 await f.press('Guardar');
 const saved = JSON.parse(disk.get(KEY))[0];
 assert.equal(saved.conNombres, false); assert.equal(saved.segundos, 0);
 assert.ok(f.text().includes('Sin nombres · Sin temporizador'));
});
test('fallo de guardado conserva el formulario y los datos anteriores; reintento funciona', async t => {
 const f = await fixture(t);
 await f.press('Editar', 1); await f.fill('Texto de la verdad o reto', 'Un baile diferente.');
 failNext = true; await f.press('Guardar');
 assert.ok(f.text().includes('No se pudo guardar.'));
 assert.equal(f.input('Texto de la verdad o reto').props.value, 'Un baile diferente.');
 assert.equal(JSON.parse(disk.get(KEY))[1].texto, cards[1].texto);
 await f.press('Guardar'); assert.equal(JSON.parse(disk.get(KEY))[1].texto, 'Un baile diferente.');
});
test('borrado tiene diálogo propio y Cancelar no elimina ni escribe', async t => {
 const f = await fixture(t);
 await f.press('Borrar'); assert.equal(f.root.findAllByType('Modal').length, 1);
 await f.press('Cancelar'); assert.equal(f.root.findAllByType('Modal').length, 0);
 assert.equal(writes, 0); assert.ok(f.text().includes('2 tarjetas'));
});
test('confirmar dos veces borra solo una vez; la eliminación persiste al recargar', async t => {
 const f = await fixture(t);
 await f.press('Borrar'); const confirm = f.button('Confirmar borrado').props.onPress;
 await act(async () => { await Promise.all([confirm(), confirm()]); });
 assert.equal(writes, 1);
 assert.deepEqual(JSON.parse(disk.get(KEY)), [cards[1]]);
 assert.equal(f.root.findAllByType('Modal').length, 0);
 await f.reload(); assert.ok(f.text().includes('1 tarjetas')); assert.ok(!f.text().includes(cards[0].texto));
});
test('fallo de borrado conserva la tarjeta y permite reintentar; borrar la última persiste vacío', async t => {
 const f = await fixture(t, [cards[1]]);
 await f.press('Borrar'); failNext = true; await f.press('Confirmar borrado');
 assert.ok(f.text().includes('La tarjeta se ha conservado.'));
 assert.equal(f.root.findAllByType('Modal').length, 1);
 assert.deepEqual(JSON.parse(disk.get(KEY)), [cards[1]]);
 await f.press('Confirmar borrado'); assert.deepEqual(JSON.parse(disk.get(KEY)), []);
 await f.reload(); assert.ok(f.text().includes('0 tarjetas')); assert.ok(f.text().includes('No hay tarjetas aquí.'));
});
test('doble toque en Guardar realiza una sola escritura', async t => {
 const f = await fixture(t);
 await f.press('Editar'); const save = f.button('Guardar').props.onPress;
 await act(async () => { await Promise.all([save(), save()]); });
 assert.equal(writes, 1); assert.ok(f.text().includes('Cambios guardados.'));
});

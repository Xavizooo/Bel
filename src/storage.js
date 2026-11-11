const { validateItems } = require('./domain');
const KEY = '@neon-sunset/questions/v1';
async function loadItems(storage, defaults) {
 const raw = await storage.getItem(KEY);
 const next = validateItems(raw === null ? defaults : JSON.parse(raw));
 if (raw === null) await storage.setItem(KEY, JSON.stringify(next));
 return next;
}
async function saveItems(storage, next) {
 validateItems(next);
 await storage.setItem(KEY, JSON.stringify(next));
 return next;
}
module.exports = { KEY, loadItems, saveItems };

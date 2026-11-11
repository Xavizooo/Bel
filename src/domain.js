const CATEGORIES = ['divertido', 'romantico', 'picante'];
const LABELS = { todos: 'Todos', divertido: 'Divertidos', romantico: 'Románticos', picante: 'Picantes' };
function validateItems(value) {
  if (!Array.isArray(value)) throw new Error('El archivo de preguntas no es una lista.');
  const ids = new Set();
  for (const item of value) {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) ||
      !['verdad', 'reto'].includes(item.tipo) || typeof item.texto !== 'string' ||
      !item.texto.trim() || item.texto.length > 500 || !CATEGORIES.includes(item.categoria)) {
      throw new Error('Hay preguntas guardadas con un formato no válido.');
    }
    const optionsError = validateOptions(item);
    if (optionsError) throw new Error(optionsError);
    ids.add(item.id);
  }
  return value;
}
function candidates(items, tipo, categoria) {
  return items.filter(i => i.tipo === tipo && (categoria === 'todos' || i.categoria === categoria));
}
function pick(items, currentId, random = Math.random) {
  const pool = items.filter(i => i.id !== currentId);
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}
function newId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }
function validateOptions(item) {
 if (item.conNombres !== undefined && typeof item.conNombres !== 'boolean') return 'La opción de nombres no es válida.';
 if (item.segundos !== undefined && (!Number.isInteger(item.segundos) || (item.segundos !== 0 && (item.segundos < 5 || item.segundos > 600)))) return 'El temporizador debe durar entre 5 y 600 segundos.';
 const tokens = item.texto.match(/\{[^{}]*\}/g) || [];
 const known = tokens.filter(t => ['{jugador}', '{otro}'].includes(t));
 if (item.conNombres) {
  if (!known.length) return 'Inserta {jugador} o {otro} para usar nombres.';
  if (tokens.some(t => !['{jugador}', '{otro}'].includes(t))) return 'Usa únicamente los marcadores {jugador} y {otro}.';
 } else if (known.length && item.conNombres === false) return 'Activa «Usar nombres» o quita los marcadores del texto.';
 return null;
}
module.exports = { CATEGORIES, LABELS, validateItems, candidates, pick, newId, validateOptions };

const { candidates } = require('./domain');
function availableCards(items, tipo, category, used) {
 const seen = new Set(used);
 return candidates(items, tipo, category).filter(card => !seen.has(card.id));
}
function nameText(text, players, participant, random = Math.random) {
 if (!Array.isArray(players) || players.length < 2 || !Number.isInteger(participant) || !players[participant]) throw new Error('Faltan participantes para personalizar la tarjeta.');
 const others = players.map((_, i) => i).filter(i => i !== participant);
 const partner = others[Math.floor(random() * others.length)];
 return { text: text.replace(/\{jugador\}/g, () => players[participant]).replace(/\{otro\}/g, () => players[partner]), partner };
}
function playerCards(usedByPlayer, participant) {
 return usedByPlayer[participant] || [];
}
function recordCard(usedByPlayer, participant, cardId) {
 const previous = playerCards(usedByPlayer, participant);
 if (previous.includes(cardId)) return usedByPlayer;
 return { ...usedByPlayer, [participant]: [...previous, cardId] };
}
function makeDeal(items, tipo, category, used, players, participant, random = Math.random, lastCardId = null) {
 const available = availableCards(items, tipo, category, used);
 if (!available.length) return null;
 // La variedad es una preferencia; nunca bloquea la última tarjeta pendiente.
 const alternatives = available.filter(card => card.id !== lastCardId);
 const pool = alternatives.length ? alternatives : available;
 const card = pool[Math.floor(random() * pool.length)];
 const personalized = card.conNombres ? nameText(card.texto, players, participant, random) : { text: card.texto, partner: null };
 return { card, ...personalized };
}
module.exports = { availableCards, playerCards, recordCard, nameText, makeDeal };

// Cada posición representa a un participante, aunque dos nombres coincidan.
function pickParticipant(players, random = Math.random) {
 if (!Array.isArray(players) || players.length < 2) throw new Error('Se necesitan al menos dos participantes.');
 return Math.floor(random() * players.length);
}
module.exports = { pickParticipant };

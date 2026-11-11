function wheelTarget(index, count, rounds = 6) {
 if (!Number.isInteger(count) || count < 2 || !Number.isInteger(index) || index < 0 || index >= count) throw new Error('Participante de ruleta no válido.');
 return rounds * 360 + ((360 - index * 360 / count) % 360);
}
function sectorPath(index, count, radius = 148, center = 160) {
 const step = 360 / count;
 const point = degree => { const a = degree * Math.PI / 180; return [center + radius * Math.cos(a), center + radius * Math.sin(a)]; };
 const start = point(-90 - step / 2 + index * step);
 const end = point(-90 + step / 2 + index * step);
 return `M ${center} ${center} L ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${step > 180 ? 1 : 0} 1 ${end[0]} ${end[1]} Z`;
}
module.exports = { wheelTarget, sectorPath };

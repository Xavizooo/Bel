function newTimer(seconds) { return { remaining: seconds * 1000, deadline: null }; }
function remainingTime(timer, now) { return timer.deadline === null ? timer.remaining : Math.max(0, Math.min(timer.remaining, timer.deadline - now)); }
function startTimer(timer, now) { return timer.deadline !== null || timer.remaining <= 0 ? timer : { ...timer, deadline: now + timer.remaining }; }
function pauseTimer(timer, now) { return { remaining: remainingTime(timer, now), deadline: null }; }
function displaySeconds(milliseconds) { return Math.max(0, Math.ceil(milliseconds / 1000)); }
module.exports = { newTimer, remainingTime, startTimer, pauseTimer, displaySeconds };

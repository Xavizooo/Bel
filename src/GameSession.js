import React, { createContext, useContext, useRef, useState } from 'react';
import { makeDeal, playerCards, recordCard } from './game';
const Context = createContext(null);
export function GameSessionProvider({ children }) {
 const history = useRef({ usedByPlayer: {}, lastCardId: null });
 const [usedByPlayer, setUsedByPlayer] = useState({});
 function resetQuestions() { history.current = { usedByPlayer: {}, lastCardId: null }; setUsedByPlayer({}); }
 function draw(items, tipo, category, players, participant) {
  const snapshot = history.current;
  const result = makeDeal(items, tipo, category, playerCards(snapshot.usedByPlayer, participant), players, participant, Math.random, snapshot.lastCardId);
  if (result) {
   const next = recordCard(snapshot.usedByPlayer, participant, result.card.id);
   history.current = { usedByPlayer: next, lastCardId: result.card.id };
   setUsedByPlayer(next);
  }
  return result;
 }
 return <Context.Provider value={{ usedByPlayer, startSession: resetQuestions, resetQuestions, draw }}>{children}</Context.Provider>;
}
export const useGame = () => useContext(Context);

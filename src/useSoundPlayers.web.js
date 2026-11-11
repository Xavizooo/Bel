import { useEffect, useMemo } from 'react';
import { Asset } from 'expo-asset';
import { SOUND_ASSETS } from './soundAssets';
export function useSoundPlayers() {
 const players = useMemo(() => {
  if (typeof Audio === 'undefined') return {};
  return Object.fromEntries(Object.entries(SOUND_ASSETS).map(([name, source]) => {
   const audio = new Audio(Asset.fromModule(source).uri);
   audio.preload = 'auto'; audio.volume = .7;
   return [name, { play(allowed) { if (!allowed()) return Promise.resolve(); audio.currentTime = 0; return audio.play(); }, pause() { audio.pause(); }, dispose() { audio.pause(); audio.removeAttribute('src'); audio.load(); } }];
  }));
 }, []);
 useEffect(() => () => Object.values(players).forEach(player => player.dispose()), [players]);
 return players;
}

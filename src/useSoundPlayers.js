import { useEffect, useMemo } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { SOUND_ASSETS } from './soundAssets';
export function useSoundPlayers() {
 const tap = useAudioPlayer(SOUND_ASSETS.tap);
 const tick = useAudioPlayer(SOUND_ASSETS.tick);
 const spin = useAudioPlayer(SOUND_ASSETS.spin);
 const winner = useAudioPlayer(SOUND_ASSETS.winner);
 const complete = useAudioPlayer(SOUND_ASSETS.complete);
 useEffect(() => { setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }).catch(() => {}); }, []);
 return useMemo(() => Object.fromEntries(Object.entries({ tap, tick, spin, winner, complete }).map(([name, player]) => [name, {
  async play(allowed) { await player.seekTo(0); if (allowed()) { player.volume = .7; player.play(); } },
  pause() { player.pause(); },
 }])), [tap, tick, spin, winner, complete]);
}

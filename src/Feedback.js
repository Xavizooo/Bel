import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform, Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSoundPlayers } from './useSoundPlayers';
import { colors, styles } from './theme';
const Context = createContext(null);
export function FeedbackProvider({ children }) {
 const players = useSoundPlayers();
 const [sound, setSoundState] = useState(true);
 const [vibration, setVibrationState] = useState(true);
 const [status, setStatus] = useState('');
 const settings = useRef({ sound: true, vibration: true });
 const epoch = useRef(0);
 const active = useRef(true);
 const stopAll = useCallback(() => { epoch.current++; Object.values(players).forEach(player => { try { player.pause(); } catch {} }); }, [players]);
 useEffect(() => {
  active.current = true;
  const listener = AppState.addEventListener('change', state => { active.current = state === 'active'; if (!active.current) stopAll(); });
  return () => { active.current = false; listener.remove(); stopAll(); };
 }, [stopAll]);
 const stopSpin = useCallback(() => { epoch.current++; try { players.spin?.pause(); } catch {} }, [players]);
 const feedback = useCallback((kind, { audio = true, haptic = true } = {}) => {
  if (!active.current) return;
  const version = epoch.current;
  if (audio && settings.current.sound && players[kind]) {
   try { Promise.resolve(players[kind].play(() => active.current && settings.current.sound && epoch.current === version)).catch(() => { if (active.current) setStatus('Si no se oye, activa el sonido con un toque y revisa el volumen del dispositivo.'); }); }
   catch { setStatus('El sonido no está disponible en este dispositivo.'); }
  }
  if (haptic && settings.current.vibration) {
   const strong = kind === 'winner' || kind === 'complete';
   const effect = Platform.OS === 'android' ? Haptics.performAndroidHapticsAsync(strong ? Haptics.AndroidHaptics.Confirm : Haptics.AndroidHaptics.Clock_Tick) : strong ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Haptics.selectionAsync();
   effect.catch(() => {});
  }
 }, [players]);
 function setSound(value) { settings.current.sound = value; setSoundState(value); setStatus(''); if (!value) stopAll(); else feedback('tap', { haptic: false }); }
 function setVibration(value) { settings.current.vibration = value; setVibrationState(value); if (value) feedback('tap', { audio: false }); }
 return <Context.Provider value={{ sound, vibration, setSound, setVibration, feedback, stopSpin, status }}>{children}</Context.Provider>;
}
export const useFeedback = () => useContext(Context);
export function FeedbackControls() {
 const { sound, vibration, setSound, setVibration, status } = useFeedback();
 return <View style={{ gap: 8 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={styles.muted}>Sonido</Text><Switch accessibilityLabel="Sonido del juego" value={sound} onValueChange={setSound} trackColor={{ false: '#4B3A5B', true: colors.truth }} /></View>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={styles.muted}>Vibración</Text><Switch accessibilityLabel="Vibración del juego" value={vibration} onValueChange={setVibration} trackColor={{ false: '#4B3A5B', true: colors.dare }} /></View>
 </View>{!!status && <Text style={[styles.muted, { fontSize: 12 }]}>{status}</Text>}</View>;
}

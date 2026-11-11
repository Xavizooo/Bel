import React, { useEffect, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, useAnimatedStyle, withTiming, withRepeat, interpolateColor, cancelAnimation, Easing } from 'react-native-reanimated';
import { Button } from './UI';
import { styles, colors } from '../theme';
import { useFeedback } from '../Feedback';
import { useMotion } from './Motion';
import { LightWave } from './Atmosphere';
import { newTimer, startTimer, pauseTimer, remainingTime, displaySeconds } from '../timer';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const circumference = 2 * Math.PI * 66;
export default function Countdown({ seconds, accent = colors.dare, disabled = false }) {
 const clock = useRef(newTimer(seconds));
 const [remaining, setRemaining] = useState(seconds * 1000);
 const [running, setRunning] = useState(false);
 const [started, setStarted] = useState(false);
 const [finished, setFinished] = useState(false);
 const announced = useRef(false);
 const lastTick = useRef(null);
 const { feedback } = useFeedback();
 const feedbackRef = useRef(feedback); feedbackRef.current = feedback;
 const reduced = useMotion();
 const progress = useSharedValue(1);
 const pulse = useSharedValue(0);
 const urgency = useSharedValue(0);
 const count = displaySeconds(remaining);
 const critical = running && count > 0 && count <= 3;
 useEffect(() => {
  urgency.value = withTiming(critical ? 1 : 0, { duration: 180 });
  if (critical && !reduced) { pulse.value = 0; pulse.value = withRepeat(withTiming(1, { duration: 430, easing: Easing.inOut(Easing.sin) }), -1, true); }
  else { cancelAnimation(pulse); pulse.value = 0; }
  return () => cancelAnimation(pulse);
 }, [critical, reduced, pulse, urgency]);
 const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * .04 }] }));
 useEffect(() => { progress.value = withTiming(remaining / (seconds * 1000), { duration: reduced ? 0 : 100, easing: Easing.linear }); }, [remaining, seconds, reduced, progress]);
 const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - progress.value), stroke: finished ? '#98E4C5' : interpolateColor(urgency.value, [0, 1], [accent, '#FF9E00']) }));
 function pause() {
  clock.current = pauseTimer(clock.current, Date.now()); setRemaining(clock.current.remaining); setRunning(false);
  if (!clock.current.remaining && !announced.current) { announced.current = true; setFinished(true); feedbackRef.current('complete'); }
 }
 useEffect(() => {
  const subscription = AppState.addEventListener('change', state => { if (state !== 'active') pause(); });
  return () => subscription.remove();
 }, []);
 useEffect(() => {
  if (disabled && running) pause();
 }, [disabled, running]);
 useEffect(() => {
  if (!running) return undefined;
  function update() {
   const left = remainingTime(clock.current, Date.now());
   setRemaining(left);
   const count = displaySeconds(left);
   if (count > 0 && count <= 3 && lastTick.current !== count) { lastTick.current = count; feedbackRef.current('tick', { haptic: false }); }
   if (!left && !announced.current) {
    announced.current = true; clock.current = newTimer(0); setRunning(false); setFinished(true); feedbackRef.current('complete');
   }
  }
  update(); const interval = setInterval(update, 100);
  return () => clearInterval(interval);
 }, [running]);
 function start() { if (disabled || clock.current.deadline !== null || clock.current.remaining <= 0) return; clock.current = startTimer(clock.current, Date.now()); setStarted(true); setRunning(true); feedback('tap'); }
 function reset() { clock.current = newTimer(seconds); announced.current = false; lastTick.current = null; setRemaining(seconds * 1000); setRunning(false); setStarted(false); setFinished(false); }
 return <View style={[styles.panel, { alignItems: 'center' }]}>
  <Text style={styles.label}>CUENTA REGRESIVA · {seconds} S</Text>
  <Animated.View style={[{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }, pulseStyle]}>
   {finished && <LightWave color="#98E4C5" size={150} />}
   <Svg width="160" height="160" style={{ position: 'absolute' }} viewBox="0 0 160 160"><Circle cx="80" cy="80" r="66" fill="none" stroke="#FFFFFF10" strokeWidth="6" /><AnimatedCircle cx="80" cy="80" r="66" fill="none" stroke={finished ? '#98E4C5' : accent} strokeWidth="6" strokeLinecap="round" strokeDasharray={[circumference, circumference]} transform="rotate(-90 80 80)" animatedProps={animatedProps} /></Svg>
   <Text style={[styles.title, { fontSize: 45, lineHeight: 52, color: finished ? '#98E4C5' : critical ? '#FFC07D' : 'white' }]}>{count}</Text><Text style={styles.muted}>segundos</Text>
  </Animated.View>
  <Text accessibilityLiveRegion="polite" style={styles.muted}>{finished ? 'Tiempo terminado. Pueden continuar a su ritmo.' : running ? '¡En marcha!' : started ? 'En pausa' : 'Pulsa Iniciar cuando estén listos.'}</Text>
  <View style={[styles.row, { width: '100%' }]}>
   {!finished && <Button title={running ? 'Pausar' : started ? 'Continuar' : 'Iniciar'} disabled={disabled} style={{ flex: 1 }} accent={accent} onPress={() => { if (running) pause(); else start(); }} />}
   <Button title="Reiniciar" secondary disabled={disabled || !started} style={{ flex: 1 }} onPress={reset} />
  </View>
  <Text style={[styles.muted, { fontSize: 11, textAlign: 'center' }]}>Se pausa al salir de la app. El final del tiempo no cambia el turno.</Text>
 </View>;
}

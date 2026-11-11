import React, { useEffect, useRef, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, useAnimatedReaction, useAnimatedProps, Easing, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { GameScreen as Screen, Button } from '../components/UI';
import { Enter, Reveal, Confetti, useMotion } from '../components/Motion';
import { styles, colors } from '../theme';
import { pickParticipant } from '../session';
import { wheelTarget, sectorPath } from '../wheel';
import { useFeedback, FeedbackControls } from '../Feedback';
import { LightWave } from '../components/Atmosphere';
const PALETTE = ['#E64979', '#C87925', '#7950BC', '#238D8B', '#AE457B', '#5465BC'];
const AnimatedG = Animated.createAnimatedComponent(G);
function WheelSector({ name, index, count, winner }) {
 const opacity = useSharedValue(1);
 const selected = winner === index;
 useEffect(() => { opacity.value = withTiming(winner === null || selected ? 1 : .28, { duration: 480 }); return () => cancelAnimation(opacity); }, [winner, selected, opacity]);
 const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));
 const a = (-90 + index * 360 / count) * Math.PI / 180;
 const x = 160 + 100 * Math.cos(a), y = 160 + 100 * Math.sin(a);
 const label = count <= 10 ? (name.length > 11 ? name.slice(0, 10) + '…' : name) : String(index + 1);
 return <AnimatedG animatedProps={animatedProps}><Path d={sectorPath(index, count)} fill={PALETTE[index % PALETTE.length]} stroke={selected ? '#FFE1A2' : '#FFFFFF22'} strokeWidth={selected ? 3 : 1} />{count <= 40 && <SvgText x={x} y={y} fill="white" fontSize={count <= 10 ? 12 : 10} fontWeight="600" textAnchor="middle" alignmentBaseline="middle" transform={`rotate(${index * 360 / count}, ${x}, ${y})`}>{label}</SvgText>}</AnimatedG>;
}
export default function Roulette({ navigation, route }) {
 const { players = [], category = 'todos', turn = 1 } = route.params || {};
 const reduced = useMotion();
 const { feedback, stopSpin } = useFeedback();
 const { width } = useWindowDimensions();
 const size = Math.min(340, Math.max(160, width - 92));
 const rotation = useSharedValue(0);
 const pointer = useSharedValue(0);
 const spinning = useSharedValue(false);
 const lastTick = useRef(0);
 const gate = useRef(false);
 const alive = useRef(true);
 const [busy, setBusy] = useState(false);
 const [winner, setWinner] = useState(null);
 useEffect(() => { alive.current = true; return () => { alive.current = false; spinning.value = false; cancelAnimation(rotation); cancelAnimation(pointer); stopSpin(); }; }, [rotation, pointer, spinning, stopSpin]);
 const animated = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${rotation.value}deg` }] }));
 const pointerStyle = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${pointer.value}deg` }] }));
 function boundaryTick() {
  if (!alive.current || !gate.current || Date.now() - lastTick.current < 75) return;
  lastTick.current = Date.now(); feedback('tick', { haptic: false });
 }
 const step = 360 / Math.max(2, players.length);
 useAnimatedReaction(() => spinning.value ? Math.floor((rotation.value + step / 2) / step) : -1, (value, previous) => {
  if (value >= 0 && previous !== null && previous >= 0 && value !== previous) {
   pointer.value = withSequence(withTiming(-16, { duration: 35 }), withSpring(0, { damping: 12, stiffness: 320 }));
   runOnJS(boundaryTick)();
  }
 });
 function finish(index) { if (!alive.current) return; spinning.value = false; pointer.value = withSpring(0); stopSpin(); feedback('winner'); gate.current = false; setBusy(false); setWinner(index); }
 function spin() {
  if (gate.current || winner !== null || players.length < 2) return;
  gate.current = true; setBusy(true);
  lastTick.current = 0; spinning.value = !reduced;
  if (!reduced) feedback('tap', { audio: false });
  const chosen = pickParticipant(players);
  rotation.value = withTiming(wheelTarget(chosen, players.length), { duration: reduced ? 0 : 4400, easing: Easing.out(Easing.cubic) }, completed => { if (completed) runOnJS(finish)(chosen); });
 }
 if (players.length < 2) return <Screen><Text style={styles.title}>Faltan participantes</Text><Button title="Registrar participantes" onPress={() => navigation.replace('Participantes', { category })} /></Screen>;
 const selected = winner !== null;
 return <Screen>
  <Enter><Text style={styles.label}>EL AZAR DECIDE · TURNO {turn}</Text></Enter>
  <Enter delay={60}><Text style={styles.title}>{selected ? 'La suerte te eligió.' : '¿A quién le toca?'}</Text><Text style={[styles.muted, { marginTop: 8 }]}>{players.length} participantes. Un giro. Tu momento.</Text></Enter>
  <Enter delay={120} style={{ alignItems: 'center' }}>
   <View style={{ position: 'relative', alignItems: 'center', paddingVertical: 16, width: '100%' }}>
    <View pointerEvents="none" style={{ position: 'absolute', width: size + 20, height: size + 20, top: 6, borderRadius: 500, borderWidth: 1, borderColor: '#FFFFFF16', backgroundColor: '#FFFFFF03' }} />
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -2, zIndex: 4 }, pointerStyle]}><Text style={{ color: '#FFE3AE', fontSize: 33, lineHeight: 36 }}>▼</Text></Animated.View>
    <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ width: size, height: size }, animated]}>
     <Svg width={size} height={size} viewBox="0 0 320 320">
      <Defs><RadialGradient id="sheen" cx="35%" cy="25%" r="85%"><Stop offset="0" stopColor="#FFFFFF" stopOpacity=".17" /><Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></RadialGradient></Defs>
      <Circle cx="160" cy="160" r="155" fill="#160F23" stroke="#FFFFFF30" strokeWidth="2" />
      {players.map((name, i) => <WheelSector key={i} name={name} index={i} count={players.length} winner={winner} />)}
      <Circle cx="160" cy="160" r="148" fill="url(#sheen)" />
     </Svg>
    </Animated.View>
    <View pointerEvents="none" style={{ position: 'absolute', top: 16 + size / 2 - 30, width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#FFFFFF55', backgroundColor: '#20152D', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFE3AE', fontSize: 24 }}>✦</Text></View>
   </View>
  </Enter>
  {selected ? <Reveal><View style={[styles.panel, { alignItems: 'center', borderColor: colors.dare + '66', overflow: 'hidden' }]}><LightWave color="#FFD39A" /><Confetti /><Text style={styles.label}>ES TU TURNO</Text><Text accessibilityLiveRegion="polite" style={[styles.title, { color: '#FFD39A', textAlign: 'center', fontSize: 32 }]}>{players[winner]}</Text><Text style={styles.muted}>Verdad o Reto. Tú decides.</Text></View></Reveal> : <Text style={[styles.muted, { textAlign: 'center' }]}>{busy ? 'La ruleta está girando…' : 'Todos tienen la misma oportunidad.'}</Text>}
  {selected ? <Enter><Button title="Elegir Verdad o Reto" accent={colors.dare} onPress={() => navigation.replace('Elegir', { category, players, participant: winner, turn })} /></Enter> : <Button title={busy ? 'Girando…' : 'Girar ruleta'} disabled={busy} large onPress={spin} />}
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>{players.map((name, i) => <View key={i} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, maxWidth: '100%', backgroundColor: PALETTE[i % PALETTE.length] + '22', borderWidth: 1, borderColor: winner === i ? colors.dare : '#FFFFFF12' }}><Text style={[styles.muted, { fontSize: 12 }]}>{i + 1}. {name}</Text></View>)}</View>
  <FeedbackControls />
  <Button title="Volver al inicio" secondary disabled={busy} onPress={() => navigation.popToTop()} />
  <Text style={[styles.muted, { fontSize: 12, textAlign: 'center' }]}>Cada giro es independiente. Una persona puede repetir turno.</Text>
 </Screen>;
}

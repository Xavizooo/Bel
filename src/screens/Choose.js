import React, { useEffect, useRef, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { GameScreen as Screen, Button } from '../components/UI';
import { styles, colors } from '../theme';
import { useStore } from '../Store';
import { LABELS } from '../domain';
import { availableCards, playerCards } from '../game';
import { useGame } from '../GameSession';
import { useFeedback } from '../Feedback';
import { Enter, useMotion } from '../components/Motion';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS, cancelAnimation } from 'react-native-reanimated';
function ChoiceTile({ children, selected, tipo, progress, style }) {
 const animated = useAnimatedStyle(() => ({ opacity: !selected || selected === tipo ? 1 : 1 - progress.value, transform: [{ scale: !selected ? 1 : selected === tipo ? 1 + .065 * progress.value : 1 - .04 * progress.value }, { translateY: !selected ? 0 : selected === tipo ? -8 * progress.value : 24 * progress.value }] }));
 return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
export default function Choose({ navigation, route }) {
 const { category = 'todos', turn = 1, players = [], participant = 0 } = route.params || {};
 const { items } = useStore();
 const { usedByPlayer, resetQuestions, draw } = useGame();
 const received = playerCards(usedByPlayer, participant);
 const counts = { verdad: availableCards(items, 'verdad', category, received).length, reto: availableCards(items, 'reto', category, received).length };
 const exhausted = counts.verdad === 0 && counts.reto === 0;
 const hasHistory = Object.values(usedByPlayer).some(ids => ids.length);
 const { feedback } = useFeedback();
 const [confirm, setConfirm] = useState(false);
 const gate = useRef(false);
 const alive = useRef(true);
 const reduced = useMotion();
 const [selected, setSelected] = useState(null);
 const choiceProgress = useSharedValue(0);
 useEffect(() => { alive.current = true; return () => { alive.current = false; cancelAnimation(choiceProgress); }; }, [choiceProgress]);
 const { width } = useWindowDimensions();
 function completeChoice(tipo) {
  if (!alive.current) return;
  const deal = draw(items, tipo, category, players, participant);
  if (!deal) { gate.current = false; setSelected(null); choiceProgress.value = 0; return; }
  navigation.replace('Tarjeta', { tipo, category, turn, players, participant, deal });
 }
 function choose(tipo) {
  if (gate.current || !counts[tipo]) return;
  gate.current = true; setSelected(tipo); feedback('tap');
  if (reduced) { completeChoice(tipo); return; }
  choiceProgress.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }, done => { if (done) runOnJS(completeChoice)(tipo); });
 }
 return <Screen>
  <Enter><Text style={styles.label}>TU MOMENTO · TURNO {turn} · {LABELS[category]}</Text></Enter>
  <Enter delay={60}><Text style={[styles.subtitle, { color: '#FFD39A' }]}>{players[participant]}</Text><Text style={[styles.title, { marginTop: 10 }]}>¿Qué eliges?</Text><Text style={[styles.muted, { marginTop: 10 }]}>Cada tarjeta puede tocarte una vez por ronda. Las demás personas tienen sus propias tarjetas pendientes.</Text></Enter>
  <View style={{ gap: 16, paddingVertical: 16, flexDirection: width >= 600 ? 'row' : 'column' }}>{['verdad', 'reto'].map((tipo, index) => {
   const count = counts[tipo];
   return <ChoiceTile key={tipo} selected={selected} tipo={tipo} progress={choiceProgress} style={{ flex: width >= 600 ? 1 : undefined }}><Enter delay={140 + index * 80} style={{ gap: 8 }}><Button large icon={tipo === 'verdad' ? '✧' : 'ϟ'} caption={tipo === 'verdad' ? 'Algo por confesar' : 'Algo por intentar'} title={tipo === 'verdad' ? 'Verdad' : 'Reto'} accent={tipo === 'verdad' ? colors.truth : colors.dare} disabled={!count || !!selected} disabledOpacity={selected === tipo ? 1 : .4} onPress={() => choose(tipo)} /><Text style={[styles.muted, { textAlign: 'center', fontSize: 12 }]}>{count ? `${count} ${tipo === 'verdad' ? 'verdades' : 'retos'} pendientes para ti` : 'Ya recibiste todas las tarjetas de este tipo.'}</Text></Enter></ChoiceTile>;
  })}</View>
  {exhausted && <View style={styles.panel}><Text style={styles.text}>Ya recibiste todas las tarjetas de esta categoría.</Text><Text style={styles.muted}>Las demás personas pueden seguir recibiendo las que les falten.</Text><Button title="Pasar turno" onPress={() => navigation.replace('Ruleta', { category, players, turn: turn + 1 })} /></View>}
  {hasHistory && (confirm ? <View style={styles.panel}><Text style={styles.text}>¿Empezar una nueva ronda de preguntas para todos?</Text><Text style={styles.muted}>Se borrará el registro de tarjetas recibidas de todos los participantes. Se mantienen sus nombres y el turno.</Text><Button title="Sí, habilitar todas otra vez" onPress={() => { resetQuestions(); setConfirm(false); }} /><Button title="Cancelar" secondary onPress={() => setConfirm(false)} /></View> : <Button title="Nueva ronda de preguntas" secondary disabled={!!selected} onPress={() => setConfirm(true)} />)}
  <Button title="Volver al inicio" secondary disabled={!!selected} onPress={() => navigation.popToTop()} />
 </Screen>;
}

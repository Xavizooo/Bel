import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { GameScreen as Screen, Button } from '../components/UI';
import { styles, colors } from '../theme';
import { useStore } from '../Store';
import { LABELS } from '../domain';
import { availableCards, playerCards } from '../game';
import { useGame } from '../GameSession';
import { useFeedback, FeedbackControls } from '../Feedback';
import { Enter, useMotion } from '../components/Motion';
import Countdown from '../components/Countdown';
import MysteryCard from '../components/MysteryCard';
export default function Card({ navigation, route }) {
 const { tipo, category, turn, players = [], participant = 0, deal: initialDeal } = route.params;
 const { items } = useStore();
 const { usedByPlayer, draw } = useGame();
 const { feedback } = useFeedback();
 const reduced = useMotion();
 const [deal, setDeal] = useState(initialDeal || null);
 const [busy, setBusy] = useState(false);
 const [revealed, setRevealed] = useState(false);
 const gate = useRef(false);
 const alive = useRef(true);
 const rotation = useSharedValue(0);
 const accent = tipo === 'verdad' ? colors.truth : colors.dare;
 const remaining = availableCards(items, tipo, category, playerCards(usedByPlayer, participant)).length;
 const card = deal?.card;
 useEffect(() => { alive.current = true; return () => { alive.current = false; cancelAnimation(rotation); }; }, [rotation]);
 const animated = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${rotation.value}deg` }] }));
 function finish() { if (alive.current) { gate.current = false; setBusy(false); } }
 function midpoint(next) {
  if (!alive.current) return;
  setDeal(next); setRevealed(false); rotation.value = -90;
  requestAnimationFrame(() => { if (alive.current) rotation.value = withSpring(0, { damping: 22, stiffness: 200 }, () => runOnJS(finish)()); });
 }
 function change() {
  if (gate.current) return;
  gate.current = true;
  const next = draw(items, tipo, category, players, participant);
  if (!next) { gate.current = false; return; }
  feedback('tap');
  if (reduced) { setDeal(next); setRevealed(false); gate.current = false; return; }
  setBusy(true);
  rotation.value = withTiming(90, { duration: 220 }, completed => { if (completed) runOnJS(midpoint)(next); });
 }
 return <Screen>
  <Enter><Text style={styles.label}>TURNO {turn} · {LABELS[category]}</Text><Text style={[styles.subtitle, { marginTop: 12 }]}>{players[participant]}</Text><Text style={[styles.title, { color: accent, marginTop: 6 }]}>{tipo === 'verdad' ? 'Verdad' : 'Reto'}</Text></Enter>
  <Enter delay={100}><Animated.View style={[{ marginVertical: 8 }, animated]}><MysteryCard key={card?.id || 'empty'} tipo={tipo} text={deal?.text || 'No hay tarjetas nuevas disponibles.'} accent={accent} named={card?.conNombres} remaining={remaining} revealed={revealed} busy={busy} onRevealStart={() => { gate.current = true; setBusy(true); feedback('tap'); }} onReveal={() => { setRevealed(true); gate.current = false; setBusy(false); }} /></Animated.View></Enter>
  {revealed && !!card?.segundos && <Countdown key={card.id} seconds={card.segundos} accent={accent} disabled={busy} />}
  <Button title="Pasar turno" disabled={busy} accent={accent} onPress={() => navigation.replace('Ruleta', { category, players, turn: turn + 1 })} />
  <Button title="Cambiar pregunta" secondary disabled={busy || !remaining} onPress={change} />
  {!remaining && <Text style={styles.muted}>Ya recibiste todas las tarjetas de este tipo. Las otras personas todavía pueden recibir las que les falten.</Text>}
  <FeedbackControls />
  <Text style={[styles.muted, { textAlign: 'center' }]}>Sin presión. Pasar también es parte del juego.</Text>
 </Screen>;
}

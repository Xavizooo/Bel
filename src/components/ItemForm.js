import React, { useRef, useState } from 'react';
import { Text, TextInput, View, Switch } from 'react-native';
import { Button, TypePicker, CategoryPicker } from './UI';
import { styles, colors } from '../theme';
import { validateOptions } from '../domain';
import { nameText } from '../game';
export default function ItemForm({ initial, onSave, saving, onCancel }) {
 const [tipo, setTipo] = useState(initial?.tipo || 'verdad');
 const [categoria, setCategoria] = useState(initial?.categoria || 'divertido');
 const [texto, setTexto] = useState(initial?.texto || '');
 const [conNombres, setConNombres] = useState(initial?.conNombres || false);
 const [timerOn, setTimerOn] = useState((initial?.segundos || 0) > 0);
 const [seconds, setSeconds] = useState(String(initial?.segundos || 30));
 const [localBusy, setLocalBusy] = useState(false);
 const [message, setMessage] = useState('');
 const selection = useRef({ start: texto.length, end: texto.length });
 const input = useRef(null);
 const locked = localBusy || saving;
 const secondsValid = /^\d+$/.test(seconds) && Number(seconds) >= 5 && Number(seconds) <= 600;
 const draft = { tipo, categoria, texto: texto.trim(), conNombres, segundos: timerOn ? Number(seconds) : 0 };
 const optionsError = validateOptions(draft);
 const valid = !!texto.trim() && (!timerOn || secondsValid) && !optionsError;
 const preview = conNombres ? nameText(texto, ['Alex', 'Sam'], 0, () => 0).text : texto;
 function insert(token) {
  const { start, end } = selection.current;
  const next = texto.slice(0, start) + token + texto.slice(end);
  if (next.length > 500) { setMessage('El texto no puede superar 500 caracteres.'); return; }
  setTexto(next); selection.current = { start: start + token.length, end: start + token.length }; input.current?.focus();
 }
 async function submit() {
  if (!valid || locked) return;
  setLocalBusy(true); setMessage('');
  try {
   await onSave(draft);
   if (!initial) { setTexto(''); setConNombres(false); setTimerOn(false); setSeconds('30'); selection.current = { start: 0, end: 0 }; setMessage('Tarjeta guardada. Ya puedes usarla en el juego.'); }
  } catch { setMessage('No se pudo guardar. Tu texto sigue aquí; inténtalo otra vez.'); }
  finally { setLocalBusy(false); }
 }
 return <View style={{ gap: 18 }}>
  <Text style={styles.label}>TIPO</Text><TypePicker value={tipo} onChange={setTipo} />
  <Text style={styles.label}>CATEGORÍA</Text><CategoryPicker value={categoria} onChange={setCategoria} />
  <Text style={styles.label}>TEXTO</Text>
  <TextInput ref={input} accessibilityLabel="Texto de la verdad o reto" style={styles.input} multiline maxLength={500} value={texto} onChangeText={setTexto} onSelectionChange={event => { selection.current = event.nativeEvent.selection; }} placeholder="Escribe tu pregunta o reto…" placeholderTextColor="#A598BC" editable={!locked} />
  <Text style={styles.muted}>{texto.length}/500</Text>
  <View style={styles.panel}>
   <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Text style={[styles.text, { flex: 1 }]}>Usar nombres</Text><Switch accessibilityLabel="Usar nombres en la tarjeta" value={conNombres} disabled={locked} onValueChange={setConNombres} trackColor={{ false: '#4B3A5B', true: colors.truth }} /></View>
   {conNombres && <><Text style={styles.muted}>Inserta los nombres donde quieras. «Otra persona» siempre será distinta de quien juega.</Text><View style={{ gap: 8 }}><Button title="+ Quien juega {jugador}" secondary disabled={locked} onPress={() => insert('{jugador}')} /><Button title="+ Otra persona {otro}" secondary disabled={locked} onPress={() => insert('{otro}')} /></View><Text style={styles.muted}>Ejemplo: {'{jugador}'}, dile algo bonito a {'{otro}'}.</Text></>}
  </View>
  <View style={styles.panel}>
   <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Text style={[styles.text, { flex: 1 }]}>Cuenta regresiva</Text><Switch accessibilityLabel="Activar cuenta regresiva en la tarjeta" value={timerOn} disabled={locked} onValueChange={setTimerOn} trackColor={{ false: '#4B3A5B', true: colors.dare }} /></View>
   {timerOn && <><Text style={styles.muted}>Para verdades o retos. El tiempo empieza cuando la persona pulsa Iniciar.</Text><View style={styles.row}>{[15, 30, 60].map(n => <Button key={n} title={`${n} s`} style={{ flex: 1 }} secondary={seconds !== String(n)} disabled={locked} onPress={() => setSeconds(String(n))} accent={colors.dare} />)}</View><Text style={styles.label}>DURACIÓN PERSONALIZADA (5 A 600 SEGUNDOS)</Text><TextInput accessibilityLabel="Duración en segundos" keyboardType="number-pad" value={seconds} onChangeText={setSeconds} maxLength={3} editable={!locked} style={[styles.input, { minHeight: 58 }]} />{!secondsValid && <Text style={{ color: colors.truth }}>Introduce un número entero de 5 a 600.</Text>}</>}
  </View>
  {texto.trim() && <View style={styles.panel}><Text style={styles.label}>VISTA PREVIA · NOMBRES DE EJEMPLO</Text><Text style={styles.text}>{preview}</Text><Text style={styles.muted}>{timerOn && secondsValid ? `${seconds} segundos · Inicio manual` : 'Sin temporizador'}</Text></View>}
  {!!optionsError && <Text style={{ color: colors.truth }}>{optionsError}</Text>}
  {!!message && <Text accessibilityLiveRegion="polite" style={styles.muted}>{message}</Text>}
  <Button title={locked ? 'Guardando…' : 'Guardar'} disabled={locked || !valid} onPress={submit} />
  {onCancel && <Button title="Cancelar edición" secondary disabled={locked} onPress={onCancel} />}
 </View>;
}

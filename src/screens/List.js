import React, { useEffect, useRef, useState } from 'react';
import { Text, View, FlatList, Modal, ScrollView } from 'react-native';
import { GameScreen as Screen, Button, CategoryPicker } from '../components/UI';
import { useMotion } from '../components/Motion';
import ItemForm from '../components/ItemForm';
import { styles, colors } from '../theme';
import { LABELS } from '../domain';
import { useStore } from '../Store';
export default function List() {
 const { items, update, remove, saving } = useStore();
 const reduced = useMotion();
 const [editing, setEditing] = useState(null);
 const [category, setCategory] = useState('todos');
 const [pendingDelete, setPendingDelete] = useState(null);
 const [deleteError, setDeleteError] = useState('');
 const [deleting, setDeleting] = useState(false);
 const [status, setStatus] = useState('');
 const deleteGate = useRef(false);
 const alive = useRef(true);
 useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
 function confirmDelete(item) {
  if (saving || deleteGate.current) return;
  setDeleteError(''); setStatus(''); setPendingDelete(item);
 }
 function cancelDelete() { if (!deleteGate.current) { setPendingDelete(null); setDeleteError(''); } }
 async function deleteCard() {
  if (!pendingDelete || saving || deleteGate.current) return;
  deleteGate.current = true; setDeleting(true); setDeleteError('');
  try {
   await remove(pendingDelete.id);
   if (alive.current) { setPendingDelete(null); setStatus('Tarjeta eliminada.'); }
  } catch {
   if (alive.current) setDeleteError('No se pudo borrar. La tarjeta se ha conservado. Puedes intentarlo otra vez.');
  } finally { deleteGate.current = false; if (alive.current) setDeleting(false); }
 }
 if (editing) return <Screen><Text style={styles.title}>Editar tarjeta</Text><Text style={styles.muted}>Puedes cambiar el texto, tipo, categoría, nombres y temporizador.</Text><ItemForm key={editing.id} initial={editing} saving={saving} onCancel={() => setEditing(null)} onSave={async item => {
  await update(editing.id, item);
  if (alive.current) { setEditing(null); setStatus('Cambios guardados.'); }
 }} /></Screen>;
 const filtered = items.filter(i => category === 'todos' || category === i.categoria);
 const header = <View style={{ gap: 18, paddingBottom: 18 }}><Text style={styles.title}>Sus tarjetas</Text><CategoryPicker all value={category} onChange={setCategory} /><Text style={styles.muted}>{filtered.length} tarjetas · Edita también nombres y temporizador.</Text>{!!status && <Text accessibilityLiveRegion="polite" style={styles.muted}>{status}</Text>}</View>;
 return <Screen scroll={false}>
  <FlatList accessibilityLabel="Lista de tarjetas" style={{ flex: 1, minHeight: 0 }} data={filtered} keyExtractor={i => i.id} keyboardShouldPersistTaps="handled" initialNumToRender={8} maxToRenderPerBatch={8}
   ListHeaderComponent={header} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
   ListEmptyComponent={<Text style={styles.muted}>No hay tarjetas aquí. Puedes crear nuevas desde Agregar o elegir otra categoría.</Text>}
   renderItem={({ item }) => <View style={styles.panel}>
    <Text style={[styles.label, { color: item.tipo === 'verdad' ? colors.truth : colors.dare }]}>{item.tipo.toUpperCase()} · {LABELS[item.categoria]}</Text>
    <Text style={styles.text}>{item.texto}</Text>
    <Text style={[styles.muted, { fontSize: 12 }]}>{item.conNombres ? 'Con nombres de participantes' : 'Sin nombres'} · {item.segundos ? `${item.segundos} s` : 'Sin temporizador'}</Text>
    <View style={styles.row}><Button title="Editar" secondary disabled={saving || deleting} style={{ flex: 1 }} onPress={() => { setStatus(''); setEditing(item); }} /><Button title="Borrar" secondary disabled={saving || deleting} style={{ flex: 1 }} onPress={() => confirmDelete(item)} /></View>
   </View>} />
  <Modal visible={!!pendingDelete} transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={cancelDelete}>
   <View style={{ flex: 1, backgroundColor: '#080510D9', justifyContent: 'center', alignItems: 'center', padding: 22 }}>
    <View accessibilityViewIsModal style={[styles.panel, { width: '100%', maxWidth: 520, maxHeight: '85%', backgroundColor: '#20142D' }]}>
     <Text accessibilityRole="header" style={styles.subtitle}>¿Borrar esta tarjeta?</Text>
     <ScrollView style={{ flexShrink: 1 }}><Text style={styles.text}>{pendingDelete?.texto}</Text></ScrollView>
     <Text style={styles.muted}>Se eliminará de tus tarjetas guardadas.</Text>
     {!!deleteError && <Text accessibilityLiveRegion="assertive" style={{ color: '#FF95B3', fontFamily: 'Inter_400Regular', lineHeight: 22 }}>{deleteError}</Text>}
     <Button title={deleting ? 'Borrando…' : 'Confirmar borrado'} accent={colors.truth} disabled={saving || deleting} onPress={deleteCard} />
     <Button title="Cancelar" secondary disabled={saving || deleting} onPress={cancelDelete} />
    </View>
   </View>
  </Modal>
 </Screen>;
}

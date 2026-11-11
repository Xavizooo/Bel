import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaults from './data/defaults.json';
import { newId } from './domain';
import { loadItems, saveItems } from './storage';
const Context = createContext(null);
export function StoreProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const current = useRef([]);
  const locked = useRef(false);
  async function load() {
    setLoading(true); setError(null);
    try {
      const next = await loadItems(AsyncStorage, defaults);
      current.current = next; setItems(next);
    } catch (e) { setError('No pudimos leer tus preguntas. No hemos sobrescrito tus datos. ' + e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function commit(change) {
    if (locked.current) throw new Error('Espera a que termine el guardado.');
    locked.current = true; setSaving(true);
    try {
      const next = await saveItems(AsyncStorage, change(current.current));
      current.current = next; setItems(next);
    } finally { locked.current = false; setSaving(false); }
  }
  const add = item => commit(old => [...old, { ...item, id: newId() }]);
  const update = (id, item) => commit(old => old.map(i => i.id === id ? { ...item, id } : i));
  const remove = id => commit(old => old.filter(i => i.id !== id));
  return <Context.Provider value={{ items, loading, error, saving, reload: load, add, update, remove }}>{children}</Context.Provider>;
}
export const useStore = () => useContext(Context);

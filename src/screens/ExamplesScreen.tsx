import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorage } from '../services/storage';
import { deleteItem, parseItems, saveItem, type ExampleItem } from '../services/exampleItems';
import { useLanguage } from '../ui/LanguageContext';
import { AppButton, AppCard, AppScreen, AppText, ConfirmDialog, FeedbackBanner, TextField } from '../ui/primitives';

const storage = createStorage(AsyncStorage, 'template-example-v1');
export function ExamplesScreen() {
  const { language } = useLanguage();
  const pl = language === 'pl';
  const [items, setItems] = useState<ExampleItem[]>([]);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    storage.get<unknown>('items').then(value => { if (active) setItems(parseItems(value)); })
      .catch(() => { if (active) setError('Could not load items'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const persist = async (next: ExampleItem[]) => {
    try { await storage.set('items', next); setItems(next); setError(''); return true; }
    catch { setError(pl ? 'Błąd zapisu' : 'Could not save'); return false; }
  };
  const submit = async () => {
    try {
      const next = saveItem(items, title, editing ?? undefined);
      if (await persist(next)) { setTitle(''); setEditing(null); }
    } catch { setError(pl ? 'Wpisz nazwę' : 'Enter a title'); }
  };
  return <AppScreen>
    <AppText title>{pl ? 'Zapisane elementy' : 'Saved items'}</AppText>
    <AppText>{pl ? 'Przykład zapisu lokalnego' : 'Local persistence example'}</AppText>
    {error ? <FeedbackBanner kind="error" message={error} /> : null}
    <AppCard>
      <TextField label={pl ? 'Nazwa' : 'Title'} value={title} onChangeText={setTitle} />
      <AppButton label={editing ? (pl ? 'Zapisz' : 'Save') : (pl ? 'Dodaj' : 'Add')} disabled={!ready} onPress={() => { void submit(); }} />
      {editing ? <AppButton label={pl ? 'Anuluj' : 'Cancel'} variant="secondary" onPress={() => { setEditing(null); setTitle(''); }} /> : null}
    </AppCard>
    {!ready ? <AppText>Loading…</AppText> : items.length === 0 ? <AppText>{pl ? 'Brak elementów' : 'No items yet'}</AppText> : items.map(item => <AppCard key={item.id}>
      <AppText>{item.title}</AppText>
      <AppButton label={pl ? 'Edytuj' : 'Edit'} variant="secondary" onPress={() => { setEditing(item.id); setTitle(item.title); }} />
      <AppButton label={pl ? 'Usuń' : 'Delete'} variant="secondary" onPress={() => setDeleting(item.id)} />
    </AppCard>)}
    <ConfirmDialog visible={deleting !== null} title={pl ? 'Usunąć?' : 'Delete item?'} cancelLabel={pl ? 'Anuluj' : 'Cancel'} confirmLabel={pl ? 'Usuń' : 'Delete'} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) void persist(deleteItem(items, deleting)); setDeleting(null); }} />
  </AppScreen>;
}

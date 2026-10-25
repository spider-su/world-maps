import { SPEECH_LOCALES, type Language } from '../../ui/i18n';
interface Voice { identifier: string; language: string }
interface SpeechOptions { language: string; voice?: string; rate: number; onError: () => void }
interface Adapter { stop: () => Promise<unknown>; voices: () => Promise<Voice[]>; speak: (text: string, options: SpeechOptions) => void }

/** One serialized stop/speak queue. A stale stop cannot cancel a newer utterance. */
export function createSpeechController(adapter: Adapter, onUnavailable: (failed: boolean) => void) {
  let epoch = 0;
  let queue = Promise.resolve();
  const enqueue = (operation: () => Promise<void>) => { queue = queue.then(operation).catch(() => undefined); return queue; };
  return {
    speak: (text: string, language: Language) => {
      const turn = ++epoch;
      onUnavailable(false);
      return enqueue(async () => {
        try {
          await adapter.stop();
          if (turn !== epoch) return;
          const voices = await adapter.voices();
          if (turn !== epoch) return;
          const locale = SPEECH_LOCALES[language];
          const voice = voices.find(v => v.language.toLowerCase().replace('_', '-') === locale.toLowerCase())
            ?? voices.find(v => v.language.toLowerCase().split(/[-_]/)[0] === language);
          if (!voice) { onUnavailable(true); return; }
          adapter.speak(text, { language: locale, voice: voice.identifier, rate: 0.9,
            onError: () => { if (turn === epoch) onUnavailable(true); } });
        } catch { if (turn === epoch) onUnavailable(true); }
      });
    },
    stop: () => { ++epoch; return enqueue(async () => { await adapter.stop(); }); },
    flush: () => queue,
  };
}

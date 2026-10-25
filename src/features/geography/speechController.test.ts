import { describe, expect, it, vi } from 'vitest';
import { createSpeechController } from './speechController';
const voices = async () => [{ identifier: 'en', language: 'en-US' }, { identifier: 'pl', language: 'pl-PL' }, { identifier: 'ru', language: 'ru-RU' }];

describe('country pronunciation queue', () => {
  it('only speaks the latest requested country, in its chosen language', async () => {
    const speak = vi.fn(); const stop = vi.fn(async () => undefined);
    const controller = createSpeechController({ stop, voices, speak }, vi.fn());
    controller.speak('Poland', 'en'); controller.speak('Polska', 'pl');
    await controller.speak('Польша', 'ru');
    expect(speak).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledWith('Польша', expect.objectContaining({ language: 'ru-RU', voice: 'ru' }));
  });
  it('cancels pending speech when muted, blurred or language changes', async () => {
    const speak = vi.fn();
    let release!: () => void;
    const stopped = new Promise<void>(resolve => { release = resolve; });
    const controller = createSpeechController({ stop: () => stopped, voices, speak }, vi.fn());
    controller.speak('Polska', 'pl'); await Promise.resolve();
    controller.stop(); release(); await controller.flush();
    expect(speak).not.toHaveBeenCalled();
  });
  it('reports missing voices and failures, then permits replay', async () => {
    const failed = vi.fn(); const speak = vi.fn();
    const available = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce(await voices());
    const controller = createSpeechController({ stop: async () => undefined, voices: available, speak }, failed);
    await controller.speak('Polska', 'pl'); expect(failed).toHaveBeenLastCalledWith(true);
    await controller.speak('Polska', 'pl'); expect(speak).toHaveBeenCalledOnce();
    expect(failed).toHaveBeenLastCalledWith(false);
    speak.mock.calls[0]![1].onError(); expect(failed).toHaveBeenLastCalledWith(true);
    const broken = createSpeechController({ stop: async () => { throw new Error('unavailable'); }, voices, speak }, failed);
    await broken.speak('Polska', 'pl'); expect(failed).toHaveBeenLastCalledWith(true);
  });
});

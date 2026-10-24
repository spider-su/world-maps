import { describe, expect, it, vi } from 'vitest';
import { scheduleExampleNotification } from './notifications';
describe('notification adapter', () => {
  it('does not schedule without permission', async () => {
    const schedule = vi.fn();
    expect(await scheduleExampleNotification({ requestPermission: async () => false, schedule, cancel: async () => {} })).toBeNull();
    expect(schedule).not.toHaveBeenCalled();
  });
  it('schedules after permission', async () => {
    const schedule = vi.fn(async () => 'demo-id');
    expect(await scheduleExampleNotification({ requestPermission: async () => true, schedule, cancel: async () => {} })).toBe('demo-id');
    expect(schedule).toHaveBeenCalledWith({ title: 'Mobile UI Kit', body: 'This is a local example notification.', secondsFromNow: 5 });
  });
});

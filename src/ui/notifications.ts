/** Opt-in adapter: apps implement this with expo-notifications if required. */
export interface LocalNotificationAdapter {
  requestPermission(): Promise<boolean>;
  schedule(input: { title: string; body: string; secondsFromNow: number }): Promise<string>;
  cancel(id: string): Promise<void>;
}
export async function scheduleExampleNotification(adapter: LocalNotificationAdapter): Promise<string | null> {
  if (!await adapter.requestPermission()) return null;
  return adapter.schedule({ title: 'Mobile UI Kit', body: 'This is a local example notification.', secondsFromNow: 5 });
}

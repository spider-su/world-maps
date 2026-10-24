import { useState } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../ui/LanguageContext';
import type { TranslationKey } from '../ui/i18n';
import { AppButton, AppCard, AppScreen, AppText, ConfirmDialog, FeedbackBanner, LoadingSpinner, TextField, ToggleField } from '../ui/primitives';
import { validateDemoForm, type DemoForm, type FormErrors } from '../ui/validation';

export function HomeScreen() {
  const { t } = useLanguage();
  const [form, setForm] = useState<DemoForm>({ name: '', email: '', amount: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState<TranslationKey>('welcome');
  const change = (key: keyof DemoForm) => (value: string) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
  };
  const localError = (error?: string) => {
    const keys: Record<string, 'requiredName' | 'shortName' | 'invalidEmail' | 'positiveAmount' | 'maxAmount'> = {
      'Name is required': 'requiredName',
      'Enter at least 2 characters': 'shortName',
      'Enter a valid email': 'invalidEmail',
      'Enter a positive number': 'positiveAmount',
      'Maximum is 1,000,000': 'maxAmount'
    };
    return error ? t(keys[error] ?? 'correctFields') : undefined;
  };
  const submit = () => {
    const next = validateDemoForm(form);
    setErrors(next);
    setMessage(Object.keys(next).length ? 'correctFields' : 'validated');
  };
  return <AppScreen>
    <AppText title>{t('home')}</AppText>
    <AppText>{t('intro')}</AppText>
    <FeedbackBanner message={t(message)} />
    <AppCard>
      <AppText title>{t('actions')}</AppText>
      <AppButton label={t('showMessage')} onPress={() => setMessage('actionDone')} />
      <AppButton label={t('openConfirm')} variant="secondary" onPress={() => setConfirm(true)} />
      <AppButton label={t('showAlert')} variant="secondary" onPress={() => Alert.alert(t('alertTitle'), t('alertMessage'))} />
      <AppButton label={t('disabled')} disabled onPress={() => undefined} />
    </AppCard>
    <AppCard>
      <AppText title>{t('loadingStates')}</AppText>
      <AppButton label={loading ? t('stopSpinner') : t('showSpinner')} variant="secondary" onPress={() => setLoading(!loading)} />
      {loading ? <LoadingSpinner label={t('loadingExample')} /> : <AppText>{t('ready')}</AppText>}
    </AppCard>
    <AppCard>
      <AppText title>{t('form')}</AppText>
      <TextField label={t('name')} placeholder="Ada" value={form.name} onChangeText={change('name')} error={localError(errors.name)} />
      <TextField label={t('email')} placeholder="ada@example.com" value={form.email} onChangeText={change('email')} error={localError(errors.email)} keyboardType="email-address" />
      <TextField label={t('amount')} placeholder="12.50" value={form.amount} onChangeText={change('amount')} error={localError(errors.amount)} keyboardType="numeric" />
      <ToggleField label={t('preference')} value={enabled} onValueChange={setEnabled} />
      <AppButton label={t('validate')} onPress={submit} />
      <AppButton label={t('clear')} variant="secondary" onPress={() => { setForm({ name: '', email: '', amount: '' }); setErrors({}); setMessage('cleared'); }} />
    </AppCard>
    <AppCard>
      <AppText title>{t('notifications')}</AppText>
      <AppText>{t('notificationsInfo')}</AppText>
    </AppCard>
    <ConfirmDialog visible={confirm} title={t('confirmTitle')} cancelLabel={t('cancel')} confirmLabel={t('confirm')} onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); setMessage('confirmed'); }} />
  </AppScreen>;
}

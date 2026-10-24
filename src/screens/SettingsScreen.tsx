import { useState } from 'react';
import { checkBiometrics, expoBiometricAdapter } from '../ui/biometrics';
import { AppButton, AppCard, AppScreen, AppText, FeedbackBanner } from '../ui/primitives';
import { useLanguage } from '../ui/LanguageContext';

export function SettingsScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const verify = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const result = await checkBiometrics(expoBiometricAdapter());
      setMessage(t(result === 'verified' ? 'biometricSuccess' : result === 'unavailable' ? 'biometricUnavailable' : 'biometricFailed'));
    } catch {
      setMessage(t('biometricFailed'));
    } finally { setChecking(false); }
  };
  return <AppScreen>
    <AppText title>{t('settings')}</AppText>
    <AppCard>
      <AppText title>{t('language')}</AppText>
      <AppButton label={t('english') + (language === 'en' ? ' ✓' : '')} variant="secondary" onPress={() => setLanguage('en')} />
      <AppButton label={t('polish') + (language === 'pl' ? ' ✓' : '')} variant="secondary" onPress={() => setLanguage('pl')} />
    </AppCard>
    <AppCard>
      <AppText title>{t('biometrics')}</AppText>
      <AppText>{t('biometricInfo')}</AppText>
      <AppButton label={t('check')} busy={checking} onPress={() => { void verify(); }} />
    </AppCard>
    <AppCard>
      <AppText title>{t('about')}</AppText>
      <AppText>{t('aboutText')}</AppText>
      <AppText>Expo · React Native · TypeScript</AppText>
      <AppText>{t('privacy')}</AppText>
    </AppCard>
    {message ? <FeedbackBanner message={message} /> : null}
  </AppScreen>;
}

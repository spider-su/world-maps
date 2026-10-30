import { Text, useColorScheme } from 'react-native';
import { useLanguage } from '../../ui/LanguageContext';
import { OptionsSheet } from '../../ui/OptionsSheet';
import { themeForScheme } from '../../ui/worldMapsTheme';
import { useProgress } from './ProgressContext';
import { useMap } from './MapContext';
import { MapSelector } from './MapSelector';
import { DifficultySelector } from './DifficultySelector';
import { PracticeSelector } from './PracticeSelector';
import { QuizOptions } from './ModeSelector';
import { ProgressStatus } from './ProgressStatus';
import { gameCopy } from './copy';
import { polishCopy } from './polishCopy';
import { mapName } from './maps';

export function QuizSetupSummary({ showDifficulty = true }: { showDifficulty?: boolean }) {
  const { language } = useLanguage();
  const { mapId, findClue, nameAnswer } = useMap();
  const { progress } = useProgress();
  const c = gameCopy[language];
  const p = polishCopy[language];
  const theme = themeForScheme(useColorScheme());
  return <Text style={{ color: theme.muted, fontSize: 12, lineHeight: 19 }}>{mapName(mapId, language)}{showDifficulty ? ` · ${c.levels[progress.difficulty]}` : ''} · {c.practiceModes[progress.practiceMode]}{ '\n' }{p.find}: {c.findClues[findClue]} · {p.name}: {c.nameAnswers[nameAnswer]}</Text>;
}

/** Same saved settings at the point of launch and in the map browser. */
export function PlaySetup({ visible, onClose, showDifficulty = true }: { visible: boolean; onClose: () => void; showDifficulty?: boolean }) {
  const { language } = useLanguage();
  const { findClue, setFindClue, nameAnswer, setNameAnswer } = useMap();
  const c = gameCopy[language];
  return <OptionsSheet visible={visible} title={polishCopy[language].setup} closeLabel={c.close} onClose={onClose}>
    <MapSelector />
    {showDifficulty && <DifficultySelector language={language} />}
    <PracticeSelector language={language} />
    <QuizOptions language={language} findClue={findClue} onFindClue={setFindClue} nameAnswer={nameAnswer} onNameAnswer={setNameAnswer} />
    <ProgressStatus language={language} />
  </OptionsSheet>;
}

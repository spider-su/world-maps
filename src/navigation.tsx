import { useState } from 'react';
import type { FindClue, NameAnswer } from './features/geography/modes';
import { EuropeScreen } from './screens/EuropeScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { themeForScheme } from './ui/worldMapsTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from './screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { SettingsScreen } from './screens/SettingsScreen';
import { getTabBarMetrics } from './platform/safeArea';
import { useLanguage } from './ui/LanguageContext';
import { gameCopy } from './features/geography/copy';

export type TabParamList = { Home: undefined; Europe: undefined; Settings: undefined };
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const [findClue, setFindClue] = useState<FindClue>('mixed');
  const [nameAnswer, setNameAnswer] = useState<NameAnswer>('country');
  const { language } = useLanguage();
  const c = gameCopy[language];
  const theme = themeForScheme(useColorScheme());
  const insets = useSafeAreaInsets();
  const tabBar = getTabBarMetrics(insets.bottom);
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.brand,
      tabBarInactiveTintColor: theme.muted,
      tabBarStyle: { ...tabBar, backgroundColor: theme.surface, borderTopColor: theme.border, height: tabBar.height, paddingTop: tabBar.paddingTop, paddingBottom: tabBar.paddingBottom },
    }}>
      <Tab.Screen name="Home" options={{ tabBarLabel: c.home, tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }}>
        {() => <HomeScreen findClue={findClue} nameAnswer={nameAnswer} />}
      </Tab.Screen>
      <Tab.Screen name="Europe" options={{ tabBarLabel: c.europe, tabBarIcon: ({ color, size }) => <Ionicons name="earth-outline" color={color} size={size} /> }}>
        {() => <EuropeScreen findClue={findClue} onFindClue={setFindClue} nameAnswer={nameAnswer} onNameAnswer={setNameAnswer} />}
      </Tab.Screen>
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: c.settings, tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export function AppNavigation() {
  const theme = themeForScheme(useColorScheme());
  const base = useColorScheme() === 'dark' ? DarkTheme : DefaultTheme;
  return <NavigationContainer theme={{ ...base, colors: { ...base.colors, background: theme.paper, card: theme.surface, text: theme.navy, border: theme.border, primary: theme.brand } }}><Tabs /></NavigationContainer>;
}

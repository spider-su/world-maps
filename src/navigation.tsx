import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { themeForScheme } from './ui/worldMapsTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from './screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { SettingsScreen } from './screens/SettingsScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { getTabBarMetrics } from './platform/safeArea';
import { useLanguage } from './ui/LanguageContext';
import { gameCopy } from './features/geography/copy';

export type TabParamList = { Home: undefined; Explore: undefined; Settings: undefined };
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: c.home, tabBarIcon: ({ color, size }) => <Ionicons name="earth-outline" color={color} size={size} /> }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: c.countryCollection, tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: c.settings, tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export function AppNavigation() {
  const theme = themeForScheme(useColorScheme());
  const base = useColorScheme() === 'dark' ? DarkTheme : DefaultTheme;
  return <NavigationContainer theme={{ ...base, colors: { ...base.colors, background: theme.paper, card: theme.surface, text: theme.navy, border: theme.border, primary: theme.brand } }}><Tabs /></NavigationContainer>;
}

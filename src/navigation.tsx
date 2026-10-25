import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from './screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { SettingsScreen } from './screens/SettingsScreen';
import { getTabBarMetrics } from './platform/safeArea';
import { useLanguage } from './ui/LanguageContext';
import { gameCopy } from './features/geography/copy';

export type TabParamList = { Home: undefined; Settings: undefined };
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const { language } = useLanguage();
  const c = gameCopy[language];
  const insets = useSafeAreaInsets();
  const tabBar = getTabBarMetrics(insets.bottom);
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { height: tabBar.height, paddingTop: tabBar.paddingTop, paddingBottom: tabBar.paddingBottom }
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: c.home, tabBarIcon: ({ color, size }) => <Ionicons name="earth-outline" color={color} size={size} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: c.settings, tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export function AppNavigation() {
  return <NavigationContainer theme={DefaultTheme}><Tabs /></NavigationContainer>;
}

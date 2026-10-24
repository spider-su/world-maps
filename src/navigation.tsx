import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HotColdScreen } from './screens/HotColdScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { getTabBarMetrics } from './platform/safeArea';
import { useLanguage } from './ui/LanguageContext';

const Tab = createBottomTabNavigator();

function Tabs() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const tabBar = getTabBarMetrics(insets.bottom);
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { height: tabBar.height, paddingTop: tabBar.paddingTop, paddingBottom: tabBar.paddingBottom }
    }}>
      <Tab.Screen name="Home" component={HotColdScreen} options={{ tabBarLabel: "Play" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t("settings") }} />
    </Tab.Navigator>
  );
}

export function AppNavigation() {
  const scheme = useColorScheme();
  return <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}><Tabs /></NavigationContainer>;
}

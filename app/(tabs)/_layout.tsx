import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { BioBlixPalette, BioBlixTheme } from '@/constants/bioblixTheme';

function BioBlixTabGlyph({
  label,
  color,
  focused,
}: {
  label: string;
  color: string;
  focused: boolean;
}) {
  return (
    <Text
      style={{
        color,
        fontFamily: focused ? 'Syne_700Bold' : 'DMSans_700Bold',
        fontSize: focused ? 13 : 12,
        letterSpacing: 0.4,
      }}
    >
      {label}
    </Text>
  );
}

export default function BioBlixTabLayout() {
  const tab = BioBlixTheme.components.tabBar;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tab.active,
        tabBarInactiveTintColor: tab.inactive,
        tabBarStyle: {
          backgroundColor: tab.background,
          borderTopColor: tab.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_700Bold',
          fontSize: 11,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Blix',
          tabBarIcon: ({ color, focused }) => (
            <BioBlixTabGlyph label="◆" color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Publiser',
          tabBarIcon: ({ color, focused }) => (
            <BioBlixTabGlyph label="＋" color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Konto',
          tabBarIcon: ({ color, focused }) => (
            <BioBlixTabGlyph
              label="◎"
              color={String(color) || BioBlixPalette.muted}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

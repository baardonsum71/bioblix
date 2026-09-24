import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { BioBlixLogo } from '@/components/bioblix/BioBlixLogo';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixTheme } from '@/constants/bioblixTheme';

function TabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{ opacity: focused ? 1 : 0.55 }}>
      <BioBlixLogo variant="mark" size={26} />
    </View>
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
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Publiser',
          tabBarIcon: ({ color, focused }) => (
            <BioBlixText
              variant="label"
              color={String(color)}
              style={{ fontSize: focused ? 18 : 16 }}
            >
              ＋
            </BioBlixText>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Konto',
          tabBarIcon: ({ color, focused }) => (
            <BioBlixText
              variant="label"
              color={String(color)}
              style={{ fontSize: focused ? 14 : 12 }}
            >
              ◎
            </BioBlixText>
          ),
        }}
      />
    </Tabs>
  );
}

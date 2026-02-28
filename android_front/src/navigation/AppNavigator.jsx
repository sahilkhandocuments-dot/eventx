import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { COLORS } from '../theme'

// Screens
import HomeScreen            from '../screens/HomeScreen'
import LoginScreen           from '../screens/LoginScreen'
import SignupScreen          from '../screens/SignupScreen'
import InterestsScreen       from '../screens/InterestsScreen'
import DiscoverScreen        from '../screens/DiscoverScreen'
import EventDetailsScreen    from '../screens/EventDetailsScreen'
import FestsScreen           from '../screens/FestsScreen'
import FestDetailScreen      from '../screens/FestDetailScreen'
import MyPassesScreen        from '../screens/MyPassesScreen'
import ProfileScreen         from '../screens/ProfileScreen'
import CreateEventScreen     from '../screens/CreateEventScreen'
import OrganizerDashScreen   from '../screens/OrganizerDashboardScreen'
import AdminDashScreen       from '../screens/AdminDashboardScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

const TAB_ICON = {
  Home: '🏠', Discover: '🔍', Fests: '🎪', Passes: '🎟', Profile: '👤',
}

function TabBarIcon({ name, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{TAB_ICON[name] || '●'}</Text>
  )
}

function MainTabs() {
  const { isLoggedIn } = useAuth()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: COLORS.accentLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused }) => (
          <TabBarIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Fests"    component={FestsScreen}    />
      {isLoggedIn && <Tab.Screen name="Passes"  component={MyPassesScreen}  />}
      <Tab.Screen name="Profile"  component={ProfileScreen}  />
    </Tab.Navigator>
  )
}

const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: COLORS.bg },
}

export default function AppNavigator() {
  const { loading } = useAuth()
  if (loading) return <LoadingSpinner />

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen name="Main"              component={MainTabs}           options={{ headerShown: false }} />
        <Stack.Screen name="Login"             component={LoginScreen}        options={{ title: 'Sign In' }} />
        <Stack.Screen name="Signup"            component={SignupScreen}       options={{ title: 'Create Account' }} />
        <Stack.Screen name="Interests"         component={InterestsScreen}    options={{ title: 'Your Interests', headerBackVisible: false }} />
        <Stack.Screen name="EventDetails"      component={EventDetailsScreen} options={{ title: 'Event Details' }} />
        <Stack.Screen name="FestDetail"        component={FestDetailScreen}   options={{ title: 'Fest Details' }} />
        <Stack.Screen name="CreateEvent"       component={CreateEventScreen}  options={{ title: 'Create Event' }} />
        <Stack.Screen name="OrganizerDash"     component={OrganizerDashScreen} options={{ title: 'Organizer Dashboard' }} />
        <Stack.Screen name="AdminDash"         component={AdminDashScreen}    options={{ title: 'Admin Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

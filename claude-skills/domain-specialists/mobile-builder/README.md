# /mobile-builder

**Mobile development strategies for React Native, Flutter, and cross-platform applications.**

Use this skill when building mobile apps, choosing between frameworks, or planning native integrations.

---

## What This Skill Does

Teaches **mobile development thinking**. Covers:
- 📱 React Native vs Flutter vs native
- 🚀 Expo vs bare React Native
- ⚡ Mobile-specific performance
- 🔌 Native module integration
- 🧭 Navigation patterns
- 📦 App store deployment
- 🎨 Mobile UI patterns

---

## When to Use

✅ Starting mobile project
✅ Choosing framework
✅ Mobile performance optimization
✅ Native module integration
✅ App store deployment planning

❌ Specific framework API (use framework docs)
❌ Native iOS/Android development (use native guides)

---

## Mobile Framework Selection

### Decision Tree

```
What's your requirement?
│
├── Web + Mobile, share code
│   └── React Native + Expo
│       └── When: Team knows JavaScript, time-to-market critical
│
├── Web + Mobile, maximum performance
│   ├── Performance critical?
│   │   ├── Yes → Native (Swift/Kotlin)
│   │   └── No → Flutter
│   │
├── Cross-platform, desktop too
│   └── Flutter + Web
│       └── When: Single codebase, all platforms
│
├── Premium iOS experience
│   └── Native Swift
│       └── When: iOS-first, custom UI
│
├── Enterprise, existing Java
│   └── Native Kotlin
│       └── When: Android-focused, enterprise
│
└── Rapid prototyping
    └── React Native + Expo
        └── When: MVP, no native modules
```

---

## Framework Comparison

| Framework | Learning | Performance | Code Sharing | Native Access | Maturity |
|-----------|----------|-------------|--------------|---------------|----------|
| **React Native** | Low (JS) | Good | Excellent | Good | Very mature |
| **Flutter** | Medium (Dart) | Excellent | Very good | Excellent | Mature |
| **Native Swift** | High | Excellent | None | Perfect | Established |
| **Native Kotlin** | High | Excellent | None | Perfect | Established |

---

## React Native + Expo

### What is Expo?

Expo is a platform that simplifies React Native development:

| Aspect | Bare RN | Expo |
|--------|---------|------|
| **Setup** | Complex | Simple |
| **Build** | Custom | Managed |
| **Deploy** | Manual | Automatic |
| **Native modules** | Easy | Limited |
| **Performance** | Slightly faster | Good |

### Start Expo Project

```bash
# Create new project
npx create-expo-app MyApp

# or with template
npx create-expo-app --template

# Start development
cd MyApp
npm start

# Scan QR code with Expo Go app
```

### Basic Component

```typescript
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter</Text>
      <Text style={styles.count}>{count}</Text>
      <Button
        title="Increment"
        onPress={() => setCount(count + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
```

### Styling (No Tailwind)

```typescript
// React Native uses StyleSheet (CSS-in-JS)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

// No class names, direct reference
<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
  <Pressable style={styles.button}>
    {/* pressable for interactions */}
  </Pressable>
</View>
```

---

## Flutter Basics

### Why Flutter?

- **Single codebase** - iOS, Android, Web, Desktop
- **Hot reload** - See changes instantly
- **Beautiful UX** - Material Design built-in
- **Performance** - Compiled to native

### Flutter Project Structure

```
lib/
├── main.dart           # Entry point
├── screens/
│   ├── home_screen.dart
│   ├── detail_screen.dart
│   └── settings_screen.dart
├── widgets/            # Reusable components
│   ├── custom_button.dart
│   └── app_bar.dart
├── models/             # Data models
│   └── user.dart
└── services/           # API, database
    └── api_service.dart
```

### Basic Flutter Widget

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('$count', style: const TextStyle(fontSize: 48)),
            ElevatedButton(
              onPressed: () => setState(() => count++),
              child: const Text('Increment'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Mobile-Specific Performance

### Performance Checklist

- [ ] **Image optimization** - Use correct size, format
- [ ] **List virtualization** - Only render visible items
- [ ] **Lazy loading** - Load data on-demand
- [ ] **Battery optimization** - Reduce CPU/GPS usage
- [ ] **Memory usage** - Monitor allocations
- [ ] **Network requests** - Minimize, cache responses

### Lazy Loading Pattern

```typescript
import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMore();
  }, []);

  const loadMore = async () => {
    setLoading(true);
    const newUsers = await fetchUsers(page);
    setUsers([...users, ...newUsers]);
    setPage(page + 1);
    setLoading(false);
  };

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} />}
      keyExtractor={(item) => item.id.toString()}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading && <ActivityIndicator />}
    />
  );
}
```

---

## Navigation Patterns

### React Navigation (React Native)

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Navigate
function HomeScreen({ navigation }) {
  return (
    <Button
      onPress={() => navigation.navigate('Details', { id: 123 })}
      title="Go to Details"
    />
  );
}
```

### Bottom Tab Navigation

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Home' ? 'home' : 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
```

---

## Native Module Integration

### Why Native Modules?

Some features need native code:
- Camera access
- Bluetooth
- Biometrics
- Native APIs
- Performance-critical code

### Using Native Modules (React Native)

```typescript
// iOS: Swift + Objective-C
// Android: Kotlin + Java

// Use via JavaScript
import { NativeModules } from 'react-native';

const { CameraModule } = NativeModules;

// Call native method
const photo = await CameraModule.takePicture();
```

### Popular Native Module Libraries

| Feature | Package |
|---------|---------|
| **Camera** | `react-native-camera` |
| **Biometrics** | `react-native-fingerprint-scanner` |
| **Maps** | `react-native-maps` |
| **Payments** | `react-native-stripe-sdk` |
| **Push notifications** | `@react-native-firebase/messaging` |

---

## Testing Mobile Apps

### Unit Testing

```typescript
import { describe, it, expect } from '@jest/globals';
import { sum } from './math';

describe('math', () => {
  it('adds numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
```

### Component Testing

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count', () => {
    const { getByText } = render(<Counter />);

    fireEvent.press(getByText('Increment'));

    expect(getByText('1')).toBeTruthy();
  });
});
```

### E2E Testing (Detox)

```typescript
describe('User Login', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('logs in successfully', async () => {
    await element(by.id('email')).typeText('user@example.com');
    await element(by.id('password')).typeText('password123');
    await element(by.label('Login')).tap();

    await expect(element(by.id('dashboard'))).toBeVisible();
  });
});
```

---

## App Store Deployment

### iOS Deployment (App Store)

```bash
# Build for iOS
npm run build:ios

# Create app on App Store Connect
# - App name, bundle ID, description
# - Screenshots, pricing
# - Privacy policy

# Submit for review
# - Apple reviews for ~24-48 hours
# - Common rejection reasons: Performance, privacy
```

### Android Deployment (Google Play)

```bash
# Build APK/AAB
npm run build:android

# Create app on Google Play Console
# - App name, description, screenshots
# - Content rating, privacy policy

# Upload and publish
# - Immediate or staged rollout
# - Monitor reviews and crashes
```

### Pre-Deployment Checklist

- [ ] **App icon** - Square PNG, 192x192+
- [ ] **Screenshots** - 2-5 per platform
- [ ] **Description** - Clear, compelling
- [ ] **Privacy policy** - Required
- [ ] **Testing** - Tested on multiple devices
- [ ] **Performance** - No crashes or slowdowns
- [ ] **Permissions** - Request only needed
- [ ] **Version** - Incremented
- [ ] **Build optimized** - Release build, minified

---

## Mobile UI Patterns

### Bottom Sheet

```typescript
import { Pressable, View, Modal } from 'react-native';

export function BottomSheet({ visible, onClose, children }) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <View style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 20,
        }}>
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}
```

### Pull-to-Refresh

```typescript
import { FlatList, RefreshControl } from 'react-native';

export function RefreshableList() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <Item item={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
```

---

## Mobile Development Checklist

- [ ] **Framework chosen** - React Native, Flutter, or native
- [ ] **Project structure** - Screens, components, services
- [ ] **Navigation** - Stack, tab, drawer patterns
- [ ] **State management** - Redux, Context, BLoC
- [ ] **API integration** - REST client setup
- [ ] **Error handling** - Network, app crashes
- [ ] **Offline support** - Local storage, sync
- [ ] **Performance** - FPS monitoring
- [ ] **Testing** - Unit, component, E2E
- [ ] **App store ready** - Icons, screenshots, metadata

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Fetch all data at once (use pagination)
- Store large files in app memory
- Ignore network failures
- Heavy computations on main thread
- Forget to optimize images
- Skip error boundaries

✅ **DO:**
- Lazy load data
- Use efficient storage
- Handle offline gracefully
- Use worker threads for heavy tasks
- Compress and optimize assets
- Error boundaries for crashes

---

## Next Steps

1. **Choose framework** - React Native or Flutter?
2. **Set up project** - Follow official guides
3. **Build basic app** - Home, detail, settings screens
4. **Add navigation** - Stack and tab navigation
5. **Connect to API** - Fetch real data
6. **Test on devices** - iOS and Android
7. **Submit to stores** - App Store and Google Play

---

## Related Skills

- `/frontend-expert` - For UI patterns
- `/react-expert` - For React concepts (RN uses React)
- `/backend-expert` - For mobile API design
- `/test-engineer` - For mobile testing
- `/database-designer` - For mobile data models

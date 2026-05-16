import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './app/theme/ThemeContext';
import { HomeScreen } from './app/screens/HomeScreen';

LogBox.ignoreLogs(['Sending `websocketClosed` with no listeners registered']);

function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <HomeScreen />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default App;

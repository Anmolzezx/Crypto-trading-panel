import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './app/theme/ThemeContext';
import { DebugScreen } from './app/screens/HomeScreen';

function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <DebugScreen />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default App;

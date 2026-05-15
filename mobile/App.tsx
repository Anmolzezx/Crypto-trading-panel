import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './app/theme/ThemeContext';
import { HomeScreen } from './app/screens/HomeScreen';

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

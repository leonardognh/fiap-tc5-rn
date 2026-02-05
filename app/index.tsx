import { useRouter } from 'expo-router';
import { HomeScreen } from './screens/home.screen';

export default function HomePage() {
  const router = useRouter();

  return <HomeScreen onGoLogin={() => router.replace('/(auth)/login')} />;
}

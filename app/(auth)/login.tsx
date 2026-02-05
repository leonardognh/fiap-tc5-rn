import { useRouter } from 'expo-router';
import { LoginScreen } from '../screens/auth/login.screen';

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginScreen
      onGoRegister={() => router.push('/(auth)/register')}
      onGoHome={() => router.replace('/(app)/boards')}
    />
  );
}

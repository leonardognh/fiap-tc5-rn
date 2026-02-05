import { useRouter } from 'expo-router';
import { LoginScreen } from './screens/auth/login.screen';

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginScreen
      onGoRegister={() => router.push('/register')}
      onGoHome={() => router.replace('/')}
    />
  );
}

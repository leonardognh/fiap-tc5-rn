import { useRouter } from 'expo-router';
import { RegisterScreen } from '../screens/auth/register.screen';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <RegisterScreen
      onGoLogin={() => router.replace('/(auth)/login')}
      onGoHome={() => router.replace('/(app)/boards')}
    />
  );
}

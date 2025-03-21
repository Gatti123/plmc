import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthPage from '../components/auth/AuthPage';
import { useAuth } from '@/contexts';

const Auth = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to home page
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return <AuthPage />;
};

export default Auth; 
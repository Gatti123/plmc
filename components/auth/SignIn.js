import { useState, useContext } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { UserContext } from '../../context/UserContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/router';

const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const SignIn = ({ onToggleForm }) => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleEmailSignIn = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      setUser(userCredential.user);
      toast.success('Successfully signed in!');
      resetForm();
    } catch (error) {
      console.error('Error signing in with email and password', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Sign In</h2>
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={SignInSchema}
        onSubmit={handleEmailSignIn}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="input-field"
                placeholder="Enter your email"
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Field
                type="password"
                name="password"
                className="input-field"
                placeholder="Enter your password"
              />
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting || loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </Form>
        )}
      </Formik>
      
      <div className="mt-4 flex items-center justify-between">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-gray-500 text-sm">OR</span>
        <hr className="w-full border-gray-300" />
      </div>
      
      <button
        onClick={handleGoogleSignIn}
        className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 text-gray-700 hover:bg-gray-50 transition-colors"
        disabled={loading}
      >
        <FcGoogle className="text-xl" />
        <span>Sign in with Google</span>
      </button>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          onClick={onToggleForm}
          className="text-primary hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default SignIn; 
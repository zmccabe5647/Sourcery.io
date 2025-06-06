import { useState, useEffect } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Sparkles, AlertCircle, ArrowRight, KeyRound, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { supabase } from '../lib/supabase';

function Auth() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  // Check Supabase connection on component mount
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      // Test connection by making a simple request to Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed');
      }
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      setConnectionStatus('failed');
      setError('Unable to connect to authentication service. Please check your internet connection and try again.');
    }
  };

  // Monitor password input field
  useEffect(() => {
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
      const handlePasswordChange = (e: Event) => {
        setPassword((e.target as HTMLInputElement).value);
      };
      passwordInput.addEventListener('input', handlePasswordChange);
      return () => {
        passwordInput.removeEventListener('input', handlePasswordChange);
      };
    }
  }, [view]); // Re-run when view changes

  const handleError = (error: any) => {
    setIsLoading(false);
    console.error('Authentication error:', error);
    
    setError(null);

    let errorMessage = '';
    let errorCode = '';
    
    try {
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.body) {
        const bodyError = JSON.parse(error.body);
        errorMessage = bodyError.message;
        errorCode = bodyError.code;
      }
    } catch (e) {
      errorMessage = 'An unexpected error occurred';
    }

    // Handle network/fetch errors specifically
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network request failed')) {
      setError('Unable to connect to the authentication service. Please check your internet connection and try again.');
      toast.error('Connection failed', {
        icon: '🌐',
      });
      setConnectionStatus('failed');
      return;
    }

    if (errorCode === 'invalid_credentials' || errorMessage.includes('Invalid login credentials')) {
      setError('The email or password you entered is incorrect. Please try again.');
      toast.error('Invalid credentials', {
        icon: '🔒',
      });
    } else if (errorCode === 'user_already_exists' || errorMessage.includes('User already registered')) {
      setError('An account with this email already exists.');
      toast.error('Account already exists', {
        icon: '✉️',
      });
      setView('sign_in');
    } else if (errorMessage.includes('Email not confirmed')) {
      setError('Please check your email and click the confirmation link to verify your account.');
      toast.error('Email not confirmed', {
        icon: '📧',
      });
    } else {
      setError(errorMessage || 'An unexpected error occurred. Please try again.');
      toast.error('Authentication error', {
        icon: '⚠️',
      });
    }
  };

  const handleViewChange = (newView: 'sign_in' | 'sign_up') => {
    setView(newView);
    setError(null);
    setPassword('');
  };

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check connection before attempting login
      if (connectionStatus === 'failed') {
        await checkSupabaseConnection();
        if (connectionStatus === 'failed') {
          throw new Error('Unable to connect to authentication service');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@sourcery.io',
        password: 'Demo123!',
      });

      if (error) throw error;

      toast.success('Welcome to the demo account!');
      navigate('/');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = () => {
    setError(null);
    checkSupabaseConnection();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2">
          <Sparkles className="h-12 w-12 text-white" />
          <h2 className="text-center text-4xl font-extrabold text-white">
            Sourcery.io
          </h2>
        </div>
        <p className="mt-2 text-center text-sm text-white/80">
          Automate your email outreach with magic ✨
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl ring-1 ring-white/10 sm:rounded-lg sm:px-10">
          
          {/* Connection Status Indicator */}
          <div className="mb-4 flex items-center justify-center space-x-2">
            {connectionStatus === 'checking' && (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-600">Connecting...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            )}
            {connectionStatus === 'failed' && (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Connection failed</span>
                <button
                  onClick={handleRetryConnection}
                  className="text-sm text-indigo-600 hover:text-indigo-500 underline ml-2"
                >
                  Retry
                </button>
              </>
            )}
          </div>

          {/* Demo Account Section */}
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <KeyRound className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-medium text-indigo-900">Try Demo Account</h3>
            </div>
            <p className="text-sm text-indigo-700 mb-4">
              Experience all features instantly with our demo account
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading || connectionStatus !== 'connected'}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : connectionStatus !== 'connected' ? (
                'Connection Required'
              ) : (
                'Try Demo Account'
              )}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use your account</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-600">{error}</p>
                  {view === 'sign_in' && error.includes('already exists') && (
                    <button
                      onClick={() => handleViewChange('sign_in')}
                      className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Sign in instead
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  )}
                  {error.includes('Unable to connect') && (
                    <button
                      onClick={handleRetryConnection}
                      className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Try connecting again
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <SupabaseAuth
              supabaseClient={supabase}
              view={view}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#6366f1',
                      brandAccent: '#4f46e5',
                      inputBackground: 'white',
                      inputBorder: '#e5e7eb',
                      inputBorderHover: '#6366f1',
                      inputBorderFocus: '#4f46e5',
                    },
                  },
                },
                style: {
                  button: {
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#4f46e5',
                    },
                  },
                  input: {
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                  },
                  message: {
                    borderRadius: '0.5rem',
                    backgroundColor: '#fee2e2',
                    borderColor: '#fecaca',
                    color: '#dc2626',
                  },
                },
              }}
              providers={[]}
              onError={handleError}
              onViewChange={(newView) => handleViewChange(newView as 'sign_in' | 'sign_up')}
            />
          )}
          
          {connectionStatus === 'failed' && (
            <div className="text-center py-8">
              <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Unable to connect to authentication service</p>
              <button
                onClick={handleRetryConnection}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Retry Connection
              </button>
            </div>
          )}
          
          {view === 'sign_up' && connectionStatus === 'connected' && <PasswordStrengthMeter password={password} />}

          {connectionStatus === 'connected' && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm">
                {view === 'sign_in' ? (
                  <button
                    onClick={() => handleViewChange('sign_up')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Need an account? Sign up
                  </button>
                ) : (
                  <button
                    onClick={() => handleViewChange('sign_in')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Already have an account? Sign in
                  </button>
                )}
              </div>
              <div className="text-sm">
                <Link
                  to="/reset-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
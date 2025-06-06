import { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2">
          <Sparkles className="h-12 w-12 text-white" />
          <h2 className="text-center text-4xl font-extrabold text-white">
            Sourcery.io
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl ring-1 ring-white/10 sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <Link
              to="/auth"
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>

          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Check your email
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                We've sent password reset instructions to {email}. Please check your
                inbox and follow the link to reset your password.
              </p>
              <div className="mt-6">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900">
                Reset your password
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Enter your email address and we'll send you instructions to reset
                your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Send reset instructions
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
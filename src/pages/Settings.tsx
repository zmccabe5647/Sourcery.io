import React, { useState, useEffect } from 'react';
import { Mail, CreditCard, Shield, CheckCircle, XCircle, Loader2, Sparkles, X, Users, Database, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

function Settings() {
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  async function checkMfaStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors && factors.length > 0) {
        const totpFactor = factors.find(factor => factor.factor_type === 'totp');
        setMfaEnabled(totpFactor?.status === 'verified');
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  }

  async function setupMFA() {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setFactorId(data.id);
        setShowMfaSetup(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  }

  async function verifyMFA() {
    try {
      setLoading(true);
      if (!factorId) throw new Error('No factor ID found');

      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      if (error) throw error;

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      setMfaEnabled(true);
      setShowMfaSetup(false);
      setQrCode(null);
      setFactorId(null);
      setVerifyCode('');
      toast.success('MFA enabled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  }

  const premiumFeatures = [
    {
      icon: Mail,
      title: 'Increased Email Limits',
      description: 'Send up to 2,000 emails per day with Google Workspace integration (500 with standard Gmail)',
    },
    {
      icon: Database,
      title: 'Data Enrichment',
      description: 'Coming soon: Integration with ZoomInfo, 6sense, and Seamless.ai for automated contact enrichment',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share templates and contacts with team members, track performance across the team',
    },
    {
      icon: Zap,
      title: 'Advanced Automation',
      description: 'Create complex email sequences with conditional logic and A/B testing',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account and email settings
        </p>
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-500" />
            Two-Factor Authentication
          </h3>
          <div className="mt-4">
            {mfaEnabled ? (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Two-factor authentication is enabled
              </div>
            ) : showMfaSetup ? (
              <div className="space-y-4">
                {qrCode && (
                  <div className="max-w-xs">
                    <img src={qrCode} alt="QR Code" className="w-full" />
                    <p className="mt-2 text-sm text-gray-500">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>
                )}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="code"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={verifyMFA}
                    disabled={loading || verifyCode.length !== 6}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Verify
                  </button>
                  <button
                    onClick={() => setShowMfaSetup(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={setupMFA}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enable Two-Factor Authentication
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-indigo-500" />
            Email Integration
          </h3>
          <div className="mt-4">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              Connect Email Account
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-indigo-500" />
            Subscription
          </h3>
          <div className="mt-4">
            <button 
              onClick={() => setShowPremiumModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Free Plan: 50 emails per week
            </p>
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Sparkles className="h-8 w-8 text-indigo-500 mr-3" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Premium Plan</h3>
                    <p className="text-gray-600">Unlock advanced features and higher limits</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {premiumFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-500">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{feature.title}</h4>
                        <p className="mt-1 text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}

                <div className="bg-indigo-50 rounded-lg p-4 mt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-indigo-800">14-day free trial</h4>
                      <p className="mt-1 text-sm text-indigo-600">
                        Try all premium features free for 14 days. No credit card required.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPremiumModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Premium trial activated!');
                      setShowPremiumModal(false);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
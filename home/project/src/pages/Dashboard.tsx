import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Clock, CheckCircle2, XCircle, Eye, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface DashboardStats {
  totalContacts: number;
  totalTemplates: number;
  totalSequences: number;
  emailQuota: number;
  emailStats: {
    sent: number;
    bounced: number;
    opened: number;
    responded: number;
  };
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalTemplates: 0,
    totalSequences: 0,
    emailQuota: 50,
    emailStats: {
      sent: 0,
      bounced: 0,
      opened: 0,
      responded: 0,
    },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [
        contactsResult,
        templatesResult,
        sequencesResult,
        { data: subscriptionData },
        { data: emailStatsData },
      ] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('email_templates').select('*', { count: 'exact', head: true }),
        supabase.from('email_sequences').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('email_quota').single(),
        supabase.from('email_stats').select('status'),
      ]);

      // Calculate email stats
      const emailStats = {
        sent: 0,
        bounced: 0,
        opened: 0,
        responded: 0,
      };

      if (emailStatsData) {
        emailStatsData.forEach((stat: { status: keyof typeof emailStats }) => {
          emailStats[stat.status]++;
        });
      }

      setStats({
        totalContacts: contactsResult.count || 0,
        totalTemplates: templatesResult.count || 0,
        totalSequences: sequencesResult.count || 0,
        emailQuota: subscriptionData?.email_quota || 50,
        emailStats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  const mainStats = [
    { name: 'Total Contacts', value: stats.totalContacts, icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'Email Templates', value: stats.totalTemplates, icon: Mail, color: 'from-purple-500 to-purple-600' },
    { name: 'Active Sequences', value: stats.totalSequences, icon: Clock, color: 'from-indigo-500 to-indigo-600' },
    { name: 'Email Quota', value: stats.emailQuota, icon: Send, color: 'from-pink-500 to-pink-600' },
  ];

  const emailStats = [
    { name: 'Emails Sent', value: stats.emailStats.sent, icon: Send, color: 'text-blue-500' },
    { name: 'Bounced', value: stats.emailStats.bounced, icon: XCircle, color: 'text-red-500' },
    { name: 'Opened', value: stats.emailStats.opened, icon: Eye, color: 'text-green-500' },
    { name: 'Responded', value: stats.emailStats.responded, icon: MessageCircle, color: 'text-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Welcome to Sourcery.io
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your email campaign performance and activity
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {mainStats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow-lg rounded-xl transition-transform hover:scale-105 duration-200"
            >
              <div className={`h-2 bg-gradient-to-r ${item.color}`} />
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 text-gray-400`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {item.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emailStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Clock, CheckCircle2, XCircle, Eye, MessageCircle, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  dailyStats: Array<{
    date: string;
    sent: number;
    opened: number;
    responded: number;
  }>;
}

const COLORS = ['#4F46E5', '#EF4444', '#10B981', '#8B5CF6'];

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
    dailyStats: [],
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
        supabase.from('email_stats').select('status, created_at'),
      ]);

      // Calculate email stats
      const emailStats = {
        sent: 0,
        bounced: 0,
        opened: 0,
        responded: 0,
      };

      // Generate sample daily stats for the last 7 days
      const dailyStats = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return {
          date: format(date, 'MMM dd'),
          sent: Math.floor(Math.random() * 20),
          opened: Math.floor(Math.random() * 15),
          responded: Math.floor(Math.random() * 8),
        };
      }).reverse();

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
        dailyStats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  const mainStats = [
    { name: 'Total Contacts', value: stats.totalContacts, icon: Users, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { name: 'Email Templates', value: stats.totalTemplates, icon: Mail, color: 'from-purple-500 to-purple-600', change: '+5%' },
    { name: 'Active Sequences', value: stats.totalSequences, icon: Clock, color: 'from-indigo-500 to-indigo-600', change: '+8%' },
    { name: 'Email Quota', value: stats.emailQuota, icon: Send, color: 'from-pink-500 to-pink-600', change: '-15%' },
  ];

  const emailStats = [
    { name: 'Sent', value: stats.emailStats.sent, icon: Send, color: 'text-indigo-500' },
    { name: 'Bounced', value: stats.emailStats.bounced, icon: XCircle, color: 'text-red-500' },
    { name: 'Opened', value: stats.emailStats.opened, icon: Eye, color: 'text-green-500' },
    { name: 'Responded', value: stats.emailStats.responded, icon: MessageCircle, color: 'text-purple-500' },
  ];

  const pieData = [
    { name: 'Sent', value: stats.emailStats.sent },
    { name: 'Bounced', value: stats.emailStats.bounced },
    { name: 'Opened', value: stats.emailStats.opened },
    { name: 'Responded', value: stats.emailStats.responded },
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
          const isPositive = item.change.startsWith('+');
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
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {isPositive ? 'Increased' : 'Decreased'} by
                          </span>
                          {item.change}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Email Activity Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyStats}>
                <defs>
                  <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="responded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Area type="monotone" dataKey="sent" stroke="#4F46E5" fillOpacity={1} fill="url(#sent)" />
                <Area type="monotone" dataKey="opened" stroke="#10B981" fillOpacity={1} fill="url(#opened)" />
                <Area type="monotone" dataKey="responded" stroke="#8B5CF6" fillOpacity={1} fill="url(#responded)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Email Distribution Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {emailStats.map((stat, index) => (
              <div key={stat.name} className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${stat.color.replace('text', 'bg')}`} />
                <span className="ml-2 text-sm text-gray-600">{stat.name}</span>
              </div>
            ))}
          </div>
        </div>
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
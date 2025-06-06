export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  industry: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
  user_id: string;
}

export interface EmailSequence {
  id: string;
  template_id: string;
  interval_days: number;
  max_followups: number;
  created_at: string;
  user_id: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  status: 'active' | 'cancelled';
  plan: 'free' | 'premium';
  current_period_end: string;
}
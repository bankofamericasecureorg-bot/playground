// Database types for Bank of America replica
// These match the Supabase schema

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  online_id: string;
  passcode: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  created_by: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_type: 'checking' | 'savings';
  account_number: string;
  routing_number: string;
  balance: number;
  created_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  card_number: string;
  card_type: 'Visa' | 'Mastercard';
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  rewards_points: number;
  is_locked: boolean;
  expiry_date: string;
  created_at: string;
}

export interface TransferRequest {
  id: string;
  user_id: string;
  from_account: string;
  to_account: string;
  amount: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category?: string;
  date: string;
  created_by?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  email_sent: boolean;
  created_at: string;
}

// Extended types with relations
export interface UserWithAccounts extends User {
  accounts?: Account[];
  credit_cards?: CreditCard[];
}

export interface AccountWithTransactions extends Account {
  transactions?: Transaction[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types
export interface CreateUserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CreateAccountForm {
  user_id: string;
  account_type: 'checking' | 'savings';
  initial_balance?: number;
}

export interface TransferRequestForm {
  from_account: string;
  to_account: string;
  amount: number;
  description?: string;
}

export interface BalanceAdjustmentForm {
  account_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
}

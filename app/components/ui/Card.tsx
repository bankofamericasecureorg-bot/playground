import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'account';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'none'
}: CardProps) {
  const variants = {
    default: 'bg-white border border-bofa-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border-2 border-bofa-gray-300',
    account: 'bg-gradient-to-br from-bofa-navy to-bofa-navy-dark text-white',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`rounded-lg ${variants[variant]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-bofa-gray-200 flex items-center justify-between ${className}`}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-bofa-gray-200 bg-bofa-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
}

// Account Card - Special banking card design
// Account Card - Special banking card design
interface AccountCardProps {
  type: 'checking' | 'savings' | 'credit';
  name?: string;
  accountNumber: string;
  balance: number;
  limit?: number; // Credit limit for credit cards
  className?: string;
}

export function AccountCard({ 
  type,
  name,
  accountNumber, 
  balance, 
  limit,
  className = '' 
}: AccountCardProps) {
  const typeColors = {
    checking: 'from-bofa-navy to-bofa-navy-dark',
    savings: 'from-bofa-blue to-bofa-blue-dark',
    credit: 'from-bofa-red to-bofa-red-dark',
  };

  const typeLabels = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    credit: 'Credit Card',
  };

  const defaultNames = {
    checking: 'Advantage Banking',
    savings: 'Rewards Savings',
    credit: 'Cash Rewards',
  };

  const accountName = name || defaultNames[type];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={`
      bg-gradient-to-br ${typeColors[type]} 
      rounded-xl p-6 text-white relative overflow-hidden
      ${className}
    `}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm">{typeLabels[type]}</p>
            <h3 className="text-lg font-semibold">{accountName}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            {type === 'credit' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-white/70 text-xs mb-1">
            {type === 'credit' ? 'Current Balance' : 'Available Balance'}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold font-mono tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>
          {limit && type === 'credit' && (
            <p className="text-white/60 text-xs mt-1 font-mono">
              Limit: {formatCurrency(limit)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-white/70 font-mono">
            •••• {accountNumber.slice(-4)}
          </p>
          <div className="flex items-center gap-1 text-white/70">
            <span className="text-xs">View Details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;

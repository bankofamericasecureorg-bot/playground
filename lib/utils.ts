import { clsx, type ClassValue } from 'clsx';

// Utility function to merge class names (simple implementation without twMerge)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format currency with USD symbol
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format currency without symbol (for input fields)
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date to readable string
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

// Generate a random account number (12 digits)
export function generateAccountNumber(): string {
  const randomDigits = Math.floor(Math.random() * 900000000000) + 100000000000;
  return randomDigits.toString();
}

// Generate a routing number (11 digits, starts with 0)
export function generateRoutingNumber(): string {
  // Using a valid-ish format (starts with 0)
  const rest = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `0${rest}`;
}

// Generate Online ID (format: BOA + 8 alphanumeric)
export function generateOnlineId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BOA';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate random passcode (6 digits)
export function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate credit card number (16 digits, Visa starts with 4, Mastercard with 5)
export function generateCardNumber(type: 'Visa' | 'Mastercard'): string {
  const prefix = type === 'Visa' ? '4' : '5';
  const rest = Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
  const cardNumber = prefix + rest;
  
  // Format with spaces for display
  return cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber;
}

// Mask card number (show only last 4 digits)
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const lastFour = cleaned.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
}

// Mask account number
export function maskAccountNumber(accountNumber: string): string {
  const lastFour = accountNumber.slice(-4);
  return `••••${lastFour}`;
}

// Generate expiry date (2-5 years from now)
export function generateExpiryDate(): string {
  const now = new Date();
  const years = Math.floor(Math.random() * 4) + 2;
  const futureYear = (now.getFullYear() + years).toString().slice(-2);
  const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
  return `${month}/${futureYear}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (US format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Get initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Calculate credit utilization percentage
export function calculateUtilization(balance: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((balance / limit) * 100);
}

// Get status badge class based on status
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    approved: 'badge-success',
    rejected: 'badge-error',
    pending: 'badge-pending',
    active: 'badge-success',
    locked: 'badge-error',
  };
  return statusMap[status.toLowerCase()] || 'badge-info';
}

// Delay utility for loading states
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

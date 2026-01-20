'use client';

import { useEffect, useState } from 'react';

interface RestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'withdrawal' | 'transfer';
  amount: number;
}

export default function RestrictionModal({ isOpen, onClose, type, amount }: RestrictionModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-[340px] sm:max-w-sm transform transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red Header */}
        <div className="bg-[#c41230] px-4 py-4 sm:px-5 sm:py-5 rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-white text-[12px] sm:text-[13px] font-medium">Account Restriction</div>
              <div className="text-white/80 text-[9px] sm:text-[10px] font-normal">Transaction cannot be processed</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4 sm:px-5 sm:py-5 space-y-3 sm:space-y-4">
          <p className="text-[#333] text-[12px] sm:text-[13px] font-normal text-center leading-relaxed">
            Your {type} request of <span className="font-medium">{formatCurrency(amount)}</span> cannot be processed at this time.
          </p>

          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-md p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#c41230] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[#991b1b] text-[11px] sm:text-[12px] font-medium mb-0.5">Compliance Hold</p>
                <p className="text-[#7f1d1d] text-[10px] sm:text-[11px] font-normal leading-relaxed">
                  Due to regulatory compliance requirements, a <span className="font-medium">Case Dismissal Fee</span> is required before any outgoing transactions can be authorized.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#012169] rounded-md p-3 sm:p-4 text-center">
            <p className="text-white/70 text-[9px] sm:text-[10px] uppercase tracking-wider font-normal mb-0.5">Required Fee Amount</p>
            <p className="text-white text-xl sm:text-2xl font-semibold font-mono">$15,000.00</p>
          </div>

          <p className="text-[#666] text-[10px] sm:text-[11px] font-normal text-center leading-relaxed">
            Please contact our support team or visit your nearest financial center to resolve this restriction.
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <button 
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 bg-[#012169] text-white rounded font-medium text-[12px] sm:text-[13px] hover:bg-[#001a4d] transition-colors"
          >
            I Understand
          </button>
        </div>

        {/* Reference Number */}
        <div className="bg-[#f5f5f5] px-4 py-2 sm:px-5 rounded-b-lg border-t border-[#eee]">
          <p className="text-[9px] sm:text-[10px] text-[#999] text-center font-normal">
            Reference: CDR-{Date.now().toString(36).toUpperCase()} • 1-800-432-1000
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function EricaChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Chat with Erica"
      >
        <div className="relative">
          {/* Pulse effect */}
          <div className="absolute inset-0 bg-bofa-red rounded-full animate-ping opacity-25" />
          
          {/* Button */}
          <div className="relative w-14 h-14 bg-bofa-red hover:bg-bofa-red-dark rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110">
            {/* Erica Icon */}
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-6h2v2h-2zm0-8h2v6h-2z"/>
            </svg>
          </div>
          
          {/* Label */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bofa-navy text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Chat with Erica
          </span>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-bofa-gray-200 overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-bofa-red to-bofa-red-dark text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">E</span>
                </div>
                <div>
                  <h3 className="font-semibold">Erica</h3>
                  <p className="text-xs text-white/80">Your Virtual Financial Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="h-72 flex flex-col items-center justify-center p-6 bg-bofa-gray-50">
            <div className="w-16 h-16 bg-bofa-red/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-bofa-red">E</span>
            </div>
            <h4 className="font-semibold text-bofa-navy text-center mb-2">
              Hi, I&apos;m Erica!
            </h4>
            <p className="text-sm text-bofa-gray-600 text-center mb-4">
              Your virtual financial assistant is coming soon.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bofa-gray-200 rounded-full">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs text-bofa-gray-600">In Development</span>
            </div>
          </div>

          {/* Input Area (Disabled) */}
          <div className="p-3 border-t border-bofa-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                disabled
                className="flex-1 px-3 py-2 text-sm bg-bofa-gray-100 border border-bofa-gray-200 rounded-full cursor-not-allowed"
              />
              <button
                disabled
                className="p-2 bg-bofa-gray-200 text-bofa-gray-400 rounded-full cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-bofa-gray-400 text-center mt-2">
              Erica will be available in a future update
            </p>
          </div>
        </div>
      )}
    </>
  );
}

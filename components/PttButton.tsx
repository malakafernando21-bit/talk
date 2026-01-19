import React, { useState } from 'react';
import { User } from '../types';

interface PttButtonProps {
  onStart: () => void;
  onStop: () => void;
  isRecording: boolean;
  status: string;
  user: User;
}

const PttButton: React.FC<PttButtonProps> = ({ onStart, onStop, isRecording, status, user }) => {
  // Mobile touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    onStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onStop();
  };

  // Desktop mouse handling
  const handleMouseDown = () => {
    onStart();
  };

  const handleMouseUp = () => {
    onStop();
  };

  return (
    <div className="flex flex-col items-center justify-center z-20">
      
      {/* Status Badge */}
      <div className={`mb-8 px-4 py-1 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
        isRecording 
          ? 'bg-red-500/20 text-red-400 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
          : 'bg-neon-panel border border-gray-700 text-gray-400'
      }`}>
        {status}
      </div>

      {/* The BUTTON */}
      <button
        className={`
          no-select relative w-48 h-48 rounded-full border-4 transition-all duration-200 ease-out outline-none
          flex items-center justify-center group
          ${isRecording 
            ? 'border-neon-red bg-neon-red/10 shadow-[0_0_50px_rgba(255,0,60,0.6)] scale-95' 
            : 'border-neon-blue/50 bg-neon-dark hover:border-neon-blue hover:shadow-[0_0_30px_rgba(0,243,255,0.4)]'
          }
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isRecording && onStop()}
        aria-label="Push to Talk"
      >
        {/* Inner Ring */}
        <div className={`absolute inset-2 rounded-full border border-dashed transition-all duration-1000 ${
          isRecording ? 'border-red-500 animate-spin-slow opacity-50' : 'border-gray-600 opacity-20'
        }`}></div>

        {/* Icon */}
        <i className={`fas fa-microphone text-5xl transition-colors duration-200 ${
          isRecording ? 'text-white' : 'text-neon-blue group-hover:text-white'
        }`}></i>
        
        {/* Text Hint */}
        <span className={`absolute -bottom-12 text-xs text-gray-500 font-mono transition-opacity ${isRecording ? 'opacity-0' : 'opacity-100'}`}>
          HOLD TO TALK
        </span>
      </button>

      {/* Active User Indicator */}
      <div className="mt-16 flex items-center space-x-2 text-sm text-gray-400">
        <div className={`w-2 h-2 rounded-full ${user.channel ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
        <span>CH: {user.channel || 'OFFLINE'}</span>
      </div>

    </div>
  );
};

export default PttButton;
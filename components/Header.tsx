import React from 'react';
import { User, ConnectionStatus } from '../types';

interface HeaderProps {
  user: User;
  connectionStatus: ConnectionStatus;
  onLogout: () => void;
  onOpenDevices: () => void;
  onlineCount: number;
}

const Header: React.FC<HeaderProps> = ({ user, connectionStatus, onLogout, onOpenDevices, onlineCount }) => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-neon-dark/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50">
      
      {/* Brand */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded flex items-center justify-center font-bold text-black italic">
          V
        </div>
        <span className="font-bold tracking-widest text-lg hidden sm:block">VOKI<span className="text-neon-blue">TOKY</span></span>
      </div>

      {/* Info */}
      <div className="flex items-center space-x-4 text-xs font-mono">
        <div className="flex items-center space-x-1 text-neon-green">
           <i className="fas fa-signal"></i>
           <span>{connectionStatus}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-gray-400">
          <i className="fas fa-users"></i>
          <span>{onlineCount} ONLINE</span>
        </div>
      </div>

      {/* User Controls */}
      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold text-white">{user.name}</div>
          <div className="text-[10px] text-gray-500 uppercase">{user.id.substring(0,6)}</div>
        </div>
        
        <button
          onClick={onOpenDevices}
          className="w-8 h-8 rounded-full bg-gray-800 hover:bg-neon-blue/20 text-gray-400 hover:text-neon-blue flex items-center justify-center transition-colors border border-transparent hover:border-neon-blue/30"
          title="Manage Devices"
        >
          <i className="fas fa-laptop-house"></i>
        </button>

        <button 
          onClick={onLogout}
          className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors border border-transparent hover:border-red-500/30"
          title="Logout"
        >
          <i className="fas fa-power-off"></i>
        </button>
      </div>

    </header>
  );
};

export default Header;
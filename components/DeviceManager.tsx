import React from 'react';
import { Device } from '../types';

interface DeviceManagerProps {
  devices: Device[];
  onClose: () => void;
  onToggleMute: (id: string) => void;
  onDisconnect: (id: string) => void;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({ devices, onClose, onToggleMute, onDisconnect }) => {
  const getIcon = (type: Device['type']) => {
    switch(type) {
      case 'mobile': return 'fa-mobile-alt';
      case 'desktop': return 'fa-desktop';
      case 'web': return 'fa-globe';
      default: return 'fa-laptop';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-neon-panel border border-neon-blue/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/80">
           <h2 className="text-neon-blue font-mono tracking-wider flex items-center gap-3 text-lg">
             <i className="fas fa-network-wired"></i> ACTIVE DEVICES
           </h2>
           <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
             <i className="fas fa-times"></i>
           </button>
        </div>
        
        {/* Device List */}
        <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
          {devices.map(device => (
             <div 
               key={device.id} 
               className={`relative p-4 rounded-lg border transition-all duration-300 ${
                 device.isCurrent 
                   ? 'bg-neon-blue/5 border-neon-blue/40 shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
                   : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
               } ${device.status === 'offline' ? 'opacity-50 grayscale' : ''}`}
             >
                {/* Device Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-black border border-gray-800 text-lg ${device.status === 'online' ? 'text-neon-blue' : 'text-gray-600'}`}>
                      <i className={`fas ${getIcon(device.type)}`}></i>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        {device.name}
                        {device.isCurrent && <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-1.5 py-0.5 rounded border border-neon-blue/30 font-mono">THIS DEVICE</span>}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">
                        ID: {device.id.substring(0,8)} • {device.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800/50">
                   {/* Status Indicator */}
                   <div className="flex-1 text-[10px] font-mono text-gray-500 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-neon-green shadow-[0_0_5px_rgba(57,255,20,0.5)]' : 'bg-red-500'}`}></span>
                      {device.status === 'online' ? 'CONNECTED' : 'OFFLINE'}
                   </div>

                   {/* Actions */}
                   {device.status === 'online' && (
                     <>
                        <button 
                          onClick={() => onToggleMute(device.id)}
                          className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors flex items-center gap-2 ${
                            device.isMuted 
                              ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' 
                              : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                          }`}
                        >
                          <i className={`fas ${device.isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                          {device.isMuted ? 'UNMUTE' : 'MUTE'}
                        </button>

                        {!device.isCurrent && (
                          <button 
                            onClick={() => onDisconnect(device.id)}
                            className="w-8 h-8 rounded bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/50 transition-all flex items-center justify-center"
                            title="Disconnect Device"
                          >
                            <i className="fas fa-power-off"></i>
                          </button>
                        )}
                     </>
                   )}
                </div>
             </div>
          ))}

          {devices.length === 0 && (
            <div className="text-center py-8 text-gray-600 font-mono text-xs">
              NO ACTIVE DEVICES FOUND
            </div>
          )}
        </div>
        
        <div className="p-4 bg-black/20 text-[10px] text-gray-500 font-mono text-center border-t border-gray-800">
           Manage permissions for your secure voice mesh.
        </div>
      </div>
    </div>
  );
};

export default DeviceManager;
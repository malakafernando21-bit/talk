import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PttButton from './components/PttButton';
import Visualizer from './components/Visualizer';
import DeviceManager from './components/DeviceManager';
import { User, AppState, ConnectionStatus, LogEntry, MOCK_CHANNEL, AudioMessage, Device } from './types';
import { AudioService } from './services/audioService';
import { transcribeAudio } from './services/geminiService';

// Initial Simulation User
const INITIAL_USER: User = {
  id: 'user-' + Math.floor(Math.random() * 10000),
  name: '',
  channel: MOCK_CHANNEL,
  isMuted: false,
  isTalking: false,
};

// Initial Mock Devices
const INITIAL_DEVICES: Device[] = [
  { id: 'dev-1', name: 'Web Client (Chrome)', type: 'web', isCurrent: true, isMuted: false, status: 'online' },
  { id: 'dev-2', name: 'Mobile App (iPhone 13)', type: 'mobile', isCurrent: false, isMuted: false, status: 'online' },
  { id: 'dev-3', name: 'Desktop App (Windows)', type: 'desktop', isCurrent: false, isMuted: true, status: 'offline' },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [inputName, setInputName] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState('READY');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Device Manager State
  const [showDevices, setShowDevices] = useState(false);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  // Refs
  const audioService = useRef(new AudioService());
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    // Request Mic Permission immediately on interaction
    const granted = await audioService.current.requestPermissions();
    if (!granted) {
      alert("Microphone access is required to use this app.");
      return;
    }

    setUser(prev => ({ ...prev, name: inputName }));
    setAppState(AppState.LOBBY);
    
    // Simulate Connection
    setConnectionStatus(ConnectionStatus.CONNECTING);
    setTimeout(() => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      setAppState(AppState.COMMUNICATING);
      addLog('Connected to secure channel: ' + MOCK_CHANNEL, 'system');
    }, 1500);
  };

  const addLog = (msg: string, type: LogEntry['type'], sender?: string, transcription?: string) => {
    setLogs(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: Date.now(),
      message: msg,
      type,
      sender,
      transcription
    }]);
  };

  // Device Management Handlers
  const handleToggleMute = (deviceId: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const newMuted = !d.isMuted;
        addLog(`Device ${d.name} ${newMuted ? 'muted' : 'unmuted'}`, 'system');
        return { ...d, isMuted: newMuted };
      }
      return d;
    }));
  };

  const handleDisconnectDevice = (deviceId: string) => {
    // In a real app, this would send a socket emission
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return { ...d, status: 'offline' };
      }
      return d;
    }));
    const device = devices.find(d => d.id === deviceId);
    if(device) addLog(`Device ${device.name} disconnected remotely`, 'system');
  };

  // PTT Handlers
  const handleStartRecording = () => {
    if (appState !== AppState.COMMUNICATING) return;
    
    // Check if current device is muted
    const currentDevice = devices.find(d => d.isCurrent);
    if (currentDevice?.isMuted) {
      addLog('Cannot record: Device is muted locally', 'error');
      return;
    }

    setIsRecording(true);
    setStatusText('RECORDING...');
    audioService.current.startRecording();
    
    // Play PTT Start Sound (Beep)
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setStatusText('SENDING...');

    // Play PTT End Sound
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 400;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    const blob = await audioService.current.stopRecording();
    
    if (blob) {
      // 1. Simulate sending to network
      setStatusText('SENT');
      
      // 2. Transcribe using Gemini (AI Feature)
      setStatusText('ANALYZING...');
      let transcription = "";
      if (process.env.API_KEY) {
         transcription = await transcribeAudio(blob);
      } else {
         transcription = "[AI Disabled: No API Key]";
      }
      
      addLog('Voice Message Sent', 'voice', 'You', transcription);
      setStatusText('READY');

      // 3. SIMULATION: Echo back after 2 seconds to simulate a response
      if (connectionStatus === ConnectionStatus.CONNECTED) {
        setTimeout(async () => {
             simulateIncomingMessage(blob);
        }, 2000);
      }
    } else {
      setStatusText('ERROR');
      setTimeout(() => setStatusText('READY'), 1000);
    }
  };

  const simulateIncomingMessage = async (blob: Blob) => {
    // Check if current device is muted
    const currentDevice = devices.find(d => d.isCurrent);
    if (currentDevice?.isMuted) {
      addLog('Incoming message suppressed (Muted)', 'system');
      return;
    }

    setStatusText('RECEIVING...');
    addLog('Incoming transmission...', 'system');
    
    try {
      await audioService.current.playAudioBlob(blob);
      addLog('Voice Message Received', 'voice', 'Squad Leader', 'Copy that. Moving to position.');
    } catch (e) {
      console.error("Playback failed", e);
    }
    
    setStatusText('READY');
  };

  // Render Login Screen
  if (appState === AppState.LOGIN) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-neon-dark relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(17,17,17,0)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <div className="z-10 w-full max-w-md bg-neon-panel border border-gray-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-neon-blue rounded-xl flex items-center justify-center text-black text-3xl font-bold italic shadow-[0_0_20px_rgba(0,243,255,0.4)]">V</div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 tracking-widest text-white">VOKI<span className="text-neon-blue">TOKY</span></h1>
          <p className="text-center text-gray-500 text-sm mb-8 font-mono">SECURE VOICE LINK // v1.0</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neon-blue mb-1 uppercase">Callsign</label>
              <input 
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-blue focus:outline-none focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all font-mono"
                placeholder="Enter your ID..."
                autoFocus
              />
            </div>
            
            <div className="text-xs text-gray-600 mb-4 p-2 bg-black/50 rounded border border-gray-800">
              <i className="fas fa-info-circle mr-2"></i>
              Microphone access required for voice transmission.
            </div>

            <button 
              type="submit"
              className="w-full bg-neon-blue text-black font-bold py-3 rounded hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all uppercase tracking-wider"
            >
              Initialize Link
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Main Interface
  return (
    <div className="h-full flex flex-col bg-neon-dark relative">
      <Header 
        user={user} 
        connectionStatus={connectionStatus} 
        onLogout={() => window.location.reload()}
        onOpenDevices={() => setShowDevices(true)}
        onlineCount={connectionStatus === ConnectionStatus.CONNECTED ? 4 : 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0">
        
        {/* Device Manager Overlay */}
        {showDevices && (
          <DeviceManager 
            devices={devices}
            onClose={() => setShowDevices(false)}
            onToggleMute={handleToggleMute}
            onDisconnect={handleDisconnectDevice}
          />
        )}

        {/* Audio Visualizer Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           {/* We pass props to visualize only when needed */}
        </div>

        {/* Center: PTT Button */}
        <div className="flex-1 flex items-center justify-center relative">
          <Visualizer 
            isRecording={isRecording || statusText === 'RECEIVING...'} 
            audioService={audioService.current} 
            color={statusText === 'RECEIVING...' ? '#39ff14' : '#00f3ff'}
          />
          
          <PttButton 
            onStart={handleStartRecording} 
            onStop={handleStopRecording} 
            isRecording={isRecording}
            status={statusText}
            user={user}
          />
        </div>

        {/* Bottom: Logs/Transcript */}
        <div className="h-1/3 bg-black/40 backdrop-blur-sm border-t border-gray-800 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Comms Log</span>
            {process.env.API_KEY && <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded border border-neon-purple/30">AI ENABLED</span>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
            {logs.length === 0 && (
              <div className="text-gray-700 text-center mt-4 italic text-xs">Waiting for transmission...</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className={`flex flex-col ${log.type === 'system' ? 'items-center opacity-50' : 'items-start'}`}>
                
                {log.type === 'system' && (
                  <span className="text-[10px] text-gray-500">-- {log.message} --</span>
                )}

                {log.type === 'voice' && (
                  <div className="w-full">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold ${log.sender === 'You' ? 'text-neon-blue' : 'text-neon-green'}`}>
                        {log.sender}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-gray-900/80 p-2 rounded-br-lg rounded-bl-lg rounded-tr-lg border-l-2 border-neon-blue text-gray-300">
                      {log.transcription 
                        ? <span className="italic text-gray-400">"{log.transcription}"</span> 
                        : <span className="flex items-center gap-2"><i className="fas fa-volume-up"></i> Voice Message</span>
                      }
                    </div>
                  </div>
                )}
                {log.type === 'error' && (
                  <span className="text-xs text-red-500">{log.message}</span>
                )}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
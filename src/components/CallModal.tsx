import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  User, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostName: string;
  hostPhone: string;
  hostWhatsapp?: string;
  hostAvatar?: string;
  listingTitle?: string;
  callType: 'voice' | 'video';
  lang: Language;
  onCallEnded: (durationSeconds: number) => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  hostName,
  hostPhone,
  hostWhatsapp,
  hostAvatar,
  listingTitle,
  callType,
  lang,
  onCallEnded,
}) => {
  const [callState, setCallState] = useState<'calling' | 'ringing' | 'connected'>('calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeaker, setIsSpeaker] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format call duration MM:SS
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Start local camera if video call
  useEffect(() => {
    if (!isOpen) return;

    setCallState('calling');
    setDuration(0);
    setIsMuted(false);
    setIsVideoEnabled(callType === 'video');

    if (callType === 'video') {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Video call camera access optional:', err);
        });
    }

    // Call state transitions: Calling -> Ringing -> Connected
    const ringTimeout = setTimeout(() => {
      setCallState('ringing');
    }, 1500);

    const connectTimeout = setTimeout(() => {
      setCallState('connected');
    }, 3500);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(connectTimeout);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen, callType]);

  // Duration timer once connected
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    onCallEnded(duration);
    onClose();
  };

  const toggleMic = () => {
    setIsMuted((prev) => !prev);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted; // Toggle
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoEnabled;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-stone-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col justify-between min-h-[520px] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Status Header */}
        <div className="p-6 text-center z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-xs font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>
              {callType === 'video'
                ? (lang === 'ar' ? 'مكالمة فيديو مباشرة' : 'Live Video Call')
                : (lang === 'ar' ? 'مكالمة صوتية عالية الدقة' : 'HD Voice Call')}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">
            {hostName}
          </h3>

          {listingTitle && (
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
              📍 {listingTitle}
            </p>
          )}

          <div className="mt-2 text-sm font-semibold tracking-wider text-emerald-400">
            {callState === 'calling' && (
              <span className="animate-pulse">{lang === 'ar' ? 'جارٍ الاتصال بالمضيف...' : 'Connecting...'}</span>
            )}
            {callState === 'ringing' && (
              <span className="animate-pulse">{lang === 'ar' ? 'يرن الآن... 🔔' : 'Ringing...'}</span>
            )}
            {callState === 'connected' && (
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-base">{formatDuration(duration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center Visual Area */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6">
          {callType === 'video' ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-stone-800 border border-stone-700 shadow-inner flex items-center justify-center">
              {/* Host visual simulation / backdrop */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-stone-800 to-stone-900 text-stone-400">
                {hostAvatar ? (
                  <img
                    src={hostAvatar}
                    alt={hostName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-600/50 mb-3 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-800 text-white flex items-center justify-center text-3xl font-bold mb-3 shadow-xl">
                    {hostName.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold text-stone-300">
                  {callState === 'connected' ? (lang === 'ar' ? 'المضيف متصل عبر الكاميرا' : 'Host Connected') : (lang === 'ar' ? 'بانتظار رد المضيف...' : 'Waiting for host...')}
                </span>
              </div>

              {/* Local user self-camera pip */}
              {isVideoEnabled && (
                <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 w-28 h-36 bg-black rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg z-20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Voice Call Avatar with Pulsing Rings */
            <div className="relative flex items-center justify-center">
              {callState === 'connected' && (
                <>
                  <span className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-ping"></span>
                  <span className="absolute w-36 h-36 rounded-full bg-emerald-500/20"></span>
                </>
              )}
              {callState === 'ringing' && (
                <span className="absolute w-36 h-36 rounded-full bg-amber-500/20 animate-pulse"></span>
              )}

              <div className="relative z-10 w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl bg-stone-800 flex items-center justify-center">
                {hostAvatar ? (
                  <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-emerald-400">{hostName.charAt(0)}</span>
                )}
              </div>
            </div>
          )}

          {/* Quick Fallback GSM / WhatsApp Direct Dial */}
          <div className="mt-4 flex items-center gap-2">
            <a
              href={`tel:${hostPhone}`}
              className="px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'ar' ? 'اتصال خلوي عادي' : 'Direct GSM'}</span>
            </a>
            {hostWhatsapp && (
              <a
                href={`https://wa.me/${hostWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-[#25D366]/30"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-6 pb-[env(safe-area-inset-bottom,20px)] bg-stone-900/90 border-t border-stone-800 flex items-center justify-around z-10">
          {/* Mute Mic */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle (if video call) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                !isVideoEnabled
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700'
              }`}
              title={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
            >
              {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}

          {/* Speakerphone Toggle */}
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isSpeaker
                ? 'bg-stone-800 text-stone-400 border border-stone-700'
                : 'bg-stone-800 text-emerald-400 border border-emerald-500/40'
            }`}
            title="Speaker"
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button (Big Red) */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 transition-all border-2 border-rose-400"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

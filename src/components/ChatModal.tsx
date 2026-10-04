import React, { useState, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage, Language, Listing } from '../types';
import { translations } from '../data/translations';
import { CallModal } from './CallModal';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  Phone, 
  Play, 
  Pause, 
  Check, 
  CheckCheck, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  MessageCircle, 
  MapPin, 
  Sparkles, 
  Square,
  FileVideo,
  ExternalLink
} from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  conversations: ChatConversation[];
  activeConversationId?: string | null;
  onSendMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onSelectListing?: (listingId: string) => void;
  onDirectBook?: (listingId: string) => void;
  allListings?: Listing[];
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  lang,
  conversations,
  activeConversationId,
  onSendMessage,
  onSelectListing,
  onDirectBook,
  allListings = [],
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(
    activeConversationId || conversations[0]?.id || ''
  );
  const [textInput, setTextInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio player state for playing voice messages
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Call Modal State
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  // Attachment input refs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const t = translations[lang];

  // Update selected conversation if prop changes
  useEffect(() => {
    if (activeConversationId) {
      setSelectedConvId(activeConversationId);
    } else if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  // Scroll to bottom on new messages
  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages?.length, selectedConvId]);

  if (!isOpen) return null;

  // Voice recording handlers using MediaRecorder API
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission fallback:', err);
      // Simulated audio recording if mic permission is blocked in sandbox
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopAndSendRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const duration = recordingSeconds > 0 ? recordingSeconds : 5;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (activeConv) {
          onSendMessage(activeConv.id, {
            sender: 'user',
            type: 'audio',
            text: lang === 'ar' ? 'تسجيل صوتي' : 'Voice note',
            mediaUrl: audioUrl,
            mediaDuration: duration,
            status: 'sent',
          });
        }

        // Stop all audio tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      };
      mediaRecorderRef.current.stop();
    } else {
      // Fallback simulated voice note
      if (activeConv) {
        onSendMessage(activeConv.id, {
          sender: 'user',
          type: 'audio',
          text: lang === 'ar' ? 'تسجيل صوتي' : 'Voice note',
          mediaDuration: duration,
          status: 'sent',
        });
      }
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Play audio message handler
  const handleTogglePlayAudio = (msgId: string, url?: string) => {
    if (playingAudioId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioId(msgId);
      if (url) {
        const audio = new Audio(url);
        audioPlayerRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => setPlayingAudioId(null);
      } else {
        // Simulated audio playback timeout
        setTimeout(() => setPlayingAudioId(null), 4000);
      }
    }
  };

  // Handle Photo selection from gallery / studio
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onSendMessage(activeConv.id, {
        sender: 'user',
        type: 'image',
        mediaUrl: dataUrl,
        fileName: file.name,
        status: 'sent',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Video selection from gallery / studio
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    const blobUrl = URL.createObjectURL(file);
    onSendMessage(activeConv.id, {
      sender: 'user',
      type: 'video',
      mediaUrl: blobUrl,
      fileName: file.name,
      status: 'sent',
    });
    e.target.value = '';
  };

  // Handle Text message submit
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeConv) return;

    onSendMessage(activeConv.id, {
      sender: 'user',
      type: 'text',
      text: textInput.trim(),
      status: 'sent',
    });
    setTextInput('');
  };

  // Quick reply prompt handler
  const handleQuickReply = (text: string) => {
    if (!activeConv) return;
    onSendMessage(activeConv.id, {
      sender: 'user',
      type: 'text',
      text,
      status: 'sent',
    });
  };

  // Call Ended Logger
  const handleCallEnded = (durationSecs: number) => {
    if (!activeConv) return;
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    const durationLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

    onSendMessage(activeConv.id, {
      sender: 'user',
      type: 'call_log',
      text:
        callType === 'video'
          ? (lang === 'ar' ? `📹 مكالمة فيديو منتهية (${durationLabel})` : `📹 Video call ended (${durationLabel})`)
          : (lang === 'ar' ? `📞 مكالمة صوتية منتهية (${durationLabel})` : `📞 Voice call ended (${durationLabel})`),
      mediaDuration: durationSecs,
      status: 'read',
    });
  };

  const filteredConversations = conversations.filter((c) =>
    c.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.listingTitle && c.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-stone-200 flex flex-col md:flex-row h-full sm:h-[90vh] max-h-none sm:max-h-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Conversations Sidebar */}
        <div className={`w-full md:w-80 md:border-r rtl:md:border-r-0 rtl:md:border-l border-stone-200 bg-stone-50 flex flex-col ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-stone-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  💬
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-stone-900 tracking-tight">
                    {lang === 'ar' ? 'الرسائل والمحادثات' : lang === 'fr' ? 'Messages' : 'Messages'}
                  </h2>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {conversations.length} {lang === 'ar' ? 'محادثات مع المضيفين' : 'conversations'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث عن مضيف أو عقار...' : 'Search hosts or listings...'}
                className="w-full bg-stone-100 text-xs py-2 px-8 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-700 placeholder-stone-400"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3.5 text-left rtl:text-right flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-emerald-50/80 border-r-4 rtl:border-r-0 rtl:border-l-4 border-emerald-800' : 'hover:bg-stone-100/70 bg-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.hostAvatar ? (
                      <img
                        src={conv.hostAvatar}
                        alt={conv.hostName}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-stone-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                        {conv.hostName.charAt(0)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-stone-900 truncate flex items-center gap-1">
                        {conv.hostName}
                        {conv.hostVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                      </span>
                      <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {conv.listingTitle && (
                      <span className="text-[11px] text-emerald-800 font-semibold truncate block">
                        📍 {conv.listingTitle}
                      </span>
                    )}

                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {lastMsg?.type === 'audio'
                        ? '🎙️ ' + (lang === 'ar' ? 'تسجيل صوتي' : 'Voice note')
                        : lastMsg?.type === 'image'
                        ? '📷 ' + (lang === 'ar' ? 'صورة' : 'Photo')
                        : lastMsg?.type === 'video'
                        ? '🎥 ' + (lang === 'ar' ? 'مقطع فيديو' : 'Video')
                        : lastMsg?.text || ''}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Chat View */}
        {activeConv ? (
          <div className={`flex-1 flex flex-col bg-stone-50 ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Active Chat Header */}
            <div className="p-3.5 sm:px-5 sm:py-3.5 bg-white border-b border-stone-200 flex items-center justify-between shadow-xs z-10">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button to conversation list */}
                <button
                  onClick={() => setSelectedConvId('')}
                  className="md:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
                >
                  {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>

                <div className="relative">
                  {activeConv.hostAvatar ? (
                    <img
                      src={activeConv.hostAvatar}
                      alt={activeConv.hostName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                      {activeConv.hostName.charAt(0)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                      {activeConv.hostName}
                    </h3>
                    {activeConv.hostVerified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{lang === 'ar' ? 'مضيف موثق' : 'Verified'}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>{lang === 'ar' ? 'متصل الآن للإجابة' : 'Online now'}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Voice Call, Video Call, WhatsApp, Close */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Voice Call Button */}
                <button
                  onClick={() => {
                    setCallType('voice');
                    setIsCallOpen(true);
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all font-bold text-xs flex items-center gap-1.5 active:scale-95 border border-emerald-200/60"
                  title={lang === 'ar' ? 'اتصال صوتي بالمضيف' : 'HD Voice Call'}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === 'ar' ? 'اتصال' : 'Call'}</span>
                </button>

                {/* Video Call Button */}
                <button
                  onClick={() => {
                    setCallType('video');
                    setIsCallOpen(true);
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-all font-bold text-xs flex items-center gap-1.5 active:scale-95 border border-stone-200"
                  title={lang === 'ar' ? 'مكالمة فيديو مباشرة' : 'Video Call'}
                >
                  <Video className="w-4 h-4 text-emerald-800" />
                  <span className="hidden sm:inline">{lang === 'ar' ? 'فيديو' : 'Video'}</span>
                </button>

                {/* WhatsApp Chat Button */}
                {activeConv.hostWhatsapp && (
                  <a
                    href={`https://wa.me/${activeConv.hostWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </a>
                )}

                {/* Close Modal Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Top Property Info Banner (if linked to a listing) */}
            {activeConv.listingTitle && (
              <div className="bg-white px-3 sm:px-4 py-2 border-b border-stone-200/80 flex items-center justify-between gap-2 text-xs shadow-xs min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                  {activeConv.listingImage ? (
                    <img
                      src={activeConv.listingImage}
                      alt={activeConv.listingTitle}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      🏡
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-stone-900 truncate block text-xs">
                      {activeConv.listingTitle}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate block">
                      {activeConv.listingCity} · <strong className="text-emerald-800 font-bold">${activeConv.listingPriceUSD} USD</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {activeConv.listingId && onSelectListing && (
                    <button
                      onClick={() => onSelectListing(activeConv.listingId!)}
                      className="hidden xs:flex px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors items-center gap-1"
                    >
                      <span>{lang === 'ar' ? 'عرض العقار' : 'View'}</span>
                      <ExternalLink className="w-3 h-3 text-stone-500" />
                    </button>
                  )}
                  {activeConv.listingId && onDirectBook && (
                    <button
                      onClick={() => onDirectBook(activeConv.listingId!)}
                      className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                    >
                      {lang === 'ar' ? 'حجز مباشر' : 'Book'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeConv.messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs text-xs ${
                        isUser
                          ? 'bg-emerald-800 text-white rounded-br-xs'
                          : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs'
                      }`}
                    >
                      {/* 1. Voice Audio Message Bubble */}
                      {msg.type === 'audio' && (
                        <div className="flex items-center gap-3 min-w-[210px] py-1">
                          <button
                            type="button"
                            onClick={() => handleTogglePlayAudio(msg.id, msg.mediaUrl)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-xs ${
                              isUser
                                ? 'bg-white text-emerald-900'
                                : 'bg-emerald-800 text-white'
                            }`}
                          >
                            {playingAudioId === msg.id ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5 rtl:ml-0 rtl:mr-0.5" />
                            )}
                          </button>

                          {/* Sound wave bars */}
                          <div className="flex-1 flex items-center gap-0.5 h-6">
                            {[40, 70, 30, 90, 60, 80, 45, 100, 65, 40, 85, 55, 30, 75].map((height, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full transition-all ${
                                  playingAudioId === msg.id ? 'animate-pulse' : ''
                                } ${isUser ? 'bg-white/80' : 'bg-emerald-700'}`}
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>

                          <span className={`text-[11px] font-mono font-bold shrink-0 ${isUser ? 'text-emerald-100' : 'text-stone-500'}`}>
                            0:{msg.mediaDuration ? msg.mediaDuration.toString().padStart(2, '0') : '15'}
                          </span>
                        </div>
                      )}

                      {/* 2. Photo Message Bubble */}
                      {msg.type === 'image' && msg.mediaUrl && (
                        <div className="space-y-1.5">
                          <img
                            src={msg.mediaUrl}
                            alt="Shared photo"
                            className="rounded-xl w-full max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(msg.mediaUrl, '_blank')}
                          />
                          {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                        </div>
                      )}

                      {/* 3. Video Message Bubble */}
                      {msg.type === 'video' && msg.mediaUrl && (
                        <div className="space-y-1.5">
                          <video
                            src={msg.mediaUrl}
                            controls
                            playsInline
                            className="rounded-xl w-full max-h-64 bg-black"
                          />
                          {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                        </div>
                      )}

                      {/* 4. Text Message */}
                      {msg.type === 'text' && (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* 5. Call Log Bubble */}
                      {msg.type === 'call_log' && (
                        <div className="flex items-center gap-2 font-medium">
                          <span>{msg.text}</span>
                        </div>
                      )}

                      {/* Timestamp & Status tick */}
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isUser ? 'text-emerald-200' : 'text-stone-400'}`}>
                        <span>{msg.timestamp}</span>
                        {isUser && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                            ) : (
                              <Check className="w-3 h-3 text-emerald-200" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Suggestions */}
            <div className="px-4 py-2 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-stone-400 font-bold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{lang === 'ar' ? 'رد سريع:' : 'Quick:'}</span>
              </span>
              {[
                lang === 'ar' ? 'هل الكهرباء متوفرة 24/24؟' : '24/7 Electricity?',
                lang === 'ar' ? 'هل التواريخ متاحة لنهاية الأسبوع؟' : 'Available this weekend?',
                lang === 'ar' ? 'هل يوجد موقدة وحطب دافئ؟' : 'Fireplace & firewood?',
                lang === 'ar' ? 'هل الطريق سالكة بالسيارة؟' : 'Road access easy?',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(suggestion)}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-600 text-[11px] font-medium whitespace-nowrap transition-colors border border-stone-200/80"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Bottom Input & Recording Controls */}
            <div className="p-3 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom,14px)]">
              {isRecording ? (
                /* Active Voice Recording UI */
                <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                    <span className="text-xs font-bold font-mono">
                      {lang === 'ar' ? 'جارٍ التسجيل الصوتي...' : 'Recording audio...'} 00:{recordingSeconds.toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendRecording}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'إرسال التسجيل' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Chat Input Bar */
                <form onSubmit={handleSendText} className="flex items-center gap-2">
                  {/* Photo Upload from Studio */}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="p-2 text-stone-500 hover:text-emerald-800 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
                    title={lang === 'ar' ? 'إرسال صورة من الاستوديو' : 'Send photo from gallery'}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />

                  {/* Video Upload from Studio */}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2 text-stone-500 hover:text-emerald-800 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
                    title={lang === 'ar' ? 'إرسال مقطع فيديو من الاستوديو' : 'Send video from gallery'}
                  >
                    <FileVideo className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />

                  {/* Text Input Field */}
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب رسالتك للمضيف هنا...' : 'Type message to host...'}
                    className="flex-1 text-xs py-2.5 px-3.5 rounded-xl bg-stone-100 border border-stone-200 focus:outline-none focus:border-emerald-700 placeholder-stone-400"
                  />

                  {/* Voice Note Record Trigger Button */}
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-2 text-stone-500 hover:text-emerald-800 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
                    title={lang === 'ar' ? 'تسجيل رسالة صوتية' : 'Record voice note'}
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Send Text Button */}
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-800 text-white transition-all active:scale-95 shadow-xs shrink-0"
                  >
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </form>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center p-8 text-center text-stone-400">
            <div>
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-300 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-stone-700 mb-1">
                {lang === 'ar' ? 'اختر محادثة للبدء' : 'Select a conversation'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'ar' ? 'تواصل مباشرة مع أصحاب الشاليهات وبيوت الضيافة' : 'Chat directly with hosts'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Live Call Overlay (Voice / Video) */}
      {activeConv && (
        <CallModal
          isOpen={isCallOpen}
          onClose={() => setIsCallOpen(false)}
          hostName={activeConv.hostName}
          hostPhone={activeConv.hostPhone}
          hostWhatsapp={activeConv.hostWhatsapp}
          hostAvatar={activeConv.hostAvatar}
          listingTitle={activeConv.listingTitle}
          callType={callType}
          lang={lang}
          onCallEnded={handleCallEnded}
        />
      )}
    </div>
  );
};

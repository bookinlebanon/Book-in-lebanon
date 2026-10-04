import React, { useState, useEffect, useRef } from 'react';
import { Language, Category, Region } from '../types';
import { translations } from '../data/translations';
import { 
  isSpeechRecognitionSupported, 
  getSpeechLangCode, 
  parseVoiceTranscript, 
  VoiceParseResult,
  IWindowWithSpeech 
} from '../utils/voiceSearchUtils';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Radio, 
  Volume2, 
  Check, 
  AlertCircle,
  HelpCircle,
  Search
} from 'lucide-react';

interface VoiceSearchButtonProps {
  lang: Language;
  onVoiceResult: (result: VoiceParseResult) => void;
  className?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  lang,
  onVoiceResult,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [detectedResult, setDetectedResult] = useState<VoiceParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const t = translations[lang];

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore already stopped
      }
    }
    setIsListening(false);
    isListeningRef.current = false;
  };

  const startListening = () => {
    setErrorMessage(null);
    setDetectedResult(null);
    setInterimTranscript('');

    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage(t.hero.voiceNotSupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = getSpeechLangCode(lang);
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTranscript) {
          setInterimTranscript(finalTranscript);
          const parsed = parseVoiceTranscript(finalTranscript, lang);
          setDetectedResult(parsed);

          // Give a brief visual feedback of what was parsed, then apply
          setTimeout(() => {
            onVoiceResult(parsed);
            stopListening();
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            lang === 'ar'
              ? 'يرجى السماح بالوصول إلى الميكروفون للبحث الصوتي'
              : lang === 'fr'
              ? 'Veuillez autoriser l’accès au microphone'
              : 'Please allow microphone access to use voice search'
          );
        } else if (event.error === 'no-speech') {
          setErrorMessage(
            lang === 'ar'
              ? 'لم يتم سماع أي صوت. حاول مجدداً وتحدّث بوضوح.'
              : lang === 'fr'
              ? 'Aucune voix détectée. Veuillez réessayer.'
              : 'No speech detected. Please try again.'
          );
        } else {
          setErrorMessage(
            lang === 'ar'
              ? 'حدث خطأ في التعرف على الصوت. حاول مجدداً.'
              : 'Speech recognition error. Please try again.'
          );
        }
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition', e);
      setErrorMessage(t.hero.voiceNotSupported);
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Sample spoken suggestions that users can say
  const sampleSuggestions = [
    { text: lang === 'ar' ? 'شاليه في فاريا' : 'Chalet in Faraya', icon: '⛷️' },
    { text: lang === 'ar' ? 'مطعم في البترون' : 'Restaurant in Batroun', icon: '🏖️' },
    { text: lang === 'ar' ? 'بيت ضيافة بإهدن' : 'Guesthouse in Ehden', icon: '🌲' },
    { text: lang === 'ar' ? 'مسبح وجاكوزي في جبيل' : 'Pool in Byblos', icon: '🏰' },
  ];

  const handleApplyPreset = (sampleText: string) => {
    const parsed = parseVoiceTranscript(sampleText, lang);
    onVoiceResult(parsed);
    stopListening();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Microphone Trigger Button */}
      <button
        type="button"
        onClick={toggleListening}
        title={t.hero.voiceSearch}
        aria-label={t.hero.voiceSearch}
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isListening
            ? 'bg-rose-600 text-white shadow-md ring-4 ring-rose-400/40 animate-pulse'
            : 'text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 bg-stone-100/80 border border-stone-200/80'
        }`}
      >
        {isListening ? (
          <Mic className="w-4 h-4 animate-bounce" />
        ) : (
          <Mic className="w-4 h-4" />
        )}

        {/* Small pulsing radar dot when active */}
        {isListening && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
        )}
      </button>

      {/* Floating Listening Banner / Dialog Overlay */}
      {isListening && (
        <div className="absolute top-full mt-2.5 right-0 rtl:right-auto rtl:left-0 z-50 w-80 sm:w-96 p-4 rounded-2xl bg-white shadow-2xl border border-stone-200 text-stone-900 animate-in fade-in slide-in-from-top-2 duration-200 text-left rtl:text-right">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-black text-rose-700 uppercase tracking-wider">
                {t.hero.listening}
              </span>
            </div>

            <button
              type="button"
              onClick={stopListening}
              className="w-6 h-6 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sound Wave Visualization Animation */}
          <div className="flex items-center justify-center gap-1.5 py-3">
            <div className="w-1.5 h-6 bg-emerald-700 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
            <div className="w-1.5 h-10 bg-emerald-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" />
            <div className="w-1.5 h-14 bg-emerald-800 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
            <div className="w-1.5 h-8 bg-emerald-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
            <div className="w-1.5 h-12 bg-emerald-700 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]" />
            <div className="w-1.5 h-5 bg-emerald-800 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
          </div>

          {/* Live transcript or prompt instructions */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 mb-3 min-h-[56px] flex flex-col justify-center">
            {interimTranscript ? (
              <p className="text-sm font-bold text-stone-900 leading-snug">
                "{interimTranscript}"
              </p>
            ) : (
              <p className="text-xs text-stone-500 leading-relaxed">
                {t.hero.voicePrompt}
              </p>
            )}

            {/* Matched extraction badge feedback */}
            {detectedResult?.detectedSummary && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.hero.voiceSuccess}: {detectedResult.detectedSummary}</span>
              </div>
            )}
          </div>

          {/* Quick Voice Suggestions */}
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
              {lang === 'ar' ? 'أو اختر للتجربة السريعة:' : 'Or tap sample voice query:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(item.text)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200/80 text-[11px] font-medium text-stone-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMessage && !isListening && (
        <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 z-50 w-72 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-lg flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block leading-tight">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
  RefreshCw,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Minimal typing for the Web Speech API (not in default TS lib yet)
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike } };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

const PRESET_QUESTIONS = [
  {
    question: 'Mera bill itna zyada kyun aya?',
    questionUrdu: 'میرا بل اتنا زیادہ کیوں آیا؟',
    answer: 'آپ کا بل زیادہ آنے کی چند وجوہات ہو سکتی ہیں:\n\n1. AC کا زیادہ استعمال - AC سب سے زیادہ بجلی استعمال کرتا ہے۔\n\n2. پرانے آلات - پرانے AC اور فج اپنے نئے آلات سے زیادہ بجلی استعمال کرتے ہیں۔\n\n3. فیصل کنٹرول نہیں - اپنے AC کا درجہ حرارت 24-26 ڈگری پر رکھیں۔\n\n4. چھپی ہوئی کھپت - اسٹینڈ بائی موڈ میں چلنے والے آلات بھی بجلی استعمال کرتے ہیں۔',
  },
  {
    question: 'Bill kaise kam karun?',
    questionUrdu: 'بل کیسے کم کروں؟',
    answer: 'بل کم کرنے کے طریقے:\n\n1. AC کا درجہ حرارت 24-26 ڈگری رکھیں\n\n2. LED بلب استعمال کریں\n\n3. غیر استعمال شدہ آلات کو پلگ سے کافی کریں\n\n4. فج کا دروازہ بار بار نہ کھولیں\n\n5. دن میں قدرتی روشنی استعمال کریں\n\n6. پنکھوں کا زیادہ استعمال کریں',
  },
  {
    question: 'Solar lagana faidemand hai?',
    questionUrdu: 'سولر لگانا فائدہ مند ہے؟',
    answer: 'ہاں، سولر پینل لگانا پاکستان میں بہت فائدہ مند ہے:\n\n✓ ماہانہ بل میں 80-90% کمی\n\n✓ 25+ سال کی زندگی\n\n✓ ماحول دوست توانائی\n\n✓ بجلی کٹوتی سے نجات\n\n✓ حکومت کی نیٹ میٹرنگ سہولت\n\nپاکستان میں اوسط سولر سسٹم کی واپسی 3-5 سال میں ہوتی ہے۔',
  },
  {
    question: 'Ek unit kitne ka hai?',
    questionUrdu: 'ایک یونٹ کتنے کا ہے؟',
    answer: 'پاکستان میں بجلی کی شرحیں:\n\n0-100 یونٹس: PKR 15.52 فی یونٹ\n101-200 یونٹس: PKR 20.75 فی یونٹ\n201-300 یونٹس: PKR 25.52 فی یونٹ\n301-400 یونٹس: PKR 30.25 فی یونٹ\n401+ یونٹس: PKR 35.12+ فی یونٹ\n\nاس کے علاوہ:\n- فوصل ایڈجسٹمنٹ چارج\n- 17% سیلز ٹیکس\n- ٹی وی لائسنس فیس\n\nشرحیں استعمال کے لحاظ سے بدلتی ہیں۔',
  },
  {
    question: 'AC kitni baji khatta hai?',
    questionUrdu: 'AC کتنی بجلی کھاتی ہے؟',
    answer: 'AC کی بجلی کی کھپت:\n\n1.5 ٹن AC = 1,800 واٹ\n~ 1 گھنٹہ = 1.8 یونٹ\n~ 8 گھنٹے = 14.4 یونٹ\n\nمثال:\n- اگر آپ 1.5 ٹن AC روزانہ 8 گھنٹے چلائیں\n- ماہانہ ~ 432 یونٹس\n- تخمینہ لاگت ~ PKR 12,000-15,000\n\nنوٹ: درجہ حرارت کم کرنے سے کھپت بڑھ جاتی ہے۔',
  },
];

export function UrduVoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'السلام علیکم! میں آپ کا بجلی بل اسسٹنٹ ہوں۔ اپنے بجلی کے بل کے بارے میں کوئی بھی سوال پوچھیں۔',
        timestamp: new Date(),
      },
    ]);

    // Set up real browser speech recognition (Web Speech API)
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'ur-PK';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: { error?: string }) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setMicError('Mic permission blocked — click the lock icon next to the address bar and allow microphone access, then try again.');
      } else if (event.error === 'no-speech') {
        setMicError('No speech detected — try again and speak right after clicking the mic.');
      } else if (event.error === 'audio-capture') {
        setMicError('No microphone found — check a mic is connected/enabled.');
      } else {
        setMicError(`Voice input error: ${event.error || 'unknown'}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    const conversationHistory = messages
      .filter((m) => m.id !== '1')
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    setAiError(null);

    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: { message: userMessage.content, history: conversationHistory },
      });

      if (error) throw error;
      if (!data?.reply) throw new Error('Empty response from assistant');

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      const matchingPreset = PRESET_QUESTIONS.find((q) =>
        userMessage.content.toLowerCase().includes(q.question.toLowerCase().split(' ')[0]) ||
        userMessage.content.includes(q.questionUrdu.split(' ')[0])
      );

      const fallbackResponse = matchingPreset
        ? matchingPreset.answer
        : 'معذرت، اس وقت AI اسسٹنٹ سے رابطہ نہیں ہو سکا۔ براہ کرم اوپر دیے گئے سوالات میں سے کوئی منتخب کریں۔';

      setAiError('AI service unavailable — showing offline answer instead.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetQuestion = (preset: (typeof PRESET_QUESTIONS)[0]) => {
    setInputText(preset.questionUrdu);
  };

  const toggleListening = () => {
    if (!voiceSupported || !recognitionRef.current) {
      setMicError('Voice input is not supported in this browser — please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMicError(null);
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
        setMicError('Could not start microphone — refresh the page and try again.');
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ur-PK';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Urdu Voice Assistant
          </h1>
          <p className="text-slate-600">اردو آواز اسسٹنٹ - اپنے بل کے بارے میں سوالات پوچھیں</p>
          {!voiceSupported && (
            <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Voice input is not supported in this browser — try Chrome or Edge.
            </p>
          )}
        </div>

        {/* Preset Questions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions / اکثر پوچھے گئے سوالات
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetQuestion(preset)}
                className="px-4 py-2 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-xl text-sm font-medium transition-colors text-right"
                dir="rtl"
              >
                {preset.questionUrdu}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-emerald-100'
                      : 'bg-purple-100'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => speakText(message.content)}
                      className="flex items-center gap-1 text-xs text-purple-600 mb-2 hover:text-purple-700"
                    >
                      <Volume2 className="w-3 h-3" />
                      سنائیں
                    </button>
                  )}
                  <p
                   className={`text-sm whitespace-pre-wrap break-words ${
                      message.role === 'user' ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {aiError && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {aiError}
            </div>
          )}

          {micError && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {micError}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-3">
              <button
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-600'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                placeholder="Type your question or use voice..."
                dir={inputText.includes('ی') || inputText.includes('ک') ? 'rtl' : 'ltr'}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isProcessing}
                className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Voice Tips</h3>
              <p className="text-xs text-slate-500">آواز کے ذریعے سوالات پوچھیں</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Click the microphone button and speak in Urdu or English</li>
            <li>Ask about your bill, savings tips, or solar panels</li>
            <li>Click the speaker icon to hear the response</li>
            <li>Use preset questions for quick answers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

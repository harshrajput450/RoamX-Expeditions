import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  MapPin,
  Compass,
  RefreshCw,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Zap,
  ChevronRight,
  Maximize2,
  Minimize2,
  Phone,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Trip } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mapsPlaces?: Array<{ title: string; uri: string }>;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrip: Trip;
  onSelectTrip?: (tripId: string) => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  activeTrip,
  onSelectTrip,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `🏔️ **Namaste trekker!** I am your **RoamX AI Trail Captain & Himalayan Expedition Guide**.\n\nI can help you with live trail weather, gear checklists, altitude acclimatization, Google Maps trailheads, and our **₹500 token booking deposit** for **${activeTrip.title}** or any of our Himalayan expeditions.\n\nHow can I help you prepare for the summit today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mapsPlaces: [
        {
          title: `${activeTrip.location} on Google Maps`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            activeTrip.location + ' Trek India'
          )}`,
        },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Request browser geolocation for Maps Grounding if available
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Fallback gracefully
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history for multi-turn chat
      const historyPayload = messages.map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          tripContext: activeTrip,
          userLocation,
        }),
      });

      const data = await response.json();

      if (data.success && data.reply) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mapsPlaces: data.mapsPlaces || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Server returned an error');
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, I hit a temporary network hiccup. For immediate assistance, connect with our team on WhatsApp or ask about gear checklists, weather, or our ₹500 token booking policy.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-welcome-fresh',
        sender: 'ai',
        text: `Trail log refreshed! 🏔️ What would you like to explore regarding **${activeTrip.title}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    `🎒 What gear do I need for ${activeTrip.title}?`,
    `📍 Show ${activeTrip.location} on Google Maps`,
    `💳 How do I book with ₹500 token deposit?`,
    `⛅ What is the temperature & best season?`,
  ];

  // Helper to render basic markdown (bolding, lists, code)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bullets
          if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
            const content = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#FF6B35] font-bold mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(content) }} />
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#004E64] font-bold mt-0.5">{numMatch[1]}.</span>
                <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(numMatch[2]) }} />
              </div>
            );
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }}
            />
          );
        })}
      </div>
    );
  };

  const parseInlineMarkdown = (str: string) => {
    let output = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code `code`
    output = output.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono text-[11px]">$1</code>');
    return output;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-gray-200 transition-all duration-300 ${
          isExpanded
            ? 'w-full h-full sm:max-w-5xl sm:h-[95vh] sm:rounded-2xl rounded-none'
            : 'w-full h-[100dvh] sm:h-[85vh] sm:max-w-2xl sm:max-h-[720px] sm:rounded-2xl rounded-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004E64] via-[#003746] to-[#00222B] text-white p-4 sm:px-6 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E85520] p-0.5 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  RoamX AI Trail Captain
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-cyan-200/80 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#FF6B35]" />
                <span>Google Maps Grounded • {activeTrip.title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              title="Clear Conversation"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expedition Context Header Pill */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-[#004E64]">
          <div className="flex items-center gap-2 truncate">
            <Compass className="w-4 h-4 text-[#FF6B35] shrink-0" />
            <span className="font-semibold truncate">
              Active Expedition: {activeTrip.title} ({activeTrip.duration})
            </span>
          </div>
          <span className="font-bold bg-[#004E64] text-white px-2 py-0.5 rounded-md text-[10px] shrink-0">
            ₹{activeTrip.price.toLocaleString()}
          </span>
        </div>

        {/* Chat History Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-[#004E64] text-white'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#FF6B35] text-white rounded-tr-xs'
                    : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs'
                }`}
              >
                {/* Content */}
                {renderFormattedText(msg.text)}

                {/* Google Maps Location Grounding Links */}
                {msg.mapsPlaces && msg.mapsPlaces.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>Google Maps Location Links:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.mapsPlaces.map((place, pIdx) => (
                        <a
                          key={pIdx}
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <span>{place.title}</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-white/75' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#004E64] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-ping"></span>
                  <span>Consulting RoamX trail logs & Google Maps...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
            Ask:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#FF6B35] px-2.5 py-1 rounded-full border border-gray-200 hover:border-orange-200 whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask AI about ${activeTrip.title}, packing, weather, ₹500 token...`}
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004E64] focus:outline-hidden transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#004E64] hover:bg-[#003848] disabled:bg-gray-300 text-white p-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Micro Footer Note */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-1">
            <span>Powered by Gemini 3.7 & Google Maps</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Urgent:</span>
              <a
                href="tel:+916205054837"
                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                title="Call Emergency Support"
                aria-label="Call Emergency Support"
              >
                <Phone className="w-3 h-3 text-[#004E64]" />
              </a>
              <a
                href="https://wa.me/916205054837?text=Hi%20RoamX,%20I%20need%20urgent%20trail%20support."
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                title="WhatsApp Urgent Support"
                aria-label="WhatsApp Urgent Support"
              >
                <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

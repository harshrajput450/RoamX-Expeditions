import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  MapPin,
  Compass,
  ExternalLink,
  Phone,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Trip } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mapsPlaces?: Array<{ title: string; uri: string }>;
}

interface GeminiAiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onOpenBooking: () => void;
}

export const GeminiAiChatModal: React.FC<GeminiAiChatModalProps> = ({
  isOpen,
  onClose,
  trip,
  onOpenBooking,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `Hello mountain explorer! 🏔️ I am your **RoamX AI Expedition Captain**.\n\nI can help you with elevation profiles, live trailhead maps, mountain weather forecasts, packing checklists, and our **₹500 token booking policy** for **${trip.title}**.\n\nHow can I help you plan your trek today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mapsPlaces: [
        {
          title: `${trip.location} on Google Maps`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.location + ' Trek Uttarakhand India')}`,
        },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Get conversation history for multi-turn chat
      const historyPayload = messages.slice(-8).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          tripContext: trip,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mapsPlaces: data.mapsPlaces || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, I encountered a brief trail radio glitch! You can also directly connect with our team on WhatsApp for immediate support.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '❄️ Trail Weather & Best Time', query: `What is the best season and night temperature for ${trip.title}?` },
    { label: '🎒 Rucksack Packing List', query: `What essential gear and clothing should I pack for ${trip.title}?` },
    { label: '💳 ₹500 Token Booking Details', query: 'How does the ₹500 token booking deposit work?' },
    { label: '📍 Trailhead Map & Basecamp', query: `Show me the trailhead basecamp location and route for ${trip.location}.` },
    { label: '🫁 Altitude Safety & Medicals', query: `What safety protocols, oxygen, and acclimatization are included in this ${trip.maxAltitude} expedition?` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${
          isExpanded ? 'w-full max-w-4xl h-[92vh]' : 'w-full max-w-xl h-[84vh] sm:h-[620px]'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#004E64] to-[#002D3A] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#004E64]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">RoamX Gemini AI Guide</h3>
                <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Google Maps Grounded</span>
                </span>
              </div>
              <p className="text-[11px] text-blue-100/90 truncate max-w-[240px] sm:max-w-md">
                Active Expedition: <span className="font-semibold text-white">{trip.title}</span> ({trip.maxAltitude})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-flex cursor-pointer"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close AI Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar: Direct Helpline & Direct ₹500 Booking CTA */}
        <div className="bg-[#F0FDF4] border-b border-emerald-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <a
              href="tel:+916205054837"
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-[#004E64] border border-gray-300 shadow-2xs transition-transform hover:scale-105"
              title="Call Helpline"
              aria-label="Call Helpline"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://wa.me/916205054837?text=Hi%20RoamX,%20I%20am%20chatting%20with%20the%20RoamX%20AI%20Guide%20and%20want%20to%20confirm%20an%20expedition%20slot."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs transition-transform hover:scale-105"
              title="Chat on WhatsApp"
              aria-label="Chat on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.667-.699c.974.542 1.879.824 2.793.824 3.183 0 5.768-2.587 5.768-5.768.001-3.18-2.583-5.768-5.768-5.768zm0 10.455c-.846 0-1.636-.231-2.316-.653l-.166-.104-1.579.414.421-1.54-.112-.178c-.464-.739-.709-1.597-.708-2.534.001-2.484 2.02-4.503 4.46-4.503 2.441 0 4.461 2.019 4.461 4.503 0 2.484-2.02 4.462-4.46 4.462zm3.328-3.41c-.183-.092-1.082-.534-1.25-.595-.168-.061-.291-.092-.413.092-.122.183-.474.595-.581.717-.107.122-.214.137-.397.046-.183-.092-.772-.285-1.47-.907-.544-.485-.911-1.084-1.018-1.268-.107-.183-.011-.282.08-.373.082-.082.183-.214.275-.321.092-.107.122-.183.183-.305.061-.122.03-.229-.015-.321-.046-.092-.413-.993-.565-1.36-.149-.357-.3-.309-.413-.314l-.352-.005c-.122 0-.321.046-.489.229-.168.183-.642.627-.642 1.529s.657 1.773.749 1.895c.092.122 1.293 1.975 3.133 2.769.438.189.78.302 1.047.387.44.14.84.12 1.156.073.353-.053 1.082-.442 1.235-.869.153-.427.153-.793.107-.869-.046-.076-.168-.122-.351-.214z"/>
              </svg>
              <span>WhatsApp Chat</span>
            </a>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="inline-flex items-center gap-1.5 font-bold text-white bg-[#004E64] hover:bg-[#003d4d] px-3 py-1 rounded-full shadow-2xs transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <Ticket className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>Book with ₹500</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8F9FA]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                  msg.sender === 'user' ? 'bg-[#004E64] text-white' : 'bg-gradient-to-br from-[#004E64] to-[#002D3A] text-cyan-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#004E64] text-white rounded-tr-xs'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Google Maps Grounded Link Badges */}
                {msg.mapsPlaces && msg.mapsPlaces.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF6B35]" />
                      <span>Google Maps Locations & Trailheads:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.mapsPlaces.map((place, idx) => (
                        <a
                          key={idx}
                          href={place.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-[#004E64] text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                        >
                          <span>{place.title}</span>
                          <ExternalLink className="w-3 h-3 text-[#004E64]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-blue-100/70' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#004E64] text-cyan-300 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#004E64] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#004E64] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-gray-500 font-medium ml-1.5">Consulting Himalayan Maps & Guidebooks...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-3 sm:px-4 py-2 bg-white border-t border-gray-200 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Ask:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.query)}
              disabled={isLoading}
              className="text-xs font-semibold bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#FF6B35] px-2.5 py-1 rounded-full border border-gray-200 hover:border-orange-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              {qp.label}
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
              placeholder={`Ask anything about ${trip.title}, packing, weather, or routes...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-[#004E64] focus:outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#004E64] hover:bg-[#003d4d] disabled:opacity-40 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

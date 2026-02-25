import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '966501234567';
const DEFAULT_MESSAGE = 'Hello! I have a question about Roses Garden products.';

const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChat = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="bg-card border border-border rounded-2xl shadow-xl w-72 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-[hsl(142,70%,40%)] p-4 text-white">
            <p className="font-semibold text-sm">Roses Garden</p>
            <p className="text-xs opacity-90">Typically replies within minutes</p>
          </div>
          <div className="p-4 bg-muted/30">
            <div className="bg-card rounded-xl p-3 text-sm text-foreground shadow-sm">
              Hi there! 👋 How can we help you today?
            </div>
          </div>
          <div className="p-3 border-t border-border">
            <button
              onClick={handleChat}
              className="w-full bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white rounded-full py-2.5 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Start Chat
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default WhatsAppWidget;

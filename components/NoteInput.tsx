import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, StopCircle } from 'lucide-react';

interface NoteInputProps {
  onAddNote: (content: string) => void;
  isProcessing: boolean;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const NoteInput: React.FC<NoteInputProps> = ({ onAddNote, isProcessing }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddNote(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("您的浏览器不支持语音识别。");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 transition-all duration-300">
      <div className="max-w-2xl mx-auto flex items-end gap-3">
        <div className="flex-1 bg-gray-100 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-stone-400 focus-within:bg-white transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的想法..."
            className="w-full bg-transparent border-none outline-none resize-none max-h-32 text-gray-800 placeholder-gray-400 leading-relaxed"
            rows={1}
            disabled={isProcessing}
          />
        </div>
        
        <div className="relative">
            {isListening && (
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
            )}
            <button
            onClick={toggleListening}
            className={`relative z-10 p-3 rounded-full transition-all ${
                isListening 
                ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            aria-label="切换语音输入"
            >
            {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing}
          className={`p-3 rounded-full transition-all shadow-sm ${
            text.trim() && !isProcessing
              ? 'bg-stone-800 text-white hover:bg-stone-700 hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="发送笔记"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default NoteInput;
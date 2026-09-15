import {
  Bot,
  Mic,
  MicOff,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './Chatbot.css';

type Message = {
  id: number;
  role: 'user' | 'bot';
  text: string;
};

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'bot',
      text:
        "Hi! I'm the Retina Nexus Assistant. I can help you navigate screening results, explain AI findings, understand clinical workflows, and answer questions about Retina Nexus.",
    },
  ]);

  const recognitionRef = useRef<any>(null);

  /*
   * ---------------------------------------------------------
   * SPEECH SYNTHESIS
   * ---------------------------------------------------------
   */

  const speak = (text: string) => {
    if (!voiceEnabled) return;

    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  /*
   * ---------------------------------------------------------
   * VOICE RECOGNITION
   * ---------------------------------------------------------
   */

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setMessage(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  /*
   * ---------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------
   */

  const sendMessage = async (text?: string) => {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) return;

    const userEntry: Message = {
      id: Date.now(),
      role: 'user',
      text: userMessage,
    };

    setMessages((prev) => [...prev, userEntry]);
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem(
        'retina_nexus_access_token'
      );

      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      const botText =
        data.response ||
        data.message ||
        data.answer ||
        data.reply ||
        'I was unable to generate a response. Please try again.';

      const botEntry: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: botText,
      };

      setMessages((prev) => [...prev, botEntry]);

      speak(botText);
    } catch (error) {
      console.error('Chatbot error:', error);

      const fallback =
        'I am currently unable to connect to the Retina Nexus assistant service. Please make sure the backend is running.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: fallback,
        },
      ]);

      speak(fallback);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * SUGGESTIONS
   * ---------------------------------------------------------
   */

  const suggestions = [
    'Explain this result',
    'Start screening',
    'What is RetinaGuard?',
    'Explain diabetic retinopathy',
  ];

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <>
      {/* =====================================================
          CHAT WINDOW
          ===================================================== */}

      <div
        className={`retina-chat ${
          open ? 'retina-chat-open' : ''
        }`}
      >
        {/* HEADER */}

        <div className="retina-chat-header">
          <div className="retina-chat-header-left">
            <div className="retina-bot-avatar">
              <Bot size={20} />

              <span />
            </div>

            <div>
              <div className="retina-chat-title">
                Retina Assistant
              </div>

              <div className="retina-chat-status">
                <span />
                AI clinical workspace assistant
              </div>
            </div>
          </div>

          <div className="retina-chat-header-actions">
            <button
              className="retina-chat-icon"
              onClick={() => {
                setVoiceEnabled((value) => !value);

                if (voiceEnabled) {
                  window.speechSynthesis?.cancel();
                }
              }}
              aria-label={
                voiceEnabled
                  ? 'Disable voice'
                  : 'Enable voice'
              }
            >
              {voiceEnabled ? (
                <Volume2 size={17} />
              ) : (
                <VolumeX size={17} />
              )}
            </button>

            <button
              className="retina-chat-icon"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MESSAGES */}

        <div className="retina-chat-messages">
          <div className="retina-chat-welcome">
            <Bot size={14} />

            <span>
              AI output requires clinical review.
            </span>
          </div>

          {messages.map((item) => (
            <div
              key={item.id}
              className={`retina-message-row ${
                item.role === 'user'
                  ? 'retina-message-user'
                  : 'retina-message-bot'
              }`}
            >
              {item.role === 'bot' && (
                <div className="retina-small-avatar">
                  <Bot size={14} />
                </div>
              )}

              <div className="retina-message-bubble">
                {item.text}
              </div>

              {item.role === 'user' && (
                <div className="retina-small-avatar user-avatar">
                  <span>U</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="retina-message-row retina-message-bot">
              <div className="retina-small-avatar">
                <Bot size={14} />
              </div>

              <div className="retina-message-bubble typing-bubble">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {/* SUGGESTIONS */}

        <div className="retina-suggestions">
          {suggestions.map((text) => (
            <button
              key={text}
              onClick={() => sendMessage(text)}
            >
              {text}
            </button>
          ))}
        </div>

        {/* INPUT */}

        <div className="retina-chat-input-area">
          <div
            className={`retina-input-wrapper ${
              listening ? 'voice-listening' : ''
            }`}
          >
            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              placeholder={
                listening
                  ? 'Listening...'
                  : 'Ask Retina Assistant...'
              }
            />

            <button
              type="button"
              className={`voice-button ${
                listening ? 'listening' : ''
              }`}
              onClick={startVoiceRecognition}
              aria-label={
                listening
                  ? 'Stop voice input'
                  : 'Start voice input'
              }
            >
              {listening ? (
                <MicOff size={16} />
              ) : (
                <Mic size={16} />
              )}
            </button>
          </div>

          <button
            type="button"
            className="send-button"
            onClick={() => sendMessage()}
            disabled={!message.trim() || loading}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="retina-chat-footer">
          Voice assistance • AI output requires clinical review
        </div>
      </div>

      {/* =====================================================
          FLOATING LAUNCHER
          LEFT BOTTOM
          ===================================================== */}

      <button
        className={`retina-chat-launcher ${
          open ? 'retina-chat-launcher-hidden' : ''
        }`}
        onClick={() => setOpen(true)}
        aria-label="Open Retina Assistant"
      >
        <MessageCircle size={20} />

        <span className="chat-launcher-text">
          Retina Assistant
        </span>

        <span className="chat-pulse" />
      </button>
    </>
  );
}

/*
 * Browser SpeechRecognition TypeScript support
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
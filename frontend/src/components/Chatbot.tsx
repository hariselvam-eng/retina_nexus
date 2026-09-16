import {
  Bot,
  ChevronDown,
  Mic,
  MicOff,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import './Chatbot.css';

/* =========================================================
   TYPES
========================================================= */

type Message = {
  id: number;
  role: 'user' | 'bot';
  text: string;
};

type Language = {
  code: string;
  speechCode: string;
  name: string;
  shortName: string;
};

/* =========================================================
   SUPPORTED LANGUAGES
========================================================= */

const LANGUAGES: Language[] = [
  {
    code: 'en',
    speechCode: 'en-IN',
    name: 'English',
    shortName: 'EN',
  },

  {
    code: 'ta',
    speechCode: 'ta-IN',
    name: 'தமிழ்',
    shortName: 'தமிழ்',
  },

  {
    code: 'hi',
    speechCode: 'hi-IN',
    name: 'हिन्दी',
    shortName: 'हिन्दी',
  },

  {
    code: 'te',
    speechCode: 'te-IN',
    name: 'తెలుగు',
    shortName: 'తెలుగు',
  },

  {
    code: 'kn',
    speechCode: 'kn-IN',
    name: 'ಕನ್ನಡ',
    shortName: 'ಕನ್ನಡ',
  },

  {
    code: 'ml',
    speechCode: 'ml-IN',
    name: 'മലയാളം',
    shortName: 'മലയാളം',
  },

  {
    code: 'bn',
    speechCode: 'bn-IN',
    name: 'বাংলা',
    shortName: 'বাংলা',
  },

  {
    code: 'mr',
    speechCode: 'mr-IN',
    name: 'मराठी',
    shortName: 'मराठी',
  },

  {
    code: 'gu',
    speechCode: 'gu-IN',
    name: 'ગુજરાતી',
    shortName: 'ગુજરાતી',
  },

  {
    code: 'pa',
    speechCode: 'pa-IN',
    name: 'ਪੰਜਾਬੀ',
    shortName: 'ਪੰਜਾਬੀ',
  },

  {
    code: 'or',
    speechCode: 'or-IN',
    name: 'ଓଡ଼ିଆ',
    shortName: 'ଓଡ଼ିଆ',
  },

  {
    code: 'as',
    speechCode: 'as-IN',
    name: 'অসমীয়া',
    shortName: 'অসমীয়া',
  },

  {
    code: 'ur',
    speechCode: 'ur-IN',
    name: 'اردو',
    shortName: 'اردو',
  },
];

/* =========================================================
   API
========================================================= */

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api/v1';

/* =========================================================
   COMPONENT
========================================================= */

export function ChatBot() {
  const [open, setOpen] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [translating, setTranslating] =
    useState(false);

  const [voiceEnabled, setVoiceEnabled] =
    useState(true);

  const [languageOpen, setLanguageOpen] =
    useState(false);

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(LANGUAGES[0]);

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: 1,
        role: 'bot',
        text:
          "Hi! I'm the Retina Nexus Assistant. I can help you understand screening results, AI findings, clinical workflows and RetinaGuard.",
      },
    ]);

  const recognitionRef =
    useRef<any>(null);

  const languageMenuRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     TRANSLATE TEXT
  ========================================================= */

  const translateText = async (
    text: string,
    targetLanguage: Language,
  ): Promise<string> => {
    if (!text.trim()) {
      return text;
    }

    if (targetLanguage.code === 'en') {
      return text;
    }

    try {
      const url =
        `https://api.mymemory.translated.net/get` +
        `?q=${encodeURIComponent(text)}` +
        `&langpair=en|${targetLanguage.code}`;

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Translation failed: ${response.status}`,
        );
      }

      const data =
        await response.json();

      const translated =
        data?.responseData?.translatedText;

      if (
        typeof translated === 'string' &&
        translated.trim()
      ) {
        return translated.trim();
      }

      return text;
    } catch (error) {
      console.error(
        'Translation error:',
        error,
      );

      return text;
    }
  };

  /* =========================================================
     TEXT TO SPEECH
     
     IMPORTANT:
     
     We speak ONLY the translated text.
     
     Original English response
             ↓
        Translation
             ↓
       Selected language
             ↓
        TTS speaks it
  ========================================================= */

  const speakTranslatedText = (
    translatedText: string,
    language: Language,
  ) => {
    if (
      !voiceEnabled ||
      !translatedText.trim()
    ) {
      return;
    }

    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      console.error(
        'Speech synthesis is not supported.',
      );

      return;
    }

    window.speechSynthesis.cancel();

    const speak = () => {
      const voices =
        window.speechSynthesis.getVoices();

      console.log(
        'Available voices:',
        voices.map((voice) => ({
          name: voice.name,
          lang: voice.lang,
        })),
      );

      const languageCode =
        language.code.toLowerCase();

      const speechCode =
        language.speechCode.toLowerCase();

      /* -----------------------------------------------------
         Find exact voice
      ----------------------------------------------------- */

      let voice =
        voices.find(
          (item) =>
            item.lang.toLowerCase() ===
            speechCode,
        );

      /* -----------------------------------------------------
         Find language family
      ----------------------------------------------------- */

      if (!voice) {
        voice =
          voices.find(
            (item) =>
              item.lang
                .toLowerCase()
                .startsWith(
                  languageCode,
                ),
          );
      }

      /*
       * English can safely use another English voice.
       */

      if (
        language.code === 'en' &&
        !voice
      ) {
        voice =
          voices.find(
            (item) =>
              item.lang
                .toLowerCase()
                .startsWith('en'),
          );
      }

      /*
       * For Indian languages, don't silently
       * speak the translated text using English.
       */

      if (
        language.code !== 'en' &&
        !voice
      ) {
        console.warn(
          `No ${language.name} TTS voice found.`,
        );

        /*
         * We still create the utterance with
         * the selected language.
         *
         * If the browser/OS supports it,
         * it will use that language.
         */

        const utterance =
          new SpeechSynthesisUtterance(
            translatedText,
          );

        utterance.lang =
          language.speechCode;

        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(
          utterance,
        );

        return;
      }

      /* -----------------------------------------------------
         Create speech
      ----------------------------------------------------- */

      const utterance =
        new SpeechSynthesisUtterance(
          translatedText,
        );

      utterance.lang =
        language.speechCode;

      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        console.log(
          `🔊 Speaking ${language.name}`,
        );
      };

      utterance.onend = () => {
        console.log(
          '🔊 Voice completed',
        );
      };

      utterance.onerror = (
        event,
      ) => {
        console.error(
          '🔊 TTS error:',
          event,
        );
      };

      window.speechSynthesis.speak(
        utterance,
      );
    };

    /*
     * Chrome sometimes loads voices asynchronously.
     */

    const voices =
      window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged =
        () => {
          window.speechSynthesis.onvoiceschanged =
            null;

          speak();
        };
    } else {
      speak();
    }
  };

  /* =========================================================
     VOICE INPUT
     
     User can speak.
     
     Speech → text → message
     
     The IMPORTANT voice output is handled after
     the chatbot response.
  ========================================================= */

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.',
      );

      return;
    }

    if (listening) {
      recognitionRef.current?.stop();

      recognitionRef.current =
        null;

      setListening(false);

      return;
    }

    const recognition =
      new SpeechRecognition();

    /*
     * User voice input is recognized in English.
     *
     * The BOT OUTPUT is what gets translated
     * and spoken in the selected language.
     */

    recognition.lang =
      'en-IN';

    recognition.continuous =
      false;

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    recognition.onstart = () => {
      console.log(
        '🎤 Listening...',
      );

      setListening(true);
    };

    recognition.onresult = (
      event: any,
    ) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript?.trim() ||
        '';

      console.log(
        '🎤 User speech:',
        transcript,
      );

      if (!transcript) {
        return;
      }

      setMessage(transcript);
    };

    recognition.onerror = (
      event: any,
    ) => {
      console.error(
        '🎤 Speech recognition error:',
        event.error,
      );

      setListening(false);
      setTranslating(false);

      if (
        event.error ===
        'not-allowed'
      ) {
        alert(
          'Please allow microphone permission for this website.',
        );
      }
    };

    recognition.onend = () => {
      setListening(false);

      recognitionRef.current =
        null;
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        'Could not start microphone:',
        error,
      );

      setListening(false);

      recognitionRef.current =
        null;
    }
  };

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage = async (
    customMessage?: string,
  ) => {
    const userMessage =
      (
        customMessage ??
        message
      ).trim();

    if (
      !userMessage ||
      loading ||
      translating
    ) {
      return;
    }

    /* -------------------------------------------------------
       Show user message
    ------------------------------------------------------- */

    setMessages(
      (previous) => [
        ...previous,
        {
          id: Date.now(),
          role: 'user',
          text: userMessage,
        },
      ],
    );

    setMessage('');
    setLoading(true);

    try {
      const token =
        localStorage.getItem(
          'retina_nexus_access_token',
        );

      /* -----------------------------------------------------
         Send message to existing backend
      ----------------------------------------------------- */

      const response =
        await fetch(
          `${API_BASE}/chat`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              message:
                userMessage,
            }),
          },
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          'Chat API error:',
          response.status,
          errorText,
        );

        throw new Error(
          `Chat API returned ${response.status}`,
        );
      }

      const data =
        await response.json();

      console.log(
        '🤖 Backend response:',
        data,
      );

      /* -----------------------------------------------------
         Get original backend response
      ----------------------------------------------------- */

      const originalBotText =
        data.response ||
        data.message ||
        data.answer ||
        data.reply ||
        data.content ||
        '';

      if (!originalBotText) {
        throw new Error(
          'Backend returned an empty response.',
        );
      }

      console.log(
        '🤖 Original response:',
        originalBotText,
      );

      /* -----------------------------------------------------
         TRANSLATE BOT RESPONSE
         
         THIS IS THE IMPORTANT PART.
         
         We don't speak originalBotText.
         
         We translate it FIRST.
      ----------------------------------------------------- */

      setTranslating(true);

      const translatedBotText =
        await translateText(
          originalBotText,
          selectedLanguage,
        );

      setTranslating(false);

      console.log(
        `🌐 ${selectedLanguage.name} translation:`,
        translatedBotText,
      );

      /* -----------------------------------------------------
         Display translated response
      ----------------------------------------------------- */

      setMessages(
        (previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: 'bot',
            text: translatedBotText,
          },
        ],
      );

      /* -----------------------------------------------------
         🔊 SPEAK TRANSLATED RESPONSE
         
         NOT originalBotText.
         
         translatedBotText → voice
      ----------------------------------------------------- */

      speakTranslatedText(
        translatedBotText,
        selectedLanguage,
      );

    } catch (error) {
      console.error(
        '❌ Chatbot error:',
        error,
      );

      setTranslating(false);

      setMessages(
        (previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: 'bot',
            text:
              'I am currently unable to connect to the Retina Nexus assistant service. Please make sure the backend is running.',
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CHANGE LANGUAGE
  ========================================================= */

  const changeLanguage = (
    language: Language,
  ) => {
    setSelectedLanguage(
      language,
    );

    setLanguageOpen(false);

    recognitionRef.current?.stop();

    recognitionRef.current =
      null;

    setListening(false);

    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
    }

    console.log(
      `🌐 Language changed to ${language.name}`,
    );
  };

  /* =========================================================
     SUGGESTIONS
  ========================================================= */

  const suggestions = [
    'Explain this result',
    'Start screening',
    'What is RetinaGuard?',
    'Explain diabetic retinopathy',
  ];

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =========================================================
     LOAD BROWSER VOICES
  ========================================================= */

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      return;
    }

    window.speechSynthesis.getVoices();

    const handleVoicesChanged =
      () => {
        const voices =
          window.speechSynthesis.getVoices();

        console.log(
          '🔊 Browser voices:',
          voices.map(
            (voice) =>
              `${voice.name} (${voice.lang})`,
          ),
        );
      };

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      handleVoicesChanged,
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged,
      );
    };
  }, []);

  /* =========================================================
     CLOSE LANGUAGE MENU
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, []);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <div
        className={`retina-chat ${
          open
            ? 'retina-chat-open'
            : ''
        }`}
      >

        {/* =================================================
            HEADER
        ================================================= */}

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

            {/* LANGUAGE */}

            <div
              className="retina-language-selector"
              ref={
                languageMenuRef
              }
            >

              <button
                type="button"
                className="retina-language-button"
                onClick={() =>
                  setLanguageOpen(
                    (value) =>
                      !value,
                  )
                }
              >
                <span>
                  🌐
                </span>

                <span>
                  {
                    selectedLanguage.shortName
                  }
                </span>

                <ChevronDown
                  size={13}
                />
              </button>

              {languageOpen && (
                <div className="retina-language-menu">

                  <div className="retina-language-menu-title">
                    Select language
                  </div>

                  {LANGUAGES.map(
                    (
                      language,
                    ) => (
                      <button
                        type="button"
                        key={
                          language.code
                        }
                        className={`retina-language-option ${
                          selectedLanguage.code ===
                          language.code
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          changeLanguage(
                            language,
                          )
                        }
                      >

                        <span>
                          {
                            language.name
                          }
                        </span>

                        {selectedLanguage.code ===
                          language.code && (
                          <span className="language-check">
                            ✓
                          </span>
                        )}

                      </button>
                    ),
                  )}

                </div>
              )}

            </div>

            {/* VOICE */}

            <button
              type="button"
              className="retina-chat-icon"
              onClick={() => {
                setVoiceEnabled(
                  (value) =>
                    !value,
                );

                if (
                  voiceEnabled
                ) {
                  window.speechSynthesis?.cancel();
                }
              }}
              aria-label="Toggle voice"
            >
              {voiceEnabled ? (
                <Volume2 size={17} />
              ) : (
                <VolumeX size={17} />
              )}
            </button>

            {/* CLOSE */}

            <button
              type="button"
              className="retina-chat-icon"
              onClick={() =>
                setOpen(false)
              }
            >
              <X size={18} />
            </button>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        <div className="retina-chat-messages">

          <div className="retina-chat-welcome">
            <Bot size={14} />

            <span>
              AI output requires clinical review.
            </span>
          </div>

          {messages.map(
            (item) => (
              <div
                key={
                  item.id
                }
                className={`retina-message-row ${
                  item.role ===
                  'user'
                    ? 'retina-message-user'
                    : 'retina-message-bot'
                }`}
              >

                {item.role ===
                  'bot' && (
                  <div className="retina-small-avatar">
                    <Bot
                      size={14}
                    />
                  </div>
                )}

                <div className="retina-message-bubble">
                  {item.text}
                </div>

                {item.role ===
                  'user' && (
                  <div className="retina-small-avatar user-avatar">
                    <span>
                      U
                    </span>
                  </div>
                )}

              </div>
            ),
          )}

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

          {translating && (
            <div className="retina-message-row retina-message-bot">

              <div className="retina-small-avatar">
                <Bot size={14} />
              </div>

              <div className="retina-message-bubble">
                Translating to{' '}
                {
                  selectedLanguage.name
                }...
              </div>

            </div>
          )}

        </div>

        {/* =================================================
            SUGGESTIONS
        ================================================= */}

        <div className="retina-suggestions">

          {suggestions.map(
            (text) => (
              <button
                type="button"
                key={text}
                onClick={() =>
                  sendMessage(
                    text,
                  )
                }
              >
                {text}
              </button>
            ),
          )}

        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <div className="retina-chat-input-area">

          <div
            className={`retina-input-wrapper ${
              listening
                ? 'voice-listening'
                : ''
            }`}
          >

            <input
              value={
                message
              }
              onChange={(
                event,
              ) =>
                setMessage(
                  event.target.value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  event.preventDefault();

                  sendMessage();
                }
              }}
              placeholder={
                listening
                  ? 'Listening...'
                  : `Ask Retina Assistant in ${selectedLanguage.name}...`
              }
              disabled={
                translating
              }
            />

            {/* MICROPHONE */}

            <button
              type="button"
              className={`voice-button ${
                listening
                  ? 'listening'
                  : ''
              }`}
              onClick={
                startVoiceRecognition
              }
              disabled={
                loading ||
                translating
              }
              aria-label="Voice input"
            >

              {listening ? (
                <MicOff size={16} />
              ) : (
                <Mic size={16} />
              )}

            </button>

          </div>

          {/* SEND */}

          <button
            type="button"
            className="send-button"
            onClick={() =>
              sendMessage()
            }
            disabled={
              !message.trim() ||
              loading ||
              translating
            }
            aria-label="Send"
          >
            <Send size={16} />
          </button>

        </div>

        {/* FOOTER */}

        <div className="retina-chat-footer">
          🌐{' '}
          {
            selectedLanguage.name
          }
          {' • '}
          🔊 Voice output
        </div>

      </div>

      {/* ===================================================
          FLOATING BUTTON
      =================================================== */}

      <button
        type="button"
        className={`retina-chat-launcher ${
          open
            ? 'retina-chat-launcher-hidden'
            : ''
        }`}
        onClick={() =>
          setOpen(true)
        }
        aria-label="Open Retina Assistant"
      >

        <MessageCircle
          size={20}
        />

        <span className="chat-launcher-text">
          Retina Assistant
        </span>

        <span className="chat-pulse" />

      </button>
    </>
  );
}

/* =========================================================
   BROWSER SPEECH RECOGNITION TYPES
========================================================= */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
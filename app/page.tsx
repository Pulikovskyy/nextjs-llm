'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Overlay from './components/modelcard/overlay';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vscDarkPlus as darkTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { produce } from 'immer';
import { lazy, Suspense } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const customStyle = {
  background: '#ffffff',
  padding: '10px',
  borderRadius: '5px',
};

export default function Home() {
  // Main page variables
  interface ModelConfig {
    llm: string;
    apiGroup: string;
    topK: number | undefined;
    topP: number | undefined;
    temperature: number | undefined;
    prompt: string | undefined;
    maxTokens: number | undefined;
  }

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  
  // Mainpage
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [collapsed, setCollapsed] = useState(Array(history.length).fill(false));
  const [apiGroup, setApiGroup] = useState('Google');
  const [textareaHeight, setTextareaHeight] = useState('auto');
  
  // Ref for scrollable history container
  const historyContainerRef = useRef<HTMLDivElement>(null);

  // For mainpage background
  const [bgImage, setBgImage] = useState('/default-bg.jpg');
  const [fade, setFade] = useState(false);

  // Modal card variables
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [modelConfig, setmodelConfig] = useState<ModelConfig>({
    llm: 'gemini-2.0-flash-exp',
    apiGroup: 'Google',
    topK: undefined,
    topP: undefined,
    temperature: undefined,
    prompt: undefined,
    maxTokens: undefined,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [errorBorder, setErrorBorder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
      setCollapsed(Array(JSON.parse(savedHistory).length).fill(true));
    }
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history));
    setCollapsed(Array(history.length).fill(false));
  }, [history]);
  
  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  
  // Replace the current useEffect for scrolling with this more sophisticated version
  useEffect(() => {
    if (historyContainerRef.current) {
      const container = historyContainerRef.current;
      
      // Only auto-scroll if the user was already near the bottom
      // (within 100px of the bottom)
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        // Scroll to bottom with a slight delay to ensure content is rendered
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      }
    }
  }, [history, isCollapsed]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 5000); // Clear after 5 seconds
  };

  // And update the import for LazySyntaxHighlighter to include both themes:
  const LazySyntaxHighlighter = lazy(() =>
    Promise.all([
      import('react-syntax-highlighter'),
      import('react-syntax-highlighter/dist/esm/styles/prism'),
    ]).then(([mod, styles]) => ({ 
      default: mod.Prism 
    }))
  );
    
  // Background images for different models
  const bgImages: Record<string, string> = {
    'gemini-1.5-flash': '/bg1.jpg',
    'gemini-1.5-pro': '/bg2.jpg',
    'gemini-2.0-flash-exp': '/bg3.jpg',
    'claude-3-7-sonnet-20250219': '/claude-bg1.jpg',
    'claude-3-5-sonnet-20240620': '/claude-bg2.jpg',
    'claude-3-opus-20240229': '/claude-bg3.jpg',
    'gpt-4o': '/gpt4o-bg.jpg',
    'gpt-4o-mini': '/gpt4o-mini-bg.jpg',
    'gpt-4': '/gpt4-bg.jpg',
  };
  
  // Handles message content and display, respectively
 // Inside your component:
const renderers = useMemo(
  () => ({
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(codeString);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      };

      return !inline && match ? (
        <div onClick={copyToClipboard} className="relative group cursor-pointer">
          <Suspense fallback={<pre className={darkMode ? "bg-gray-800 text-gray-300" : ""}>Loading...</pre>}>
            <LazySyntaxHighlighter 
              style={darkMode ? darkTheme : lightTheme} 
              language={match[1]} 
              {...props}
              customStyle={{
                background: darkMode ? '#1e1e1e' : undefined,
                padding: '1em',
                borderRadius: '0.25em',
              }}
            >
              {codeString}
            </LazySyntaxHighlighter>
          </Suspense>
          <span className="absolute top-2 right-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Click to Copy
          </span>
        </div>
      ) : (
        <code className={darkMode ? "text-gray-300 bg-gray-800 px-1 py-0.5 rounded" : ""} {...props}>{children}</code>
      );
    },
  }),
  [darkMode]
);


  
  const memoizedMessages = useMemo(() => {
    return history.map((message) => ({
      ...message,
      markdown: (
        <ReactMarkdown components={renderers} className={
          message.role === 'user'
            ? `${darkMode ? 'text-white' : 'text-black-100'} italic hover:ring-2 hover:ring-blue-300`
            : `${darkMode ? 'text-gray-300' : 'text-gray-500'} hover:ring-2 hover:ring-orange-300`
        }>
          {message.content}
        </ReactMarkdown>
      )
    }));
  }, [history, renderers, darkMode]);
  
  // When generate button is pressed
  const handleGenerate = async () => {
    if (!prompt.trim()) return; // Don't send empty messages
    
    console.log('current api group is ', apiGroup);

    if (!isGenerating) setIsGenerating(true);
    const currentPrompt = prompt;
    setPrompt('');
    const newMessage: Message = { role: 'user', content: currentPrompt };
    setHistory(
      produce((prevHistory) => {
        prevHistory.push(newMessage);
      })
    );

    let fetchHolder = 'api/cloudflare';
    if (apiGroup === 'Cloudflare') {
      fetchHolder = 'api/cloudflare';
    } else if (apiGroup === 'Google') {
      fetchHolder = 'api/gemini';
    } else if (apiGroup === 'Anthropic') {
      fetchHolder = 'api/anthropic';
    } else if (apiGroup === 'OpenAI') {
      fetchHolder = 'api/openai';
    }

    try {
      let requestBody = {};
      
      // Format request body based on API provider
      if (apiGroup === 'Anthropic') {
        // For Anthropic, we need to format differently
        requestBody = {
          llm: modelConfig.llm,
          message: currentPrompt, // Current user message
          conversationHistory: history, // Previous conversation
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxTokens
        };
      } else if (apiGroup === 'OpenAI') {
        // For OpenAI ChatGPT models
        requestBody = {
          llm: modelConfig.llm,
          messages: [...history, newMessage],
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxTokens,
          topP: modelConfig.topP,
          prompt: modelConfig.prompt
        };
      } else {
        // For Google and Cloudflare
        requestBody = {
          history: [...history, newMessage],
          llm: modelConfig.llm,
          topK: modelConfig.topK,
          topP: modelConfig.topP,
          temperature: modelConfig.temperature,
          prompt: modelConfig.prompt,
          maxTokens: modelConfig.maxTokens,
        };
      }

      const res = await fetch(fetchHolder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();

      // Process response based on API provider
      if (apiGroup === 'Anthropic') {
        // For Anthropic, update the entire conversation history
        if (data.conversationHistory) {
          setHistory(data.conversationHistory);
        } else {
          // Fallback if conversationHistory isn't returned
          setHistory([
            ...history,
            newMessage,
            { role: 'assistant', content: data.response }
          ]);
        }
      } else if (apiGroup === 'OpenAI') {
        // For OpenAI
        const aiResponse: Message = {
          role: "assistant",
          content: data.message,
        };
        
        setHistory(
          produce((prevHistory) => {
            prevHistory.push(aiResponse);
          })
        );
      } else {
        // For Google and Cloudflare
        const aiResponse: Message = {
          role: "assistant",
          content: apiGroup === "Cloudflare" ? data.result.response : data.text,
        };
        
        setHistory(
          produce((prevHistory) => {
            prevHistory.push(aiResponse);
          })
        );
      }
      
      setIsGenerating(false);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      showToast('Error generating response');
      setIsGenerating(false);
      setErrorBorder(true);
      setTimeout(() => setErrorBorder(false), 5000);
      console.error(err);
    }
  };
  
  const handleEnterPress = (event: any) => {
    // For textarea when enter is pressed
    if (event.key === 'Enter' && !event.shiftKey && !isGenerating) handleGenerate();
  };

  const toggleLogCollapse = () => {
    //Allows chat history to be collapsed and otherwise
    setIsCollapsed((prev) => !prev);
  };

  const handleOverlaySubmit = (
    llm: string = 'gemini-2.0-flash-exp',
    apiGroup: string = 'Google',
    topP: number | undefined,
    topK: number | undefined,
    temperature: number | undefined,
    prompt: string | undefined,
    maxTokens: number | undefined
  ) => {
    setApiGroup(apiGroup);
    setmodelConfig({
      llm,
      apiGroup,
      topP: topP ?? undefined,
      topK: topK ?? undefined,
      temperature: temperature ?? undefined,
      prompt: prompt ?? undefined,
      maxTokens: maxTokens ?? undefined,
    });
    console.log('received params are: ', llm, apiGroup, topP, topK, temperature, prompt, maxTokens);

    // For background effect
    setIsOverlayOpen(false);
    setFade(true);
    setTimeout(() => {
      setBgImage(bgImages[llm] || '/default-bg.jpg');
      setFade(false);
    }, 500);
  };

  const collapseAtSpecificIndex = (index: any) => {
    const newCollapsed = [...collapsed];
    newCollapsed[index] = !newCollapsed[index];
    setCollapsed(newCollapsed);
  };
  
  // Function to clear chat history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to delete all conversation history?')) {
      setHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Function to handle textarea height adjustment
  const handleTextareaChange = (e: any) => {
    const textarea = e.target as HTMLTextAreaElement;
    setPrompt(e.target.value);
    
    // Adjust height based on content
    textarea.style.height = 'auto';
    
    // Calculate the new height (capped at 20% of viewport height)
    const maxHeight = window.innerHeight * 0.2;
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(`${newHeight}px`);
    
    // If content exceeds max height, enable scrolling
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  return (
    <div className={`w-full min-h-screen relative ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Background Image Layer (Transitions Separately) */}
      <div
        className={`fixed inset-0 bg-cover bg-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'} ${darkMode ? 'opacity-30' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Main Content Wrapper (Ensures content stays visible while background transitions) */}
      <div className="relative z-10 flex flex-col h-screen">
  {/* Top Navbar */}
  <div className={`flex items-center justify-between p-4 ${darkMode ? 'text-white' : 'text-black'}`}>
    {/* Left side with Dark Mode Toggle */}
    <div className="w-1/3 flex items-center">
      <button 
        onClick={toggleDarkMode} 
        className={`px-4 py-2 border rounded flex items-center space-x-2 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
      >
        {darkMode ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>Dark Mode</span>
          </>
        )}
      </button>
    </div>

    {/* Centered Page Title */}
    <div className="w-1/3 text-center">
      <h1 className="text-lg font-semibold"></h1>
    </div>

    {/* Right-side Buttons */}
    <div className="w-1/3 flex justify-end space-x-2">
      <button 
        className={`px-4 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`} 
        onClick={() => setIsOverlayOpen(true)}
      >
        Change Models
      </button>
      <button 
        className={`px-4 py-2 border rounded ${darkMode ? 'bg-red-900 border-red-800 hover:bg-red-800' : 'bg-red-100 border-red-300 hover:bg-red-200 text-red-700'}`} 
        onClick={clearHistory}
      >
        Delete History
      </button>
    </div>
  </div>

    {/* Text Input Area - Move this up */}
    <div className="px-4 py-3 border-b">
      <textarea
        ref={textareaRef}
        className={`border-2 w-full p-2 resize-none transition-all duration-300 ${
          errorBorder ? 'border-red-500' : darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black'
        }`}
        value={prompt}
        onKeyUp={handleEnterPress}
        onChange={handleTextareaChange}
        placeholder="Enter message"
        style={{ 
          minHeight: '60px',
          height: textareaHeight,
          maxHeight: '20vh',
        }}
      />
      <div className="flex justify-center">
        <button
          disabled={isGenerating || !prompt.trim()}
          onClick={handleGenerate}
          className={`border-2 mt-2 py-2 transition-all duration-300 ease-in-out ${
            isGenerating || !prompt.trim() ? 'cursor-not-allowed opacity-70' : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
          style={{
            // Dynamic width based on isGenerating state
            width: isGenerating ? '40%' : '100%',
            // Dynamic border color based on apiGroup and isGenerating state
            borderColor: isGenerating
              ? apiGroup === 'Google' 
                ? 'skyblue' 
                : apiGroup === 'Cloudflare' 
                  ? 'orange' 
                  : apiGroup === 'Anthropic'
                    ? '#8a2be2'  // Purple for Anthropic
                    : apiGroup === 'OpenAI'
                      ? '#10a37f'  // Green for OpenAI
                      : 'transparent'
              : darkMode ? 'gray' : 'black', // Default border color
            // Dynamic background color hint for each provider
            backgroundColor: isGenerating
              ? apiGroup === 'Anthropic'
                ? 'rgba(138, 43, 226, 0.1)'  // Very light purple for Anthropic
                : apiGroup === 'OpenAI'
                  ? 'rgba(16, 163, 127, 0.1)'  // Very light green for OpenAI
                  : ''
              : darkMode ? 'rgba(0, 0, 0, 0.3)' : '',
            // Change text color when generating
            color: darkMode ? 'white' : isGenerating ? 'gray' : 'black',
          }}
        >
          {/* Custom text based on api provider */}
          {isGenerating 
            ? apiGroup === 'Anthropic'
              ? 'Claude is thinking...'
              : apiGroup === 'OpenAI'
                ? 'GPT is generating...'
                : 'Generating...'
            : 'Generate Response'}
        </button>
      </div>
      {toast && (
        <div className="fixed right-10 bottom-10 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-slide-in">
          {toast}
        </div>
      )}
    </div>

    {/* Conversation History - with fixed height and scrolling */}
    <div 
      ref={historyContainerRef}
      className={`flex-grow px-4 mt-4 overflow-y-auto ${darkMode ? 'text-white' : 'text-black'}`}
    >
      <h2 className={`border-b pb-2 font-semibold sticky top-0 ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'} z-10`}>
        Conversation History{' '}
        <button 
          onClick={toggleLogCollapse}
          className={`ml-2 px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {isCollapsed ? 'Show Log' : 'Hide Log'}
        </button>
      </h2>
      
      {/* Chat History Messages */}
      {!isCollapsed && (
        <ul className="space-y-2 mt-2 pb-4">
          {memoizedMessages.slice().reverse().map((message, index) => (
            <li 
              key={index} 
              className={`rounded-md p-2 ${
                message.role === 'user' 
                  ? darkMode ? 'bg-gray-800 bg-opacity-60' : 'bg-blue-50' 
                  : darkMode ? 'bg-gray-700 bg-opacity-60' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-end mb-1">
                <button 
                  onClick={() => collapseAtSpecificIndex(index)}
                  className={`text-xs px-2 py-1 rounded ${
                    darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {collapsed[index] ? 'Show' : 'Hide'}
                </button>
              </div>
              <div style={{ display: collapsed[index] ? 'none' : 'block' }}>
                {message.markdown}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Overlay Component (Appears Above Everything Else) */}
    <Overlay 
      isOpen={isOverlayOpen} 
      onClose={() => setIsOverlayOpen(false)} 
      onSubmit={handleOverlaySubmit} 
      darkMode={darkMode}
    />
  </div>
    </div>
  );
}
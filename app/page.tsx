'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import  Overlay  from './components/modelcard/overlay'

/**
 * 
 * TODO: 
 * Retrieve sessions from db and load such functionality onto button Change Session
 * Add card to support various content generation found in : https://ai.google.dev/api/generate-content
 *  - Add more models
 *    - Add different models based on route. Use the functions as basis when dividing. 
 * 
 * 
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  // Main page variables
  interface ModelConfig { // Because useState won't take both number|undefined we have to do this monstrosity.
    llm: string;
    apiGroup: string;
    topK: number | undefined;
    topP: number | undefined;
    temperature: number | undefined;
  }

  // Mainpage
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [collapsed, setCollapsed] = useState(Array(history.length).fill(true)); 
  const [apiGroup, setApiGroup] = useState("Google")
  
  // For mainpage background
  const [bgImage, setBgImage] = useState('/default-bg.jpg'); 
  const [fade, setFade] = useState(false); 

  // Modal card variables
  const [isOverlayOpen, setIsOverlayOpen] = useState(false); 
  const [modelConfig, setmodelConfig] = useState<ModelConfig>({ llm: 'gemini-1.5-flash', apiGroup: 'Google', topK: undefined, topP: undefined, temperature: undefined });
  
    // Background images for different models. change later
    const bgImages: Record<string, string> = {
      'gemini-1.5-flash': '/bg1.jpg',
      'gemini-1.5-pro': '/bg2.jpg',
      'gemini-2.0-flash-exp': '/bg3.jpg',
    };
  
  const handleGenerate = async () => {
    console.log("current api group is ", apiGroup)

      if (!isGenerating) setIsGenerating(true)
      setPrompt('')
      const newMessage: Message = { role: 'user', content: prompt };
      setHistory((prevHistory) => [...prevHistory, newMessage]);

      if(apiGroup == "Cloudflare"){ //Cloudflare API
        try { 
            const res = await fetch('/api/cloudflare', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                history: [...history, newMessage],  
                llm: modelConfig.llm,
                topK: modelConfig.topK,
                topP: modelConfig.topP,
                temperature: modelConfig.temperature,
              }),
            });
            if (!res.ok) {
              throw new Error(`Cloudflare API request failed with status ${res.status}`);
            }
            const data = await res.json();

            const aiResponse: Message = {
              role: 'assistant',
              content: data.result.response,
            };
            setHistory((prevHistory) => [...prevHistory, aiResponse]);

            if (!res.ok) {
              throw new Error(`Network response was not ok ${res.status}`);
            }
          } catch (err) {
            setError('Error generating response');
            console.error(err);
          }
      }

      if(apiGroup == "Google"){ // Google API
        try {
          //onsole.log("seinding message", JSON.stringify({ history: [...history, newMessage] }))
          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
              history: [...history, newMessage],  
              llm: modelConfig.llm,
              topK: modelConfig.topK,
              topP: modelConfig.topP,
              temperature: modelConfig.temperature,
            }),
          });
  
          if (!res.ok) {
            throw new Error(`Network response was not ok ${res.status}`);
          }
  
          const data = await res.json();
          const aiResponse: Message = { role: 'assistant', content: data.text };
  
          setHistory((prevHistory) => [...prevHistory, aiResponse]);
        } catch (err) {
          setError('Error generating response');
          console.error(err);
        }
      }
  };
  const handleEnterPress = (event:any) => { // For textarea when enter is pressed
    if (event.key === "Enter" && !event.shiftKey) handleGenerate()
  }

  const toggleLogCollapse = () => { //Allows chat history to be collapsed and otherwise
    setIsCollapsed((prev) => !prev);
  };

  const handleOverlaySubmit = (llm: string = "gemini-1.5-pro", apiGroup: string = "Google", topP: number | undefined, topK: number | undefined, temperature: number | undefined) => { 
    setApiGroup(apiGroup); 
    setmodelConfig({ llm, apiGroup, topP: topP ?? undefined, topK: topK ?? undefined, temperature: temperature ?? undefined });
    console.log("received params are: ", llm, apiGroup, topP, topK, temperature)

    setIsOverlayOpen(false);
    setFade(true);
    setTimeout(() => {
      setBgImage(bgImages[llm] || '/default-bg.jpg'); 
      setFade(false);
    }, 500); 
  };

  const collapseAtSpecificIndex = (index:any) => { //
    const newCollapsed = [...collapsed];
    newCollapsed[index] = !newCollapsed[index];
    setCollapsed(newCollapsed);
    return console.log(index)
  };


  return (
    <div className="w-full min-h-screen relative">
      {/* Background Image Layer (Transitions Separately) */}
      <div
        className={`fixed inset-0 bg-cover bg-center transition-opacity duration-500 ${
          fade ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${bgImage})` }}
      />
  
      {/* Main Content Wrapper (Ensures content stays visible while background transitions) */}
      <div className="relative z-10">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between p-4">
          {/* Left Empty Space (For Layout Balance) */}
          <div className="w-1/3"></div>
  
          {/* Centered Page Title */}
          <div className="w-1/3 text-center">
            <h1 className="text-lg font-semibold"></h1>
          </div>
  
          {/* Right-side Buttons */}
          <div className="w-1/3 flex justify-end space-x-2">
            <button className="px-4 py-2 border rounded" onClick={() => setIsOverlayOpen(true)}>
              Change Agent
            </button>
            <button className="px-4 py-2 border rounded">Change Session</button>
          </div>
        </div>
  
        {/* Text Input and Generate Button */}
        <div className="px-4">
          <textarea className="border-2 w-full p-2" value={prompt} onKeyUp={handleEnterPress} onChange={(e) => setPrompt(e.target.value)}placeholder="Enter message" />
          <button onClick={handleGenerate} className="border-2 w-full mt-2 py-2">
            Generate Response
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
  
        {/* Conversation History */}
        <div className="mt-4 px-4">
          <h2 className="border-b pb-2 font-semibold">
            Conversation History{' '}
            <button onClick={toggleLogCollapse}>
              {isCollapsed ? 'Show Log' : 'Hide Log'}
            </button>
          </h2>
  
          {/* Chat History Messages */}
          {!isCollapsed && (
            <ul className="space-y-2 mt-2">
              {history.slice().reverse().map((message, index) => (
                <li key={index}
                  className={`rounded-md p-2 ${
                    message.role === 'user'
                      ? 'text-black-100 italic hover:ring-2 hover:ring-blue-300'
                      : 'text-gray-500 hover:ring-2 hover:ring-orange-300'
                  }`}
                >
                  {/* Show/Hide Message Content */}
                  <div style={{ display: collapsed[index] ? 'none' : 'block' }}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <button className="text-sm mt-1" onClick={() => collapseAtSpecificIndex(index)}>
                    Show/Hide
                  </button>
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
        />
      </div>
    </div>
  );
  
  
}


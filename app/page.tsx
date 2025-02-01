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
 *  - Add background transition 
 * Add background transition based on selected model
 * 
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [collapsed, setCollapsed] = useState(Array(history.length).fill(true)); 
  const [isOverlayOpen, setIsOverlayOpen] = useState(false); // State for the overlay
  const [imageConfig, setImageConfig] = useState({ fruit: 'banana', brightness: 50, vividness: 50 }); //State for image config

  const handleGenerate = async () => {
      if (!isGenerating) setIsGenerating(true)

      setPrompt('')
        
      const newMessage: Message = { role: 'user', content: prompt };
      setHistory((prevHistory) => [...prevHistory, newMessage]);

      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ history: [...history, newMessage] }),
        });

        if (!res.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await res.json();
        const aiResponse: Message = { role: 'assistant', content: data.text };

        setHistory((prevHistory) => [...prevHistory, aiResponse]);
      } catch (err) {
        setError('Error generating response');
        console.error(err);
      }
    
  };
  const handleEnterPress = (event:any) => { // For textarea
    if (event.key === "Enter" && !event.shiftKey) handleGenerate()
  }

  const toggleLogCollapse = () => { //Allows chat history to be collapsed and otherwise
    setIsCollapsed((prev) => !prev);
  };

  const handleOverlaySubmit = (fruit: string, brightness: number, vividness: number) => {
    setImageConfig({ fruit, brightness, vividness });
    setIsOverlayOpen(false);
    console.log("Image config updated:", imageConfig); // Log the updated config
    console.log(fruit)
    console.log(brightness)
    console.log(vividness)
  };

  const collapseAtSpecificIndex = (index:any) => { //
    const newCollapsed = [...collapsed];
    newCollapsed[index] = !newCollapsed[index];
    setCollapsed(newCollapsed);
    return console.log(index)
  };


  return (
    <div className="w-full border-4">
      <div> 

      <div className="flex items-center">
        <div className="flex-grow text-center"> 
          <h1>LLM playground</h1>
        </div>
        <div> 
          <button className="ml-2" onClick={() => setIsOverlayOpen(true)}>Change agent</button> {/*Added onClick*/}
          <button className="ml-2">Change session</button>
        </div>
      </div>

        <textarea 
          className="sticky border-2 mx-3 w-[98.9%] m-1/10" 
          value={prompt} 
          onKeyUp={handleEnterPress} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Enter your message" 
        />
        <br />
        <button onClick={handleGenerate} className="border-2 w-[98.9%] mx-3">Generate Response</button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <h2 className="justify-center border-6 border-indigo-200">
        Conversation History{' '}
        <button onClick={toggleLogCollapse}> {isCollapsed ? 'Show Log' : 'Hide Log'}</button>
      </h2>
      <br />

      {!isCollapsed && (
        <ul className="space-y-2">
          {history.slice().reverse().map((message, index) => (
            <li
              key={index}
              className={`rounded-md p-2 ${message.role === 'user' ? 'text-black-100 italic hover:ring-2 hover:ring-blue-300' : 
                'text-gray-500 hover:ring-2 hover:ring-orange-300'}`}
                >
                <div style={{display: collapsed[index] ? 'none' : 'block' }}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              <button className="justify-items-end" onClick={() => collapseAtSpecificIndex(index)}>Show/hide</button>
            </li>
          ))}
        </ul>   
      )}
      <Overlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onSubmit={handleOverlaySubmit}
      />
    </div>
  );
}


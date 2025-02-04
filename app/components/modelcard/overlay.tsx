import React, { useState } from 'react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (llm: string, apiGroup: string, topK: number | undefined , topP: number | undefined , temperature: number | undefined ) => void;
} 

const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, onSubmit }) => {
  const [setselectedTextModel, setsetselectedTextModel] = useState('gemini-1.5-flash');
  const [apiGroup, setApiGroup] = useState('Google');
  const [topP, setTopP] = useState(0.5);
  const [topK, setTopK] = useState(50);
  const [temperature, setTemperature] = useState(1);

  if (!isOpen) return null;
  const modelToApiGroup: { [key: string]: string } = { // Define module stuff
    'gemini-1.5-flash': 'Google',
    'gemini-1.5-pro': 'Google',
    'gemini-2.0-flash-exp': 'Google',
    '@cf/meta/llama-3.1-8b-instruct': 'Cloudflare',
    '@hf/thebloke/deepseek-coder-6.7b-base-awq': 'Cloudflare',
    '@hf/thebloke/deepseek-coder-6.7b-instruct-awq': 'Cloudflare',
    '@hf/mistral/mistral-7b-instruct-v0.2': 'Cloudflare'
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> 
      <div className="bg-white rounded-lg bg-black shadow-lg p-6 w-96 border-4 border-slate-500">
        <h2 className="text-xl font-bold mb-4">Model Configuration</h2>
        <label>Model:</label>
        <select
          value={setselectedTextModel}
          onChange={(e) => {
            const selectedValue = e.target.value;
            setsetselectedTextModel(selectedValue);
            setApiGroup(modelToApiGroup[selectedValue]);
          }}
          className="border border-gray-300 rounded px-2 py-2 mb-4">
          
          <option className = "bg-lime-300" value="gemini-1.5-flash">gemini-1.5-flash</option>
          <option className = "bg-lime-300" value="gemini-1.5-pro">gemini-1.5-pro</option>
          <option className = "bg-lime-300" value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
          <option className = "bg-orange-300" value="@cf/meta/llama-3.1-8b-instruct">llama-3.1-8b-instruct</option>
          <option className = "bg-orange-300" value="@hf/thebloke/deepseek-coder-6.7b-base-awq">deepseek-coder-6.b-base</option>
          <option className = "bg-orange-300" value="@hf/thebloke/deepseek-coder-6.7b-instruct-awq">deepseek-coder-6.7b-instruct</option>
          <option className = "bg-orange-300" value="@hf/mistral/mistral-7b-instruct-v0.2">mistral-7b-instruct-v0.2</option>

        </select>

        <div className="mb-4">
          <label>TopP:</label>
          <input type="range" min="0" max="1"  step="0.01" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full"/>
          <span className="ml-2">{topP}</span>
        </div>

        <div className="mb-4">
          <label>TopK:</label>
          <input type="range" min="0" max="100"value={topK} onChange={(e) => setTopK(parseInt(e.target.value, 10))} className="w-full"/>
          <span className="ml-2">{topK}%</span>
        </div>

        <div className="mb-4">
          <label>Temperature</label>
          <input type="range" min="0" max="2" step="0.01" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full"/>
          <span className="ml-2">{temperature}</span>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(setselectedTextModel, apiGroup, topP, topK, temperature)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
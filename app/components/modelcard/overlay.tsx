import React, { useState } from 'react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (llm: string, topK: number, topP: number, temperature: number) => void;
} 

const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, onSubmit }) => {
  const [setselectedTextModel, setsetselectedTextModel] = useState('gemini-1.5-pro');
  const [topP, setTopP] = useState(50);
  const [topK, setTopK] = useState(50);
  const [temperature, setTemperature] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 border-4 border-slate-500">
        <h2 className="text-xl font-bold mb-4">Model Configuration</h2>
        <label>Model:</label>
        <select
          value={setselectedTextModel}
          onChange={(e) => setsetselectedTextModel(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 mb-4">

          <option value="gemini-1.5-flash">gemini-1.5-flash</option>
          <option value="gemini-1.5-pro">gemini-1.5-pro</option>
          <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>

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
            onClick={() => onSubmit(setselectedTextModel, topP, topK, temperature)}
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
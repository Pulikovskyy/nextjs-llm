import React, { useState } from 'react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fruit: string, brightness: number, vividness: number) => void;
}

const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, onSubmit }) => {
  const [setselectedTextModel, setsetselectedTextModel] = useState('banana');
  const [topP, setTopP] = useState(50);
  const [topK, setTopK] = useState(50);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 border-4 border-slate-500">
        <h2 className="text-xl font-bold mb-4">Configure Image</h2>
        <label htmlFor="fruit">Fruit:</label>
        <select
          value={setselectedTextModel}
          onChange={(e) => setsetselectedTextModel(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 mb-4"
        >
          <option value="gemini-1.5-flash">gemini-1.5-flash</option>
          <option value="gemini-1.5-pro">gemini-1.5-pro</option>
          <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
        </select>

        <div className="mb-4">
          <label htmlFor="topP">TopP:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={topP}
            onChange={(e) => setTopP(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <span className="ml-2">{topP}%</span>
        </div>

        <div className="mb-4">
          <label htmlFor="vividness">TopK:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <span className="ml-2">{topK}%</span>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(setselectedTextModel, topP, topK)}
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
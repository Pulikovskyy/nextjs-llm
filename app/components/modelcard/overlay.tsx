import React, { useState, useEffect } from 'react';
import Tooltip from '../tooltip/tooltip'

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    llm: string,
    apiGroup: string,
    topK: number | undefined,
    topP: number | undefined,
    temperature: number | undefined,
    prompt: string | undefined,
    maxTokens: number | undefined,
  ) => void;
}

const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedTextModel, setSelectedTextModel] = useState('gemini-2.0-flash-exp');
  const [apiGroup, setApiGroup] = useState('Google');
  const [topP, setTopP] = useState(0.5);
  const [topK, setTopK] = useState(50);
  const [temperature, setTemperature] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined);


  // State to track whether each range is enabled
  const [isTopPEnabled, setIsTopPEnabled] = useState(false);
  const [isTopKEnabled, setIsTopKEnabled] = useState(false);
  const [isTemperatureEnabled, setIsTemperatureEnabled] = useState(false);

  // Controls whether the modal is mounted.
  const [isVisible, setIsVisible] = useState(false);
  // Controls the CSS animation state.
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => {
      setAnimate(true);
      }, 10);
    } else {
      setAnimate(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 300); 
    }
  }, [isOpen]);
  

  // Parameter ranges based on API group
  const parameterRanges:any = {
    Google: {
      topK: { min: 0, max: 100, step: 1 },
      topP: { min: 0, max: 1, step: 0.01 },
      temperature: { min: 0, max: 2, step: 0.01 },
    },
    Cloudflare: {
      topK: { min: 1, max: 50, step: 1 },
      topP: { min: 0, max: 2, step: 0.01 },
      temperature: { min: 0, max: 5, step: 0.01 },
    },
  };

  // Function to update the state based on API group and parameter
  const updateParameterState = (parameter: string, value: number) => {
    const ranges = parameterRanges[apiGroup];
    const { min, max } = ranges[parameter];

    // Ensure value is within bounds
    const clampedValue = Math.max(min, Math.min(max, value));

    switch (parameter) {
      case 'topP':
        setTopP(clampedValue);
        break;
      case 'topK':
        setTopK(clampedValue);
        break;
      case 'temperature':
        setTemperature(clampedValue);
        break;
      default:
        console.warn(`Unknown parameter: ${parameter}`);
    }
  };


  //could be inlined?
  const handleTopPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    updateParameterState('topP', newValue);
  };

  const handleTopKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      updateParameterState('topK', newValue);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      updateParameterState('temperature', newValue);
  };

  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
        setMaxTokens(undefined); 
    } else {
      const parsedValue = parseInt(value, 10); 

      if (!isNaN(parsedValue)) {  // Check if parsing was successful
        setMaxTokens(parsedValue);
      } else {
        console.error("Invalid input for maxTokens.  Please enter a number.");

        setMaxTokens(undefined); // Or some default value
      }
    }
  };



  const modelToApiGroup: { [key: string]: string } = {
    'gemini-1.5-flash': 'Google',
    'gemini-1.5-pro': 'Google',
    'gemini-2.0-flash-exp': 'Google',
    '@cf/meta/llama-3.1-8b-instruct': 'Cloudflare',
    '@hf/thebloke/deepseek-coder-6.7b-base-awq': 'Cloudflare',
    '@hf/thebloke/deepseek-coder-6.7b-instruct-awq': 'Cloudflare',
    '@hf/mistral/mistral-7b-instruct-v0.2': 'Cloudflare',
  };
  const isCloudflareModel = selectedTextModel.startsWith('@cf') || selectedTextModel.startsWith('@hf');

  // Function to handle the submit, passing undefined if a range is disabled
  const handleSubmit = () => {
    onSubmit(
      selectedTextModel,
      apiGroup,
      isCloudflareModel ? undefined : isTopKEnabled ? topK : undefined, // Only send topK if not Cloudflare model
      isCloudflareModel ? undefined : isTopPEnabled ? topP : undefined, 
      isCloudflareModel ? undefined : isTemperatureEnabled ? temperature : undefined,
      systemPrompt ? systemPrompt : undefined,
      maxTokens ? maxTokens : undefined,
    );
  };

  //Update apiGroup whenever selectedTextModel changes
  useEffect(() => {
    setApiGroup(modelToApiGroup[selectedTextModel] || 'Google'); // Default to Google if model not found
  }, [selectedTextModel]);

    //Update slider constraints based on ApiGroup
  useEffect(() => {
    const ranges = parameterRanges[apiGroup];
    if (!ranges) return; // Somehow need this to prevent 400

    //Use setters to properly update constraints of sliders
    setTopP(Math.max(ranges.topP.min, Math.min(ranges.topP.max, topP)))
    setTopK(Math.max(ranges.topK.min, Math.min(ranges.topK.max, topK)))
    setTemperature(Math.max(ranges.temperature.min, Math.min(ranges.temperature.max, temperature)))
  }, [apiGroup])

  if (!isVisible) return null;

  return (
    // The vignette of the modal component
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
      {/* Modal card */}
        <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-[27%] border-4 border-slate-500 transform transition-all duration-300 ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      >
        <h2 className="text-xl font-bold mb-4">Model Configuration</h2>
        <label className="mr-4">Model:</label>
        {/* Select textbox */}
        <select
          value={selectedTextModel}
          className="border border-gray-300 rounded px-2 py-2 mb-4"
          onChange={(e) => {
            const selectedValue = e.target.value;
            setSelectedTextModel(selectedValue);
          }}
        >
        <option className="bg-blue-200" title="From Google API" value="gemini-1.5-flash">gemini-1.5-flash</option>
        <option className="bg-blue-200" title="From Google API" value="gemini-1.5-pro">gemini-1.5-pro</option>
        <option className="bg-blue-200" title="From Google API" value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
        <option className="bg-orange-300" title="From Cloudflare API" value="@cf/meta/llama-3.1-8b-instruct">llama-3.1-8b-instruct</option>
        <option className="bg-orange-300" title="From Cloudflare API" value="@hf/thebloke/deepseek-coder-6.7b-base-awq">deepseek-coder-6.b-base</option>
        <option className="bg-orange-300" title="From Cloudflare API" value="@hf/thebloke/deepseek-coder-6.7b-instruct-awq">deepseek-coder-6.7b-instruct</option>
        <option className="bg-orange-300" title="From Cloudflare API" value="@hf/mistral/mistral-7b-instruct-v0.2">mistral-7b-instruct-v0.2</option>
        </select>

        <h3 className="text-l font-bold"> Optional model parameters </h3>
        <p className="mb-4"> Any options left blank or disabled will initialize a model with default values. Each model may have varying min-max values. </p>
        {/* All 3 sliders for TopK, TopP, and Temperature card */}
        
        <div className="mb-4">
        {!isCloudflareModel && (
          <>
            <div className="mb-4">
              <Tooltip text="Chooses from the most probable words whose probabilities add up to P. Like topK, but uses probabilities instead of a fixed number.">
                <label>
                  TopP:
                  <input
                    type="checkbox"
                    className="ml-2"
                    checked={isTopPEnabled}
                    onChange={(e) => setIsTopPEnabled(e.target.checked)}
                  />
                </label>
              </Tooltip>
              <input
                type="range"
                className="w-full"
                value={topP}
                min={parameterRanges[apiGroup].topP.min}
                max={parameterRanges[apiGroup].topP.max}
                step={parameterRanges[apiGroup].topP.step}
                onChange={(e) => updateParameterState('topP', parseFloat(e.target.value))}
                disabled={!isTopPEnabled}
              />
              <input
                type="number"
                value={topP}
                onChange={handleTopPChange}
                disabled={!isTopPEnabled}
                className="border border-gray-300 rounded px-2 py-1 w-20"
                min={parameterRanges[apiGroup].topP.min}
                max={parameterRanges[apiGroup].topP.max}
                step={parameterRanges[apiGroup].topP.step}
              />
            </div>

            <div className="mb-4">
              <Tooltip text="Limits the model's choices to the K most likely next words. Higher values allow more creativity.">
                <label>
                  TopK:
                  <input
                    type="checkbox"
                    checked={isTopKEnabled}
                    onChange={(e) => setIsTopKEnabled(e.target.checked)}
                    className="ml-2"
                  />
                </label>
              </Tooltip>
              <input
                type="range"
                className="w-full"
                value={topK}
                disabled={!isTopKEnabled}
                min={parameterRanges[apiGroup].topK.min}
                max={parameterRanges[apiGroup].topK.max}
                step={parameterRanges[apiGroup].topK.step}
                onChange={(e) => updateParameterState('topK', parseInt(e.target.value, 10))}
              />
              <input
                type="number"
                className="border border-gray-300 rounded px-2 py-1 w-20"
                value={topK}
                min={parameterRanges[apiGroup].topK.min}
                max={parameterRanges[apiGroup].topK.max}
                step={parameterRanges[apiGroup].topK.step}
                onChange={handleTopKChange}
                disabled={!isTopKEnabled}
              />
            </div>
            <div className="mb-4">
              <Tooltip text="Sets the maximum length of the model's response"><label title="Controls the randomness of the output. Lower values make the output more predictable, higher values make it more varied." >
                  Temperature:
                  <input className="ml-2" type="checkbox"  checked={isTemperatureEnabled}
                    onChange={(e) => setIsTemperatureEnabled(e.target.checked)}
                  />
                </label></Tooltip>
                <input type="range" className="w-full" value={temperature} disabled={!isTemperatureEnabled}
                  min={parameterRanges[apiGroup].temperature.min}
                  max={parameterRanges[apiGroup].temperature.max}
                  step={parameterRanges[apiGroup].temperature.step}
                  onChange={(e) => updateParameterState('temperature', parseFloat(e.target.value))}
                />
                <input
                    type="number" value={temperature}  disabled={!isTemperatureEnabled} onChange={handleTemperatureChange}
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    min={parameterRanges[apiGroup].temperature.min}
                    max={parameterRanges[apiGroup].temperature.max}
                    step={parameterRanges[apiGroup].temperature.step}
                />
             </div>
          </>
        )}

        </div>
        
       
        <Tooltip text="Chooses from the most probable words whose probabilities add up to P. Like topK, but uses probabilities instead of a fixed number. "><p>Custom Prompt</p></Tooltip>
        <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
            className="border-2 w-full p-2"
            placeholder="Enter custom prompt like `Speak to me in GenZ slang only`"
          />
        <Tooltip text="Sets the maximum length of the model's response"><p title="Sets the maximum length of the model's response">Max tokens </p></Tooltip>
        <input type="number" value={maxTokens === undefined ? '' : maxTokens} onChange={handleMaxTokensChange} 
              placeholder="Max token size for all models is 8196"
              className=" w-[100%] h-12 border border-gray-300 rounded px-2 mb-4"
          />
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"> Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"> Apply </button>
        </div>

      </div>
      </div>
    </div>
    
  );
};

export default Overlay;

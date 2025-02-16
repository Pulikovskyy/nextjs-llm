'use client'
import { useState } from "react";
import Modal from "@/app/components/modelcard/modalbase";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-blue-500 text-white rounded"
      >
        Open Modal
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default App;

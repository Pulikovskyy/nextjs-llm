import { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  // Close modal if clicking outside the modal content
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return isVisible ? (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackgroundClick} // Close only if clicking the background
    >
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-[27%] border-4 border-slate-500 transform transition-all duration-300 ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <p>Modal Content</p>
        <button
          onClick={onClose}
          className="mt-4 p-2 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;
};

export default Modal;

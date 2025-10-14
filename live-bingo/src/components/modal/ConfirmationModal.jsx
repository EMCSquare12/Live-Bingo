import { useContext } from 'react';
import GameContext from '../../context/GameContext';

const ConfirmationModal = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  const { theme } = useContext(GameContext);
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-70">
      <div className={`flex flex-col gap-6 p-8 text-center rounded-lg shadow-xl text-gray-50 w-96 ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-800'}`}>
        <p className="text-xl">{message}</p>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={onConfirm}
            className="px-6 py-2 font-medium bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 font-medium bg-gray-600 rounded-md hover:bg-gray-700"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
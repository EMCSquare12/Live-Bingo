// src/pages/Theme/Theme.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import GameContext from '../../context/GameContext';
import BingoCard from '../../components/BingoCard';
import { socket } from '../../utils/socket';

const Theme = () => {
  const { theme, setTheme, roomCode } = useContext(GameContext);

  const dummyLetterNumber = {
    B: [8, 12, 1, 9, 4],
    I: [22, 28, 18, 16, 30],
    N: [34, 40, null, 38, 42],
    G: [50, 58, 46, 55, 60],
    O: [71, 62, 75, 68, 64],
  };
  const dummyMarkedNumbers = [12, 18, 55, 62];

  const handleThemeChange = (updatedTheme) => {
    setTheme(updatedTheme);
    if (roomCode) {
      socket.emit('update-theme', roomCode, updatedTheme);
    }
  };

  const handleColorChange = (e) => {
    handleThemeChange({ ...theme, color: e.target.value });
  };

  const handleBackgroundColorChange = (e) => {
    handleThemeChange({ ...theme, backgroundColor: e.target.value });
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleThemeChange({ ...theme, backgroundImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardGridColorChange = (e) => {
    handleThemeChange({ ...theme, cardGridColor: e.target.value });
  };

  const handleCardLetterColorChange = (e) => {
    handleThemeChange({ ...theme, cardLetterColor: e.target.value });
  };

  const handleCardNumberColorChange = (e) => {
    handleThemeChange({ ...theme, cardNumberColor: e.target.value });
  };

  const handleRemoveBackgroundImage = () => {
    handleThemeChange({ ...theme, backgroundImage: '' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-screen h-screen bg-gray-900 text-gray-50">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">Theme Customization</h1>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="card-color-picker" className="text-lg">Bingo Card:</label>
              <input id="card-color-picker" type="color" value={theme.color} onChange={handleColorChange} className="w-16 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="grid-color-picker" className="text-lg">Card Grid:</label>
              <input id="grid-color-picker" type="color" value={theme.cardGridColor} onChange={handleCardGridColorChange} className="w-16 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="letter-color-picker" className="text-lg">Card Letters:</label>
              <input id="letter-color-picker" type="color" value={theme.cardLetterColor} onChange={handleCardLetterColorChange} className="w-16 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="number-color-picker" className="text-lg">Card Numbers:</label>
              <input id="number-color-picker" type="color" value={theme.cardNumberColor} onChange={handleCardNumberColorChange} className="w-16 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="background-color-picker" className="text-lg">Background:</label>
              <input id="background-color-picker" type="color" value={theme.backgroundColor} onChange={handleBackgroundColorChange} className="w-16 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="background-image-picker" className="text-lg">Background Image:</label>
              <input id="background-image-picker" type="file" accept="image/*" onChange={handleBackgroundImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
              {theme.backgroundImage && (
                <button onClick={handleRemoveBackgroundImage} className="px-4 py-2 mt-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Remove Image</button>
              )}
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link to={roomCode ? `/${roomCode}` : "/host"} className="px-6 py-3 font-medium bg-blue-600 rounded-md hover:bg-blue-700">Back to Game</Link>
          </div>
        </div>
      </div>
      <div
        className="flex items-center justify-center p-8"
        style={{
          backgroundColor: theme.backgroundImage ? 'transparent' : theme.backgroundColor,
          backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <BingoCard
          letterNumber={dummyLetterNumber}
          handleRefresh={() => {}}
          markedNumbers={dummyMarkedNumbers}
          handleNumberClick={() => {}}
        />
      </div>
    </div>
  );
};

export default Theme;
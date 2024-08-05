import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

const GRID_SIZE = 6;
const GAME_DURATION = 120; // 2 minutes

const LETTER_POINTS = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const generateLetter = () => {
  const letters = 'AAABCDEEEFGHIIIJKLMNOOOPQRSTUUVWXYZ';
  return letters[Math.floor(Math.random() * letters.length)];
};

const VALID_WORDS = new Set(['A', 'ABOUT', 'ABOVE', 'ACT', 'AFTER', 'AGAIN', 'ALL', 'ALSO', 'AM', 'AN', 'AND', 'ANY', 'ARE', 'AROUND', 'AS', 'AT', 'AWAY', 'BACK', 'BE', 'BECAUSE', 'BEEN', 'BEFORE', 'BELOW', 'BETWEEN', 'BIG', 'BUT', 'BY', 'CALL', 'CAN', 'CAR', 'CAT', 'COME', 'COULD', 'DAY', 'DID', 'DO', 'DOG', "DON'T", 'DOWN', 'EAT', 'EACH', 'EVERY', 'FIND', 'FIRST', 'FOR', 'FROM', 'FUNNY', 'GET', 'GIVE', 'GO', 'GOOD', 'HAD', 'HAS', 'HAVE', 'HE', 'HELP', 'HER', 'HERE', 'HIM', 'HIS', 'HOW', 'I', 'IF', 'IN', 'IS', 'IT', 'ITS', 'JUST', 'KEEP', 'KNOW', 'LIKE', 'LITTLE', 'LOOK', 'MAKE', 'MAN', 'MANY', 'ME', 'MY', 'NEW', 'NO', 'NOT', 'NOW', 'OF', 'OFF', 'ON', 'ONE', 'ONLY', 'OR', 'OTHER', 'OUR', 'OUT', 'OVER', 'PART', 'PEOPLE', 'PLACE', 'PUT', 'RUN', 'SAID', 'SAME', 'SEE', 'SHE', 'SO', 'SOME', 'TAKE', 'TELL', 'THAN', 'THAT', 'THE', 'THEIR', 'THEM', 'THEN', 'THERE', 'THESE', 'THEY', 'THIS', 'THREE', 'TIME', 'TO', 'TOO', 'TWO', 'UNDER', 'UP', 'USE', 'VERY', 'WANT', 'WAS', 'WE', 'WELL', 'WENT', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WHO', 'WHY', 'WILL', 'WITH', 'WORD', 'WORK', 'WORLD', 'WOULD', 'WRITE', 'YES', 'YOU', 'YOUR']);

const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50">
    {Array.from({ length: 50 }).map((_, index) => (
      <div
        key={index}
        className="absolute animate-fall"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}%`,
          backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          animationDuration: `${2 + Math.random() * 3}s`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ))}
  </div>
);

const WordWeaver = () => {
  const [grid, setGrid] = useState(() => 
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(generateLetter))
  );
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [flashCells, setFlashCells] = useState([]);
  const [submittedWords, setSubmittedWords] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const addNewRow = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.slice(1);
      newGrid.push(Array(GRID_SIZE).fill().map(generateLetter));
      return newGrid;
    });
    
    setSelectedLetters(prev => prev.map(letter => ({
      ...letter,
      row: letter.row - 1
    })).filter(letter => letter.row >= 0));
  }, []);

  useEffect(() => {
    let timer;
    if (!gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameOver, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [timeLeft, score, highScore]);

  useEffect(() => {
    const interval = setInterval(addNewRow, 5000);
    return () => clearInterval(interval);
  }, [addNewRow]);

  const handleCellClick = (rowIndex, colIndex, letter) => {
    if (gameOver || !letter) return;

    setSelectedLetters(prev => {
      const index = prev.findIndex(sel => sel.row === rowIndex && sel.col === colIndex);
      if (index !== -1) {
        return prev.slice(0, index);
      } else {
        return [...prev, { row: rowIndex, col: colIndex, letter }];
      }
    });
  };

  const getWordFromSelected = () => selectedLetters.map(sel => sel.letter).join('');

  const calculateWordScore = (word) => word.split('').reduce((score, letter) => score + LETTER_POINTS[letter], 0);

  const submitWord = () => {
    const word = getWordFromSelected().toUpperCase();
    if (word.length >= 2) {
      if (VALID_WORDS.has(word) && !usedWords.has(word)) {
        const wordScore = calculateWordScore(word);
        setScore(prev => prev + wordScore);
        setSubmittedWords(prev => [...prev, { word, score: wordScore }]);
        setUsedWords(prev => new Set(prev).add(word));
        
        setFlashCells(selectedLetters.map(sel => ({ id: `${sel.row}-${sel.col}`, color: 'green' })));
        
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          selectedLetters.forEach(sel => {
            newGrid[sel.row][sel.col] = null;
          });
          return newGrid;
        });
      } else {
        setFlashCells(selectedLetters.map(sel => ({ id: `${sel.row}-${sel.col}`, color: 'red' })));
      }
      
      setTimeout(() => setFlashCells([]), 500);
      setSelectedLetters([]);
    }
  };

  const resetGame = () => {
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(generateLetter)));
    setSelectedLetters([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setSubmittedWords([]);
    setUsedWords(new Set());
    setShowConfetti(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative">
      {showConfetti && <Confetti />}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">Word Weaver</h1>
        <div className="mb-4">
          <span className="mr-4">Score: {score}</span>
          <span className="mr-4">High Score: {highScore}</span>
          <span>Time: {timeLeft}s</span>
        </div>
        <div className="grid grid-cols-6 gap-1 mb-4">
          {grid.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, colIndex) => {
                const flashCell = flashCells.find(fc => fc.id === `${rowIndex}-${colIndex}`);
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-12 h-12 ${
                      flashCell
                        ? flashCell.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                        : selectedLetters.some(
                            sel => sel.row === rowIndex && sel.col === colIndex
                          )
                          ? 'bg-purple-500'
                          : 'bg-gray-700'
                    } border border-gray-600 flex flex-col items-center justify-center text-2xl font-bold rounded transition-colors duration-300`}
                    onClick={() => handleCellClick(rowIndex, colIndex, cell)}
                    disabled={gameOver || !cell}
                  >
                    {cell}
                    {cell && <span className="text-xs">{LETTER_POINTS[cell]}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="mb-4">
          <span className="text-xl font-bold mr-4">Selected: {getWordFromSelected()}</span>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={submitWord}
            disabled={gameOver || selectedLetters.length < 2}
          >
            Submit Word
          </button>
        </div>
        {gameOver && (
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="h-4 w-4" />
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p>
              Your final score is {score}.
              {score > highScore ? " That's a new high score!" : ""}
              <button className="ml-2 underline" onClick={resetGame}>Play Again</button>
            </p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-700 max-h-48 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Submitted Words</h2>
        <ul>
          {submittedWords.map((item, index) => (
            <li key={index} className="mb-1">
              <span className="font-bold">{item.word}</span>
              <span className="float-right">{item.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WordWeaver;

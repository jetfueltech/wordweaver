import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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


const VALID_WORDS = new Set(['A', 'ABOUT', 'ABOVE', 'ACT', 'AFTER', 'AGAIN', 'ALL', 'ALSO', 'AM', 'AN', 'AND', 'ANY', 'ARE', 'AROUND', 'AS', 'AT', 'AWAY', 'BACK', 'BE', 'BECAUSE', 
  'BEEN', 'BEFORE', 'BELOW', 'BETWEEN', 'BIG', 'BUT', 'BY', 'CALL', 'CAN', 
  'CAR', 'CAT', 'COME', 'COULD', 'DAY', 'DID', 'DO', 'DOG', 'DON\'T', 'DOWN', 
  'EAT', 'EACH', 'EVERY', 'FIND', 'FIRST', 'FOR', 'FROM', 'FUNNY', 'GET', 
  'GIVE', 'GO', 'GOOD', 'HAD', 'HAS', 'HAVE', 'HE', 'HELP', 'HER', 'HERE', 
  'HIM', 'HIS', 'HOW', 'I', 'IF', 'IN', 'IS', 'IT', 'ITS', 'JUST', 'KEEP', 
  'KNOW', 'LIKE', 'LITTLE', 'LOOK', 'MAKE', 'MAN', 'MANY', 'ME', 'MY', 'NEW', 
  'NO', 'NOT', 'NOW', 'OF', 'OFF', 'ON', 'ONE', 'ONLY', 'OR', 'OTHER', 'OUR', 
  'OUT', 'OVER', 'PART', 'PEOPLE', 'PLACE', 'PUT', 'RUN', 'SAID', 'SAME', 
  'SEE', 'SHE', 'SO', 'SOME', 'TAKE', 'TELL', 'THAN', 'THAT', 'THE', 'THEIR', 
  'THEM', 'THEN', 'THERE', 'THESE', 'THEY', 'THIS', 'THREE', 'TIME', 'TO', 
  'TOO', 'TWO', 'UNDER', 'UP', 'USE', 'VERY', 'WANT', 'WAS', 'WE', 'WELL', 
  'WENT', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WHO', 'WHY', 'WILL', 'WITH', 
  'WORD', 'WORK', 'WORLD', 'WOULD', 'WRITE', 'YES', 'YOU', 'YOUR',
  'AFTER', 'AGAIN', 'ALONG', 'ALWAYS', 'ANOTHER', 'ANSWER', 'BELOW', 'BETTER', 
  'BLACK', 'BLINK', 'BOARD', 'BRAIN', 'BRAVE', 'BREAK', 'BRING', 'BROWN', 
  'BUILD', 'BUY', 'CATCH', 'CLASS', 'CLEAR', 'CLOCK', 'CLOSE', 'CLOUD', 
  'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRASH', 'CRAZY', 'CRY', 
  'DANCE', 'DARK', 'DEATH', 'DOING', 'DREAM', 'DRIVE', 'DURING', 'EASY', 
  'EIGHT', 'EITHER', 'ENJOY', 'ENTER', 'EVER', 'EVERY', 'EXACT', 'EXIST', 
  'FALL', 'FARM', 'FAVOR', 'FEEL', 'FIGHT', 'FIND', 'FIRST', 'FLY', 'FOCUS', 
  'FIVE', 'FOOD', 'FORCE', 'FOUR', 'FRESH', 'FRONT', 'FULL', 'FUNNY', 'GAMES', 
  'GAVE', 'GIRL', 'GLASS', 'GLOW', 'GOES', 'GOING', 'GONE', 'GOOD', 'GRAND', 
  'GRASS', 'GREEN', 'GROUP', 'GUESS', 'HAPPY', 'HARD', 'HAVEN', 'HEARD', 
  'HEART', 'HEAVY', 'HELLO', 'HERO', 'HOLD', 'HONOR', 'HORSE', 'HOUSE', 
  'HUMAN', 'IDEAS', 'INTO', 'ISSUE', 'JUDGE', 'KIND', 'KISS', 'KNIFE', 'LAUGH', 
  'LEARN', 'LEAVE', 'LIFE', 'LIGHT', 'LIKE', 'LIVES', 'LOCAL', 'LOGIC', 'LOST', 
  'LOVE', 'LUCKY', 'MAGIC', 'MAJOR', 'MAKES', 'MAKING', 'MARK', 'MARRY', 
  'MIGHT', 'MONEY', 'MONTH', 'MORAL', 'MORNING', 'MOTHER', 'MOUTH', 'MUSIC', 
  'NEAR', 'NEED', 'NEVER', 'NIGHT', 'NOBLE', 'NORTH', 'OFFER', 'ORDER', 
  'OTHER', 'PAINT', 'PARTY', 'PEACE', 'PEOPLE', 'PHONE', 'PILOT', 'PLACE', 
  'PLAIN', 'PLANT', 'PLATE', 'POINT', 'POWER', 'PRIDE', 'PROVE', 'PUSH', 
  'QUEEN', 'QUIET', 'RANGE', 'READY', 'REACH', 'READ', 'REASON', 'RIGHT', 
  'RIVER', 'ROBIN', 'ROUND', 'SADLY', 'SAFELY', 'SAID', 'SAINT', 'SAVE', 
  'SCHOOL', 'SCORE', 'SEVEN', 'SHAKE', 'SHALL', 'SHAPE', 'SHARE', 'SHINE', 
  'SHOOK', 'SHORT', 'SHOULD', 'SHOUT', 'SHOW', 'SINCE', 'SIXTY', 'SLEEP', 
  'SMALL', 'SMART', 'SMELL', 'SMILE', 'SMOKE', 'SNEAK', 'SNOOP', 'SOUTH', 
  'SPACE', 'SPEND', 'SPILL', 'SPOT', 'STAGE', 'STAND', 'START', 'STATE', 
  'STEAL', 'STICK', 'STILL', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 
  'STOVE', 'STREET', 'STUFF', 'STUDY', 'STYLE', 'SUGAR', 'SUITE', 'SURE', 
  'SWEEP', 'SWEET', 'TABLE', 'TAKE', 'TASTE', 'TEACH', 'TEAM', 'TEARS', 
  'THANK', 'THEME', 'THINK', 'THREE', 'TIGHT', 'TITLE', 'TODAY', 'TOGETHER', 
  'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TRAVEL', 'TREND', 
  'TRICK', 'TRIP', 'TROOP', 'TRUTH', 'TWICE', 'UNDER', 'UNION', 'UNTIL', 
  'UPSET', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VISIT', 'VOICE', 'WAGON', 
  'WASTE', 'WATCH', 'WATER', 'WEATHER', 'WEEK', 'WHERE', 'WHITE', 'WHOLE', 
  'WHOSE', 'WILL', 'WIND', 'WINNER', 'WIPE', 'WIRED', 'WOMEN', 'WORLD', 
  'WORRY', 'WRITE', 'YARD', 'YEARS', 'YELLOW', 'YOUNG', 'YOUTH', 'ZEBRA']);



const InstructionsDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="absolute top-4 right-4 p-2 bg-blue-500 text-white rounded-full">
        <HelpCircle size={24} />
      </button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>How to Play Word Weaver</DialogTitle>
      </DialogHeader>
      <div className="mt-2">
        <p>1. Click on letters to form words (2 letters or more).</p>
        <p>2. Submit words to score points. Longer words and rare letters score more!</p>
        <p>3. Valid words will flash green and be removed from the board.</p>
        <p>4. Invalid or repeated words will flash red and remain on the board.</p>
        <p>5. Each word can only be submitted once per game.</p>
        <p>6. New letters appear from the bottom every 5 seconds.</p>
        <p>7. Game ends after 2 minutes. Try to beat your high score!</p>
      </div>
    </DialogContent>
  </Dialog>
);

const WordWeaver = () => {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)));
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [flashCells, setFlashCells] = useState([]);
  const [submittedWords, setSubmittedWords] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());

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
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
    }
  }, [timeLeft, gameOver, score, highScore]);

  useEffect(() => {
    const interval = setInterval(addNewRow, 5000); // Add new row every 5 seconds
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

  const getWordFromSelected = () => {
    return selectedLetters.map(sel => sel.letter).join('');
  };

  const calculateWordScore = (word) => {
    return word.split('').reduce((score, letter) => score + LETTER_POINTS[letter], 0);
  };

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
        // Incorrect or repeated word
        setFlashCells(selectedLetters.map(sel => ({ id: `${sel.row}-${sel.col}`, color: 'red' })));
      }
      
      setTimeout(() => setFlashCells([]), 500); // Clear flash after 500ms
      setSelectedLetters([]);
    }
  };

  const resetGame = () => {
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)));
    setSelectedLetters([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setSubmittedWords([]);
    setUsedWords(new Set());
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <InstructionsDialog />
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Submitted Words</h2>
        <ul>
          {submittedWords.map((item, index) => (
            <li key={index} className="mb-2">
              <span className="font-bold">{item.word}</span>
              <span className="float-right">{item.score}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Word Weaver</h1>
        <div className="mb-4">
          <span className="mr-4">Score: {score}</span>
          <span className="mr-4">High Score: {highScore}</span>
          <span>Time: {timeLeft}s</span>
        </div>
        <div className="grid grid-cols-6 gap-1 mb-4">
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
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
            })
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
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Game Over!</AlertTitle>
            <AlertDescription>
              Your final score is {score}.
              {score === highScore && score > 0 && " That's a new high score!"}
              <button className="ml-2 underline" onClick={resetGame}>Play Again</button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default WordWeaver;



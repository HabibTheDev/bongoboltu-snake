import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Position, Direction } from '../interface/Position';
import BONUS_FOOD_SOUND from '../assets/bangaboltu.mp3'; 
import Popup from '../libs/Popup/Popup';


const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_FOOD: Position = { x: 5, y: 5 };
const BONUS_FOOD_DURATION = 3000; // Bonus food effect duration in ms
const SPEED_LEVELS = { easy: 200, medium: 150, hard: 100 };

const SnakeGame: React.FC = () => {
  const [gridSize, setGridSize] = useState(20);
  const [cellSize, setCellSize] = useState(20);

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [bonusFood, setBonusFood] = useState<Position | null>(generateFood());
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(SPEED_LEVELS.medium);
  const [currentLevel, setCurrentLevel] = useState<string>('Medium');
  const [isOpenPopup, setIsOpenPopup] = useState(false);

    // Handle screen resizing
    useEffect(() => {
      const updateGridSize = () => {
        const screenWidth = window.innerWidth;
        const newGridSize = screenWidth < 600 ? 15 : 21;
        const newCellSize = Math.min(Math.floor(window.innerWidth / newGridSize), 30);
        setGridSize(newGridSize);
        setCellSize(newCellSize);
      };
  
      updateGridSize();
      window.addEventListener('resize', updateGridSize);
      return () => window.removeEventListener('resize', updateGridSize);
    }, []);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio(BONUS_FOOD_SOUND));

  function generateFood(): Position {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  }

  useEffect(() => {
    if (!gameOver) {
      const timer = setInterval(() => setTime((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameOver]);

  useEffect(() => {
    const moveSnake = () => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };
      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
      if (head.x < 0) head.x = gridSize - 1;
      if (head.x >= gridSize) head.x = 0;
      if (head.y < 0) head.y = gridSize - 1;
      if (head.y >= gridSize) head.y = 0;

      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsOpenPopup(true);
        return;
      }
      newSnake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        setScore(score + 1);
      } 
      else if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
        setBonusFood(generateFood()); 
        setScore(score + 2);
        audioRef.current.play();
        setTimeout(() => setBonusFood(generateFood()), BONUS_FOOD_DURATION);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    if (!gameOver) {
      const interval = setInterval(moveSnake, speed);
      return () => clearInterval(interval);
    }
  }, [snake, direction, food, gameOver, bonusFood, score, speed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp': changeDirection('UP'); break;
        case 'ArrowDown': changeDirection('DOWN'); break;
        case 'ArrowLeft': changeDirection('LEFT'); break;
        case 'ArrowRight': changeDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Change snake direction
  const changeDirection = (newDirection: Direction) => {
    setDirection((prev) => {
      if (
        (newDirection === 'UP' && prev !== 'DOWN') ||
        (newDirection === 'DOWN' && prev !== 'UP') ||
        (newDirection === 'LEFT' && prev !== 'RIGHT') ||
        (newDirection === 'RIGHT' && prev !== 'LEFT')
      ) {
        return newDirection;
      }
      return prev;
    });
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setBonusFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setIsOpenPopup(false);
    setScore(0);
    setTime(0);
  };
  const startGame = (level: string) => {
    setSpeed(SPEED_LEVELS[level as keyof typeof SPEED_LEVELS]);
    setCurrentLevel(level.charAt(0).toUpperCase() + level.slice(1));
    resetGame();
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-black text-white p-6">
    <div className='flex flex-col items-center justify-center'>
    <h1 className="text-4xl mb-4 ">Bangaboltu Snake</h1>
    <p className="text-lg mb-2 ">Score: {score} | Time: {time}s</p>
    <p className="text-2xl font-bold mb-4 ">Level: {currentLevel}</p>
    </div>

    <div className="flex gap-4 justify-center mb-5">
      <button onClick={() => startGame('easy')} className="px-4 py-2 bg-green-500 rounded hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300">Easy</button>
      <button onClick={() => startGame('medium')} className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300">Medium</button>
      <button onClick={() => startGame('hard')} className="px-4 py-2 bg-red-500 rounded hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300">Hard</button>
    </div>

    <div className="flex items-center justify-center min-h-fit ">
   <div className="flex items-center ">
     <div ref={gameAreaRef} className="relative border-5 border-white" style={{ width: gridSize * cellSize, height: gridSize * cellSize }}>

       {snake.map((segment, index) => (
         <motion.div
           key={index}
           className="absolute"
           style={{
             left: segment.x * cellSize - 12  ,
             top: segment.y * cellSize - 12 ,
             width: cellSize * 1.2,
             height: cellSize * 1.2,
             borderRadius: 5,
             backgroundImage: 'url(https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/authors/1472728275i/14866485._UX200_CR0,31,200,200_.jpg)',
             backgroundSize: 'cover',
           }}
         />
       ))}
       
       <div
         className="absolute"
         style={{
           left: food.x * cellSize ,
           top: food.y * cellSize ,
           width: cellSize * 1.2,
           height: cellSize * 1.2,
           borderRadius: 5,
           backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT36kl9kNMzgYPQ-fIDNaJeeKx8V8yEj2ObxA&s)',
           backgroundSize: 'contain',
           backgroundRepeat: 'no-repeat',
         }}
       />

       {bonusFood && (
         <div
           className="absolute animate-pulse"
           style={{
             left: bonusFood.x * cellSize,
             top: bonusFood.y * cellSize,
               width: cellSize * 1.2,
             height: cellSize * 1.2,
             borderRadius: 5,
             backgroundImage: 'url(https://www.eastlandinsurance.com/storage/uploads/1680428503.png)',
             backgroundSize: 'cover',
           }}
         />
       )}
  <div className="absolute bottom-5 right-0 flex flex-col items-center opacity-30 gap-2">
        <button onClick={() => changeDirection('UP')} className="bg-gray-700 p-3 rounded mb-2">▲</button>
        <div className="flex gap-4">
          <button onClick={() => changeDirection('LEFT')} className="bg-gray-700 p-3 rounded mr-5">◀</button>
          <button onClick={() => changeDirection('RIGHT')} className="bg-gray-700 p-3 rounded">▶</button>
        </div>
        <button onClick={() => changeDirection('DOWN')} className="bg-gray-700 p-3 rounded mt-2">▼</button>
      </div>
     </div>

   </div>
 
 </div>

 <button onClick={resetGame} className="px-9 py-2 mt-10 bg-red-500 rounded hover:bg-gray-400 mt-4 mx-auto w-40 items-center flex">Reset Game</button>
 {isOpenPopup && <Popup setIsOpenPopup={setIsOpenPopup}  />}
    </div>

  );
};

export default SnakeGame;
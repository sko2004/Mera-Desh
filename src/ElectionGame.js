import React, { useState, useEffect, useRef } from 'react';

const ElectionGame = () => {
  const [playerPos, setPlayerPos] = useState(250);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef();
  const keysPressed = useRef({});
  const audioRef = useRef(null);

  const PLAYER_WIDTH = 60;
  const PLAYER_HEIGHT = 80;
  const OBSTACLE_SIZE = 50;
  const GAME_WIDTH = 500;
  const GAME_HEIGHT = 600;
  const PLAYER_SPEED = 8;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        keysPressed.current[e.key] = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keysPressed.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      setPlayerPos(prev => {
        let newPos = prev;
        if (keysPressed.current['ArrowLeft']) {
          newPos = Math.max(0, prev - PLAYER_SPEED);
        }
        if (keysPressed.current['ArrowRight']) {
          newPos = Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + PLAYER_SPEED);
        }
        return newPos;
      });

      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          y: obs.y + obs.speed
        })).filter(obs => {
          if (
            obs.y + OBSTACLE_SIZE > GAME_HEIGHT - PLAYER_HEIGHT - 10 &&
            obs.y < GAME_HEIGHT - 10 &&
            obs.x + OBSTACLE_SIZE > playerPos &&
            obs.x < playerPos + PLAYER_WIDTH
          ) {

            if (audioRef.current) {
              audioRef.current.currentTime = 0; 
              audioRef.current.play().catch(err => console.log('Audio play failed:', err));
            }
            setGameOver(true);
            return false;
          }
          
          if (obs.y > GAME_HEIGHT) {
            setScore(s => s + 1);
            return false;
          }
          
          return true;
        });

        if (Math.random() < 0.02) {
          updated.push({
            x: Math.random() * (GAME_WIDTH - OBSTACLE_SIZE),
            y: -OBSTACLE_SIZE,
            speed: 3 + Math.random() * 2,
            id: Date.now()
          });
        }

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, playerPos]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setPlayerPos(250);
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setPlayerPos(250);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-4">
      <audio ref={audioRef} src="/audio.mp3" preload="auto" />
      <div className="mb-4 text-white text-center">
        <h1 className="text-4xl font-bold mb-2">Dodge Game</h1>
        <p className="text-xl">Score: {score}</p>
        <p className="text-sm mt-2">Use ← → Arrow Keys to move</p>
      </div>

      <div 
        className="relative bg-sky-200 border-4 border-gray-800 rounded-lg overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 text-white text-2xl font-bold rounded-lg hover:bg-green-600 transition"
            >
              Start Game
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over!</h2>
              <p className="text-2xl text-white mb-6">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-lg hover:bg-blue-600 transition"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        <div
          className="absolute transition-none"
          style={{
            left: playerPos,
            bottom: 10,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
          }}
        >
          <img 
            src="modi.jpeg" 
            alt="Player"
            className="w-full h-full object-cover rounded-lg border-2 border-orange-500"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>

        {obstacles.map(obs => (
          <div
            key={obs.id}
            className="absolute"
            style={{
              left: obs.x,
              top: obs.y,
              width: OBSTACLE_SIZE,
              height: OBSTACLE_SIZE,
            }}
          >
            <img 
              src="rahul.jpeg" 
              alt="Obstacle"
              className="w-full h-full object-cover rounded-lg border-2 border-gray-700"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        ))}

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-700"></div>
      </div>

      <div className="mt-4 text-white text-center max-w-md">
        <p className="text-sm">Dodge the falling obstacles! Each one you avoid adds to your score.</p>
      </div>
    </div>
  );
};

export default ElectionGame;
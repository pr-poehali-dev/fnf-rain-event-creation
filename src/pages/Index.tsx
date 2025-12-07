import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface RainDrop {
  id: number;
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [intensity, setIntensity] = useState(150);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const DURATION = 160;
  const FADE_START = 150;
  const ANGLE = 35;

  useEffect(() => {
    const drops: RainDrop[] = [];
    for (let i = 0; i < intensity; i++) {
      drops.push({
        id: i,
        x: Math.random() * (window.innerWidth + 400),
        y: Math.random() * window.innerHeight,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 3 + 2,
        opacity: Math.random() * 0.3 + 0.5
      });
    }
    setRainDrops(drops);
  }, [intensity]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 0.1;
        if (newTime >= DURATION) {
          setIsActive(false);
          setTimeElapsed(0);
          setGlobalOpacity(1);
          return 0;
        }
        
        if (newTime >= FADE_START) {
          const fadeProgress = (newTime - FADE_START) / (DURATION - FADE_START);
          setGlobalOpacity(1 - fadeProgress);
        }
        
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const angleRad = (ANGLE * Math.PI) / 180;
      const dx = Math.cos(angleRad);
      const dy = Math.sin(angleRad);

      setRainDrops(prevDrops => {
        return prevDrops.map(drop => {
          const newX = drop.x + dx * drop.speed;
          const newY = drop.y + dy * drop.speed;

          ctx.strokeStyle = `rgba(96, 165, 250, ${drop.opacity * globalOpacity})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + dx * drop.length, drop.y + dy * drop.length);
          ctx.stroke();

          if (newY > canvas.height + 50 || newX > canvas.width + 50) {
            return {
              ...drop,
              x: Math.random() * -200,
              y: Math.random() * canvas.height
            };
          }

          return {
            ...drop,
            x: newX,
            y: newY
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, rainDrops, globalOpacity]);

  const handleStart = () => {
    setIsActive(true);
    setTimeElapsed(0);
    setGlobalOpacity(1);
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setGlobalOpacity(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-[#0F1419] relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: isActive ? 1 : 0 }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            FNF Rain Event
          </h1>
          <p className="text-blue-300 text-lg">Psych Engine — Дождевой эффект</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-[#1E2937]/90 backdrop-blur-sm border-blue-500/30 p-8">
            <div className="text-center mb-8">
              <div className="text-7xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Roboto, monospace' }}>
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-blue-300">
                из {formatTime(DURATION)}
              </div>
              {timeElapsed >= FADE_START && isActive && (
                <div className="mt-4 text-yellow-400 animate-pulse">
                  <Icon name="CloudRain" size={24} className="inline mr-2" />
                  Дождь исчезает...
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center mb-8">
              <Button
                onClick={handleStart}
                disabled={isActive}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                size="lg"
              >
                <Icon name="Play" size={20} className="mr-2" />
                Старт
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isActive}
                variant="destructive"
                className="px-8"
                size="lg"
              >
                <Icon name="Square" size={20} className="mr-2" />
                Стоп
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-blue-300 text-sm">Интенсивность дождя</label>
                  <span className="text-blue-400 font-semibold">{intensity} капель</span>
                </div>
                <Slider
                  value={[intensity]}
                  onValueChange={(val) => !isActive && setIntensity(val[0])}
                  min={50}
                  max={300}
                  step={10}
                  disabled={isActive}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </Card>

          <Card className="bg-[#1E2937]/90 backdrop-blur-sm border-blue-500/30 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Параметры эффекта
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-300">
                <Icon name="MoveRight" size={16} />
                <span>Угол: {ANGLE}°</span>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <Icon name="Timer" size={16} />
                <span>Длительность: 2:40</span>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <Icon name="Palette" size={16} />
                <span>Цвет: Голубой</span>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <Icon name="Sparkles" size={16} />
                <span>Fade-out: 10 сек</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto:wght@400;700&display=swap');
      `}</style>
    </div>
  );
};

export default Index;

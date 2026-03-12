import { useState, useMemo } from 'react';
import UnfoldingCube from '@/components/UnfoldingCube';

const Index = () => {
  const [revealed, setRevealed] = useState(false);

  // Generate particle positions once
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: `${i * 0.15}s`,
      size: 3 + Math.random() * 4,
    })), []
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* 3D Canvas fills the viewport */}
      <div className="absolute inset-0">
        <UnfoldingCube onAnimationComplete={() => setRevealed(true)} />
      </div>

      {/* Eid Mubarak reveal overlay */}
      {revealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {/* Glow background */}
          <div className="absolute inset-0 eid-glow-bg" />

          {/* Particles */}
          {particles.map((p, i) => (
            <div
              key={i}
              className="eid-particle"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                width: p.size,
                height: p.size,
              }}
            />
          ))}

          {/* Message */}
          <div className="eid-reveal-fade text-center px-4">
            <h1 className="eid-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-4">
              Eid Mubarak
            </h1>
            <p className="eid-subtitle text-xl sm:text-2xl md:text-3xl">
              عيد مبارك
            </p>
            <p className="eid-subtitle text-base sm:text-lg mt-4 opacity-70">
              May this blessed day bring you joy and peace
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  rotation: number;
  speed: number;
  wobble: number;
  size: number;
  opacity: number;
  color: string;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Petal colors inspired by the floral theme
    const colors = [
      'rgba(228, 113, 147, 0.3)', // Primary pink
      'rgba(244, 176, 184, 0.3)', // Light pink
      'rgba(161, 190, 158, 0.3)', // Sage green
      'rgba(245, 222, 179, 0.3)', // Cream
    ];

    // Create petals
    const petals: Petal[] = [];
    const petalCount = 30;

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        rotation: Math.random() * 360,
        speed: 0.3 + Math.random() * 0.7,
        wobble: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 12,
        opacity: 0.3 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach((petal) => {
        // Update position
        petal.y += petal.speed;
        petal.wobble += 0.02;
        petal.rotation += 0.5;
        
        // Wobble effect (side to side motion)
        const wobbleX = Math.sin(petal.wobble) * 2;

        // Reset petal when it goes off screen
        if (petal.y > canvas.height + 20) {
          petal.y = -20;
          petal.x = Math.random() * canvas.width;
        }

        // Draw petal
        ctx.save();
        ctx.translate(petal.x + wobbleX, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        
        // Petal shape (ellipse)
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = petal.color;
        ctx.fill();
        
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default AnimatedBackground;

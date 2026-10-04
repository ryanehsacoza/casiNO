import { useState, useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  avgFrameTimeMs: number;
  performanceTier: 'high' | 'medium' | 'low';
  gpuAccelerated: boolean;
  activeOptimizations: string[];
}

export function usePerformanceDiagnostics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFrameTimeMs: 16.6,
    performanceTier: 'high',
    gpuAccelerated: true,
    activeOptimizations: ['GPU Layer Composition', 'CSS Keyframe Reel Roll', 'Zero React State Spin Loops'],
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);

  useEffect(() => {
    let animId: number;

    const measure = (now: number) => {
      const delta = now - lastTimeRef.current;
      frameCountRef.current++;
      frameTimesRef.current.push(delta);

      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
      }

      if (delta >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        const avgFrameMs =
          frameTimesRef.current.reduce((a, b) => a + b, 0) / (frameTimesRef.current.length || 1);

        let tier: 'high' | 'medium' | 'low' = 'high';
        const opts = ['GPU Layer Composition', 'CSS Keyframe Reel Roll'];

        if (currentFps < 35) {
          tier = 'low';
          opts.push('Reduced Blur Pass', 'Essential Particles Only');
        } else if (currentFps < 52) {
          tier = 'medium';
          opts.push('Adaptive Particle Count');
        } else {
          tier = 'high';
          opts.push('Full Particle FX', 'Specular Shimmer Active');
        }

        setMetrics({
          fps: Math.min(60, currentFps),
          avgFrameTimeMs: parseFloat(avgFrameMs.toFixed(1)),
          performanceTier: tier,
          gpuAccelerated: true,
          activeOptimizations: opts,
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  return metrics;
}

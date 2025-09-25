"use client";
import { useEffect, useRef, useState } from 'react';

const useCountUp = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const startTime = Date.now();
          const startValue = 0;

          const updateCount = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
            
            setCount(currentValue);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            }
          };

          requestAnimationFrame(updateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
};

export const OnlineStats = () => {
  const { count: count1, ref: ref1 } = useCountUp(300);
  const { count: count2, ref: ref2 } = useCountUp(15);
  const { count: count3, ref: ref3 } = useCountUp(1000);
  const { count: count4, ref: ref4 } = useCountUp(95);

  return (
    <div className="w-full bg-[#032622] py-6 md:py-8 lg:py-12 xl:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 xl:gap-15">
          {/* Statistique 1 */}
          <div className="text-center" ref={ref1}>
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#F8F5E4] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              {count1}+
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-[#F8F5E4]/90 font-medium leading-tight px-2 sm:px-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              FORMATIONS DISPONIBLES
            </div>
          </div>

          {/* Statistique 2 */}
          <div className="text-center" ref={ref2}>
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#F8F5E4] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              {count2}
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-[#F8F5E4]/90 font-medium leading-tight px-2 sm:px-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              ÉCOLES DIFFÉRENTES
            </div>
          </div>

          {/* Statistique 3 */}
          <div className="text-center" ref={ref3}>
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#F8F5E4] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              +{count3}
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-[#F8F5E4]/90 font-medium leading-tight px-2 sm:px-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              CERTIFICAT OBTENU
            </div>
          </div>

          {/* Statistique 4 */}
          <div className="text-center" ref={ref4}>
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#F8F5E4] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              {count4}%
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-[#F8F5E4]/90 font-medium leading-tight px-2 sm:px-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              RETOURS POSITIFS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';

type Props = {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const LottiePlayer: React.FC<Props> = ({ animationData, loop = false, autoplay = true, className, style }) => {
  const container = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      try {
        // dynamic import to avoid hard dependency if consumer does not want lottie
        // @ts-ignore - optional dependency, may not be installed in some environments
        const lottie: any = (await import('lottie-web')).default;
        if (!mounted || !container.current) return;
        animRef.current = lottie.loadAnimation({
          container: container.current,
          renderer: 'svg',
          loop,
          autoplay,
          animationData,
        });
      } catch (e) {
        // lottie-web not available — no-op (fallback UI handled by consumer)
        // console.debug('lottie-web not available', e);
      }
    };
    setup();
    return () => {
      mounted = false;
      try { if (animRef.current && animRef.current.destroy) animRef.current.destroy(); } catch (e) { /* ignore */ }
    };
  }, [animationData, loop, autoplay]);

  return <div ref={container} className={className} style={style} />;
};

export default LottiePlayer;

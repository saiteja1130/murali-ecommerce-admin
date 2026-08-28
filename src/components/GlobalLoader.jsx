import React, { useState, useEffect } from 'react';

const GlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval;
    let finishTimeout;

    const handleStart = () => {
      clearTimeout(finishTimeout);
      setIsLoading(true);
      setProgress(10);
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);
    };

    const handleEnd = () => {
      clearInterval(progressInterval);
      setProgress(100);
      finishTimeout = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 400); // Wait for the transition to finish before hiding
    };

    window.addEventListener('api-load-start', handleStart);
    window.addEventListener('api-load-end', handleEnd);

    return () => {
      window.removeEventListener('api-load-start', handleStart);
      window.removeEventListener('api-load-end', handleEnd);
      clearInterval(progressInterval);
      clearTimeout(finishTimeout);
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
      <div 
        className="h-full bg-[#C8A87C] transition-all ease-out duration-300"
        style={{ width: `${progress}%`, opacity: isLoading ? 1 : 0 }}
      />
    </div>
  );
};

export default GlobalLoader;

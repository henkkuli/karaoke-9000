import React from 'react';

export const useAnimationFrame = (callback: (delta: number) => void) => {
    const requestRef = React.useRef<number>(0);
    const previousTimeRef = React.useRef<number>();
    const animate = React.useRef<(time: number) => void>(() => { });

    animate.current = (time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime)
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate.current);
    }

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate.current);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
}

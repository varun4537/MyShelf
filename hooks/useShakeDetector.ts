import { useCallback, useEffect, useRef } from 'react';

/**
 * Detects a deliberate phone shake via the device accelerometer.
 *
 * Motion is sampled at ~10Hz; the per-axis delta between samples is
 * normalised by elapsed time, so the trigger reflects how *violently*
 * the phone moved rather than its orientation. Gravity is not filtered
 * out because only the change between samples is used.
 */

// Higher = harder shake required. ~800 is a gentle wobble, 1600 is vigorous.
const SHAKE_THRESHOLD = 1400;
const SAMPLE_INTERVAL_MS = 100;
// Ignore repeat triggers while the previous effect is still playing
const COOLDOWN_MS = 2500;

type MotionPermissionCtor = typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>;
};

/** iOS 13+ gates motion events behind a permission prompt requiring a user gesture. */
export const requestMotionPermission = async (): Promise<boolean> => {
    const ctor = window.DeviceMotionEvent as MotionPermissionCtor | undefined;
    if (!ctor) return false;
    if (typeof ctor.requestPermission !== 'function') return true; // Android/desktop: no prompt needed
    try {
        return (await ctor.requestPermission()) === 'granted';
    } catch {
        return false;
    }
};

export const useShakeDetector = (onShake: () => void, enabled: boolean = true) => {
    const onShakeRef = useRef(onShake);
    useEffect(() => { onShakeRef.current = onShake; }, [onShake]);

    const lastSample = useRef({ x: 0, y: 0, z: 0, time: 0 });
    const lastShake = useRef(0);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined' || !window.DeviceMotionEvent) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        const handleMotion = (event: DeviceMotionEvent) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

            const now = Date.now();
            const elapsed = now - lastSample.current.time;
            if (elapsed < SAMPLE_INTERVAL_MS) return;

            const prev = lastSample.current;
            lastSample.current = { x: acc.x, y: acc.y, z: acc.z, time: now };

            // Skip the first sample — there's no previous reading to compare against
            if (prev.time === 0) return;

            const speed =
                (Math.abs(acc.x - prev.x) + Math.abs(acc.y - prev.y) + Math.abs(acc.z - prev.z)) /
                elapsed * 10000;

            if (speed > SHAKE_THRESHOLD && now - lastShake.current > COOLDOWN_MS) {
                lastShake.current = now;
                onShakeRef.current();
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [enabled]);
};

/** Attach to a user gesture once, so iOS grants motion access. */
export const useMotionPermissionOnFirstGesture = (enabled: boolean = true) => {
    const asked = useRef(false);

    const ensurePermission = useCallback(() => {
        if (asked.current) return;
        asked.current = true;
        void requestMotionPermission();
    }, []);

    useEffect(() => {
        if (!enabled) return;
        window.addEventListener('pointerdown', ensurePermission, { once: true });
        return () => window.removeEventListener('pointerdown', ensurePermission);
    }, [enabled, ensurePermission]);
};

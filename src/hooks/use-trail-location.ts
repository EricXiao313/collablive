import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

type PositionSample = {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    timestamp: number;
};

type Phase = 'waiting' | 'denied' | 'disabled' | 'error';

const MAX_ACCURACY = 50;
const MAX_AGE = 30000;

export function useTrailLocation(enabled: boolean) {
    const [sample, setSample] = useState<PositionSample | null>(null);
    const [phase, setPhase] = useState<Phase>('waiting');
    const [timedOut, setTimedOut] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [attempt, setAttempt] = useState(0);

    const [foreground, setForeground] = useState(
        AppState.currentState === 'active'
    );

    useEffect(() => {
        const listener = AppState.addEventListener('change', (state) => {
            setForeground(state === 'active');
        });

        return () => listener.remove();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!enabled || !foreground) return;

            let active = true;
            let subscription: Location.LocationSubscription | undefined;

            setSample(null);
            setPhase('waiting');
            setTimedOut(false);
            setNow(Date.now());

            const clock = setInterval(() => {
                if (active) setNow(Date.now());
            }, 3000);

            const timeout = setTimeout(() => {
                if (active) setTimedOut(true);
            }, 15000);

            async function startLocation() {
                try {
                    const permission =
                        await Location.requestForegroundPermissionsAsync();

                    if (!active) return;

                    if (permission.status !== 'granted') {
                        setPhase('denied');
                        return;
                    }

                    const servicesEnabled =
                        await Location.hasServicesEnabledAsync();

                    if (!active) return;

                    if (!servicesEnabled) {
                        setPhase('disabled');
                        return;
                    }

                    const watcher = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.High,
                            distanceInterval: 0,
                            timeInterval: 3000,
                        },
                        (result) => {
                            if (!active) return;

                            clearTimeout(timeout);
                            setNow(Date.now());

                            setSample({
                                latitude: result.coords.latitude,
                                longitude: result.coords.longitude,
                                accuracy: result.coords.accuracy,
                                timestamp: result.timestamp,
                            });
                        }
                    );

                    if (active) {
                        subscription = watcher;
                    } else {
                        watcher.remove();
                    }
                } catch {
                    if (active) {
                        setSample(null);
                        setPhase('error');
                    }
                }
            }

            void startLocation();

            return () => {
                active = false;
                clearInterval(clock);
                clearTimeout(timeout);
                subscription?.remove();
            };
        }, [enabled, foreground, attempt])
    );

    const age = sample
        ? Math.max(0, now - sample.timestamp)
        : Infinity;

    const fresh = sample !== null && age <= MAX_AGE;

    const accurate =
        sample !== null &&
        sample.accuracy !== null &&
        sample.accuracy >= 0 &&
        sample.accuracy <= MAX_ACCURACY;

    const canUnlock =
        enabled &&
        foreground &&
        phase === 'waiting' &&
        fresh &&
        accurate;

    const position =
        enabled && foreground && phase === 'waiting' && fresh && sample
            ? {
                latitude: sample.latitude,
                longitude: sample.longitude,
            }
            : null;

    let message = '';

    if (enabled) {
        if (!foreground) {
            message =
                'Location is paused while the app is in the background.';
        } else if (phase === 'denied') {
            message =
                'Location permission is denied. Open Settings to allow location for Expo Go, or use simulation.';
        } else if (phase === 'disabled') {
            message =
                'Location services are off. Enable them in iPhone Settings, or use simulation.';
        } else if (phase === 'error') {
            message =
                'Unable to read your location. Retry or use simulation.';
        } else if (!sample) {
            message = timedOut
                ? 'GPS is taking longer than expected. Try an open area, retry, or use simulation.'
                : 'Waiting for your GPS position...';
        } else if (!fresh) {
            message =
                'Your position has not updated for over 30 seconds. New slides are paused until a fresh position arrives.';
        } else if (!accurate) {
            message =
                sample.accuracy === null || sample.accuracy < 0
                    ? 'GPS accuracy is unavailable. New slides are paused. Retry or use simulation.'
                    : `Estimated GPS error: ${Math.round(
                        sample.accuracy
                    )} m. An estimate of 50 m or better is needed. Try an open area or enable Precise Location for Expo Go.`;
        } else {
            message = `Live GPS active. Estimated error: ${Math.round(
                sample.accuracy ?? 0
            )} m.`;
        }
    }

    function retry() {
        setSample(null);
        setPhase('waiting');
        setAttempt((previous) => previous + 1);
    }

    return {
        position,
        canUnlock,
        message,
        retry,
    };
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

type Mode = 'demo' | 'live';

type Progress = {
    demo: string[];
    live: string[];
};

const STORAGE_KEY = 'collablive-campus-progress-v1';

export function useTrailProgress(mode: Mode, stopIds: string[]) {
    const [progress, setProgress] = useState<Progress>({
        demo: [],
        live: [],
    });

    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [reloadCount, setReloadCount] = useState(0);

    const progressRef = useRef<Progress>({
        demo: [],
        live: [],
    });

    const busyRef = useRef(false);

    // Read the latest saved progress whenever this screen gains focus.
    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadProgress() {
                setLoaded(false);
                setError('');

                try {
                    const stored = await AsyncStorage.getItem(STORAGE_KEY);

                    let result: Progress = {
                        demo: [],
                        live: [],
                    };

                    if (stored !== null) {
                        const parsed = JSON.parse(stored);

                        if (
                            !parsed ||
                            !Array.isArray(parsed.demo) ||
                            !Array.isArray(parsed.live)
                        ) {
                            throw new Error('Invalid saved progress');
                        }

                        function cleanIds(values: unknown[]) {
                            return stopIds.filter((id) => values.includes(id));
                        }

                        result = {
                            demo: cleanIds(parsed.demo),
                            live: cleanIds(parsed.live),
                        };
                    }

                    if (!active) return;

                    progressRef.current = result;
                    setProgress(result);
                    setLoaded(true);
                } catch {
                    if (active) {
                        setError(
                            'Could not load saved progress. Tap Retry loading. You can still explore the map.'
                        );
                    }
                }
            }

            void loadProgress();

            return () => {
                active = false;
            };
        }, [stopIds, reloadCount])
    );

    async function saveProgress(next: Progress) {
        if (!loaded || busyRef.current) return;

        busyRef.current = true;
        setSaving(true);
        setError('');

        try {
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(next)
            );

            progressRef.current = next;
            setProgress(next);
        } catch {
            setError(
                'Could not save progress. Your previous progress is unchanged. Please try the action again.'
            );
        } finally {
            busyRef.current = false;
            setSaving(false);
        }
    }

    function markCompleted(id: string) {
        const current = progressRef.current;

        if (
            !stopIds.includes(id) ||
            current[mode].includes(id)
        ) {
            return;
        }

        void saveProgress({
            ...current,
            [mode]: [...current[mode], id],
        });
    }

    function resetProgress() {
        void saveProgress({
            ...progressRef.current,
            [mode]: [],
        });
    }

    function retryLoading() {
        setReloadCount((previous) => previous + 1);
    }

    return {
        completedIds: progress[mode],
        progressByMode: progress,
        loaded,
        saving,
        error,
        markCompleted,
        resetProgress,
        retryLoading,
    };
}
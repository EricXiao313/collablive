import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NetworkNotice() {
    const [offline, setOffline] = useState(false);

    useEffect(() => {
        let active = true;

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!active) return;

            setOffline(
                state.isConnected === false ||
                state.isInternetReachable === false
            );
        });

        // Recheck after returning from Settings or Control Centre.
        const appStateSubscription = AppState.addEventListener(
            'change',
            (state) => {
                if (state !== 'active') return;

                NetInfo.fetch()
                    .then((network) => {
                        if (!active) return;

                        setOffline(
                            network.isConnected === false ||
                            network.isInternetReachable === false
                        );
                    })
                    .catch(() => {
                        // Keep the last known status if the check fails.
                    });
            }
        );

        return () => {
            active = false;
            unsubscribe();
            appStateSubscription.remove();
        };
    }, []);

    if (!offline) return null;

    return (
        <SafeAreaView
            edges={['bottom']}
            style={styles.notice}
            accessibilityRole="alert"
        >
            <Text style={styles.title}>You are offline</Text>

            <Text style={styles.message}>
                Map tiles may be unavailable. You can still use simulation,
                read available slides and save your progress on this device.
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    notice: {
        backgroundColor: '#FFF4D6',
        borderTopWidth: 1,
        borderTopColor: '#E8D39A',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 4,
    },
    title: {
        color: '#775400',
        fontSize: 15,
        fontWeight: '700',
    },
    message: {
        color: '#775400',
        fontSize: 13,
        lineHeight: 19,
    },
});
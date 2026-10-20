import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTrailProgress } from '../hooks/use-trail-progress';

type Coordinate = {
    latitude: number;
    longitude: number;
};

const UNLOCK_RADIUS = 80;

// Demo positions: verify exact locations before real-world testing.
const stops = [
    {
        id: 'great-court',
        title: 'Great Court',
        coordinate: {
            latitude: -27.4975,
            longitude: 153.0137,
        },
        slideTitle: 'A place to connect',
        content:
            'A university is more than its classrooms. Shared outdoor spaces give people a place to meet, exchange ideas and take a break.\n\nActivity: Look around and identify one feature that encourages people to spend time together.',
    },
    {
        id: 'library',
        title: 'Duhig Tower',
        coordinate: {
            latitude: -27.4959,
            longitude: 153.0154,
        },
        slideTitle: 'Learning beyond lectures',
        content:
            'Independent learning includes finding information, comparing sources and discussing ideas with others.\n\nActivity: Think of one question from your current course. What kind of source would help you investigate it?',
    },
    {
        id: 'lakes',
        title: 'UQ Lakes',
        coordinate: {
            latitude: -27.5005,
            longitude: 153.0176,
        },
        slideTitle: 'Learning from our surroundings',
        content:
            'Observation is a useful learning skill. Outdoor environments offer opportunities to notice patterns, ask questions and connect ideas to the world around us.\n\nActivity: Identify one interaction between people and the outdoor environment.',
    },
];

type Stop = (typeof stops)[number];

const STOP_IDS = stops.map((stop) => stop.id);

const outsidePosition: Coordinate = {
    latitude: -27.505,
    longitude: 153.012,
};

// Haversine formula: straight-line distance in metres.
function getDistance(from: Coordinate, to: Coordinate) {
    const toRadians = (value: number) => (value * Math.PI) / 180;

    const latitudeDifference = toRadians(to.latitude - from.latitude);
    const longitudeDifference = toRadians(to.longitude - from.longitude);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(from.latitude)) *
        Math.cos(toRadians(to.latitude)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

function formatDistance(distance: number) {
    return distance < 1000
        ? `${Math.round(distance)} m`
        : `${(distance / 1000).toFixed(2)} km`;
}

export default function TrailScreen() {
    const mapRef = useRef<MapView>(null);

    const [mode, setMode] = useState<'demo' | 'live'>('demo');

    const [demoPosition, setDemoPosition] =
        useState<Coordinate>(outsidePosition);

    const [livePosition, setLivePosition] =
        useState<Coordinate | null>(null);

    const [locationMessage, setLocationMessage] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [selectedId, setSelectedId] = useState(stops[0].id);
    const [openedId, setOpenedId] = useState<string | null>(null);

    const position = mode === 'demo' ? demoPosition : livePosition;

    const {
        completedIds,
        loaded,
        saving,
        error,
        markCompleted,
        resetProgress,
        retryLoading,
    } = useTrailProgress(mode, STOP_IDS);

    const completedCount = completedIds.length;

    const progressPercent = Math.round(
        (completedCount / stops.length) * 100
    );

    useEffect(() => {
        if (mode !== 'live') return;

        let active = true;
        let subscription: Location.LocationSubscription | undefined;

        async function startLocation() {
            setLocationMessage('Requesting location permission...');

            try {
                const permission =
                    await Location.requestForegroundPermissionsAsync();

                if (!active) return;

                if (permission.status !== 'granted') {
                    setLocationMessage(
                        'Location permission was denied. Use simulation, or enable location for Expo Go in iPhone Settings and retry.'
                    );
                    return;
                }

                const enabled = await Location.hasServicesEnabledAsync();

                if (!active) return;

                if (!enabled) {
                    setLocationMessage(
                        'Location services are off. Enable them in Settings, or use simulation.'
                    );
                    return;
                }

                setLocationMessage(
                    'Waiting for a GPS position. You can use simulation if no position arrives.'
                );

                const watcher = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        distanceInterval: 5,
                        timeInterval: 3000,
                    },
                    (result) => {
                        if (!active) return;

                        setLivePosition({
                            latitude: result.coords.latitude,
                            longitude: result.coords.longitude,
                        });

                        const accuracy = result.coords.accuracy;

                        setLocationMessage(
                            accuracy == null
                                ? 'Live location is active.'
                                : `Live location active. Estimated GPS accuracy: ${Math.round(
                                    accuracy
                                )} m.`
                        );
                    }
                );

                if (active) {
                    subscription = watcher;
                } else {
                    watcher.remove();
                }
            } catch {
                if (active) {
                    setLocationMessage(
                        'Unable to read your location. Retry or use simulation.'
                    );
                }
            }
        }

        void startLocation();

        return () => {
            active = false;
            subscription?.remove();
        };
    }, [mode, attempt]);

    function selectStop(stop: Stop) {
        setSelectedId(stop.id);

        mapRef.current?.animateToRegion(
            {
                ...stop.coordinate,
                latitudeDelta: 0.003,
                longitudeDelta: 0.003,
            },
            500
        );
    }

    function showAllStops() {
        mapRef.current?.fitToCoordinates(
            stops.map((stop) => stop.coordinate),
            {
                edgePadding: {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50,
                },
                animated: true,
            }
        );
    }

    function startLiveLocation() {
        setOpenedId(null);
        setLivePosition(null);
        setMode('live');
        setAttempt((previous) => previous + 1);
    }

    function simulatePosition(coordinate: Coordinate) {
        setOpenedId(null);
        setMode('demo');
        setDemoPosition(coordinate);
    }

    function confirmReset() {
        Alert.alert(
            'Reset progress?',
            `This clears only your ${mode === 'demo' ? 'simulation' : 'live trail'
            } progress.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setOpenedId(null);
                        resetProgress();
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.screen} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>CAMPUS DISCOVERY</Text>

                <Text style={styles.title}>Explore your trail</Text>

                {/* Saved learning progress */}
                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>
                        {mode === 'demo'
                            ? 'Simulation progress'
                            : 'Live trail progress'}
                    </Text>

                    <Text style={styles.description}>
                        {loaded
                            ? `${completedCount} / ${stops.length} stops completed · ${progressPercent}%`
                            : error
                                ? 'Saved progress is unavailable.'
                                : 'Loading saved progress...'}
                    </Text>

                    {loaded && completedCount === stops.length ? (
                        <Text style={styles.available}>
                            Trail complete! You have finished all three learning stops.
                        </Text>
                    ) : null}

                    <Text style={styles.description}>
                        {mode === 'demo'
                            ? 'Simulation progress is saved separately from your real visits.'
                            : 'Your real trail progress is saved on this device.'}
                    </Text>

                    {saving ? (
                        <Text style={styles.description}>Saving progress...</Text>
                    ) : null}

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {!loaded && error ? (
                        <Pressable
                            accessibilityRole="button"
                            style={styles.smallButton}
                            onPress={retryLoading}
                        >
                            <Text style={styles.smallButtonText}>Retry loading</Text>
                        </Pressable>
                    ) : null}

                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{
                            disabled: !loaded || saving || completedCount === 0,
                        }}
                        disabled={!loaded || saving || completedCount === 0}
                        style={[
                            styles.smallButton,
                            (!loaded || saving || completedCount === 0) &&
                            styles.disabled,
                        ]}
                        onPress={confirmReset}
                    >
                        <Text style={styles.smallButtonText}>
                            Reset this mode's progress
                        </Text>
                    </Pressable>
                </View>

                {/* Location mode and simulation controls */}
                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>
                        {mode === 'demo' ? 'Simulation mode' : 'Live GPS mode'}
                    </Text>

                    <Text style={styles.description}>
                        Location is used to calculate your distance from each stop
                        and open its slide within {UNLOCK_RADIUS} metres. You can
                        also test using simulated positions.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        style={styles.button}
                        onPress={startLiveLocation}
                    >
                        <Text style={styles.buttonText}>
                            {mode === 'live'
                                ? 'Retry live location'
                                : 'Use my location'}
                        </Text>
                    </Pressable>

                    {mode === 'live' ? (
                        <Text style={styles.description}>{locationMessage}</Text>
                    ) : (
                        <Text style={styles.description}>
                            Your displayed position is simulated, not your real GPS.
                        </Text>
                    )}

                    <Text style={styles.panelTitle}>
                        Test without travelling
                    </Text>

                    <View style={styles.controls}>
                        <Pressable
                            accessibilityRole="button"
                            style={styles.smallButton}
                            onPress={() => {
                                simulatePosition(outsidePosition);
                                showAllStops();
                            }}
                        >
                            <Text style={styles.smallButtonText}>
                                Outside all stops
                            </Text>
                        </Pressable>

                        {stops.map((stop, index) => (
                            <Pressable
                                key={stop.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Simulate arrival at ${stop.title}`}
                                style={styles.smallButton}
                                onPress={() => {
                                    simulatePosition(stop.coordinate);
                                    selectStop(stop);
                                }}
                            >
                                <Text style={styles.smallButtonText}>
                                    At stop {index + 1}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Map and unlock areas */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: -27.4982,
                            longitude: 153.0155,
                            latitudeDelta: 0.012,
                            longitudeDelta: 0.012,
                        }}
                        onMapReady={showAllStops}
                    >
                        {stops.map((stop) => (
                            <Circle
                                key={`circle-${stop.id}`}
                                center={stop.coordinate}
                                radius={UNLOCK_RADIUS}
                                strokeColor="#2456A6"
                                fillColor="rgba(36, 86, 166, 0.12)"
                            />
                        ))}

                        {stops.map((stop, index) => (
                            <Marker
                                key={stop.id}
                                coordinate={stop.coordinate}
                                title={`${index + 1}. ${stop.title}`}
                                pinColor={
                                    selectedId === stop.id ? '#2456A6' : '#D65A38'
                                }
                                onPress={() => selectStop(stop)}
                            />
                        ))}

                        {position ? (
                            <Marker
                                key={mode}
                                coordinate={position}
                                title={
                                    mode === 'demo'
                                        ? 'Simulated position'
                                        : 'Your GPS position'
                                }
                                pinColor="#14804A"
                            />
                        ) : null}
                    </MapView>
                </View>

                <View style={styles.controls}>
                    <Pressable
                        accessibilityRole="button"
                        style={styles.smallButton}
                        onPress={showAllStops}
                    >
                        <Text style={styles.smallButtonText}>
                            Show all stops
                        </Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !position }}
                        disabled={!position}
                        style={[
                            styles.smallButton,
                            !position && styles.disabled,
                        ]}
                        onPress={() => {
                            if (!position) return;

                            mapRef.current?.animateToRegion({
                                ...position,
                                latitudeDelta: 0.006,
                                longitudeDelta: 0.006,
                            });
                        }}
                    >
                        <Text style={styles.smallButtonText}>
                            Show my position
                        </Text>
                    </Pressable>
                </View>

                {/* Learning stops */}
                {stops.map((stop, index) => {
                    const distance = position
                        ? getDistance(position, stop.coordinate)
                        : null;

                    const isCompleted =
                        loaded && completedIds.includes(stop.id);

                    const isNearby =
                        distance !== null && distance <= UNLOCK_RADIUS;

                    const canRead = isNearby || isCompleted;
                    const isOpen = openedId === stop.id && canRead;

                    return (
                        <View
                            key={stop.id}
                            style={[
                                styles.panel,
                                selectedId === stop.id && styles.selectedPanel,
                            ]}
                        >
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Show ${stop.title} on the map`}
                                onPress={() => selectStop(stop)}
                            >
                                <Text style={styles.stopTitle}>
                                    {index + 1}. {stop.title}
                                </Text>

                                <Text style={styles.description}>
                                    Tap to locate on map
                                </Text>
                            </Pressable>

                            <Text style={styles.distance}>
                                {distance === null
                                    ? 'Distance unavailable'
                                    : `${formatDistance(
                                        distance
                                    )} away · straight-line distance`}
                            </Text>

                            <Text
                                style={
                                    canRead ? styles.available : styles.description
                                }
                            >
                                {isCompleted
                                    ? 'Completed — available for review.'
                                    : isNearby
                                        ? 'Available — you are within 80 m.'
                                        : 'Locked — move within 80 m to read.'}
                            </Text>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ disabled: !canRead }}
                                disabled={!canRead}
                                style={[
                                    styles.button,
                                    !canRead && styles.disabled,
                                ]}
                                onPress={() =>
                                    setOpenedId(isOpen ? null : stop.id)
                                }
                            >
                                <Text style={styles.buttonText}>
                                    {canRead
                                        ? isOpen
                                            ? 'Close slide'
                                            : 'Read slide'
                                        : 'Slide locked'}
                                </Text>
                            </Pressable>

                            {isOpen ? (
                                <View style={styles.slide}>
                                    <Text style={styles.stopTitle}>
                                        {stop.slideTitle}
                                    </Text>

                                    <Text style={styles.slideText}>
                                        {stop.content}
                                    </Text>

                                    {isCompleted ? (
                                        <Text style={styles.available}>
                                            You have completed this learning stop.
                                        </Text>
                                    ) : (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityState={{
                                                disabled: !loaded || saving || !isNearby,
                                            }}
                                            disabled={!loaded || saving || !isNearby}
                                            style={[
                                                styles.button,
                                                (!loaded || saving || !isNearby) &&
                                                styles.disabled,
                                            ]}
                                            onPress={() => markCompleted(stop.id)}
                                        >
                                            <Text style={styles.buttonText}>
                                                {saving
                                                    ? 'Saving...'
                                                    : 'Mark as completed'}
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            ) : null}
                        </View>
                    );
                })}

                <Text style={styles.description}>
                    Stop positions are approximate demo coordinates.
                    Completed slides remain available for review.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F5F7FB',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
        gap: 16,
    },
    label: {
        color: '#2456A6',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#17243B',
    },
    panel: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        gap: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    selectedPanel: {
        borderColor: '#2456A6',
    },
    panelTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#17243B',
    },
    description: {
        fontSize: 14,
        lineHeight: 21,
        color: '#627087',
    },
    errorText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#B42318',
    },
    controls: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    button: {
        backgroundColor: '#2456A6',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    smallButton: {
        backgroundColor: '#EAF1FF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 13,
    },
    smallButtonText: {
        color: '#2456A6',
        fontSize: 13,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.45,
    },
    mapContainer: {
        height: 280,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#E2E8F0',
    },
    map: {
        flex: 1,
    },
    stopTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#17243B',
    },
    distance: {
        color: '#2456A6',
        fontSize: 14,
        fontWeight: '600',
    },
    available: {
        color: '#14804A',
        fontSize: 14,
        fontWeight: '600',
    },
    slide: {
        backgroundColor: '#F0F5FF',
        borderRadius: 14,
        padding: 18,
        gap: 12,
    },
    slideText: {
        fontSize: 16,
        lineHeight: 25,
        color: '#43516A',
    },
});
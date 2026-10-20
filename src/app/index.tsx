import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTrailProgress } from '../hooks/use-trail-progress';

const STOP_IDS = ['great-court', 'library', 'lakes'];

export default function HomeScreen() {
  const {
    progressByMode,
    loaded,
    error,
    retryLoading,
  } = useTrailProgress('demo', STOP_IDS);

  const demoCount = progressByMode.demo.length;
  const liveCount = progressByMode.live.length;
  const totalStops = STOP_IDS.length;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>CollabLive</Text>

        <Text style={styles.subtitle}>
          Learn beyond the classroom.
        </Text>

        <View style={styles.hero}>
          <Text style={styles.label}>PRESENTATION TRAIL</Text>

          <Text style={styles.heroTitle}>
            Turn a walk into a lesson.
          </Text>

          <Text style={styles.heroText}>
            Explore campus, discover learning stops and unlock
            slides when you arrive.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your progress</Text>

        <View style={styles.card}>
          {loaded ? (
            <>
              <View style={styles.progressRow}>
                <View style={styles.progressDetails}>
                  <Text style={styles.progressTitle}>
                    Live trail
                  </Text>

                  <Text style={styles.description}>
                    {liveCount === totalStops
                      ? 'Completed'
                      : liveCount === 0
                        ? 'Ready for your first visit'
                        : 'Keep exploring'}
                  </Text>
                </View>

                <Text style={styles.progressCount}>
                  {liveCount} / {totalStops}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.progressRow}>
                <View style={styles.progressDetails}>
                  <Text style={styles.progressTitle}>
                    Simulation
                  </Text>

                  <Text style={styles.description}>
                    {demoCount === totalStops
                      ? 'Completed'
                      : demoCount === 0
                        ? 'Try the trail from anywhere'
                        : 'Continue your practice trail'}
                  </Text>
                </View>

                <Text style={styles.progressCount}>
                  {demoCount} / {totalStops}
                </Text>
              </View>

              <Text style={styles.note}>
                Practice and real visits have separate progress.
                Completed slides stay available for review.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                {error
                  ? 'Your saved progress could not be loaded.'
                  : 'Loading your progress...'}
              </Text>

              {error ? (
                <Pressable
                  accessibilityRole="button"
                  style={styles.secondaryButton}
                  onPress={retryLoading}
                >
                  <Text style={styles.secondaryButtonText}>
                    Retry loading
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Choose your trail
        </Text>

        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              UQ ST LUCIA
            </Text>
          </View>

          <Text style={styles.cardTitle}>
            Campus Discovery
          </Text>

          <Text style={styles.description}>
            Explore three learning stops inspired by campus
            spaces. Read each slide, try its activity and mark
            the stop as completed.
          </Text>

          <Text style={styles.metadata}>
            3 learning stops · 80 m unlock radius
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/trail')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              View trail
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          How it works
        </Text>

        <View style={styles.card}>
          <Text style={styles.step}>
            1. Open the trail and explore the map.
          </Text>

          <Text style={styles.step}>
            2. Use your location or try simulation mode.
          </Text>

          <Text style={styles.step}>
            3. Get within 80 metres to read a new slide.
          </Text>

          <Text style={styles.step}>
            4. Complete its activity and save your progress.
          </Text>
        </View>

        <Text style={styles.note}>
          Current stops use approximate demo positions.
          Simulation lets you try every stop without travelling.
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
    gap: 12,
  },
  brand: {
    fontSize: 30,
    fontWeight: '800',
    color: '#17243B',
  },
  subtitle: {
    fontSize: 16,
    color: '#627087',
    marginBottom: 12,
  },
  hero: {
    backgroundColor: '#183D75',
    borderRadius: 24,
    padding: 24,
    gap: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#BCD5FF',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#DFE9FA',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#17243B',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressDetails: {
    flex: 1,
    gap: 5,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#17243B',
  },
  progressCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2456A6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF1FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeText: {
    color: '#2456A6',
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#17243B',
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#627087',
  },
  metadata: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2456A6',
  },
  button: {
    backgroundColor: '#2456A6',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#EAF1FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2456A6',
    fontSize: 15,
    fontWeight: '700',
  },
  step: {
    fontSize: 16,
    lineHeight: 24,
    color: '#43516A',
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    color: '#627087',
  },
});
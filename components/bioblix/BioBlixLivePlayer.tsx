import { useAuth, useUser } from '@clerk/expo';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { signInHref } from '@/lib/auth/signInGate';
import { useI18n } from '@/lib/i18n';
import { watchLiveSession } from '@/lib/live/api';
import { isWeb } from '@/lib/platform';
import type { LiveSession } from '@/types';

type BioBlixLivePlayerProps = {
  live: LiveSession;
  /** When false, disconnect to save bandwidth. */
  active?: boolean;
  height?: number;
};

/**
 * Web viewer for a LiveKit room (subscribe-only).
 */
export function BioBlixLivePlayer({
  live,
  active = true,
  height,
}: BioBlixLivePlayerProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<import('livekit-client').Room | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !isWeb) {
      return;
    }
    if (!isSignedIn) {
      setStatus('error');
      setError(t('auth.reason.watchLive'));
      return;
    }

    let cancelled = false;

    async function connect() {
      setStatus('connecting');
      setError(null);
      try {
        const session = await watchLiveSession({
          getClerkToken: () => getToken(),
          liveId: live.id,
          displayName:
            user?.fullName ??
            user?.username ??
            user?.primaryEmailAddress?.emailAddress ??
            undefined,
        });
        if (cancelled) return;

        const { Room, RoomEvent, Track } = await import('livekit-client');
        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        const attach = (
          track: import('livekit-client').RemoteTrack | import('livekit-client').LocalTrack
        ) => {
          if (track.kind === Track.Kind.Video && videoRef.current) {
            track.attach(videoRef.current);
          }
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach();
            el.play().catch(() => undefined);
          }
        };

        room.on(RoomEvent.TrackSubscribed, (track) => {
          attach(track);
        });

        await room.connect(session.url, session.token);
        if (cancelled) {
          await room.disconnect();
          return;
        }

        for (const participant of room.remoteParticipants.values()) {
          for (const pub of participant.trackPublications.values()) {
            if (pub.track) attach(pub.track);
          }
        }

        setStatus('live');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(
          err instanceof Error ? err.message : t('live.watchFail')
        );
      }
    }

    void connect();

    return () => {
      cancelled = true;
      const room = roomRef.current;
      roomRef.current = null;
      if (room) {
        void room.disconnect();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [
    active,
    getToken,
    isSignedIn,
    live.id,
    t,
    user?.fullName,
    user?.primaryEmailAddress?.emailAddress,
    user?.username,
  ]);

  return (
    <View style={[styles.root, height ? { height } : null]}>
      {Platform.OS === 'web' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={webVideoStyle}
        />
      ) : null}

      <View style={styles.livePill} pointerEvents="none">
        <BioBlixText variant="caption" color={Colors.ink}>
          {t('live.badge')}
        </BioBlixText>
      </View>

      <View style={styles.meta} pointerEvents="none">
        <BioBlixText variant="title" color={Colors.white} numberOfLines={2}>
          {live.title}
        </BioBlixText>
        <BioBlixText variant="caption" color={Colors.mistDim}>
          {live.hostDisplayName}
        </BioBlixText>
      </View>

      {status === 'connecting' || status === 'idle' ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} />
          <BioBlixText variant="caption" color={Colors.mistDim}>
            {t('live.connecting')}
          </BioBlixText>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.center}>
          <BioBlixText variant="body" color={Colors.mistDim} style={styles.err}>
            {error ?? t('live.watchFail')}
          </BioBlixText>
          {!isSignedIn ? (
            <Pressable
              style={styles.signInBtn}
              onPress={() => router.push(signInHref('watchLive') as Href)}
            >
              <BioBlixText variant="label" color={Colors.ink}>
                {t('auth.createFreeProfile')}
              </BioBlixText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!isWeb ? (
        <View style={styles.center}>
          <BioBlixText variant="body" color={Colors.mistDim} style={styles.err}>
            {t('live.webOnlyBody')}
          </BioBlixText>
        </View>
      ) : null}
    </View>
  );
}

const webVideoStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  backgroundColor: '#050B12',
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flex: 1,
    minHeight: 280,
    backgroundColor: BioBlixPalette.night,
    overflow: 'hidden',
    position: 'relative',
  },
  livePill: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 4,
    backgroundColor: BioBlixPalette.magenta,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  meta: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    zIndex: 4,
    gap: 4,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(5,11,18,0.35)',
    zIndex: 3,
  },
  err: {
    textAlign: 'center',
    maxWidth: 280,
    paddingHorizontal: 16,
  },
  signInBtn: {
    marginTop: 12,
    backgroundColor: Colors.lime,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

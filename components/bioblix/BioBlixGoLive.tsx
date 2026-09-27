import { useAuth, useUser } from '@clerk/expo';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';
import { endLiveSession, startLiveSession } from '@/lib/live/api';
import {
  LIVE_NSFW_INTERVAL_MS,
  NSFW_REJECT_CODE,
  assertLiveVideoFrameAllowed,
} from '@/lib/moderation/nsfw';
import { isWeb, notify } from '@/lib/platform';

type Phase = 'idle' | 'starting' | 'live' | 'ending';

/**
 * Web-only host publisher: camera + mic via LiveKit.
 * Periodically samples frames for NSFW and ends the live if blocked.
 */
export function BioBlixGoLive({ onEnded }: { onEnded?: () => void }) {
  const { t } = useI18n();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [liveId, setLiveId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<import('livekit-client').Room | null>(null);
  const localTracksRef = useRef<import('livekit-client').LocalTrack[]>([]);
  const liveIdRef = useRef<string | null>(null);
  const endingRef = useRef(false);
  const phaseRef = useRef<Phase>('idle');
  const livekitRef = useRef<typeof import('livekit-client') | null>(null);

  // Preload LiveKit so getUserMedia can run in the same user-gesture turn on iOS.
  useEffect(() => {
    if (!isWeb) return;
    void import('livekit-client')
      .then((mod) => {
        livekitRef.current = mod;
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    liveIdRef.current = liveId;
  }, [liveId]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const cleanup = useCallback(async () => {
    for (const track of localTracksRef.current) {
      try {
        track.stop();
      } catch {
        /* ignore */
      }
    }
    localTracksRef.current = [];
    const room = roomRef.current;
    roomRef.current = null;
    if (room) {
      try {
        await room.disconnect();
      } catch {
        /* ignore */
      }
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      void cleanup();
    };
  }, [cleanup]);

  const endLiveInternal = useCallback(
    async (opts?: { nsfw?: boolean }) => {
      if (endingRef.current) return;
      endingRef.current = true;
      const id = liveIdRef.current;
      setPhase('ending');
      try {
        if (id) {
          await endLiveSession({
            getClerkToken: () => getToken(),
            liveId: id,
          });
        }
      } catch (err) {
        if (!opts?.nsfw) {
          notify(
            t('common.error'),
            err instanceof Error ? err.message : t('common.error')
          );
        }
      } finally {
        await cleanup();
        setLiveId(null);
        liveIdRef.current = null;
        setPhase('idle');
        endingRef.current = false;
        if (opts?.nsfw) {
          notify(t('live.nsfwEnded'), t('live.nsfwEndedBody'));
        }
        onEnded?.();
      }
    },
    [cleanup, getToken, onEnded, t]
  );

  /** Periodic NSFW frame scan while hosting. */
  useEffect(() => {
    if (phase !== 'live' || !isWeb) return;

    let cancelled = false;
    let busy = false;

    const tick = async () => {
      if (cancelled || busy || endingRef.current) return;
      if (phaseRef.current !== 'live') return;
      const video = videoRef.current;
      if (!video) return;
      busy = true;
      try {
        await assertLiveVideoFrameAllowed(video);
      } catch (err) {
        const code = err instanceof Error ? err.message : '';
        if (code === NSFW_REJECT_CODE) {
          await endLiveInternal({ nsfw: true });
        }
        // MODERATION_CHECK_FAIL / model load issues: skip tick, keep streaming
      } finally {
        busy = false;
      }
    };

    // First check shortly after going live, then on interval.
    const first = setTimeout(() => void tick(), 1500);
    const interval = setInterval(() => void tick(), LIVE_NSFW_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [phase, endLiveInternal]);

  const onStart = useCallback(async () => {
    if (!isWeb) {
      notify(t('live.webOnly'), t('live.webOnlyBody'));
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      notify(t('live.startFail'), t('live.cameraDenied'));
      return;
    }

    // In-app browsers (Instagram/Google/Facebook) block camera on iOS.
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isInApp =
      /(FBAN|FBAV|Instagram|Line\/|Twitter|GSA\/|GoogleApp)/i.test(ua) ||
      (isIOS && !/Safari/i.test(ua));
    if (isInApp) {
      notify(t('live.startFail'), t('live.openInSafari'));
      return;
    }

    endingRef.current = false;

    // CRITICAL on iOS: getUserMedia must be the first await in the tap handler.
    // No setState / dynamic import before this, or Safari kills the user gesture.
    let mediaStream: MediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'user' },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        /NotAllowedError|not allowed|permission|denied|SecurityError/i.test(msg) ||
        (typeof DOMException !== 'undefined' &&
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'SecurityError'))
      ) {
        notify(t('live.startFail'), t('live.cameraDenied'));
        return;
      }
      notify(t('live.startFail'), msg);
      return;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      void videoRef.current.play().catch(() => undefined);
    }

    setPhase('starting');

    try {
      const livekit = livekitRef.current ?? (await import('livekit-client'));
      livekitRef.current = livekit;
      const { Room, LocalAudioTrack, LocalVideoTrack, Track } = livekit;

      const tracks: import('livekit-client').LocalTrack[] = [];
      for (const mediaTrack of mediaStream.getAudioTracks()) {
        tracks.push(new LocalAudioTrack(mediaTrack, undefined, true));
      }
      for (const mediaTrack of mediaStream.getVideoTracks()) {
        tracks.push(new LocalVideoTrack(mediaTrack, undefined, true));
      }
      localTracksRef.current = tracks;

      for (const track of tracks) {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          track.attach(videoRef.current);
        }
      }

      const displayName =
        user?.fullName ??
        user?.username ??
        user?.primaryEmailAddress?.emailAddress ??
        undefined;
      const session = await startLiveSession({
        getClerkToken: () => getToken(),
        title: title.trim() || t('live.title'),
        displayName,
      });

      if (
        typeof session.token !== 'string' ||
        session.token.split('.').length !== 3
      ) {
        throw new Error(
          'Server returned a bad LiveKit token — check LIVEKIT_API_KEY / LIVEKIT_API_SECRET on Vercel'
        );
      }
      if (!session.url?.startsWith('wss://') && !session.url?.startsWith('ws://')) {
        throw new Error(
          `Bad LiveKit URL from server: ${String(session.url).slice(0, 48)}`
        );
      }

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      try {
        await room.connect(session.url, session.token);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        throw new Error(
          `LiveKit connect failed (${detail}). Confirm LIVEKIT_URL matches the same project as API key/secret.`
        );
      }

      for (const track of tracks) {
        await room.localParticipant.publishTrack(track);
      }

      await new Promise((r) => setTimeout(r, 600));
      if (videoRef.current) {
        try {
          await assertLiveVideoFrameAllowed(videoRef.current);
        } catch (err) {
          const code = err instanceof Error ? err.message : '';
          if (code === NSFW_REJECT_CODE) {
            try {
              await endLiveSession({
                getClerkToken: () => getToken(),
                liveId: session.liveId,
              });
            } catch {
              /* ignore */
            }
            await cleanup();
            setPhase('idle');
            notify(t('live.nsfwEnded'), t('moderation.nsfw'));
            return;
          }
        }
      }

      liveIdRef.current = session.liveId;
      setLiveId(session.liveId);
      setPhase('live');
    } catch (err) {
      for (const track of mediaStream.getTracks()) {
        try {
          track.stop();
        } catch {
          /* ignore */
        }
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      await cleanup();
      setPhase('idle');
      setLiveId(null);
      liveIdRef.current = null;
      notify(
        t('live.startFail'),
        err instanceof Error ? err.message : t('live.startFail')
      );
    }
  }, [cleanup, getToken, t, title, user]);

  const onEnd = useCallback(async () => {
    await endLiveInternal();
  }, [endLiveInternal]);

  if (!isWeb) {
    return (
      <View style={styles.gate}>
        <BioBlixText variant="title">{t('live.webOnly')}</BioBlixText>
        <BioBlixText variant="body" color={Colors.mistDim} style={styles.gateBody}>
          {t('live.webOnlyBody')}
        </BioBlixText>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.preview}>
        {Platform.OS === 'web' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={webVideoStyle}
          />
        ) : null}
        {phase === 'live' ? (
          <View style={styles.livePill}>
            <BioBlixText variant="caption" color={Colors.ink}>
              {t('live.badge')}
            </BioBlixText>
          </View>
        ) : null}
        {(phase === 'starting' || phase === 'ending') && (
          <View style={styles.overlayCenter}>
            <ActivityIndicator color={Colors.lime} size="large" />
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {phase === 'starting' ? t('live.starting') : t('live.endLive')}
            </BioBlixText>
          </View>
        )}
      </View>

      {phase === 'idle' || phase === 'starting' ? (
        <View style={styles.form}>
          <BioBlixText variant="label" color={Colors.mistDim}>
            {t('live.title')}
          </BioBlixText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t('live.titlePlaceholder')}
            placeholderTextColor={Colors.mistDim}
            editable={phase === 'idle'}
            maxLength={80}
          />
          <Pressable
            style={[styles.cta, phase !== 'idle' && styles.ctaDisabled]}
            onPress={() => void onStart()}
            disabled={phase !== 'idle'}
          >
            <BioBlixText variant="label" color={Colors.ink}>
              {t('live.goLive')}
            </BioBlixText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <BioBlixText variant="title">{t('live.hosting')}</BioBlixText>
          <Pressable
            style={[styles.cta, styles.ctaDanger]}
            onPress={() => void onEnd()}
            disabled={phase === 'ending'}
          >
            <BioBlixText variant="label" color={Colors.white}>
              {t('live.endLive')}
            </BioBlixText>
          </Pressable>
        </View>
      )}
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
    flex: 1,
    gap: 12,
  },
  gate: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  gateBody: {
    maxWidth: 360,
  },
  preview: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 480,
    backgroundColor: BioBlixPalette.night,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  livePill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: BioBlixPalette.magenta,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overlayCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(5,11,18,0.45)',
  },
  form: {
    gap: 8,
    paddingHorizontal: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
  },
  cta: {
    backgroundColor: Colors.lime,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaDanger: {
    backgroundColor: BioBlixPalette.magenta,
  },
});

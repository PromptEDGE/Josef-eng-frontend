import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Circle, Square, Loader2, AlertCircle, Video, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MediaRecorderMode = 'video' | 'audio';

interface MediaRecorderModalProps {
  open: boolean;
  mode: MediaRecorderMode | null;
  onClose: () => void;
  onComplete: (files: File[]) => void;
}

const MIME_VIDEO = 'video/webm;codecs=vp9,opus';
const MIME_VIDEO_FALLBACK = 'video/webm';
const MIME_AUDIO = 'audio/webm;codecs=opus';
const MIME_AUDIO_FALLBACK = 'audio/webm';

function getVideoMime(): string {
  if (typeof MediaRecorder === 'undefined') return MIME_VIDEO_FALLBACK;
  if (MediaRecorder.isTypeSupported(MIME_VIDEO)) return MIME_VIDEO;
  return MIME_VIDEO_FALLBACK;
}

function getAudioMime(): string {
  if (typeof MediaRecorder === 'undefined') return MIME_AUDIO_FALLBACK;
  if (MediaRecorder.isTypeSupported(MIME_AUDIO)) return MIME_AUDIO;
  return MIME_AUDIO_FALLBACK;
}

export function MediaRecorderModal({
  open,
  mode,
  onClose,
  onComplete,
}: MediaRecorderModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const stopAllTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAllTracks();
    recorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setIsStarting(false);
    setStreamReady(false);
    setError(null);
    setRecordingTime(0);
  }, [stopAllTracks]);

  const handleClose = useCallback(() => {
    if (isRecording && recorderRef.current?.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    reset();
    onClose();
  }, [isRecording, reset, onClose]);

  useEffect(() => {
    if (!open || !mode) return;

    const timer =
      isRecording &&
      setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [open, mode, isRecording]);

  useEffect(() => {
    if (!open || !mode) {
      reset();
      return;
    }

    let mounted = true;
    setError(null);

    const constraints: MediaStreamConstraints =
      mode === 'video'
        ? { video: true, audio: true }
        : { audio: true };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (mode === 'video' && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamReady(true);
      })
      .catch((err) => {
        logger.error('MediaRecorderModal getUserMedia error', err);
        if (!mounted) return;
        const msg =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            ? 'Camera or microphone access was denied.'
            : err?.message ?? 'Could not access camera or microphone.';
        setError(msg);
      });

    return () => {
      mounted = false;
      stopAllTracks();
    };
  }, [open, mode, reset, stopAllTracks]);

  const startRecording = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream || !mode) return;

    setIsStarting(true);
    setError(null);
    chunksRef.current = [];

    const mime = mode === 'video' ? getVideoMime() : getAudioMime();
    const options: MediaRecorderOptions = { mimeType: mime };
    if (mode === 'video') options.videoBitsPerSecond = 2_500_000;

    try {
      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        const mimeType = recorder.mimeType || (mode === 'video' ? MIME_VIDEO_FALLBACK : MIME_AUDIO_FALLBACK);
        const blob = new Blob(chunks, { type: mimeType });
        const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
        const name = mode === 'video' ? `recorded-video-${Date.now()}.${ext}` : `recorded-audio-${Date.now()}.${ext}`;
        const file = new File([blob], name, { type: mimeType });
        onComplete([file]);
        reset();
        onClose();
      };

      recorder.onerror = (e) => {
        logger.error('MediaRecorder error', e);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        setIsStarting(false);
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      logger.error('MediaRecorder start error', err);
      setError(err instanceof Error ? err.message : 'Could not start recording.');
    } finally {
      setIsStarting(false);
    }
  }, [mode, onComplete, onClose, reset]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.state === 'inactive') return;
    rec.stop();
    setIsRecording(false);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!mode) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className={cn('sm:max-w-md', mode === 'video' && 'sm:max-w-xl')}
        onPointerDownOutside={(e) => isRecording && e.preventDefault()}
        onEscapeKeyDown={(e) => isRecording && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'video' ? <Video className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {mode === 'video' ? 'Record video' : 'Record audio'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'video'
              ? 'Allow camera and microphone, then start recording. Stop when done.'
              : 'Allow microphone access, then start recording. Stop when done.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {mode === 'video' && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {isRecording && (
              <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-xs text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                {formatTime(recordingTime)}
              </div>
            )}
          </div>
        )}

        {mode === 'audio' && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-muted px-4 py-8">
            {isRecording ? (
              <>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-1 animate-pulse rounded-full bg-primary"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{formatTime(recordingTime)}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click Start to begin recording.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isStarting}>
            Cancel
          </Button>
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={!!error || isStarting || !streamReady}
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Circle className="h-4 w-4 fill-current" />
              )}
              <span className="ml-2">Start</span>
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive">
              <Square className="h-4 w-4" />
              <span className="ml-2">Stop</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

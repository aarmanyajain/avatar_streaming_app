import { useState, useRef, useCallback, useEffect } from 'react';
import { RTCPeerConnection, RTCSessionDescription, MediaStream } from 'react-native-webrtc';
import {
  setupConnection,
  sendIceCandidate,
  startConnection,
  startStream,
} from '../services/apiService';

/**
 * React Native hook for managing a D-ID WebRTC stream
 * @param {Object} opts
 * @param {string} opts.agentId
 * @param {string} opts.sourceUrl
 * @param {(state: string) => void} [opts.onStreamStateChange]
 * @param {(error: string) => void} [opts.onConnectionError]
 */
export function useWebRTC({ agentId, sourceUrl, onStreamStateChange, onConnectionError }) {
  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);
  const remoteMediaStreamRef = useRef(null);
  const rtcViewRef = useRef(null);  // ref for RTCView component
  const streamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [streamState, setStreamState] = useState('disconnected');
  const [error, setError] = useState(null);

  // Notify parent of state changes
  useEffect(() => { onStreamStateChange?.(streamState); }, [streamState, onStreamStateChange]);

  // Notify parent of errors
  useEffect(() => { if (error) onConnectionError?.(error); }, [error, onConnectionError]);

  // Clean up connections and MediaStream
  const closeConnection = useCallback(() => {
    const pc = pcRef.current;
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.oniceconnectionstatechange = null;
      pc.getSenders().forEach(sender => sender.track?.stop());
      pc.close();
      pcRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (remoteMediaStreamRef.current) {
      remoteMediaStreamRef.current.getTracks().forEach(t => t.stop());
      remoteMediaStreamRef.current = null;
    }
    setRemoteStream(null);
    setStreamState('disconnected');
  }, []);

  // Initialize WebRTC connection
  const init = useCallback(async () => {
    setStreamState('loading');
    try {
      const data = await setupConnection(agentId, sourceUrl);
      streamRef.current = { id: data.id, session_id: data.session_id };

      const pc = new RTCPeerConnection({ iceServers: data.ice_servers });
      pcRef.current = pc;

      // Request receiving audio and video
      pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.addTransceiver('video', { direction: 'recvonly' });

      // Setup data channel
      const dc = pc.createDataChannel('streamStateChannel');
      dataChannelRef.current = dc;
      dc.onopen = () => console.log('DataChannel opened');
      dc.onmessage = e => {
        if (e.data === 'stream/live') setStreamState('live');
        if (e.data === 'stream/done') setStreamState('ended');
      };

      // ICE candidate handling
      pc.onicecandidate = evt => {
        if (evt.candidate) {
          sendIceCandidate(data.id, data.session_id, evt.candidate)
            .catch(() => setError('Failed to send ICE candidate'));  
        }
      };
      pc.oniceconnectionstatechange = () => {
        const s = pc.iceConnectionState;
        if (s === 'connected' || s === 'completed') {
          setStreamState('ready');
        } else if (['failed','closed','disconnected'].includes(s)) {
          setError('ICE failure');
          setStreamState('disconnected');
        }
      };

      // Handle remote tracks into a single MediaStream
      pc.ontrack = evt => {
        if (!remoteMediaStreamRef.current) {
          remoteMediaStreamRef.current = new MediaStream();
        }
        remoteMediaStreamRef.current.addTrack(evt.track);
        console.log('Track received:', evt.track.kind);
        setRemoteStream(remoteMediaStreamRef.current);
      };

      // SDP handshake
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await startConnection(data.id, data.session_id, answer);
    } catch (err) {
      console.error('WebRTC init error:', err);
      setError(err.message || 'WebRTC init failed');
      setStreamState('disconnected');
    }
  }, [agentId, sourceUrl]);

  // Start/cleanup
  useEffect(() => { init(); return () => closeConnection(); }, [init, closeConnection]);

  /**
   * Send TTS text to generate video/live stream
   */
  const sendText = useCallback(async text => {
    if (!streamRef.current) return;
    setStreamState('loading');
    try {
      await startStream(streamRef.current.id, streamRef.current.session_id, text);
      dataChannelRef.current?.send('stream/live');
      setStreamState('live');
    } catch (err) {
      console.error('Stream error:', err);
      setError(err.message);
    }
  }, []);

  // Return remoteStream and a ref for RTCView
  return { remoteStream, rtcViewRef, streamState, error, sendText, closeConnection };
}
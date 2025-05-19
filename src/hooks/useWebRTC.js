// // useWebRTC.js - React Native version (JavaScript)
// import { useState, useRef, useCallback, useEffect } from "react";
// import {
//   RTCPeerConnection,
//   mediaDevices,
// } from "react-native-webrtc";

// import {
//   setupConnection,
//   sendIceCandidate,
//   startConnection,
//   startStream,
// } from "../services/apiService";

// export const useWebRTC = ({
//   agentId,
//   sourceUrl,
//   onStreamStateChange,
//   onConnectionError,
// }) => {
//   const videoRef = useRef(null); // used in UI with <RTCView />
//   const pcRef = useRef(null);
//   const streamRef = useRef(null);
//   const dataChannelRef = useRef(null);

//   const [remoteStream, setRemoteStream] = useState(null);
//   const [streamState, setStreamState] = useState("disconnected");
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     onStreamStateChange?.(streamState);
//   }, [streamState]);

//   useEffect(() => {
//     if (error) onConnectionError?.(error);
//   }, [error]);

//   const closeConnection = useCallback(() => {
//     const pc = pcRef.current;

//     if (pc) {
//       pc.onicecandidate = null;
//       pc.ontrack = null;
//       pc.oniceconnectionstatechange = null;
//       pc.getSenders().forEach((s) => s.track?.stop());
//       pc.close();
//       pcRef.current = null;
//     }

//     if (remoteStream) {
//       remoteStream.getTracks().forEach((t) => t.stop());
//       setRemoteStream(null);
//     }

//     setStreamState("disconnected");
//   }, [remoteStream]);

//   const init = useCallback(async () => {
//     setStreamState("loading");
//     try {
//       const data = await setupConnection(agentId, sourceUrl);
//       streamRef.current = { id: data.id, session_id: data.session_id };

//       const pc = new RTCPeerConnection({ iceServers: data.ice_servers });

//       const dataChannel = pc.createDataChannel("JanusDataChannel", {
//         ordered: true,
//         maxRetransmits: 3,
//       });

//       dataChannelRef.current = dataChannel;
//       pcRef.current = pc;

//       pc.oniceconnectionstatechange = () => {
//         const s = pc.iceConnectionState;
//         if (s === "connected" || s === "completed") {
//           setStreamState("ready");
//         } else if (["failed", "closed", "disconnected"].includes(s)) {
//           setError("ICE failure");
//           setStreamState("disconnected");
//         }
//       };

//       pc.onicecandidate = (evt) => {
//         sendIceCandidate(
//           data.id,
//           data.session_id,
//           evt.candidate || undefined
//         ).catch(() => setError("ICE send failed"));
//       };

//       pc.ontrack = (event) => {
//         const [stream] = event.streams;
//         if (stream) {
//           setRemoteStream(stream);
//           setStreamState("live");
//         }
//       };

//       dataChannel.onmessage = (event) => {
//         if (event.data === "stream/done") {
//           setStreamState("ended");
//         } else if (event.data === "stream/start") {
//           setStreamState("ready");
//         }
//       };

//       await pc.setRemoteDescription(data.offer);
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       await startConnection(data.id, data.session_id, answer);
//     } catch (e) {
//       setError(e.message || "WebRTC init failed");
//       setStreamState("disconnected");
//     }
//   }, [agentId, sourceUrl]);

//   useEffect(() => {
//     init();
//     return () => {
//       closeConnection();
//     };
//   }, [init, closeConnection]);

//   const sendText = useCallback(async (text) => {
//     if (!streamRef.current) return;
//     setStreamState("loading");
//     try {
//       await startStream(
//         streamRef.current.id,
//         streamRef.current.session_id,
//         text
//       );
//       setStreamState("live");
//     } catch (e) {
//       console.error("Error in startStream:", e);
//       setError(
//         "Stream send failed: " +
//           (e.response?.data?.message || e.message || "Unknown error")
//       );
//     }
//   }, []);

//   const reconnect = useCallback(async () => {
//     closeConnection();
//     setError(null);
//     await new Promise((resolve) => setTimeout(resolve, 500));
//     return init();
//   }, [closeConnection, init]);

//   return {
//     remoteStream, // pass to <RTCView streamURL={remoteStream?.toURL()} />
//     streamState,
//     error,
//     sendText,
//     closeConnection,
//     reconnect,
//   };
// };



// hooks/useWebRTC.js
// import { useState, useRef, useCallback, useEffect } from 'react';
// import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
// import {
//   setupConnection,
//   sendIceCandidate,
//   startConnection,
//   startStream,
// } from '../services/apiService';

// /**
//  * React Native hook for managing a D-ID WebRTC stream
//  * @param {Object} opts
//  * @param {string} opts.agentId
//  * @param {string} opts.sourceUrl
//  * @param {(state: string) => void} [opts.onStreamStateChange]
//  * @param {(error: string) => void} [opts.onConnectionError]
//  */
// export function useWebRTC({ agentId, sourceUrl, onStreamStateChange, onConnectionError }) {
//   const pcRef = useRef(null);
//   const dataChannelRef = useRef(null);
//   const streamRef = useRef(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [streamState, setStreamState] = useState('disconnected');
//   const [error, setError] = useState(null);

//  // Notify parent of state changes
// useEffect(() => {
//     console.log('Stream state changed:', streamState);
//     onStreamStateChange?.(streamState);
//   }, [streamState, onStreamStateChange]);
  
//   // Notify parent of errors
//   useEffect(() => {
//     if (error) {
//       console.error('Connection error:', error);
//       onConnectionError?.(error);
//     }
//   }, [error, onConnectionError]);
  
//   // Clean up all connections and streams
//   const closeConnection = useCallback(() => {
//     console.log('Closing connection...');
//     const pc = pcRef.current;
//     if (pc) {
//       pc.onicecandidate = null;
//       pc.onaddstream = null;
//       pc.oniceconnectionstatechange = null;
//       pc.close();
//       pcRef.current = null;
//       console.log('PeerConnection closed');
//     }
//     dataChannelRef.current?.close();
//     dataChannelRef.current = null;
//     console.log('Data channel closed');
  
//     if (remoteStream) {
//       remoteStream.getTracks().forEach(t => t.stop());
//       setRemoteStream(null);
//       console.log('Remote stream tracks stopped');
//     }
  
//     setStreamState('disconnected');
//   }, [remoteStream]);
  
//   // Initialize the WebRTC connection
//  const init = useCallback(async () => {
//   console.log('Initializing WebRTC connection...');
//   setStreamState('loading');
//   try {
//     console.log('Calling setupConnection...');
//     const data = await setupConnection(agentId, sourceUrl);
//     console.log('Connection setup data received:', data);

//     streamRef.current = { id: data.id, session_id: data.session_id };

//     const pc = new RTCPeerConnection({ iceServers: data.ice_servers });
//     pcRef.current = pc;
//     console.log('RTCPeerConnection created');

//     // Data channel for stream state signaling
//     const dc = pc.createDataChannel('streamStateChannel');
//     dataChannelRef.current = dc;
//     console.log('Data channel created');

//     dc.onopen = () => console.log('Data channel opened');
//     dc.onclose = () => console.log('Data channel closed');
//     dc.onerror = e => console.error('Data channel error:', e);
//     dc.onmessage = e => {
//       console.log('Data channel message received:', e.data);
//       if (e.data === 'stream/done') setStreamState('ended');
//       if (e.data === 'stream/live') setStreamState('live');
//     };

//     // ICE state change handling
//     pc.oniceconnectionstatechange = () => {
//       const s = pc.iceConnectionState;
//       console.log('ICE connection state changed:', s);
//       if (s === 'connected' || s === 'completed') setStreamState('ready');
//       if (['failed', 'closed', 'disconnected'].includes(s)) {
//         setError('ICE failure');
//         setStreamState('disconnected');
//       }
//     };

//     // Send ICE candidates to the server
//     pc.onicecandidate = evt => {
//       if (evt.candidate) {
//         console.log('New ICE candidate:', evt.candidate);
//         sendIceCandidate(streamRef.current.id, streamRef.current.session_id, evt.candidate)
//           .catch(() => setError('Failed to send ICE candidate'));
//       } else {
//         console.log('ICE candidate gathering completed.');
//       }
//     };

//     // When remote stream arrives
//     pc.onaddstream = evt => {
//       console.log('Remote:', evt.stream);
//       setRemoteStream(evt.stream);
//       setStreamState('live');
//     };

//     console.log('Setting remote SDP...');
//     await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);
//     console.log('Sending local SDP answer...');
//     await startConnection(data.id, data.session_id, answer);
//   } catch (e) {
//     console.error('WebRTC init failed:', e);
//     setError(e.message || 'WebRTC init failed');
//     setStreamState('disconnected');
//   }
// }, [agentId, sourceUrl]);

//   // Kick off on mount, clean up on unmount
//   useEffect(() => {
//     init();
//     return () => closeConnection();
//   }, [init, closeConnection]);

//   /**
//    * Send text to the stream and signal remote
//    */
//   const sendText = useCallback(async text => {
//     if (!streamRef.current) return;
//     setStreamState('loading');
//     try {
//       await startStream(streamRef.current.id, streamRef.current.session_id, text);
//       // Signal remote
//       dataChannelRef.current?.send('stream/live');
//       setStreamState('live');
//     } catch (e) {
//       console.error('Stream error', e);
//       setError(e.message);
//     }
//   }, []);

//   return { remoteStream, streamState, error, sendText, closeConnection };
// }


// import { useState, useRef, useCallback, useEffect } from 'react';
// import { RTCPeerConnection, RTCSessionDescription, MediaStream } from 'react-native-webrtc';
// import {
//   setupConnection,
//   sendIceCandidate,
//   startConnection,
//   startStream,
// } from '../services/apiService';

// /**
//  * React Native hook for managing a D-ID WebRTC stream
//  * @param {Object} opts
//  * @param {string} opts.agentId
//  * @param {string} opts.sourceUrl
//  * @param {(state: string) => void} [opts.onStreamStateChange]
//  * @param {(error: string) => void} [opts.onConnectionError]
//  */
// export function useWebRTC({ agentId, sourceUrl, onStreamStateChange, onConnectionError }) {
//   const pcRef = useRef(null);
//   const dataChannelRef = useRef(null);
//   const remoteMediaStreamRef = useRef(null);
//   const rtcViewRef = useRef(null);  // ref for RTCView component
//   const streamRef = useRef(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [streamState, setStreamState] = useState('disconnected');
//   const [error, setError] = useState(null);

//   // Notify parent of state changes
//   useEffect(() => { onStreamStateChange?.(streamState); }, [streamState, onStreamStateChange]);

//   // Notify parent of errors
//   useEffect(() => { if (error) onConnectionError?.(error); }, [error, onConnectionError]);

//   // Clean up connections and MediaStream
//   const closeConnection = useCallback(() => {
//     const pc = pcRef.current;
//     if (pc) {
//       pc.ontrack = null;
//       pc.onicecandidate = null;
//       pc.oniceconnectionstatechange = null;
//       pc.getSenders().forEach(sender => sender.track?.stop());
//       pc.close();
//       pcRef.current = null;
//     }
//     if (dataChannelRef.current) {
//       dataChannelRef.current.close();
//       dataChannelRef.current = null;
//     }
//     if (remoteMediaStreamRef.current) {
//       remoteMediaStreamRef.current.getTracks().forEach(t => t.stop());
//       remoteMediaStreamRef.current = null;
//     }
//     setRemoteStream(null);
//     setStreamState('disconnected');
//   }, []);

//   // Initialize WebRTC connection
//   const init = useCallback(async () => {
//     setStreamState('loading');
//     try {
//       const data = await setupConnection(agentId, sourceUrl);
//       streamRef.current = { id: data.id, session_id: data.session_id };

//       const pc = new RTCPeerConnection({ iceServers: data.ice_servers });
//       pcRef.current = pc;

//       // Request receiving audio and video
//       pc.addTransceiver('audio', { direction: 'recvonly' });
//       pc.addTransceiver('video', { direction: 'recvonly' });

//       // Setup data channel
//       const dc = pc.createDataChannel('streamStateChannel');
//       dataChannelRef.current = dc;
//       dc.onopen = () => console.log('DataChannel opened');
//       dc.onmessage = e => {
//         if (e.data === 'stream/live') setStreamState('live');
//         if (e.data === 'stream/done') setStreamState('ended');
//       };

//       // ICE candidate handling
//       pc.onicecandidate = evt => {
//         if (evt.candidate) {
//           sendIceCandidate(data.id, data.session_id, evt.candidate)
//             .catch(() => setError('Failed to send ICE candidate'));  
//         }
//       };
//       pc.oniceconnectionstatechange = () => {
//         const s = pc.iceConnectionState;
//         if (s === 'connected' || s === 'completed') {
//           setStreamState('ready');
//         } else if (['failed','closed','disconnected'].includes(s)) {
//           setError('ICE failure');
//           setStreamState('disconnected');
//         }
//       };

//       // Handle remote tracks into a single MediaStream
//       pc.ontrack = evt => {
//         if (!remoteMediaStreamRef.current) {
//           remoteMediaStreamRef.current = new MediaStream();
//         }
//         remoteMediaStreamRef.current.addTrack(evt.track);
//         console.log('Track received:', evt.track.kind);
//         setRemoteStream(remoteMediaStreamRef.current);
//       };

//       // SDP handshake
//       await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       await startConnection(data.id, data.session_id, answer);
//     } catch (err) {
//       console.error('WebRTC init error:', err);
//       setError(err.message || 'WebRTC init failed');
//       setStreamState('disconnected');
//     }
//   }, [agentId, sourceUrl]);

//   // Start/cleanup
//   useEffect(() => { init(); return () => closeConnection(); }, [init, closeConnection]);

//   /**
//    * Send TTS text to generate video/live stream
//    */
//   const sendText = useCallback(async text => {
//     if (!streamRef.current) return;
//     setStreamState('loading');
//     try {
//       await startStream(streamRef.current.id, streamRef.current.session_id, text);
//       dataChannelRef.current?.send('stream/live');
//       setStreamState('live');
//     } catch (err) {
//       console.error('Stream error:', err);
//       setError(err.message);
//     }
//   }, []);

//   // Return remoteStream and a ref for RTCView
//   return { remoteStream, rtcViewRef, streamState, error, sendText, closeConnection };
// }




// // hooks/useWebRTC.js
// import { useState, useRef, useCallback, useEffect } from 'react';
// import { RTCPeerConnection, RTCSessionDescription, MediaStream } from 'react-native-webrtc';
// import {
//   setupConnection,
//   sendIceCandidate,
//   startConnection,
//   startStream,
// } from '../services/apiService';

// /**
//  * React Native hook for managing a D-ID WebRTC stream
//  */
// export function useWebRTC({ agentId, sourceUrl, onStreamStateChange, onConnectionError }) {
//   const pcRef = useRef(null);
//   const dataChannelRef = useRef(null);
//   const streamRef = useRef(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [hasVideo, setHasVideo] = useState(false);
//   const [streamState, setStreamState] = useState('disconnected');
//   const [error, setError] = useState(null);

//   useEffect(() => { onStreamStateChange?.(streamState); }, [streamState, onStreamStateChange]);
//   useEffect(() => { if (error) onConnectionError?.(error); }, [error, onConnectionError]);

//   const closeConnection = useCallback(() => {
//     const pc = pcRef.current;
//     if (pc) {
//       pc.ontrack = null;
//       pc.onicecandidate = null;
//       pc.oniceconnectionstatechange = null;
//       pc.getSenders().forEach(sender => sender.track?.stop());
//       pc.close();
//       pcRef.current = null;
//     }
//     dataChannelRef.current?.close();
//     dataChannelRef.current = null;
//     setRemoteStream(null);
//     setHasVideo(false);
//     setStreamState('disconnected');
//   }, []);

//   const init = useCallback(async () => {
//     setStreamState('loading');
//     try {
//       const data = await setupConnection(agentId, sourceUrl);
//       streamRef.current = { id: data.id, session_id: data.session_id };

//       const pc = new RTCPeerConnection({ iceServers: data.ice_servers });
//       // Explicitly request both audio and video m-lines to be active
//       pc.addTransceiver('audio', { direction: 'recvonly' });
//       pc.addTransceiver('video', { direction: 'recvonly' });
//       pcRef.current = pc;

//       const dc = pc.createDataChannel('streamStateChannel');
//       dataChannelRef.current = dc;
//       dc.onopen = () => console.log('DataChannel opened');
//       dc.onmessage = e => {
//         if (e.data === 'stream/live') setStreamState('live');
//         if (e.data === 'stream/done') setStreamState('ended');
//       };

//       pc.onicecandidate = evt => {
//         if (evt.candidate) {
//           sendIceCandidate(data.id, data.session_id, evt.candidate)
//             .catch(() => setError('Failed to send ICE candidate'));
//         }
//       };
//       pc.oniceconnectionstatechange = () => {
//         const s = pc.iceConnectionState;
//         if (s === 'connected' || s === 'completed') setStreamState('ready');
//         else if (['failed','closed','disconnected'].includes(s)) {
//           setError('ICE failure');
//           setStreamState('disconnected');
//         }
//       };

//       pc.ontrack = event => {
//         const [stream] = event.streams;
//         if (stream) {
//           console.log('Received track:', event.track.kind);
//           if (event.track.kind === 'video') {
//             setHasVideo(true);
//             event.track.enabled = true;
//           }
//           setRemoteStream(stream);
//         }
//       };

//       await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       await startConnection(data.id, data.session_id, answer);
//     } catch (err) {
//       console.error('WebRTC init error:', err);
//       setError(err.message || 'WebRTC init failed');
//       setStreamState('disconnected');
//     }
//   }, [agentId, sourceUrl]);

//   useEffect(() => { init(); return () => closeConnection(); }, [init, closeConnection]);

//   const sendText = useCallback(async text => {
//     if (!streamRef.current) return;
//     setStreamState('loading');
//     try {
//       await startStream(streamRef.current.id, streamRef.current.session_id, text);
//       dataChannelRef.current?.send('stream/live');
//       setStreamState('live');
//     } catch (err) {
//       console.error('Stream error:', err);
//       setError(err.message);
//     }
//   }, []);

//   return { remoteStream, hasVideo, streamState, error, sendText, closeConnection };
// }


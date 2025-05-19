// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Image,
// } from 'react-native';
// import { RTCView } from 'react-native-webrtc';
// import { useWebRTC } from '../hooks/useWebRTC';

// const AGENT_ID = 'v2_public_fiona_pink_shirt_nature@YbSy_eGr0t';
// const SOURCE_URL = 'https://clips-presenters.d-id.com/v2/fiona_pink_shirt_nature/YbSy_eGr0t/YK3poyBbmx/image.png';
// const PLACEHOLDER_IMAGE = 'https://clips-presenters.d-id.com/v2/lily/addf3c9auh/wvbwmxlwcq/image.png';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);

//   const { remoteStream, streamState, error, sendText } = useWebRTC({
//     agentId: AGENT_ID,
//     sourceUrl: SOURCE_URL,
//     onStreamStateChange: state => console.log('Stream state:', state),
//     onConnectionError: err => console.error('WebRTC error:', err),
//   });

//   // Safely generate stream URL
//   let streamUrl = null;
//   try {
//     if (remoteStream) {
//       streamUrl = remoteStream.toURL();
//     }
//   } catch (err) {
//     console.error('Error converting stream to URL:', err);
//   }

//   // Add chat messages with unique ID
//   const addMessage = (role, content) => {
//     const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const msg = { id, role, content, timestamp: new Date().toISOString() };
//     setMessages(prev => [...prev, msg]);
//     return msg;
//   };

//   // Handle send button
//   const handleSend = async () => {
//     if (!inputText.trim()) return;
//     addMessage('user', inputText.trim());

//     // Simulate assistant reply
//     const reply = 'Hi, how are you today? I am your virtual assistant.';
//     addMessage('assistant', reply);
//     setInputText('');
//     await sendText(reply);
//   };

//   // Render chat bubbles
//   const renderItem = ({ item }) => (
//     <View style={item.role === 'user' ? styles.userBubble : styles.assistantBubble}>
//       <Text style={styles.bubbleText}>{item.content}</Text>
//       <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={80}
//     >
//       {/* Video or placeholder */}
//       <View style={styles.videoContainer}>
//         {streamUrl ? (
//           <RTCView
//             streamURL={streamUrl}
//             style={[styles.video, streamState === 'live' ? styles.visible : styles.hidden]}
//             objectFit="cover"
//           />
//         ) : (
//           <Image
//             source={{ uri: PLACEHOLDER_IMAGE }}
//             style={[styles.video, styles.visible]}
//             resizeMode="cover"
//           />
//         )}
//       </View>

//       {/* Connection status */}
//       <View style={styles.statusRow}>
//         <Text style={styles.statusText}>Status: {streamState}</Text>
//         {error && <Text style={styles.errorText}>Error: {error}</Text>}
//       </View>

//       {/* Chat history */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={item => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.chatList}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//       />

//       {/* Input row */}
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder="Type a message..."
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
//           <Text style={styles.sendText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   videoContainer: { height: 500, backgroundColor: '#000' },
//   video: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
//   visible: { display: 'flex' },
//   hidden: { display: 'none' },
//   statusRow: {
//     padding: 8,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#f0f0f0',
//   },
//   statusText: { color: '#333' },
//   errorText: { color: 'red' },
//   chatList: { padding: 10, flexGrow: 1 },
//   userBubble: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#667eea',
//     padding: 8,
//     borderRadius: 12,
//     marginVertical: 4,
//     maxWidth: '80%',
//   },
//   assistantBubble: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#e2e8f0',
//     padding: 8,
//     borderRadius: 12,
//     marginVertical: 4,
//     maxWidth: '80%',
//   },
//   bubbleText: { fontSize: 14, color: '#000' },
//   timestamp: { fontSize: 10, color: '#555', marginTop: 2 },
//   inputRow: {
//     flexDirection: 'row',
//     padding: 8,
//     borderTopWidth: 1,
//     borderColor: '#ccc',
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 8,
//   },
//   sendButton: {
//     backgroundColor: '#667eea',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   sendText: { color: '#fff', fontWeight: 'bold' },
// });


// screens/ChatScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useWebRTC } from '../hooks/useWebRTC';

const AGENT_ID = 'v2_public_lily@addf3c9auh';
const SOURCE_URL = 'https://clips-presenters.d-id.com/v2/amy/seiu0o2gby/htyl2blosx/image.png';
const PLACEHOLDER_IMAGE = 'https://clips-presenters.d-id.com/v2/lily/addf3c9auh/wvbwmxlwcq/image.png';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const { remoteStream, streamState, error, sendText } = useWebRTC({
    agentId: AGENT_ID,
    sourceUrl: SOURCE_URL,
    onStreamStateChange: state => console.log('Stream state:', state),
    onConnectionError: err => console.error('WebRTC error:', err),
  });

  console.log("RemoteStream80", remoteStream);
  

  // Add chat messages with unique ID
  const addMessage = (role, content) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const msg = { id, role, content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  // Handle send button
  const handleSend = async () => {
    if (!inputText.trim()) return;
    addMessage('user', inputText.trim());
    const reply = 'Hi, how are you today? I am your virtual assistant.';
    addMessage('assistant', reply);
    setInputText('');
    await sendText(reply);
  };

  // Render chat bubbles
  const renderItem = ({ item }) => (
    <View style={item.role === 'user' ? styles.userBubble : styles.assistantBubble}>
      <Text style={styles.bubbleText}>{item.content}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );



  console.log("Remote Stream61", remoteStream);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Video or placeholder */}
      <View style={styles.videoContainer}>

        <RTCView
          streamURL={remoteStream?.toURL()}
          style={[styles.video, streamState === 'live' ? styles.visible : styles.hidden]}
          objectFit="cover"
        />
        <Image
          source={{ uri: PLACEHOLDER_IMAGE }}
          style={[styles.video, streamState === 'live' ? styles.hidden : styles.visible]}
          resizeMode="cover"
        />
      </View>

      {/* Connection status */}
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>Status: {streamState}</Text>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </View>

      {/* Chat history */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  videoContainer: { height: 500, backgroundColor: '#000' },
  video: { position: 'absolute', top: 0, left:0, right: 0, bottom: 0 },
  visible: { display: 'flex' },
  hidden: { display: 'none' },
  statusRow: { padding: 8, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f0f0f0' },
  statusText: { color: '#333' },
  errorText: { color: 'red' },
  chatList: { padding: 10, flexGrow: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#667eea', padding: 8, borderRadius: 12, marginVertical: 4, maxWidth: '80%' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', padding: 8, borderRadius: 12, marginVertical: 4, maxWidth: '80%' },
  bubbleText: { fontSize: 14, color: '#000' },
  timestamp: { fontSize: 10, color: '#555', marginTop: 2 },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  sendButton: { backgroundColor: '#667eea', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  sendText: { color: '#fff', fontWeight: 'bold' },
});


// import React, { useState, useRef } from 'react';
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// import { RTCView } from 'react-native-webrtc';
// import { useWebRTC } from '../hooks/useWebRTC';

// const AGENT_ID = 'v2_public_lily@addf3c9auh';
// const SOURCE_URL = 'https://clips-presenters.d-id.com/v2/amy/seiu0o2gby/htyl2blosx/image.png';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);

//   const { remoteStream, rtcViewRef, streamState, error, sendText } = useWebRTC({
//     agentId: AGENT_ID,
//     sourceUrl: SOURCE_URL,
//     onStreamStateChange: s => console.log('State:', s),
//     onConnectionError: e => console.error('Error:', e),
//   });

//   const addMessage = (role, content) => {
//     const id = `${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
//     setMessages(prev => [...prev, { id, role, content }]);
//   };

//   const handleSend = async () => {
//     if (!inputText.trim()) return;
//     addMessage('user', inputText.trim());
//     const reply = 'Hi, how are you today?';
//     addMessage('assistant', reply);
//     setInputText('');
//     await sendText(reply);
//   };

//   const renderItem = ({ item }) => (
//     <View style={item.role==='user'?styles.userBubble:styles.assistantBubble}>
//       <Text>{item.content}</Text>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView style={styles.container} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={80}>
//       <View style={styles.videoContainer}>
//         {remoteStream ? (
//           <RTCView
//             ref={rtcViewRef}
//             streamURL={remoteStream.toURL()}
//             style={styles.video}
//             objectFit="cover"
//           />
//         ) : (
//           <Text style={styles.placeholder}>Waiting for video...</Text>
//         )}
//       </View>
//       <Text>Status: {streamState}</Text>
//       {error && <Text style={styles.error}>Error: {error}</Text>}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={item=>item.id}
//         renderItem={renderItem}
//         onContentSizeChange={()=>flatListRef.current?.scrollToEnd({animated:true})}
//         contentContainerStyle={styles.chatList}
//       />
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder="Type a message..."
//         />
//         <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
//           <Text style={styles.sendText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container:{flex:1},
//   videoContainer:{height:200,backgroundColor:'#000',justifyContent:'center',alignItems:'center'},
//   video:{width:'100%',height:'100%'},
//   placeholder:{color:'#fff'},
//   chatList:{padding:10},
//   userBubble:{alignSelf:'flex-end',backgroundColor:'#67a',padding:8,borderRadius:8,marginVertical:4},
//   assistantBubble:{alignSelf:'flex-start',backgroundColor:'#eee',padding:8,borderRadius:8,marginVertical:4},
//   inputRow:{flexDirection:'row',padding:8,borderTopWidth:1,borderColor:'#ccc'},
//   input:{flex:1,borderWidth:1,borderColor:'#ccc',borderRadius:20,paddingHorizontal:12},
//   sendBtn:{marginLeft:8,backgroundColor:'#67a',borderRadius:20,justifyContent:'center',paddingHorizontal:16},
//   sendText:{color:'#fff'},
//   error:{color:'red',padding:8},
// });



// // screens/ChatScreen.js
// import React, { useState, useRef, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// import { RTCView } from 'react-native-webrtc';
// import { useWebRTC } from '../hooks/useWebRTC';

// const AGENT_ID = 'v2_public_lily@addf3c9auh';
// const SOURCE_URL = 'https://clips-presenters.d-id.com/v2/amy/seiu0o2gby/htyl2blosx/image.png';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);

//   const { remoteStream, hasVideo, streamState, error, sendText } = useWebRTC({
//     agentId: AGENT_ID,
//     sourceUrl: SOURCE_URL,
//     onStreamStateChange: s => console.log('StreamState:', s),
//     onConnectionError: e => console.error('WebRTC Error:', e),
//   });

//   // Log video track enabled state
//   useEffect(() => {
//     if (remoteStream) {
//       const vTrack = remoteStream.getTracks().find(t => t.kind === 'video');
//       if (vTrack) console.log('Video track enabled:', vTrack.enabled);
//     }
//   }, [remoteStream]);

//   const addMessage = (role, content) => {
//     const id = `${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
//     setMessages(prev => [...prev, { id, role, content, timestamp: new Date().toISOString() }]);
//   };

//   const handleSend = async () => {
//     if (!inputText.trim()) return;
//     addMessage('user', inputText.trim());
//     const reply = 'Hi, how are you today?';
//     addMessage('assistant', reply);
//     setInputText('');
//     await sendText(reply);
//   };

//   const renderItem = ({ item }) => (
//     <View style={item.role === 'user' ? styles.userBubble : styles.assistantBubble}>
//       <Text>{item.content}</Text>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
//       <View style={styles.videoContainer}>
//         {remoteStream ? (
//           hasVideo ? (
//             <RTCView streamURL={remoteStream.toURL()} style={styles.video} objectFit="cover" />
//           ) : (
//             <Text style={styles.placeholder}>Audio only – no video track</Text>
//           )
//         ) : (
//           <Text style={styles.placeholder}>Waiting for stream...</Text>
//         )}
//       </View>
//       <Text style={styles.status}>Status: {streamState}</Text>
//       {error && <Text style={styles.error}>Error: {error}</Text>}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={item => item.id}
//         renderItem={renderItem}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//         contentContainerStyle={styles.chatList}
//       />
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder="Type a message..."
//         />
//         <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
//           <Text style={styles.sendText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   videoContainer: { height: 200, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
//   video: { width: '100%', height: '100%' },
//   placeholder: { color: '#fff' },
//   status: { padding: 8 },
//   error: { color: 'red', padding: 8 },
//   chatList: { padding: 10 },
//   userBubble: { alignSelf: 'flex-end', backgroundColor: '#67a', padding: 8, borderRadius: 8, marginVertical: 4 },
//   assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#eee', padding: 8, borderRadius: 8, marginVertical: 4 },
//   inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ccc' },
//   input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 12 },
//   sendBtn: { marginLeft: 8, backgroundColor: '#67a', borderRadius: 20, justifyContent: 'center', paddingHorizontal: 16 },
//   sendText: { color: '#fff' }
// });
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
import { useWebRTC } from '../hooks/WebRTC';
import {
  DID_AGENT_ID,
  DID_SOURCE_URL,
  DID_PLACEHOLDER_IMAGE,
} from '@env';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const { remoteStream, streamState, error, sendText } = useWebRTC({
    agentId: DID_AGENT_ID,
    sourceUrl: DID_SOURCE_URL,
    onStreamStateChange: state => console.log('Stream state:', state),
    onConnectionError: err => console.error('WebRTC error:', err),
  });

  const addMessage = (role, content) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const msg = { id, role, content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    addMessage('user', inputText.trim());
    const reply = 'Hi, how are you today? I am your virtual assistant.';
    addMessage('assistant', reply);
    setInputText('');
    await sendText(reply);
  };

  const renderItem = ({ item }) => (
    <View style={item.role === 'user' ? styles.userBubble : styles.assistantBubble}>
      <Text style={styles.bubbleText}>{item.content}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.videoContainer}>
        <RTCView
          streamURL={remoteStream?.toURL()}
          style={[styles.video, streamState === 'live' ? styles.visible : styles.hidden]}
          objectFit="cover"
        />
        <Image
          source={{ uri: DID_PLACEHOLDER_IMAGE }}
          style={[styles.video, streamState === 'live' ? styles.hidden : styles.visible]}
          resizeMode="cover"
        />
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>Status: {streamState}</Text>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

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

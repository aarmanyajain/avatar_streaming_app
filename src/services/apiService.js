import axios from 'axios';
import { DID_API_BASE_URL, DID_API_KEY } from '@env';

const AUTH_HEADER = `Basic ${DID_API_KEY}`;

export const setupConnection = async (agentId, sourceUrl) => {
  console.log('📡 setupConnection() called with:', agentId, sourceUrl);

  try {
    const res = await axios.post(
      DID_API_BASE_URL,
      {
        presenter_id: agentId,
        source_url: sourceUrl,
        compatibility_mode: 'on',
      },
      {
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Setup Connection response', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ setupConnection failed:', error.response?.data || error.message);
    throw error;
  }
};

export const sendIceCandidate = async (streamId, sessionId, candidate) => {
  const body = { session_id: sessionId };
  if (candidate) body.candidate = candidate;

  await axios.post(`${DID_API_BASE_URL}/${streamId}/ice`, body, {
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
  });
};

export const startConnection = async (streamId, sessionId, answer) => {
  await axios.post(
    `${DID_API_BASE_URL}/${streamId}/sdp`,
    { session_id: sessionId, answer },
    {
      headers: {
        Authorization: AUTH_HEADER,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const startStream = async (streamId, sessionId, text) => {
  try {
    const response = await axios.post(
      `${DID_API_BASE_URL}/${streamId}`,
      {
        session_id: sessionId,
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'elevenlabs',
            voice_id: 'e3SQYxMM1v1apbaHnt8w',
            voice_config: {
              stability: 0.1,
              similarity_boost: 0.3,
              style: 0.2,
              speed: 0.5,
            },
          },
        },
        config: { result_format: 'mp4', stitch: true },
        background: { color: '#FFFFFF' },
      },
      {
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Stream started successfully:', response.data);
  } catch (error) {
    console.error('Failed to start stream:', error.response?.data || error.message);
    throw new Error('Stream failed: ' + (error.response?.data?.message || error.message));
  }
};

import React, { useState, useEffect, useRef } from "react";

const MyComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const newWebSocket = new WebSocket("ws://192.168.213.108:8000/ws");

    newWebSocket.onopen = () => {
      console.log("WebSocket connected successfully");
      setError(null); // Clear any previous error
      setWebSocket(newWebSocket);
    };

    newWebSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection failed.");
    };

    newWebSocket.onmessage = (event) => {
      // Handle incoming audio data
      const audioData = event.data;
      playAudio(audioData);
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      newWebSocket.close();
    };
  }, []);

  const playAudio = (audioData) => {
    const audioContext = new AudioContext();
    const audioBuffer = audioContext.createBuffer(1, 44100, 44100);
    audioBuffer.getChannelData(0).set(new Float32Array(audioData));

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const handleRecordClick = () => {
    if (!isRecording) {
      // Send a message to start recording on the server
      if (webSocket) {
        webSocket.send(JSON.stringify({ action: 'startRecording' }));
        setIsRecording(true);
      }
    } else {
      // Send a message to stop recording on the server
      if (webSocket) {
        webSocket.send(JSON.stringify({ action: 'stopRecording' }));
        setIsRecording(false);
      }
    }
  };

  return (
    <div>
      {/* Display error message if WebSocket connection fails */}
      {error && <p>Error: {error}</p>}
      {/* Your UI components */}
      <button onClick={handleRecordClick}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default MyComponent;

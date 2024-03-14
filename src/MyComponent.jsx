import React, { useState, useEffect } from "react";

const MyComponent = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Set up WebSocket connection to Raspberry Pi
    const newWs = new WebSocket("ws://192.168.213.32:8765");
    setWs(newWs);

    newWs.onmessage = (event) => {
      if (!audioContext) {
        const newAudioContext = new AudioContext();
        setAudioContext(newAudioContext);
      }
      const audioData = event.data;
      // Process and play audioData using the AudioContext
      processAudioData(audioData);
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      newWs.close();
    };
  }, []);

  const processAudioData = (audioData) => {
    if (audioContext) {
      // Convert audioData (e.g., ArrayBuffer) to an AudioBuffer
      audioContext.decodeAudioData(audioData, (buffer) => {
        // Create an audio source node
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      });
    }
  };

  const handleRecordClick = () => {
    // Resume the AudioContext on user gesture
    if (audioContext) {
      audioContext.resume().then(() => {
        console.log("Playback resumed successfully");
      });
    }
    // Send a message to start recording on the Raspberry Pi
    if (ws) {
      ws.send('startRecording');
    }
  };

  return (
    <div>
      {/* Your UI components */}
      <button onClick={handleRecordClick}>Record</button>
    </div>
  );
};

export default MyComponent;

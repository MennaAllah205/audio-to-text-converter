import React, { useState } from "react";
import axios from "axios";
import "../Css/Style.css";
const Transcriber = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState(""); // State for storing transcription text
  const [loading, setLoading] = useState(false); // State for loading status

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      console.log("Selected file:", e.target.files[0]); // Debugging line
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Convert button clicked");

    if (!audioFile) {
      console.error("No audio file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioFile);

    setLoading(true); // Set loading to true before starting the process

    try {
      // Step 1: Upload audio file to AssemblyAI
      const uploadResponse = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        formData,
        {
          headers: {
            authorization: "7c7fb85ae4d94653b07f75f7758e3dc6", // Your API key
          },
        }
      );

      const audioUrl = uploadResponse.data.upload_url;

      // Step 2: Request transcription
      const transcriptionResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        {
          audio_url: audioUrl,
        },
        {
          headers: {
            authorization: "7c7fb85ae4d94653b07f75f7758e3dc6", // Your API key
          },
        }
      );

      const transcriptId = transcriptionResponse.data.id;

      // Step 3: Poll for transcription result
      let transcriptResult = null;
      while (!transcriptResult || transcriptResult.status !== "completed") {
        const resultResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              authorization: "7c7fb85ae4d94653b07f75f7758e3dc6", // Your API key
            },
          }
        );
        transcriptResult = resultResponse.data;
      }

      // Set the transcription text to state to display it on the page
      setTranscription(transcriptResult.text);
    } catch (error) {
      console.error("Error during transcription:", error);
    } finally {
      setLoading(false); // Set loading to false after processing is complete
    }
  };

  return (
    <div className="container">
      <h1>Audio to Text Converter</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button type="submit">Convert</button>
      </form>
      {loading && (
        <p className="loading-message">
          Loading... Your transcription may take a few minutes to appear.
        </p>
      )}
      {transcription && (
        <p className="transcription">Transcription: {transcription}</p>
      )}
    </div>
  );
};

export default Transcriber;

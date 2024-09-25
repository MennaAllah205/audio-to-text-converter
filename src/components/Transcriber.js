import React, { useState } from "react";
import axios from "axios";
import "../Css/Style.css";

const LANGUAGE_CODES = {
  EN: "en",
  AR: "ar",
  ES: "es",
  FR: "fr",
};

const Transcriber = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [languageCode, setLanguageCode] = useState(LANGUAGE_CODES.EN);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      console.log("Selected file:", e.target.files[0]);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguageCode(e.target.value);
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

    setLoading(true);

    try {
      const uploadResponse = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        formData,
        {
          headers: {
            authorization: "7c7fb85ae4d94653b07f75f7758e3dc6",
          },
        }
      );

      const audioUrl = uploadResponse.data.upload_url;
      console.log("Uploaded audio URL:", audioUrl);

      const params = {
        audio_url: audioUrl,
        language_code: languageCode, //  the language code
        speech_model: "nano",
      };

      if (languageCode !== LANGUAGE_CODES.AR) {
        params.speaker_labels = true;
      }

      // Request transcription
      const transcriptionResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        params,
        {
          headers: {
            authorization: "7c7fb85ae4d94653b07f75f7758e3dc6",
          },
        }
      );

      const transcriptId = transcriptionResponse.data.id;
      console.log("Transcript ID:", transcriptId);

      let transcriptResult = null;
      while (!transcriptResult || transcriptResult.status !== "completed") {
        const resultResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              authorization: "7c7fb85ae4d94653b07f75f7758e3dc6",
            },
          }
        );
        transcriptResult = resultResponse.data;
        console.log("Transcription Status:", transcriptResult.status); // Log transcription status
      }

      console.log("Final Transcription:", transcriptResult.text); // Log the final transcription
      setTranscription(transcriptResult.text);
    } catch (error) {
      console.error(
        "Error during transcription:",
        error.response ? error.response.data : error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Audio to Text Converter</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />

        <label htmlFor="language-select">Select Language:</label>
        <select
          id="language-select"
          value={languageCode}
          onChange={handleLanguageChange}
        >
          <option value={LANGUAGE_CODES.EN}>English</option>
          <option value={LANGUAGE_CODES.AR}>Arabic</option>
          <option value={LANGUAGE_CODES.ES}>Spanish</option>
          <option value={LANGUAGE_CODES.FR}>French</option>
        </select>

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

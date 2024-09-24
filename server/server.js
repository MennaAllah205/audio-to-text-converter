const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const fs = require("fs");
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

const app = express();
app.use(cors());

app.get("/download-audio", (req, res) => {
  const videoId = req.query.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (ytdl.validateURL(videoUrl)) {
    const audioStream = ytdl(videoUrl, { filter: "audioonly" });
    const filePath = "audio.mp3";

    audioStream.pipe(fs.createWriteStream(filePath)).on("finish", async () => {
      const audio = fs.readFileSync(filePath);
      const audioBytes = audio.toString("base64");

      const request = {
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: "MP3",
          sampleRateHertz: 16000,
          languageCode: "en-US",
        },
      };

      try {
        const [response] = await client.recognize(request);
        const transcription = response.results
          .map((result) => result.alternatives[0].transcript)
          .join("\n");
        res.json({ transcription });
      } catch (error) {
        console.error("Error during transcription: ", error);
        res.status(500).send("Error during transcription");
      }
    });
  } else {
    res.status(400).send("Invalid YouTube URL");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

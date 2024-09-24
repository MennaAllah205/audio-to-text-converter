const fs = require("fs");
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

async function transcribeAudio(audioPath) {
  const file = fs.readFileSync(audioPath);
  const audioBytes = file.toString("base64");

  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
  };
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");

  return transcription;
}

module.exports = { transcribeAudio };

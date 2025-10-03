import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@deepgram/sdk";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

if (!process.env.DEEPGRAM_API_KEY) {
  console.error("Error: DEEPGRAM_API_KEY is not set in your .env file.");
  process.exit(1);
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = req.file.path;

  try {
    const fileBuffer = fs.readFileSync(filePath);

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fileBuffer,
      {
        diarize: true,
        punctuate: true,
        smart_format: true,
        paragraphs: true,
        speaker_count: 2,
        language: req.body.language || "en-US",
      }
    );

    if (error) {
      throw error;
    }

    let transcriptText = "";
    if (result.results?.channels[0]?.alternatives[0]?.paragraphs) {
      const paragraphs = result.results.channels[0].alternatives[0].paragraphs.paragraphs;
      
      transcriptText = paragraphs
        .map(p => {
          const speaker = `Speaker ${p.speaker}`;
          const text = p.sentences.map(s => s.text).join(" ");
          return `${speaker}: ${text}`;
        })
        .join("\n"); // This correctly puts each speaker turn on a new line
    } else {
      transcriptText = result.results?.channels[0]?.alternatives[0]?.transcript || "No transcript generated.";
    }

    fs.unlinkSync(filePath);

    res.json({
      transcript: transcriptText,
      rawResponse: result,
    });

  } catch (err) {
    console.error("Error during transcription:", err);
    console.error("Full Deepgram Error:", err.message);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({ error: "Failed to process audio file.", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running and listening on port ${PORT}`);
});
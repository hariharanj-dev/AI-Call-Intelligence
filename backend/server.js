
import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY;

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = req.file.path;

  try {

    const fileData = fs.readFileSync(filePath);
    const uploadResp = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      fileData,
      {
        headers: {
          authorization: ASSEMBLY_API_KEY,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    const audioUrl = uploadResp.data.upload_url;

    const transResp = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl, language_code: req.body.language || "en" },
      { headers: { authorization: ASSEMBLY_API_KEY } }
    );

    const transcriptId = transResp.data.id;


    let transcriptText = "";
    while (true) {
      const resultResp = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { authorization: ASSEMBLY_API_KEY } }
      );

      if (resultResp.data.status === "completed") {
        transcriptText = resultResp.data.text;
        break;
      } else if (resultResp.data.status === "failed") {
        throw new Error("Transcription failed");
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    fs.unlinkSync(filePath);

    res.json({
      transcript: transcriptText,
      decisionGraph: {},
      talkRatio: {},
      emotionTimeline: {},
    });
  } catch (err) {
    console.error("Error during transcription:", err.message);
    fs.unlinkSync(filePath);
    res.status(500).json({ error: "Failed to process audio" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
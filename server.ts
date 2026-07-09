import express, { json } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(json({ limit: "10mb" }));

  // Initialize Gemini API (lazy & safe check)
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "" || apiKey.includes("YOUR_API_KEY")) {
      console.warn("⚠️ Warning: GEMINI_API_KEY is not defined or is a placeholder. AI handwriting recognition will fallback to simulated engine.");
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  const ai = getGeminiClient();

  // API Route for AI Handwriting recognition
  app.post("/api/gemini/recognize", async (req, res) => {
    try {
      const { image, expectedType, context } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Missing image data" });
      }

      // If Gemini client is not initialized, fallback to simulated recognition
      if (!ai) {
        // Fallback simulated response: let client know we are in offline fallback mode
        return res.json({
          text: "FALLBACK_DETECT",
          simulated: true,
          message: "Gemini API Key is missing. Using offline handwriting math engine.",
        });
      }

      // Prepare image part for Gemini
      // Expecting image to be data URL: data:image/png;base64,iVBORw0K...
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/png";

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const prompt = `Your task is strictly to recognize and transcribe the handwritten characters (digits/numbers) present in this image (OCR) using a very specific set of visual mapping rules.

IMPORTANT GENERAL CONSTRAINTS:
1. DO NOT SOLVE the math question. DO NOT calculate the result.
2. Only transcribe the VISUAL characters drawn on the canvas.
3. If the user drew a completely wrong number, you MUST return that recognized mapped digit, NOT the correct math answer.
4. If what is drawn does not fit the rules below or is an unrecognizable scribble, you MUST return "UNREADABLE".
5. If the canvas is blank, return "EMPTY".
6. Return ONLY the recognized plain-text character/digit (e.g., "5", "1", "3", "7"). Do not include any explanation, no markdown, no spaces, no backticks.

STRICT CHARACTER-TO-DIGIT VISUAL RULES:
You must map the visually drawn shapes to the corresponding single digit (0-9) according to these strict mappings:
- '1': Must be mapped from standard "1", "I", "l", "/", "\\", or "|" (straight vertical or diagonal lines).
- '2': Must be mapped from standard "2", or "Z" / shapes looking like "Z".
- '3': Must be mapped from standard "3", or "Eの鏡文字" (mirrored/reversed letter 'E', or mirrored '3').
- '4': Must be mapped from standard "4", or "hを上下反転させたもの" (upside-down letter 'h', like "Ч").
- '5': Must be mapped from standard "5", "S", or ひらがなの「ち」 (Japanese Hiragana 'chi').
- '6': Must be mapped from standard "6", "G", or "b".
- '7': Must be mapped from standard "7", or カタカナの「フ」「ク」「ワ」 (Japanese Katakana 'fu', 'ku', or 'wa').
- '8': Must be mapped from "∞を90°回転した形" (infinity symbol '∞' rotated by 90 degrees / vertical hourglass shape / double circle / standard "8").
- '9': Must be mapped from "g", "q", ひらがなの「の」 (Japanese Hiragana 'no') or standard "9".
- '0': Must be mapped from "O", "D", "◯" (circle shape) or standard "0".

If the drawn item is a random scribble, star, cross, wave, or doesn't match the list above, you MUST return "UNREADABLE".
Remember: Return ONLY the raw mapped digit (0-9) or "UNREADABLE" or "EMPTY". No explanation or reasoning.`;

      let response;
      let retries = 1;
      while (retries >= 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
              temperature: 0.1,
            },
          });
          break;
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isTemporary = err?.status === 503 || errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("busy");
          if (retries > 0 && isTemporary) {
            console.log("[Gemini API] Model busy/temporary issue. Retrying in 1 second...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries--;
          } else {
            throw err;
          }
        }
      }

      const recognizedText = response && response.text ? response.text.trim() : "EMPTY";
      console.log(`[AI Recognition] Recognized: "${recognizedText}" for context: "${context}"`);

      res.json({ text: recognizedText, simulated: false });
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const isQuotaError = errMsg.includes("quota") || error?.status === "RESOURCE_EXHAUSTED" || errMsg.includes("429") || errMsg.includes("limit");
      if (isQuotaError) {
        console.log("[Gemini API] Quota limit reached. Gracefully falling back to local math engine.");
      } else {
        console.log("[Gemini API] Temporary connection state (falling back to local engine):", errMsg);
      }
      // Instead of failing with 500 error, gracefully fallback to local math engine to prevent breaking the game
      res.json({
        text: "FALLBACK_DETECT",
        simulated: true,
        message: `Gemini API call inactive. Switched to offline handwriting math engine.`,
      });
    }
  });

  // API for status/health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: !!process.env.GEMINI_API_KEY });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

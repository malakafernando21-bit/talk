import { GoogleGenAI } from "@google/genai";

// Initialize AI
// NOTE: In a real app, never expose the key on the client side. 
// This should be proxied through your backend. 
// We are using process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI Transcription Unavailable (Missing API Key)";
  }

  try {
    // Convert Blob to Base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Use a lightweight model for speed
    const model = 'gemini-2.5-flash-native-audio-preview-12-2025';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type,
              data: base64Audio
            }
          },
          {
            text: "Transcribe the audio exactly as spoken. If it is noise, return [Noise]."
          }
        ]
      }
    });

    return response.text || "[Unintelligible]";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    return "[Transcription Failed]";
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:audio/webm;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
import { GoogleGenAI, Modality } from '@google/genai';
import { PITCHES, STYLES } from '../constants';

// Per coding guidelines, the API key is expected to be in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSpeech(
  text: string,
  voice: string,
  pitchId?: string,
  styleId?: string
): Promise<string> {
  try {
    const pitch = PITCHES.find(p => p.id === pitchId);
    const style = STYLES.find(s => s.id === styleId);

    const pitchInstruction = pitch?.instruction || '';
    const styleInstruction = style?.instruction || '';
    const prompt = `${styleInstruction}${pitchInstruction}${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from API. This might be due to content filtering or an API error.");
    }
    
    return base64Audio;

  } catch (error) {
    console.error("Error generating speech:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    if (errorMessage.includes("API key not valid")) {
        return Promise.reject(new Error("The provided API key is not valid. Please check your configuration."));
    }
    return Promise.reject(new Error(`Failed to generate speech: ${errorMessage}`));
  }
}
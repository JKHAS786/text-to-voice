import React, { useState, useCallback, useEffect } from 'react';
import { VOICES, PITCHES, STYLES } from './constants';
import { decode, createWavBlob } from './utils/audioUtils';
import { GenerateIcon, LoadingSpinner, PlayIcon } from './components/Icon';
import { generateSpeech } from './services/geminiService';

const App: React.FC = () => {
    const [text, setText] = useState<string>("Hello! Welcome to the advanced text-to-voice generator. You can change my voice, pitch, and style using the options below.");
    const [selectedVoice, setSelectedVoice] = useState<string>(VOICES[0].id);
    const [selectedPitch, setSelectedPitch] = useState<string>(PITCHES[1].id);
    const [selectedStyle, setSelectedStyle] = useState<string>(STYLES[0].id);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const currentAudioUrl = audioUrl;
        return () => {
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
        };
    }, [audioUrl]);

    const handlePreview = useCallback(async (voiceId: string, voiceName: string) => {
        setPreviewLoading(prev => ({ ...prev, [voiceId]: true }));
        try {
            const previewText = `This is a sample of the ${voiceName.split(' ')[0]} voice.`;
            const base64Audio = await generateSpeech(previewText, voiceId);
            const pcmData = decode(base64Audio);
            const wavBlob = createWavBlob(pcmData);
            const url = URL.createObjectURL(wavBlob);
            
            const audio = new Audio(url);
            audio.play();
            // Clean up the object URL after the audio has finished playing
            audio.addEventListener('ended', () => {
                URL.revokeObjectURL(url);
            });
            
        } catch (err) {
            // Use a simple alert for preview errors to avoid cluttering the main error display
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            alert(`Could not generate preview for ${voiceName}: ${errorMessage}`);
        } finally {
            setPreviewLoading(prev => ({ ...prev, [voiceId]: false }));
        }
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!text.trim()) {
            setError("Please enter some text to generate speech.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAudioUrl(null);

        try {
            const base64Audio = await generateSpeech(text, selectedVoice, selectedPitch, selectedStyle);
            
            const pcmData = decode(base64Audio);
            const wavBlob = createWavBlob(pcmData);
            const url = URL.createObjectURL(wavBlob);
            
            setAudioUrl(url);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [text, selectedVoice, selectedPitch, selectedStyle]);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl space-y-6 transform hover:scale-[1.01] transition-transform duration-500">
                <header className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Gemini Text-to-Voice
                    </h1>
                    <p className="text-gray-400 mt-2">Bring your text to life with realistic voices.</p>
                </header>

                <main className="space-y-6">
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="text-input" className="font-semibold text-gray-300">Your Text</label>
                        <textarea
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text here..."
                            className="w-full h-40 p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none text-gray-200"
                            aria-label="Text input for speech generation"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-400 mb-2">Voice</label>
                             <div className="space-y-2 max-h-48 overflow-y-auto pr-2" role="radiogroup">
                                 {VOICES.map((voice) => (
                                     <div
                                         key={voice.id}
                                         className={`flex items-center justify-between p-3 rounded-md transition-all duration-200 cursor-pointer border-2 ${
                                             selectedVoice === voice.id
                                                 ? 'bg-cyan-900/50 border-cyan-500'
                                                 : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                                         }`}
                                         onClick={() => setSelectedVoice(voice.id)}
                                         onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setSelectedVoice(voice.id)}
                                         role="radio"
                                         aria-checked={selectedVoice === voice.id}
                                         tabIndex={0}
                                     >
                                         <span className="font-medium text-gray-200">{voice.name}</span>
                                         <button
                                             onClick={(e) => {
                                                 e.stopPropagation(); // Prevent container's onClick from firing
                                                 handlePreview(voice.id, voice.name);
                                             }}
                                             disabled={previewLoading[voice.id]}
                                             className="bg-cyan-600/50 hover:bg-cyan-600/80 text-white text-xs font-bold py-1 px-3 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                                             aria-label={`Preview voice ${voice.name}`}
                                         >
                                             {previewLoading[voice.id] ? (
                                                 <LoadingSpinner className="w-4 h-4" />
                                             ) : (
                                                 <>
                                                     <PlayIcon className="w-4 h-4 mr-1.5" />
                                                     <span>Preview</span>
                                                 </>
                                             )}
                                         </button>
                                     </div>
                                 ))}
                             </div>
                        </div>
                        <div>
                            <label htmlFor="pitch-select" className="block text-sm font-medium text-gray-400 mb-1">Pitch</label>
                            <select id="pitch-select" value={selectedPitch} onChange={(e) => setSelectedPitch(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 text-white">
                                {PITCHES.map(pitch => <option key={pitch.id} value={pitch.id}>{pitch.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="style-select" className="block text-sm font-medium text-gray-400 mb-1">Style</label>
                            <select id="style-select" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 text-white">
                                {STYLES.map(style => <option key={style.id} value={style.id}>{style.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner className="w-5 h-5 mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <GenerateIcon className="w-5 h-5 mr-2" />
                                    Generate Speech
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-900/50 text-red-300 border border-red-500 p-3 rounded-lg text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {audioUrl && (
                        <div className="pt-4">
                            <audio controls src={audioUrl} className="w-full" aria-label="Generated audio playback">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;

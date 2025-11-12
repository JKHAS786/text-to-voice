import { VoiceOption, PitchOption, StyleOption } from './types';

export const VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'Kore (Female)' },
  { id: 'Puck', name: 'Puck (Male)' },
  { id: 'Charon', name: 'Charon (Male, Deep)' },
  { id: 'Fenrir', name: 'Fenrir (Male, Deep)' },
  { id: 'Zephyr', name: 'Zephyr (Female)' },
  { id: 'Umbriel', name: 'Umbriel (Female)' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix (Female, Warm)' },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi (Male)' },
  { id: 'Rasalgethi', name: 'Rasalgethi (Male, Crisp)' },
  { id: 'Schedar', name: 'Schedar (Male, Deep)' },
];

export const PITCHES: PitchOption[] = [
    { id: 'low', name: 'Low', instruction: 'Say in a very low-pitched voice: ' },
    { id: 'normal', name: 'Normal', instruction: '' },
    { id: 'high', name: 'High', instruction: 'Say in a very high-pitched voice: ' },
];

export const STYLES: StyleOption[] = [
    { id: 'normal', name: 'Normal', instruction: '' },
    { id: 'cheerful', name: 'Cheerful', instruction: 'Say cheerfully: ' },
    { id: 'excited', name: 'Excited', instruction: 'Say with excitement: ' },
    { id: 'sad', name: 'Sad', instruction: 'Say sadly: ' },
    { id: 'angry', name: 'Angry', instruction: 'Say angrily: ' },
    { id: 'calm', name: 'Calm', instruction: 'Say calmly: ' },
    { id: 'whisper', name: 'Whisper', instruction: 'Say in a whisper: ' },
    { id: 'shouting', name: 'Shouting', instruction: 'Say as if shouting: ' },
];
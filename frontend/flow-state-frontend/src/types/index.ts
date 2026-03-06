export interface AudioLoop {
  id: number;
  name: string;
  audio_file: string; // The URL from Django
  bpm: number;
  key: string;
  tags: string[];
  description?: string;
}
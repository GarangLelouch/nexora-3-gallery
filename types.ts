/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface Video {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  duration?: string;
  aspectRatio?: AspectRatio;
  rawMetadata?: any; // Stocke l'objet 'video' retourné par le modèle pour les extensions
}

export type VeoModel = 'fast' | 'quality';
export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface GenerationConfig {
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  targetDuration: number; // In seconds
  referenceImage?: string; // Base64
  extensionSourceVideo?: any; // Objet video Veo original
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

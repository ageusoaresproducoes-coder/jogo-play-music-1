/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const frequencies: Record<string, number> = {
  'DÓ': 261.63,
  'RÉ': 293.66,
  'MI': 329.63,
  'FÁ': 349.23,
  'SOL': 392.00,
  'LÁ': 440.00,
  'SI': 493.88,
};

let audioCtx: AudioContext | null = null;

export function playNote(note: string) {
  if (!audioCtx) {
    audioCtx = new window.AudioContext();
  }

  const freq = frequencies[note];
  if (!freq) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1);
}

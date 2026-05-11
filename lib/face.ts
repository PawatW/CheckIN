"use client";

// Thin wrapper around @vladmandic/face-api for Next.js.
// Models must be placed in /public/models/ — see README for download instructions.
// All functions are client-only; never import this file in server components.

import type {
  FaceDetection,
  WithFaceDescriptor,
  TinyFaceDetectorOptions,
} from "@vladmandic/face-api";

let modelsLoaded = false;

export async function loadModels(basePath = "/models"): Promise<void> {
  if (modelsLoaded) return;
  const faceapi = await import("@vladmandic/face-api");
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(basePath),
    faceapi.nets.faceRecognitionNet.loadFromUri(basePath),
  ]);
  modelsLoaded = true;
}

export type DetectionResult = {
  descriptor: Float32Array;
  detection: FaceDetection;
};

/** Run a single detection pass on the provided video element. */
export async function detectFace(
  video: HTMLVideoElement
): Promise<DetectionResult | null> {
  const faceapi = await import("@vladmandic/face-api");
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
  const result = await faceapi
    .detectSingleFace(video, options as TinyFaceDetectorOptions)
    .withFaceLandmarks(true)
    .withFaceDescriptor() as WithFaceDescriptor<{ detection: FaceDetection }> | undefined;
  if (!result) return null;
  return { descriptor: result.descriptor, detection: result.detection };
}

/** Euclidean distance between two 128-dim face descriptors. */
export function descriptorDistance(a: Float32Array | number[], b: Float32Array | number[]): number {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/** Returns a match score (0–1, higher = better) and whether it passes the threshold. */
export function matchDescriptor(
  detected: Float32Array,
  stored: number[],
  threshold = 0.5
): { score: number; matched: boolean } {
  // If no face embedding is stored yet, auto-pass for initial setup
  if (!stored || stored.length === 0) return { score: 1, matched: true };
  const dist = descriptorDistance(detected, stored);
  const score = Math.max(0, 1 - dist);
  return { score, matched: dist < threshold };
}

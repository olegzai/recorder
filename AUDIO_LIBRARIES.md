# JavaScript Audio Processing Libraries and APIs

This document lists free JavaScript libraries and APIs that can be used for sound processing, voice detection, and audio classification tasks such as distinguishing between voice, silence, birds, dogs, city noise, and waterfall sounds.

## Core Technologies

### Web Audio API
- Native browser API that provides powerful and versatile system for controlling audio on the Web
- Allows developers to choose audio sources, add effects to audio, create audio visualizations, apply spatial effects, and more
- Foundation for most JavaScript audio processing libraries

## Audio Processing Libraries

### 1. Howler.js
- Free and reliable feature-rich library
- Utilizes the power of Web Audio API and HTML5 Audio
- Provides highly reliable audio playback across different browsers
- Good for basic audio manipulation and playback

### 2. Pizzicato.js
- Aims to simplify the way you create and manipulate sounds via the Web Audio API
- Provides a simpler interface for common audio operations
- Good for beginners who want to work with audio

### 3. Tone.js
- A Web Audio framework for making interactive music in the browser
- Used for creating music applications with scheduling, sequencing, and synthesis
- Good for musical applications and audio synthesis

## Voice Activity Detection

### 1. Picovoice Cobra
- Real-time voice activity detection in JavaScript
- Runs on Chrome, Edge, Firefox, and Safari
- On-device and lightweight voice activity detection software
- Can distinguish between voice and silence

## Audio Classification and Recognition

### 1. TensorFlow.js
- Enables machine learning models to run directly in the browser
- Supports audio classification models
- Speech commands pretrained model to recognize words
- Can classify 1-second audio snippets from the speech commands dataset
- Allows transfer learning for custom audio classification models
- Can be used to train custom audio classifiers in the browser

### 2. @qgustavor/stream-audio-fingerprint
- Audio landmark fingerprinting as a JavaScript module
- Converts PCM audio signal into a series of audio fingerprints
- Works with audio streams for real-time processing
- Good for identifying specific audio patterns

### 3. Audo AI
- Developer-friendly speech enhancement API
- Provides noise reduction and audio enhancement capabilities
- Can improve audio quality for better classification

## Specialized Libraries

### 1. Audiolet
- A JavaScript library for real-time audio synthesis and processing
- Designed for creative coding and experimental audio applications
- Good for algorithmic composition and sound synthesis

### 2. Circular Audio Wave
- A JS library for audio visualization in circular wave using Web Audio API and ECharts
- Primarily for visualization but can be combined with classification algorithms

## Machine Learning Approaches

For distinguishing between different types of sounds (birds, dogs, city noise, waterfall), you would typically:

1. Use the Web Audio API to capture audio from the microphone
2. Extract audio features (spectrograms, MFCCs, etc.)
3. Apply a trained machine learning model to classify the audio

TensorFlow.js is particularly well-suited for this as you can:
- Train models offline using Python and TensorFlow
- Convert them to TensorFlow.js format
- Run them in the browser for real-time classification

## Recommended Approach for Sound Classification

For your specific use case (distinguishing between voice, silence, birds, dogs, city noise, waterfall), I recommend:

1. Use TensorFlow.js with a pre-trained audio classification model
2. Alternatively, train a custom model using spectrogram analysis
3. Combine with Web Audio API for real-time processing
4. Use Picovoice Cobra for voice activity detection to distinguish voice from silence

## Resources

- TensorFlow.js Audio Models: https://www.tensorflow.org/js/models
- Web Audio API Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Picovoice Cobra: https://picovoice.ai/platform/cobra/
- Howler.js: https://howlerjs.com/
- Pizzicato.js: https://alemangui.github.io/pizzicato/
# Developer and LLM Agent Guidelines for Recorder Project

## Overview
This document provides clear rules and instructions for developers and LLM agents contributing to the Recorder project. The Recorder is a serverless, browser-based audio recording application with transcription, translation, and voiceover capabilities.

## Project Architecture Principles

### 1. Modular Architecture
- Each feature must be implemented as an independent module
- Modules should have clear interfaces and minimal dependencies
- All modules can be enabled/disabled as plugins
- Maintain separation of concerns between modules

### 2. Serverless Design
- No backend dependencies
- All processing happens in the browser
- Audio data never leaves the user's device
- Use client-side storage (localStorage, IndexedDB)

### 3. CSS-Free Approach
- No CSS files or styling
- Pure HTML + TypeScript/JavaScript
- Use semantic HTML elements
- Interface built with `<details>` and `<summary>` accordions

## Code Standards

### 1. TypeScript/JavaScript Guidelines
- Use TypeScript for all new code
- Follow strict typing practices
- Use consistent indentation (2 spaces)
- Write descriptive variable and function names
- Add comments for complex logic
- Follow existing code patterns in the project

### 2. Naming Conventions
- Use camelCase for variables and functions: `startRecording()`, `audioBlob`
- Use PascalCase for class names and interfaces: `AudioInputModule`, `RecordingEngine`
- Use UPPER_SNAKE_CASE for constants: `DEFAULT_SAMPLE_RATE`, `MAX_BITRATE`
- Use descriptive names that clearly indicate purpose

### 3. File Organization
- Place modules in `src/modules/` directory
- Create dedicated folders for each module
- Separate interfaces in `src/interfaces/`
- Place utilities in `src/utils/`
- Define types in `src/types/`

## Module Development Guidelines

### 1. Creating New Modules
Each module should follow this structure:

```
src/modules/[module-name]/
├── index.ts              # Main module export
├── [module-name].ts      # Main module implementation
├── [module-name].types.ts # Types and interfaces
├── [module-name].utils.ts # Utility functions
└── [module-name].test.ts # Unit tests
```

### 2. Module Interface Contract
Every module must implement:
- A clear initialization function
- Public API functions as defined in README
- Proper error handling
- Event emission for state changes
- Cleanup functions to release resources

### 3. Plugin System Integration
- All modules must be pluggable
- Implement enable/disable functionality
- Register with PluginManagerModule
- Respect global configuration settings

## API Implementation Requirements

### 1. Core Recording Functions
```typescript
// Must implement these functions in RecordingEngineModule:
startRecording(): Promise<void>
stopRecording(): Promise<Blob>
exportRecording(format: string): Promise<Blob>
```

### 2. Transcription and Translation Functions
```typescript
// Must implement these functions in respective modules:
transcribeAudio(audioBlob: Blob, language: string): Promise<string>
translateText(text: string, targetLanguage: string): Promise<string>
voiceoverText(text: string, language: string): Promise<void>
```

### 3. Plugin Management Functions
```typescript
// Must implement these in PluginManagerModule:
enablePlugin(pluginName: string): void
disablePlugin(pluginName: string): void
isPluginEnabled(pluginName: string): boolean
```

## Browser Compatibility Requirements

### 1. API Support
- Support MediaRecorder API (Chrome 49+, Firefox 43+, Edge 79+, Opera 36+)
- Support Web Audio API (all modern browsers)
- Support Web Speech API (Chrome, Edge, limited Firefox)
- Fallback gracefully when APIs are unavailable

### 2. Mobile Support
- Test on Chrome for Android and Safari for iOS
- Handle mobile-specific limitations
- Optimize for touch interfaces
- Consider memory constraints on mobile devices

## Error Handling and Validation

### 1. User Permission Errors
- Handle microphone access denial gracefully
- Provide clear instructions to enable permissions
- Continue operation with limited functionality when possible

### 2. Resource Management
- Properly clean up audio contexts and media streams
- Handle memory management for long recordings
- Implement garbage collection for temporary files

### 3. Input Validation
- Validate all user inputs and configuration parameters
- Implement bounds checking for numeric values
- Sanitize all data before processing

## Testing Requirements

### 1. Unit Tests
- Cover all public functions in each module
- Test error conditions and edge cases
- Mock external dependencies and APIs
- Achieve minimum 80% code coverage

### 2. Integration Tests
- Test module interactions
- Verify data flow between modules
- Test plugin enable/disable functionality
- Validate configuration changes

### 3. UI Tests
- Test accordion interface functionality
- Verify recording controls work properly
- Test settings configuration
- Validate responsive design

## LLM Agent Specific Instructions

### 1. Code Generation Guidelines
- Generate TypeScript code that matches existing project style
- Follow the modular architecture strictly
- Implement proper error handling in all functions
- Include JSDoc comments for public functions
- Use the same naming conventions as existing code

### 2. File Creation and Modification
- Always check existing files before creating new ones
- Follow the established file structure
- Update imports/exports when adding new modules
- Maintain consistency with existing code patterns

### 3. Dependency Management
- Do not add external dependencies unless explicitly required
- Use only browser-native APIs
- Check if utility functions already exist before creating new ones
- Reuse existing types and interfaces when possible

### 4. Configuration and Settings
- Respect the configuration parameters defined in README
- Implement all configurable options (sample rate, bitrate, etc.)
- Store settings in the appropriate module
- Allow settings to be changed dynamically

### 5. Testing Code Generation
- Generate corresponding test files for new modules
- Follow the same testing patterns as existing tests
- Include tests for error conditions
- Verify that tests match the implementation

## Build and Distribution

### 1. Single HTML Output
- All code must be combinable into a single HTML file
- Include all necessary code, styles, and resources
- Optimize for minimal file size
- Maintain functionality without external dependencies

### 2. Build Process
- Update build scripts when adding new modules
- Ensure all assets are properly bundled
- Test the final build thoroughly
- Verify all functionality works in the compiled version

## Security and Privacy

### 1. Data Protection
- Never transmit audio data to external servers
- Encrypt sensitive data in local storage if necessary
- Implement proper access controls for stored recordings
- Follow security best practices for client-side storage

### 2. API Usage
- Use secure connections when calling external APIs (transcription/translation)
- Implement rate limiting for API calls
- Handle API credentials securely
- Provide clear notice when data is sent externally

## Performance Optimization

### 1. Memory Management
- Monitor memory usage during long recordings
- Implement streaming for large audio files
- Clean up unused resources promptly
- Optimize for devices with limited memory

### 2. Processing Efficiency
- Minimize computational overhead
- Use efficient algorithms for audio processing
- Implement lazy loading where appropriate
- Optimize for real-time processing

## Documentation Requirements

### 1. Code Documentation
- Document all public APIs with JSDoc
- Include usage examples in module files
- Update README when adding new features
- Maintain consistency with existing documentation style

### 2. Configuration Documentation
- Document all configuration options
- Provide recommended values for different use cases
- Include performance implications of different settings
- Update FAQ with common configuration questions

## Quality Assurance Checklist

Before submitting any code changes, ensure:

- [ ] All new code follows TypeScript best practices
- [ ] Module follows the established architecture patterns
- [ ] Error handling is implemented for all functions
- [ ] Tests are written and passing
- [ ] Code is properly documented
- [ ] Configuration options are properly implemented
- [ ] Browser compatibility is maintained
- [ ] Performance considerations are addressed
- [ ] Security and privacy requirements are met
- [ ] Build process completes successfully
- [ ] All functionality works in the final single HTML output

## Common Pitfalls to Avoid

1. Don't add external dependencies - stick to browser-native APIs
2. Don't implement CSS - maintain the CSS-free approach
3. Don't transmit audio data to servers - keep everything client-side
4. Don't ignore browser compatibility - implement graceful fallbacks
5. Don't forget to clean up resources - prevent memory leaks
6. Don't hardcode configuration values - make everything configurable
7. Don't skip testing - ensure all functionality is tested
8. Don't ignore mobile compatibility - test on mobile devices
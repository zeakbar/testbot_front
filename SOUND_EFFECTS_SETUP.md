# Sound Effects Setup Guide

The test solving experience now includes sound effects using **Howler.js**, a powerful audio library. This guide explains how to add sound files to your project.

## Where to Put Sound Files

Create a `sounds` folder in your `public` directory:

```
public/
├── sounds/
│   ├── correct.mp3
│   ├── incorrect.mp3
│   └── complete.mp3
└── (other public assets)
```

## Free Sound Effect Resources

Here are recommended websites to download royalty-free sound effects:

### 1. **Freesound.org** (Recommended)
   - URL: https://freesound.org/
   - Large library of free sounds
   - Search: "correct", "wrong", "success", "completion"
   - License: Creative Commons (check licenses for each download)

### 2. **Zapsplat**
   - URL: https://www.zapsplat.com/
   - Free high-quality sound effects
   - No registration required for downloads
   - Search: "UI sounds", "success sounds", "error sounds"

### 3. **Pixabay**
   - URL: https://pixabay.com/sound-effects/
   - Completely royalty-free
   - High-quality audio files

### 4. **OpenGameArt**
   - URL: https://opengameart.org/
   - Game-focused sound effects
   - Great for educational/gaming context

## Sound Files Needed

### 1. **correct.mp3** - For correct answer
   - Search terms: "correct", "success", "positive", "ding", "bell"
   - Duration: 0.5 - 1.5 seconds
   - Uplifting, positive tone
   - Suggested: "game correct sound" or "positive feedback"

### 2. **incorrect.mp3** - For incorrect answer
   - Search terms: "incorrect", "wrong", "error", "buzz", "negative"
   - Duration: 0.5 - 1.0 seconds
   - Neutral or gentle error tone
   - Suggested: "game wrong sound" or "error buzz"

### 3. **complete.mp3** - For test completion
   - Search terms: "complete", "finish", "congratulations", "celebration", "fanfare"
   - Duration: 1.0 - 2.0 seconds
   - Celebratory, positive tone
   - Suggested: "game win sound" or "achievement complete"

## How Sound Effects Are Used

The sound effects are triggered at these points:

```
correct.mp3  → When user selects the correct answer
incorrect.mp3 → When user selects the wrong answer (optional)
complete.mp3 → When user completes the entire test
```

## Sound System Configuration

The sound system is located in `src/utils/soundSystem.ts`. You can:

- **Adjust volume**: Edit the `volume: 0.5` property (0.0 - 1.0)
- **Add new sounds**: Add entries to the `SOUNDS` object
- **Disable/enable**: Use `soundSystem.toggleMute(false)` to disable

Example: Changing volume

```typescript
// In soundSystem.ts
this.sounds[key] = new Howl({
  src: [path],
  volume: 0.7, // Increase volume to 0.7
});
```

## Implementation Details

The sound system is used in:
- `src/pages/QuestionDetailPage/QuestionDetailPage.tsx` - Triggers on answer selection
- `src/pages/QuestionDetailPage/QuestionDetailPage.tsx` - Triggers on test completion

## Troubleshooting

### Sounds Not Playing?
1. Check if files exist in `public/sounds/` folder
2. Verify file names match exactly: `correct.mp3`, `incorrect.mp3`, `complete.mp3`
3. Check browser console for errors
4. Ensure audio files are in MP3 format (other formats may not work)

### File Format Recommendations
- **Format**: MP3 (best browser compatibility)
- **Bitrate**: 128 kbps or higher
- **Sample Rate**: 44.1 kHz or higher
- **File Size**: Under 200KB per sound

### Converting Audio Files
If you download WAV or OGG files, convert them to MP3 using:
- **Online**: ffmpeg.org, CloudConvert, or Audacity
- **Desktop**: Audacity (free), ffmpeg, or iTunes

## Next Steps

1. Download 3 sound files from one of the recommended resources
2. Create `public/sounds/` folder
3. Name them: `correct.mp3`, `incorrect.mp3`, `complete.mp3`
4. Test by taking a quiz and listening to the sounds

Enjoy! 🎵

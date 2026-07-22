1.  **Refactor the Music Post Player in `src/components/post-card.tsx`**
    - Import `react-youtube` or manually use YouTube Iframe API. Using `react-youtube` handles lifecycle nicely in React.
    - Create a custom audio player UI when a user plays a music post.
    - The UI should include:
      - Thumbnail / Cover.
      - Song Title & Artist.
      - Play/Pause button.
      - Progress bar.
      - Elapsed time / Total duration.
    - The YouTube iframe should be hidden (e.g., `w-0 h-0 opacity-0 fixed pointer-events-none`).
    - Connect the custom UI controls to the YouTube player instance (using the `onReady` event to grab the player reference).
    - Use `requestAnimationFrame` or `setInterval` to update the current time / progress bar while the video is playing.
    - Handle play (`player.playVideo()`), pause (`player.pauseVideo()`), and seek (`player.seekTo(seconds)`).
2.  **Pre-commit checks**
    - Run ESLint (`bun run lint`).
    - Run TypeScript check (`npx tsc --noEmit`).
    - Follow any agents instructions (if present).

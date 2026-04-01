# Vision Aid

## Aim

Vision Aid is a Chrome extension designed to support users who experience visual strain or reading difficulties while using their browser. The goal of the extension is to make on-screen reading more comfortable and accessible for people dealing with symptoms related to dyslexia, accommodative spasm, convergence issues, eye strain, and general visual fatigue.

Rather than acting as a medical tool, Vision Aid serves as a practical on-screen support system that gives users simple visual assistance features directly inside their browser. 

## Disclaimer

Vision Aid is intended as an accessibility and comfort tool. It is not a medical device and is not meant to diagnose, treat, or replace professional care.

## Features

### Reading Guide Bar
The Reading Guide Bar places a red horizontal guide line across the screen that follows the user’s cursor. This helps users keep track of where they are while reading and can make large blocks of text feel less overwhelming.

### 20-20-20 Timer
The 20-20-20 Timer encourages healthier screen habits by reminding users to take visual breaks. After a chosen amount of time, the extension prompts the user to look away from the screen and relax their eyes to reset them.

### Bionic Reading
Bionic Reading bolds the beginning part of words to make text easier to scan. This can help guide the eyes through sentences and may improve readability for some users, specifically users with dyslexia or ADHD.

### Blink Reminders
Blink Reminders periodically display a prompt that reminds users to blink. This is useful during long periods of screen use, when people often blink less frequently and experience dryness or discomfort.

### Focus Mode
Focus Mode helps the user concentrate on a selected region of the page by dimming the surrounding content. This can reduce distraction and make it easier to direct attention to one specific area at a time.

### Text Line Isolation
Text Line Isolation highlights a narrow horizontal reading area that follows the mouse. This supports users who find it difficult to track lines of text or who lose their place easily while reading.

### Large Cursor
Large Cursor adds a more visible custom cursor overlay to improve cursor tracking. This can be helpful for users who struggle to find or follow the normal mouse pointer on screen.

### Relax My Eyes
The Relax My Eyes button manually triggers a full-screen reminder for the user to rest their eyes. This gives a quick way to take a break without waiting for the timer.

### Adjustable Settings
The extension includes settings that allow users to customize:
- relax duration
- blink reminder interval

This allows the experience to be more flexible based on personal comfort and needs.

## Why This Project Matters

Many browser experiences are designed for the average user and do not always consider people with different visual needs. Vision Aid aims to make the web a little more comfortable and usable by offering lightweight tools that can be turned on and off as needed.

This project focuses on accessibility, usability, and real-world support for people who may benefit from small but meaningful visual adjustments during everyday screen use.


## Tech Stack

- **HTML** for the popup structure
- **CSS** for the extension interface styling
- **JavaScript** for popup logic, content script behavior, and background timers
- **Chrome Extension Manifest V3** for browser integration


## How It Works

Vision Aid uses:
- a **popup interface** for user controls
- a **content script** to modify the current webpage
- a **background script** to manage timers and reminders
- **Chrome storage** to save user settings and toggle states

This allows the extension to remember user preferences and re-apply enabled features when the extension is opened again.

## Future Considerations

Possible future improvements include:

- support for more customizable colors and themes
- screen dimming or contrast overlays
- hydration or break habit tracking
- support for color blindness assistance
- a dashboard for daily visual wellness habits

## Author

Built as a project focused on accessibility, usability, and visual support in everyday browsing.
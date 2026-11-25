# Smart Clock

A lightweight browser-based digital clock with an animated number display, local date, optional 12-hour format, and switchable backgrounds.

## Features

- Displays the current local time with animated digit strips.
- Starts in 24-hour format; use the switch to change to 12-hour format.
- Shows the local date and updates it when the day changes.
- Offers several background gradients.
- Renders the current time immediately instead of waiting for the first timer tick.
- Includes accessible labels for the time display and format switch.

## Run locally

No build step or package installation is required. Open `index.html` in a modern browser, or serve the folder with a local static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

The font is loaded from Google Fonts; the clock itself uses browser-native JavaScript and CSS.

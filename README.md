# Smart Clock

A responsive browser clock with multiple display styles, selectable themes, custom accent colors, and time-zone controls. It is built with vanilla HTML, CSS, and JavaScript—no framework, package installation, or build step required.

## Clock styles

- **Flip** — segmented, card-style digits.
- **Digital** — large monospaced time display.
- **Analog** — clock face with hour, minute, and second hands.
- **Minimal** — simplified typography-focused display.

## Personalization

- Four built-in themes: Midnight, Light, Aurora, and Sunset.
- Custom accent color picker.
- 12-hour or 24-hour time format.
- Select local time or a supported time zone: UTC, Kolkata, London, Paris, New York, Los Angeles, Dubai, Singapore, Tokyo, and Sydney.
- Show or hide seconds, date, and time-zone details independently.
- Reset all options to the default configuration.
- Settings are saved in the browser using `localStorage`.

The clock uses the browser's `Intl.DateTimeFormat` API for time-zone-aware formatting, including daylight-saving rules supported by the browser's time-zone database.

## Run locally

No dependencies are required. Open `index.html` in a modern browser, or start a local static server from the project directory:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

The visual fonts are loaded from Google Fonts. If the fonts cannot be loaded, the page falls back to system fonts and the clock still works.

## Browser support

Use a modern browser with support for `Intl.DateTimeFormat`, `formatToParts`, and `localStorage`. Selected settings remain on the current device and browser; they are not synchronized between devices.

## Accessibility

- Controls are native buttons, selects, and checkboxes.
- Clock display has an accessible text label.
- Keyboard focus is visible.
- Reduced-motion preferences are respected.

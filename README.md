# Smart Clock

A responsive, customizable browser clock built with vanilla HTML, CSS, and JavaScript. Choose a clock face, theme, accent color, and time zone to make the display fit your desk or screen.

## Clock faces

- **Flip** — segmented card-style digits with a classic clock feel.
- **Digital** — large monospaced time display.
- **Analog** — a clock dial with hour, minute, and second hands.
- **Minimal** — a typography-first display with less visual noise.

## Personalization

- **Themes:** Midnight, Light, Aurora, and Sunset.
- **Accent color:** choose a custom color for highlights and controls.
- **Time format:** 12-hour or 24-hour.
- **Time zone:** local time, UTC, Kolkata, London, Paris, New York, Los Angeles, Dubai, Singapore, Tokyo, or Sydney.
- **Display options:** independently show or hide seconds, date, and time-zone details.
- **Reset:** restore the default clock settings at any time.

Your preferences are saved in the current browser with `localStorage`. Settings remain on that device and are not synchronized between browsers or devices.

## Time-zone handling

The clock uses `Intl.DateTimeFormat` with IANA time-zone identifiers. The browser's time-zone database handles applicable daylight-saving changes and local offsets. Local mode follows the device's configured time zone.

## Run locally

No dependencies or build step are required. Open `index.html` in a modern browser, or run a static server from the project directory:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

The interface uses Google Fonts for its typography. If the font service is unavailable, system fallbacks are used; the clock itself continues to work.

## Accessibility and browser support

- Controls use native buttons, checkboxes, and a select element.
- The clock face exposes an accessible text description of the current time and selected time zone.
- Keyboard focus indicators are visible.
- Reduced-motion preferences are respected.
- Use a modern browser with support for `Intl.DateTimeFormat`, `formatToParts`, and `localStorage`.

const DEFAULT_SETTINGS = {
  style: "flip",
  theme: "midnight",
  format: "24",
  timeZone: "local",
  showSeconds: true,
  showDate: true,
  showTimezone: true,
  accent: ""
};

const STORAGE_KEY = "smart-clock-settings-v2";
const VALID_STYLES = ["flip", "digital", "analog", "minimal"];
const VALID_THEMES = ["midnight", "light", "aurora", "sunset"];

const root = document.body;
const clockFace = document.getElementById("clockFace");
const locationName = document.getElementById("locationName");
const dateLabel = document.getElementById("dateLabel");
const timezoneLabel = document.getElementById("timezoneLabel");
const dayPeriod = document.getElementById("dayPeriod");
const timeZoneSelect = document.getElementById("timeZone");
const accentInput = document.getElementById("accentColor");
const accentValue = document.getElementById("accentValue");
const savedNote = document.getElementById("savedNote");

let settings = loadSettings();

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = { ...DEFAULT_SETTINGS, ...stored };

    if (!VALID_STYLES.includes(merged.style)) merged.style = DEFAULT_SETTINGS.style;
    if (!VALID_THEMES.includes(merged.theme)) merged.theme = DEFAULT_SETTINGS.theme;
    if (!["12", "24"].includes(String(merged.format))) merged.format = DEFAULT_SETTINGS.format;
    if (typeof merged.timeZone !== "string") merged.timeZone = "local";
    if (typeof merged.showSeconds !== "boolean") merged.showSeconds = true;
    if (typeof merged.showDate !== "boolean") merged.showDate = true;
    if (typeof merged.showTimezone !== "boolean") merged.showTimezone = true;
    if (typeof merged.accent !== "string" || !/^#[0-9a-f]{6}$/i.test(merged.accent)) merged.accent = "";

    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    savedNote.textContent = "Settings saved on this device";
  } catch {
    savedNote.textContent = "Settings active for this session";
  }
}

function getTimeZone() {
  const requested = settings.timeZone === "local"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : settings.timeZone;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: requested });
    return requested;
  } catch {
    settings.timeZone = "local";
    timeZoneSelect.value = "local";
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

function getClockParts(date) {
  const timeZone = getTimeZone();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: settings.format === "12" ? "h12" : "h23"
    }).formatToParts(date).map((part) => [part.type, part.value])
  );

  const hour24 = Number(new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23"
  }).format(date));

  return {
    hour: Number(parts.hour),
    hour24,
    minute: Number(parts.minute),
    second: Number(parts.second),
    period: parts.dayPeriod || "",
    timeZone
  };
}

function getTimeZoneLabel(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short"
  }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value || timeZone;
}

function getDateLabel(date, timeZone) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatNumber(value) {
  return String(value).padStart(2, "0");
}

function buildAnalogFace() {
  const ticks = Array.from({ length: 60 }, (_, index) => {
    const angle = index * 6;
    const major = index % 5 === 0;
    return `<span class="analog-tick ${major ? "major" : ""}" style="transform:rotate(${angle}deg) translateY(-99px)"></span>`;
  }).join("");

  const numerals = Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const angle = (number * 30 - 90) * Math.PI / 180;
    const radius = 79 / 2.2;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    return `<span class="analog-number" style="left:${x}%;top:${y}%">${number}</span>`;
  }).join("");

  clockFace.innerHTML = `<div class="analog-display" aria-hidden="true">
    ${ticks}${numerals}
    <span class="analog-hand hour" id="hourHand"></span>
    <span class="analog-hand minute" id="minuteHand"></span>
    <span class="analog-hand second" id="secondHand"></span>
    <span class="analog-center"></span>
  </div>`;
}

function setStyle(style) {
  settings.style = VALID_STYLES.includes(style) ? style : DEFAULT_SETTINGS.style;

  document.querySelectorAll("[data-style]").forEach((button) => {
    const active = button.dataset.style === settings.style;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  clockFace.className = `clock-face face-${settings.style}`;

  if (settings.style === "analog") {
    buildAnalogFace();
  } else if (settings.style === "flip") {
    clockFace.innerHTML = `<div class="flip-display" aria-hidden="true">
      <span class="flip-digit" id="hourDigits">--</span><span class="time-separator">:</span>
      <span class="flip-digit" id="minuteDigits">--</span><span class="time-separator seconds-separator">:</span>
      <span class="flip-digit small-digit" id="secondDigits">--</span>
    </div>`;
  } else if (settings.style === "digital") {
    clockFace.innerHTML = `<div class="digital-display" aria-hidden="true">
      <span id="hourDigits">--</span><span class="colon">:</span><span id="minuteDigits">--</span><span class="colon seconds-colon">:</span>
      <span class="seconds" id="secondDigits">--</span>
    </div>`;
  } else {
    clockFace.innerHTML = `<div class="minimal-display" aria-hidden="true">
      <span id="hourDigits">--</span><span class="colon">:</span><span id="minuteDigits">--</span>
      <span class="seconds" id="secondDigits">--</span>
    </div>`;
  }

  renderClock();
  saveSettings();
}

function setTheme(theme, resetAccent = true) {
  settings.theme = VALID_THEMES.includes(theme) ? theme : DEFAULT_SETTINGS.theme;
  root.dataset.theme = settings.theme;

  document.querySelectorAll(".theme-swatch").forEach((button) => {
    const active = button.dataset.theme === settings.theme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (resetAccent) settings.accent = "";
  applyAccent();
  saveSettings();
}

function hexToRgb(hex) {
  const number = Number.parseInt(hex.slice(1), 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

function applyAccent() {
  if (settings.accent) {
    const [red, green, blue] = hexToRgb(settings.accent);
    root.style.setProperty("--accent", settings.accent);
    root.style.setProperty("--accent-rgb", `${red},${green},${blue}`);
  } else {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-rgb");
  }

  const currentAccent = settings.accent ||
    getComputedStyle(root).getPropertyValue("--accent").trim() || "#a78bfa";
  accentInput.value = currentAccent;
  accentValue.textContent = currentAccent.toUpperCase();
}

function updateClock() {
  const now = new Date();
  const parts = getClockParts(now);
  const hourText = formatNumber(parts.hour);
  const minuteText = formatNumber(parts.minute);
  const secondText = formatNumber(parts.second);

  if (settings.style === "analog") {
    const hourAngle = ((parts.hour24 % 12) + parts.minute / 60) * 30;
    const minuteAngle = (parts.minute + parts.second / 60) * 6;
    const secondAngle = parts.second * 6;
    document.getElementById("hourHand").style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
    document.getElementById("minuteHand").style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
    document.getElementById("secondHand").style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
  } else {
    const hours = document.getElementById("hourDigits");
    const minutes = document.getElementById("minuteDigits");
    const seconds = document.getElementById("secondDigits");
    if (hours) hours.textContent = hourText;
    if (minutes) minutes.textContent = minuteText;
    if (seconds) seconds.textContent = secondText;
  }

  clockFace.classList.toggle("hide-seconds", !settings.showSeconds);
  dateLabel.hidden = !settings.showDate;
  timezoneLabel.hidden = !settings.showTimezone;
  dateLabel.textContent = getDateLabel(now, parts.timeZone);
  timezoneLabel.textContent = `${getTimeZoneLabel(now, parts.timeZone)} · ${parts.timeZone}`;
  dayPeriod.textContent = settings.format === "12" ? parts.period.toUpperCase() : "24 HOUR";
  dayPeriod.hidden = settings.format !== "12";

  const selectedOption = timeZoneSelect.options[timeZoneSelect.selectedIndex];
  locationName.textContent = settings.timeZone === "local"
    ? "YOUR LOCAL TIME"
    : selectedOption.text.toUpperCase();

  const readableTime = new Intl.DateTimeFormat(undefined, {
    timeZone: parts.timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: settings.format === "12"
  }).format(now);
  clockFace.setAttribute("aria-label", `Current time in ${parts.timeZone}: ${readableTime}`);
}

function renderClock() {
  updateClock();
}

function syncControls() {
  timeZoneSelect.value = settings.timeZone;
  if (timeZoneSelect.value !== settings.timeZone) {
    settings.timeZone = "local";
    timeZoneSelect.value = "local";
  }

  document.querySelectorAll("[data-format]").forEach((button) => {
    const active = button.dataset.format === settings.format;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  document.getElementById("showSeconds").checked = settings.showSeconds;
  document.getElementById("showDate").checked = settings.showDate;
  document.getElementById("showTimezone").checked = settings.showTimezone;

  document.querySelectorAll(".theme-swatch").forEach((button) => {
    const active = button.dataset.theme === settings.theme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll("[data-style]").forEach((button) => {
    const active = button.dataset.style === settings.style;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

document.querySelectorAll("[data-style]").forEach((button) => {
  button.addEventListener("click", () => setStyle(button.dataset.style));
});

document.querySelectorAll(".theme-swatch").forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.theme));
});

document.querySelectorAll("[data-format]").forEach((button) => {
  button.addEventListener("click", () => {
    settings.format = button.dataset.format;
    syncControls();
    renderClock();
    saveSettings();
  });
});

timeZoneSelect.addEventListener("change", () => {
  settings.timeZone = timeZoneSelect.value;
  renderClock();
  saveSettings();
});

accentInput.addEventListener("input", () => {
  settings.accent = accentInput.value;
  applyAccent();
  saveSettings();
});

[
  ["showSeconds", "showSeconds"],
  ["showDate", "showDate"],
  ["showTimezone", "showTimezone"]
].forEach(([elementId, key]) => {
  document.getElementById(elementId).addEventListener("change", (event) => {
    settings[key] = event.target.checked;
    renderClock();
    saveSettings();
  });
});

document.getElementById("resetSettings").addEventListener("click", () => {
  settings = { ...DEFAULT_SETTINGS };
  root.dataset.theme = settings.theme;
  applyAccent();
  syncControls();
  setStyle(settings.style);
  saveSettings();
});

function initialize() {
  root.dataset.theme = settings.theme;
  syncControls();
  applyAccent();
  setStyle(settings.style);
  window.setInterval(updateClock, 1000);
}

initialize();

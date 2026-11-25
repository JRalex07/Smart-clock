const strips = [...document.querySelectorAll(".strip")];
const numbersize = 8;

const formatToggle = document.getElementById("toggleFormat");
const clockElement = document.getElementById("clock");
const ampmElement = document.getElementById("ampm");
const dateElement = document.getElementById("date");

let is24Hour = true;
let lastRenderedDate = "";

function highlight(stripe, digit) {
  const numberElement = strips[stripe]?.querySelector(
    `.number:nth-of-type(${digit + 1})`
  );

  if (!numberElement) return;

  numberElement.classList.add("pop");

  setTimeout(() => {
    numberElement.classList.remove("pop");
  }, 950);
}

function stripeSlider(stripe, value) {
  const tens = Math.floor(value / 10);
  const units = value % 10;

  if (!strips[stripe] || !strips[stripe + 1]) return;

  strips[stripe].style.transform = `translateY(${-tens * numbersize}vmin)`;
  highlight(stripe, tens);

  strips[stripe + 1].style.transform = `translateY(${-units * numbersize}vmin)`;
  highlight(stripe + 1, units);
}

function updateDate(now) {
  const dateKey = [
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ].join("-");

  if (dateKey === lastRenderedDate) return;

  lastRenderedDate = dateKey;
  dateElement.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();

  updateDate(now);

  if (!is24Hour) {
    const isPM = hours >= 12;
    hours = hours % 12 || 12;
    ampmElement.textContent = isPM ? "PM" : "AM";
    ampmElement.classList.remove("hidden");
  } else {
    ampmElement.textContent = "";
    ampmElement.classList.add("hidden");
  }

  stripeSlider(0, hours);
  stripeSlider(2, now.getMinutes());
  stripeSlider(4, now.getSeconds());

  const readableTime = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !is24Hour
  });

  clockElement.setAttribute("aria-label", `Current local time: ${readableTime}`);
  formatToggle.setAttribute(
    "aria-label",
    is24Hour ? "Switch to 12-hour time format" : "Switch to 24-hour time format"
  );
}

formatToggle.addEventListener("change", () => {
  is24Hour = !formatToggle.checked;
  updateClock();
});

const backgrounds = [
  "linear-gradient(-45deg, #c4d3ef, #dfe6f6)",
  "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  "linear-gradient(120deg, #a1c4fd, #c2e9fb)",
  "linear-gradient(to right, #fbc2eb, #a6c1ee)",
  "linear-gradient(60deg, #84fab0, #8fd3f4)",
  "linear-gradient(180deg, #add8e6, #e6e6fa)",
  "linear-gradient(0deg, #004e92, #7b4397)"
];

let backgroundIndex = 0;

document.getElementById("bgToggle").addEventListener("click", () => {
  backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
  document.body.style.background = backgrounds[backgroundIndex];
});

// Render immediately so the clock is populated on first paint.
updateClock();
window.setInterval(updateClock, 1000);

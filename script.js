let totalPay = 0;
let history = [];
let chart;

// LOAD DATA
function loadData() {
  totalPay = JSON.parse(localStorage.getItem("totalPay")) || 0;
  history = JSON.parse(localStorage.getItem("history")) || [];
}

// SAVE DATA
function saveData() {
  localStorage.setItem("totalPay", JSON.stringify(totalPay));
  localStorage.setItem("history", JSON.stringify(history));
}

// ADD SHIFT
function calculatePay() {
  let hours = parseFloat(document.getElementById("hours").value);
  let rate = parseFloat(document.getElementById("rate").value);

  if (isNaN(hours) || isNaN(rate)) {
    alert("Enter valid numbers");
    return;
  }

  let pay = hours > 40
    ? (40 * rate) + ((hours - 40) * rate * 1.5)
    : hours * rate;

  let entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    hours,
    pay
  };

  history.unshift(entry); // newest first
  totalPay += pay;

  saveData();
  updateUI();

  document.getElementById("hours").value = "";
  document.getElementById("rate").value = "";
}

// DELETE ENTRY
function deleteEntry(id) {
  history = history.filter(item => item.id !== id);
  totalPay = history.reduce((sum, item) => sum + item.pay, 0);

  saveData();
  updateUI();
}

// UPDATE UI
function updateUI() {
  let today = new Date().toDateString();
  let currentWeek = getWeekNumber(new Date());

  let todayTotal = 0;
  let weeklyTotal = 0;

  let historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  history.forEach(item => {
    let itemDate = new Date(item.date);
    let itemDay = itemDate.toDateString();

    if (itemDay === today) {
      todayTotal += item.pay;
    }

    if (getWeekNumber(itemDate) === currentWeek) {
      weeklyTotal += item.pay;
    }

    let card = document.createElement("div");
    card.className = "history-card";

    card.innerHTML = `
      <span>${itemDate.toLocaleDateString()} • ${item.hours}h • $${item.pay.toFixed(2)}</span>
      <button class="delete-btn" onclick="deleteEntry(${item.id})">X</button>
    `;

    historyDiv.appendChild(card);
  });

  document.getElementById("today").innerText = `Today: $${todayTotal.toFixed(2)}`;
  document.getElementById("weekly").innerText = `This Week: $${weeklyTotal.toFixed(2)}`;
  document.getElementById("total").innerText = `Total: $${totalPay.toFixed(2)}`;

  updateChart();
}

// WEEK NUMBER
function getWeekNumber(d) {
  d = new Date(d);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 4 - (d.getDay()||7));
  let yearStart = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// CHART
function updateChart() {
  let labels = history.map(i => new Date(i.date).toLocaleDateString());
  let data = history.map(i => i.pay);

  if (chart) chart.destroy();

  let ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Earnings",
        data
      }]
    }
  });
}

// RESET
function resetData() {
  if (confirm("Clear all data?")) {
    totalPay = 0;
    history = [];
    localStorage.clear();
    updateUI();
  }
}

// EXPORT
function exportCSV() {
  let csv = "Date,Hours,Pay\n";

  history.forEach(i => {
    csv += `${new Date(i.date).toLocaleDateString()},${i.hours},${i.pay}\n`;
  });

  let blob = new Blob([csv]);
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "work_log.csv";
  a.click();
}

// DARK MODE
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// BACKUP
function backupData() {
  prompt("Copy your backup:", JSON.stringify(history));
}

// RESTORE
function restoreData() {
  let data = prompt("Paste backup:");
  if (data) {
    history = JSON.parse(data);
    totalPay = history.reduce((sum, i) => sum + i.pay, 0);
    saveData();
    updateUI();
  }
}

// INIT
loadData();
updateUI();
const CACHE_NAME = "hours-tracker-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
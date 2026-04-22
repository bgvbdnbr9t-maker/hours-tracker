document.addEventListener("DOMContentLoaded", function () {

let totalPay = JSON.parse(localStorage.getItem("totalPay")) || 0;
let history = JSON.parse(localStorage.getItem("history")) || [];
let chart;

updateUI();

function calculatePay() {
  let hours = parseFloat(document.getElementById("hours").value);
  let rate = parseFloat(document.getElementById("rate").value);

  if (isNaN(hours) || isNaN(rate)) {
    alert("Enter valid numbers");
    return;
  }

  let pay;

  if (hours > 40) {
    let overtime = hours - 40;
    pay = (40 * rate) + (overtime * rate * 1.5);
  } else {
    pay = hours * rate;
  }

  totalPay += pay;

  let today = new Date().toLocaleDateString();

  history.push({ date: today, hours: hours, pay: pay });

  localStorage.setItem("totalPay", JSON.stringify(totalPay));
  localStorage.setItem("history", JSON.stringify(history));

  updateUI();

  document.getElementById("hours").value = "";
  document.getElementById("rate").value = "";
}

function updateUI() {
  let todayDate = new Date().toLocaleDateString();
  let todayTotal = 0;
  let weeklyTotal = 0;
  let currentWeek = getWeekNumber(new Date());

  let historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  history.forEach(item => {
    let card = document.createElement("div");
    card.className = "history-card";
    card.innerText = `${item.date} • ${item.hours} hrs • $${item.pay.toFixed(2)}`;
    historyDiv.appendChild(card);

    if (item.date === todayDate) {
      todayTotal += item.pay;
    }

    let itemWeek = getWeekNumber(new Date(item.date));
    if (itemWeek === currentWeek) {
      weeklyTotal += item.pay;
    }
  });

  document.getElementById("today").innerText =
    "Today: $" + todayTotal.toFixed(2);

  document.getElementById("weekly").innerText =
    "This Week: $" + weeklyTotal.toFixed(2);

  document.getElementById("total").innerText =
    "Total: $" + totalPay.toFixed(2);

  updateChart();
}

function getWeekNumber(d) {
  d = new Date(d);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 4 - (d.getDay()||7));
  let yearStart = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

function updateChart() {
  let labels = history.map(item => item.date);
  let data = history.map(item => item.pay);

  if (chart) chart.destroy();

  let ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Earnings",
        data: data
      }]
    }
  });
}

function resetData() {
  if (confirm("Clear all data?")) {
    totalPay = 0;
    history = [];
    localStorage.clear();
    updateUI();
  }
}

function exportCSV() {
  let csv = "Date,Hours,Pay\n";

  history.forEach(item => {
    csv += `${item.date},${item.hours},${item.pay}\n`;
  });

  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "work_log.csv";
  a.click();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function backupData() {
  let data = JSON.stringify(history);
  prompt("Copy your backup:", data);
}

function restoreData() {
  let data = prompt("Paste your backup:");
  if (data) {
    history = JSON.parse(data);
    totalPay = history.reduce((sum, item) => sum + item.pay, 0);

    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("totalPay", JSON.stringify(totalPay));

    updateUI();
  }
}

});
self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("fetch", e => {});
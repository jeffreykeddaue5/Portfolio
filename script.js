// ===== Clock =====
const clock = document.getElementById("clock");
function tick() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  clock.textContent =
    `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
tick();
setInterval(tick, 1000);

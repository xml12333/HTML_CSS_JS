let container;
let currentMonth;
let currentYear;
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

document.addEventListener("DOMContentLoaded", () => {
  container = document.getElementById("calendar");
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  renderCalendar(currentMonth, currentYear);

  document.querySelector("#prev-month").addEventListener("click", () => {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    renderCalendar(currentMonth, currentYear);
  });

  document.querySelector("#next-month").addEventListener("click", () => {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    renderCalendar(currentMonth, currentYear);
  });
});

function setDateDisplay(month, year) {
  // TODO: fix date jank
  const date = document.getElementById("date");
  function numberToMonth(number) {
    if (number < 1 || number > 12) return "Jan";
    let date = new Date(0, number);
    return date.toLocaleString("default", { month: "short" });
  }

  date.innerHTML = `${numberToMonth(month)} ${year}`;
}
function renderCalendar(month, year) {
  const data = generateCalendar(month, year);
  setDateDisplay(month, year);
  container.innerHTML = "";

  const weekdayRow = document.createElement("div");
  weekdayRow.className = "calendar__weekdays";

  for (const dayName of data.daysOfWeek) {
    const label = document.createElement("div");
    label.className = "calendar__dayname";
    label.textContent = dayName;
    weekdayRow.appendChild(label);
  }

  container.appendChild(weekdayRow);

  for (const week of data.days) {
    const weekRow = document.createElement("div");
    weekRow.className = "calendar__week";

    for (const dayObj of week) {
      const p = document.createElement("p");
      p.className = `calendar__day ${dayObj.className}`;
      p.textContent = dayObj.day;

      const dayIndex = data.daysOfWeek.indexOf(dayObj.weekday);
      // TODO: handle weekend style better
      if (dayIndex === 5 || dayIndex === 6) {
        p.classList.add("weekend");
      }

      weekRow.appendChild(p);
    }

    container.appendChild(weekRow);
  }
}

function generateCalendar(month, year) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const daysOfWeek = DAYS_OF_WEEK;
  const startDay = (firstDay.getDay() + 6) % 7; // convert to Monday=0
  const prevMonthDays = getPrevMonthDays(startDay, month, year);
  const currentMonthDays = getMonthDays(daysInMonth, month, year);
  const nextMonthDays = getNextMonthDays(startDay, daysInMonth);

  const days = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  return {
    month: month + 1,
    year,
    daysOfWeek,
    days: chunkDaysIntoWeeks(days)
  };
}

function getPrevMonthDays(startDay, month, year) {
  const prevMonthDate = new Date(year, month, 0);
  const prevMonthTotal = prevMonthDate.getDate();
  return Array.from({ length: startDay }, (_, i) => {
    const day = prevMonthTotal - startDay + i + 1;
    const weekday = DAYS_OF_WEEK[i % 7];
    return { day, className: "prev-month", weekday };
  });
}

function getMonthDays(daysInMonth, month, year) {
  const today = new Date();
  const isCurrentMonth =
    month === today.getMonth() && year === today.getFullYear();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month, day);
    const weekday = DAYS_OF_WEEK[(date.getDay() + 6) % 7];
    let className = "current-month";
    if (isCurrentMonth && day === today.getDate()) {
      className += " today";
    }
    return { day, className, weekday };
  });
}

function getNextMonthDays(startDay, daysInMonth) {
  const totalCells = startDay + daysInMonth;
  const remainder = totalCells % 7;
  const fill = remainder === 0 ? 0 : 7 - remainder;

  return Array.from({ length: fill }, (_, i) => {
    const weekday = DAYS_OF_WEEK[(i + startDay + daysInMonth) % 7];
    return { day: i + 1, className: "next-month", weekday };
  });
}

function chunkDaysIntoWeeks(days) {
  const weeks = [];
  while (days.length) {
    weeks.push(days.splice(0, 7));
  }
  return weeks;
}
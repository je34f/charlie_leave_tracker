// ================= CALENDAR =================

const TEAM_COLORS = {
    "HQ": "#6366f1",
    "1":  "#10b981",
    "2":  "#f59e0b",
    "3":  "#ef4444"
};

let calView = "month";   // "month" | "week"
let calDate = new Date();
calDate.setDate(1);

function initCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const wrap = document.getElementById("calendarWrap");
    if (!wrap) return;
    if (calView === "month") renderMonthView(wrap);
    else renderWeekView(wrap);
}

function calRequests() {
    const all = JSON.parse(localStorage.getItem("requests")) || [];
    return all.filter(r => !r.archived && (r.status === "Approved" || r.status === "Pending"));
}

function dateRange(start, end) {
    const days = [];
    const cur = new Date(start + "T00:00:00");
    const last = new Date(end + "T00:00:00");
    while (cur <= last) {
        days.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
    }
    return days;
}

function requestsOnDate(dateStr) {
    return calRequests().filter(r => {
        const days = dateRange(r.start, r.end);
        return days.includes(dateStr);
    });
}

function totalUsers() {
    return (JSON.parse(localStorage.getItem("users")) || []).length;
}

// ── MONTH VIEW ──────────────────────────────────────────────────────
function renderMonthView(wrap) {
    wrap.innerHTML = "";

    const year = calDate.getFullYear();
    const month = calDate.getMonth();

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    // Header
    const hdr = document.createElement("div");
    hdr.className = "cal-nav";
    hdr.innerHTML = `
        <button class="cal-nav-btn" id="calPrev">&#8592;</button>
        <span class="cal-title">${monthNames[month]} ${year}</span>
        <button class="cal-nav-btn" id="calNext">&#8594;</button>
    `;
    wrap.appendChild(hdr);

    // Day name headers
    const grid = document.createElement("div");
    grid.className = "cal-grid";

    dayNames.forEach(d => {
        const cell = document.createElement("div");
        cell.className = "cal-day-name";
        cell.textContent = d;
        grid.appendChild(cell);
    });

    // Blank cells before first day
    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        blank.className = "cal-cell cal-cell-empty";
        grid.appendChild(blank);
    }

    // Day cells
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const reqs = requestsOnDate(dateStr);
        const isToday = dateStr === today;

        const cell = document.createElement("div");
        cell.className = "cal-cell" + (isToday ? " cal-today" : "");

        // Date number
        const num = document.createElement("span");
        num.className = "cal-date-num";
        num.textContent = d;
        cell.appendChild(num);

        // Manpower badge
        if (reqs.length > 0) {
            const onLeave = new Set(reqs.map(r => r.user)).size;
            const avail = totalUsers() - onLeave;
            const badge = document.createElement("span");
            badge.className = "cal-manpower";
            badge.textContent = avail + "/" + totalUsers();
            cell.appendChild(badge);
        }

        // Team colour bars (up to 3 shown, rest collapsed)
        const shown = reqs.slice(0, 3);
        const extra = reqs.length - shown.length;

        shown.forEach(r => {
            const bar = document.createElement("div");
            bar.className = "cal-bar" + (r.status === "Pending" ? " cal-bar-pending" : "");
            bar.style.background = TEAM_COLORS[r.team] || "#999";
            bar.textContent = r.user.split(" ")[0];
            cell.appendChild(bar);
        });

        if (extra > 0) {
            const more = document.createElement("div");
            more.className = "cal-bar-more";
            more.textContent = "+" + extra + " more";
            cell.appendChild(more);
        }

        // Hover tooltip
        cell.addEventListener("mouseenter", (e) => showCalTooltip(e, dateStr, reqs));
        cell.addEventListener("mouseleave", hideCalTooltip);

        grid.appendChild(cell);
    }

    wrap.appendChild(grid);

    document.getElementById("calPrev").addEventListener("click", () => {
        calDate.setMonth(calDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById("calNext").addEventListener("click", () => {
        calDate.setMonth(calDate.getMonth() + 1);
        renderCalendar();
    });
}

// ── WEEK VIEW ───────────────────────────────────────────────────────
function renderWeekView(wrap) {
    wrap.innerHTML = "";

    // find Monday of current week
    const base = new Date(calDate);
    const dow = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1));

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }

    const fmt = (d) => d.toLocaleDateString("en-SG", { day: "numeric", month: "short" });
    const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const today = new Date().toISOString().slice(0, 10);

    const startStr = fmt(days[0]);
    const endStr = fmt(days[6]);

    const hdr = document.createElement("div");
    hdr.className = "cal-nav";
    hdr.innerHTML = `
        <button class="cal-nav-btn" id="calPrev">&#8592;</button>
        <span class="cal-title">${startStr} – ${endStr}</span>
        <button class="cal-nav-btn" id="calNext">&#8594;</button>
    `;
    wrap.appendChild(hdr);

    const grid = document.createElement("div");
    grid.className = "cal-week-grid";

    days.forEach((d, i) => {
        const dateStr = d.toISOString().slice(0, 10);
        const reqs = requestsOnDate(dateStr);
        const isToday = dateStr === today;

        const col = document.createElement("div");
        col.className = "cal-week-col" + (isToday ? " cal-today" : "");

        const dayHdr = document.createElement("div");
        dayHdr.className = "cal-week-day-hdr";
        dayHdr.innerHTML = `<span class="cal-week-dayname">${dayNames[i]}</span><span class="cal-week-datenum">${d.getDate()}</span>`;
        col.appendChild(dayHdr);

        if (reqs.length === 0) {
            const empty = document.createElement("div");
            empty.className = "cal-week-empty";
            empty.textContent = "—";
            col.appendChild(empty);
        } else {
            const onLeave = new Set(reqs.map(r => r.user)).size;
            const avail = totalUsers() - onLeave;
            const mp = document.createElement("div");
            mp.className = "cal-week-manpower";
            mp.textContent = avail + "/" + totalUsers() + " available";
            col.appendChild(mp);

            reqs.forEach(r => {
                const pill = document.createElement("div");
                pill.className = "cal-week-pill" + (r.status === "Pending" ? " cal-bar-pending" : "");
                pill.style.background = TEAM_COLORS[r.team] || "#999";
                pill.innerHTML = `<span class="cal-pill-name">${r.user.split(" ")[0]}</span><span class="cal-pill-type">${r.type}</span>`;
                col.appendChild(pill);
            });
        }

        col.addEventListener("mouseenter", (e) => showCalTooltip(e, dateStr, reqs));
        col.addEventListener("mouseleave", hideCalTooltip);

        grid.appendChild(col);
    });

    wrap.appendChild(grid);

    document.getElementById("calPrev").addEventListener("click", () => {
        calDate.setDate(calDate.getDate() - 7);
        renderCalendar();
    });
    document.getElementById("calNext").addEventListener("click", () => {
        calDate.setDate(calDate.getDate() + 7);
        renderCalendar();
    });
}

// ── TOOLTIP ─────────────────────────────────────────────────────────
function showCalTooltip(e, dateStr, reqs) {
    hideCalTooltip();
    if (reqs.length === 0) return;

    const tip = document.createElement("div");
    tip.id = "calTooltip";
    tip.className = "cal-tooltip";

    const onLeave = new Set(reqs.map(r => r.user)).size;
    const avail = totalUsers() - onLeave;

    const dateLabel = new Date(dateStr + "T00:00:00").toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    let html = `<div class="cal-tip-date">${dateLabel}</div>`;
    html += `<div class="cal-tip-manpower">👥 ${avail} / ${totalUsers()} available</div>`;
    html += `<div class="cal-tip-divider"></div>`;

    reqs.forEach(r => {
        const col = TEAM_COLORS[r.team] || "#999";
        const statusClass = r.status === "Approved" ? "tip-approved" : "tip-pending";
        html += `
            <div class="cal-tip-row">
                <span class="cal-tip-dot" style="background:${col}"></span>
                <span class="cal-tip-name">${r.user}</span>
                <span class="cal-tip-tag ${statusClass}">${r.type}</span>
            </div>`;
    });

    tip.innerHTML = html;
    document.body.appendChild(tip);

    // Position near cursor but keep on screen
    const rect = e.target.getBoundingClientRect();
    let left = rect.right + 8;
    let top = rect.top;

    // flip left if too close to right edge
    if (left + 260 > window.innerWidth) left = rect.left - 268;
    // flip up if too close to bottom
    if (top + tip.offsetHeight > window.innerHeight) top = window.innerHeight - tip.offsetHeight - 8;

    tip.style.left = left + "px";
    tip.style.top = Math.max(8, top) + "px";
}

function hideCalTooltip() {
    document.getElementById("calTooltip")?.remove();
}

// Switch view tabs
function setCalView(v) {
    calView = v;
    document.getElementById("calTabMonth").classList.toggle("cal-tab-active", v === "month");
    document.getElementById("calTabWeek").classList.toggle("cal-tab-active", v === "week");
    renderCalendar();
}

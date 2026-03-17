// ================= USERS (SOURCE OF TRUTH) =================
const DEFAULT_USERS = [
    { name: "WONG JIA HUI CHERYL", leave: 14, team: "HQ"},
    { name: "FABIUS TAN CHOON KEONG", leave: 14, team: "HQ"},
    { name: "LIM WEI CHER", leave: 14, team: "HQ"},
    { name: "LEE MING XUN", leave: 14, team: "HQ"},
    { name: "SAKTHI PRAKASH S/O THANABAL", leave: 15, team: "HQ"},
    { name: "JOVAN TIU ZHE KANG", leave: 0, team: "HQ"},
    { name: "RYAN TEOH AN", leave: 0, team: "HQ"},
    { name: "WONG LIN KIAT, RYAN", leave: 14, team: "HQ"},
    { name: "JOASH ANG KAI YI", leave: 0, team: "HQ"},
    { name: "LIM WEI BIN, ERVIN", leave: 14, team: "1"},
    { name: "LEONG JIASHENG MAX", leave: 14, team: "1"},
    { name: "LEE WEN JIE", leave: 0, team: "1"},
    { name: "LEOW RUI YANG", leave: 6, team: "1"},
    { name: "CHENG JIN KANG NICHOLAS", leave: 8, team: "1"},
    { name: "YEO MING ZHOU, JABIN", leave: 7, team: "1"},
    { name: "TOH YOU JUN", leave: 14, team: "1"},
    { name: "EVAN JOEL DE SILVA", leave: 14, team: "2"},
    { name: "ZHU HENGRUI", leave: 14, team: "2"},
    { name: "THAM NETHANEEL", leave: 5, team: "2"},
    { name: "SHINE HTET AUNG", leave: 14, team: "2"},
    { name: "GLENN CHUA QI JUN", leave: 14, team: "2"},
    { name: "CHUA OONG SENG", leave: 14, team: "2"},
    { name: "JAKE KOH ZHI YONG", leave: 14, team: "3"},
    { name: "LOW ZONG XUAN, DYLAN", leave: 1, team: "3"},
    { name: "LOK YONGWEI, GARETH", leave: 7, team: "3"},
    { name: "LOH JERRY", leave: 14, team: "3"},
    { name: "AARON THNG JI HUI", leave: 14, team: "3"}
];

function normName(s) {
    return (s || "").toLowerCase().trim();
}

if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
}

let users = JSON.parse(localStorage.getItem("users")) || DEFAULT_USERS.map(u => ({...u}));
let adminArchiveOpen = false;

const defaultTeamByName = new Map(
    DEFAULT_USERS.map(u => [normName(u.name), String(u.team)])
);


// ================= PUBLIC HOLIDAYS (SG) =================
const PUBLIC_HOLIDAYS = new Set([
    // 2025
    "2025-01-01", // New Year's Day
    "2025-01-29", // Chinese New Year
    "2025-01-30", // Chinese New Year
    "2025-04-18", // Good Friday
    "2025-05-01", // Labour Day
    "2025-05-12", // Vesak Day
    "2025-06-07", // Hari Raya Haji
    "2025-08-09", // National Day
    "2025-10-20", // Deepavali
    "2025-12-25", // Christmas Day

    // 2026
    "2026-01-01", // New Year's Day
    "2026-02-17", // Chinese New Year
    "2026-02-18", // Chinese New Year
    "2026-04-03", // Good Friday
    "2026-05-01", // Labour Day
    "2026-05-31", // Vesak Day
    "2026-05-27", // Hari Raya Haji
    "2026-08-10", // National Day (in-lieu)
    "2026-11-09", // Deepavali
    "2026-12-25", // Christmas Day
]);

const PH_NAMES = {
    "2025-01-01": "New Year's Day",
    "2025-01-29": "CNY Day 1",
    "2025-01-30": "CNY Day 2",
    "2025-04-18": "Good Friday",
    "2025-05-01": "Labour Day",
    "2025-05-12": "Vesak Day",
    "2025-06-07": "Hari Raya Haji",
    "2025-08-09": "National Day",
    "2025-10-20": "Deepavali",
    "2025-12-25": "Christmas Day",
    "2026-01-01": "New Year's Day",
    "2026-02-17": "CNY Day 1",
    "2026-02-18": "CNY Day 2",
    "2026-04-03": "Good Friday",
    "2026-05-01": "Labour Day",
    "2026-05-31": "Vesak Day",
    "2026-05-27": "Hari Raya Haji",
    "2026-08-10": "National Day",
    "2026-11-09": "Deepavali",
    "2026-12-25": "Christmas Day",
};

function countLeaveDays(start, end) {
    // Returns { total, phDays, phNames, chargeable }
    const days = dateRange(start, end);
    const phDays = days.filter(d => PUBLIC_HOLIDAYS.has(d));
    const chargeable = days.length - phDays.length;
    return {
        total: days.length,
        phDays: phDays.length,
        phNames: phDays.map(d => PH_NAMES[d]),
        chargeable
    };
}


let usersChanged = false;
users.forEach(u => {
    const fixedName = (u.name || "").trim().toUpperCase();
    if (u.name !== fixedName) { u.name = fixedName; usersChanged = true; }
    const key = normName(u.name);
    const correctTeam = defaultTeamByName.get(key);
    if (correctTeam && String(u.team).trim() !== correctTeam) { u.team = correctTeam; usersChanged = true; }
    if (!correctTeam && (u.team === undefined || u.team === null || String(u.team).trim() === "")) {
        u.team = "Unknown"; usersChanged = true;
    } else { u.team = String(u.team).trim(); }
});
if (usersChanged) localStorage.setItem("users", JSON.stringify(users));

// ================= STATE =================
let selectedUser = null;
let requests = JSON.parse(localStorage.getItem("requests")) || [];
let isAdmin = false;
let editRequestId = null;
let selectedType = null;

async function updateRequestsStorage(nextRequests) {
    // optimistic update locally first
    requests = nextRequests;
    localStorage.setItem("requests", JSON.stringify(requests));
    if (isAdmin) renderRequests();
    else renderEmployeeRequests();

    // then sync each changed request to Supabase
    // (for simplicity, upsert all — for production you'd diff)
    for (const req of nextRequests) {
        await sb.upsertRequest(req);
    }
}

function getRequests() { 
    return JSON.parse(localStorage.getItem("requests")) || []; 
}

(function migrateRequestsTeamOnly() {
    const latest = getRequests();
    let changed = false;
    const teamByName = new Map(users.map(u => [normName(u.name), String(u.team).trim()]));
    const next = latest.map(r => {
        const correctTeam = teamByName.get(normName(r.user)) || "Unknown";
        const curTeam = String(r.team || "").trim();
        if (!curTeam || curTeam === "undefined" || curTeam !== correctTeam) { changed = true; return { ...r, team: correctTeam }; }
        return r;
    });
    if (changed) localStorage.setItem("requests", JSON.stringify(next));
    requests = next;
})();

// At the top of DOMContentLoaded, load from Supabase first:
async function initApp() {
    showLoadingOverlay(true);
    try {
        console.log("1. Starting initApp...");

        const dbUsers = await sb.getUsers();
        console.log("2. Got users:", dbUsers);

        if (dbUsers && dbUsers.length > 0) {
            users = dbUsers;
            localStorage.setItem("users", JSON.stringify(users));
        }

        const dbRequests = await sb.getRequests();
        console.log("3. Got requests:", dbRequests);

        if (dbRequests) {
            requests = dbRequests.map(r => ({ ...r, archivedAt: r.archived_at, halfDay: r.half_day || null }));
            localStorage.setItem("requests", JSON.stringify(requests));
        }

        const dbPins = await sb.getPins();
        console.log("4. Got pins:", dbPins);
        localStorage.setItem("pins", JSON.stringify(dbPins));

        console.log("5. initApp complete");

    } catch(err) {
        console.error("Supabase error:", err);
        showToast("Could not reach database, using local data", "#f59e0b");
    } finally {
        console.log("6. Hiding overlay");
        showLoadingOverlay(false);
    }
}

async function saveRequests(next) {
    requests = next;
    localStorage.setItem("requests", JSON.stringify(next));
    if (isAdmin) renderRequests();
    else renderEmployeeRequests();

    // Sync all changed requests to Supabase
    for (const req of next) {
        await sb.upsertRequest(req);
    }
}

function deleteRequestById(id) {
    const next = getRequests().filter(r => r.id !== id);
    localStorage.setItem("requests", JSON.stringify(next));
    requests = next;
    if (isAdmin) renderRequests();
    else renderEmployeeRequests();
}

function setRequestStatusById(id, status) {
    const next = getRequests().map(r => (r.id === id ? { ...r, status } : r));
    localStorage.setItem("requests", JSON.stringify(next));
    requests = next;
    if (isAdmin) renderRequests();
    else renderEmployeeRequests();
}

// ================= CONFETTI =================
function launchConfetti() {
    const colors = ["#f44336","#e91e63","#9c27b0","#3f51b5","#2196f3","#00bcd4","#4caf50","#ffeb3b","#ff9800"];
    function spawnBatch(count, delayOffset) {
        for (let i = 0; i < count; i++) {
            const el = document.createElement("div");
            const size = Math.random() * 10 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startX = Math.random() * window.innerWidth;
            const drift = (Math.random() - 0.5) * 300;
            const duration = Math.random() * 1000 + 1500;
            const delay = delayOffset + Math.random() * 400;
            const rotation = Math.random() * 720 - 360;
            el.style.cssText = [
                "position:fixed","top:-12px","left:" + startX + "px",
                "width:" + size + "px","height:" + size + "px","background:" + color,
                "border-radius:" + (Math.random() > 0.5 ? "50%" : "2px"),
                "z-index:99999","pointer-events:none","opacity:1",
                "transition:transform " + duration + "ms ease-in, top " + duration + "ms ease-in, opacity 300ms ease " + (duration + delay - 300) + "ms",
                "transition-delay:" + delay + "ms"
            ].join(";");
            document.body.appendChild(el);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                el.style.top = (window.innerHeight + 20) + "px";
                el.style.transform = "translateX(" + drift + "px) rotate(" + rotation + "deg)";
                el.style.opacity = "0";
            }));
            setTimeout(() => el.remove(), duration + delay + 500);
        }
    }
    spawnBatch(80, 0); spawnBatch(80, 400); spawnBatch(80, 800); spawnBatch(80, 1200);
}

// ================= ADMINS =================
const admins = [
    "WONG JIA HUI CHERYL","FABIUS TAN CHOON KEONG","LEE MING XUN",
    "LIM WEI CHER","SAKTHI PRAKASH S/O THANABAL"
];

// ================= LOGIN =================
function searchUser() {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    const input = document.getElementById("searchInput").value.trim().toLowerCase();

    // only look up if not already set by initiateLogin
    if (!selectedUser) {
        selectedUser = users.find(u => u.name.toLowerCase() === input);
    }

    const info = document.getElementById("userInfo");

    function shakeElement(el) {
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 400);
    }

    if (!selectedUser) {
        info.innerHTML = "User not found";
        showToast("User not found", "#dc3545");
        shakeElement(document.getElementById("searchInput"));
        return;
    }

    saveRecentLogin(selectedUser.name);
    renderRecentLogins();

    isAdmin = admins.some(a => a.toLowerCase() === selectedUser.name.toLowerCase());

    info.innerHTML = `
        <p><b>Name:</b> ${selectedUser.name}</p>
        <p><b>Leave Remaining:</b> ${selectedUser.leave}</p>
    `;

    document.getElementById("formSection").classList.remove("hidden");
    document.getElementById("adminSection").classList.toggle("hidden", !isAdmin);

    if (isAdmin) {
        renderRequests();
        renderAdminUserList();
        const addUserForm = document.getElementById("addUserForm");
        if (addUserForm) {
            const isFabius = normName(selectedUser.name) === normName("FABIUS TAN CHOON KEONG");
            addUserForm.classList.toggle("hidden", !isFabius);
        }
        if (typeof initCalendar === "function") initCalendar();
    } else {
        renderEmployeeRequests();
        document.getElementById("employeeCalendarSection").classList.remove("hidden");
        initEmployeeCalendar();
    }

    document.getElementById("floatingHome").style.display = "flex";
    document.getElementById("floatingRefresh").style.display = "flex";
    document.getElementById("userSection").classList.add("hidden");
    updateUserBanner();
}

// ================= RECENT LOGINS + AUTOCOMPLETE =================
const MAX_RECENT = 5;

function getRecentLogins() {
    return JSON.parse(localStorage.getItem("recentLogins")) || [];
}

function saveRecentLogin(name) {
    let recent = getRecentLogins();
    recent = recent.filter(n => n !== name);
    recent.unshift(name);
    recent = recent.slice(0, MAX_RECENT);
    localStorage.setItem("recentLogins", JSON.stringify(recent));
}

function renderRecentLogins() {
    const wrap = document.getElementById("recentLogins");
    if (!wrap) return;
    const recent = getRecentLogins();
    if (recent.length === 0) { wrap.innerHTML = ""; return; }

    wrap.innerHTML = `<div class="recent-logins-label">Recent</div>`;
    recent.forEach(name => {
        const btn = document.createElement("button");
        btn.className = "recent-btn";
        btn.textContent = name.split(" ")[0];
        btn.title = name;
        btn.addEventListener("click", () => {
            document.getElementById("searchDropdown").classList.add("hidden");
            initiateLogin(name); // FIX: use initiateLogin not searchUser
        });
        wrap.appendChild(btn);
    });
}

function renderSearchDropdown(query) {
    const dropdown = document.getElementById("searchDropdown");
    if (!dropdown) return;
    if (!query.trim()) { dropdown.classList.add("hidden"); return; }

    const matches = users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
    if (matches.length === 0) { dropdown.classList.add("hidden"); return; }

    dropdown.innerHTML = "";
    matches.slice(0, 8).forEach(u => {
        const item = document.createElement("div");
        item.className = "search-dropdown-item";
        item.textContent = u.name;
        item.addEventListener("click", () => {
            document.getElementById("searchInput").value = u.name;
            dropdown.classList.add("hidden");
            initiateLogin(u.name); // FIX: use initiateLogin not searchUser
        });
        dropdown.appendChild(item);
    });
    dropdown.classList.remove("hidden");
}

// ================= PIN SYSTEM =================
function getPins() { return JSON.parse(localStorage.getItem("pins")) || {}; }
function savePins(pins) { localStorage.setItem("pins", JSON.stringify(pins)); }
function userHasPin(name) { return !!getPins()[normName(name)]; }
function verifyPin(name, pin) { return getPins()[normName(name)] === pin; }
function setPin(name, pin) {
    const pins = getPins(); pins[normName(name)] = pin; savePins(pins);
    sb.upsertPin(normName(name), pin); // sync to DB
}

function resetPin(name) {
    const pins = getPins(); delete pins[normName(name)]; savePins(pins);
    sb.deletePin(normName(name)); // sync to DB
}

function showPinModal(userName, mode, onSuccess) {
    document.getElementById("pinModal")?.remove();
    let entered = "";
    let firstPin = "";
    let phase = mode === "create" ? "create1" : "enter";

    const overlay = document.createElement("div");
    overlay.className = "pin-overlay";
    overlay.id = "pinModal";

    const box = document.createElement("div");
    box.className = "pin-box";

    const title = document.createElement("h3");
    const subtitle = document.createElement("p");
    subtitle.className = "pin-subtitle";
    const errorEl = document.createElement("div");
    errorEl.className = "pin-error";

    const dotsWrap = document.createElement("div");
    dotsWrap.className = "pin-dots";
    const dots = [];
    for (let i = 0; i < 4; i++) {
        const d = document.createElement("div");
        d.className = "pin-dot";
        dotsWrap.appendChild(d);
        dots.push(d);
    }

    function updateDots() { dots.forEach((d, i) => d.classList.toggle("filled", i < entered.length)); }

    function setPhaseUI() {
        errorEl.textContent = ""; entered = ""; updateDots();
        if (phase === "enter") { title.textContent = "Enter PIN"; subtitle.textContent = userName.split(" ")[0]; }
        else if (phase === "create1") { title.textContent = "Create PIN"; subtitle.textContent = "Choose a 4-digit PIN"; }
        else if (phase === "create2") { title.textContent = "Confirm PIN"; subtitle.textContent = "Re-enter your PIN to confirm"; }
    }

    function handleDigit(d) {
        if (entered.length >= 4) return;
        entered += d; updateDots();
        if (entered.length === 4) setTimeout(() => handleComplete(), 200);
    }

    function handleDelete() { entered = entered.slice(0, -1); updateDots(); errorEl.textContent = ""; }

    function handleComplete() {
        if (phase === "enter") {
            if (verifyPin(userName, entered)) { overlay.remove(); onSuccess(); }
            else {
                errorEl.textContent = "Incorrect PIN. Try again.";
                entered = ""; updateDots();
                dotsWrap.style.animation = "none";
                dotsWrap.offsetHeight;
                dotsWrap.style.animation = "shake 0.4s";
            }
        } else if (phase === "create1") {
            firstPin = entered; phase = "create2"; setPhaseUI();
        } else if (phase === "create2") {
            if (entered === firstPin) { setPin(userName, entered); overlay.remove(); onSuccess(); }
            else { errorEl.textContent = "PINs don't match. Start again."; firstPin = ""; phase = "create1"; setPhaseUI(); }
        }
    }

    const pad = document.createElement("div");
    pad.className = "pin-pad";
    [1,2,3,4,5,6,7,8,9].forEach(n => {
        const btn = document.createElement("button");
        btn.className = "pin-key"; btn.type = "button"; btn.textContent = n;
        btn.addEventListener("click", () => handleDigit(String(n)));
        pad.appendChild(btn);
    });

    const cancelKey = document.createElement("button");
    cancelKey.className = "pin-cancel-link"; cancelKey.type = "button"; cancelKey.textContent = "Cancel";
    cancelKey.addEventListener("click", () => overlay.remove());

    const zeroKey = document.createElement("button");
    zeroKey.className = "pin-key"; zeroKey.type = "button"; zeroKey.textContent = "0";
    zeroKey.addEventListener("click", () => handleDigit("0"));

    const delKey = document.createElement("button");
    delKey.className = "pin-key pin-del"; delKey.type = "button"; delKey.textContent = "⌫";
    delKey.addEventListener("click", handleDelete);

    pad.appendChild(cancelKey); pad.appendChild(zeroKey); pad.appendChild(delKey);

    overlay.addEventListener("keydown", (e) => {
        if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
        else if (e.key === "Backspace") handleDelete();
        else if (e.key === "Escape") overlay.remove();
    });

    box.appendChild(title); box.appendChild(subtitle); box.appendChild(dotsWrap);
    box.appendChild(errorEl); box.appendChild(pad);
    overlay.appendChild(box); document.body.appendChild(overlay);
    overlay.setAttribute("tabindex", "0"); overlay.focus();
    setPhaseUI();
}

function initiateLogin(name) {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase().trim());
    if (!user) { showToast("User not found", "#dc3545"); return; }
    const mode = userHasPin(user.name) ? "enter" : "create";
    showPinModal(user.name, mode, () => {
        selectedUser = user; // FIX: set directly so goHome() works immediately
        document.getElementById("searchInput").value = user.name;
        searchUser();
    });
}

// ================= ADMIN RESET PIN =================
// FIX: defined at top level so onclick="adminResetPin(...)" can find it
function adminResetPin(name) {
    showConfirm("Reset PIN for " + name.split(" ")[0] + "?", () => {
        resetPin(name);
        showToast("PIN reset — they will be prompted to create a new one.", "#007bff");
    });
}

// ================= SUBMIT REQUEST =================
function submitRequest() {
    if (!selectedType) { showToast("Select request type first", "#dc3545"); return; }
    if (!selectedUser) { showToast("Login first", "#dc3545"); return; }

    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const reason = document.getElementById("reason").value.trim();

    if (!start || !end) { showToast("Please select dates", "#dc3545"); return; }
    if (new Date(start) > new Date(end)) { showToast("End date cannot be before start date", "#dc3545"); return; }
    if (!reason) { showToast("Please provide a reason", "#dc3545"); return; }

    const btn = document.getElementById("submitBtn");
    const text = document.getElementById("submitText");
    const spinner = document.getElementById("spinner");

    btn.disabled = true; text.textContent = "Submitting..."; spinner.classList.remove("hidden");

    setTimeout(() => {
        try {
            const safeTeam = String(selectedUser.team || "Unknown").trim();

            if (editRequestId !== null) {
                const req = requests.find(r => r.id === editRequestId);
                if (!req) { showToast("Edit failed: request not found", "#dc3545"); editRequestId = null; return; }
                req.type = selectedType; req.start = start; req.end = end;
                req.reason = reason; req.team = safeTeam; req.status = "Pending";
                editRequestId = null;
                showToast("Request Updated");
            } else {
                const halfDay = document.getElementById("halfDay")?.value || "full";
                const isHalfDay = selectedType === "Off" && halfDay !== "full";

                // Half day off must be a single date
                if (isHalfDay && start !== end) {
                    showToast("Half day off must be a single date", "#dc3545");
                    spinner.classList.add("hidden"); btn.disabled = false; text.textContent = "Submit Request";
                    return;
                }

                const req = {
                    id: Date.now(),
                    user: selectedUser.name.trim().toUpperCase(),
                    team: safeTeam,
                    type: selectedType,
                    halfDay: isHalfDay ? halfDay : null,
                    start, end, reason,
                    status: "Pending",
                    deducted: false
                };
            
                // Deduct leave immediately on submission if type is Leave
                if (selectedType === "Leave") {
                    const { chargeable, phDays, phNames } = countLeaveDays(start, end);

                    if (phDays > 0) {
                        showToast(`Note: ${phDays} PH day(s) excluded (${phNames.join(", ")}) — ${chargeable} day(s) charged`, "#f59e0b");
                    }

                    if (chargeable > 0) {
                        selectedUser.leave = Math.max(0, selectedUser.leave - chargeable);
                        req.deducted = true;
                        req.chargeableDays = chargeable; // store for potential refund
                    } else {
                        // entire period is public holidays — no leave charged
                        req.deducted = false;
                        req.chargeableDays = 0;
                        showToast("No leave charged — entire period falls on public holidays", "#28a745");
                    }

                    const userIdx = users.findIndex(u => normName(u.name) === normName(selectedUser.name));
                    if (userIdx !== -1) {
                        users[userIdx].leave = selectedUser.leave;
                        localStorage.setItem("users", JSON.stringify(users));
                        sb.updateUserLeave(selectedUser.name, selectedUser.leave);
                        updateUserBanner();
                    }

                    document.getElementById("userInfo").innerHTML = `
                        <p><b>Name:</b> ${selectedUser.name}</p>
                        <p><b>Leave Remaining:</b> ${selectedUser.leave}</p>
                    `;
                }
                
                requests.push(req);
                showToast("Request submitted");
                launchConfetti();

            }

            updateRequestsStorage([...requests]);
            document.getElementById("start").value = "";
            document.getElementById("end").value = "";
            document.getElementById("reason").value = "";
            selectedType = null;
            const halfDayEl = document.getElementById("halfDay");
            if (halfDayEl) halfDayEl.value = "full";
            document.getElementById("requestChoice").classList.remove("hidden");
            document.getElementById("requestForm").classList.add("hidden");

        } catch (err) {
            console.error("submitRequest error:", err);
            showToast("Submit failed (check console)", "#dc3545");
        } finally {
            spinner.classList.add("hidden"); btn.disabled = false; text.textContent = "Submit Request";
        }
    }, 1000);
}

function showToast(message, colour = "#28a745") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.background = colour;
    toast.innerText = message;
    document.body.appendChild(toast);

    // Stack above any existing toasts
    const existing = document.querySelectorAll(".toast.show");
    let offset = 20;
    existing.forEach(t => {
        offset += t.offsetHeight + 10;
    });
    toast.style.top = offset + "px";

    setTimeout(() => {
        toast.classList.add("show");
        // Override the CSS top with our calculated offset
        toast.style.top = offset + "px";
    }, 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
function chooseType(type) {
    selectedType = type;
    document.getElementById("requestChoice").classList.add("hidden");
    document.getElementById("requestForm").classList.remove("hidden");
    document.getElementById("formTitle").innerText = "Apply " + type;

    // Show half-day selector only for Off
    const halfDayRow = document.getElementById("halfDayRow");
    if (halfDayRow) halfDayRow.classList.toggle("hidden", type !== "Off");

    // Reset half day selection
    const halfDay = document.getElementById("halfDay");
    if (halfDay) halfDay.value = "full";
}

// ================= GO HOME =================
function goHome() {
    if (!selectedUser) return;

    const requestForm = document.getElementById("requestForm");
    const requestChoice = document.getElementById("requestChoice");
    const formSection = document.getElementById("formSection");
    const adminSection = document.getElementById("adminSection");

    const formVisible = requestForm && !requestForm.classList.contains("hidden");

    // CASE 1: inside form → back to type selection
    if (formVisible) {
        selectedType = null;
        if (requestChoice) requestChoice.classList.remove("hidden");
        if (requestForm) requestForm.classList.add("hidden");
        return;
    }

    // CASE 2: admin → stay logged in, just re-render panel
    if (isAdmin) {
        const formVisible = requestForm && !requestForm.classList.contains("hidden") && !document.getElementById("requestChoice").classList.contains("hidden");
        // if in form view → go back to admin panel
        if (!document.getElementById("adminSection").classList.contains("hidden") === false) {
            formSection.classList.add("hidden");
            adminSection.classList.remove("hidden");
            renderRequests();
            return;
        }
        formSection.classList.add("hidden");
        adminSection.classList.remove("hidden");
        renderRequests();
        return;
    }

    // CASE 3: employee → full logout
    selectedUser = null;
    isAdmin = false;

    const searchInput = document.getElementById("searchInput");
    const userInfo = document.getElementById("userInfo");
    if (searchInput) searchInput.value = "";
    if (userInfo) userInfo.innerHTML = "";

    if (formSection) formSection.classList.add("hidden");
    if (adminSection) adminSection.classList.add("hidden");

    const myPanel = document.getElementById("myRequestsPanel");
    const myList = document.getElementById("myRequestsList");
    const myCount = document.getElementById("myRequestsCount");
    if (myPanel) myPanel.classList.add("hidden");
    if (myList) myList.innerHTML = "";
    if (myCount) myCount.textContent = "0";

    document.getElementById("userSection").classList.remove("hidden"); // shows login
    document.getElementById("userBanner").classList.add("hidden"); 
    document.getElementById("employeeCalendarSection").classList.add("hidden");    // hides banner
    renderRecentLogins();

    const homeBtn = document.getElementById("floatingHome");
    if (homeBtn) homeBtn.style.display = "none";
    document.getElementById("floatingRefresh").style.display = "none";
}
// ===== Internal Refresh Button ======
async function refreshData() {
    const btn = document.getElementById("floatingRefresh");
    btn.classList.add("spinning");

    try {
        const dbUsers = await sb.getUsers();
        if (dbUsers && dbUsers.length > 0) {
            users = dbUsers;
            localStorage.setItem("users", JSON.stringify(users));
        }

        const dbRequests = await sb.getRequests();
        if (dbRequests) {
            requests = dbRequests.map(r => ({ ...r, archivedAt: r.archived_at }));
            localStorage.setItem("requests", JSON.stringify(requests));
        }

        // Re-render whatever is currently visible
        if (isAdmin) {
            renderRequests();
            renderAdminUserList();
            if (typeof initCalendar === "function") initCalendar();
        } else if (selectedUser) {
            renderEmployeeRequests();
            renderEmployeeCalendar();
            updateUserBanner();
        }

        showToast("Data refreshed", "#28a745");

    } catch (err) {
        console.error("Refresh error:", err);
        showToast("Refresh failed", "#dc3545");
    } finally {
        btn.classList.remove("spinning");
    }
}

// ================= EMPLOYEE HISTORY =================
function renderEmployeeRequests() {
    if (!selectedUser || isAdmin) return;

    const panel = document.getElementById("myRequestsPanel");
    const countEl = document.getElementById("myRequestsCount");
    const list = document.getElementById("myRequestsList");
    if (!panel || !countEl || !list) return;

    panel.classList.remove("hidden");
    requests = JSON.parse(localStorage.getItem("requests")) || [];

    const mine = requests.filter(r => normName(r.user) === normName(selectedUser.name));

    const q = document.getElementById("mySearchText")?.value || "";
    const from = parseDate(document.getElementById("myFromDate")?.value);
    const to = parseDate(document.getElementById("myToDate")?.value);
    const status = document.getElementById("myStatus")?.value || "";
    const type = document.getElementById("myType")?.value || "";

    let filtered = mine;
    if (q.trim()) filtered = filtered.filter(r => includesText(r.reason,q)||includesText(r.type,q)||includesText(r.status,q)||includesText(r.start,q)||includesText(r.end,q));
    if (status) filtered = filtered.filter(r => r.status === status);
    if (type) filtered = filtered.filter(r => r.type === type);
    if (from) filtered = filtered.filter(r => parseDate(r.start) >= from);
    if (to) filtered = filtered.filter(r => parseDate(r.end) <= to);

    filtered.sort((a, b) => new Date(b.start) - new Date(a.start));
    countEl.textContent = String(filtered.length);
    list.innerHTML = "";

    if (filtered.length === 0) { list.innerHTML = `<p class="noReq">No matching requests</p>`; return; }

    filtered.forEach(r => {
        const div = document.createElement("div");
        div.className = "request";
        const halfDayLabel = r.halfDay ? ` <span style="background:#7c3aed;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">${r.halfDay} Off</span>` : "";

        div.innerHTML = `
            <div class="request-header">
                <span class="status ${String(r.status).toLowerCase()}">${r.status}</span>
            </div>
            <div class="request-body">
                <b>Type:</b> ${r.type}${halfDayLabel}<br>
                <b>Dates:</b> ${r.start} → ${r.end}<br>
                <b>Reason:</b> ${r.reason ? r.reason : "—"}
            </div>
        `;
        list.appendChild(div);
    });
}


function updateUserBanner() {
    const banner = document.getElementById("userBanner");
    if (!banner || !selectedUser) { banner?.classList.add("hidden"); return; }

    const teamLabel = selectedUser.team === "HQ" ? "HQ" : "Team " + selectedUser.team;
    const initials = selectedUser.name.trim().split(" ").slice(0, 2).map(w => w[0]).join("");

    document.getElementById("bannerAvatar").textContent = initials;
    document.getElementById("bannerName").textContent = selectedUser.name;
    document.getElementById("bannerTeam").textContent = teamLabel;

    const countEl = document.getElementById("bannerLeaveCount");
    const oldVal = countEl.textContent;
    countEl.textContent = selectedUser.leave;

    // bump animation when count changes
    if (oldVal !== "" && oldVal !== String(selectedUser.leave)) {
        countEl.classList.remove("bump");
        countEl.offsetHeight; // reflow
        countEl.classList.add("bump");
        setTimeout(() => countEl.classList.remove("bump"), 400);
    }

    banner.classList.remove("hidden");
}


// ================= ADMIN REQUEST PANEL =================
function renderRequests() {
    const box = document.getElementById("requests");
    if (!box) return;
    box.innerHTML = "";
    requests = JSON.parse(localStorage.getItem("requests")) || [];

    if (requests.length === 0) { box.innerHTML = "<p>No requests submitted yet</p>"; return; }

    const teams = ["HQ","1","2","3"];
    const activeTitle = document.createElement("h3");
    activeTitle.textContent = "Active Requests";
    box.appendChild(activeTitle);

    teams.forEach(teamNum => {
        const teamRequests = requests.filter(r => String(r.team).trim() === teamNum).filter(r => !r.archived);
        teamRequests.sort((a,b) => new Date(a.start) - new Date(b.start));
        const pendingCount = teamRequests.filter(r => r.status === "Pending").length;

        const header = document.createElement("div");
        header.className = "teamHeader";
        header.innerHTML = `<h3>Team ${teamNum}</h3><span class="pendingBadge">${pendingCount} Pending</span>`;
        box.appendChild(header);

        if (teamRequests.length === 0) {
            const noReq = document.createElement("p"); noReq.className = "noReq"; noReq.innerText = "No requests"; box.appendChild(noReq); return;
        }

        teamRequests.forEach(r => {
            const div = document.createElement("div"); div.className = "request";
            const statusColor = r.status === "Approved" ? "green" : r.status === "Rejected" ? "red" : "orange";
            const halfDayLabel = r.halfDay ? ` <span style="background:#7c3aed;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">${r.halfDay} Off</span>` : "";

            div.innerHTML = `<b>User:</b> ${r.user}<br>
            <b>Type:</b> ${r.type}${halfDayLabel}<br>
            <b>Dates:</b> ${r.start} → ${r.end}<br>
            <b>Reason:</b> ${r.reason||"—"}<br>
            <b>Status:</b> <span style="color:${statusColor};font-weight:bold">${r.status}</span>`;
            const btnWrap = document.createElement("div"); btnWrap.className = "btnWrap";

            if (r.status === "Pending") {
                const approve = document.createElement("button"); approve.type="button"; approve.textContent="Approve"; approve.className="approveBtn"; approve.dataset.action="approve"; approve.dataset.id=String(r.id);
                const reject = document.createElement("button"); reject.type="button"; reject.textContent="Reject"; reject.className="rejectBtn"; reject.dataset.action="reject"; reject.dataset.id=String(r.id);
                btnWrap.appendChild(approve); btnWrap.appendChild(reject);
            } else {
                const editDecision = document.createElement("button"); editDecision.type="button"; editDecision.textContent="Edit Decision"; editDecision.className="editBtn"; editDecision.dataset.action="editDecision"; editDecision.dataset.id=String(r.id);
                btnWrap.appendChild(editDecision);
            }

            const archiveBtn = document.createElement("button"); archiveBtn.type="button"; archiveBtn.textContent="Archive"; archiveBtn.className="deleteBtn"; archiveBtn.dataset.action="archive"; archiveBtn.dataset.id=String(r.id);
            btnWrap.appendChild(archiveBtn);
            div.appendChild(btnWrap); box.appendChild(div);
        });
    });

    // Archive section
    const archived = requests.filter(r => !!r.archived);
    const archiveWrapper = document.createElement("div"); archiveWrapper.className = "teamContainer";
    const archiveHeader = document.createElement("div"); archiveHeader.className = "teamHeader"; archiveHeader.style.cursor = "pointer";
    archiveHeader.innerHTML = `<h3>ARCHIVE</h3><span class="pendingBadge">${archived.length}</span>`;
    const archiveBody = document.createElement("div"); archiveBody.className = "teamRequests"; archiveBody.classList.toggle("hidden", !adminArchiveOpen);
    archiveHeader.addEventListener("click", () => { adminArchiveOpen = !adminArchiveOpen; archiveBody.classList.toggle("hidden", !adminArchiveOpen); });

    if (archived.length === 0) {
        const p = document.createElement("p"); p.className="noReq"; p.innerText="No archived requests"; archiveBody.appendChild(p);
    } else {
        archived.sort((a,b) => (b.archivedAt||0)-(a.archivedAt||0));
        archived.forEach(r => {
            const div = document.createElement("div"); div.className = "request";
            div.innerHTML = `<b>User:</b> ${r.user}<br><b>Type:</b> ${r.type}<br><b>Dates:</b> ${r.start} → ${r.end}<br><b>Reason:</b> ${r.reason||"—"}<br><b>Status:</b> ${r.status}<br><small>Archived</small>`;
            const btnWrap = document.createElement("div"); btnWrap.className = "btnWrap";
            const restoreBtn = document.createElement("button"); restoreBtn.type="button"; restoreBtn.textContent="Restore"; restoreBtn.className="editBtn"; restoreBtn.dataset.action="restore"; restoreBtn.dataset.id=String(r.id);
            const purgeBtn = document.createElement("button"); purgeBtn.type="button"; purgeBtn.textContent="Delete Permanently"; purgeBtn.className="rejectBtn"; purgeBtn.dataset.action="purge"; purgeBtn.dataset.id=String(r.id);
            btnWrap.appendChild(purgeBtn); btnWrap.appendChild(restoreBtn); div.appendChild(btnWrap); archiveBody.appendChild(div);
        });
    }
    archiveWrapper.appendChild(archiveHeader); archiveWrapper.appendChild(archiveBody); box.appendChild(archiveWrapper);
}

// ================= APPROVE REQUEST =================
function approveRequest(requestId) {
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) { showToast("Request not found", "#dc3545"); return; }
    const r = requests[idx];
    if (r.status === "Approved" && r.deducted) { showToast("Already approved", "#007bff"); return; }
    r.status = "Approved";
    if (r.type === "Leave" && !r.deducted) {
        const user = users.find(u => normName(u.name) === normName(r.user));
        if (user) {
            const days = Math.floor((new Date(r.end)-new Date(r.start))/(1000*60*60*24))+1;
            user.leave = Math.max(0, user.leave-days); r.deducted = true;
            localStorage.setItem("users", JSON.stringify(users)); 
            sb.updateUserLeave(user.name, user.leave);
            renderAdminUserList();
        }
    }
    saveRequests([...requests]);
}

// ================= ADMIN USER LIST =================
function renderAdminUserList() {
    const list = document.getElementById("UserList"); list.innerHTML = "";
    users.forEach(u => {
        const isAdminUser = admins.includes(u.name);
        const row = document.createElement("div"); row.className = "userRow";
        row.innerHTML = `
            <span class="userName">
                ${u.name}
                ${isAdminUser ? '<span style="background:#6366f1;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;margin-left:6px;font-weight:700;">ADMIN</span>' : ''}
            </span>
            <div class="leaveEditor">
                <button onclick="changeLeave('${u.name}', -1)">▼</button>
                <span class="leaveCount">${u.leave}</span>
                <button onclick="changeLeave('${u.name}', 1)">▲</button>
                <button onclick="adminResetPin('${u.name}')" style="background:#f59e0b;font-size:11px;padding:4px 8px;">Reset PIN</button>
                <button onclick="removeUser('${u.name}')" style="background:#dc3545;font-size:11px;padding:4px 8px;">Remove</button>
            </div>
        `;
        list.appendChild(row);
    });
}

// ================= ADD USER =================
async function addNewUser() {
    const nameEl = document.getElementById("newUserName");
    const teamEl = document.getElementById("newUserTeam");
    const leaveEl = document.getElementById("newUserLeave");
    const isAdminEl = document.getElementById("newUserIsAdmin");

    const name = nameEl.value.trim().toUpperCase();
    const team = teamEl.value;
    const leave = parseInt(leaveEl.value);
    const makeAdmin = isAdminEl.checked;

    // Validation
    if (!name) { showToast("Please enter a name", "#dc3545"); return; }
    if (!team) { showToast("Please select a team", "#dc3545"); return; }
    if (isNaN(leave) || leave < 0) { showToast("Please enter a valid leave balance", "#dc3545"); return; }
    if (users.find(u => normName(u.name) === normName(name))) {
        showToast("User already exists", "#dc3545"); return;
    }

    const newUser = { name, team, leave };

    // Add to local users array
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Sync to Supabase
    try {
        await sb.post("users", newUser);
        showToast(`${name.split(" ")[0]} added successfully`, "#28a745");
    } catch (err) {
        console.error("Failed to sync new user to Supabase:", err);
        showToast("Added locally but failed to sync to database", "#f59e0b");
    }

    // If admin, add to admins array
    if (makeAdmin && !admins.includes(name)) {
        admins.push(name);
    }

    // Clear form
    nameEl.value = "";
    teamEl.value = "";
    leaveEl.value = "";
    isAdminEl.checked = false;

    renderAdminUserList();
}


async function removeUser(name) {
    showConfirm(`Remove ${name.split(" ")[0]} from the system? This cannot be undone.`, async () => {
        // Remove from local array
        users = users.filter(u => u.name !== name);
        localStorage.setItem("users", JSON.stringify(users));

        // Remove from admins if applicable
        const adminIdx = admins.indexOf(name);
        if (adminIdx !== -1) admins.splice(adminIdx, 1);

        // Remove PIN
        resetPin(name);

        // Sync deletion to Supabase
        try {
            await sb.delete("users", `name=eq.${encodeURIComponent(name)}`);
            showToast(`${name.split(" ")[0]} removed`, "#6c757d");
        } catch (err) {
            console.error("Failed to remove user from Supabase:", err);
            showToast("Removed locally but failed to sync", "#f59e0b");
        }

        renderAdminUserList();
    });
}



function changeLeave(name, amount) {
    const user = users.find(u => u.name === name); if (!user) return;
    user.leave = Math.max(0, user.leave + amount);
    localStorage.setItem("users", JSON.stringify(users));
    sb.updateUserLeave(name, user.leave); // sync to DB
    renderAdminUserList();
}

window.addEventListener("storage", (e) => {
    if (e.key === "requests") { requests = JSON.parse(e.newValue) || []; if (isAdmin) renderRequests(); }
});

function parseDate(d) { return d ? new Date(d + "T00:00:00") : null; }
function includesText(haystack, needle) { return (haystack||"").toLowerCase().includes((needle||"").toLowerCase().trim()); }

// ================= CUSTOM CONFIRM MODAL =================
function showConfirm(message, onYes) {
    document.getElementById("customConfirm")?.remove();
    const overlay = document.createElement("div"); overlay.id = "customConfirm"; overlay.className = "confirm-overlay";
    const box = document.createElement("div"); box.className = "confirm-box";
    const msg = document.createElement("p"); msg.textContent = message;
    const btnRow = document.createElement("div"); btnRow.className = "confirm-buttons";
    const noBtn = document.createElement("button"); noBtn.textContent = "Cancel"; noBtn.className = "confirm-cancel";
    const yesBtn = document.createElement("button"); yesBtn.textContent = "Confirm"; yesBtn.className = "confirm-yes";
    btnRow.appendChild(noBtn); btnRow.appendChild(yesBtn);
    box.appendChild(msg); box.appendChild(btnRow); overlay.appendChild(box); document.body.appendChild(overlay);
    yesBtn.addEventListener("click", () => { overlay.remove(); onYes(); });
    noBtn.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

// ================= CALENDAR =================
const TEAM_COLORS = { "HQ": "#6366f1", "1": "#10b981", "2": "#f59e0b", "3": "#ef4444" };
let calView = "month";
let calDate = new Date(); calDate.setDate(1);

function initCalendar() { renderCalendar(); }
function renderCalendar() {
    const wrap = document.getElementById("calendarWrap"); if (!wrap) return;
    if (calView === "month") renderMonthView(wrap); else renderWeekView(wrap);
}
function calRequests() {
    return (JSON.parse(localStorage.getItem("requests"))||[]).filter(r => !r.archived && (r.status==="Approved"||r.status==="Pending"));
}
function dateRange(start, end) {
    const days=[]; const cur=new Date(start+"T00:00:00"); const last=new Date(end+"T00:00:00");
    while(cur<=last){ days.push(cur.toISOString().slice(0,10)); cur.setDate(cur.getDate()+1); }
    return days;
}
function requestsOnDate(dateStr) { return calRequests().filter(r => dateRange(r.start,r.end).includes(dateStr)); }
function totalUsers() { return (JSON.parse(localStorage.getItem("users"))||[]).length; }

function renderMonthView(wrap) {
    wrap.innerHTML = "";
    const year=calDate.getFullYear(), month=calDate.getMonth();
    const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
    const dayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const hdr=document.createElement("div"); hdr.className="cal-nav";
    hdr.innerHTML=`<button class="cal-nav-btn" id="calPrev">&#8592;</button><span class="cal-title">${monthNames[month]} ${year}</span><button class="cal-nav-btn" id="calNext">&#8594;</button>`;
    wrap.appendChild(hdr);
    const grid=document.createElement("div"); grid.className="cal-grid";
    dayNames.forEach(d=>{ const cell=document.createElement("div"); cell.className="cal-day-name"; cell.textContent=d; grid.appendChild(cell); });
    const firstDay=new Date(year,month,1).getDay();
    for(let i=0;i<firstDay;i++){ const b=document.createElement("div"); b.className="cal-cell cal-cell-empty"; grid.appendChild(b); }
    const daysInMonth=new Date(year,month+1,0).getDate();
    const today=new Date().toISOString().slice(0,10);
    for(let d=1;d<=daysInMonth;d++){
        const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const reqs=requestsOnDate(dateStr); const isToday=dateStr===today;
        const isPH = PUBLIC_HOLIDAYS.has(dateStr);
        const cell = document.createElement("div");
        cell.className = "cal-cell" + (isToday ? " cal-today" : "") + (isPH ? " cal-ph" : "");
        if (isPH) {
            const phLabel = document.createElement("div");
            phLabel.className = "cal-ph-label";
            phLabel.textContent = PH_NAMES[dateStr];
            cell.appendChild(phLabel);
        }
        const num=document.createElement("span"); num.className="cal-date-num"; num.textContent=d; cell.appendChild(num);
        if(reqs.length>0){ const onLeave=new Set(reqs.map(r=>r.user)).size; const avail=totalUsers()-onLeave; const badge=document.createElement("span"); badge.className="cal-manpower"; badge.textContent=avail+"/"+totalUsers(); cell.appendChild(badge); }
        const shown=reqs.slice(0,3); const extra=reqs.length-shown.length;
        shown.forEach(r=>{ const bar=document.createElement("div"); bar.className="cal-bar"+(r.status==="Pending"?" cal-bar-pending":""); bar.style.background=TEAM_COLORS[r.team]||"#999"; bar.textContent=r.user.split(" ")[0]; cell.appendChild(bar); });
        if(extra>0){ const more=document.createElement("div"); more.className="cal-bar-more"; more.textContent="+"+extra+" more"; cell.appendChild(more); }
        cell.addEventListener("mouseenter",(e)=>showCalTooltip(e,dateStr,reqs));
        cell.addEventListener("mouseleave",hideCalTooltip);
        grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    document.getElementById("calPrev").addEventListener("click",()=>{ calDate.setMonth(calDate.getMonth()-1); renderCalendar(); });
    document.getElementById("calNext").addEventListener("click",()=>{ calDate.setMonth(calDate.getMonth()+1); renderCalendar(); });
}

function renderWeekView(wrap) {
    wrap.innerHTML="";
    const base=new Date(calDate), dow=base.getDay(), monday=new Date(base);
    monday.setDate(base.getDate()-(dow===0?6:dow-1));
    const days=[]; for(let i=0;i<7;i++){ const d=new Date(monday); d.setDate(monday.getDate()+i); days.push(d); }
    const fmt=(d)=>d.toLocaleDateString("en-SG",{day:"numeric",month:"short"});
    const dayNames=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const today=new Date().toISOString().slice(0,10);
    const hdr=document.createElement("div"); hdr.className="cal-nav";
    hdr.innerHTML=`<button class="cal-nav-btn" id="calPrev">&#8592;</button><span class="cal-title">${fmt(days[0])} – ${fmt(days[6])}</span><button class="cal-nav-btn" id="calNext">&#8594;</button>`;
    wrap.appendChild(hdr);
    const grid=document.createElement("div"); grid.className="cal-week-grid";
    days.forEach((d,i)=>{
        const dateStr=d.toISOString().slice(0,10); const reqs=requestsOnDate(dateStr); const isToday=dateStr===today;
        const col = document.createElement("div");
        col.className = "cal-week-col" + (isToday ? " cal-today" : "") + (isPH ? " cal-ph" : "");        
        const dayHdr=document.createElement("div"); dayHdr.className="cal-week-day-hdr";
        dayHdr.innerHTML=`<span class="cal-week-dayname">${dayNames[i]}</span><span class="cal-week-datenum">${d.getDate()}</span>`;
        col.appendChild(dayHdr);
        if(reqs.length===0){ const empty=document.createElement("div"); empty.className="cal-week-empty"; empty.textContent="—"; col.appendChild(empty); }
        else {
            const onLeave=new Set(reqs.map(r=>r.user)).size; const avail=totalUsers()-onLeave;
            const mp=document.createElement("div"); mp.className="cal-week-manpower"; mp.textContent=avail+"/"+totalUsers()+" available"; col.appendChild(mp);
            reqs.forEach(r=>{ const pill=document.createElement("div"); pill.className="cal-week-pill"+(r.status==="Pending"?" cal-bar-pending":""); pill.style.background=TEAM_COLORS[r.team]||"#999"; pill.innerHTML=`<span class="cal-pill-name">${r.user.split(" ")[0]}</span><span class="cal-pill-type">${r.type}</span>`; col.appendChild(pill); });
        }
        col.addEventListener("mouseenter",(e)=>showCalTooltip(e,dateStr,reqs));
        col.addEventListener("mouseleave",hideCalTooltip);
        grid.appendChild(col);
    });
    wrap.appendChild(grid);
    document.getElementById("calPrev").addEventListener("click",()=>{ calDate.setDate(calDate.getDate()-7); renderCalendar(); });
    document.getElementById("calNext").addEventListener("click",()=>{ calDate.setDate(calDate.getDate()+7); renderCalendar(); });
}

function showCalTooltip(e, dateStr, reqs) {
    hideCalTooltip(); if(reqs.length===0) return;
    const tip=document.createElement("div"); tip.id="calTooltip"; tip.className="cal-tooltip";
    const onLeave=new Set(reqs.map(r=>r.user)).size; const avail=totalUsers()-onLeave;
    const dateLabel=new Date(dateStr+"T00:00:00").toLocaleDateString("en-SG",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
    let html=`<div class="cal-tip-date">${dateLabel}</div><div class="cal-tip-manpower">👥 ${avail} / ${totalUsers()} available</div><div class="cal-tip-divider"></div>`;
    reqs.forEach(r=>{ const col=TEAM_COLORS[r.team]||"#999"; const sc=r.status==="Approved"?"tip-approved":"tip-pending"; html+=`<div class="cal-tip-row"><span class="cal-tip-dot" style="background:${col}"></span><span class="cal-tip-name">${r.user}</span><span class="cal-tip-tag ${sc}">${r.type}</span></div>`; });
    tip.innerHTML=html; document.body.appendChild(tip);
    const rect=e.target.getBoundingClientRect();
    let left=rect.right+8, top=rect.top;
    if(left+260>window.innerWidth) left=rect.left-268;
    if(top+tip.offsetHeight>window.innerHeight) top=window.innerHeight-tip.offsetHeight-8;
    tip.style.left=left+"px"; tip.style.top=Math.max(8,top)+"px";
}
function hideCalTooltip() { document.getElementById("calTooltip")?.remove(); }
function setCalView(v) {
    calView=v;
    document.getElementById("calTabMonth").classList.toggle("cal-tab-active",v==="month");
    document.getElementById("calTabWeek").classList.toggle("cal-tab-active",v==="week");
    renderCalendar();
}

function showLoadingOverlay(show) {
    document.getElementById("loadingOverlay")?.classList.toggle("hidden", !show);
}

// ================= EMPLOYEE CALENDAR =================
let empCalView = "month";
let empCalDate = new Date(); empCalDate.setDate(1);

function initEmployeeCalendar() {
    renderEmployeeCalendar();
}

function renderEmployeeCalendar() {
    const wrap = document.getElementById("employeeCalendarWrap");
    if (!wrap) return;
    if (empCalView === "month") renderEmpMonthView(wrap);
    else renderEmpWeekView(wrap);
}

function setEmpCalView(v) {
    empCalView = v;
    document.getElementById("empCalTabMonth").classList.toggle("cal-tab-active", v === "month");
    document.getElementById("empCalTabWeek").classList.toggle("cal-tab-active", v === "week");
    renderEmployeeCalendar();
}

function renderEmpMonthView(wrap) {
    wrap.innerHTML = "";
    const year = empCalDate.getFullYear(), month = empCalDate.getMonth();
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    const hdr = document.createElement("div"); hdr.className = "cal-nav";
    hdr.innerHTML = `<button class="cal-nav-btn" id="empCalPrev">&#8592;</button><span class="cal-title">${monthNames[month]} ${year}</span><button class="cal-nav-btn" id="empCalNext">&#8594;</button>`;
    wrap.appendChild(hdr);

    const grid = document.createElement("div"); grid.className = "cal-grid";
    dayNames.forEach(d => { const cell = document.createElement("div"); cell.className = "cal-day-name"; cell.textContent = d; grid.appendChild(cell); });

    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) { const b = document.createElement("div"); b.className = "cal-cell cal-cell-empty"; grid.appendChild(b); }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const reqs = requestsOnDate(dateStr);
        const isToday = dateStr === today;
        const isPH = PUBLIC_HOLIDAYS.has(dateStr);

        const cell = document.createElement("div");
        cell.className = "cal-cell" + (isToday ? " cal-today" : "") + (isPH ? " cal-ph" : "");

        const num = document.createElement("span"); num.className = "cal-date-num"; num.textContent = d; cell.appendChild(num);

        if (isPH) {
            const phLabel = document.createElement("div"); phLabel.className = "cal-ph-label"; phLabel.textContent = PH_NAMES[dateStr]; cell.appendChild(phLabel);
        }

        if (reqs.length > 0) {
            const onLeave = new Set(reqs.map(r => r.user)).size;
            const avail = totalUsers() - onLeave;
            const badge = document.createElement("span"); badge.className = "cal-manpower"; badge.textContent = avail + "/" + totalUsers(); cell.appendChild(badge);
        }

        const shown = reqs.slice(0, 3); const extra = reqs.length - shown.length;
        shown.forEach(r => {
            const bar = document.createElement("div");
            bar.className = "cal-bar" + (r.status === "Pending" ? " cal-bar-pending" : "");
            bar.style.background = TEAM_COLORS[r.team] || "#999";
            bar.textContent = r.user.split(" ")[0];
            cell.appendChild(bar);
        });
        if (extra > 0) { const more = document.createElement("div"); more.className = "cal-bar-more"; more.textContent = "+" + extra + " more"; cell.appendChild(more); }

        cell.addEventListener("mouseenter", (e) => showCalTooltip(e, dateStr, reqs));
        cell.addEventListener("mouseleave", hideCalTooltip);
        grid.appendChild(cell);
    }

    wrap.appendChild(grid);
    document.getElementById("empCalPrev").addEventListener("click", () => { empCalDate.setMonth(empCalDate.getMonth() - 1); renderEmployeeCalendar(); });
    document.getElementById("empCalNext").addEventListener("click", () => { empCalDate.setMonth(empCalDate.getMonth() + 1); renderEmployeeCalendar(); });
}

function renderEmpWeekView(wrap) {
    wrap.innerHTML = "";
    const base = new Date(empCalDate), dow = base.getDay(), monday = new Date(base);
    monday.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1));
    const days = []; for (let i = 0; i < 7; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); days.push(d); }
    const fmt = (d) => d.toLocaleDateString("en-SG", { day: "numeric", month: "short" });
    const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const today = new Date().toISOString().slice(0, 10);

    const hdr = document.createElement("div"); hdr.className = "cal-nav";
    hdr.innerHTML = `<button class="cal-nav-btn" id="empCalPrev">&#8592;</button><span class="cal-title">${fmt(days[0])} – ${fmt(days[6])}</span><button class="cal-nav-btn" id="empCalNext">&#8594;</button>`;
    wrap.appendChild(hdr);

    const grid = document.createElement("div"); grid.className = "cal-week-grid";
    days.forEach((d, i) => {
        const dateStr = d.toISOString().slice(0, 10);
        const reqs = requestsOnDate(dateStr);
        const isToday = dateStr === today;
        const isPH = PUBLIC_HOLIDAYS.has(dateStr);

        const col = document.createElement("div");
        col.className = "cal-week-col" + (isToday ? " cal-today" : "") + (isPH ? " cal-ph" : "");

        const dayHdr = document.createElement("div"); dayHdr.className = "cal-week-day-hdr";
        dayHdr.innerHTML = `<span class="cal-week-dayname">${dayNames[i]}</span><span class="cal-week-datenum">${d.getDate()}</span>`;
        col.appendChild(dayHdr);

        if (isPH) { const phLabel = document.createElement("div"); phLabel.className = "cal-ph-label"; phLabel.style.cssText = "text-align:center;padding:2px 4px;"; phLabel.textContent = PH_NAMES[dateStr]; col.appendChild(phLabel); }

        if (reqs.length === 0) { const empty = document.createElement("div"); empty.className = "cal-week-empty"; empty.textContent = "—"; col.appendChild(empty); }
        else {
            const onLeave = new Set(reqs.map(r => r.user)).size; const avail = totalUsers() - onLeave;
            const mp = document.createElement("div"); mp.className = "cal-week-manpower"; mp.textContent = avail + "/" + totalUsers() + " available"; col.appendChild(mp);
            reqs.forEach(r => { const pill = document.createElement("div"); pill.className = "cal-week-pill" + (r.status === "Pending" ? " cal-bar-pending" : ""); pill.style.background = TEAM_COLORS[r.team] || "#999"; pill.innerHTML = `<span class="cal-pill-name">${r.user.split(" ")[0]}</span><span class="cal-pill-type">${r.type}</span>`; col.appendChild(pill); });
        }

        col.addEventListener("mouseenter", (e) => showCalTooltip(e, dateStr, reqs));
        col.addEventListener("mouseleave", hideCalTooltip);
        grid.appendChild(col);
    });

    wrap.appendChild(grid);
    document.getElementById("empCalPrev").addEventListener("click", () => { empCalDate.setDate(empCalDate.getDate() - 7); renderEmployeeCalendar(); });
    document.getElementById("empCalNext").addEventListener("click", () => { empCalDate.setDate(empCalDate.getDate() + 7); renderEmployeeCalendar(); });
}



// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

    // MY REQUESTS panel toggle
    const myHeader = document.getElementById("myRequestsHeader");
    const myBody = document.getElementById("myRequestsBody");
    if (myHeader && myBody) myHeader.addEventListener("click", () => myBody.classList.toggle("hidden"));

    // Recent logins + autocomplete
    renderRecentLogins();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => renderSearchDropdown(e.target.value));
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                document.getElementById("searchDropdown").classList.add("hidden");
                initiateLogin(document.getElementById("searchInput").value);
            }
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest("#userSection")) document.getElementById("searchDropdown")?.classList.add("hidden");
        });
    }

    // MY REQUESTS filters
    ["mySearchText","myFromDate","myToDate","myStatus","myType"].forEach(id => {
        const el = document.getElementById(id); if (el) el.addEventListener("input", renderEmployeeRequests);
    });

    const clearBtn = document.getElementById("myClearFilters");
    if (clearBtn) clearBtn.addEventListener("click", () => {
        ["mySearchText","myFromDate","myToDate"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
        const s=document.getElementById("myStatus"); const t=document.getElementById("myType");
        if(s) s.value=""; if(t) t.value="";
        renderEmployeeRequests();
    });

    const newUserNameEl = document.getElementById("newUserName");
    if (newUserNameEl) {
        newUserNameEl.addEventListener("input", (e) => {
            const pos = e.target.selectionStart;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(pos, pos);
        });
    }

    // Document-level delegation for admin buttons
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#requests button[data-action][data-id]");
        if (!btn) return;
        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        if (!id || Number.isNaN(id)) return;
        const latest = JSON.parse(localStorage.getItem("requests")) || [];

        if (action === "approve") { approveRequest(id); return; }
        if (action === "reject") {
            const req = latest.find(r => r.id === id);
            if (req && req.type === "Leave" && req.deducted) {
                const user = users.find(u => normName(u.name) === normName(req.user));
                if (user) {
                    const refund = req.chargeableDays !== undefined
                        ? req.chargeableDays
                        : countLeaveDays(req.start, req.end).chargeable;
        
                    user.leave += refund;
        
                    // Cap at original entitlement from DEFAULT_USERS
                    const defaultUser = DEFAULT_USERS.find(u => normName(u.name) === normName(user.name));
                    if (defaultUser) user.leave = Math.min(user.leave, defaultUser.leave);
        
                    localStorage.setItem("users", JSON.stringify(users));
                    sb.updateUserLeave(user.name, user.leave); // ← sync to Supabase
                    if (isAdmin) renderAdminUserList();
                }
            }
            const next = latest.map(r => r.id === id ? { ...r, status: "Rejected", deducted: false } : r);
            updateRequestsStorage(next);
            return;
        }
        if (action === "archive") { adminArchiveOpen=true; updateRequestsStorage(latest.map(r => r.id===id ? {...r,archived:true,archivedAt:Date.now()} : r)); return; }
        if (action === "restore") { updateRequestsStorage(latest.map(r => r.id===id ? {...r,archived:false} : r)); return; }
        if (action === "purge") {
            showConfirm("Are you sure? This cannot be undone.", () => {
                sb.deleteRequest(id); // ← add this to sync deletion to Supabase
                updateRequestsStorage(latest.filter(r => r.id !== id));
            });
            return;
        }
        if (action === "editDecision") {
            const req=latest.find(r=>r.id===id); if(!req) return;
            const newStatus=req.status==="Approved"?"Rejected":"Approved";
            if (req.type === "Leave" && req.status === "Approved" && req.deducted) {
                const user = users.find(u => normName(u.name) === normName(req.user));
                if (user) {
                    const refund = req.chargeableDays !== undefined
                        ? req.chargeableDays
                        : countLeaveDays(req.start, req.end).chargeable;
            
                    user.leave += refund;
            
                    const defaultUser = DEFAULT_USERS.find(u => normName(u.name) === normName(user.name));
                    if (defaultUser) user.leave = Math.min(user.leave, defaultUser.leave);
            
                    localStorage.setItem("users", JSON.stringify(users));
                    sb.updateUserLeave(user.name, user.leave);
                    renderAdminUserList();
                }
                req.deducted = false;
            }
            if(newStatus==="Approved"){ approveRequest(id); return; }
            updateRequestsStorage(latest.map(r => r.id===id ? {...r,status:"Rejected",deducted:false} : r));
            return;
        }
    });
    initApp();
});

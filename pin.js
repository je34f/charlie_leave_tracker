// ================= PIN SYSTEM =================

function getPins() {
    return JSON.parse(localStorage.getItem("pins")) || {};
}

function savePins(pins) {
    localStorage.setItem("pins", JSON.stringify(pins));
}

function userHasPin(name) {
    return !!getPins()[normName(name)];
}

function verifyPin(name, pin) {
    return getPins()[normName(name)] === pin;
}

function setPin(name, pin) {
    const pins = getPins();
    pins[normName(name)] = pin;
    savePins(pins);
}

function resetPin(name) {
    const pins = getPins();
    delete pins[normName(name)];
    savePins(pins);
}

// ── SHOW PIN MODAL ───────────────────────────────────────────────────
// mode: "enter" | "create"
function showPinModal(userName, mode, onSuccess) {
    document.getElementById("pinModal")?.remove();

    let entered = "";
    let firstPin = "";   // used in create mode to store first entry
    let phase = mode === "create" ? "create1" : "enter";
    // phases: "enter", "create1" (set new), "create2" (confirm new)

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

    function updateDots() {
        dots.forEach((d, i) => d.classList.toggle("filled", i < entered.length));
    }

    function setPhaseUI() {
        errorEl.textContent = "";
        entered = "";
        updateDots();
        if (phase === "enter") {
            title.textContent = "Enter PIN";
            subtitle.textContent = userName.split(" ")[0];
        } else if (phase === "create1") {
            title.textContent = "Create PIN";
            subtitle.textContent = "Choose a 4-digit PIN";
        } else if (phase === "create2") {
            title.textContent = "Confirm PIN";
            subtitle.textContent = "Re-enter your PIN to confirm";
        }
    }

    function handleDigit(d) {
        if (entered.length >= 4) return;
        entered += d;
        updateDots();
        if (entered.length === 4) {
            setTimeout(() => handleComplete(), 200);
        }
    }

    function handleDelete() {
        entered = entered.slice(0, -1);
        updateDots();
        errorEl.textContent = "";
    }

    function handleComplete() {
        if (phase === "enter") {
            if (verifyPin(userName, entered)) {
                overlay.remove();
                onSuccess();
            } else {
                errorEl.textContent = "Incorrect PIN. Try again.";
                entered = "";
                updateDots();
                // shake dots
                dotsWrap.style.animation = "none";
                dotsWrap.offsetHeight;
                dotsWrap.style.animation = "shake 0.4s";
            }
        } else if (phase === "create1") {
            firstPin = entered;
            phase = "create2";
            setPhaseUI();
        } else if (phase === "create2") {
            if (entered === firstPin) {
                setPin(userName, entered);
                overlay.remove();
                onSuccess();
            } else {
                errorEl.textContent = "PINs don't match. Start again.";
                firstPin = "";
                phase = "create1";
                setPhaseUI();
            }
        }
    }

    // Build numpad: 1-9, then cancel/0/del
    const pad = document.createElement("div");
    pad.className = "pin-pad";

    [1,2,3,4,5,6,7,8,9].forEach(n => {
        const btn = document.createElement("button");
        btn.className = "pin-key";
        btn.type = "button";
        btn.textContent = n;
        btn.addEventListener("click", () => handleDigit(String(n)));
        pad.appendChild(btn);
    });

    // Bottom row: cancel | 0 | del
    const cancelKey = document.createElement("button");
    cancelKey.className = "pin-cancel-link";
    cancelKey.type = "button";
    cancelKey.textContent = "Cancel";
    cancelKey.addEventListener("click", () => overlay.remove());

    const zeroKey = document.createElement("button");
    zeroKey.className = "pin-key";
    zeroKey.type = "button";
    zeroKey.textContent = "0";
    zeroKey.addEventListener("click", () => handleDigit("0"));

    const delKey = document.createElement("button");
    delKey.className = "pin-key pin-del";
    delKey.type = "button";
    delKey.textContent = "⌫";
    delKey.addEventListener("click", handleDelete);

    pad.appendChild(cancelKey);
    pad.appendChild(zeroKey);
    pad.appendChild(delKey);

    // Keyboard support
    overlay.addEventListener("keydown", (e) => {
        if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
        else if (e.key === "Backspace") handleDelete();
        else if (e.key === "Escape") overlay.remove();
    });

    box.appendChild(title);
    box.appendChild(subtitle);
    box.appendChild(dotsWrap);
    box.appendChild(errorEl);
    box.appendChild(pad);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.focus();
    overlay.setAttribute("tabindex", "0");

    setPhaseUI();
}

// ── INTERCEPT LOGIN ──────────────────────────────────────────────────
// Call this instead of searchUser() directly when a name is selected
function initiateLogin(name) {
    // find user
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase().trim());
    if (!user) {
        showToast("User not found", "#dc3545");
        return;
    }

    const mode = userHasPin(user.name) ? "enter" : "create";

    showPinModal(user.name, mode, () => {
        // PIN passed — now do the actual login
        document.getElementById("searchInput").value = user.name;
        searchUser();
    });
}

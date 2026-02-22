// ================= USERS =================
const users = JSON.parse(localStorage.getItem("users")) || [
    { name: "WONG JIA HUI CHERYL", leave: 14},
    { name: "FABIUS TAN CHOON KEONG", leave: 14},
    { name: "FOO YI MING TED", leave: 8},
    { name: "SAKTHI PRAKASH S/O THANABAL", leave: 15},
    { name: "JOVAN TIU ZHE KANG", leave: 0},
    { name: "RYAN TEOH AN", leave: 0},
    { name: "WONG LIN KIAT, RYAN", leave: 14},
    { name: "JOASH ANG KAI YI", leave: 0},
    { name: "LIM WEI BIN, ERVIN", leave: 14},
    { name: "LEONG JIASHENG MAX", leave: 14},
    { name: "LEE WEN JIE", leave: 0},
    { name: "LEOW RUI YANG", leave: 6},
    { name: "CHENG JIN KANG NICHOLAS", leave: 8},
    { name: "YEO MING ZHOU, JABIN", leave: 7},
    { name: "TOH YOU JUN", leave: 14},
    { name: "EVAN JOEL DE SILVA", leave: 14},
    { name: "ZHU HENGRUI", leave: 14},
    { name: "THAM NETHANEEL", leave: 5},
    { name: "SHINE HTET AUNG", leave: 14},
    { name: "GLENN CHUA QI JUN", leave: 14},
    { name: "CHUA OONG SENG", leave: 14},
    { name: "JAKE KOH ZHI YONG", leave: 14},
    { name: "LOW ZONG XUAN, DYLAN", leave: 1},
    { name: "LOK YONGWEI, GARETH", leave: 7},
    { name: "LOH JERRY", leave: 14},
    { name: "AARON THNG JI HUI", leave: 14}
];

// ================= ADMINS =================
const admins = [
    "WONG JIA HUI CHERYL",
    "FABIUS TAN CHOON KEONG",
    "FOO YI MING TED",
    "SAKTHI PRAKASH S/O THANABAL"
];

// ================= STATE =================
let selectedUser = null;
let requests = JSON.parse(localStorage.getItem("requests")) || [];
let isAdmin = false;
let editRequestId = null; // <-- for editing

// ================= LOGIN =================
function searchUser() {
    const input = document.getElementById("searchInput").value.trim().toLowerCase();
    selectedUser = users.find(u => u.name.toLowerCase() === input);
    const info = document.getElementById("userInfo");

    if (!selectedUser) { info.innerHTML = "User not found"; return; }

    isAdmin = admins.some(a => a.toLowerCase() === selectedUser.name.toLowerCase());

    info.innerHTML = `
        <p><b>Name:</b> ${selectedUser.name}</p>
        <p><b>Leave Remaining:</b> ${selectedUser.leave}</p>
        <p><b>Role:</b> ${isAdmin ? "Approver" : "Employee"}</p>
    `;

    document.getElementById("formSection").classList.toggle("hidden", isAdmin);
    document.getElementById("adminSection").classList.toggle("hidden", !isAdmin);

    if (isAdmin) {
        renderRequests();
        renderAdminUserList();
    } else {
        renderEmployeeRequests();
    }
}

// ================= SUBMIT REQUEST =================
function submitRequest() {
    if (!selectedUser) return alert("Login first");
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    if (!start || !end) return alert("Select dates");

    if (editRequestId) {
        // Edit existing request
        const req = requests.find(r => r.id === editRequestId);
        req.type = document.getElementById("type").value;
        req.start = start;
        req.end = end;
        req.reason = document.getElementById("reason").value;
        req.status = "Pending"; // reset status on edit
        editRequestId = null;
        alert("Request updated");
    } else {
        // Create new request
        const req = {
            id: Date.now(),
            user: selectedUser.name,
            type: document.getElementById("type").value,
            start,
            end,
            reason: document.getElementById("reason").value,
            status: "Pending"
        };
        requests.push(req);
        alert("Request submitted");
    }

    localStorage.setItem("requests", JSON.stringify(requests));

    // reset form
    document.getElementById("type").value = "Leave";
    document.getElementById("start").value = "";
    document.getElementById("end").value = "";
    document.getElementById("reason").value = "";

    if (isAdmin) renderRequests();
    else renderEmployeeRequests();
}

// ================= EMPLOYEE HISTORY =================
function renderEmployeeRequests() {
    const box = document.getElementById("myRequests");
    if (!box) return;

    const my = requests.filter(r => r.user === selectedUser.name);
    box.innerHTML = "<h3>My Requests</h3>";
    if (my.length === 0) { box.innerHTML += "<p>No requests yet</p>"; return; }

    my.forEach(r => {
        const div = document.createElement("div");
        div.className = "request";
        div.innerHTML = `<div class="request-header"><span class="status ${r.status.toLowerCase()}">${r.status}</span></div>
                         <div class="request-body"><b>Type:</b> ${r.type}<br><b>Dates:</b> ${r.start} → ${r.end}</div>`;
        box.appendChild(div);
    });
}

// ================= ADMIN REQUEST PANEL =================
function renderRequests() {
    const box = document.getElementById("requests");
    box.innerHTML = "";
    if (requests.length === 0) { box.innerHTML = "<p>No requests submitted yet</p>"; return; }

    requests.forEach(r => {
        const div = document.createElement("div");
        div.className = "request";
        div.innerHTML = `<div class="request-header"><b>${r.user}</b> <span class="status ${r.status.toLowerCase()}">${r.status}</span></div>
                         <div class="request-body"><b>Type:</b> ${r.type}<br><b>Dates:</b> ${r.start} → ${r.end}<br><b>Reason:</b> ${r.reason}</div>`;

        const btnWrap = document.createElement("div");
        btnWrap.className = "request-buttons-spread";

        if (r.status === "Pending") {
            const approveBtn = document.createElement("button");
            approveBtn.textContent = "Approve";
            approveBtn.onclick = () => { approveRequest(r); };

            const rejectBtn = document.createElement("button");
            rejectBtn.textContent = "Reject";
            rejectBtn.onclick = () => { r.status = "Rejected"; localStorage.setItem("requests", JSON.stringify(requests)); renderRequests(); };

            btnWrap.appendChild(approveBtn);
            btnWrap.appendChild(rejectBtn);
        }

        // Delete Button (always visible)
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {
            requests = requests.filter(req => req.id !== r.id);
            localStorage.setItem("requests", JSON.stringify(requests));
            renderRequests();
        };
        btnWrap.appendChild(deleteBtn);

        // Edit Button (always visible)
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => {
            editRequestId = r.id;
            document.getElementById("type").value = r.type;
            document.getElementById("start").value = r.start;
            document.getElementById("end").value = r.end;
            document.getElementById("reason").value = r.reason;
            document.getElementById("formSection").classList.remove("hidden");
        };
        btnWrap.appendChild(editBtn);

        div.appendChild(btnWrap);
        box.appendChild(div);
    });
}

// ================= APPROVE REQUEST =================
function approveRequest(r) {
    r.status = "Approved";
    const user = users.find(u => u.name === r.user);
    if (user && r.type === "Leave") {
        const days = Math.floor((new Date(r.end) - new Date(r.start)) / (1000*60*60*24)) + 1;
        user.leave = Math.max(0, user.leave - days);
    }
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("requests", JSON.stringify(requests));
    renderRequests();
    if (selectedUser && selectedUser.name === r.user) renderEmployeeRequests();
}

// ================= ADMIN: SCROLLABLE USER LIST =================
function renderAdminUserList() {
    const box = document.getElementById("adminUserList");
    const editBox = document.getElementById("adminUserEdit");
    box.innerHTML = ""; editBox.innerHTML = "";

    users.forEach(u => {
        const div = document.createElement("div");
        div.textContent = u.name;
        div.onclick = () => {
            editBox.innerHTML = `<div class="admin-user-edit">
                <span>${u.name} - Leaves:</span>
                <input type="number" min="0" value="${u.leave}" id="editLeave">
                <button onclick="updateLeave('${u.name}')">Update</button>
            </div>`;
        };
        box.appendChild(div);
    });
}

function updateLeave(name) {
    const val = parseInt(document.getElementById("editLeave").value);
    const user = users.find(u => u.name === name);
    if (user) { user.leave = val; localStorage.setItem("users", JSON.stringify(users)); alert(`Updated ${name} leaves to ${val}`); }
    renderAdminUserList();
    if (selectedUser && selectedUser.name === name) renderEmployeeRequests();
}
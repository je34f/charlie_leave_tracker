/* GENERAL */
body {
    font-family: Inter, sans-serif;
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
}

/* HEADER CONTAINER */
.header{
    text-align:center;
    padding:15px 10px;
    border-bottom:2px solid rgba(255,255,255,0.25);
}

/* LOGO */
.logo{
    width:120px;
    height:auto;
    display:block;
    margin:0 auto 10px;
    transition:0.3s;
}

/* TITLE */
.header h1{
    margin:0;
    font-weight:700;
    letter-spacing:1px;
    font-size:28px;
}
@media (max-width:600px){

    .logo{
        width:80px;
    }

    .header h1{
        font-size:20px;
        letter-spacing:0.5px;
    }

    .header{
        padding:10px 5px;
    }
}

@media (min-width:1200px){

    .logo{
        width:150px;
        filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
    }

    .header h1{
        font-size:34px;
    }
}


h1 { text-align: center; margin-bottom: 20px; }
.card { background: #f9f9f9; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);}
.hidden { display: none; }

h1 {
    text-align: center;
    font-size: 42px;
    animation: fadeSlide 1s ease forwards;
    opacity: 0;
}

@keyframes fadeSlide {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

input, select, textarea, button { margin-top: 6px; margin-bottom: 12px; width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc; box-sizing: border-box;}
textarea { resize: vertical;}
.dates input { width: 48%; }

/*Log In Page*/
.login-btn {
    background-color: #4f95df;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: 0.3s;
}

.login-btn:hover {
    background-color: #0056b3;
}

.typeBtn{
    padding: 14px 20px;
    margin: 10px;
    font-size: 18px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: 0.2s;
    width: 40%;
}

.leaveBtn{
    background: #28a745;
    color: white;
}

.offBtn{
    background: #007bff;
    color: white;
}

.typeBtn:hover{
    transform: scale(1.05);
}

/* RECENT LOGINS */
.recent-logins-label {
    font-size: 12px;
    font-weight: 600;
    color: #888;
    margin: 8px 0 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.recent-btn {
    display: inline-block;
    margin: 3px 4px 3px 0;
    padding: 5px 12px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    width: auto;
    color: #333;
}

.recent-btn:hover {
    background: #222;
    color: #fff;
    border-color: #222;
}

/* AUTOCOMPLETE DROPDOWN */
.search-dropdown {
    position: absolute;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    width: 100%;
    margin-top: -10px;
}

.search-dropdown-item {
    padding: 10px 14px;
    font-size: 14px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.15s;
}

.search-dropdown-item:last-child {
    border-bottom: none;
}

.search-dropdown-item:hover {
    background: #f5f5f5;
}

/* Make the login card position:relative so dropdown positions correctly */
#userSection {
    position: relative;
}


/* ── PIN MODAL ──────────────────────────────────────────────── */
.pin-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.pin-box {
    background: #fff;
    border-radius: 16px;
    padding: 28px 28px 24px;
    width: 90%;
    max-width: 320px;
    text-align: center;
    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
}

.pin-box h3 {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 700;
    color: #111;
}

.pin-box .pin-subtitle {
    font-size: 13px;
    color: #888;
    margin-bottom: 20px;
}

/* PIN dot display */
.pin-dots {
    display: flex;
    justify-content: center;
    gap: 14px;
    margin-bottom: 24px;
}

.pin-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #ccc;
    background: transparent;
    transition: all 0.15s;
}

.pin-dot.filled {
    background: #222;
    border-color: #222;
}

/* Number pad */
.pin-pad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 14px;
}

.pin-key {
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    font-size: 20px;
    font-weight: 600;
    padding: 14px 0;
    cursor: pointer;
    transition: all 0.15s;
    color: #222;
    width: 100%;
}

.pin-key:hover {
    background: #222;
    color: #fff;
    border-color: #222;
    opacity: 1;
}

.pin-key:active {
    transform: scale(0.94);
}

.pin-key.pin-del {
    background: #fee2e2;
    color: #dc3545;
    border-color: #fca5a5;
    font-size: 16px;
}

.pin-key.pin-del:hover {
    background: #dc3545;
    color: #fff;
    border-color: #dc3545;
}

.pin-key.pin-confirm {
    background: #222;
    color: #fff;
    border-color: #222;
    font-size: 14px;
    font-weight: 700;
}

.pin-key.pin-confirm:hover {
    background: #444;
}

.pin-error {
    color: #dc3545;
    font-size: 13px;
    font-weight: 600;
    min-height: 18px;
    margin-bottom: 8px;
}

.pin-cancel-link {
    font-size: 13px;
    color: #aaa;
    cursor: pointer;
    text-decoration: underline;
    background: none;
    border: none;
    padding: 0;
    width: auto;
    margin: 0;
    font-weight: 400;
}

.pin-cancel-link:hover {
    color: #555;
    opacity: 1;
}



/* SHAKE ANIMATION */
@keyframes shake {
    0% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-8px); }
    80% { transform: translateX(8px); }
    100% { transform: translateX(0); }
}

.shake {
    animation: shake 0.4s;
    border: 2px solid red;
}



/* REQUEST CARDS */
.request { position: relative; padding: 15px; margin-top: 12px; border-radius: 12px; background: #fff; border: 1px solid #ddd; }
.request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.request-body { font-size: 14px; }
.status { padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 13px; }
.status.pending { background: #fff3cd; color: #856404; }
.status.approved { background: #d4edda; color: #155724; }
.status.rejected { background: #f8d7da; color: #721c24; }

/* toast notification */
.toast{
    position: fixed;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    background: #28a745;
    color: white;
    padding: 14px 26px;
    border-radius: 12px;
    font-weight: bold;
    box-shadow: 0 8px 25px rgba(0,0,0,0.25);
    transition: top 0.5s ease;
    z-index: 9999;
}

.toast.show{
    top:20px;
}

/* CONFIRM MODAL */
.confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.confirm-box {
    background: #fff;
    border-radius: 12px;
    padding: 24px 28px;
    max-width: 320px;
    width: 90%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.confirm-box p {
    margin: 0 0 20px;
    font-size: 16px;
    font-weight: 600;
    font-family: Inter, sans-serif;
    color: #222;
}

.confirm-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.confirm-cancel {
    padding: 8px 22px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #f5f5f5;
    color: #333;
    font-size: 14px;
    cursor: pointer;
}

.confirm-cancel:hover {
    background: #e0e0e0;
}

.confirm-yes {
    padding: 8px 22px;
    border-radius: 8px;
    background: #dc3545;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.confirm-yes:hover {
    background: #b02a37;
}


/* Home Button */

.homeBtn{
    margin-top:10px;
    background:#6c757d;
}
.homeBtn:hover{
    background:#2e4d64;
}

#floatingHome {
    display: none;
    position: fixed;
    top: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.25);

    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);

    color: white;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);

    transition: all 0.25s ease;
    animation: pulse 2.5s infinite;
}

#floatingHome:hover {
    transform: translateY(-3px) scale(1.1);
    background: #32612d;
    box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

#floatingHome:active {
    transform: scale(0.95);
}

/* glowing pulse */
@keyframes pulse {
    0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.25), 0 0 0 0 rgba(255,255,255,0.1); }
    50% { box-shadow: 0 8px 25px rgba(0,0,0,0.35), 0 0 20px 6px rgba(255,255,255,0.15); }
}

/* dark/light adaptive */
@media (prefers-color-scheme: dark) {
    #floatingHome {
        background: #3a5311;
        border: 1px solid rgba(255,255,255,0.2);
    }
}

@media (prefers-color-scheme: light) {
    #floatingHome {
        background: #3a5311;
        border: 1px solid rgba(255,255,255,0.35);
        color: #333;
    }
}

/* User home btn below submit */
.homeBtn {
    margin-top: 10px;
    padding: 10px 20px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.3);
    cursor: pointer;
    transition: all 0.3s ease;
}

.homeBtn:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.05);
}

.submitBtn{
    width:100%;
    padding:14px;
    border:none;
    border-radius:14px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing:.5px;
    cursor:pointer;
    color:black;
    box-shadow: 0 6px 18px rgba(0,0,0,0.15);
    backdrop-filter: blur(8px);

    transition: all 0.25s ease;
}

.submitBtn:hover{
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}

/* click */
.submitBtn:active{
    transform: scale(0.97);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.submitBtn:disabled{
    background:#ccc;
    cursor:not-allowed;
    opacity: 0.6;
}

/* Spinning animation when submitting */
.spinner{
    width:16px;
    height:16px;
    border:3px solid #fff;
    border-top:3px solid #28a745;
    border-radius:50%;
    display:inline-block;
    margin-left:8px;
    animation:spin 1s linear infinite;
}

@keyframes spin{
    0% { transform:rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.hidden{
    display: none;
}


/* SPREAD BUTTONS */
.request-buttons-spread { display: flex; justify-content: space-between; margin-top: 12px; }
.request-buttons-spread button { flex: 1; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; margin: 0 5px; transition: all 0.2s ease; }
.request-buttons-spread button:first-child { background-color: #28a745; color: white;}
.request-buttons-spread button:first-child:hover { background-color: #218838; transform: scale(1.05);}
.request-buttons-spread button:nth-child(2) { background-color: #dc3545; color: white;}
.request-buttons-spread button:nth-child(2):hover { background-color: #c82333; transform: scale(1.05);}
.request-buttons-spread button:last-child { background-color: #6c757d; color: white; }
.request-buttons-spread button:last-child:hover { background-color: #5a6268; transform: scale(1.05); }

/* ADMIN USER PANEL */
.scroll-list { max-height: 150px; overflow-y: scroll; border: 1px solid #ccc; padding: 5px; border-radius: 8px; margin-bottom: 12px;}
.scroll-list div { padding: 8px; cursor: pointer; border-bottom: 1px solid #eee; }
.scroll-list div:hover { background-color: #f1f1f1; }

.admin-user-edit { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.admin-user-edit input { width: 60px; padding: 4px 6px; border-radius: 6px; border: 1px solid #ccc; }
.admin-user-edit button { padding: 5px 10px; border-radius: 6px; background-color: #007bff; color: white; border: none; cursor: pointer; }
.admin-user-edit button:hover { background-color: #0069d9; }

.teamHeader{
    display:flex;
    justify-content:space-between;
    align-items:center;
    background:#222;
    color:white;
    padding:10px 14px;
    margin-top:20px;
    border-radius:10px;
}

.pendingBadge{
    background:#ff9800;
    padding:4px 10px;
    border-radius:20px;
    font-size:13px;
    font-weight:bold;
}

.noReq{
    opacity:0.7;
    margin:8px 0 12px 10px;
}


.userRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.leaveEditor {
    display: flex;
    align-items: center;
    gap: 8px;
}

.leaveEditor button {
    background: #007bff; 
    border: none;
    color: white;
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
}

.leaveEditor button:hover {
    background: #0056b3;
}

.leaveCount {
    font-weight: bold;
    font-size: 16px;
    min-width: 25px;
    text-align: center;
}

#myRequestsBody .card input,
#myRequestsBody .card select {
  margin-bottom: 10px;
}

/* Button colors */
.approveBtn {
    background-color: #28a745;
    color: white;
}

.rejectBtn {
    background-color: #dc3545;
    color: white;
}

.editBtn {
    background-color: #007bff;
    color: white;
}

.deleteBtn {
    background-color: #6c757d;
    color: white;
}

button {
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

button:hover {
    opacity: 0.85;
}

.teamContainer { margin-top: 20px; border-radius: 5px; border:1px solid #ccc; overflow:hidden; }
.teamHeader { background:#222; top: 20px; color:white; padding:5px 20px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
.pendingBadge { background:#ff9800; padding:4px 20px; border-radius:20px; font-size:13px; font-weight:bold; }
.teamRequests { padding:2px; background:#f8f8f8; }
.teamRequests.hidden { display:none; }

.request { position: relative; padding: 12px; margin-top: 12px; border-radius: 10px; background: #fff; border: 1px solid #ddd; }
.btnWrap { margin-top:8px; display:flex; gap:6px; flex-wrap:wrap; }
.approveBtn { background:#28a745;color:#fff; } .rejectBtn { background:#dc3545;color:#fff; }
.editBtn { background:#007bff;color:#fff; } .deleteBtn { background:#6c757d;color:#fff; }
.btnWrap button { flex:1; padding:6px 10px; border:none; border-radius:6px; cursor:pointer; font-weight:bold; }
.noReq { opacity:0.7; margin:6px 0; font-style:italic; }


/* MOBILE */
@media (max-width: 600px) {
    .dates input { width: 100%; margin-bottom: 8px; }
    .request-buttons-spread button { flex: 1; margin: 4px 0; }
}


/* CALENDAR */

/* ── CALENDAR SECTION ───────────────────────────────────────── */
#calendarSection {
    margin-top: 28px;
}

#calendarSection h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #222;
}

/* View toggle tabs */
.cal-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.cal-tab {
    padding: 7px 20px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #f5f5f5;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: #555;
}

.cal-tab:hover {
    background: #e0e0e0;
}

.cal-tab-active {
    background: #222;
    color: #fff;
    border-color: #222;
}

/* Filter row */
.cal-filter-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
    flex-wrap: wrap;
}

.cal-filter-row label {
    font-size: 13px;
    font-weight: 600;
    color: #555;
}

.cal-filter-row select {
    width: auto;
    font-size: 13px;
    padding: 5px 10px;
    border-radius: 7px;
    margin: 0;
}

/* Legend */
.cal-legend {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 14px;
}

.cal-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #444;
}

.cal-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
}

/* Nav row */
.cal-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.cal-title {
    font-size: 16px;
    font-weight: 700;
    color: #222;
}

.cal-nav-btn {
    background: #222;
    color: #fff;
    border: none;
    border-radius: 8px;
    width: 34px;
    height: 34px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    width: auto;
    padding: 6px 14px;
}

.cal-nav-btn:hover {
    background: #444;
    opacity: 1;
}

/* ── MONTH GRID ─────────────────────────────────────────────── */
.cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.cal-day-name {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    padding: 4px 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.cal-cell {
    min-height: 90px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 6px 5px 4px;
    background: #fff;
    position: relative;
    transition: box-shadow 0.15s;
    cursor: default;
    overflow: hidden;
}

.cal-cell:hover {
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    z-index: 2;
}

.cal-cell-empty {
    background: #fafafa;
    border-color: #f0f0f0;
    cursor: default;
}

.cal-today {
    border: 2px solid #6366f1;
    background: #f5f4ff;
}

.cal-date-num {
    font-size: 13px;
    font-weight: 700;
    color: #333;
    display: block;
    margin-bottom: 3px;
}

.cal-today .cal-date-num {
    color: #6366f1;
}

.cal-manpower {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 10px;
    font-weight: 700;
    background: #222;
    color: #fff;
    border-radius: 5px;
    padding: 1px 5px;
}

.cal-bar {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    border-radius: 4px;
    padding: 2px 5px;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cal-bar-pending {
    opacity: 0.55;
    outline: 2px dashed rgba(0,0,0,0.2);
    outline-offset: -2px;
}

.cal-bar-more {
    font-size: 10px;
    color: #888;
    font-weight: 600;
    padding: 1px 3px;
}

/* ── WEEK GRID ──────────────────────────────────────────────── */
.cal-week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
}

.cal-week-col {
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    transition: box-shadow 0.15s;
    cursor: default;
}

.cal-week-col:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.cal-week-col.cal-today {
    border: 2px solid #6366f1;
}

.cal-week-day-hdr {
    background: #222;
    color: #fff;
    padding: 8px 6px;
    text-align: center;
}

.cal-week-col.cal-today .cal-week-day-hdr {
    background: #6366f1;
}

.cal-week-dayname {
    display: block;
    font-size: 11px;
    font-weight: 700;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.cal-week-datenum {
    display: block;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.1;
}

.cal-week-manpower {
    font-size: 11px;
    font-weight: 700;
    color: #555;
    text-align: center;
    padding: 6px 4px 2px;
}

.cal-week-pill {
    margin: 4px 6px;
    border-radius: 6px;
    padding: 5px 7px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
}

.cal-pill-name {
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cal-pill-type {
    font-size: 10px;
    opacity: 0.85;
    flex-shrink: 0;
}

.cal-week-empty {
    text-align: center;
    color: #bbb;
    font-size: 18px;
    padding: 20px 0;
}

/* ── TOOLTIP ────────────────────────────────────────────────── */
.cal-tooltip {
    position: fixed;
    z-index: 99999;
    background: #1a1a1a;
    color: #fff;
    border-radius: 12px;
    padding: 14px 16px;
    min-width: 220px;
    max-width: 280px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.35);
    pointer-events: none;
    font-size: 13px;
}

.cal-tip-date {
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 6px;
    color: #fff;
}

.cal-tip-manpower {
    font-size: 13px;
    font-weight: 600;
    color: #a3e635;
    margin-bottom: 8px;
}

.cal-tip-divider {
    height: 1px;
    background: rgba(255,255,255,0.15);
    margin-bottom: 8px;
}

.cal-tip-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.cal-tip-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
}

.cal-tip-name {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cal-tip-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
    flex-shrink: 0;
}

.tip-approved {
    background: #16a34a;
    color: #fff;
}

.tip-pending {
    background: #d97706;
    color: #fff;
}

/* Mobile */
@media (max-width: 600px) {
    .cal-grid { gap: 2px; }
    .cal-cell { min-height: 60px; padding: 4px 3px; }
    .cal-week-grid { grid-template-columns: repeat(7, 1fr); gap: 3px; }
    .cal-week-datenum { font-size: 15px; }
    .cal-week-pill { padding: 3px 4px; }
    .cal-pill-type { display: none; }
}

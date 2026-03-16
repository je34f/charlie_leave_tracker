// ================= SUPABASE CONFIG =================
const SUPABASE_URL = "https://pmtlxyaoyvajebgioczg.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtdGx4eWFveXZhamViZ2lvY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE0ODIsImV4cCI6MjA4ODYyNzQ4Mn0.WmQH1ucEgirlyzyB8m5z8YAv01ZLpX1SXR5ausg-ovg"; 

const sb = {
    headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
    },

    
    async get(table, params = "") {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: this.headers });
        return res.json();
    },

    async post(table, body) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: "POST",
            headers: { ...this.headers, "Prefer": "return=representation" },
            body: JSON.stringify(body)
        });
        return res.json();
    },

    async patch(table, match, body) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
            method: "PATCH",
            headers: { ...this.headers, "Prefer": "return=representation" },
            body: JSON.stringify(body)
        });
        return res.json();
    },

    async delete(table, match) {
        await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
            method: "DELETE",
            headers: this.headers
        });
    },

    // ── REQUESTS ──────────────────────────────────────────────
    async getRequests() {
        return this.get("requests", "order=id.desc");
    },

    async upsertRequest(req) {
        // Convert camelCase → snake_case for DB
        const row = {
            id: req.id,
            user: req.user,
            team: req.team,
            type: req.type,
            half_day: req.halfDay || null,
            start: req.start,
            end: req.end,
            reason: req.reason || null,
            status: req.status,
            deducted: req.deducted || false,
            archived: req.archived || false,
            archived_at: req.archivedAt || null
        };
        const res = await fetch(`${SUPABASE_URL}/rest/v1/requests`, {
            method: "POST",
            headers: { ...this.headers, "Prefer": "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify(row)
        });
        return res.json();
    },

    async updateRequest(id, fields) {
        // Convert archivedAt → archived_at if present
        if (fields.archivedAt !== undefined) { fields.archived_at = fields.archivedAt; delete fields.archivedAt; }
        return this.patch("requests", `id=eq.${id}`, fields);
    },

    async deleteRequest(id) {
        return this.delete("requests", `id=eq.${id}`);
    },

    // ── USERS ──────────────────────────────────────────────────
    async getUsers() {
        return this.get("users", "order=name.asc");
    },

    async updateUserLeave(name, leave) {
        return this.patch("users", `name=eq.${encodeURIComponent(name)}`, { leave });
    },

    // ── PINS ───────────────────────────────────────────────────
    async getPins() {
        const rows = await this.get("pins");
        return Object.fromEntries(rows.map(r => [r.name, r.pin]));
    },

    async upsertPin(name, pin) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/pins`, {
            method: "POST",
            headers: { ...this.headers, "Prefer": "resolution=merge-duplicates" },
            body: JSON.stringify({ name, pin })
        });
        return res.ok;
    },

    async deletePin(name) {
        return this.delete("pins", `name=eq.${encodeURIComponent(name)}`);
    }
};
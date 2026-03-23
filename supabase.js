// ================= SUPABASE CONFIG =================
const SUPABASE_URL = "https://pmtlxyaoyvajebgioczg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtdGx4eWFveXZhamViZ2lvY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE0ODIsImV4cCI6MjA4ODYyNzQ4Mn0.WmQH1ucEgirlyzyB8m5z8YAv01ZLpX1SXR5ausg-ovg";

const sb = {
    headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
    },

    // ── AUTH ────────────────────────────────────────────────────
    async signIn(email, password) {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem("sb_token", data.access_token);
            localStorage.setItem("sb_refresh", data.refresh_token);
            this._token = data.access_token;
        }
        return data;
    },

    async signOut() {
        const token = this.getToken();
        if (token) {
            await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": "Bearer " + token }
            });
        }
        localStorage.removeItem("sb_token");
        localStorage.removeItem("sb_refresh");
        localStorage.removeItem("sb_session_expiry");
        this._token = null;
    },

    async getUser() {
        const token = this.getToken();
        if (!token) return null;
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: { "apikey": SUPABASE_KEY, "Authorization": "Bearer " + token }
        });
        if (!res.ok) return null;
        return res.json();
    },

    async refreshSession() {
        const refresh = localStorage.getItem("sb_refresh");
        if (!refresh) return false;
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
            body: JSON.stringify({ refresh_token: refresh })
        });
        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem("sb_token", data.access_token);
            localStorage.setItem("sb_refresh", data.refresh_token);
            this._token = data.access_token;
            return true;
        }
        return false;
    },

    getToken() {
        return this._token || localStorage.getItem("sb_token");
    },

    // Returns auth headers using session token if available, else anon key
    authHeaders() {
        const token = this.getToken();
        return {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + (token || SUPABASE_KEY)
        };
    },

    // ── BASE CRUD ────────────────────────────────────────────────
    async get(table, params = "") {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
            headers: this.authHeaders()
        });
        return res.json();
    },

    async post(table, body) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: "POST",
            headers: { ...this.authHeaders(), "Prefer": "return=representation" },
            body: JSON.stringify(body)
        });
        return res.json();
    },

    async patch(table, match, body) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
            method: "PATCH",
            headers: { ...this.authHeaders(), "Prefer": "return=representation" },
            body: JSON.stringify(body)
        });
        return res.json();
    },

    async delete(table, match) {
        await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
            method: "DELETE",
            headers: this.authHeaders()
        });
    },

    // ── REQUESTS ──────────────────────────────────────────────────
    async getRequests() {
        return this.get("requests", "order=id.desc");
    },

    async upsertRequest(req) {
        const row = {
            id: req.id,
            user: req.user,
            team: req.team,
            type: req.type,
            start: req.start,
            end: req.end,
            reason: req.reason || null,
            status: req.status,
            deducted: req.deducted || false,
            archived: req.archived || false,
            archived_at: req.archivedAt || null,
            half_day: req.halfDay || null,
            chargeable_days: req.chargeableDays || null
        };
        const res = await fetch(`${SUPABASE_URL}/rest/v1/requests`, {
            method: "POST",
            headers: { ...this.authHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify(row)
        });
        return res.json();
    },

    async deleteRequest(id) {
        return this.delete("requests", `id=eq.${id}`);
    },

    // ── USERS ──────────────────────────────────────────────────────
    async getUsers() {
        return this.get("users", "order=name.asc");
    },

    async updateUserLeave(name, leave) {
        return this.patch("users", `name=eq.${encodeURIComponent(name)}`, { leave });
    },

    // ── PINS (server-side verify via Edge Function) ────────────────
    async verifyPinRemote(name, pin) {
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-pin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + SUPABASE_KEY
                },
                body: JSON.stringify({ name: name.toLowerCase().trim(), pin })
            });
            const data = await res.json();
            return data.valid === true;
        } catch (err) {
            console.error("PIN verify error:", err);
            return false;
        }
    },

    async setPinRemote(name, pin) {
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/set-pin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + SUPABASE_KEY
                },
                body: JSON.stringify({ name: name.toLowerCase().trim(), pin })
            });
            return res.ok;
        } catch (err) {
            console.error("PIN set error:", err);
            return false;
        }
    },

    async deletePinRemote(name) {
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/delete-pin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + SUPABASE_KEY
                },
                body: JSON.stringify({ name: name.toLowerCase().trim() })
            });
            return res.ok;
        } catch (err) {
            console.error("PIN delete error:", err);
            return false;
        }
    },

    async userHasPinRemote(name) {
        try {
            const result = await this.get("pins", `name=eq.${encodeURIComponent(name.toLowerCase().trim())}&select=name`);
            return Array.isArray(result) && result.length > 0;
        } catch { return false; }
    },

    // ── NOTIFICATIONS ──────────────────────────────────────────────
    async getNotifications(recipient) {
        return this.get("notifications", `recipient=eq.${encodeURIComponent(recipient)}&order=created_at.desc&limit=50`);
    },

    async addNotification(notif) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
            method: "POST",
            headers: { ...this.authHeaders(), "Prefer": "return=representation" },
            body: JSON.stringify(notif)
        });
        return res.json();
    },

    async markNotificationRead(id) {
        return this.patch("notifications", `id=eq.${id}`, { read: true });
    },

    async markAllNotificationsRead(recipient) {
        return this.patch("notifications", `recipient=eq.${encodeURIComponent(recipient)}`, { read: true });
    },

    async deleteNotification(id) {
        return this.delete("notifications", `id=eq.${id}`);
    }
};

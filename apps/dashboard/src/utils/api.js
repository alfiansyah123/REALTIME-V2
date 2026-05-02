// API Utility for Cloudflare D1 Backend
// This replaces direct Supabase calls

const API_BASE = window.location.hostname === 'localhost' ? '' : ''; // Use relative paths for Pages Functions
const GENERATOR_API = 'https://ngeteam-v2.pages.dev'; // Production Generator URL

export const api = {
    async verifyPassword(password) {
        const response = await fetch('/api/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input_password: password })
        });
        return await response.json();
    },

    async getConversions(limit = 100, startDate = null, endDate = null, clickId = null) {
        let url = `/api/conversions?limit=${limit}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        if (clickId) {
            url += `&clickId=${clickId}`;
        }
        const response = await fetch(url);
        return await response.json();
    },

    async getClicks(limit = 200) {
        // Fetch directly from the Generator Production API to ensure live data
        const response = await fetch(`${GENERATOR_API}/api/get-recent-clicks?_t=${Date.now()}`);
        return await response.json();
    },

    async getCountryLeads(date) {
        const response = await fetch(`/api/country-leads?date=${date}`);
        return await response.json();
    },

    async changePassword(oldPassword, newPassword) {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        });
        return await response.json();
    },

    async getDailyReports(startDate, endDate) {
        const response = await fetch(`/api/daily-reports?startDate=${startDate}&endDate=${endDate}`);
        return await response.json();
    }
};

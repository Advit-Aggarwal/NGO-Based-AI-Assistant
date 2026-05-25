// ==================== CONFIG ====================
const API = '/api';

// ==================== NAVIGATION ====================
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    const link = document.querySelector(`[data-page="${page}"]`);
    if (link) link.classList.add('active');
    // Close mobile sidebar
    document.body.classList.remove('sidebar-open');
    // Trigger page-specific loads
    if (page === 'volunteers') loadVolunteers();
    if (page === 'events') loadEvents();
    if (page === 'dashboard') loadDashboard();
}

// Sidebar nav clicks
document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
    });
});

// Mobile sidebar toggle
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
});
document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    document.body.classList.remove('sidebar-open');
});

// ==================== TOAST ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'check-circle-fill', error: 'exclamation-triangle-fill', info: 'info-circle-fill' };
    const bgClass = { success: 'text-bg-success', error: 'text-bg-danger', info: 'text-bg-info' };
    const html = `<div class="toast ${bgClass[type] || bgClass.info}" role="alert">
        <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi bi-${icons[type] || icons.info}"></i> ${message}
            <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
        </div>
    </div>`;
    container.insertAdjacentHTML('beforeend', html);
    const el = container.lastElementChild;
    const toast = new bootstrap.Toast(el, { delay: 3000 });
    toast.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}

// ==================== API HELPERS ====================
async function apiGet(path) {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

async function apiPost(path, data) {
    const res = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

async function apiPut(path, data) {
    const res = await fetch(API + path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

async function apiDelete(path) {
    const res = await fetch(API + path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return true;
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    try {
        const [volunteers, events, health] = await Promise.all([
            apiGet('/volunteers/'),
            apiGet('/events/'),
            apiGet('/health/'),
        ]);
        document.getElementById('stat-volunteers').textContent = volunteers.length;
        document.getElementById('stat-events').textContent = events.length;
        document.getElementById('stat-api').textContent = health.ok ? 'Online' : 'Offline';
        document.getElementById('stat-api').className = health.ok ? 'mb-0 text-success' : 'mb-0 text-danger';
    } catch (e) {
        document.getElementById('stat-api').textContent = 'Offline';
        document.getElementById('stat-api').className = 'mb-0 text-danger';
    }
}

// ==================== VOLUNTEERS ====================
let volunteersData = [];

async function loadVolunteers() {
    try {
        volunteersData = await apiGet('/volunteers/');
        renderVolunteers();
    } catch (e) {
        document.getElementById('volunteersBody').innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load: ${e.message}</td></tr>`;
    }
}

function renderVolunteers() {
    const body = document.getElementById('volunteersBody');
    if (volunteersData.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No volunteers yet. Click "Add Volunteer" to get started.</td></tr>';
        return;
    }
    body.innerHTML = volunteersData.map(v => `
        <tr>
            <td class="fw-semibold">${esc(v.name)}</td>
            <td>${esc(v.email || '—')}</td>
            <td>${esc(v.phone || '—')}</td>
            <td>${esc(v.skills || '—')}</td>
            <td>${esc(v.availability || '—')}</td>
            <td><span class="badge ${v.status === 'active' ? 'bg-success' : 'bg-secondary'}">${v.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editVolunteer(${v.id})" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteVolunteer(${v.id})" title="Delete"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function resetVolunteerForm() {
    document.getElementById('v_id').value = '';
    document.getElementById('v_name').value = '';
    document.getElementById('v_email').value = '';
    document.getElementById('v_phone').value = '';
    document.getElementById('v_skills').value = '';
    document.getElementById('v_avail').value = '';
    document.getElementById('v_status').value = 'active';
    document.getElementById('volunteerModalLabel').innerHTML = '<i class="bi bi-person-plus-fill me-2 text-primary"></i>Add Volunteer';
}

function editVolunteer(id) {
    const v = volunteersData.find(x => x.id === id);
    if (!v) return;
    document.getElementById('v_id').value = v.id;
    document.getElementById('v_name').value = v.name;
    document.getElementById('v_email').value = v.email || '';
    document.getElementById('v_phone').value = v.phone || '';
    document.getElementById('v_skills').value = v.skills || '';
    document.getElementById('v_avail').value = v.availability || '';
    document.getElementById('v_status').value = v.status;
    document.getElementById('volunteerModalLabel').innerHTML = '<i class="bi bi-pencil-fill me-2 text-primary"></i>Edit Volunteer';
    new bootstrap.Modal(document.getElementById('volunteerModal')).show();
}

async function saveVolunteer() {
    const id = document.getElementById('v_id').value;
    const data = {
        name: document.getElementById('v_name').value,
        email: document.getElementById('v_email').value,
        phone: document.getElementById('v_phone').value,
        skills: document.getElementById('v_skills').value,
        availability: document.getElementById('v_avail').value,
        status: document.getElementById('v_status').value,
    };
    if (!data.name) { showToast('Name is required', 'error'); return; }
    try {
        if (id) {
            await apiPut(`/volunteers/${id}/`, data);
            showToast('Volunteer updated');
        } else {
            await apiPost('/volunteers/', data);
            showToast('Volunteer added');
        }
        bootstrap.Modal.getInstance(document.getElementById('volunteerModal')).hide();
        loadVolunteers();
        loadDashboard();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

async function deleteVolunteer(id) {
    if (!confirm('Delete this volunteer?')) return;
    try {
        await apiDelete(`/volunteers/${id}/`);
        showToast('Volunteer deleted');
        loadVolunteers();
        loadDashboard();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

// ==================== EVENTS ====================
let eventsData = [];

async function loadEvents() {
    try {
        eventsData = await apiGet('/events/');
        renderEvents();
    } catch (e) {
        document.getElementById('eventsGrid').innerHTML = `<div class="col-12 text-center text-danger py-4">Failed to load: ${e.message}</div>`;
    }
}

function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    if (eventsData.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-muted py-4">No events yet. Click "Create Event" to get started.</div>';
        return;
    }
    grid.innerHTML = eventsData.map(e => `
        <div class="col-md-6 col-lg-4">
            <div class="card border-0 h-100 event-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${esc(e.title)}</h5>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary border-0" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                                <li><a class="dropdown-item" href="#" onclick="editEvent(${e.id})"><i class="bi bi-pencil me-2 text-primary"></i>Edit</a></li>
                                <li><a class="dropdown-item" href="#" onclick="deleteEvent(${e.id})"><i class="bi bi-trash me-2 text-danger"></i>Delete</a></li>
                            </ul>
                        </div>
                    </div>
                    <p class="text-muted small mb-3">${esc(e.description || 'No description')}</p>
                    <div class="d-flex flex-wrap gap-2">
                        <span class="badge bg-primary bg-opacity-25 text-primary-emphasis"><i class="bi bi-calendar3 me-1"></i>${esc(e.date)}</span>
                        ${e.location ? `<span class="badge bg-info bg-opacity-25 text-info-emphasis"><i class="bi bi-geo-alt me-1"></i>${esc(e.location)}</span>` : ''}
                        <span class="badge bg-warning bg-opacity-25 text-warning-emphasis"><i class="bi bi-people me-1"></i>${e.capacity} capacity</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function resetEventForm() {
    document.getElementById('e_id').value = '';
    document.getElementById('e_title').value = '';
    document.getElementById('e_location').value = '';
    document.getElementById('e_date').value = '';
    document.getElementById('e_capacity').value = '100';
    document.getElementById('e_desc').value = '';
    document.getElementById('eventModalLabel').innerHTML = '<i class="bi bi-calendar-plus-fill me-2 text-success"></i>Create Event';
}

function editEvent(id) {
    const e = eventsData.find(x => x.id === id);
    if (!e) return;
    document.getElementById('e_id').value = e.id;
    document.getElementById('e_title').value = e.title;
    document.getElementById('e_location').value = e.location || '';
    document.getElementById('e_date').value = e.date;
    document.getElementById('e_capacity').value = e.capacity;
    document.getElementById('e_desc').value = e.description || '';
    document.getElementById('eventModalLabel').innerHTML = '<i class="bi bi-pencil-fill me-2 text-success"></i>Edit Event';
    new bootstrap.Modal(document.getElementById('eventModal')).show();
}

async function saveEvent() {
    const id = document.getElementById('e_id').value;
    const data = {
        title: document.getElementById('e_title').value,
        location: document.getElementById('e_location').value,
        date: document.getElementById('e_date').value,
        capacity: parseInt(document.getElementById('e_capacity').value) || 100,
        description: document.getElementById('e_desc').value,
    };
    if (!data.title) { showToast('Title is required', 'error'); return; }
    if (!data.date) { showToast('Date is required', 'error'); return; }
    try {
        if (id) {
            await apiPut(`/events/${id}/`, data);
            showToast('Event updated');
        } else {
            await apiPost('/events/', data);
            showToast('Event created');
        }
        bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
        loadEvents();
        loadDashboard();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

async function deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    try {
        await apiDelete(`/events/${id}/`);
        showToast('Event deleted');
        loadEvents();
        loadDashboard();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

// ==================== DONATION CAMPAIGN ====================
async function genDonation() {
    const btn = document.getElementById('dc_btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Generating...';
    try {
        const data = {
            ngoName: document.getElementById('dc_ngo').value,
            cause: document.getElementById('dc_cause').value,
            audience: document.getElementById('dc_audience').value,
            targetAmount: Number(document.getElementById('dc_amount').value),
            deadline: document.getElementById('dc_deadline').value,
            tone: document.getElementById('dc_tone').value,
        };
        const result = await apiPost('/ai/donation-campaign/', data);
        const c = result.campaign;
        const p = result.posterText;
        document.getElementById('dc_output').innerHTML = `
            <h4 class="text-warning mb-3">${esc(c.title)}</h4>
            <p class="lead">${esc(c.oneLiner)}</p>
            <p>${esc(c.shortDescription)}</p>
            <h6 class="mt-3 text-uppercase small text-muted">Key Actions:</h6>
            <ul class="list-unstyled">
                ${c.keyBullets.map(b => `<li class="mb-2"><i class="bi bi-check2-circle text-success me-2"></i>${esc(b)}</li>`).join('')}
            </ul>
            <div class="d-flex flex-wrap gap-1 mt-3 mb-4">${c.suggestedHashtags.map(h => `<span class="badge bg-primary bg-opacity-25 text-primary-emphasis">${esc(h)}</span>`).join('')}</div>
            
            <h6 class="text-uppercase small text-muted"><i class="bi bi-image me-1"></i>Poster Text</h6>
            <div class="card bg-dark bg-opacity-50 border-secondary border-opacity-50">
                <div class="card-body text-center p-4">
                    <h3 class="fw-bold">${esc(p.headline)}</h3>
                    <h5 class="text-info mb-3">${esc(p.subheadline)}</h5>
                    <p class="mb-4">${esc(p.body)}</p>
                    <button class="btn btn-warning rounded-pill px-4 fw-semibold shadow-sm">${esc(p.cta)}</button>
                </div>
            </div>
        `;
        showToast('Campaign generated!', 'success');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-stars me-1"></i>Generate Campaign';
    }
}

// ==================== POSTER & CAPTION ====================
async function genPoster() {
    const btn = document.getElementById('pc_btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Generating...';
    try {
        const data = {
            campaignTitle: document.getElementById('pc_title').value,
            cause: document.getElementById('pc_cause').value,
            keyMessage: document.getElementById('pc_msg').value,
            ngoName: document.getElementById('pc_ngo').value,
            callToAction: document.getElementById('pc_cta').value,
            tone: document.getElementById('pc_tone').value,
        };
        const result = await apiPost('/ai/poster-caption/', data);
        const p = result.poster;
        document.getElementById('pc_output').innerHTML = `
            <h6 class="text-uppercase small text-muted"><i class="bi bi-image me-1"></i>Poster Layout</h6>
            <div class="card bg-dark bg-opacity-50 border-secondary border-opacity-50 mb-4">
                <div class="card-body text-center p-4">
                    <h2 class="fw-bold">${esc(p.headline)}</h2>
                    <h5 class="text-info mb-4">${esc(p.subheadline)}</h5>
                    <p class="fs-5 mb-4">${esc(p.body)}</p>
                    <hr class="border-secondary border-opacity-25">
                    <small class="text-muted text-uppercase tracking-wide">${esc(p.footer)}</small>
                </div>
            </div>
            <h6 class="text-uppercase small text-muted"><i class="bi bi-chat-square-text me-1"></i>Social Caption</h6>
            <div class="alert alert-info border-0 bg-info bg-opacity-10">${esc(result.socialCaption)}</div>
            <h6 class="text-uppercase small text-muted mt-3"><i class="bi bi-hash me-1"></i>Suggested Hashtags</h6>
            <div class="d-flex flex-wrap gap-1">${result.suggestedHashtags.map(h => `<span class="badge bg-info bg-opacity-25 text-info-emphasis">${esc(h)}</span>`).join('')}</div>
        `;
        showToast('Poster & caption generated!', 'success');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-stars me-1"></i>Generate Poster & Caption';
    }
}

// ==================== SOCIAL MEDIA ====================
async function genSocial() {
    const btn = document.getElementById('so_btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Generating...';
    try {
        const data = {
            ngoName: document.getElementById('so_ngo').value,
            platform: document.getElementById('so_platform').value,
            campaignSummary: document.getElementById('so_summary').value,
            hashtagsCount: Number(document.getElementById('so_hash').value),
            tone: document.getElementById('so_tone').value,
        };
        const result = await apiPost('/ai/social/', data);
        const platformIcons = { instagram: 'bi-instagram text-danger', facebook: 'bi-facebook text-primary', twitter: 'bi-twitter-x', linkedin: 'bi-linkedin text-info', tiktok: 'bi-tiktok text-light' };
        document.getElementById('so_output').innerHTML = `
            <div class="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                <i class="bi ${platformIcons[result.platform] || 'bi-share'} fs-4"></i>
                <h5 class="mb-0 text-capitalize fw-bold">${esc(result.platform)}</h5>
                <span class="badge bg-secondary ms-auto text-capitalize">${esc(result.tone)} Tone</span>
            </div>
            <h6 class="text-uppercase small text-muted"><i class="bi bi-file-text me-1"></i>Caption Content</h6>
            <div class="card bg-dark bg-opacity-50 border-secondary border-opacity-50 mb-4">
                <div class="card-body p-4"><pre class="mb-0 text-wrap font-monospace fs-6" style="white-space:pre-wrap;">${esc(result.caption)}</pre></div>
            </div>
            <div class="alert alert-success border-0 bg-success bg-opacity-10 d-flex align-items-center">
                <div class="bg-success bg-opacity-25 rounded-circle p-2 me-3"><i class="bi bi-hand-index text-success"></i></div>
                <div>
                    <div class="small text-success text-uppercase fw-semibold mb-1">Suggested Call to Action</div>
                    <div class="fw-bold">${esc(result.suggestedCTA)}</div>
                </div>
            </div>
        `;
        showToast('Social content generated!', 'success');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-stars me-1"></i>Generate Social Content';
    }
}

// ==================== AWARENESS ====================
async function genAwareness() {
    const btn = document.getElementById('aw_btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Generating...';
    try {
        const data = {
            ngoName: document.getElementById('aw_ngo').value,
            topic: document.getElementById('aw_topic').value,
            audience: document.getElementById('aw_audience').value,
            tone: document.getElementById('aw_tone').value,
        };
        const result = await apiPost('/ai/awareness/', data);
        document.getElementById('aw_output').innerHTML = `
            <div class="alert alert-success border-0 bg-success bg-opacity-10 mb-4 p-4 text-center rounded-4">
                <i class="bi bi-quote fs-1 text-success opacity-50 mb-2 d-block"></i>
                <h5 class="mb-0 fw-light fst-italic text-success-emphasis">"${esc(result.tagline)}"</h5>
            </div>
            <h6 class="text-uppercase small text-muted mb-3"><i class="bi bi-list-task me-1"></i>Campaign Plan</h6>
            <div class="d-flex flex-column gap-3 mb-4">
                ${result.plan.map((s, i) => `
                    <div class="card bg-dark bg-opacity-50 border-secondary border-opacity-50">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-2">
                                <span class="badge bg-success rounded-circle p-2 me-2" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">${i+1}</span>
                                <h5 class="mb-0 text-success-emphasis fw-bold">${esc(s.name)}</h5>
                            </div>
                            <p class="mb-3 text-light opacity-75">${esc(s.idea)}</p>
                            <div class="d-flex align-items-center mb-2">
                                <span class="badge bg-info bg-opacity-25 text-info-emphasis"><i class="bi bi-camera-reels me-1"></i>Format: ${esc(s.format)}</span>
                            </div>
                            <div class="bg-black bg-opacity-25 p-3 rounded border border-secondary border-opacity-25">
                                <div class="small text-muted text-uppercase mb-1"><i class="bi bi-chat-quote me-1"></i>Sample Post</div>
                                <div>${esc(s.samplePost)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <h6 class="text-uppercase small text-muted"><i class="bi bi-hash me-1"></i>Suggested Hashtags</h6>
            <div class="d-flex flex-wrap gap-2">${result.suggestedHashtags.map(h => `<span class="badge bg-success bg-opacity-25 text-success-emphasis px-2 py-1">${esc(h)}</span>`).join('')}</div>
        `;
        showToast('Awareness suggestions generated!', 'success');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-stars me-1"></i>Generate Suggestions';
    }
}

// ==================== CHATBOT ====================
function sendQuickChat(msg) {
    document.getElementById('cb_input').value = msg;
    sendChat();
}

async function sendChat() {
    const input = document.getElementById('cb_input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const container = document.getElementById('chatMessages');
    // Add user bubble
    container.innerHTML += `<div class="chat-bubble user"><div class="bubble-content">${esc(msg)}</div></div>`;
    container.scrollTop = container.scrollHeight;

    // Add loading bubble
    container.innerHTML += `<div class="chat-bubble bot" id="chatLoading"><div class="bubble-content"><span class="spinner-border spinner-border-sm me-2"></span>Thinking...</div></div>`;
    container.scrollTop = container.scrollHeight;

    try {
        const data = {
            ngoName: document.getElementById('cb_ngo').value,
            userMessage: msg,
            context: '',
        };
        const result = await apiPost('/ai/chatbot/', data);
        document.getElementById('chatLoading')?.remove();

        let actionsHtml = '';
        if (result.quickActions && result.quickActions.length > 0) {
            actionsHtml = `<div class="bubble-actions mt-2">${result.quickActions.map(a => `<button class="btn btn-sm btn-outline-light rounded-pill px-3" onclick="sendQuickChat('${a.replace(/'/g, "\\'")}')"> ${esc(a)}</button>`).join('')}</div>`;
        }
        container.innerHTML += `<div class="chat-bubble bot"><div class="bubble-content lh-base">${esc(result.reply)}</div>${actionsHtml}</div>`;
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        document.getElementById('chatLoading')?.remove();
        container.innerHTML += `<div class="chat-bubble bot"><div class="bubble-content text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Error: ${esc(e.message)}</div></div>`;
        container.scrollTop = container.scrollHeight;
    }
}

// ==================== UTILS ====================
function esc(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

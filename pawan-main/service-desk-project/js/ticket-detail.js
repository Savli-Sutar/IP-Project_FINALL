document.addEventListener('DOMContentLoaded', async () => {
  const u = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
  if (!u) {
    location.href = 'index.html';
    return;
  }
  nav(u);

  const detailView = document.getElementById('detail-view');
  const notFound = document.getElementById('not-found');
  const id = new URLSearchParams(location.search).get('id');

  let t = null;
  try {
    const r = await fetch(`/api/tickets/${id}`);
    if (r.ok) {
      t = await r.json();
    }
  } catch (e) {
    console.warn('Backend ticket detail error:', e);
  }

  // Fallback to local tickets if backend is down or not found
  if (!t) {
    const localTickets = JSON.parse(localStorage.getItem('helpdesk_local_tickets') || '[]');
    t = localTickets.find(x => String(x.id) === String(id) || String(x.ticketId) === String(id));
  }

  if (!t) {
    if (detailView) detailView.style.display = 'none';
    if (notFound) notFound.style.display = 'block';
    return;
  }

  if (detailView) detailView.style.display = 'block';
  if (notFound) notFound.style.display = 'none';

  const backLink = document.getElementById('back-link');
  if (backLink) backLink.href = u.role === 'admin' ? 'admin-dashboard.html' : 'my-tickets.html';

  const titleEl = document.getElementById('detail-title');
  if (titleEl) titleEl.textContent = t.title;

  const idEl = document.getElementById('detail-id');
  if (idEl) idEl.textContent = t.ticketId;

  const raisedByEl = document.getElementById('detail-raisedby');
  if (raisedByEl) raisedByEl.textContent = t.raisedBy || '—';

  const catEl = document.getElementById('detail-category');
  if (catEl) catEl.textContent = t.category;

  const createdEl = document.getElementById('detail-created');
  if (createdEl) createdEl.textContent = fmt(t.createdAt);

  const dueEl = document.getElementById('detail-due');
  if (dueEl) dueEl.textContent = fmt(t.resolutionDueAt);

  const resolvedEl = document.getElementById('detail-resolved');
  if (resolvedEl) resolvedEl.textContent = fmt(t.resolvedAt);

  const descEl = document.getElementById('detail-description');
  if (descEl) descEl.textContent = t.description;

  badge('priority-badge', t.priority, pc(t.priority));
  badge('status-badge', t.status, sc(t.status));
  renderSla(t);

  const panel = document.getElementById('admin-panel');
  const statusUpdate = document.getElementById('status-update');
  const saveStatus = document.getElementById('save-status');
  const statusNote = document.getElementById('status-note');

  if (u.role === 'admin' && panel) {
    panel.style.display = 'block';
    if (statusUpdate) statusUpdate.value = t.status;
    if (saveStatus) {
      saveStatus.onclick = async () => {
        const newStatus = statusUpdate ? statusUpdate.value : t.status;
        try {
          const rr = await fetch(`/api/tickets/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          if (rr.ok) {
            const x = await rr.json();
            badge('status-badge', x.status, sc(x.status));
            if (resolvedEl) resolvedEl.textContent = fmt(x.resolvedAt);
            renderSla(x);
            if (statusNote) statusNote.textContent = 'Status updated.';
            return;
          }
        } catch (e) {
          console.warn('Backend status update error:', e);
        }

        // Offline fallback: update local tickets
        t.status = newStatus;
        if (newStatus === 'Resolved' || newStatus === 'Closed') {
          t.resolvedAt = new Date().toISOString();
        } else {
          t.resolvedAt = null;
        }
        const localTickets = JSON.parse(localStorage.getItem('helpdesk_local_tickets') || '[]');
        const idx = localTickets.findIndex(x => String(x.id) === String(id) || String(x.ticketId) === String(id));
        if (idx !== -1) {
          localTickets[idx] = t;
          localStorage.setItem('helpdesk_local_tickets', JSON.stringify(localTickets));
        }
        badge('status-badge', t.status, sc(t.status));
        if (resolvedEl) resolvedEl.textContent = fmt(t.resolvedAt);
        renderSla(t);
        if (statusNote) statusNote.textContent = 'Status updated (Demo Mode).';
      };
    }
  } else if (panel) {
    panel.style.display = 'none';
  }
});

function nav(u) {
  const navUser = document.getElementById('nav-user');
  const navSignout = document.getElementById('nav-signout');
  if (navUser) navUser.textContent = `${u.name} · ${u.role === 'admin' ? 'IT Support' : 'Employee'}`;
  if (navSignout) {
    navSignout.onclick = () => {
      localStorage.removeItem('helpdesk_current_user');
      location.href = 'index.html';
    };
  }
}

function fmt(x) {
  return x ? new Date(x).toLocaleString() : '—';
}

function badge(id, text, c) {
  const e = document.getElementById(id);
  if (e) {
    e.textContent = text;
    e.className = `badge ${c}`;
  }
}

function pc(x) {
  return { 'Critical': 'badge--critical', 'High': 'badge--high', 'Medium': 'badge--medium', 'Low': 'badge--low' }[x] || 'badge--medium';
}

function sc(x) {
  return { 'New': 'badge--new', 'In Progress': 'badge--progress', 'Resolved': 'badge--resolved', 'Closed': 'badge--closed' }[x] || 'badge--new';
}

function renderSla(t) {
  const e = document.getElementById('sla-banner');
  if (!e) return;
  if (t.status === 'Resolved' || t.status === 'Closed') {
    e.className = 'sla-banner sla-banner--ok';
    e.textContent = `Ticket ${t.status.toLowerCase()} on ${fmt(t.resolvedAt)}.`;
  } else if (new Date(t.resolutionDueAt) < new Date()) {
    e.className = 'sla-banner sla-banner--overdue';
    e.textContent = `This ticket is past its resolution deadline (${fmt(t.resolutionDueAt)}).`;
  } else {
    e.className = 'sla-banner sla-banner--ok';
    e.textContent = `Within SLA — resolution due by ${fmt(t.resolutionDueAt)}.`;
  }
}

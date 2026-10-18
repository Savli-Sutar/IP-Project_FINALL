document.addEventListener('DOMContentLoaded', async () => {
  const u = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
  if (!u) {
    location.href = 'index.html';
    return;
  }
  nav(u);

  let tickets = [];
  try {
    const r = await fetch(`/api/tickets/user/${u.userId}`);
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) tickets = data;
    }
  } catch (e) {
    console.warn('Backend fetch error:', e);
  }

  // Merge or fallback with local demo tickets if backend returned empty or was offline
  const localTickets = JSON.parse(localStorage.getItem('helpdesk_local_tickets') || '[]');
  const userLocal = localTickets.filter(t => t.userId === u.userId);
  if (tickets.length === 0 && userLocal.length > 0) {
    tickets = userLocal;
  } else if (userLocal.length > 0) {
    const existingIds = new Set(tickets.map(t => t.ticketId));
    userLocal.forEach(t => {
      if (!existingIds.has(t.ticketId)) tickets.push(t);
    });
  }

  const body = document.getElementById('tickets-body');
  const empty = document.getElementById('empty-state');
  const search = document.getElementById('search');
  const status = document.getElementById('status-filter');

  function render() {
    const q = (search ? search.value : '').toLowerCase();
    const s = status ? status.value : 'All';
    const a = (Array.isArray(tickets) ? tickets : []).filter(t =>
      (!q || (t.title && t.title.toLowerCase().includes(q)) || (t.ticketId && t.ticketId.toLowerCase().includes(q))) &&
      (s === 'All' || t.status === s)
    );

    if (body) {
      body.innerHTML = '';
      if (empty) empty.style.display = a.length ? 'none' : 'block';
      a.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="cell-id">${t.ticketId}</td>
          <td>${t.title}</td>
          <td class="cell-muted">${t.category}</td>
          <td><span class="badge ${pc(t.priority)}">${t.priority}</span></td>
          <td><span class="badge ${sc(t.status)}">${t.status}</span></td>
          <td class="cell-muted">${fmt(t.createdAt)}</td>
          <td>${sla(t)}</td>
        `;
        tr.onclick = () => location.href = `ticket-detail.html?id=${t.id}`;
        body.appendChild(tr);
      });
    }
  }

  if (search) search.oninput = render;
  if (status) status.onchange = render;
  render();
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

function pc(x) {
  return { 'Critical': 'badge--critical', 'High': 'badge--high', 'Medium': 'badge--medium', 'Low': 'badge--low' }[x] || 'badge--medium';
}

function sc(x) {
  return { 'New': 'badge--new', 'In Progress': 'badge--progress', 'Resolved': 'badge--resolved', 'Closed': 'badge--closed' }[x] || 'badge--new';
}

function sla(t) {
  if (t.status === 'Resolved' || t.status === 'Closed') {
    return `<span class="cell-muted">Resolved ${fmt(t.resolvedAt)}</span>`;
  }
  const o = new Date(t.resolutionDueAt) < new Date();
  return `<span class="badge ${o ? 'badge--overdue' : 'badge--ontime'}">${o ? 'Overdue' : 'On Time'}</span><div class="sla-line">Due ${fmt(t.resolutionDueAt)}</div>`;
}

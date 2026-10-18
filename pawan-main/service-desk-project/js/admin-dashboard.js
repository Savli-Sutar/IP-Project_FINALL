document.addEventListener('DOMContentLoaded', async () => {
  const u = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
  nav(u);

  const denied = document.getElementById('access-denied');
  const content = document.getElementById('dashboard-content');

  if (!u || u.role !== 'admin') {
    if (denied) denied.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }

  if (denied) denied.style.display = 'none';
  if (content) content.style.display = 'block';

  let tickets = [];
  try {
    const r = await fetch('/api/tickets');
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) tickets = data;
    }
  } catch (e) {
    console.warn('Backend tickets error:', e);
  }

  // Fallback to local tickets if backend is down
  const localTickets = JSON.parse(localStorage.getItem('helpdesk_local_tickets') || '[]');
  if (tickets.length === 0 && localTickets.length > 0) {
    tickets = localTickets;
  } else if (localTickets.length > 0) {
    const existingIds = new Set(tickets.map(t => t.ticketId));
    localTickets.forEach(t => {
      if (!existingIds.has(t.ticketId)) tickets.push(t);
    });
  }

  // Compute stats
  let total = tickets.length;
  let newCount = tickets.filter(t => t.status === 'New').length;
  let progressCount = tickets.filter(t => t.status === 'In Progress').length;
  let resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  let overdueCount = tickets.filter(t => (t.status !== 'Resolved' && t.status !== 'Closed') && new Date(t.resolutionDueAt) < new Date()).length;

  try {
    const stRes = await fetch('/api/stats');
    if (stRes.ok) {
      const st = await stRes.json();
      total = st.total ?? total;
      newCount = st.new ?? newCount;
      progressCount = st.progress ?? progressCount;
      overdueCount = st.overdue ?? overdueCount;
      resolvedCount = st.resolved ?? resolvedCount;
    }
  } catch (e) {
    console.warn('Backend stats error:', e);
  }

  const statMap = {
    total: total,
    new: newCount,
    progress: progressCount,
    overdue: overdueCount,
    resolved: resolvedCount
  };

  for (const [k, v] of Object.entries(statMap)) {
    const el = document.getElementById('stat-' + k);
    if (el) el.textContent = v;
  }

  const body = document.getElementById('tickets-body');
  const empty = document.getElementById('empty-state');
  const search = document.getElementById('search');
  const statusFilter = document.getElementById('status-filter');
  const priorityFilter = document.getElementById('priority-filter');
  const categoryFilter = document.getElementById('category-filter');

  function render() {
    const q = (search ? search.value : '').toLowerCase();
    const s = statusFilter ? statusFilter.value : 'All';
    const p = priorityFilter ? priorityFilter.value : 'All';
    const c = categoryFilter ? categoryFilter.value : 'All';

    const a = tickets.filter(t =>
      (!q || (t.title && t.title.toLowerCase().includes(q)) ||
        (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
        (t.raisedBy && t.raisedBy.toLowerCase().includes(q))) &&
      (s === 'All' || t.status === s) &&
      (p === 'All' || t.priority === p) &&
      (c === 'All' || t.category === c)
    );

    if (body) {
      body.innerHTML = '';
      if (empty) empty.style.display = a.length ? 'none' : 'block';
      a.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="cell-id">${t.ticketId}</td>
          <td>${t.title}</td>
          <td class="cell-muted">${t.raisedBy || '—'}</td>
          <td class="cell-muted">${t.category}</td>
          <td><span class="badge ${pc(t.priority)}">${t.priority}</span></td>
          <td><span class="badge ${sc(t.status)}">${t.status}</span></td>
          <td>${sla(t)}</td>
        `;
        tr.onclick = () => location.href = `ticket-detail.html?id=${t.id}`;
        body.appendChild(tr);
      });
    }
  }

  if (search) search.oninput = render;
  if (statusFilter) statusFilter.onchange = render;
  if (priorityFilter) priorityFilter.onchange = render;
  if (categoryFilter) categoryFilter.onchange = render;
  render();
});

function nav(u) {
  const navUser = document.getElementById('nav-user');
  const navSignout = document.getElementById('nav-signout');
  if (navUser) navUser.textContent = u ? `${u.name} · IT Support` : 'Not signed in';
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

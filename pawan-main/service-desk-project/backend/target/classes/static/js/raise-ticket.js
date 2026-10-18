const SLA_RULES = {
  Critical: { response: 1, resolution: 4 },
  High: { response: 2, resolution: 8 },
  Medium: { response: 4, resolution: 24 },
  Low: { response: 8, resolution: 48 }
};

document.addEventListener('DOMContentLoaded', () => {
  const u = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
  if (!u) {
    location.href = 'index.html';
    return;
  }
  nav(u);

  const p = document.getElementById('priority');
  const preview = document.getElementById('sla-preview');
  const titleInput = document.getElementById('title');
  const descInput = document.getElementById('description');
  const catInput = document.getElementById('category');
  const form = document.getElementById('ticket-form');
  const note = document.getElementById('form-note');
  const banner = document.getElementById('success-banner');

  const render = () => {
    if (!p || !preview) return;
    const x = SLA_RULES[p.value] || SLA_RULES.Medium;
    preview.innerHTML = `Response due in <strong>${x.response}h</strong> · Resolution due in <strong>${x.resolution}h</strong>`;
  };

  if (p) p.addEventListener('change', render);
  render();

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const title = titleInput ? titleInput.value.trim() : '';
      const description = descInput ? descInput.value.trim() : '';
      const category = catInput ? catInput.value : 'General';
      const priority = p ? p.value : 'Medium';

      if (!title) {
        if (note) note.textContent = 'Please enter a ticket title.';
        return;
      }

      try {
        const r = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            priority,
            userId: u.userId
          })
        });

        const text = await r.text();
        let d;
        try {
          d = JSON.parse(text);
        } catch (err) {
          throw new Error('Backend unreachable.');
        }

        if (!r.ok) throw Error(d.message || 'Failed to submit ticket.');
        if (banner) {
          banner.textContent = `Ticket submitted successfully. Reference: ${d.ticketId}`;
          banner.classList.add('is-visible');
        }
        form.reset();
        render();
        if (note) note.textContent = '';
      } catch (x) {
        console.warn('Backend ticket creation error:', x);
        // Fallback: save locally
        const localTickets = JSON.parse(localStorage.getItem('helpdesk_local_tickets') || '[]');
        const num = localTickets.length + 1;
        const now = new Date();
        const rule = SLA_RULES[priority] || SLA_RULES.Medium;
        const respDue = new Date(now.getTime() + rule.response * 3600000).toISOString();
        const resolDue = new Date(now.getTime() + rule.resolution * 3600000).toISOString();
        const newTicket = {
          id: Date.now(),
          ticketId: `TKT-${String(num).padStart(3, '0')}`,
          title,
          description,
          category,
          priority,
          status: 'New',
          userId: u.userId,
          raisedBy: u.name,
          createdAt: now.toISOString(),
          responseDueAt: respDue,
          resolutionDueAt: resolDue,
          resolvedAt: null,
          history: [{ changedAt: now.toISOString(), newStatus: 'New', oldStatus: null }]
        };
        localTickets.unshift(newTicket);
        localStorage.setItem('helpdesk_local_tickets', JSON.stringify(localTickets));

        if (banner) {
          banner.textContent = `Ticket submitted successfully. Reference: ${newTicket.ticketId}`;
          banner.classList.add('is-visible');
        }
        form.reset();
        render();
        if (note) note.textContent = '';
      }
    });
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

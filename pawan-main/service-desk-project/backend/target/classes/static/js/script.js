document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;
  const note = document.getElementById('form-note');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (note) note.textContent = 'Signing in…';

    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';
    const roleEl = form.querySelector('input[name="role"]:checked');
    const role = roleEl ? roleEl.value : 'user';

    if (!email || !password) {
      if (note) note.textContent = 'Please enter both email and password.';
      return;
    }

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const text = await r.text();
      let d;
      try {
        d = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Backend returned invalid response.');
      }

      if (!r.ok) {
        throw new Error(d.message || 'Login failed.');
      }

      localStorage.setItem('helpdesk_current_user', JSON.stringify(d));
      window.location.href = d.role === 'admin' ? 'admin-dashboard.html' : 'my-tickets.html';
    } catch (x) {
      console.warn('Backend login error:', x);
      // Fallback: If backend is offline or unreachable, support demo & local accounts
      if (
        x.message.includes('Failed to fetch') ||
        x.message.includes('NetworkError') ||
        x.message.includes('Backend returned invalid response') ||
        window.location.protocol === 'file:'
      ) {
        if (email === 'employee@company.com' && password === 'password123' && role === 'user') {
          const user = { userId: 1, name: 'Employee', email: 'employee@company.com', role: 'user' };
          localStorage.setItem('helpdesk_current_user', JSON.stringify(user));
          if (note) note.textContent = 'Signing in (Demo Mode)…';
          setTimeout(() => { window.location.href = 'my-tickets.html'; }, 400);
          return;
        } else if (email === 'support@company.com' && password === 'password123' && role === 'admin') {
          const user = { userId: 2, name: 'IT Support', email: 'support@company.com', role: 'admin' };
          localStorage.setItem('helpdesk_current_user', JSON.stringify(user));
          if (note) note.textContent = 'Signing in (Demo Mode)…';
          setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 400);
          return;
        } else {
          const localUsers = JSON.parse(localStorage.getItem('helpdesk_local_users') || '[]');
          const found = localUsers.find(u => u.email === email && u.password === password);
          if (found) {
            if (found.role !== role) {
              if (note) note.textContent = `That account is registered as ${found.role === 'admin' ? 'IT Support' : 'Employee'}, not ${role === 'admin' ? 'IT Support' : 'Employee'}.`;
              return;
            }
            const user = { userId: found.userId, name: found.name, email: found.email, role: found.role };
            localStorage.setItem('helpdesk_current_user', JSON.stringify(user));
            if (note) note.textContent = 'Signing in…';
            setTimeout(() => { window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'my-tickets.html'; }, 400);
            return;
          }
          if (note) note.textContent = 'Backend unreachable at http://localhost:8080. For demo, use employee@company.com / password123 or support@company.com / password123.';
          return;
        }
      }
      if (note) note.textContent = x.message;
    }
  });
});

const API_BASE = (window.location.protocol.startsWith('http') && window.location.port !== '8080')
  ? 'http://localhost:8080'
  : '';

document.addEventListener('DOMContentLoaded', () => {
  const f = document.getElementById('register-form');
  if (!f) return;
  const n = document.getElementById('form-note');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');

  f.addEventListener('submit', async e => {
    e.preventDefault();
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirm = confirmInput ? confirmInput.value : '';
    const roleEl = f.querySelector('input[name="role"]:checked');
    const role = roleEl ? roleEl.value : 'user';

    if (!name || !email || !password) {
      if (n) n.textContent = 'Please fill in all required fields.';
      return;
    }

    if (password !== confirm) {
      if (n) n.textContent = 'Passwords do not match.';
      return;
    }

    try {
      const r = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const text = await r.text();
      let d;
      try {
        d = JSON.parse(text);
      } catch (err) {
        throw new Error('Backend unreachable.');
      }
      if (!r.ok) throw Error(d.message || 'Registration failed.');

      if (n) n.textContent = 'Account created successfully. Redirecting to sign in…';
      setTimeout(() => location.href = 'index.html', 700);
    } catch (x) {
      console.warn('Backend register error:', x);
      // Offline fallback: save locally
      const localUsers = JSON.parse(localStorage.getItem('helpdesk_local_users') || '[]');
      if (localUsers.some(u => u.email === email)) {
        if (n) n.textContent = 'Email already registered.';
        return;
      }
      const newUser = { userId: Date.now(), name, email, password, role };
      localUsers.push(newUser);
      localStorage.setItem('helpdesk_local_users', JSON.stringify(localUsers));
      if (n) n.textContent = 'Account created successfully (Demo Mode). Redirecting to sign in…';
      setTimeout(() => location.href = 'index.html', 700);
    }
  });
});

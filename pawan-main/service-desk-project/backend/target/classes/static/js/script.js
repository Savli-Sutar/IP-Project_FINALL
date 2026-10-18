document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('login-form'); if(!form)return;
 const note=document.getElementById('form-note'); const emailInput=document.getElementById('email'); const passwordInput=document.getElementById('password');
 form.addEventListener('submit',async e=>{e.preventDefault();note.textContent='Signing in…';
  const body={email:emailInput.value.trim().toLowerCase(),password:passwordInput.value,role:form.querySelector('input[name="role"]:checked').value};
  try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.message);localStorage.setItem('helpdesk_current_user',JSON.stringify(d));window.location.href=d.role==='admin'?'admin-dashboard.html':'my-tickets.html';}catch(x){note.textContent=x.message;}
 });
});

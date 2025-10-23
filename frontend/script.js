// If served by the backend, same-origin relative API works; fallback to localhost for dev
const API_BASE = window.API_BASE || window.location.origin || 'http://localhost:3000';

document.getElementById('loadProfile').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE}/api/profile?format=txt`, { headers: { 'Accept': 'text/plain' } });
    const text = await res.text();
    document.getElementById('profileOutput').textContent = text;
  } catch (err) {
    console.error(err);
  }
});

document.getElementById('searchProjects').addEventListener('click', async () => {
  const skill = document.getElementById('skillInput').value.trim();
  if (!skill) return alert('Enter a skill');

  try {
    const res = await fetch(`${API_BASE}/api/projects?skill=${encodeURIComponent(skill)}&format=txt`, { headers: { 'Accept': 'text/plain' } });
    const text = await res.text();
    document.getElementById('projectsOutput').textContent = text;
  } catch (err) {
    console.error(err);
  }
});

document.getElementById('loadSkills').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE}/api/skills/top?format=txt`, { headers: { 'Accept': 'text/plain' } });
    const text = await res.text();
    document.getElementById('skillsOutput').textContent = text;
  } catch (err) {
    console.error(err);
  }
});

// If served by the backend, same-origin relative API works; fallback to localhost for dev
const API_BASE = window.API_BASE || window.location.origin || 'http://localhost:3000';

function setLoading(el, isLoading, text) {
  if (!el) return;
  el.disabled = isLoading;
  el.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  if (isLoading) {
    el.dataset.origText = el.textContent;
    el.textContent = text || 'Loading...';
  } else {
    if (el.dataset.origText) el.textContent = el.dataset.origText;
  }
}

function showOutput(targetId, content) {
  const out = document.getElementById(targetId);
  if (!out) return;
  out.textContent = content || 'No results';
}

async function fetchText(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Accept': 'text/plain' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

document.getElementById('loadProfile').addEventListener('click', async (ev) => {
  const btn = ev.currentTarget;
  try {
    setLoading(btn, true, 'Loading profile...');
    const text = await fetchText('/api/profile?format=txt');
    showOutput('profileOutput', text);
  } catch (err) {
    console.error(err);
    showOutput('profileOutput', `Error: ${err.message}`);
  } finally {
    setLoading(btn, false);
  }
});

document.getElementById('searchProjects').addEventListener('click', async (ev) => {
  const btn = ev.currentTarget;
  const skill = document.getElementById('skillInput').value.trim();
  if (!skill) return alert('Enter a skill');
  try {
    setLoading(btn, true, 'Searching...');
    const text = await fetchText(`/api/projects?skill=${encodeURIComponent(skill)}&format=txt`);
    showOutput('projectsOutput', text || 'No projects found for that skill');
  } catch (err) {
    console.error(err);
    showOutput('projectsOutput', `Error: ${err.message}`);
  } finally {
    setLoading(btn, false);
  }
});

document.getElementById('loadSkills').addEventListener('click', async (ev) => {
  const btn = ev.currentTarget;
  try {
    setLoading(btn, true, 'Loading skills...');
    const text = await fetchText('/api/skills/top?format=txt');
    showOutput('skillsOutput', text || 'No skills available');
  } catch (err) {
    console.error(err);
    showOutput('skillsOutput', `Error: ${err.message}`);
  } finally {
    setLoading(btn, false);
  }
});

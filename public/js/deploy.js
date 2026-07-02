let activeTab = 'github';
let editor;

document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize CodeMirror
    editor = CodeMirror.fromTextArea(document.getElementById('rawCodeEditor'), {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'javascript'
    });

    const userData = await auth.fetch('/api/auth/me');
    if (userData.success && !userData.data.trialUsed && userData.data.plan === 'free') {
        document.getElementById('trialBanner').style.display = 'block';
        document.getElementById('costDisplay').innerText = '0 (TRIAL)';
    }

    document.getElementById('deployForm').addEventListener('submit', handleDeploy);
});

function showTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`${tab}-content`).classList.add('active');

    if (tab === 'rawcode') {
        setTimeout(() => editor.refresh(), 10);
        document.getElementById('costDisplay').innerText = document.getElementById('trialBanner').style.display === 'block' ? '0 (TRIAL)' : '1';
    } else if (tab === 'file') {
        document.getElementById('costDisplay').innerText = document.getElementById('trialBanner').style.display === 'block' ? '0 (TRIAL)' : '1';
    } else {
        document.getElementById('costDisplay').innerText = document.getElementById('trialBanner').style.display === 'block' ? '0 (TRIAL)' : '2';
    }
}

function addEnvVar() {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="text" placeholder="KEY" class="env-key">
        <input type="text" placeholder="VALUE" class="env-value">
        <button type="button" class="btn btn-outline" style="border-color: red; color: red;" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById('envVarsList').appendChild(div);
}

async function handleDeploy(e) {
    e.preventDefault();
    const deployBtn = document.getElementById('deployBtn');
    deployBtn.disabled = true;
    deployBtn.innerText = 'DEPLOYING...';

    const name = document.getElementById('projectName').value;
    const envVars = {};
    document.querySelectorAll('#envVarsList > div').forEach(div => {
        const key = div.querySelector('.env-key').value;
        const val = div.querySelector('.env-value').value;
        if (key) envVars[key] = val;
    });

    try {
        let res;
        if (activeTab === 'github') {
            const repoUrl = document.getElementById('repoUrl').value;
            res = await auth.fetch('/api/deploy/github', {
                method: 'POST',
                body: JSON.stringify({ name, repoUrl, envVars })
            });
        } else if (activeTab === 'zip' || activeTab === 'file') {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('envVars', JSON.stringify(envVars));
            const fileInput = document.getElementById(activeTab === 'zip' ? 'zipFile' : 'sourceFile');
            formData.append('file', fileInput.files[0]);

            res = await fetch(`/api/deploy/${activeTab}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.getToken()}` },
                body: formData
            });
            res = await res.json();
        } else if (activeTab === 'rawcode') {
            const code = editor.getValue();
            const language = document.getElementById('rawLanguage').value;
            res = await auth.fetch('/api/deploy/rawcode', {
                method: 'POST',
                body: JSON.stringify({ name, code, language, envVars })
            });
        }

        if (res.success) {
            alert('Deployment started successfully!');
            window.location.href = '/deployments.html';
        } else {
            alert('Error: ' + res.error);
        }
    } catch (err) {
        alert('An error occurred during deployment.');
    } finally {
        deployBtn.disabled = false;
        deployBtn.innerText = 'DEPLOY NOW';
    }
}

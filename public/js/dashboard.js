async function initDashboard() {
    if (!auth.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    const userData = await auth.fetch('/api/auth/me');
    if (userData.success) {
        document.getElementById('welcomeText').innerText = `WELCOME BACK, ${userData.data.username.toUpperCase()}`;
        document.getElementById('creditsBalance').innerText = userData.data.credits;
        document.getElementById('walletBalance').innerText = `₹${userData.data.wallet.toFixed(2)}`;
        document.getElementById('trialStatus').innerText = userData.data.trialUsed ? (userData.data.trialEndsAt ? 'ACTIVE' : 'USED') : 'AVAILABLE';
    }

    const deployments = await auth.fetch('/api/deploy/list');
    if (deployments.success) {
        const tableBody = document.querySelector('#recentDeploymentsTable tbody');
        tableBody.innerHTML = '';

        const activeCount = deployments.data.filter(d => d.status === 'running').length;
        document.getElementById('activeDeploys').innerText = activeCount;

        deployments.data.slice(0, 5).forEach(deploy => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${deploy.name}</td>
                <td>${deploy.type.toUpperCase()}</td>
                <td><span class="badge badge-${deploy.status}">${deploy.status}</span></td>
                <td>${new Date(deploy.createdAt).toLocaleDateString()}</td>
                <td>
                    <a href="/deployments.html?id=${deploy.id}" class="text-muted" style="text-decoration: underline;">VIEW</a>
                </td>
            `;
            tableBody.appendChild(row);
        });

        if (deployments.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No deployments found.</td></tr>';
        }
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);

async function initWallet() {
    if (!auth.isLoggedIn()) return;

    const balanceRes = await auth.fetch('/api/wallet/balance');
    if (balanceRes.success) {
        document.getElementById('walletBalance').innerText = `₹${balanceRes.data.wallet.toFixed(2)}`;
    }

    const transRes = await auth.fetch('/api/wallet/transactions');
    if (transRes.success) {
        const tableBody = document.querySelector('#withdrawalsTable tbody');
        tableBody.innerHTML = '';
        transRes.data.forEach(w => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>₹${w.amount}</td>
                <td><span class="badge badge-${w.status}">${w.status}</span></td>
                <td>${new Date(w.requestedAt).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        });
        if (transRes.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No transactions found.</td></tr>';
        }
    }
}

document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const method = document.getElementById('method').value;
    const details = document.getElementById('details').value;

    const res = await auth.fetch('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, method, details })
    });

    if (res.success) {
        alert('Withdrawal request submitted!');
        initWallet();
    } else {
        alert(res.error);
    }
});

async function buyPlan(planId) {
    if (confirm(`Confirm purchase of ${planId} plan?`)) {
        const res = await auth.fetch('/api/wallet/purchase', {
            method: 'POST',
            body: JSON.stringify({ planId })
        });
        if (res.success) {
            alert(res.message);
            initWallet();
        } else {
            alert(res.error);
        }
    }
}

document.addEventListener('DOMContentLoaded', initWallet);

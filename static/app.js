
let chart = null;

async function loadExpenses() {
    const res = await fetch('/expenses');
    const expenses = await res.json();
    renderList(expenses);
    renderChart(expenses);
    renderTotal(expenses);
}

function renderTotal(expenses) {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

function renderList(expenses) {
    const list = document.getElementById('expenseList');
    if (expenses.length === 0) {
        list.innerHTML = '<p class="empty">No expenses yet. Add one above! 👆</p>';
        return;
    }
    list.innerHTML = expenses.map((e, i) => `
        <li>
            <div class="expense-info">
                <span class="expense-title">${e.title}</span>
                <span class="expense-category">${e.category}</span>
            </div>
            <span class="expense-amount">₹${parseFloat(e.amount).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteExpense(${i})">Delete</button>
        </li>
    `).join('');
}

function renderChart(expenses) {
    const categories = {};
    expenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + parseFloat(e.amount);
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    const colors = [
        '#a78bfa', '#60a5fa', '#34d399',
        '#f87171', '#fbbf24', '#f472b6'
    ];

    if (chart) chart.destroy();

    const ctx = document.getElementById('expenseChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            }
        }
    });
}

async function addExpense() {
    const title = document.getElementById('title').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const category = document.getElementById('category').value;

    if (!title || !amount) {
        alert('Please fill in all fields!');
        return;
    }

    await fetch('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount, category })
    });

    document.getElementById('title').value = '';
    document.getElementById('amount').value = '';
    loadExpenses();
}

async function deleteExpense(index) {
    await fetch(`/expenses/${index}`, { method: 'DELETE' });
    loadExpenses();
}

loadExpenses();
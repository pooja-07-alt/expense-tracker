
let chart = null;
let budget = localStorage.getItem('budget') ? parseFloat(localStorage.getItem('budget')) : null;

function setBudget() {
    const val = parseFloat(document.getElementById('budgetInput').value);
    if (!val || val <= 0) { alert('Enter a valid budget!'); return; }
    budget = val;
    localStorage.setItem('budget', budget);
    document.getElementById('budgetInput').value = '';
    loadExpenses();
}

function renderBudget(total) {
    const bar = document.getElementById('progressBar');
    const status = document.getElementById('budgetStatus');

    if (!budget) {
        bar.style.width = '0%';
        status.textContent = 'No budget set';
        status.className = 'budget-status';
        return;
    }

    const percent = Math.min((total / budget) * 100, 100);
    bar.style.width = `${percent}%`;

    if (percent < 60) {
        bar.style.background = 'linear-gradient(135deg, #a78bfa, #60a5fa)';
        status.textContent = `₹${total.toFixed(2)} of ₹${budget} spent (${percent.toFixed(1)}%) — You're doing great! 🟢`;
        status.className = 'budget-status status-safe';
    } else if (percent < 90) {
        bar.style.background = 'linear-gradient(135deg, #fbbf24, #f87171)';
        status.textContent = `₹${total.toFixed(2)} of ₹${budget} spent (${percent.toFixed(1)}%) — Slow down! 🟡`;
        status.className = 'budget-status status-warning';
    } else {
        bar.style.background = 'linear-gradient(135deg, #f87171, #ef4444)';
        status.textContent = `₹${total.toFixed(2)} of ₹${budget} spent (${percent.toFixed(1)}%) — Budget exceeded! 🔴`;
        status.className = 'budget-status status-danger';
    }
}

async function loadExpenses() {
    const res = await fetch('/expenses');
    const expenses = await res.json();
    allExpenses = expenses;
    renderList(expenses);
    renderChart(expenses);
    renderTotal(expenses);
}

function renderTotal(expenses) {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    renderBudget(total);
}

function renderList(expenses) {
    const list = document.getElementById('expenseList');
    if (expenses.length === 0) {
        list.innerHTML = '<p class="empty">No expenses yet. Add one above! </p>';
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
let allExpenses = [];

function searchExpenses() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allExpenses.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
    );
    renderList(filtered);
}
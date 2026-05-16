let chart = null;
let allExpenses = [];
let budget = localStorage.getItem('budget') ? parseFloat(localStorage.getItem('budget')) : null;

// Generate stars
function generateStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
        star.style.setProperty('--opacity', (0.3 + Math.random() * 0.7).toString());
        container.appendChild(star);
    }
}

// Toast notification
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Gamification
function updateGameStats(expenses) {
    const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const count = expenses.length;

    // Level based on entry count
    const level = Math.floor(count / 5) + 1;
    document.getElementById('playerLevel').textContent = level;

    // Streak (entries today)
    const today = new Date().toDateString();
    const todayEntries = expenses.filter(e => new Date(e.date).toDateString() === today);
    document.getElementById('streakCount').textContent = todayEntries.length + '🔥';

    // Rank
    const ranks = ['ROOKIE', 'SCOUT', 'HUNTER', 'WARRIOR', 'LEGEND'];
    const rank = ranks[Math.min(Math.floor(count / 5), ranks.length - 1)];
    document.getElementById('playerRank').textContent = rank;

    // Today total
    const todayTotal = todayEntries.reduce((s, e) => s + parseFloat(e.amount), 0);
    document.getElementById('todayTotal').textContent = '₹' + todayTotal.toFixed(0);

    // Entry count
    document.getElementById('entryCount').textContent = count;

    // Top category
    const cats = {};
    expenses.forEach(e => cats[e.category] = (cats[e.category] || 0) + 1);
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('topCategory').textContent = topCat ? topCat[0] : '—';
}

async function loadExpenses() {
    const res = await fetch('/expenses');
    const expenses = await res.json();
    allExpenses = expenses;
    renderList(expenses);
    renderChart(expenses);
    renderTotal(expenses);
    updateGameStats(expenses);
}

function renderTotal(expenses) {
    const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    document.getElementById('total').textContent = total.toFixed(0);
    renderBudget(total);
}

function setBudget() {
    const val = parseFloat(document.getElementById('budgetInput').value);
    if (!val || val <= 0) { showToast('⚠ ENTER VALID BUDGET'); return; }
    budget = val;
    localStorage.setItem('budget', budget);
    document.getElementById('budgetInput').value = '';
    showToast('✓ BUDGET LOCKED IN');
    loadExpenses();
}

function renderBudget(total) {
    const bar = document.getElementById('progressBar');
    const status = document.getElementById('budgetStatus');
    const label = document.getElementById('budgetLabel');

    if (!budget) {
        bar.style.width = '0%';
        status.textContent = '';
        label.textContent = 'Set budget to track XP';
        return;
    }

    const percent = Math.min((total / budget) * 100, 100);
    bar.style.width = percent + '%';
    label.textContent = '₹' + budget;

    if (percent < 60) {
        bar.style.background = 'linear-gradient(90deg, #00ff88, #00d4ff)';
        bar.style.boxShadow = '0 0 15px rgba(0,255,136,0.5)';
        status.textContent = `▶ ₹${total.toFixed(0)} / ₹${budget} — SAFE ZONE 🟢`;
        status.className = 'budget-status status-safe';
    } else if (percent < 90) {
        bar.style.background = 'linear-gradient(90deg, #ffd700, #ff8c00)';
        bar.style.boxShadow = '0 0 15px rgba(255,215,0,0.5)';
        status.textContent = `▶ ₹${total.toFixed(0)} / ₹${budget} — CAUTION ZONE ⚠️`;
        status.className = 'budget-status status-warning';
    } else {
        bar.style.background = 'linear-gradient(90deg, #ff4444, #ff0080)';
        bar.style.boxShadow = '0 0 15px rgba(255,68,68,0.5)';
        status.textContent = `▶ ₹${total.toFixed(0)} / ₹${budget} — DANGER ZONE 🔴`;
        status.className = 'budget-status status-danger';
    }
}

function renderList(expenses) {
    const list = document.getElementById('expenseList');
    if (expenses.length === 0) {
        list.innerHTML = '<p class="empty">[ NO MISSIONS LOGGED ]</p>';
        return;
    }
    list.innerHTML = expenses.map((e, i) => `
        <li>
            <div class="expense-info">
                <span class="expense-title">${e.title}</span>
                <span class="expense-category">${e.category.toUpperCase()}</span>
            </div>
            <span class="expense-amount">₹${parseFloat(e.amount).toFixed(0)}</span>
            <button class="delete-btn" onclick="deleteExpense(${i})">DELETE</button>
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
    const colors = ['#00ff88', '#00d4ff', '#bf5fff', '#ffd700', '#ff4444', '#ff8c00'];

    if (chart) chart.destroy();
    const ctx = document.getElementById('expenseChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.map(c => c + '33'),
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255,255,255,0.6)',
                        font: { family: 'Space Grotesk', size: 11 },
                        boxWidth: 12
                    }
                }
            },
            cutout: '65%'
        }
    });
}

async function addExpense() {
    const title = document.getElementById('title').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const category = document.getElementById('category').value;

    if (!title || !amount) { showToast('⚠ FILL ALL FIELDS'); return; }

    await fetch('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount, category, date: new Date().toISOString() })
    });

    document.getElementById('title').value = '';
    document.getElementById('amount').value = '';
    showToast('✓ MISSION LOGGED');
    loadExpenses();
}

async function deleteExpense(index) {
    await fetch(`/expenses/${index}`, { method: 'DELETE' });
    showToast('✕ ENTRY DELETED');
    loadExpenses();
}

function searchExpenses() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allExpenses.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
    );
    renderList(filtered);
}

generateStars();
loadExpenses();
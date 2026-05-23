from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'expensequest_secret_123'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

USERS_FILE = 'users.json'
EXPENSES_FILE = 'expenses.json'

# ── Helpers ──────────────────────────────────────────────

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

def load_expenses():
    if not os.path.exists(EXPENSES_FILE):
        return {}
    with open(EXPENSES_FILE, 'r') as f:
        return json.load(f)

def save_expenses(expenses):
    with open(EXPENSES_FILE, 'w') as f:
        json.dump(expenses, f)

# ── User Model ────────────────────────────────────────────

class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    users = load_users()
    if user_id in users:
        return User(user_id, users[user_id]['username'])
    return None

# ── Auth Routes ───────────────────────────────────────────

@app.route('/')
@login_required
def index():
    return render_template('index.html', username=current_user.username)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            return jsonify({'success': False, 'message': 'All fields required'})

        users = load_users()
        if username in users:
            return jsonify({'success': False, 'message': 'Username already exists'})

        users[username] = {
            'username': username,
            'password': generate_password_hash(password)
        }
        save_users(users)
        return jsonify({'success': True})

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        users = load_users()
        if username not in users:
            return jsonify({'success': False, 'message': 'User not found'})

        if not check_password_hash(users[username]['password'], password):
            return jsonify({'success': False, 'message': 'Wrong password'})

        user = User(username, username)
        login_user(user)
        return jsonify({'success': True})

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# ── Expense Routes ────────────────────────────────────────

@app.route('/expenses', methods=['GET'])
@login_required
def get_expenses():
    all_expenses = load_expenses()
    return jsonify(all_expenses.get(current_user.id, []))

@app.route('/expenses', methods=['POST'])
@login_required
def add_expense():
    data = request.json
    all_expenses = load_expenses()
    if current_user.id not in all_expenses:
        all_expenses[current_user.id] = []
    all_expenses[current_user.id].append(data)
    save_expenses(all_expenses)
    return jsonify({'success': True})

@app.route('/expenses/<int:index>', methods=['DELETE'])
@login_required
def delete_expense(index):
    all_expenses = load_expenses()
    all_expenses[current_user.id].pop(index)
    save_expenses(all_expenses)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
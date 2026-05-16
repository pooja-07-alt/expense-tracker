from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

DATA_FILE = 'expenses.json'

def load_expenses():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_expenses(expenses):
    with open(DATA_FILE, 'w') as f:
        json.dump(expenses, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/expenses', methods=['GET'])
def get_expenses():
    return jsonify(load_expenses())

@app.route('/expenses', methods=['POST'])
def add_expense():
    data = request.json
    expenses = load_expenses()
    expenses.append(data)
    save_expenses(expenses)
    return jsonify({'success': True})

@app.route('/expenses/<int:index>', methods=['DELETE'])
def delete_expense(index):
    expenses = load_expenses()
    expenses.pop(index)
    save_expenses(expenses)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
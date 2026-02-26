from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Database Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Siddhant@1",
    database="real_estate_db"
)
cursor = db.cursor(dictionary=True)

TABLES = {"users": "Users", "agents": "Agents", "properties": "Properties"}

# Get table attributes dynamically
@app.route('/api/attributes', methods=['GET'])
def get_table_attributes():
    table = request.args.get('table')

    if table not in TABLES:
        return jsonify({"error": "Invalid table"}), 400

    query = f"DESCRIBE {TABLES[table]}"
    cursor.execute(query)
    attributes = [row["Field"] for row in cursor.fetchall()]
    
    return jsonify(attributes)

# Fetch data with optional filtering and JOIN
@app.route('/api/fetch', methods=['GET'])
def fetch_data():
    table = request.args.get('table')
    filter_column = request.args.get('filter_column')
    filter_value = request.args.get('filter_value')
    join_table = request.args.get('join_table')

    if table not in TABLES:
        return jsonify({"error": "Invalid table"}), 400

    query = f"SELECT * FROM {TABLES[table]}"
    
    if join_table and join_table in TABLES:
        query += f" JOIN {TABLES[join_table]} ON {TABLES[table]}.id = {TABLES[join_table]}.user_id"

    if filter_column and filter_value:
        query += f" WHERE {filter_column}=%s"
        values = (filter_value,)
    else:
        values = ()

    try:
        cursor.execute(query, values)
        data = cursor.fetchall()
        return jsonify(data)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# Insert data dynamically
@app.route('/api/insert', methods=['POST'])
def insert_data():
    table = request.json.get("table")
    data = request.json.get("data")

    if table not in TABLES or not data:
        return jsonify({"error": "Invalid table or data"}), 400

    columns = ", ".join(data.keys())
    placeholders = ", ".join(["%s"] * len(data))
    values = tuple(data.values())

    query = f"INSERT INTO {TABLES[table]} ({columns}) VALUES ({placeholders})"

    try:
        cursor.execute(query, values)
        db.commit()
        return jsonify({"message": "Record inserted successfully"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# Update data dynamically
@app.route('/api/update', methods=['PUT'])
def update_data():
    table = request.json.get("table")
    filter_column = request.json.get("filter_column")
    filter_value = request.json.get("filter_value")
    update_column = request.json.get("update_column")
    update_value = request.json.get("update_value")

    if table not in TABLES or not filter_column or not filter_value or not update_column or not update_value:
        return jsonify({"error": "Invalid update parameters"}), 400

    query = f"UPDATE {TABLES[table]} SET {update_column}=%s WHERE {filter_column}=%s"
    values = (update_value, filter_value)

    try:
        cursor.execute(query, values)
        db.commit()
        return jsonify({"message": "Record updated successfully"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True)

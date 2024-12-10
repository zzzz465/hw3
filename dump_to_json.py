import sqlite3
import json
from datetime import datetime

def convert_to_json():
    # Connect to SQLite database
    conn = sqlite3.connect('db.sqlite')
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    # Dictionary to store all data
    data = {}
    
    # For each table
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT * FROM {table_name}")
        
        # Get column names
        columns = [description[0] for description in cursor.description]
        
        # Get all rows
        rows = cursor.fetchall()
        
        # Convert rows to list of dictionaries
        table_data = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                # Convert datetime objects to string if needed
                if isinstance(value, datetime):
                    value = value.isoformat()
                row_dict[columns[i]] = value
            table_data.append(row_dict)
            
        data[table_name] = table_data
    
    # Close connection
    conn.close()
    
    # Write to JSON file
    with open('crawled_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    convert_to_json()
    print("Data has been exported to crawled_data.json") 

import argparse
import json
from pathlib import Path
import sqlite3
import sys


parser = argparse.ArgumentParser(
    description='Write to sqlite3 from a standard input')
parser.add_argument('database', type=Path,
                    help='path to a sqlite3 database file (or create one)')
parser.add_argument('sql', nargs='?', type=Path,
                    help='path to file containing SQL commands to run')

options = parser.parse_args()

db = sqlite3.connect(options.database)

if options.sql is not None:
    db.executescript(options.sql.read_text())

for line in sys.stdin:
    tables = json.loads(line)
    for table, rows in tables.items():
        if len(rows) == 0:
            continue

        columns = list(rows[0].keys())
        columns_str = ', '.join(columns)
        parameters_str = ', '.join(':' + column for column in columns)
        sql = f'insert into {table}({columns_str}) values({parameters_str})'
        db.executemany(sql, rows)

    db.commit()

db.close()

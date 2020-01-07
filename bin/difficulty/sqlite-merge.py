import argparse
from pathlib import Path
import shutil
import sqlite3
import sys


parser = argparse.ArgumentParser(
    description='Merge sqlite3 databases into a single database')
parser.add_argument('sources', nargs='+', type=Path,
                    help='merge these databases into the destination')
parser.add_argument('destination', type=Path,
                    help='merge into the database at this path')

options = parser.parse_args()

# If they want to merge into a new database, that database will need all of the
# table definitions.  Instead of dealing with that, just copy the last source
# and pretend that copy was specified as the destination.
if not options.destination.exists():
    shutil.copy(options.sources.pop(), options.destination)


db = sqlite3.connect(options.destination)
tables = list(row[0] for row in db.execute(
                          "select name from sqlite_master where type='table'"))
for source in options.sources:
    db.execute("attach ? as Other", (str(source),))
    db.execute("begin")
    for table in tables:
        db.execute(f"insert into {table} select * from Other.{table}")
    db.execute("commit")
    db.execute("detach Other")

db.commit()
db.close()

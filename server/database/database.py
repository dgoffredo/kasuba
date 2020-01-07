"""Provide operations on the game database.
"""

from .. import database as package  # the package we live in

import importlib.resources
import sqlite3


def _resource(path):
    return importlib.resources.read_text(package, path)


class Database:
    def __init__(self, path: str):
        self.connection = sqlite3.connect(path)

        # Create the tables if they don't already exist.
        self.connection.execute(_resource('tables.sql'))

    def add_survey_result(self, fields):
        # Note that the `fields` have keys that correspond to the names of the
        # columns, except that the first character is lower case, e.g. the
        # column "Puzzle" appears in `fields` with the key "puzzle".
        self.connection.execute(_resource('insert_reported_difficulties.sql'),
                                fields)
        self.connection.commit()

#!/bin/sh

for numclues in 12 11 10 9 8; do
    sqlite3 difficulty.db <<END_SQL
.mode columns
.output clues.$numclues.histogram

select round(RmsScore, 1), count(*)
from Difficulty
where NumClues=$numclues
group by NumClues, round(RmsScore, 1)
order by round(RmsScore, 1);
END_SQL
done

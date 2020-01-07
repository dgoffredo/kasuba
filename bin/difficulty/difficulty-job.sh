#!/bin/sh

firstline=$1
lastline=$2
afterlast=$((lastline + 1))
database=$3

rm $database 2>/dev/null

   sed -n "${firstline},${lastline}p;${afterlast}q" solutions \
|  ./random-puzzles 8=10 9=10 10=10 11=10 12=10               \
|  ./difficulty                                               \
|  python3.7 sqlite-inserter.py $database difficulty.sql

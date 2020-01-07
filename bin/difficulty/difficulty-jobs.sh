#!/bin/sh

chunk=$((362880 / 4))
for i in 0 1 2 3; do
    >> output 2>&1 ./difficulty-job.sh    \
                       $((i*chunk + 1))   \
                       $(((i + 1)*chunk)) \
                       difficulty.$i.db   &
done

wait

python3.7 sqlite-merge.py \
    difficulty.0.db difficulty.1.db difficulty.2.db difficulty.3.db


for clues in 12 11 10 9 8; do
    for puzzle in $(grep "$clues clues" broken-up | awk '{print $1}'); do
        ./difficulty $puzzle | \
            grep 'quadratic mean' | \
            awk "{print \$3, \"$clues\", \"$puzzle\"}"
    done
done

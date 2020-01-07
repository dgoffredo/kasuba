#ifndef INCLUDED_MATCHES
#define INCLUDED_MATCHES

#include "intersection.h"
#include "table.h"

#include <utility>

// TODO: don't use a global
inline MinPriorityQueue<int> numMatchesQueue;

int numMatches(const char* pattern, const Table& table)
{
    std::pair<const int*, const int*> buckets[NUM_CELLS];
    int                               numBuckets = 0;

    for (int i = 0; i < NUM_CELLS; ++i) {
        const char ch = pattern[i];
        if (ch == '.')  {
            continue;  // wildcard
        }

        const int value = ch - '1';
        buckets[numBuckets].first  = table[i][value];
        buckets[numBuckets].second = table[i][value] + BUCKET_SIZE;

        ++numBuckets; 
    }

    int              common[BUCKET_SIZE];
    const int* const end = intersection(buckets,
                                        buckets + numBuckets,
                                        common,
                                        numMatchesQueue);
    return end - common;
}

#endif

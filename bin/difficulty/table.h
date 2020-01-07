#ifndef INCLUDED_TABLE
#define INCLUDED_TABLE

#include "constmemorymappedarray.h"

#include <fstream>
#include <memory>

constexpr int NUM_CELLS   = 27;         // 3x3x3 cube
constexpr int NUM_VALUES  = 9;          // 1 .. 9 inclusive
constexpr int BUCKET_SIZE = 40'320;     // maximum number of solutions that
                                        // have the same value at the same
                                        // place. I deteremined this
                                        // empirically by analyzing a listing
                                        // of all of the solutions.
constexpr int NUM_SOLUTIONS = 362'880;  // factorial(9), but I don't know why

// There are 362,880 solutions, and so it takes 18.469 -> 19 bits to identify
// one of them, which is 2.375 bytes, which might be worth representing
// compactly.  However, since NUM_CELLS * NUM_VALUES * BUCKET_SIZE is only
// 9,797,760, it's not an issue to pay four bytes per for an int, for a total
// of 39,191,040 bytes (~39 megs).
using Table = int[NUM_CELLS][NUM_VALUES][BUCKET_SIZE];

// I have a text file of all of the solutions, separated by '\n', so it's
// convenient to map that representation directly into memory.  The values are
// from ASCII '1' to ASCII '9', so I'll have an offset of '1' to get to the
// range [0, 9 - 1] used as the second coordinate in `Table`. 
using Solution = char[NUM_CELLS + 1];

using Solutions = Solution[NUM_SOLUTIONS];

struct TableHolder {
    Table table;

    TableHolder()
    : table() {
    }
};

inline int tabulate() {
    ConstMemoryMappedArray<Solutions> solutions("solutions");

    std::unique_ptr<TableHolder> holderPtr(new TableHolder);
    Table&                       table = holderPtr->table;
    int                          offset[NUM_CELLS][NUM_VALUES] = {};

    for (int i = 0; i < NUM_SOLUTIONS; ++i) {
        for (int j = 0; j < NUM_CELLS; ++j) {
            int value = solutions[i][j] - '1';

            table[j][value][offset[j][value]++] = i;
        }
    }

    std::ofstream file("table");
    file.write(reinterpret_cast<const char*>(&table), sizeof(table));
    return 0;
}

#endif

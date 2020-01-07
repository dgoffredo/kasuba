
#include <algorithm>
#include <cerrno>
#include <exception>
#include <fstream>
#include <iostream>
#include <iterator>
#include <memory>
#include <queue>
#include <random>
#include <stdexcept>
#include <string>
#include <string_view>
#include <system_error>
#include <utility>
#include <vector>

#include "constmemorymappedarray.h"
#include "intersection.h"
#include "matches.h"
#include "table.h"

int explore() {
    ConstMemoryMappedArray<Table> table("table");

    std::cout << "Here are the solutions that have \"2\" in the first cell:\n";
    for (int k = 0; k < BUCKET_SIZE; ++k) {
        std::cout << table[0][2 - 1][k] << " ";
    }
    std::cout << "\n";

    return 0;
}

int diffs() {
    ConstMemoryMappedArray<Table> table("table");

    std::unique_ptr<int[]> jumpCounts(new int[NUM_SOLUTIONS]());

    for (int cell = 0; cell < NUM_CELLS; ++cell) {
        for (int value = 0; value < NUM_VALUES; ++value) {
            int previous = -1;
            for (int bucket = 0; bucket < BUCKET_SIZE; ++bucket) {
                const int current = table[cell][value][bucket];

                /*if (previous != -1 && current - previous != 1) {
                    std::cout << "Found a jump of " << (current - previous)
                              << " at table[" << cell << "][" << value << "]["
                              << bucket << "]\n";
                }*/
                if (previous != -1) {
                    ++jumpCounts[current - previous];
                }

                previous = current;
            }
        }
    }

    for (int i = 0; i < NUM_SOLUTIONS; ++i) {
        if (jumpCounts[i])
            std::cout << i << " " << jumpCounts[i] << "\n";
    }

    return 0;
}

int sorted() {
    ConstMemoryMappedArray<Table> table("table");

    for (int cell = 0; cell < NUM_CELLS; ++cell) {
        for (int value = 0; value < NUM_VALUES; ++value) {
            if (!std::is_sorted(table[cell][value],
                                table[cell][value] + BUCKET_SIZE)) {
                std::cout << "bucket at table[" << cell << "][" << value
                          << "] is not in sorted order.\n";
            }
        }
    }

    return 0;
}

inline unsigned long long clueCounts[NUM_CELLS] = {};
inline unsigned long long numFound              = 0;

void recur(const ConstMemoryMappedArray<Table>& table,
           const char*                          solution,
           char*                                working,
           int                                  startIndex)
{
    for (int i = startIndex; i < NUM_CELLS; ++i) {
        working[i] = '.';

        const int matches = numMatches(working, table);

        if (matches > 1) {
            int numClues = 0;
            for (int j = 0; j < NUM_CELLS; ++j) {
                if (j == i) {
                    ++numClues;
                    std::cout << "(" << solution[j] << ")";
                }
                else {
                    if (working[j] != '.') {
                        ++numClues;
                    }
                    std::cout << working[j];
                }
            }
            std::cout << " (" << numClues << " clues)\n";
            ++clueCounts[numClues];
            ++numFound;
            /*
            if (numFound == 1'000) {
                std::ofstream file("clues");
                for (int i = 0; i < NUM_CELLS; ++i) {
                    if (clueCounts[i]) {
                        file << i << " " << clueCounts[i] << "\n";
                    }
                }
                throw std::runtime_error("done");
            }
            */
        }
        else if (matches == 0) {
            std::cout << "no matches for: " << working << "\n";
        }
        else {
            recur(table, solution, working, i + 1);
        }

        working[i] = solution[i];
    }
}

int minimal() {
    ConstMemoryMappedArray<Table> table("table");
    #define SOLUTION "371965842659428713284137596"
    const char                    solution[] = SOLUTION;
    char                          working[]  = SOLUTION;

    recur(table, solution, working, 0);

    return 0;
}

int randomMinimal(const auto& solutions, const auto& table, int clues) {
    const auto                      seed = std::random_device()();
    std::mt19937                    generator(seed);
    std::uniform_int_distribution<> randomIndex(0, NUM_SOLUTIONS - 1);

    const char* const solution = solutions[randomIndex(generator)];
    Solution          pattern;

    int attempts = 0;
    do {
        ++attempts;

        bool isWildcard[NUM_CELLS] = {};
        std::fill_n(isWildcard, NUM_CELLS - clues, true);
        std::shuffle(isWildcard, std::end(isWildcard), generator);

        for (int i = 0; i < NUM_CELLS; ++i) {
            pattern[i] = isWildcard[i] ? '.' : solution[i];
        }
    } while (numMatches(pattern, table) > 1);

    std::cout << attempts << " attempts to get a unique pattern with "
              << clues << " clues based off of the solution "
              << std::string(solution, NUM_CELLS) << ": "
              << std::string(pattern, NUM_CELLS) << "\n";
                 
    return 0;
}

int main(int argc, char* argv[]) try {
    if (argc < 2) {
        std::cerr << "Specify a command. One of: "
                     "tabulate, explore, diffs, minimal\n";
        return 1;
    }

    const std::string_view command(argv[1]);
    if (command == "tabulate") {
        return tabulate();
    }
    else if (command == "explore") {
        return explore();
    }
    else if (command == "diffs") {
        return diffs();
    }
    else if (command == "sorted") {
        return sorted();
    }
    else if (command == "minimal") {
        return minimal();
    }
    else if (command == "random") {
        ConstMemoryMappedArray<Solutions> solutions("solutions");
        ConstMemoryMappedArray<Table>     table("table");

        if (argc != 3) {
            std::cerr << "Specify number of clues to use.\n";
            return 3;
        }

        for (;;) {
            randomMinimal(solutions, table, std::stoi(argv[2]));
        }
        return 0;
    }
    else {
        std::cerr << "Unrecognized command: " << command << '\n';
        return 2;
    }
}
catch (const std::exception& error) {
    std::cerr << error.what() << "\n";
    return 3;
}

#include "constmemorymappedarray.h"
#include "matches.h"
#include "table.h"

#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <random>
#include <unordered_map>

std::string randomPuzzle(const std::string&                   solution,
                         std::mt19937&                        generator,
                         const ConstMemoryMappedArray<Table>& table,
                         int numClues) {
    Solution pattern;

    int attempts = 0;
    do {
        ++attempts;

        bool isWildcard[NUM_CELLS] = {};
        std::fill_n(isWildcard, NUM_CELLS - numClues, true);
        std::shuffle(isWildcard, std::end(isWildcard), generator);

        for (int i = 0; i < NUM_CELLS; ++i) {
            pattern[i] = isWildcard[i] ? '.' : solution[i];
        }
    } while (numMatches(pattern, table) > 1);

    return std::string(pattern, NUM_CELLS);
}

int main(int, char* argv[]) {
    ConstMemoryMappedArray<Table> table("table");  // hard-coded path

    std::unordered_map<int, int> howMany;  // num clues -> how many puzzles

    for (const char* const* arg = argv + 1; *arg; ++arg) {
        // Expect arguments like "8=50", meaning generate 50 puzzles having 8
        // clues.
        std::string spec(*arg);
        std::replace(spec.begin(), spec.end(), '=', ' ');

        std::istringstream stream(spec);
        int numClues, numPuzzles;
        stream >> numClues >> numPuzzles;
        howMany.emplace(numClues, numPuzzles);
    }

    const auto   seed = std::random_device()();
    std::mt19937 generator(seed);

    std::string solution;
    std::string puzzle;
    while (std::getline(std::cin, solution)) {
        for (const auto& [numClues, numPuzzles] : howMany) {
            for (int i = 0; i < numPuzzles; ++i) {
                puzzle = randomPuzzle(solution, generator, table, numClues);
                std::cout << puzzle << "\n";
            }
        }
    }
}
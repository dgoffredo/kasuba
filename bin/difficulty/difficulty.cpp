#include "cube.h"

#include <algorithm>
#include <cassert>
#include <cmath>
#include <functional>
#include <iostream>
#include <numeric>
#include <string>
#include <tuple>
#include <vector>

const int coordinateValues[] = {-1, 0, 1};

using Cell = std::tuple<int, int, int>;

struct ConstraintCategory {
    std::function<int(int, int, int, const Cube&)> constrainedTo;
    double                                         score;
};

int remaining(const bool (&taken)[9 + 1]) {
    const auto end   = std::end(taken);
    const auto first = std::find(taken + 1, end, false);
    
    assert(first != end);  // at least the cell looked at is blank

    const auto second = std::find(first + 1, end, false);

    if (second == end) {
        // There was only one unoccupied cell value; return which.
        return first - taken;
    }
    else {
        // There are two or more unoccupied cell values; return zero,
        // indicating "not completely constrained."
        return 0;
    }
}


template <typename Value, int n>
void copyArray(Value (&destination)[n], const Value (&source)[n]) {
    std::copy(source, source + n, destination);
}

int aloneInAxisPlane(int x, int y, int z, const Cube& cube, bool (&initialTaken)[9 + 1]) {
    for (const int k : coordinateValues) {
        #define CHECK(COORDINATE, CUBE_ARGS)                    \
            if (COORDINATE == k) {                              \
                bool taken[9 + 1];                              \
                copyArray(taken, initialTaken);                 \
                                                                \
                for (const int other1 : coordinateValues) {     \
                    for (const int other2 : coordinateValues) { \
                        if (const int digit = cube CUBE_ARGS) { \
                            taken[digit] = true;                \
                        }                                       \
                    }                                           \
                }                                               \
                                                                \
                const int digit = remaining(taken);             \
                if (digit) {                                    \
                    return digit;                               \
                }                                               \
            }

        CHECK(x, (k,      other1, other2))
        CHECK(y, (other1, k,      other2))
        CHECK(z, (other1, other2, z     ))

        #undef CHECK
    }

    return 0;  // not alone in any one axis plane
}

int aloneInSlantedPlane(int x, int y, int z, const Cube& cube, bool (&initialTaken)[9 + 1]) {
    #define CHECK(CONSTRAINT, RHS, CUBE_ARGS)               \
        if (CONSTRAINT) {                                   \
            bool taken[9 + 1] = {};                         \
            copyArray(taken, initialTaken);                 \
                                                            \
            for (const int lhs : coordinateValues) {        \
                const int rhs = RHS;                        \
                for (const int other : coordinateValues) {  \
                    if (const int digit = cube CUBE_ARGS) { \
                        taken[digit] = true;                \
                    }                                       \
                }                                           \
            }                                               \
                                                            \
            const int digit = remaining(taken);             \
            if (digit) {                                    \
                return digit;                               \
            }                                               \
        }

    // The three slanted planes are:
    // 1. x=-y
    // 2. x=z
    // 3. y=z

    CHECK(x == -y, -lhs, (lhs,   rhs,   other))
    CHECK(x == z,  lhs,  (lhs,   other, rhs))
    CHECK(y == z,  lhs,  (other, lhs,   rhs))

    #undef CHECK

    return 0;  // not alone in any one slanted plane
}

int multipleAxisPlanes(int x, int y, int z, const Cube& cube, bool (&initialTaken)[9 + 1]) {
    bool taken[9 + 1] = {};
    copyArray(taken, initialTaken);

    for (const int k : coordinateValues) {
        #define CHECK(COORDINATE, CUBE_ARGS)                    \
            if (COORDINATE == k) {                              \
                                                                \
                for (const int other1 : coordinateValues) {     \
                    for (const int other2 : coordinateValues) { \
                        if (const int digit = cube CUBE_ARGS) { \
                            taken[digit] = true;                \
                        }                                       \
                    }                                           \
                }                                               \
                                                                \
                const int digit = remaining(taken);             \
                if (digit) {                                    \
                    return digit;                               \
                }                                               \
            }

        CHECK(x, (k,      other1, other2))
        CHECK(y, (other1, k,      other2))
        CHECK(z, (other1, other2, z     ))

        #undef CHECK
    }

    copyArray(initialTaken, taken);  // in case you want to try other things

    return 0;  // not alone in any combination of axis planes
}

int multipleSlantedPlanes(int x, int y, int z, const Cube& cube, bool (&initialTaken)[9 + 1]) {
    bool taken[9 + 1] = {};
    copyArray(taken, initialTaken);

    #define CHECK(CONSTRAINT, RHS, CUBE_ARGS)               \
        if (CONSTRAINT) {                                   \
            for (const int lhs : coordinateValues) {        \
                const int rhs = RHS;                        \
                for (const int other : coordinateValues) {  \
                    if (const int digit = cube CUBE_ARGS) { \
                        taken[digit] = true;                \
                    }                                       \
                }                                           \
            }                                               \
                                                            \
            const int digit = remaining(taken);             \
            if (digit) {                                    \
                return digit;                               \
            }                                               \
        }

    // The three slanted planes are:
    // 1. x=-y
    // 2. x=z
    // 3. y=z

    CHECK(x == -y, -lhs, (lhs,   rhs,   other))
    CHECK(x == z,  lhs,  (lhs,   other, rhs))
    CHECK(y == z,  lhs,  (other, lhs,   rhs))

    #undef CHECK

    copyArray(initialTaken, taken);  // in case you want to try other things

    return 0;  // not alone in any one slanted plane
}

int axisPlanesAndOneSlantedPlane(int x, int y, int z, const Cube& cube, bool (&initialTaken)[9 + 1]) {
    bool taken[9 + 1];
    copyArray(taken, initialTaken);

    const int digitFromAxes = multipleAxisPlanes(x, y, z, cube, taken);

    assert(digitFromAxes == 0);  // we should have tried it already

    return aloneInSlantedPlane(x, y, z, cube, taken);
}

int axisPlanesAndMultipleSlantedPlanes(int x, int y, int z, const Cube& cube, bool (&initialTaken)[9 + 1]) {
    bool taken[9 + 1];
    copyArray(taken, initialTaken);

    const int digitFromAxes = multipleAxisPlanes(x, y, z, cube, taken);

    assert(digitFromAxes == 0);  // we should have tried it already

    return multipleSlantedPlanes(x, y, z, cube, taken);
}

auto wrap(int (*func)(int x,
                      int y,
                      int z,
                      const Cube& cube,
                      bool (&initialTaken)[9 + 1])) {
    return [func](int x, int y, int z, const Cube& cube) {
        bool initialTaken[9 + 1] = {};
        return func(x, y, z, cube, initialTaken);
    };
}

auto boxedInDigit(int digit, int x, int y, int z, const Cube& cube) {
    bool occupied[3][3] = {};  // (axis, value) -> (contains digit?)

    for (const int x2 : coordinateValues) {
        for (const int y2 : coordinateValues) {
            for (const int z2: coordinateValues) {
                if (cube(x2, y2, z2) == digit) {
                    occupied[0][x2 + 1] = true;
                    occupied[1][y2 + 1] = true;
                    occupied[2][z2 + 1] = true;
                }
            }
        }
    }

    // We're boxed into `digit` if the occupancy of `axis=k` is equivalent to
    // `k != (x, y, z)[axis]`.
    for (int i : coordinateValues) {
        if (occupied[0][i + 1] != (i != x)) {
            return 0;
        }
    }

    for (int i : coordinateValues) {
        if (occupied[1][i + 1] != (i != y)) {
            return 0;
        }
    }

    for (int i : coordinateValues) {
        if (occupied[2][i + 1] != (i != z)) {
            return 0;
        }
    }

    // If we've gotten this far, then we really are boxed into `digit` by axis
    // planes.
    return digit;
}

int boxedIn(int x, int y, int z, const Cube& cube) {
    for (int digit = 1; digit <= 9; ++digit) {
        if (boxedInDigit(digit, x, y, z, cube)) {
            return digit;
        }
    }

    return 0;
}

std::vector<ConstraintCategory> makeConstraintCategories() {
    return {
        {wrap(&aloneInAxisPlane),                   1},
        {wrap(&aloneInSlantedPlane),                2},
        {&boxedIn,                                  3},
        {wrap(&multipleAxisPlanes),                 3},
        {wrap(&axisPlanesAndOneSlantedPlane),       4},
        {wrap(&axisPlanesAndMultipleSlantedPlanes), 5}
    };
}

const std::vector<ConstraintCategory> constraintCategories =
    makeConstraintCategories();

std::vector<Cell> blankCells(const Cube& cube) {
    std::vector<Cell> result;

    for (const int x : coordinateValues) {
        for (const int y : coordinateValues) {
            for (const int z : coordinateValues) {
                if (cube(x, y, z) == 0) {
                    result.emplace_back(x, y, z);
                }
            }
        }
    }

    return result;
}

class Skip {};  // TODO: hack hack

template <typename OutputFunc>
void simulate(OutputFunc& appendScore,
              Cube        cube,
              double      currentScore) {
    const auto blanks = blankCells(cube);

    if (blanks.empty()) {
        appendScore(currentScore);
        return;
    }

    for (const auto& category : constraintCategories) {
        const auto&  constrainedTo = category.constrainedTo;
        const double score         = category.score;
        bool         foundCell     = false;

        for (const auto& [x, y, z] : blanks) {
            if (const int digit = constrainedTo(x, y, z, cube)) {
                foundCell = true;

                Cube newCube(cube);
                newCube(x, y, z) = digit;
                simulate(appendScore,
                         std::move(newCube),
                         currentScore + score);
            }
        }

        if (foundCell) {
            return;
        }
    }

    // None of the blank cells are completely constrained by any of the
    // `constraintCategories`.
    // TODO: Remove this logging once you figure out if/when it happens.
    std::cerr << "Found a cube that has no totally constrained blanks: ";
    for (int i = 0; i < 27; ++i) {
        if (cube.data[i]) {
            std::cerr << cube.data[i];
        }
        else {
            std::cerr << ".";
        }
    }
    std::cerr << "\n";
    // std::cerr << cube << "\n";
    throw Skip();
}

void printPuzzleDifficulty(const std::string& puzzle) {
    Cube cube;
    for (int i = 0; i < 27; ++i) {
        const char ch = puzzle[i];
        if (ch == '.') {
            cube.data[i] = 0;
        }
        else {
            cube.data[i] = ch - '0';
        }
    }

    const int numClues = 27 - std::count(puzzle.begin(), puzzle.end(), '.');

    double rmsScore = 0;
    int    count    = 0;
    auto appendScore = [&rmsScore, &count](double score) {
        rmsScore += score * score;
        ++count;
    };

    try {
        simulate(appendScore, cube, 0);
    }
    catch (const Skip&) {
        // TODO: actually extend the behavior of `simulate` to account for this
        return;
    }

    rmsScore = std::sqrt(rmsScore / count);

    std::cout << "{\"Difficulty\": ["
                 "{\"Puzzle\": \"" << puzzle
              << "\", \"NumClues\": " << numClues
              << ", \"NumScores\": " << count
              << ", \"RmsScore\": " << rmsScore
              << "}"
                 "]}\n";
}

int main(int, char*[]) {
    std::string puzzle;
    
    while (std::getline(std::cin, puzzle)) {
        printPuzzleDifficulty(puzzle);
    }
}
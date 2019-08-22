#include <array>
#include <csignal>
#include <cstdlib>
#include <initializer_list>
#include <iostream>
#include <numeric>
#include <ostream>
#include <string>
#include <unordered_set>
// #include <vector>

namespace {

using Int = int;

constexpr int n = 3;
static_assert(n % 2, "n must be odd");

struct Cube {
    std::array<Int, n*n*n> data = {};

    Int& operator()(int x, int y, int z) {
        // change basis
        x += 1;
        y += 1;
        z += 1;

        return data[n*n*x + n*y + z];
    }

    Int operator()(int x, int y, int z) const {
        // change basis
        x += 1;
        y += 1;
        z += 1;

        return data[n*n*x + n*y + z];
    }

    static void pointFromOffset(int offset, int& x, int& y, int& z) {
        z = offset % n - 1;
        offset /= n;
        y = offset % n - 1;
        offset /= n;
        x = offset - 1;
    }
};

/*
std::ostream& operator<<(std::ostream& stream, const Cube& cube) {
    const char* separator = "   ";

    for (const int z : {1, 0, -1}) {
        for (const int y : {1, 0, -1}) {
            stream << std::string((y + 1) * 2, ' ');  // left pad
            for (const int x : {-1, 0, 1}) {
                const Int value = cube(x, y, z);
                if (value) {
                    stream << value;
                }
                else {
                    stream << '-';
                }
                stream << separator;
            }
            stream << "\n";
        }
    }

    return stream;
}
*/

struct {
    int xEqualsY = 0;
    int xEqualsZ = 0;
    int yEqualsZ = 0;
} signs;

bool invalid(const Cube& cube, int offset) {
    // (pX, pY, pZ) is the point that changed most recently.
    int pX, pY, pZ;
    Cube::pointFromOffset(offset, pX, pY, pZ);

    std::array<int, n> range;
    std::iota(range.begin(), range.end(), -n/2);

    const std::array<bool, n*n + 1> empty = {};
    std::array<bool, n*n + 1>       seen;

    // {x, y, z} = {-1, 0, 1}
    for (const int k : range) {

        // x = k
        if (pX == k) {
            seen = empty;
            for (const int y : range) {
                for (const int z : range) {
                    const int value = cube(k, y, z);
                    if (value) {
                        if (seen[value]) {
                            //           << "\n";
                            return true;
                        }
                        else {
                            seen[value] = true;
                        }
                    }
                }
            }
        }

        // y = k
        if (pY == k) {
            seen = empty;
            for (const int x : range) {
                for (const int z : range) {
                    const int value = cube(x, k, z);
                    if (value) {
                        if (seen[value]) {
                            return true;
                        }
                        else {
                            seen[value] = true;
                        }
                    }
                }
            }
            }

        // z = k
        if (pZ == k) {
            seen = empty;
            for (const int x : range) {
                for (const int y : range) {
                    const int value = cube(x, y, k);
                    if (value) {
                        if (seen[value]) {
                            return true;
                        }
                        else {
                            seen[value] = true;
                        }
                    }
                }
            }
        }
    }

    // x = +/- y
    if (signs.xEqualsY && signs.xEqualsY * pX == pY) {
        seen = empty;
        for (const int z : range) {
            for (const int k : range) {
                const int value = cube(signs.xEqualsY * k, k, z);
                if (value) {
                    if (seen[value]) {
                        return true;
                    }
                    else {
                        seen[value] = true;
                    }
                }
            }
        }
    }

    // y = +/- z
    if (signs.yEqualsZ && signs.yEqualsZ * pY == pZ) {
        seen = empty;
        for (const int x : range) {
            for (const int k : range) {
                const int value = cube(x, signs.yEqualsZ * k, k);
                if (value) {
                    if (seen[value]) {
                        return true;
                    }
                    else {
                        seen[value] = true;
                    }
                }
            }
        }
    }

    // x = +/- z
    if (signs.xEqualsZ && signs.xEqualsZ * pX == pZ) {
        seen = empty;
        for (const int y : range) {
            for (const int k : range) {
                const int value = cube(signs.xEqualsZ * k, y, k);
                if (value) {
                    if (seen[value]) {
                        return true;
                    }
                    else {
                        seen[value] = true;
                    }
                }
            }
        }
    }

    return false;
}

unsigned long long numSolutions = 0;

void handleInterrupt(int) {
    std::cout << "\n" << numSolutions << std::endl;
    _Exit(0);
}

}  // namespace

int main(int argc, char* argv[]) {
    std::signal(SIGINT, handleInterrupt);
    // std::vector<Cube> solutions;

    const std::unordered_set<std::string> args(argv + 1, argv + argc);

    // First, parse from the arguments which non-axis planes to require.
    if (args.count("x=y")) signs.xEqualsY = 1;
    if (args.count("x=-y")) signs.xEqualsY = -1;
    if (args.count("x=z")) signs.xEqualsZ = 1;
    if (args.count("x=-z")) signs.xEqualsZ = -1;
    if (args.count("y=z")) signs.yEqualsZ = 1;
    if (args.count("y=-z")) signs.yEqualsZ = -1;

    Cube cube;
    std::array<Int, n*n*n>& data = cube.data;
    int i = 0;

    for (;;) {
        // std::cout << "i = " << i << "\n";
        // for (int j = 0; data[j]; ++j) {
        //     std::cout << data[j];
        // }
        // std::cout << "\nnow looking at:\n" << cube;
        // std::cout << "\n\n";

        if (i == n*n*n) {
            // found a solution
            // solutions.push_back(cube);
            ++numSolutions;
            // std::cout << cube << "\n\n";
            cube = Cube();
            i = 0;

            // if ((solutions.size() - 1u) % 10'000 == 0) {
            //     std::cout << "Found " << solutions.size()
            //               << " solutions so far.\n";
            // }
        }
        else if (data[i] > n*n) {
            // ran out of values at this cell, so backtrack
            data[i] = 0;
            if (i == 0) {
                break;  // no more solutions
            }
            else {
                --i;
                ++data[i];
            }
        }
        // TODO: deduce x, y, z
        else if (data[i] == 0 || invalid(cube, i)) {
            // need to try the next number in this cell
            ++data[i];
        }
        else {
            // so far so good, so go to next cell
            // std::cout << "moving onto " << (i + 1)
            //           << " after successful value " << data[i] << "\n";
            ++i;
        }
    }

    std::cout << numSolutions << "\n";
}

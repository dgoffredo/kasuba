#include <array>
#include <csignal>
#include <cstdlib>
#include <initializer_list>
#include <iostream>
#include <numeric>
#include <ostream>
#include <string>
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

bool invalid(const Cube& cube) {
    std::array<int, n> range;
    std::iota(range.begin(), range.end(), -n/2);

    const std::array<bool, n*n + 1> empty = {};
    std::array<bool, n*n + 1>       seen;

    // {x, y, z} = {-1, 0, 1}
    for (const int k : range) {

        // x = k
        seen = empty;
        for (const int y : range) {
            for (const int z : range) {
                const int value = cube(k, y, z);
                if (value) {
                    if (seen[value]) {
                        // std::cout << "already saw " << value << " in x = "
                        //           << k << " for y = " << y << " and z = " << z
                        //           << "\n";
                        return true;
                    }
                    else {
                        seen[value] = true;
                    }
                }
            }
        }

        // y = k
        seen = empty;
        for (const int x : range) {
            for (const int z : range) {
                const int value = cube(x, k, z);
                if (value) {
                    if (seen[value]) {
                        // std::cout << "already saw " << value << " in y = "
                        //           << k << " for x = " << x << " and z = " << z
                        //           << "\n";
                        return true;
                    }
                    else {
                        seen[value] = true;
                    }
                }
            }
        }

        // z = k
        seen = empty;
        for (const int x : range) {
            for (const int y : range) {
                const int value = cube(x, y, k);
                if (value) {
                    if (seen[value]) {
                        // std::cout << "already saw " << value << " in z = "
                        //           << k << " for x = " << x << " and y = " << y
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

    /*
    // x = -y
    seen = empty;
    for (const int z : range) {
        for (const int k : range) {
            const int value = cube(-k, k, z);
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
    */

    // y = -z
    seen = empty;
    for (const int x : range) {
        for (const int k : range) {
            const int value = cube(x, k, k);
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

    // x = z
    seen = empty;
    for (const int y : range) {
        for (const int k : range) {
            const int value = cube(k, y, k);
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

    return false;
}

unsigned long long numSolutions = 0;

void handleInterrupt(int) {
    std::cout << "\n" << numSolutions << std::endl;
    _Exit(0);
}

}  // namespace

int main() {
    std::signal(SIGINT, handleInterrupt);
    // std::vector<Cube> solutions;

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
        else if (data[i] == 0 || invalid(cube)) {
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

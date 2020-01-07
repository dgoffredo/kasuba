#ifndef INCLUDED_CUBE
#define INCLUDED_CUBE

#include <array>
#include <ostream>
#include <string>

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

        return data[n*n*z + n*y + x];
    }

    Int operator()(int x, int y, int z) const {
        // change basis
        x += 1;
        y += 1;
        z += 1;

        return data[n*n*z + n*y + x];
    }

    static void pointFromOffset(int offset, int& x, int& y, int& z) {
        x = offset % n - 1;
        offset /= n;
        y = offset % n - 1;
        offset /= n;
        z = offset - 1;
    }
};

inline std::ostream& operator<<(std::ostream& stream, const Cube& cube) {
    const char* separator = "   ";

    for (const int x : {-1, 0, 1}) {
        for (const int z : {1, 0, -1}) {
            stream << std::string((z + 1) * 2, ' ');  // left pad
            for (const int y : {-1, 0, 1}) {
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

#endif


#include <algorithm>
#include <cassert>
#include <cstddef>
#include <iostream>
#include <string>

bool similar(const std::string& from, const std::string& to) {
    const std::size_t n = 27u;

    assert(from.size() == to.size());
    assert(from.size() == n);

    char transitions[9];
    const char unset = '.';
    std::fill_n(transitions, sizeof transitions, unset);

    for (std::size_t i = 0; i < n; ++i) {
        char& after = transitions[from[i] - '1'];
        if (after != unset && after != to[i]) {
            return false;
        }

        after = to[i];
    }    

    std::cout.write(transitions, sizeof transitions) << "\n";
    return true;
}

void check(const std::string& from, const std::string& to) {
    if (similar(from, to)) {
        return;
    }

    std::cout << from << "\n" << to << "\n\n";
}

int main() {
    std::string from, to;

    std::getline(std::cin, from);
    std::getline(std::cin, to);

    check(from, to);

    while (std::getline(std::cin, from)) {
        swap(from, to);
        check(from, to);
    }
}


#include "randomint.h"

#include <algorithm>
#include <cassert>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

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

    // std::cout.write(transitions, sizeof transitions) << "\n";
    return true;
}

void check(const std::string& from, const std::string& to) {
    if (similar(from, to)) {
        return;
    }

    std::cout << from << "\n" << to << "\n\n";
}

int oneAtATime() {
    std::string from, to;

    std::getline(std::cin, from);
    std::getline(std::cin, to);

    check(from, to);

    while (std::getline(std::cin, from)) {
        swap(from, to);
        check(from, to);
    }

    return 0;
}

int randomly() {
    std::vector<std::string> solutions;
    solutions.reserve(9*8*7*6*5*4*3*2);

    std::string line;
    while (std::getline(std::cin, line)) {
        solutions.push_back(line);
    }

    // any valid index into `solutions`
    RandomInt rand(0, solutions.size() - 1);

    for (;;) {
        const int from = rand();
        int to;
        do {
            to = rand();
        } while (to == from);

        check(solutions[from], solutions[to]);
    }

    return 0;
}

int main(int argc, char* argv[]) {
    if (argc > 1 && std::string(argv[1]) == "random") {
        return randomly();
    }
    else {
        return oneAtATime();
    }
}

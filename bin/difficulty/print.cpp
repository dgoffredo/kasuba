#include "cube.h"

#include <cassert>
#include <cstdlib>
#include <iostream>
#include <string>

int main(int argc, char *argv[]) {
    assert(argc == 2);

    Cube  cube;
    auto& data = cube.data;

    const char* chPtr = argv[1];
    for (int i = 0; *chPtr; ++i, ++chPtr) {
        const char cstr[] = {*chPtr, '\0'};
        data[i] = std::atoi(cstr);
    }

    std::cout << cube << "\n";
}
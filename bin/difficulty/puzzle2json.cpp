#include <iostream>
#include <string>

/*
input:
.1..4.....6.8....57..2...3.

output:
{

    "0,1,2": 1,
    "0,1,1": 4,
    "1,1,2": 6,
    "1,0,1": 8,
    "1,2,0": 5,
    "2,0,2": 7,
    "2,0,1": 2,
    "2,1,0": 3
}
*/

int main(int argc, char* argv[]) {
    std::string puzzle;
    
    switch (argc) {
        case 1:
            std::getline(std::cin, puzzle);
            break;
        case 2:
            puzzle = argv[1];
            break;
        default:
            std::cerr << "Specify puzzle in command line or as standard "
                         "input.\n";
            return 1;
    }

    if (puzzle.size() != 27) {
        std::cerr << "Puzzle must contain 27 characters, not " << puzzle.size()
                  << "\n";
        return 2;
    }

    std::cout << "{";

    bool first = true;
    int      i = 0;
    for (int column = 0; column < 3; ++column)
        for (int depth = 0; depth < 3; ++depth)
            for (int row = 2; row >= 0; --row, ++i)
                if (puzzle[i] != '.')
                    std::cout << (first ? (first = false, "") : ",")
                              << "\n    \""
                              << row << "," << column << "," << depth
                              << "\": " << puzzle[i];

    std::cout << "\n}";
}

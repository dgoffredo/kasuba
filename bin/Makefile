.PHONY: run

run: solver
	./solver $(ARGS)

solver: solver.cpp
	g++ -o solver -Wall -Wextra -pedantic -Werror -O3 solver.cpp
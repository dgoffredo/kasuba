.PHONY: run

run: solver
	./solver $(ARGS)

solver: solver.cpp cube.h
	g++ -flto -o solver -Wall -Wextra -pedantic -Werror -O3 solver.cpp
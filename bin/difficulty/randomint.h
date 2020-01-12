#ifndef INCLUDED_RANDOMINT
#define INCLUDED_RANDOMINT

#include <random>

class RandomInt {
    std::default_random_engine      engine;
    std::uniform_int_distribution<> distribution;

  public:
    RandomInt(int low, int high)
    : engine(std::random_device()())
    , distribution(low, high) {
    }

    template <typename Seed>
    RandomInt(int low, int high, Seed&& seed)
    : engine(std::forward<Seed>(seed))
    , distribution(low, high) {
    }

    int operator()() {
        return distribution(engine);
    }
};

#endif

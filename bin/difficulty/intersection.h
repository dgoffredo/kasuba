#ifndef INCLUDED_INTERSECTION
#define INCLUDED_INTERSECTION

#include <algorithm>
#include <queue>
#include <vector>

template <typename ContainerAdapter>
typename ContainerAdapter::container_type&
container(ContainerAdapter& adapter) {
    struct Workaround : private ContainerAdapter {
        static typename ContainerAdapter::container_type&
        container(ContainerAdapter& adapter) {
            return adapter.*&Workaround::c;
        }
    };

    return Workaround::container(adapter);
}

template <typename SetIter, typename OutputIter, typename PriorityQueue>
OutputIter intersection(SetIter        beginSets,
                        SetIter        endSets,
                        OutputIter     output,
                        PriorityQueue& queue) {
    container(queue).clear();

    // Enqueue the initial values to consider.
    int numSets = 0;
    for (SetIter sIter = beginSets; sIter != endSets; ++sIter, ++numSets) {
        auto& [begin, end] = *sIter;
        // std::cout << "begin: " << begin << " end: " << end << "\n";
        if (begin == end) {
            // std::cout << "One of the sets is empty to begin with\n";
            return output;
        }
        else {
            queue.push(*begin);
        }
    }

    // Feed through values until we're done.
    for (; !queue.empty(); queue.pop()) {
        const auto& top   = queue.top();  // smallest value in the queue
        int         count = 0;            // number of sets containing `top`

        // std::cout << "the queue has length " << queue.size()
        //           << ", currently looking at the value " << top << "\n";

        for (SetIter sIter = beginSets; sIter != endSets; ++sIter) {
            auto& [begin, end] = *sIter;

            begin = std::lower_bound(begin, end, top);
            if (begin == end) {
                return output;
            }
            else if (*begin == top) {
                ++count;
                ++begin;
                if (begin != end) {
                    queue.push(*begin);
                }
            }
        }

        if (count == numSets) {
            *output = top;
            ++output;
        }
    }

    return output;  // TODO: I don't think that this is reachable.
}

template <typename Value>
using MinPriorityQueue = std::priority_queue<Value,
                                             std::vector<Value>,
                                             std::greater<Value>>;

template <typename SetIter, typename OutputIter, typename PriorityQueue>
OutputIter intersection(SetIter beginSets, SetIter endSets, OutputIter output)
{
    using Value = decltype(*beginSets->first);
    MinPriorityQueue<Value> queue;
    
    return intersection(beginSets, endSets, output, queue);
}



#endif

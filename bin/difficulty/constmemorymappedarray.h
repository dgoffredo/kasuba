#ifndef INCLUDED_CONSTMEMORYMAPPEDARRAY
#define INCLUDED_CONSTMEMORYMAPPEDARRAY

#include <memory>
#include <system_error>

#include <fcntl.h>      // open
#include <sys/mman.h>   // mmap, munmap
#include <sys/stat.h>   // open
#include <sys/types.h>  // open
#include <unistd.h>     // close

struct File {
    const int descriptor;

    File(const char* path, int flags)
    : descriptor(::open(path, flags)) {
        if (descriptor == -1) {
            throw std::system_error(
                std::error_code(errno, std::system_category()),
                "Unable to open file.");
        }
    }

    ~File() {
        ::close(descriptor);
    }
};

template <typename Array>
class ConstMemoryMappedArray {
    struct Unmap {
        void operator()(const void* storage) {
            ::munmap(const_cast<void*>(storage), sizeof(Array));
        }
    };

    using Pointer = std::unique_ptr<const Array, Unmap>;

    File    file;
    Pointer data;

  public:
    explicit ConstMemoryMappedArray(const char* path)
    : file(path, O_RDONLY) {
        const int   offset = 0;
        const void* ptr    = ::mmap(0,
                                    sizeof(Array),
                                    PROT_READ,
                                    MAP_PRIVATE,
                                    file.descriptor,
                                    offset);

        if (ptr == MAP_FAILED) {
            throw std::system_error(
                std::error_code(errno, std::system_category()),
                "Unable to map file to memory.");
        }

        data.reset(static_cast<const Array*>(ptr));
    }

    auto operator[](const int index) const {
        return (*data)[index];
    }

    operator const Array&() const {
        return *data;
    }
};

#endif

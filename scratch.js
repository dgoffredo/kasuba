
const multiply = (A, B) => 
    Rotation([
        A(0, 0) * B(0, 0) + A(0, 1) * B(1, 0) + A(0, 2) * B(2, 0),  // 0, 0
        A(0, 0) * B(0, 1) + A(0, 1) * B(1, 1) + A(0, 2) * B(2, 1),  // 0, 1
        A(0, 0) * B(0, 2) + A(0, 1) * B(1, 2) + A(0, 2) * B(2, 2),  // 0, 2
     
        A(1, 0) * B(0, 0) + A(1, 1) * B(1, 0) + A(1, 2) * B(2, 0),  // 1, 0
        A(1, 0) * B(0, 1) + A(1, 1) * B(1, 1) + A(1, 2) * B(2, 1),  // 1, 1
        A(1, 0) * B(0, 2) + A(1, 1) * B(1, 2) + A(1, 2) * B(2, 2),  // 1, 2
     
        A(2, 0) * B(0, 0) + A(2, 1) * B(1, 0) + A(2, 2) * B(2, 0),  // 2, 0
        A(2, 0) * B(0, 1) + A(2, 1) * B(1, 1) + A(2, 2) * B(2, 1),  // 2, 1
        A(2, 0) * B(0, 2) + A(2, 1) * B(1, 2) + A(2, 2) * B(2, 2)   // 2, 2
    ]);

const Rotation = (values) => {
    const n = 3;

    if (values === undefined) {
        values = (new Array(n * n)).fill(0);
    }

    // The function returned is a getter.  We will add a property to it, "set",
    // that is the setter.
    const result = (i, j) => values[i * n + j];  // row-major

    result.set = (i, j, value) => values[i * n + j] = value;
    result.n = n;
    result.toString = () => {
        const result = [];
        for (let i = 0; i < n; ++i) {
            const row = [];
            result.push(row);
            for (let j = 0; j < n; ++j) {
                row.push(result(i, j));
            }
        }
        return result;
    };

    return result;
};

Rotation.identity = (() => {
    const result = Rotation();
    for (let i = 0; i < result.n; ++i) {
        result.set(i, i, 1);
    }
    return result;
})();

r = Rotation();
r.set(1, 2, 34);
console.log(r(1, 2));
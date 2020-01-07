// `Matrix` is not a class.  It's a namespace for functions.
// According to these functions, a matrix is an array of rows, where each row
// is an array of values.
// You can, however, use `Matrix` as a function.  It simply returns its first
// argument.
//   
define('geometry/matrix', function () {

function numRows(matrix) {
    return matrix.length;
}

function numColumns(matrix) {
    return matrix[0].length;
}

function multiply(left, right) {
    const leftNumRows  = numRows(left),
          leftNumCols  = numColumns(left),
          rightNumRows = numRows(right),
          rightNumCols = numColumns(right);

    if (leftNumCols !== rightNumRows) {
        throw Error(
            `Cannot multiply a ${leftNumRows}x${leftNumCols} matrix by a ` +
            `${rightNumRows}x${rightNumCols} matrix, because the inner ` +
            `dimensions are not the same, i.e. ${leftNumCols} != ` +
            `${rightNumRows}.  The left matrix must have as many columns as ` +
            `the right matrix has rows.`);
    }

    const innerLength    = leftNumCols,
          product        = [],
          productNumRows = leftNumRows,
          productNumCols = rightNumCols;

    for (let i = 0; i < productNumRows; ++i) {
        const row = [];
        for (let j = 0; j < productNumCols; ++j) {
            let value = 0;
            for (let k = 0; k < innerLength; ++k) {
                value += left[i][k] * right[k][j];
            }
            row.push(value);
        }
        product.push(row);
    }

    return product;
}

function toString(matrix) {
    return `\n${matrix.map(row => row.join('\t')).join('\n')}\n`;
}

function map(matrix, func) {
    return matrix.map(row => row.map(func));
}

function result(matrix) {
    return matrix;  // in case somebody uses this module as a function
}

return Object.assign(result, {multiply, numRows, numColumns, map, toString});

});

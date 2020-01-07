// This module catalogs all of the "planes" in the cube.  It's used by the
// cube to highlight planes and to determine when there is a number duplicated
// within a plane.
//
define('geometry/planes', function () {

const transitions =
/*
plane           up              down            left            right
-----           --              ----            ----            -----  */`
depth=0         row=0           row=2           column=0        column=2
depth=1         row=1           row=1           column=1        column=1
depth=2         row=2           row=0           column=2        column=0
row=2           depth=0         depth=2         row=2           row=2
row=1           depth=1         depth=1         row=1           row=1
row=0           depth=2         depth=0         row=0           row=0
column=0        column=0        column=0        depth=2         depth=0
column=1        column=1        column=1        depth=1         depth=1
column=2        column=2        column=2        depth=0         depth=2
row=column      column=2-depth  column=depth    row=2-depth     row=depth
row=depth       row=2-depth     row=2-depth     row=column      row=2-column
column=depth    row=column      row=2-column    column=2-depth  column=2-depth    
row=2-column    column=depth    column=2-depth  row=depth       row=2-depth
row=2-depth     row=depth       row=depth       row=2-column    row=column
column=2-depth  row=2-column    row=column      column=depth    column=depth

`.split('\n')
 .filter(line => line.length !== 0)
 .map(line => line.split(/\s+/))
 .reduce((result, [plane, up, down, left, right]) => {
     result[plane] = {up, down, left, right};
     return result;
 }, {});

const predicates = {
    "depth=0":        ({depth})          => depth  === 0,
    "depth=1":        ({depth})          => depth  === 1,
    "depth=2":        ({depth})          => depth  === 2,
    "row=2":          ({row})            => row    === 2,
    "row=1":          ({row})            => row    === 1,
    "row=0":          ({row})            => row    === 0,
    "column=0":       ({column})         => column === 0,  
    "column=1":       ({column})         => column === 1,  
    "column=2":       ({column})         => column === 2,  
    "row=2-column":   ({row,    column}) => row    === 2 - column,
    "row=depth":      ({row,    depth})  => row    === depth,    
    "column=depth":   ({column, depth})  => column === depth,
    "row=2-column":   ({row,    column}) => row    === 2 - column,
    "row=2-depth":    ({row,    depth})  => row    === 2 - depth,
    "column=2-depth": ({column, depth})  => column === 2 - depth
}

const required = [
    "depth=0",  "depth=1",  "depth=2",
    "row=2",    "row=1",    "row=0",
    "column=0", "column=1", "column=2",
    "row=2-column",
    "row=depth",
    "column=depth"
];

return {transitions, predicates, required};

});


function isUndefined(value) {
    return value === undefined;
}

function requireArguments(byName) {
    const missing =
        Object.entries(byName)
              .filter(function ([name, value]) { value === undefined; })
              .map(function ([name, value]) { return name; });

    if (missing.length > 0) {
        const plurality = missing.length === 1 ? '' : 's';
        throw new Error(`missing required argument key${plurality}: ${name}`);
    }
}

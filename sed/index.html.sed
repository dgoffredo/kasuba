# This sed script replaces certain HTML tags with inline CSS, JS, and SVG.

/<link href="styles\/main.css" rel="stylesheet"\/>/ {
    s/.*/<style>/
    r styles/main.css
    a </style>
}

/<script src="dist\/kasuba.browser.js"><\/script>/ {
    s/.*/<script>/
    r dist/kasuba.browser.js
    a </script>
}

/<img src="assets\/back.svg"\/>/ {
    s/.*//
    r assets/back.svg
}

/<img src="assets\/close.svg"\/>/ {
    s/.*//
    r assets/close.svg
}
// Modern systems have fonts that will display Unicode emoji characters.
// However, fonts differ in which emoji characters are supported.
// The `menu/survey` module uses smiley faces to indicate puzzle difficulty
// (e.g. a bored face for easy, and a frustrated face for hard).  A couple of
// those emoji characters are relatively new, and so don't show on all systems
// (as of this writing, only Windows supports them).  So, `GlyphDetector` uses
// a canvas and some heuristics to determine whether a specified character can
// be rendered.  If not, the calling code might choose a fallback image.
//
//     const renderable = GlyphDetector();
//
//     if (!renderable('☹️')) {
//         // fallback image...
//     }
//
// Note that each instance of `GlyphDetector` contains a canvas, so it's best
// to instantiate only one instance and to reuse it.
//
// Why bother with this?  Just use the fallback images all the time, right?
// No!  The truth is, I really like the Windows font, but it is NOT FOR SALE.
// So, by doing this, at least the ones I like will be visible on Windows.
// Elsewhere, some freely available SVGs in `assets/` are used instead.  That
// is, basically everywhere.
//
define('graphics/glyphdetector', function () {

// Thanks to Dan Hromada for the idea of how to detect whether a unicode code
// point has a glyph in the current font (googled it and found the following):
//
// - https://twitter.com/junkycoder/status/1004437717344768001?s=20
// - https://codepen.io/anon/pen/BVLymZ

function GlyphDetector() {
// U+FFFF is "not a character," while U+FFFD is "replacement character."  I was
// surprised to find that when the browser on my Android phone encountered an
// emoji for which it had no glyph, the rendered character was not U+FFFD, but
// instead whatever is rendered when nonsense (like U+FFFF) is encountered.
// So, I compare the rendered glyph with both U+FFFF and U+FFFD, and if it's
// the same as either, I consider the code point "unavailable."
// https://en.wikipedia.org/wiki/Specials_(Unicode_block)
const nonsenseCodePoint = '\uFFFF',
      unknownCodePoint  = '\uFFFD';

const canvas           = document.createElement('canvas'),
      renderingContext = canvas.getContext('2d');

canvas.width = canvas.height = 16;

renderingContext.textAlign    = 'center';
renderingContext.textBaseline = 'middle';

function imageData(string) {
    renderingContext.clearRect(0, 0, canvas.width, canvas.height);
    renderingContext.fillText(string, 8, 8);
    return renderingContext.getImageData(0, 0, 16, 16).data.join(':');
}

function similarity(left, right) {
    // Return how similar the specified sequences are.  The returned value is
    // a number between zero and one, where zero (0) indicates that `left` and
    // `right` are value-for-value dissimilar, and one (1) indicates that
    // `left` and `right` are identical.
    //
    // The reason I check this fuzzy notion of similarity rather than just
    // comparing the image data outright is that on Firefox, an "unknown" glyph
    // is rendered with its code point hexidecimal value inside of a little
    // box.  That means that all "I can't render this" glyphs on Firefox are
    // slightly different from each other.  So, I consider a glyph unrenderable
    // if it's sufficiently similar (but not necessarily identical) to one of
    // the "nonsense" or "unknown" code points.

    const short = Math.min(left.length, right.length),
          long  = Math.max(left.length, right.length);

    let sameCount = 0;
    for (let i = 0; i < short; ++i) {
        if (left[i] === right[i]) {
            ++sameCount;
        }
    }

    return sameCount / long;
}

const nonsense = imageData(nonsenseCodePoint),
      unknown  = imageData(unknownCodePoint);

// how similar glyphs have to be to "match" each other.  Somewhat arbitrary.
const threshold = 0.3;

// `stringToCheck` is expected to be something that would render as a single
// character, like 'f' or '҉'.  It might be multiple code points (e.g. a base
// character with combining characters), but it still needs to be logically one
// "letter."
// https://en.wikipedia.org/wiki/Combining_character
return function isSupported (stringToCheck) {
    const data = imageData(stringToCheck);

    return similarity(data, nonsense) < threshold &&
           similarity(data, unknown) < threshold;
};

}

return GlyphDetector;
});

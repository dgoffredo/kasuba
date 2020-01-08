![Kasuba](favicon/android-chrome-192x192.png)

Kasuba
======
It's a Sudoku-like game in three dimensions.  Play it [here][1].

Why
---
I came up with the idea in high school (or somebody else did and I stole it).
Then I made a [Windows Phone version][2] years ago, but never released it.

Looking for a side project and to sharpen by web skills, I decided to redo the
idea, this time as a [progressive web app][3].

What
----
Kasuba is a static one-page web app that implements a Sudoku-like game using
HTML5 canvas.

In Sudoku, you need the numbers `1` through `9` exactly once in:

- each row of nine boxes,
- each column of nine boxes,
- and each of nine particular `3x3` squares.

Similarly, in Kasuba, you need the numbers `1` through `9` exactly once in:

- each of the three `3x3` horizontal planes on the bottom, middle, and top,
- each of the three `3x3` vertical planes on the left, middle, and right,
- each of the three `3x3` vertical planes on the front, middle, and back,
- and each of three particular `3x3` diagonal planes.

You tap a cell in order to pick which number to put in it.  You can swipe the
cube in order to flip it around to see it from other sides.  As a visual aid,
you can select a plane to be highlighted.

How
---
The app is currently hosted at [https://kasuba.app][1] (the "https" part is
required on some browsers).  You can "add to home screen" or similar for a
native-like experience.

### Build
Running `make` will produce `index.html` (the default target).  A web server
can then be run with the repository as the root.  There's a Python web server
included at [bin/server.py][4] that will run `make` every time the website is
fetched, and also includes response headers to disable caching.  This is
helpful during development.

There's more in this repository than what is strictly needed to host the
website.  So, there's another `make` target, `release.tar.gz`, that produces
a gzipped tarball containing only the files needed to run the website.  When
I'm ready to produce a new release, I run `make release.tar.gz`, then `scp`
that file onto my server, untar it, move and rename it appropriately, *et
voila!*

### Contributing
Do what you want.  The [license][5] is as permissive as they come.  So long as
you don't claim that this is yours (it's not, it's mine), then you can do with
this what you want.  Pull requests welcome.

More
----
### `stage.js`, The Canvas Library
Using [canvas][6] directly would have been a pain in the ass.  So, the first
thing I did was try out some canvas libraries.  [Phaser][7] was promising, but
I noticed that even when there was nothing going on, Phaser would be running
the GPU.  There was an extension to prevent this (giving you the ability to
start and stop all rendering at will), but the extension only worked with
version 2 of Phaser, whereas I wanted to use version 3.  It seemed like one of
those things where you could choose between the dead, unsupported version, or
the new, experimental, unsupported version.

I took a liking to [stage.js][8] as a quite small alternative.  Its author has
some example apps [here][9].

That's the library I ended up going with.  Because of its simplicitly, though,
some things are a headache in the code.

- There's no `z`-coordinate (depth), so I have to reparent elements in a new
  order whenever I want them to render in a new order (to occlude each other
  differently).
- There's no good way to plug a touch gestures library, like [hammer.js][10],
  into the app, and so I had to implement my own gestures.
- Rendering is slow as hell on Firefox for Android.  I haven't determined yet
  whether this is an issue with my usage, with `stage.js`, or with Firefox.
- The library's build system is allegedly out of date.  After pulling out
  several chunks of my hair, I decided to strip out the build system and
  replace it with a simple makefile that makes the appropriate calls to
  [browserify][11].

All together, `stage.js` has been a pleasure to work with.  I recommend you get
familiar with it before trying to grok this code.

[1]: https://kasuba.app
[2]: https://github.com/dgoffredo/cuboku
[3]: https://github.com/dgoffredo/cuboku
[4]: bin/server.py
[5]: LICENSE.md
[6]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
[7]: http://phaser.io
[8]: https://github.com/shakiba/stage.js/
[9]: http://piqnt.com/stage.js/
[10]: https://hammerjs.github.io
[11]: http://browserify.org
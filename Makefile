# SOURCES need not be in any particular order.  A module loader is used to
# order dependencies.
SOURCES = \
canvas-confetti/dist/confetti.browser.js \
stage.js/dist/stage.web.js \
taml/taml.js \
$(shell find kasuba/ -type f -name '*.js')

index.html: dist/kasuba.browser.js \
            index.template.html \
			sed/index.html.sed \
			styles/main.css \
			assets/back.svg \
			assets/close.svg
	sed -f sed/index.html.sed index.template.html > $@

dist/kasuba.browser.js: $(SOURCES)
	mkdir -p dist
	echo >dist/kasuba.browser.js
	for script in $(SOURCES); do bin/wrap-script $$script >> $@; done

# "Release mode" produces a tarball containing only the files necessary to
# serve the static website.  The idea is to minimize the space required.
RELEASE = \
index.html \
browserconfig.xml \
site.webmanifest \
favicon.ico \
$(shell find favicon -type f) \
assets/1f971.svg \
assets/1f616.svg \
assets/1f623.svg \
assets/1f92f.svg \
assets/1f914.svg \
assets/1f928.svg \
assets/tada.wav \
assets/textures.png

release.tar.gz: $(RELEASE)
	rm -rf release 2>/dev/null || exit 0
	mkdir -p release/assets
	mkdir -p release/favicon
	for f in $(RELEASE); do cp $$f release/$$f; done
	tar -c -a -f release.tar.gz release
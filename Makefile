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

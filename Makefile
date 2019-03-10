all: regpacked.js

minified.js: index.js
	@sed /DEBUG/d $< | \
	npx --quiet terser \
		--mangle toplevel \
		--compress booleans_as_integers,drop_console,ecma=6,passes=3,pure_getters,toplevel,unsafe,unsafe_math \
	> $@

regpacked.js: minified.js
	@npx --quiet regpack $< \
		--crushGainFactor 1 \
		--crushLengthFactor 0 \
		--crushCopiesFactor 0 \
		--withMath 0 \
		--contextVariableName c \
		--hash2DContext 1 \
		--wrapInSetInterval 1 \
	> $@

clean:
	@rm minified.js regpacked.js

all: min.js

min.js: index.js
	@npx --quiet terser $< \
		--mangle toplevel \
		--compress toplevel,passes=3,unsafe,pure_getters \
	| npx --quiet regpack - \
		--crushGainFactor 2 \
		--crushLengthFactor 1 \
		--crushCopiesFactor 0 \
		--withMath 0 \
		--contextVariableName c \
		--hash2DContext 1 \
		> $@

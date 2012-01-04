NODE_ENGINE ?= `which node nodejs`
NPM_ENGINE ?= `which npm`
DOCCO=docco

DIST_DIR=dist

SRC_FILES=$(shell find src -type f -name '*.js' | xargs -L 1 basename)
SRC_DIRS=$(shell find src -type f -name '*.js' | tr ' ' '\n' | xargs -L 1 dirname | uniq)
DOC_FILES=$(patsubst %.js, docs/%.html, $(SRC_FILES))

VPATH=$(SRC_DIRS)

all: build

setup: | $(DIST_DIR)
	@@if test ! -z ${NODE_ENGINE}; then \
		if test ! -z ${NPM_ENGINE}; then \
			npm install; \
		else \
			echo "You must have NPM installed in order to build Bump"; \
		fi \
	else \
		echo "You must have NodeJS installed in order to build Bump"; \
	fi

build: | $(DIST_DIR)
	@jake

docs: $(DOC_FILES)

docs/%.html: %.js
	@$(DOCCO) "$<"

clean:
	rm -rf dist docs node_modules

$(DIST_DIR):
	mkdir -p $(DIST_DIR)

.PHONY: all setup build docs clean

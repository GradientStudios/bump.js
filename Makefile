NODE_ENGINE ?= `which node nodejs`
NPM_ENGINE ?= `which npm`
DOCCO=docco

DIST_DIR=dist
DOCS_DIR=docs

SRC_FILES=$(shell find src -type f -name '*.js' | xargs -L 1 basename)
SRC_DIRS=$(shell find src -type f -name '*.js' | tr ' ' '\n' | xargs -L 1 dirname | uniq)
DOC_FILES=$(patsubst %.js, $(DOCS_DIR)/%.html, $(SRC_FILES))

BUILD_JSON=build.json
BUILD_FILES=$(shell perl -0777 -lape '/"src"\s*:\s*\[([^\]]*)\]/; $$_ = $$1; s/\s*"\s*//g; s/,/\n/g' $(BUILD_JSON))

VPATH=$(SRC_DIRS)

UGLIFY=node_modules/uglify-js/bin/uglifyjs
MINIFIED_PATH=bump.min.js

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

node_modules/uglify-js/bin/uglifyjs:
	npm install uglify-js

minified: $(DIST_DIR)/$(MINIFIED_PATH)

docs: $(DOC_FILES)

clean:
	rm -rf dist docs node_modules

$(DIST_DIR)/$(MINIFIED_PATH): $(BUILD_FILES) | $(DIST_DIR) $(UGLIFY)
	@echo 'Uglifying to $(DIST_DIR)/$(MINIFIED_PATH)…'
	@cat $(BUILD_FILES) | $(UGLIFY) -o $(DIST_DIR)/$(MINIFIED_PATH)

$(DIST_DIR):
	mkdir -p $(DIST_DIR)

$(DOCS_DIR)/%.html: %.js
	@$(DOCCO) "$<"

.PHONY: all setup build docs clean minified

NODE_ENGINE ?= `which node nodejs`
NPM_ENGINE ?= `which npm`
DOCCO ?= `which docco`

all: build

setup:
	mkdir -p dist
	@@if test ! -z ${NODE_ENGINE}; then \
		if test ! -z ${NPM_ENGINE}; then \
			npm install; \
		else \
			echo "You must have NPM installed in order to build Bump"; \
		fi \
	else \
		echo "You must have NodeJS installed in order to build Bump"; \
	fi

build:
	@@jake
	@@if test ! -z ${DOCCO}; then find src -name "*.js" | xargs ${DOCCO}; fi;

.PHONY: all setup build

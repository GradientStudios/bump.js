LOCAL_NODE_MODULES=node_modules
LOCAL_NODE_BIN=$(LOCAL_NODE_MODULES)/.bin
GRUNT=$(LOCAL_NODE_BIN)/grunt
GRUNT_PATH=$(LOCAL_NODE_MODULES)/grunt
GRUNT_OPTS=

GRUNT_UGLIFY_VERSION=$(shell npm ls | grep uglify-js | awk -F"@" '{print $$2}')
REQUIRED_UGLIFY_VERSION=1.2.6

all: setup build

$(LOCAL_NODE_MODULES):
	npm install

setup: | $(LOCAL_NODE_MODULES)
	$(if $(filter-out $(GRUNT_UGLIFY_VERSION),$(REQUIRED_UGLIFY_VERSION)), @cd $(GRUNT_PATH); npm install uglify-js@$(REQUIRED_UGLIFY_VERSION))

build: | setup
	@$(GRUNT) $(GRUNT_OPTS)

.PHONY: all setup build

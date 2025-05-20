export PATH := $(HOME)/.local/share/mise/shims:$(PATH)
# export MISE_TRUSTED_CONFIG_PATHS := $(CURDIR)

.PHONY: help
# Show this help
help:
	@echo "Available commands:"
	@awk '/^#/{c=substr($$0,3);next}c&&/^[[:alpha:]][[:alnum:]_-]+:/{print substr($$1,1,index($$1,":")),c}1{c=0}' $(MAKEFILE_LIST) \
	| column -s: -t \
	| xargs -I{} printf "  {}\n"

.PHONY: setenv
# Setup dev environment
setenv:
	command -v mise || curl https://mise.run | sh
	mise trust --all
	mise install
	bun install

.PHONY: dev
# Start up dev instance
dev:
	bun dev

.PHONY: clean
# Clean
clean:
	rm -rf node_modules

.PHONY: format
# Format
format:
	bun format

.PHONY: lint
# Lint
lint:
	bun lint

.PHONY: test
# Test
test:
	bun test

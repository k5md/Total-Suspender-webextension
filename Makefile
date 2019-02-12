install:
	npm install

build:
	rm -rf dist
	npm run build

lint:
	npx eslint .

test:
	npm test
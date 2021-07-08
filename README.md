
$ mkdir sveltekit
$ docker run --rm -it -v $(pwd)/website:/mydir -w /mydir -u $(id -u):$(id -g) node:14.17.0-alpine3.13 sh -c "npm init svelte@next app"

$ npm install -g firebase-tools
$ firebase init
select only emulator and hosting
do some change on the website
preview:
$ docker-compose run app sh -c "npm run preview"
build the static files (see svelte.config.js > import adapter from '@sveltejs/adapter-static')
$ docker-compose run app sh -c "npm run build"
deploy a staging environment to share with some people
$ firebase hosting:channel:deploy preview_name
deploy on production
$ firebase deploy --only hosting

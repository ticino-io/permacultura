
$ mkdir sveltekit
$ docker run --rm -it -v $(pwd)/website:/mydir -w /mydir -u $(id -u):$(id -g) node:14.17.0-alpine3.13 sh -c "npm init svelte@next app"

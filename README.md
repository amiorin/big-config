# vite-react

An example react project including tests with vite(st) + react + squint + caddy.
There is only one URL: [http://localhost](https://localhost). TLS is provided automatically by Caddy.

## Requirements
- [asdf](https://asdf-vm.com/)
- [caddy](https://caddyserver.com/)
- [bun](https://bun.com/)
- [babashka](https://babashka.org/)

## Usage
To run this example, `bb install` and then one of the following [babashka tasks](bb.edn):

### Development server
```bash
bb dev
```

This will start `squint watch`, `vite dev server`, and `caddy`.

### Tests watch
```bash
bb test:watch
```

This will start `squint watch` on tests and `vitest test watcher`.

### Build
```bash
# build
bb build

# build and serve
bb build:caddy
```

This will generate a production ready build in `dist`.

var squint_core = await import('squint-cljs/core.js');
globalThis.index = globalThis.index || {};
var MyComponent = await import('./my_component.jsx');
var { createRoot } = (await import ('react-dom/client'));
globalThis.index.createRoot = createRoot;
await import('./style.css');
globalThis.index.MyComponent = MyComponent;
var root = globalThis.index.createRoot(document.getElementById("app"));
globalThis.index.root = root;
globalThis.index.root.render(<globalThis.index.MyComponent.MyComponent></globalThis.index.MyComponent.MyComponent>);

export { root }

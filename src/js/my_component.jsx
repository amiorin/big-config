var squint_core = await import('squint-cljs/core.js');
globalThis.my_component = globalThis.my_component || {};
var { useState } = (await import ('react'));
globalThis.my_component.useState = useState;
if ((typeof my_component !== 'undefined') && (typeof my_component.x !== 'undefined')) {
} else {
var x = 10;
globalThis.my_component.x = x;
};
var MyComponent = function () {
const vec__14 = globalThis.my_component.useState(5);
const state5 = squint_core.nth(vec__14, 0, null);
const setState6 = squint_core.nth(vec__14, 1, null);
return <div>You clicked {state5} times<button onClick={(function () {
globalThis.my_component.x = (globalThis.my_component.x + 1);
return setState6((state5 + 1));

})}>Click me</button></div>;

};
globalThis.my_component.MyComponent = MyComponent;

export { MyComponent }

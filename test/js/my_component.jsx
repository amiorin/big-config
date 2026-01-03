import * as squint_core from 'squint-cljs/core.js';
import { useState } from 'react';
var x = 10;
var MyComponent = function () {
const vec__14 = useState(3);
const state5 = squint_core.nth(vec__14, 0, null);
const setState6 = squint_core.nth(vec__14, 1, null);
return <div>You clicked {state5} times<button onClick={(function () {
x = (x + 1);
return setState6((state5 + 1));

})}>Click me</button></div>;

};

export { MyComponent }

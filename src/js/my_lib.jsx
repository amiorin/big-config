var squint_core = await import('squint-cljs/core.js');
globalThis.my_lib = globalThis.my_lib || {};
var adder = function (x, y, z) {
return (x + y + z);

};
globalThis.my_lib.adder = adder;

export { adder }

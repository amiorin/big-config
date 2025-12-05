// node_modules/squint-cljs/src/squint/core.js
function println(...args) {
  console.log(...args);
}
function seqable_QMARK_(x) {
  return x === null || x === undefined || !!x[Symbol.iterator];
}
function iterable(x) {
  if (x === null || x === undefined) {
    return [];
  }
  if (seqable_QMARK_(x)) {
    return x;
  }
  if (x instanceof Object)
    return Object.entries(x);
  throw new TypeError(`${x} is not iterable`);
}
var IIterable = Symbol("Iterable");
var tolr = false;
class LazyIterable {
  constructor(gen) {
    this.gen = gen;
    this.usages = 0;
  }
  [Symbol.iterator]() {
    this.usages++;
    if (this.usages >= 2 && tolr) {
      try {
        throw new Error;
      } catch (e) {
        console.warn("Re-use of lazy value", e.stack);
      }
    }
    return this.gen();
  }
}
LazyIterable.prototype[IIterable] = true;
function lazy(f) {
  return new LazyIterable(f);
}
var IApply__apply = Symbol("IApply__apply");
function concat1(colls) {
  return lazy(function* () {
    for (const coll of colls) {
      yield* iterable(coll);
    }
  });
}
function concat(...colls) {
  return concat1(colls);
}
concat[IApply__apply] = (colls) => {
  return concat1(colls);
};
var _metaSym = Symbol("meta");

// src/js/core.mjs
println("core");

// src/js/main.mjs
println("main2");

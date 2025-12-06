// node_modules/squint-cljs/src/squint/core.js
var has = Object.prototype.hasOwnProperty;
function findKey(iter, tar, key) {
  for (key of iter.keys()) {
    if (dequal(key, tar))
      return key;
  }
}
function dequal(foo, bar) {
  if (foo === bar)
    return true;
  var ctor, len, tmp;
  if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
    if (ctor === Array) {
      if ((len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len]))
          ;
      }
      return len === -1;
    }
    if (ctor === Set) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (const elt of foo) {
        tmp = elt;
        if (tmp && typeof tmp === "object") {
          tmp = findKey(bar, tmp);
          if (!tmp)
            return false;
        }
        if (!bar.has(tmp))
          return false;
      }
      return true;
    }
    if (ctor === Map) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (const kv of foo) {
        tmp = kv[0];
        if (tmp && typeof tmp === "object") {
          tmp = findKey(bar, tmp);
          if (!tmp)
            return false;
        }
        if (!dequal(kv[1], bar.get(tmp))) {
          return false;
        }
      }
      return true;
    }
    if (!ctor || typeof foo === "object") {
      len = 0;
      for (const k in foo) {
        if (has.call(foo, k) && ++len && !has.call(bar, k))
          return false;
        if (!(k in bar) || !dequal(foo[k], bar[k]))
          return false;
      }
      return Object.keys(bar).length === len;
    }
  }
  return false;
}
function walkArray(arr, comp) {
  return arr.every(function(x, i) {
    return i === 0 || comp(arr[i - 1], x);
  });
}
function _EQ_(...xs) {
  return walkArray(xs, (x, y) => dequal(x, y));
}
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
function truth_(x) {
  return x != null && x !== false;
}
var _metaSym = Symbol("meta");

// src/js/core.mjs
println("core");

// src/js/app.mjs
println("app-f");
var refresh_app_js = function(el, uid) {
  if (truth_((() => {
    const and__23248__auto__1 = el;
    if (truth_(and__23248__auto__1)) {
      return !_EQ_(window.last_app_js_uid, uid);
    } else {
      return and__23248__auto__1;
    }
  })())) {
    const script_content2 = el.textContent;
    const new_script3 = document.createElement("script");
    for (let G__4 of iterable(el.attributes)) {
      const attr5 = G__4;
      new_script3.setAttribute(attr5.name, attr5.value);
    }
    new_script3.textContent = script_content2;
    const parent_node6 = el.parentNode;
    if (truth_(parent_node6)) {
      parent_node6.removeChild(el);
      parent_node6.appendChild(new_script3);
    }
    return window.last_app_js_uid = uid;
  }
};
window.refresh_app_js = refresh_app_js;
export {
  refresh_app_js
};

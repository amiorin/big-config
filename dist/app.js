var ai = { exports: {} }, ge = {};
var d1;
function Jd() {
  if (d1) return ge;
  d1 = 1;
  var _ = /* @__PURE__ */ Symbol.for("react.transitional.element"), vl = /* @__PURE__ */ Symbol.for("react.fragment");
  function W(o, yl, sl) {
    var El = null;
    if (sl !== void 0 && (El = "" + sl), yl.key !== void 0 && (El = "" + yl.key), "key" in yl) {
      sl = {};
      for (var pl in yl)
        pl !== "key" && (sl[pl] = yl[pl]);
    } else sl = yl;
    return yl = sl.ref, {
      $$typeof: _,
      type: o,
      key: El,
      ref: yl !== void 0 ? yl : null,
      props: sl
    };
  }
  return ge.Fragment = vl, ge.jsx = W, ge.jsxs = W, ge;
}
var s1;
function wd() {
  return s1 || (s1 = 1, ai.exports = Jd()), ai.exports;
}
var vi = wd();
function h1(_, vl, W) {
  if (_) {
    var o = void 0;
    if (Array.isArray(_))
      o = _[vl];
    else {
      const yl = $d(_);
      let sl = 0;
      for (const El of yl)
        if (sl++ == vl) {
          o = El;
          break;
        }
    }
    if (o !== void 0)
      return o;
  }
  return W;
}
function Wd(_) {
  return _ == null || // we used to check instanceof Object but this returns false for TC39 Records
  // also we used to write `Symbol.iterator in` but this does not work for strings and some other types
  !!_[Symbol.iterator];
}
function $d(_) {
  if (_ == null)
    return [];
  if (Wd(_))
    return _;
  if (_ instanceof Object) return Object.entries(_);
  throw new TypeError(`${_} is not iterable`);
}
var ei = { exports: {} }, C = {};
var o1;
function Fd() {
  if (o1) return C;
  o1 = 1;
  var _ = /* @__PURE__ */ Symbol.for("react.transitional.element"), vl = /* @__PURE__ */ Symbol.for("react.portal"), W = /* @__PURE__ */ Symbol.for("react.fragment"), o = /* @__PURE__ */ Symbol.for("react.strict_mode"), yl = /* @__PURE__ */ Symbol.for("react.profiler"), sl = /* @__PURE__ */ Symbol.for("react.consumer"), El = /* @__PURE__ */ Symbol.for("react.context"), pl = /* @__PURE__ */ Symbol.for("react.forward_ref"), N = /* @__PURE__ */ Symbol.for("react.suspense"), A = /* @__PURE__ */ Symbol.for("react.memo"), $ = /* @__PURE__ */ Symbol.for("react.lazy"), p = /* @__PURE__ */ Symbol.for("react.activity"), cl = Symbol.iterator;
  function wl(y) {
    return y === null || typeof y != "object" ? null : (y = cl && y[cl] || y["@@iterator"], typeof y == "function" ? y : null);
  }
  var Bl = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, ql = Object.assign, Ut = {};
  function Wl(y, E, M) {
    this.props = y, this.context = E, this.refs = Ut, this.updater = M || Bl;
  }
  Wl.prototype.isReactComponent = {}, Wl.prototype.setState = function(y, E) {
    if (typeof y != "object" && typeof y != "function" && y != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, y, E, "setState");
  }, Wl.prototype.forceUpdate = function(y) {
    this.updater.enqueueForceUpdate(this, y, "forceUpdate");
  };
  function wt() {
  }
  wt.prototype = Wl.prototype;
  function Nl(y, E, M) {
    this.props = y, this.context = E, this.refs = Ut, this.updater = M || Bl;
  }
  var nt = Nl.prototype = new wt();
  nt.constructor = Nl, ql(nt, Wl.prototype), nt.isPureReactComponent = !0;
  var Tt = Array.isArray;
  function Gl() {
  }
  var x = { H: null, A: null, T: null, S: null }, Ql = Object.prototype.hasOwnProperty;
  function Et(y, E, M) {
    var U = M.ref;
    return {
      $$typeof: _,
      type: y,
      key: E,
      ref: U !== void 0 ? U : null,
      props: M
    };
  }
  function Xu(y, E) {
    return Et(y.type, E, y.props);
  }
  function At(y) {
    return typeof y == "object" && y !== null && y.$$typeof === _;
  }
  function Xl(y) {
    var E = { "=": "=0", ":": "=2" };
    return "$" + y.replace(/[=:]/g, function(M) {
      return E[M];
    });
  }
  var zu = /\/+/g;
  function rt(y, E) {
    return typeof y == "object" && y !== null && y.key != null ? Xl("" + y.key) : E.toString(36);
  }
  function St(y) {
    switch (y.status) {
      case "fulfilled":
        return y.value;
      case "rejected":
        throw y.reason;
      default:
        switch (typeof y.status == "string" ? y.then(Gl, Gl) : (y.status = "pending", y.then(
          function(E) {
            y.status === "pending" && (y.status = "fulfilled", y.value = E);
          },
          function(E) {
            y.status === "pending" && (y.status = "rejected", y.reason = E);
          }
        )), y.status) {
          case "fulfilled":
            return y.value;
          case "rejected":
            throw y.reason;
        }
    }
    throw y;
  }
  function b(y, E, M, U, Y) {
    var Q = typeof y;
    (Q === "undefined" || Q === "boolean") && (y = null);
    var F = !1;
    if (y === null) F = !0;
    else
      switch (Q) {
        case "bigint":
        case "string":
        case "number":
          F = !0;
          break;
        case "object":
          switch (y.$$typeof) {
            case _:
            case vl:
              F = !0;
              break;
            case $:
              return F = y._init, b(
                F(y._payload),
                E,
                M,
                U,
                Y
              );
          }
      }
    if (F)
      return Y = Y(y), F = U === "" ? "." + rt(y, 0) : U, Tt(Y) ? (M = "", F != null && (M = F.replace(zu, "$&/") + "/"), b(Y, E, M, "", function(Oa) {
        return Oa;
      })) : Y != null && (At(Y) && (Y = Xu(
        Y,
        M + (Y.key == null || y && y.key === Y.key ? "" : ("" + Y.key).replace(
          zu,
          "$&/"
        ) + "/") + F
      )), E.push(Y)), 1;
    F = 0;
    var Cl = U === "" ? "." : U + ":";
    if (Tt(y))
      for (var hl = 0; hl < y.length; hl++)
        U = y[hl], Q = Cl + rt(U, hl), F += b(
          U,
          E,
          M,
          Q,
          Y
        );
    else if (hl = wl(y), typeof hl == "function")
      for (y = hl.call(y), hl = 0; !(U = y.next()).done; )
        U = U.value, Q = Cl + rt(U, hl++), F += b(
          U,
          E,
          M,
          Q,
          Y
        );
    else if (Q === "object") {
      if (typeof y.then == "function")
        return b(
          St(y),
          E,
          M,
          U,
          Y
        );
      throw E = String(y), Error(
        "Objects are not valid as a React child (found: " + (E === "[object Object]" ? "object with keys {" + Object.keys(y).join(", ") + "}" : E) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return F;
  }
  function O(y, E, M) {
    if (y == null) return y;
    var U = [], Y = 0;
    return b(y, U, "", "", function(Q) {
      return E.call(M, Q, Y++);
    }), U;
  }
  function q(y) {
    if (y._status === -1) {
      var E = y._result;
      E = E(), E.then(
        function(M) {
          (y._status === 0 || y._status === -1) && (y._status = 1, y._result = M);
        },
        function(M) {
          (y._status === 0 || y._status === -1) && (y._status = 2, y._result = M);
        }
      ), y._status === -1 && (y._status = 0, y._result = E);
    }
    if (y._status === 1) return y._result.default;
    throw y._result;
  }
  var P = typeof reportError == "function" ? reportError : function(y) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var E = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof y == "object" && y !== null && typeof y.message == "string" ? String(y.message) : String(y),
        error: y
      });
      if (!window.dispatchEvent(E)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", y);
      return;
    }
    console.error(y);
  }, al = {
    map: O,
    forEach: function(y, E, M) {
      O(
        y,
        function() {
          E.apply(this, arguments);
        },
        M
      );
    },
    count: function(y) {
      var E = 0;
      return O(y, function() {
        E++;
      }), E;
    },
    toArray: function(y) {
      return O(y, function(E) {
        return E;
      }) || [];
    },
    only: function(y) {
      if (!At(y))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return y;
    }
  };
  return C.Activity = p, C.Children = al, C.Component = Wl, C.Fragment = W, C.Profiler = yl, C.PureComponent = Nl, C.StrictMode = o, C.Suspense = N, C.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = x, C.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(y) {
      return x.H.useMemoCache(y);
    }
  }, C.cache = function(y) {
    return function() {
      return y.apply(null, arguments);
    };
  }, C.cacheSignal = function() {
    return null;
  }, C.cloneElement = function(y, E, M) {
    if (y == null)
      throw Error(
        "The argument must be a React element, but you passed " + y + "."
      );
    var U = ql({}, y.props), Y = y.key;
    if (E != null)
      for (Q in E.key !== void 0 && (Y = "" + E.key), E)
        !Ql.call(E, Q) || Q === "key" || Q === "__self" || Q === "__source" || Q === "ref" && E.ref === void 0 || (U[Q] = E[Q]);
    var Q = arguments.length - 2;
    if (Q === 1) U.children = M;
    else if (1 < Q) {
      for (var F = Array(Q), Cl = 0; Cl < Q; Cl++)
        F[Cl] = arguments[Cl + 2];
      U.children = F;
    }
    return Et(y.type, Y, U);
  }, C.createContext = function(y) {
    return y = {
      $$typeof: El,
      _currentValue: y,
      _currentValue2: y,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, y.Provider = y, y.Consumer = {
      $$typeof: sl,
      _context: y
    }, y;
  }, C.createElement = function(y, E, M) {
    var U, Y = {}, Q = null;
    if (E != null)
      for (U in E.key !== void 0 && (Q = "" + E.key), E)
        Ql.call(E, U) && U !== "key" && U !== "__self" && U !== "__source" && (Y[U] = E[U]);
    var F = arguments.length - 2;
    if (F === 1) Y.children = M;
    else if (1 < F) {
      for (var Cl = Array(F), hl = 0; hl < F; hl++)
        Cl[hl] = arguments[hl + 2];
      Y.children = Cl;
    }
    if (y && y.defaultProps)
      for (U in F = y.defaultProps, F)
        Y[U] === void 0 && (Y[U] = F[U]);
    return Et(y, Q, Y);
  }, C.createRef = function() {
    return { current: null };
  }, C.forwardRef = function(y) {
    return { $$typeof: pl, render: y };
  }, C.isValidElement = At, C.lazy = function(y) {
    return {
      $$typeof: $,
      _payload: { _status: -1, _result: y },
      _init: q
    };
  }, C.memo = function(y, E) {
    return {
      $$typeof: A,
      type: y,
      compare: E === void 0 ? null : E
    };
  }, C.startTransition = function(y) {
    var E = x.T, M = {};
    x.T = M;
    try {
      var U = y(), Y = x.S;
      Y !== null && Y(M, U), typeof U == "object" && U !== null && typeof U.then == "function" && U.then(Gl, P);
    } catch (Q) {
      P(Q);
    } finally {
      E !== null && M.types !== null && (E.types = M.types), x.T = E;
    }
  }, C.unstable_useCacheRefresh = function() {
    return x.H.useCacheRefresh();
  }, C.use = function(y) {
    return x.H.use(y);
  }, C.useActionState = function(y, E, M) {
    return x.H.useActionState(y, E, M);
  }, C.useCallback = function(y, E) {
    return x.H.useCallback(y, E);
  }, C.useContext = function(y) {
    return x.H.useContext(y);
  }, C.useDebugValue = function() {
  }, C.useDeferredValue = function(y, E) {
    return x.H.useDeferredValue(y, E);
  }, C.useEffect = function(y, E) {
    return x.H.useEffect(y, E);
  }, C.useEffectEvent = function(y) {
    return x.H.useEffectEvent(y);
  }, C.useId = function() {
    return x.H.useId();
  }, C.useImperativeHandle = function(y, E, M) {
    return x.H.useImperativeHandle(y, E, M);
  }, C.useInsertionEffect = function(y, E) {
    return x.H.useInsertionEffect(y, E);
  }, C.useLayoutEffect = function(y, E) {
    return x.H.useLayoutEffect(y, E);
  }, C.useMemo = function(y, E) {
    return x.H.useMemo(y, E);
  }, C.useOptimistic = function(y, E) {
    return x.H.useOptimistic(y, E);
  }, C.useReducer = function(y, E, M) {
    return x.H.useReducer(y, E, M);
  }, C.useRef = function(y) {
    return x.H.useRef(y);
  }, C.useState = function(y) {
    return x.H.useState(y);
  }, C.useSyncExternalStore = function(y, E, M) {
    return x.H.useSyncExternalStore(
      y,
      E,
      M
    );
  }, C.useTransition = function() {
    return x.H.useTransition();
  }, C.version = "19.2.3", C;
}
var S1;
function yi() {
  return S1 || (S1 = 1, ei.exports = Fd()), ei.exports;
}
var kd = yi(), Id = function() {
  const _ = kd.useState(3), vl = h1(_, 0, null), W = h1(_, 1, null);
  return /* @__PURE__ */ vi.jsxs("div", { children: [
    "You clicked ",
    vl,
    " times",
    /* @__PURE__ */ vi.jsx("button", { onClick: (function() {
      return W(vl + 1);
    }), children: "Click me" })
  ] });
}, ni = { exports: {} }, be = {}, fi = { exports: {} }, ci = {};
var g1;
function Pd() {
  return g1 || (g1 = 1, (function(_) {
    function vl(b, O) {
      var q = b.length;
      b.push(O);
      l: for (; 0 < q; ) {
        var P = q - 1 >>> 1, al = b[P];
        if (0 < yl(al, O))
          b[P] = O, b[q] = al, q = P;
        else break l;
      }
    }
    function W(b) {
      return b.length === 0 ? null : b[0];
    }
    function o(b) {
      if (b.length === 0) return null;
      var O = b[0], q = b.pop();
      if (q !== O) {
        b[0] = q;
        l: for (var P = 0, al = b.length, y = al >>> 1; P < y; ) {
          var E = 2 * (P + 1) - 1, M = b[E], U = E + 1, Y = b[U];
          if (0 > yl(M, q))
            U < al && 0 > yl(Y, M) ? (b[P] = Y, b[U] = q, P = U) : (b[P] = M, b[E] = q, P = E);
          else if (U < al && 0 > yl(Y, q))
            b[P] = Y, b[U] = q, P = U;
          else break l;
        }
      }
      return O;
    }
    function yl(b, O) {
      var q = b.sortIndex - O.sortIndex;
      return q !== 0 ? q : b.id - O.id;
    }
    if (_.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var sl = performance;
      _.unstable_now = function() {
        return sl.now();
      };
    } else {
      var El = Date, pl = El.now();
      _.unstable_now = function() {
        return El.now() - pl;
      };
    }
    var N = [], A = [], $ = 1, p = null, cl = 3, wl = !1, Bl = !1, ql = !1, Ut = !1, Wl = typeof setTimeout == "function" ? setTimeout : null, wt = typeof clearTimeout == "function" ? clearTimeout : null, Nl = typeof setImmediate < "u" ? setImmediate : null;
    function nt(b) {
      for (var O = W(A); O !== null; ) {
        if (O.callback === null) o(A);
        else if (O.startTime <= b)
          o(A), O.sortIndex = O.expirationTime, vl(N, O);
        else break;
        O = W(A);
      }
    }
    function Tt(b) {
      if (ql = !1, nt(b), !Bl)
        if (W(N) !== null)
          Bl = !0, Gl || (Gl = !0, Xl());
        else {
          var O = W(A);
          O !== null && St(Tt, O.startTime - b);
        }
    }
    var Gl = !1, x = -1, Ql = 5, Et = -1;
    function Xu() {
      return Ut ? !0 : !(_.unstable_now() - Et < Ql);
    }
    function At() {
      if (Ut = !1, Gl) {
        var b = _.unstable_now();
        Et = b;
        var O = !0;
        try {
          l: {
            Bl = !1, ql && (ql = !1, wt(x), x = -1), wl = !0;
            var q = cl;
            try {
              t: {
                for (nt(b), p = W(N); p !== null && !(p.expirationTime > b && Xu()); ) {
                  var P = p.callback;
                  if (typeof P == "function") {
                    p.callback = null, cl = p.priorityLevel;
                    var al = P(
                      p.expirationTime <= b
                    );
                    if (b = _.unstable_now(), typeof al == "function") {
                      p.callback = al, nt(b), O = !0;
                      break t;
                    }
                    p === W(N) && o(N), nt(b);
                  } else o(N);
                  p = W(N);
                }
                if (p !== null) O = !0;
                else {
                  var y = W(A);
                  y !== null && St(
                    Tt,
                    y.startTime - b
                  ), O = !1;
                }
              }
              break l;
            } finally {
              p = null, cl = q, wl = !1;
            }
            O = void 0;
          }
        } finally {
          O ? Xl() : Gl = !1;
        }
      }
    }
    var Xl;
    if (typeof Nl == "function")
      Xl = function() {
        Nl(At);
      };
    else if (typeof MessageChannel < "u") {
      var zu = new MessageChannel(), rt = zu.port2;
      zu.port1.onmessage = At, Xl = function() {
        rt.postMessage(null);
      };
    } else
      Xl = function() {
        Wl(At, 0);
      };
    function St(b, O) {
      x = Wl(function() {
        b(_.unstable_now());
      }, O);
    }
    _.unstable_IdlePriority = 5, _.unstable_ImmediatePriority = 1, _.unstable_LowPriority = 4, _.unstable_NormalPriority = 3, _.unstable_Profiling = null, _.unstable_UserBlockingPriority = 2, _.unstable_cancelCallback = function(b) {
      b.callback = null;
    }, _.unstable_forceFrameRate = function(b) {
      0 > b || 125 < b ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : Ql = 0 < b ? Math.floor(1e3 / b) : 5;
    }, _.unstable_getCurrentPriorityLevel = function() {
      return cl;
    }, _.unstable_next = function(b) {
      switch (cl) {
        case 1:
        case 2:
        case 3:
          var O = 3;
          break;
        default:
          O = cl;
      }
      var q = cl;
      cl = O;
      try {
        return b();
      } finally {
        cl = q;
      }
    }, _.unstable_requestPaint = function() {
      Ut = !0;
    }, _.unstable_runWithPriority = function(b, O) {
      switch (b) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          b = 3;
      }
      var q = cl;
      cl = b;
      try {
        return O();
      } finally {
        cl = q;
      }
    }, _.unstable_scheduleCallback = function(b, O, q) {
      var P = _.unstable_now();
      switch (typeof q == "object" && q !== null ? (q = q.delay, q = typeof q == "number" && 0 < q ? P + q : P) : q = P, b) {
        case 1:
          var al = -1;
          break;
        case 2:
          al = 250;
          break;
        case 5:
          al = 1073741823;
          break;
        case 4:
          al = 1e4;
          break;
        default:
          al = 5e3;
      }
      return al = q + al, b = {
        id: $++,
        callback: O,
        priorityLevel: b,
        startTime: q,
        expirationTime: al,
        sortIndex: -1
      }, q > P ? (b.sortIndex = q, vl(A, b), W(N) === null && b === W(A) && (ql ? (wt(x), x = -1) : ql = !0, St(Tt, q - P))) : (b.sortIndex = al, vl(N, b), Bl || wl || (Bl = !0, Gl || (Gl = !0, Xl()))), b;
    }, _.unstable_shouldYield = Xu, _.unstable_wrapCallback = function(b) {
      var O = cl;
      return function() {
        var q = cl;
        cl = O;
        try {
          return b.apply(this, arguments);
        } finally {
          cl = q;
        }
      };
    };
  })(ci)), ci;
}
var b1;
function ls() {
  return b1 || (b1 = 1, fi.exports = Pd()), fi.exports;
}
var ii = { exports: {} }, Rl = {};
var z1;
function ts() {
  if (z1) return Rl;
  z1 = 1;
  var _ = yi();
  function vl(N) {
    var A = "https://react.dev/errors/" + N;
    if (1 < arguments.length) {
      A += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var $ = 2; $ < arguments.length; $++)
        A += "&args[]=" + encodeURIComponent(arguments[$]);
    }
    return "Minified React error #" + N + "; visit " + A + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function W() {
  }
  var o = {
    d: {
      f: W,
      r: function() {
        throw Error(vl(522));
      },
      D: W,
      C: W,
      L: W,
      m: W,
      X: W,
      S: W,
      M: W
    },
    p: 0,
    findDOMNode: null
  }, yl = /* @__PURE__ */ Symbol.for("react.portal");
  function sl(N, A, $) {
    var p = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: yl,
      key: p == null ? null : "" + p,
      children: N,
      containerInfo: A,
      implementation: $
    };
  }
  var El = _.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function pl(N, A) {
    if (N === "font") return "";
    if (typeof A == "string")
      return A === "use-credentials" ? A : "";
  }
  return Rl.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = o, Rl.createPortal = function(N, A) {
    var $ = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!A || A.nodeType !== 1 && A.nodeType !== 9 && A.nodeType !== 11)
      throw Error(vl(299));
    return sl(N, A, null, $);
  }, Rl.flushSync = function(N) {
    var A = El.T, $ = o.p;
    try {
      if (El.T = null, o.p = 2, N) return N();
    } finally {
      El.T = A, o.p = $, o.d.f();
    }
  }, Rl.preconnect = function(N, A) {
    typeof N == "string" && (A ? (A = A.crossOrigin, A = typeof A == "string" ? A === "use-credentials" ? A : "" : void 0) : A = null, o.d.C(N, A));
  }, Rl.prefetchDNS = function(N) {
    typeof N == "string" && o.d.D(N);
  }, Rl.preinit = function(N, A) {
    if (typeof N == "string" && A && typeof A.as == "string") {
      var $ = A.as, p = pl($, A.crossOrigin), cl = typeof A.integrity == "string" ? A.integrity : void 0, wl = typeof A.fetchPriority == "string" ? A.fetchPriority : void 0;
      $ === "style" ? o.d.S(
        N,
        typeof A.precedence == "string" ? A.precedence : void 0,
        {
          crossOrigin: p,
          integrity: cl,
          fetchPriority: wl
        }
      ) : $ === "script" && o.d.X(N, {
        crossOrigin: p,
        integrity: cl,
        fetchPriority: wl,
        nonce: typeof A.nonce == "string" ? A.nonce : void 0
      });
    }
  }, Rl.preinitModule = function(N, A) {
    if (typeof N == "string")
      if (typeof A == "object" && A !== null) {
        if (A.as == null || A.as === "script") {
          var $ = pl(
            A.as,
            A.crossOrigin
          );
          o.d.M(N, {
            crossOrigin: $,
            integrity: typeof A.integrity == "string" ? A.integrity : void 0,
            nonce: typeof A.nonce == "string" ? A.nonce : void 0
          });
        }
      } else A == null && o.d.M(N);
  }, Rl.preload = function(N, A) {
    if (typeof N == "string" && typeof A == "object" && A !== null && typeof A.as == "string") {
      var $ = A.as, p = pl($, A.crossOrigin);
      o.d.L(N, $, {
        crossOrigin: p,
        integrity: typeof A.integrity == "string" ? A.integrity : void 0,
        nonce: typeof A.nonce == "string" ? A.nonce : void 0,
        type: typeof A.type == "string" ? A.type : void 0,
        fetchPriority: typeof A.fetchPriority == "string" ? A.fetchPriority : void 0,
        referrerPolicy: typeof A.referrerPolicy == "string" ? A.referrerPolicy : void 0,
        imageSrcSet: typeof A.imageSrcSet == "string" ? A.imageSrcSet : void 0,
        imageSizes: typeof A.imageSizes == "string" ? A.imageSizes : void 0,
        media: typeof A.media == "string" ? A.media : void 0
      });
    }
  }, Rl.preloadModule = function(N, A) {
    if (typeof N == "string")
      if (A) {
        var $ = pl(A.as, A.crossOrigin);
        o.d.m(N, {
          as: typeof A.as == "string" && A.as !== "script" ? A.as : void 0,
          crossOrigin: $,
          integrity: typeof A.integrity == "string" ? A.integrity : void 0
        });
      } else o.d.m(N);
  }, Rl.requestFormReset = function(N) {
    o.d.r(N);
  }, Rl.unstable_batchedUpdates = function(N, A) {
    return N(A);
  }, Rl.useFormState = function(N, A, $) {
    return El.H.useFormState(N, A, $);
  }, Rl.useFormStatus = function() {
    return El.H.useHostTransitionStatus();
  }, Rl.version = "19.2.3", Rl;
}
var T1;
function us() {
  if (T1) return ii.exports;
  T1 = 1;
  function _() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(_);
      } catch (vl) {
        console.error(vl);
      }
  }
  return _(), ii.exports = ts(), ii.exports;
}
var E1;
function as() {
  if (E1) return be;
  E1 = 1;
  var _ = ls(), vl = yi(), W = us();
  function o(l) {
    var t = "https://react.dev/errors/" + l;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var u = 2; u < arguments.length; u++)
        t += "&args[]=" + encodeURIComponent(arguments[u]);
    }
    return "Minified React error #" + l + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function yl(l) {
    return !(!l || l.nodeType !== 1 && l.nodeType !== 9 && l.nodeType !== 11);
  }
  function sl(l) {
    var t = l, u = l;
    if (l.alternate) for (; t.return; ) t = t.return;
    else {
      l = t;
      do
        t = l, (t.flags & 4098) !== 0 && (u = t.return), l = t.return;
      while (l);
    }
    return t.tag === 3 ? u : null;
  }
  function El(l) {
    if (l.tag === 13) {
      var t = l.memoizedState;
      if (t === null && (l = l.alternate, l !== null && (t = l.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function pl(l) {
    if (l.tag === 31) {
      var t = l.memoizedState;
      if (t === null && (l = l.alternate, l !== null && (t = l.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function N(l) {
    if (sl(l) !== l)
      throw Error(o(188));
  }
  function A(l) {
    var t = l.alternate;
    if (!t) {
      if (t = sl(l), t === null) throw Error(o(188));
      return t !== l ? null : l;
    }
    for (var u = l, a = t; ; ) {
      var e = u.return;
      if (e === null) break;
      var n = e.alternate;
      if (n === null) {
        if (a = e.return, a !== null) {
          u = a;
          continue;
        }
        break;
      }
      if (e.child === n.child) {
        for (n = e.child; n; ) {
          if (n === u) return N(e), l;
          if (n === a) return N(e), t;
          n = n.sibling;
        }
        throw Error(o(188));
      }
      if (u.return !== a.return) u = e, a = n;
      else {
        for (var f = !1, c = e.child; c; ) {
          if (c === u) {
            f = !0, u = e, a = n;
            break;
          }
          if (c === a) {
            f = !0, a = e, u = n;
            break;
          }
          c = c.sibling;
        }
        if (!f) {
          for (c = n.child; c; ) {
            if (c === u) {
              f = !0, u = n, a = e;
              break;
            }
            if (c === a) {
              f = !0, a = n, u = e;
              break;
            }
            c = c.sibling;
          }
          if (!f) throw Error(o(189));
        }
      }
      if (u.alternate !== a) throw Error(o(190));
    }
    if (u.tag !== 3) throw Error(o(188));
    return u.stateNode.current === u ? l : t;
  }
  function $(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l;
    for (l = l.child; l !== null; ) {
      if (t = $(l), t !== null) return t;
      l = l.sibling;
    }
    return null;
  }
  var p = Object.assign, cl = /* @__PURE__ */ Symbol.for("react.element"), wl = /* @__PURE__ */ Symbol.for("react.transitional.element"), Bl = /* @__PURE__ */ Symbol.for("react.portal"), ql = /* @__PURE__ */ Symbol.for("react.fragment"), Ut = /* @__PURE__ */ Symbol.for("react.strict_mode"), Wl = /* @__PURE__ */ Symbol.for("react.profiler"), wt = /* @__PURE__ */ Symbol.for("react.consumer"), Nl = /* @__PURE__ */ Symbol.for("react.context"), nt = /* @__PURE__ */ Symbol.for("react.forward_ref"), Tt = /* @__PURE__ */ Symbol.for("react.suspense"), Gl = /* @__PURE__ */ Symbol.for("react.suspense_list"), x = /* @__PURE__ */ Symbol.for("react.memo"), Ql = /* @__PURE__ */ Symbol.for("react.lazy"), Et = /* @__PURE__ */ Symbol.for("react.activity"), Xu = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel"), At = Symbol.iterator;
  function Xl(l) {
    return l === null || typeof l != "object" ? null : (l = At && l[At] || l["@@iterator"], typeof l == "function" ? l : null);
  }
  var zu = /* @__PURE__ */ Symbol.for("react.client.reference");
  function rt(l) {
    if (l == null) return null;
    if (typeof l == "function")
      return l.$$typeof === zu ? null : l.displayName || l.name || null;
    if (typeof l == "string") return l;
    switch (l) {
      case ql:
        return "Fragment";
      case Wl:
        return "Profiler";
      case Ut:
        return "StrictMode";
      case Tt:
        return "Suspense";
      case Gl:
        return "SuspenseList";
      case Et:
        return "Activity";
    }
    if (typeof l == "object")
      switch (l.$$typeof) {
        case Bl:
          return "Portal";
        case Nl:
          return l.displayName || "Context";
        case wt:
          return (l._context.displayName || "Context") + ".Consumer";
        case nt:
          var t = l.render;
          return l = l.displayName, l || (l = t.displayName || t.name || "", l = l !== "" ? "ForwardRef(" + l + ")" : "ForwardRef"), l;
        case x:
          return t = l.displayName || null, t !== null ? t : rt(l.type) || "Memo";
        case Ql:
          t = l._payload, l = l._init;
          try {
            return rt(l(t));
          } catch {
          }
      }
    return null;
  }
  var St = Array.isArray, b = vl.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, O = W.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, q = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, P = [], al = -1;
  function y(l) {
    return { current: l };
  }
  function E(l) {
    0 > al || (l.current = P[al], P[al] = null, al--);
  }
  function M(l, t) {
    al++, P[al] = l.current, l.current = t;
  }
  var U = y(null), Y = y(null), Q = y(null), F = y(null);
  function Cl(l, t) {
    switch (M(Q, t), M(Y, l), M(U, null), t.nodeType) {
      case 9:
      case 11:
        l = (l = t.documentElement) && (l = l.namespaceURI) ? Yy(l) : 0;
        break;
      default:
        if (l = t.tagName, t = t.namespaceURI)
          t = Yy(t), l = By(t, l);
        else
          switch (l) {
            case "svg":
              l = 1;
              break;
            case "math":
              l = 2;
              break;
            default:
              l = 0;
          }
    }
    E(U), M(U, l);
  }
  function hl() {
    E(U), E(Y), E(Q);
  }
  function Oa(l) {
    l.memoizedState !== null && M(F, l);
    var t = U.current, u = By(t, l.type);
    t !== u && (M(Y, l), M(U, u));
  }
  function ze(l) {
    Y.current === l && (E(U), E(Y)), F.current === l && (E(F), se._currentValue = q);
  }
  var Qn, mi;
  function Tu(l) {
    if (Qn === void 0)
      try {
        throw Error();
      } catch (u) {
        var t = u.stack.trim().match(/\n( *(at )?)/);
        Qn = t && t[1] || "", mi = -1 < u.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < u.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Qn + l + mi;
  }
  var Xn = !1;
  function jn(l, t) {
    if (!l || Xn) return "";
    Xn = !0;
    var u = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var a = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var T = function() {
                throw Error();
              };
              if (Object.defineProperty(T.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(T, []);
                } catch (S) {
                  var h = S;
                }
                Reflect.construct(l, [], T);
              } else {
                try {
                  T.call();
                } catch (S) {
                  h = S;
                }
                l.call(T.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (S) {
                h = S;
              }
              (T = l()) && typeof T.catch == "function" && T.catch(function() {
              });
            }
          } catch (S) {
            if (S && h && typeof S.stack == "string")
              return [S.stack, h.stack];
          }
          return [null, null];
        }
      };
      a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var e = Object.getOwnPropertyDescriptor(
        a.DetermineComponentFrameRoot,
        "name"
      );
      e && e.configurable && Object.defineProperty(
        a.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var n = a.DetermineComponentFrameRoot(), f = n[0], c = n[1];
      if (f && c) {
        var i = f.split(`
`), s = c.split(`
`);
        for (e = a = 0; a < i.length && !i[a].includes("DetermineComponentFrameRoot"); )
          a++;
        for (; e < s.length && !s[e].includes(
          "DetermineComponentFrameRoot"
        ); )
          e++;
        if (a === i.length || e === s.length)
          for (a = i.length - 1, e = s.length - 1; 1 <= a && 0 <= e && i[a] !== s[e]; )
            e--;
        for (; 1 <= a && 0 <= e; a--, e--)
          if (i[a] !== s[e]) {
            if (a !== 1 || e !== 1)
              do
                if (a--, e--, 0 > e || i[a] !== s[e]) {
                  var g = `
` + i[a].replace(" at new ", " at ");
                  return l.displayName && g.includes("<anonymous>") && (g = g.replace("<anonymous>", l.displayName)), g;
                }
              while (1 <= a && 0 <= e);
            break;
          }
      }
    } finally {
      Xn = !1, Error.prepareStackTrace = u;
    }
    return (u = l ? l.displayName || l.name : "") ? Tu(u) : "";
  }
  function _1(l, t) {
    switch (l.tag) {
      case 26:
      case 27:
      case 5:
        return Tu(l.type);
      case 16:
        return Tu("Lazy");
      case 13:
        return l.child !== t && t !== null ? Tu("Suspense Fallback") : Tu("Suspense");
      case 19:
        return Tu("SuspenseList");
      case 0:
      case 15:
        return jn(l.type, !1);
      case 11:
        return jn(l.type.render, !1);
      case 1:
        return jn(l.type, !0);
      case 31:
        return Tu("Activity");
      default:
        return "";
    }
  }
  function di(l) {
    try {
      var t = "", u = null;
      do
        t += _1(l, u), u = l, l = l.return;
      while (l);
      return t;
    } catch (a) {
      return `
Error generating stack: ` + a.message + `
` + a.stack;
    }
  }
  var Zn = Object.prototype.hasOwnProperty, Vn = _.unstable_scheduleCallback, xn = _.unstable_cancelCallback, O1 = _.unstable_shouldYield, M1 = _.unstable_requestPaint, $l = _.unstable_now, D1 = _.unstable_getCurrentPriorityLevel, si = _.unstable_ImmediatePriority, hi = _.unstable_UserBlockingPriority, Te = _.unstable_NormalPriority, U1 = _.unstable_LowPriority, oi = _.unstable_IdlePriority, r1 = _.log, H1 = _.unstable_setDisableYieldValue, Ma = null, Fl = null;
  function Wt(l) {
    if (typeof r1 == "function" && H1(l), Fl && typeof Fl.setStrictMode == "function")
      try {
        Fl.setStrictMode(Ma, l);
      } catch {
      }
  }
  var kl = Math.clz32 ? Math.clz32 : p1, N1 = Math.log, R1 = Math.LN2;
  function p1(l) {
    return l >>>= 0, l === 0 ? 32 : 31 - (N1(l) / R1 | 0) | 0;
  }
  var Ee = 256, Ae = 262144, _e = 4194304;
  function Eu(l) {
    var t = l & 42;
    if (t !== 0) return t;
    switch (l & -l) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return l & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return l & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return l & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return l;
    }
  }
  function Oe(l, t, u) {
    var a = l.pendingLanes;
    if (a === 0) return 0;
    var e = 0, n = l.suspendedLanes, f = l.pingedLanes;
    l = l.warmLanes;
    var c = a & 134217727;
    return c !== 0 ? (a = c & ~n, a !== 0 ? e = Eu(a) : (f &= c, f !== 0 ? e = Eu(f) : u || (u = c & ~l, u !== 0 && (e = Eu(u))))) : (c = a & ~n, c !== 0 ? e = Eu(c) : f !== 0 ? e = Eu(f) : u || (u = a & ~l, u !== 0 && (e = Eu(u)))), e === 0 ? 0 : t !== 0 && t !== e && (t & n) === 0 && (n = e & -e, u = t & -t, n >= u || n === 32 && (u & 4194048) !== 0) ? t : e;
  }
  function Da(l, t) {
    return (l.pendingLanes & ~(l.suspendedLanes & ~l.pingedLanes) & t) === 0;
  }
  function q1(l, t) {
    switch (l) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Si() {
    var l = _e;
    return _e <<= 1, (_e & 62914560) === 0 && (_e = 4194304), l;
  }
  function Ln(l) {
    for (var t = [], u = 0; 31 > u; u++) t.push(l);
    return t;
  }
  function Ua(l, t) {
    l.pendingLanes |= t, t !== 268435456 && (l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0);
  }
  function C1(l, t, u, a, e, n) {
    var f = l.pendingLanes;
    l.pendingLanes = u, l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0, l.expiredLanes &= u, l.entangledLanes &= u, l.errorRecoveryDisabledLanes &= u, l.shellSuspendCounter = 0;
    var c = l.entanglements, i = l.expirationTimes, s = l.hiddenUpdates;
    for (u = f & ~u; 0 < u; ) {
      var g = 31 - kl(u), T = 1 << g;
      c[g] = 0, i[g] = -1;
      var h = s[g];
      if (h !== null)
        for (s[g] = null, g = 0; g < h.length; g++) {
          var S = h[g];
          S !== null && (S.lane &= -536870913);
        }
      u &= ~T;
    }
    a !== 0 && gi(l, a, 0), n !== 0 && e === 0 && l.tag !== 0 && (l.suspendedLanes |= n & ~(f & ~t));
  }
  function gi(l, t, u) {
    l.pendingLanes |= t, l.suspendedLanes &= ~t;
    var a = 31 - kl(t);
    l.entangledLanes |= t, l.entanglements[a] = l.entanglements[a] | 1073741824 | u & 261930;
  }
  function bi(l, t) {
    var u = l.entangledLanes |= t;
    for (l = l.entanglements; u; ) {
      var a = 31 - kl(u), e = 1 << a;
      e & t | l[a] & t && (l[a] |= t), u &= ~e;
    }
  }
  function zi(l, t) {
    var u = t & -t;
    return u = (u & 42) !== 0 ? 1 : Kn(u), (u & (l.suspendedLanes | t)) !== 0 ? 0 : u;
  }
  function Kn(l) {
    switch (l) {
      case 2:
        l = 1;
        break;
      case 8:
        l = 4;
        break;
      case 32:
        l = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        l = 128;
        break;
      case 268435456:
        l = 134217728;
        break;
      default:
        l = 0;
    }
    return l;
  }
  function Jn(l) {
    return l &= -l, 2 < l ? 8 < l ? (l & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Ti() {
    var l = O.p;
    return l !== 0 ? l : (l = window.event, l === void 0 ? 32 : n1(l.type));
  }
  function Ei(l, t) {
    var u = O.p;
    try {
      return O.p = l, t();
    } finally {
      O.p = u;
    }
  }
  var $t = Math.random().toString(36).slice(2), Ml = "__reactFiber$" + $t, jl = "__reactProps$" + $t, ju = "__reactContainer$" + $t, wn = "__reactEvents$" + $t, Y1 = "__reactListeners$" + $t, B1 = "__reactHandles$" + $t, Ai = "__reactResources$" + $t, ra = "__reactMarker$" + $t;
  function Wn(l) {
    delete l[Ml], delete l[jl], delete l[wn], delete l[Y1], delete l[B1];
  }
  function Zu(l) {
    var t = l[Ml];
    if (t) return t;
    for (var u = l.parentNode; u; ) {
      if (t = u[ju] || u[Ml]) {
        if (u = t.alternate, t.child !== null || u !== null && u.child !== null)
          for (l = xy(l); l !== null; ) {
            if (u = l[Ml]) return u;
            l = xy(l);
          }
        return t;
      }
      l = u, u = l.parentNode;
    }
    return null;
  }
  function Vu(l) {
    if (l = l[Ml] || l[ju]) {
      var t = l.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return l;
    }
    return null;
  }
  function Ha(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l.stateNode;
    throw Error(o(33));
  }
  function xu(l) {
    var t = l[Ai];
    return t || (t = l[Ai] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function _l(l) {
    l[ra] = !0;
  }
  var _i = /* @__PURE__ */ new Set(), Oi = {};
  function Au(l, t) {
    Lu(l, t), Lu(l + "Capture", t);
  }
  function Lu(l, t) {
    for (Oi[l] = t, l = 0; l < t.length; l++)
      _i.add(t[l]);
  }
  var G1 = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Mi = {}, Di = {};
  function Q1(l) {
    return Zn.call(Di, l) ? !0 : Zn.call(Mi, l) ? !1 : G1.test(l) ? Di[l] = !0 : (Mi[l] = !0, !1);
  }
  function Me(l, t, u) {
    if (Q1(t))
      if (u === null) l.removeAttribute(t);
      else {
        switch (typeof u) {
          case "undefined":
          case "function":
          case "symbol":
            l.removeAttribute(t);
            return;
          case "boolean":
            var a = t.toLowerCase().slice(0, 5);
            if (a !== "data-" && a !== "aria-") {
              l.removeAttribute(t);
              return;
            }
        }
        l.setAttribute(t, "" + u);
      }
  }
  function De(l, t, u) {
    if (u === null) l.removeAttribute(t);
    else {
      switch (typeof u) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(t);
          return;
      }
      l.setAttribute(t, "" + u);
    }
  }
  function Ht(l, t, u, a) {
    if (a === null) l.removeAttribute(u);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(u);
          return;
      }
      l.setAttributeNS(t, u, "" + a);
    }
  }
  function ft(l) {
    switch (typeof l) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return l;
      case "object":
        return l;
      default:
        return "";
    }
  }
  function Ui(l) {
    var t = l.type;
    return (l = l.nodeName) && l.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function X1(l, t, u) {
    var a = Object.getOwnPropertyDescriptor(
      l.constructor.prototype,
      t
    );
    if (!l.hasOwnProperty(t) && typeof a < "u" && typeof a.get == "function" && typeof a.set == "function") {
      var e = a.get, n = a.set;
      return Object.defineProperty(l, t, {
        configurable: !0,
        get: function() {
          return e.call(this);
        },
        set: function(f) {
          u = "" + f, n.call(this, f);
        }
      }), Object.defineProperty(l, t, {
        enumerable: a.enumerable
      }), {
        getValue: function() {
          return u;
        },
        setValue: function(f) {
          u = "" + f;
        },
        stopTracking: function() {
          l._valueTracker = null, delete l[t];
        }
      };
    }
  }
  function $n(l) {
    if (!l._valueTracker) {
      var t = Ui(l) ? "checked" : "value";
      l._valueTracker = X1(
        l,
        t,
        "" + l[t]
      );
    }
  }
  function ri(l) {
    if (!l) return !1;
    var t = l._valueTracker;
    if (!t) return !0;
    var u = t.getValue(), a = "";
    return l && (a = Ui(l) ? l.checked ? "true" : "false" : l.value), l = a, l !== u ? (t.setValue(l), !0) : !1;
  }
  function Ue(l) {
    if (l = l || (typeof document < "u" ? document : void 0), typeof l > "u") return null;
    try {
      return l.activeElement || l.body;
    } catch {
      return l.body;
    }
  }
  var j1 = /[\n"\\]/g;
  function ct(l) {
    return l.replace(
      j1,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function Fn(l, t, u, a, e, n, f, c) {
    l.name = "", f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? l.type = f : l.removeAttribute("type"), t != null ? f === "number" ? (t === 0 && l.value === "" || l.value != t) && (l.value = "" + ft(t)) : l.value !== "" + ft(t) && (l.value = "" + ft(t)) : f !== "submit" && f !== "reset" || l.removeAttribute("value"), t != null ? kn(l, f, ft(t)) : u != null ? kn(l, f, ft(u)) : a != null && l.removeAttribute("value"), e == null && n != null && (l.defaultChecked = !!n), e != null && (l.checked = e && typeof e != "function" && typeof e != "symbol"), c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" ? l.name = "" + ft(c) : l.removeAttribute("name");
  }
  function Hi(l, t, u, a, e, n, f, c) {
    if (n != null && typeof n != "function" && typeof n != "symbol" && typeof n != "boolean" && (l.type = n), t != null || u != null) {
      if (!(n !== "submit" && n !== "reset" || t != null)) {
        $n(l);
        return;
      }
      u = u != null ? "" + ft(u) : "", t = t != null ? "" + ft(t) : u, c || t === l.value || (l.value = t), l.defaultValue = t;
    }
    a = a ?? e, a = typeof a != "function" && typeof a != "symbol" && !!a, l.checked = c ? l.checked : !!a, l.defaultChecked = !!a, f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" && (l.name = f), $n(l);
  }
  function kn(l, t, u) {
    t === "number" && Ue(l.ownerDocument) === l || l.defaultValue === "" + u || (l.defaultValue = "" + u);
  }
  function Ku(l, t, u, a) {
    if (l = l.options, t) {
      t = {};
      for (var e = 0; e < u.length; e++)
        t["$" + u[e]] = !0;
      for (u = 0; u < l.length; u++)
        e = t.hasOwnProperty("$" + l[u].value), l[u].selected !== e && (l[u].selected = e), e && a && (l[u].defaultSelected = !0);
    } else {
      for (u = "" + ft(u), t = null, e = 0; e < l.length; e++) {
        if (l[e].value === u) {
          l[e].selected = !0, a && (l[e].defaultSelected = !0);
          return;
        }
        t !== null || l[e].disabled || (t = l[e]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Ni(l, t, u) {
    if (t != null && (t = "" + ft(t), t !== l.value && (l.value = t), u == null)) {
      l.defaultValue !== t && (l.defaultValue = t);
      return;
    }
    l.defaultValue = u != null ? "" + ft(u) : "";
  }
  function Ri(l, t, u, a) {
    if (t == null) {
      if (a != null) {
        if (u != null) throw Error(o(92));
        if (St(a)) {
          if (1 < a.length) throw Error(o(93));
          a = a[0];
        }
        u = a;
      }
      u == null && (u = ""), t = u;
    }
    u = ft(t), l.defaultValue = u, a = l.textContent, a === u && a !== "" && a !== null && (l.value = a), $n(l);
  }
  function Ju(l, t) {
    if (t) {
      var u = l.firstChild;
      if (u && u === l.lastChild && u.nodeType === 3) {
        u.nodeValue = t;
        return;
      }
    }
    l.textContent = t;
  }
  var Z1 = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function pi(l, t, u) {
    var a = t.indexOf("--") === 0;
    u == null || typeof u == "boolean" || u === "" ? a ? l.setProperty(t, "") : t === "float" ? l.cssFloat = "" : l[t] = "" : a ? l.setProperty(t, u) : typeof u != "number" || u === 0 || Z1.has(t) ? t === "float" ? l.cssFloat = u : l[t] = ("" + u).trim() : l[t] = u + "px";
  }
  function qi(l, t, u) {
    if (t != null && typeof t != "object")
      throw Error(o(62));
    if (l = l.style, u != null) {
      for (var a in u)
        !u.hasOwnProperty(a) || t != null && t.hasOwnProperty(a) || (a.indexOf("--") === 0 ? l.setProperty(a, "") : a === "float" ? l.cssFloat = "" : l[a] = "");
      for (var e in t)
        a = t[e], t.hasOwnProperty(e) && u[e] !== a && pi(l, e, a);
    } else
      for (var n in t)
        t.hasOwnProperty(n) && pi(l, n, t[n]);
  }
  function In(l) {
    if (l.indexOf("-") === -1) return !1;
    switch (l) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var V1 = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), x1 = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function re(l) {
    return x1.test("" + l) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : l;
  }
  function Nt() {
  }
  var Pn = null;
  function lf(l) {
    return l = l.target || l.srcElement || window, l.correspondingUseElement && (l = l.correspondingUseElement), l.nodeType === 3 ? l.parentNode : l;
  }
  var wu = null, Wu = null;
  function Ci(l) {
    var t = Vu(l);
    if (t && (l = t.stateNode)) {
      var u = l[jl] || null;
      l: switch (l = t.stateNode, t.type) {
        case "input":
          if (Fn(
            l,
            u.value,
            u.defaultValue,
            u.defaultValue,
            u.checked,
            u.defaultChecked,
            u.type,
            u.name
          ), t = u.name, u.type === "radio" && t != null) {
            for (u = l; u.parentNode; ) u = u.parentNode;
            for (u = u.querySelectorAll(
              'input[name="' + ct(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < u.length; t++) {
              var a = u[t];
              if (a !== l && a.form === l.form) {
                var e = a[jl] || null;
                if (!e) throw Error(o(90));
                Fn(
                  a,
                  e.value,
                  e.defaultValue,
                  e.defaultValue,
                  e.checked,
                  e.defaultChecked,
                  e.type,
                  e.name
                );
              }
            }
            for (t = 0; t < u.length; t++)
              a = u[t], a.form === l.form && ri(a);
          }
          break l;
        case "textarea":
          Ni(l, u.value, u.defaultValue);
          break l;
        case "select":
          t = u.value, t != null && Ku(l, !!u.multiple, t, !1);
      }
    }
  }
  var tf = !1;
  function Yi(l, t, u) {
    if (tf) return l(t, u);
    tf = !0;
    try {
      var a = l(t);
      return a;
    } finally {
      if (tf = !1, (wu !== null || Wu !== null) && (Sn(), wu && (t = wu, l = Wu, Wu = wu = null, Ci(t), l)))
        for (t = 0; t < l.length; t++) Ci(l[t]);
    }
  }
  function Na(l, t) {
    var u = l.stateNode;
    if (u === null) return null;
    var a = u[jl] || null;
    if (a === null) return null;
    u = a[t];
    l: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (a = !a.disabled) || (l = l.type, a = !(l === "button" || l === "input" || l === "select" || l === "textarea")), l = !a;
        break l;
      default:
        l = !1;
    }
    if (l) return null;
    if (u && typeof u != "function")
      throw Error(
        o(231, t, typeof u)
      );
    return u;
  }
  var Rt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), uf = !1;
  if (Rt)
    try {
      var Ra = {};
      Object.defineProperty(Ra, "passive", {
        get: function() {
          uf = !0;
        }
      }), window.addEventListener("test", Ra, Ra), window.removeEventListener("test", Ra, Ra);
    } catch {
      uf = !1;
    }
  var Ft = null, af = null, He = null;
  function Bi() {
    if (He) return He;
    var l, t = af, u = t.length, a, e = "value" in Ft ? Ft.value : Ft.textContent, n = e.length;
    for (l = 0; l < u && t[l] === e[l]; l++) ;
    var f = u - l;
    for (a = 1; a <= f && t[u - a] === e[n - a]; a++) ;
    return He = e.slice(l, 1 < a ? 1 - a : void 0);
  }
  function Ne(l) {
    var t = l.keyCode;
    return "charCode" in l ? (l = l.charCode, l === 0 && t === 13 && (l = 13)) : l = t, l === 10 && (l = 13), 32 <= l || l === 13 ? l : 0;
  }
  function Re() {
    return !0;
  }
  function Gi() {
    return !1;
  }
  function Zl(l) {
    function t(u, a, e, n, f) {
      this._reactName = u, this._targetInst = e, this.type = a, this.nativeEvent = n, this.target = f, this.currentTarget = null;
      for (var c in l)
        l.hasOwnProperty(c) && (u = l[c], this[c] = u ? u(n) : n[c]);
      return this.isDefaultPrevented = (n.defaultPrevented != null ? n.defaultPrevented : n.returnValue === !1) ? Re : Gi, this.isPropagationStopped = Gi, this;
    }
    return p(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var u = this.nativeEvent;
        u && (u.preventDefault ? u.preventDefault() : typeof u.returnValue != "unknown" && (u.returnValue = !1), this.isDefaultPrevented = Re);
      },
      stopPropagation: function() {
        var u = this.nativeEvent;
        u && (u.stopPropagation ? u.stopPropagation() : typeof u.cancelBubble != "unknown" && (u.cancelBubble = !0), this.isPropagationStopped = Re);
      },
      persist: function() {
      },
      isPersistent: Re
    }), t;
  }
  var _u = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(l) {
      return l.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, pe = Zl(_u), pa = p({}, _u, { view: 0, detail: 0 }), L1 = Zl(pa), ef, nf, qa, qe = p({}, pa, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: cf,
    button: 0,
    buttons: 0,
    relatedTarget: function(l) {
      return l.relatedTarget === void 0 ? l.fromElement === l.srcElement ? l.toElement : l.fromElement : l.relatedTarget;
    },
    movementX: function(l) {
      return "movementX" in l ? l.movementX : (l !== qa && (qa && l.type === "mousemove" ? (ef = l.screenX - qa.screenX, nf = l.screenY - qa.screenY) : nf = ef = 0, qa = l), ef);
    },
    movementY: function(l) {
      return "movementY" in l ? l.movementY : nf;
    }
  }), Qi = Zl(qe), K1 = p({}, qe, { dataTransfer: 0 }), J1 = Zl(K1), w1 = p({}, pa, { relatedTarget: 0 }), ff = Zl(w1), W1 = p({}, _u, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), $1 = Zl(W1), F1 = p({}, _u, {
    clipboardData: function(l) {
      return "clipboardData" in l ? l.clipboardData : window.clipboardData;
    }
  }), k1 = Zl(F1), I1 = p({}, _u, { data: 0 }), Xi = Zl(I1), P1 = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, lm = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, tm = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function um(l) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(l) : (l = tm[l]) ? !!t[l] : !1;
  }
  function cf() {
    return um;
  }
  var am = p({}, pa, {
    key: function(l) {
      if (l.key) {
        var t = P1[l.key] || l.key;
        if (t !== "Unidentified") return t;
      }
      return l.type === "keypress" ? (l = Ne(l), l === 13 ? "Enter" : String.fromCharCode(l)) : l.type === "keydown" || l.type === "keyup" ? lm[l.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: cf,
    charCode: function(l) {
      return l.type === "keypress" ? Ne(l) : 0;
    },
    keyCode: function(l) {
      return l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
    },
    which: function(l) {
      return l.type === "keypress" ? Ne(l) : l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
    }
  }), em = Zl(am), nm = p({}, qe, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), ji = Zl(nm), fm = p({}, pa, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: cf
  }), cm = Zl(fm), im = p({}, _u, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), vm = Zl(im), ym = p({}, qe, {
    deltaX: function(l) {
      return "deltaX" in l ? l.deltaX : "wheelDeltaX" in l ? -l.wheelDeltaX : 0;
    },
    deltaY: function(l) {
      return "deltaY" in l ? l.deltaY : "wheelDeltaY" in l ? -l.wheelDeltaY : "wheelDelta" in l ? -l.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), mm = Zl(ym), dm = p({}, _u, {
    newState: 0,
    oldState: 0
  }), sm = Zl(dm), hm = [9, 13, 27, 32], vf = Rt && "CompositionEvent" in window, Ca = null;
  Rt && "documentMode" in document && (Ca = document.documentMode);
  var om = Rt && "TextEvent" in window && !Ca, Zi = Rt && (!vf || Ca && 8 < Ca && 11 >= Ca), Vi = " ", xi = !1;
  function Li(l, t) {
    switch (l) {
      case "keyup":
        return hm.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Ki(l) {
    return l = l.detail, typeof l == "object" && "data" in l ? l.data : null;
  }
  var $u = !1;
  function Sm(l, t) {
    switch (l) {
      case "compositionend":
        return Ki(t);
      case "keypress":
        return t.which !== 32 ? null : (xi = !0, Vi);
      case "textInput":
        return l = t.data, l === Vi && xi ? null : l;
      default:
        return null;
    }
  }
  function gm(l, t) {
    if ($u)
      return l === "compositionend" || !vf && Li(l, t) ? (l = Bi(), He = af = Ft = null, $u = !1, l) : null;
    switch (l) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length)
            return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return Zi && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var bm = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function Ji(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return t === "input" ? !!bm[l.type] : t === "textarea";
  }
  function wi(l, t, u, a) {
    wu ? Wu ? Wu.push(a) : Wu = [a] : wu = a, t = _n(t, "onChange"), 0 < t.length && (u = new pe(
      "onChange",
      "change",
      null,
      u,
      a
    ), l.push({ event: u, listeners: t }));
  }
  var Ya = null, Ba = null;
  function zm(l) {
    Hy(l, 0);
  }
  function Ce(l) {
    var t = Ha(l);
    if (ri(t)) return l;
  }
  function Wi(l, t) {
    if (l === "change") return t;
  }
  var $i = !1;
  if (Rt) {
    var yf;
    if (Rt) {
      var mf = "oninput" in document;
      if (!mf) {
        var Fi = document.createElement("div");
        Fi.setAttribute("oninput", "return;"), mf = typeof Fi.oninput == "function";
      }
      yf = mf;
    } else yf = !1;
    $i = yf && (!document.documentMode || 9 < document.documentMode);
  }
  function ki() {
    Ya && (Ya.detachEvent("onpropertychange", Ii), Ba = Ya = null);
  }
  function Ii(l) {
    if (l.propertyName === "value" && Ce(Ba)) {
      var t = [];
      wi(
        t,
        Ba,
        l,
        lf(l)
      ), Yi(zm, t);
    }
  }
  function Tm(l, t, u) {
    l === "focusin" ? (ki(), Ya = t, Ba = u, Ya.attachEvent("onpropertychange", Ii)) : l === "focusout" && ki();
  }
  function Em(l) {
    if (l === "selectionchange" || l === "keyup" || l === "keydown")
      return Ce(Ba);
  }
  function Am(l, t) {
    if (l === "click") return Ce(t);
  }
  function _m(l, t) {
    if (l === "input" || l === "change")
      return Ce(t);
  }
  function Om(l, t) {
    return l === t && (l !== 0 || 1 / l === 1 / t) || l !== l && t !== t;
  }
  var Il = typeof Object.is == "function" ? Object.is : Om;
  function Ga(l, t) {
    if (Il(l, t)) return !0;
    if (typeof l != "object" || l === null || typeof t != "object" || t === null)
      return !1;
    var u = Object.keys(l), a = Object.keys(t);
    if (u.length !== a.length) return !1;
    for (a = 0; a < u.length; a++) {
      var e = u[a];
      if (!Zn.call(t, e) || !Il(l[e], t[e]))
        return !1;
    }
    return !0;
  }
  function Pi(l) {
    for (; l && l.firstChild; ) l = l.firstChild;
    return l;
  }
  function l0(l, t) {
    var u = Pi(l);
    l = 0;
    for (var a; u; ) {
      if (u.nodeType === 3) {
        if (a = l + u.textContent.length, l <= t && a >= t)
          return { node: u, offset: t - l };
        l = a;
      }
      l: {
        for (; u; ) {
          if (u.nextSibling) {
            u = u.nextSibling;
            break l;
          }
          u = u.parentNode;
        }
        u = void 0;
      }
      u = Pi(u);
    }
  }
  function t0(l, t) {
    return l && t ? l === t ? !0 : l && l.nodeType === 3 ? !1 : t && t.nodeType === 3 ? t0(l, t.parentNode) : "contains" in l ? l.contains(t) : l.compareDocumentPosition ? !!(l.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function u0(l) {
    l = l != null && l.ownerDocument != null && l.ownerDocument.defaultView != null ? l.ownerDocument.defaultView : window;
    for (var t = Ue(l.document); t instanceof l.HTMLIFrameElement; ) {
      try {
        var u = typeof t.contentWindow.location.href == "string";
      } catch {
        u = !1;
      }
      if (u) l = t.contentWindow;
      else break;
      t = Ue(l.document);
    }
    return t;
  }
  function df(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return t && (t === "input" && (l.type === "text" || l.type === "search" || l.type === "tel" || l.type === "url" || l.type === "password") || t === "textarea" || l.contentEditable === "true");
  }
  var Mm = Rt && "documentMode" in document && 11 >= document.documentMode, Fu = null, sf = null, Qa = null, hf = !1;
  function a0(l, t, u) {
    var a = u.window === u ? u.document : u.nodeType === 9 ? u : u.ownerDocument;
    hf || Fu == null || Fu !== Ue(a) || (a = Fu, "selectionStart" in a && df(a) ? a = { start: a.selectionStart, end: a.selectionEnd } : (a = (a.ownerDocument && a.ownerDocument.defaultView || window).getSelection(), a = {
      anchorNode: a.anchorNode,
      anchorOffset: a.anchorOffset,
      focusNode: a.focusNode,
      focusOffset: a.focusOffset
    }), Qa && Ga(Qa, a) || (Qa = a, a = _n(sf, "onSelect"), 0 < a.length && (t = new pe(
      "onSelect",
      "select",
      null,
      t,
      u
    ), l.push({ event: t, listeners: a }), t.target = Fu)));
  }
  function Ou(l, t) {
    var u = {};
    return u[l.toLowerCase()] = t.toLowerCase(), u["Webkit" + l] = "webkit" + t, u["Moz" + l] = "moz" + t, u;
  }
  var ku = {
    animationend: Ou("Animation", "AnimationEnd"),
    animationiteration: Ou("Animation", "AnimationIteration"),
    animationstart: Ou("Animation", "AnimationStart"),
    transitionrun: Ou("Transition", "TransitionRun"),
    transitionstart: Ou("Transition", "TransitionStart"),
    transitioncancel: Ou("Transition", "TransitionCancel"),
    transitionend: Ou("Transition", "TransitionEnd")
  }, of = {}, e0 = {};
  Rt && (e0 = document.createElement("div").style, "AnimationEvent" in window || (delete ku.animationend.animation, delete ku.animationiteration.animation, delete ku.animationstart.animation), "TransitionEvent" in window || delete ku.transitionend.transition);
  function Mu(l) {
    if (of[l]) return of[l];
    if (!ku[l]) return l;
    var t = ku[l], u;
    for (u in t)
      if (t.hasOwnProperty(u) && u in e0)
        return of[l] = t[u];
    return l;
  }
  var n0 = Mu("animationend"), f0 = Mu("animationiteration"), c0 = Mu("animationstart"), Dm = Mu("transitionrun"), Um = Mu("transitionstart"), rm = Mu("transitioncancel"), i0 = Mu("transitionend"), v0 = /* @__PURE__ */ new Map(), Sf = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Sf.push("scrollEnd");
  function gt(l, t) {
    v0.set(l, t), Au(t, [l]);
  }
  var Ye = typeof reportError == "function" ? reportError : function(l) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof l == "object" && l !== null && typeof l.message == "string" ? String(l.message) : String(l),
        error: l
      });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", l);
      return;
    }
    console.error(l);
  }, it = [], Iu = 0, gf = 0;
  function Be() {
    for (var l = Iu, t = gf = Iu = 0; t < l; ) {
      var u = it[t];
      it[t++] = null;
      var a = it[t];
      it[t++] = null;
      var e = it[t];
      it[t++] = null;
      var n = it[t];
      if (it[t++] = null, a !== null && e !== null) {
        var f = a.pending;
        f === null ? e.next = e : (e.next = f.next, f.next = e), a.pending = e;
      }
      n !== 0 && y0(u, e, n);
    }
  }
  function Ge(l, t, u, a) {
    it[Iu++] = l, it[Iu++] = t, it[Iu++] = u, it[Iu++] = a, gf |= a, l.lanes |= a, l = l.alternate, l !== null && (l.lanes |= a);
  }
  function bf(l, t, u, a) {
    return Ge(l, t, u, a), Qe(l);
  }
  function Du(l, t) {
    return Ge(l, null, null, t), Qe(l);
  }
  function y0(l, t, u) {
    l.lanes |= u;
    var a = l.alternate;
    a !== null && (a.lanes |= u);
    for (var e = !1, n = l.return; n !== null; )
      n.childLanes |= u, a = n.alternate, a !== null && (a.childLanes |= u), n.tag === 22 && (l = n.stateNode, l === null || l._visibility & 1 || (e = !0)), l = n, n = n.return;
    return l.tag === 3 ? (n = l.stateNode, e && t !== null && (e = 31 - kl(u), l = n.hiddenUpdates, a = l[e], a === null ? l[e] = [t] : a.push(t), t.lane = u | 536870912), n) : null;
  }
  function Qe(l) {
    if (50 < fe)
      throw fe = 0, Uc = null, Error(o(185));
    for (var t = l.return; t !== null; )
      l = t, t = l.return;
    return l.tag === 3 ? l.stateNode : null;
  }
  var Pu = {};
  function Hm(l, t, u, a) {
    this.tag = l, this.key = u, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = a, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Pl(l, t, u, a) {
    return new Hm(l, t, u, a);
  }
  function zf(l) {
    return l = l.prototype, !(!l || !l.isReactComponent);
  }
  function pt(l, t) {
    var u = l.alternate;
    return u === null ? (u = Pl(
      l.tag,
      t,
      l.key,
      l.mode
    ), u.elementType = l.elementType, u.type = l.type, u.stateNode = l.stateNode, u.alternate = l, l.alternate = u) : (u.pendingProps = t, u.type = l.type, u.flags = 0, u.subtreeFlags = 0, u.deletions = null), u.flags = l.flags & 65011712, u.childLanes = l.childLanes, u.lanes = l.lanes, u.child = l.child, u.memoizedProps = l.memoizedProps, u.memoizedState = l.memoizedState, u.updateQueue = l.updateQueue, t = l.dependencies, u.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, u.sibling = l.sibling, u.index = l.index, u.ref = l.ref, u.refCleanup = l.refCleanup, u;
  }
  function m0(l, t) {
    l.flags &= 65011714;
    var u = l.alternate;
    return u === null ? (l.childLanes = 0, l.lanes = t, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = u.childLanes, l.lanes = u.lanes, l.child = u.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = u.memoizedProps, l.memoizedState = u.memoizedState, l.updateQueue = u.updateQueue, l.type = u.type, t = u.dependencies, l.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), l;
  }
  function Xe(l, t, u, a, e, n) {
    var f = 0;
    if (a = l, typeof l == "function") zf(l) && (f = 1);
    else if (typeof l == "string")
      f = Cd(
        l,
        u,
        U.current
      ) ? 26 : l === "html" || l === "head" || l === "body" ? 27 : 5;
    else
      l: switch (l) {
        case Et:
          return l = Pl(31, u, t, e), l.elementType = Et, l.lanes = n, l;
        case ql:
          return Uu(u.children, e, n, t);
        case Ut:
          f = 8, e |= 24;
          break;
        case Wl:
          return l = Pl(12, u, t, e | 2), l.elementType = Wl, l.lanes = n, l;
        case Tt:
          return l = Pl(13, u, t, e), l.elementType = Tt, l.lanes = n, l;
        case Gl:
          return l = Pl(19, u, t, e), l.elementType = Gl, l.lanes = n, l;
        default:
          if (typeof l == "object" && l !== null)
            switch (l.$$typeof) {
              case Nl:
                f = 10;
                break l;
              case wt:
                f = 9;
                break l;
              case nt:
                f = 11;
                break l;
              case x:
                f = 14;
                break l;
              case Ql:
                f = 16, a = null;
                break l;
            }
          f = 29, u = Error(
            o(130, l === null ? "null" : typeof l, "")
          ), a = null;
      }
    return t = Pl(f, u, t, e), t.elementType = l, t.type = a, t.lanes = n, t;
  }
  function Uu(l, t, u, a) {
    return l = Pl(7, l, a, t), l.lanes = u, l;
  }
  function Tf(l, t, u) {
    return l = Pl(6, l, null, t), l.lanes = u, l;
  }
  function d0(l) {
    var t = Pl(18, null, null, 0);
    return t.stateNode = l, t;
  }
  function Ef(l, t, u) {
    return t = Pl(
      4,
      l.children !== null ? l.children : [],
      l.key,
      t
    ), t.lanes = u, t.stateNode = {
      containerInfo: l.containerInfo,
      pendingChildren: null,
      implementation: l.implementation
    }, t;
  }
  var s0 = /* @__PURE__ */ new WeakMap();
  function vt(l, t) {
    if (typeof l == "object" && l !== null) {
      var u = s0.get(l);
      return u !== void 0 ? u : (t = {
        value: l,
        source: t,
        stack: di(t)
      }, s0.set(l, t), t);
    }
    return {
      value: l,
      source: t,
      stack: di(t)
    };
  }
  var la = [], ta = 0, je = null, Xa = 0, yt = [], mt = 0, kt = null, _t = 1, Ot = "";
  function qt(l, t) {
    la[ta++] = Xa, la[ta++] = je, je = l, Xa = t;
  }
  function h0(l, t, u) {
    yt[mt++] = _t, yt[mt++] = Ot, yt[mt++] = kt, kt = l;
    var a = _t;
    l = Ot;
    var e = 32 - kl(a) - 1;
    a &= ~(1 << e), u += 1;
    var n = 32 - kl(t) + e;
    if (30 < n) {
      var f = e - e % 5;
      n = (a & (1 << f) - 1).toString(32), a >>= f, e -= f, _t = 1 << 32 - kl(t) + e | u << e | a, Ot = n + l;
    } else
      _t = 1 << n | u << e | a, Ot = l;
  }
  function Af(l) {
    l.return !== null && (qt(l, 1), h0(l, 1, 0));
  }
  function _f(l) {
    for (; l === je; )
      je = la[--ta], la[ta] = null, Xa = la[--ta], la[ta] = null;
    for (; l === kt; )
      kt = yt[--mt], yt[mt] = null, Ot = yt[--mt], yt[mt] = null, _t = yt[--mt], yt[mt] = null;
  }
  function o0(l, t) {
    yt[mt++] = _t, yt[mt++] = Ot, yt[mt++] = kt, _t = t.id, Ot = t.overflow, kt = l;
  }
  var Dl = null, nl = null, L = !1, It = null, dt = !1, Of = Error(o(519));
  function Pt(l) {
    var t = Error(
      o(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw ja(vt(t, l)), Of;
  }
  function S0(l) {
    var t = l.stateNode, u = l.type, a = l.memoizedProps;
    switch (t[Ml] = l, t[jl] = a, u) {
      case "dialog":
        j("cancel", t), j("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        j("load", t);
        break;
      case "video":
      case "audio":
        for (u = 0; u < ie.length; u++)
          j(ie[u], t);
        break;
      case "source":
        j("error", t);
        break;
      case "img":
      case "image":
      case "link":
        j("error", t), j("load", t);
        break;
      case "details":
        j("toggle", t);
        break;
      case "input":
        j("invalid", t), Hi(
          t,
          a.value,
          a.defaultValue,
          a.checked,
          a.defaultChecked,
          a.type,
          a.name,
          !0
        );
        break;
      case "select":
        j("invalid", t);
        break;
      case "textarea":
        j("invalid", t), Ri(t, a.value, a.defaultValue, a.children);
    }
    u = a.children, typeof u != "string" && typeof u != "number" && typeof u != "bigint" || t.textContent === "" + u || a.suppressHydrationWarning === !0 || qy(t.textContent, u) ? (a.popover != null && (j("beforetoggle", t), j("toggle", t)), a.onScroll != null && j("scroll", t), a.onScrollEnd != null && j("scrollend", t), a.onClick != null && (t.onclick = Nt), t = !0) : t = !1, t || Pt(l, !0);
  }
  function g0(l) {
    for (Dl = l.return; Dl; )
      switch (Dl.tag) {
        case 5:
        case 31:
        case 13:
          dt = !1;
          return;
        case 27:
        case 3:
          dt = !0;
          return;
        default:
          Dl = Dl.return;
      }
  }
  function ua(l) {
    if (l !== Dl) return !1;
    if (!L) return g0(l), L = !0, !1;
    var t = l.tag, u;
    if ((u = t !== 3 && t !== 27) && ((u = t === 5) && (u = l.type, u = !(u !== "form" && u !== "button") || Vc(l.type, l.memoizedProps)), u = !u), u && nl && Pt(l), g0(l), t === 13) {
      if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(o(317));
      nl = Vy(l);
    } else if (t === 31) {
      if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(o(317));
      nl = Vy(l);
    } else
      t === 27 ? (t = nl, su(l.type) ? (l = wc, wc = null, nl = l) : nl = t) : nl = Dl ? ht(l.stateNode.nextSibling) : null;
    return !0;
  }
  function ru() {
    nl = Dl = null, L = !1;
  }
  function Mf() {
    var l = It;
    return l !== null && (Kl === null ? Kl = l : Kl.push.apply(
      Kl,
      l
    ), It = null), l;
  }
  function ja(l) {
    It === null ? It = [l] : It.push(l);
  }
  var Df = y(null), Hu = null, Ct = null;
  function lu(l, t, u) {
    M(Df, t._currentValue), t._currentValue = u;
  }
  function Yt(l) {
    l._currentValue = Df.current, E(Df);
  }
  function Uf(l, t, u) {
    for (; l !== null; ) {
      var a = l.alternate;
      if ((l.childLanes & t) !== t ? (l.childLanes |= t, a !== null && (a.childLanes |= t)) : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t), l === u) break;
      l = l.return;
    }
  }
  function rf(l, t, u, a) {
    var e = l.child;
    for (e !== null && (e.return = l); e !== null; ) {
      var n = e.dependencies;
      if (n !== null) {
        var f = e.child;
        n = n.firstContext;
        l: for (; n !== null; ) {
          var c = n;
          n = e;
          for (var i = 0; i < t.length; i++)
            if (c.context === t[i]) {
              n.lanes |= u, c = n.alternate, c !== null && (c.lanes |= u), Uf(
                n.return,
                u,
                l
              ), a || (f = null);
              break l;
            }
          n = c.next;
        }
      } else if (e.tag === 18) {
        if (f = e.return, f === null) throw Error(o(341));
        f.lanes |= u, n = f.alternate, n !== null && (n.lanes |= u), Uf(f, u, l), f = null;
      } else f = e.child;
      if (f !== null) f.return = e;
      else
        for (f = e; f !== null; ) {
          if (f === l) {
            f = null;
            break;
          }
          if (e = f.sibling, e !== null) {
            e.return = f.return, f = e;
            break;
          }
          f = f.return;
        }
      e = f;
    }
  }
  function aa(l, t, u, a) {
    l = null;
    for (var e = t, n = !1; e !== null; ) {
      if (!n) {
        if ((e.flags & 524288) !== 0) n = !0;
        else if ((e.flags & 262144) !== 0) break;
      }
      if (e.tag === 10) {
        var f = e.alternate;
        if (f === null) throw Error(o(387));
        if (f = f.memoizedProps, f !== null) {
          var c = e.type;
          Il(e.pendingProps.value, f.value) || (l !== null ? l.push(c) : l = [c]);
        }
      } else if (e === F.current) {
        if (f = e.alternate, f === null) throw Error(o(387));
        f.memoizedState.memoizedState !== e.memoizedState.memoizedState && (l !== null ? l.push(se) : l = [se]);
      }
      e = e.return;
    }
    l !== null && rf(
      t,
      l,
      u,
      a
    ), t.flags |= 262144;
  }
  function Ze(l) {
    for (l = l.firstContext; l !== null; ) {
      if (!Il(
        l.context._currentValue,
        l.memoizedValue
      ))
        return !0;
      l = l.next;
    }
    return !1;
  }
  function Nu(l) {
    Hu = l, Ct = null, l = l.dependencies, l !== null && (l.firstContext = null);
  }
  function Ul(l) {
    return b0(Hu, l);
  }
  function Ve(l, t) {
    return Hu === null && Nu(l), b0(l, t);
  }
  function b0(l, t) {
    var u = t._currentValue;
    if (t = { context: t, memoizedValue: u, next: null }, Ct === null) {
      if (l === null) throw Error(o(308));
      Ct = t, l.dependencies = { lanes: 0, firstContext: t }, l.flags |= 524288;
    } else Ct = Ct.next = t;
    return u;
  }
  var Nm = typeof AbortController < "u" ? AbortController : function() {
    var l = [], t = this.signal = {
      aborted: !1,
      addEventListener: function(u, a) {
        l.push(a);
      }
    };
    this.abort = function() {
      t.aborted = !0, l.forEach(function(u) {
        return u();
      });
    };
  }, Rm = _.unstable_scheduleCallback, pm = _.unstable_NormalPriority, gl = {
    $$typeof: Nl,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function Hf() {
    return {
      controller: new Nm(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Za(l) {
    l.refCount--, l.refCount === 0 && Rm(pm, function() {
      l.controller.abort();
    });
  }
  var Va = null, Nf = 0, ea = 0, na = null;
  function qm(l, t) {
    if (Va === null) {
      var u = Va = [];
      Nf = 0, ea = qc(), na = {
        status: "pending",
        value: void 0,
        then: function(a) {
          u.push(a);
        }
      };
    }
    return Nf++, t.then(z0, z0), t;
  }
  function z0() {
    if (--Nf === 0 && Va !== null) {
      na !== null && (na.status = "fulfilled");
      var l = Va;
      Va = null, ea = 0, na = null;
      for (var t = 0; t < l.length; t++) (0, l[t])();
    }
  }
  function Cm(l, t) {
    var u = [], a = {
      status: "pending",
      value: null,
      reason: null,
      then: function(e) {
        u.push(e);
      }
    };
    return l.then(
      function() {
        a.status = "fulfilled", a.value = t;
        for (var e = 0; e < u.length; e++) (0, u[e])(t);
      },
      function(e) {
        for (a.status = "rejected", a.reason = e, e = 0; e < u.length; e++)
          (0, u[e])(void 0);
      }
    ), a;
  }
  var T0 = b.S;
  b.S = function(l, t) {
    ay = $l(), typeof t == "object" && t !== null && typeof t.then == "function" && qm(l, t), T0 !== null && T0(l, t);
  };
  var Ru = y(null);
  function Rf() {
    var l = Ru.current;
    return l !== null ? l : el.pooledCache;
  }
  function xe(l, t) {
    t === null ? M(Ru, Ru.current) : M(Ru, t.pool);
  }
  function E0() {
    var l = Rf();
    return l === null ? null : { parent: gl._currentValue, pool: l };
  }
  var fa = Error(o(460)), pf = Error(o(474)), Le = Error(o(542)), Ke = { then: function() {
  } };
  function A0(l) {
    return l = l.status, l === "fulfilled" || l === "rejected";
  }
  function _0(l, t, u) {
    switch (u = l[u], u === void 0 ? l.push(t) : u !== t && (t.then(Nt, Nt), t = u), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw l = t.reason, M0(l), l;
      default:
        if (typeof t.status == "string") t.then(Nt, Nt);
        else {
          if (l = el, l !== null && 100 < l.shellSuspendCounter)
            throw Error(o(482));
          l = t, l.status = "pending", l.then(
            function(a) {
              if (t.status === "pending") {
                var e = t;
                e.status = "fulfilled", e.value = a;
              }
            },
            function(a) {
              if (t.status === "pending") {
                var e = t;
                e.status = "rejected", e.reason = a;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw l = t.reason, M0(l), l;
        }
        throw qu = t, fa;
    }
  }
  function pu(l) {
    try {
      var t = l._init;
      return t(l._payload);
    } catch (u) {
      throw u !== null && typeof u == "object" && typeof u.then == "function" ? (qu = u, fa) : u;
    }
  }
  var qu = null;
  function O0() {
    if (qu === null) throw Error(o(459));
    var l = qu;
    return qu = null, l;
  }
  function M0(l) {
    if (l === fa || l === Le)
      throw Error(o(483));
  }
  var ca = null, xa = 0;
  function Je(l) {
    var t = xa;
    return xa += 1, ca === null && (ca = []), _0(ca, l, t);
  }
  function La(l, t) {
    t = t.props.ref, l.ref = t !== void 0 ? t : null;
  }
  function we(l, t) {
    throw t.$$typeof === cl ? Error(o(525)) : (l = Object.prototype.toString.call(t), Error(
      o(
        31,
        l === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : l
      )
    ));
  }
  function D0(l) {
    function t(m, v) {
      if (l) {
        var d = m.deletions;
        d === null ? (m.deletions = [v], m.flags |= 16) : d.push(v);
      }
    }
    function u(m, v) {
      if (!l) return null;
      for (; v !== null; )
        t(m, v), v = v.sibling;
      return null;
    }
    function a(m) {
      for (var v = /* @__PURE__ */ new Map(); m !== null; )
        m.key !== null ? v.set(m.key, m) : v.set(m.index, m), m = m.sibling;
      return v;
    }
    function e(m, v) {
      return m = pt(m, v), m.index = 0, m.sibling = null, m;
    }
    function n(m, v, d) {
      return m.index = d, l ? (d = m.alternate, d !== null ? (d = d.index, d < v ? (m.flags |= 67108866, v) : d) : (m.flags |= 67108866, v)) : (m.flags |= 1048576, v);
    }
    function f(m) {
      return l && m.alternate === null && (m.flags |= 67108866), m;
    }
    function c(m, v, d, z) {
      return v === null || v.tag !== 6 ? (v = Tf(d, m.mode, z), v.return = m, v) : (v = e(v, d), v.return = m, v);
    }
    function i(m, v, d, z) {
      var H = d.type;
      return H === ql ? g(
        m,
        v,
        d.props.children,
        z,
        d.key
      ) : v !== null && (v.elementType === H || typeof H == "object" && H !== null && H.$$typeof === Ql && pu(H) === v.type) ? (v = e(v, d.props), La(v, d), v.return = m, v) : (v = Xe(
        d.type,
        d.key,
        d.props,
        null,
        m.mode,
        z
      ), La(v, d), v.return = m, v);
    }
    function s(m, v, d, z) {
      return v === null || v.tag !== 4 || v.stateNode.containerInfo !== d.containerInfo || v.stateNode.implementation !== d.implementation ? (v = Ef(d, m.mode, z), v.return = m, v) : (v = e(v, d.children || []), v.return = m, v);
    }
    function g(m, v, d, z, H) {
      return v === null || v.tag !== 7 ? (v = Uu(
        d,
        m.mode,
        z,
        H
      ), v.return = m, v) : (v = e(v, d), v.return = m, v);
    }
    function T(m, v, d) {
      if (typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint")
        return v = Tf(
          "" + v,
          m.mode,
          d
        ), v.return = m, v;
      if (typeof v == "object" && v !== null) {
        switch (v.$$typeof) {
          case wl:
            return d = Xe(
              v.type,
              v.key,
              v.props,
              null,
              m.mode,
              d
            ), La(d, v), d.return = m, d;
          case Bl:
            return v = Ef(
              v,
              m.mode,
              d
            ), v.return = m, v;
          case Ql:
            return v = pu(v), T(m, v, d);
        }
        if (St(v) || Xl(v))
          return v = Uu(
            v,
            m.mode,
            d,
            null
          ), v.return = m, v;
        if (typeof v.then == "function")
          return T(m, Je(v), d);
        if (v.$$typeof === Nl)
          return T(
            m,
            Ve(m, v),
            d
          );
        we(m, v);
      }
      return null;
    }
    function h(m, v, d, z) {
      var H = v !== null ? v.key : null;
      if (typeof d == "string" && d !== "" || typeof d == "number" || typeof d == "bigint")
        return H !== null ? null : c(m, v, "" + d, z);
      if (typeof d == "object" && d !== null) {
        switch (d.$$typeof) {
          case wl:
            return d.key === H ? i(m, v, d, z) : null;
          case Bl:
            return d.key === H ? s(m, v, d, z) : null;
          case Ql:
            return d = pu(d), h(m, v, d, z);
        }
        if (St(d) || Xl(d))
          return H !== null ? null : g(m, v, d, z, null);
        if (typeof d.then == "function")
          return h(
            m,
            v,
            Je(d),
            z
          );
        if (d.$$typeof === Nl)
          return h(
            m,
            v,
            Ve(m, d),
            z
          );
        we(m, d);
      }
      return null;
    }
    function S(m, v, d, z, H) {
      if (typeof z == "string" && z !== "" || typeof z == "number" || typeof z == "bigint")
        return m = m.get(d) || null, c(v, m, "" + z, H);
      if (typeof z == "object" && z !== null) {
        switch (z.$$typeof) {
          case wl:
            return m = m.get(
              z.key === null ? d : z.key
            ) || null, i(v, m, z, H);
          case Bl:
            return m = m.get(
              z.key === null ? d : z.key
            ) || null, s(v, m, z, H);
          case Ql:
            return z = pu(z), S(
              m,
              v,
              d,
              z,
              H
            );
        }
        if (St(z) || Xl(z))
          return m = m.get(d) || null, g(v, m, z, H, null);
        if (typeof z.then == "function")
          return S(
            m,
            v,
            d,
            Je(z),
            H
          );
        if (z.$$typeof === Nl)
          return S(
            m,
            v,
            d,
            Ve(v, z),
            H
          );
        we(v, z);
      }
      return null;
    }
    function D(m, v, d, z) {
      for (var H = null, K = null, r = v, G = v = 0, V = null; r !== null && G < d.length; G++) {
        r.index > G ? (V = r, r = null) : V = r.sibling;
        var J = h(
          m,
          r,
          d[G],
          z
        );
        if (J === null) {
          r === null && (r = V);
          break;
        }
        l && r && J.alternate === null && t(m, r), v = n(J, v, G), K === null ? H = J : K.sibling = J, K = J, r = V;
      }
      if (G === d.length)
        return u(m, r), L && qt(m, G), H;
      if (r === null) {
        for (; G < d.length; G++)
          r = T(m, d[G], z), r !== null && (v = n(
            r,
            v,
            G
          ), K === null ? H = r : K.sibling = r, K = r);
        return L && qt(m, G), H;
      }
      for (r = a(r); G < d.length; G++)
        V = S(
          r,
          m,
          G,
          d[G],
          z
        ), V !== null && (l && V.alternate !== null && r.delete(
          V.key === null ? G : V.key
        ), v = n(
          V,
          v,
          G
        ), K === null ? H = V : K.sibling = V, K = V);
      return l && r.forEach(function(bu) {
        return t(m, bu);
      }), L && qt(m, G), H;
    }
    function R(m, v, d, z) {
      if (d == null) throw Error(o(151));
      for (var H = null, K = null, r = v, G = v = 0, V = null, J = d.next(); r !== null && !J.done; G++, J = d.next()) {
        r.index > G ? (V = r, r = null) : V = r.sibling;
        var bu = h(m, r, J.value, z);
        if (bu === null) {
          r === null && (r = V);
          break;
        }
        l && r && bu.alternate === null && t(m, r), v = n(bu, v, G), K === null ? H = bu : K.sibling = bu, K = bu, r = V;
      }
      if (J.done)
        return u(m, r), L && qt(m, G), H;
      if (r === null) {
        for (; !J.done; G++, J = d.next())
          J = T(m, J.value, z), J !== null && (v = n(J, v, G), K === null ? H = J : K.sibling = J, K = J);
        return L && qt(m, G), H;
      }
      for (r = a(r); !J.done; G++, J = d.next())
        J = S(r, m, G, J.value, z), J !== null && (l && J.alternate !== null && r.delete(J.key === null ? G : J.key), v = n(J, v, G), K === null ? H = J : K.sibling = J, K = J);
      return l && r.forEach(function(Kd) {
        return t(m, Kd);
      }), L && qt(m, G), H;
    }
    function ul(m, v, d, z) {
      if (typeof d == "object" && d !== null && d.type === ql && d.key === null && (d = d.props.children), typeof d == "object" && d !== null) {
        switch (d.$$typeof) {
          case wl:
            l: {
              for (var H = d.key; v !== null; ) {
                if (v.key === H) {
                  if (H = d.type, H === ql) {
                    if (v.tag === 7) {
                      u(
                        m,
                        v.sibling
                      ), z = e(
                        v,
                        d.props.children
                      ), z.return = m, m = z;
                      break l;
                    }
                  } else if (v.elementType === H || typeof H == "object" && H !== null && H.$$typeof === Ql && pu(H) === v.type) {
                    u(
                      m,
                      v.sibling
                    ), z = e(v, d.props), La(z, d), z.return = m, m = z;
                    break l;
                  }
                  u(m, v);
                  break;
                } else t(m, v);
                v = v.sibling;
              }
              d.type === ql ? (z = Uu(
                d.props.children,
                m.mode,
                z,
                d.key
              ), z.return = m, m = z) : (z = Xe(
                d.type,
                d.key,
                d.props,
                null,
                m.mode,
                z
              ), La(z, d), z.return = m, m = z);
            }
            return f(m);
          case Bl:
            l: {
              for (H = d.key; v !== null; ) {
                if (v.key === H)
                  if (v.tag === 4 && v.stateNode.containerInfo === d.containerInfo && v.stateNode.implementation === d.implementation) {
                    u(
                      m,
                      v.sibling
                    ), z = e(v, d.children || []), z.return = m, m = z;
                    break l;
                  } else {
                    u(m, v);
                    break;
                  }
                else t(m, v);
                v = v.sibling;
              }
              z = Ef(d, m.mode, z), z.return = m, m = z;
            }
            return f(m);
          case Ql:
            return d = pu(d), ul(
              m,
              v,
              d,
              z
            );
        }
        if (St(d))
          return D(
            m,
            v,
            d,
            z
          );
        if (Xl(d)) {
          if (H = Xl(d), typeof H != "function") throw Error(o(150));
          return d = H.call(d), R(
            m,
            v,
            d,
            z
          );
        }
        if (typeof d.then == "function")
          return ul(
            m,
            v,
            Je(d),
            z
          );
        if (d.$$typeof === Nl)
          return ul(
            m,
            v,
            Ve(m, d),
            z
          );
        we(m, d);
      }
      return typeof d == "string" && d !== "" || typeof d == "number" || typeof d == "bigint" ? (d = "" + d, v !== null && v.tag === 6 ? (u(m, v.sibling), z = e(v, d), z.return = m, m = z) : (u(m, v), z = Tf(d, m.mode, z), z.return = m, m = z), f(m)) : u(m, v);
    }
    return function(m, v, d, z) {
      try {
        xa = 0;
        var H = ul(
          m,
          v,
          d,
          z
        );
        return ca = null, H;
      } catch (r) {
        if (r === fa || r === Le) throw r;
        var K = Pl(29, r, null, m.mode);
        return K.lanes = z, K.return = m, K;
      }
    };
  }
  var Cu = D0(!0), U0 = D0(!1), tu = !1;
  function qf(l) {
    l.updateQueue = {
      baseState: l.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function Cf(l, t) {
    l = l.updateQueue, t.updateQueue === l && (t.updateQueue = {
      baseState: l.baseState,
      firstBaseUpdate: l.firstBaseUpdate,
      lastBaseUpdate: l.lastBaseUpdate,
      shared: l.shared,
      callbacks: null
    });
  }
  function uu(l) {
    return { lane: l, tag: 0, payload: null, callback: null, next: null };
  }
  function au(l, t, u) {
    var a = l.updateQueue;
    if (a === null) return null;
    if (a = a.shared, (w & 2) !== 0) {
      var e = a.pending;
      return e === null ? t.next = t : (t.next = e.next, e.next = t), a.pending = t, t = Qe(l), y0(l, null, u), t;
    }
    return Ge(l, a, t, u), Qe(l);
  }
  function Ka(l, t, u) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (u & 4194048) !== 0)) {
      var a = t.lanes;
      a &= l.pendingLanes, u |= a, t.lanes = u, bi(l, u);
    }
  }
  function Yf(l, t) {
    var u = l.updateQueue, a = l.alternate;
    if (a !== null && (a = a.updateQueue, u === a)) {
      var e = null, n = null;
      if (u = u.firstBaseUpdate, u !== null) {
        do {
          var f = {
            lane: u.lane,
            tag: u.tag,
            payload: u.payload,
            callback: null,
            next: null
          };
          n === null ? e = n = f : n = n.next = f, u = u.next;
        } while (u !== null);
        n === null ? e = n = t : n = n.next = t;
      } else e = n = t;
      u = {
        baseState: a.baseState,
        firstBaseUpdate: e,
        lastBaseUpdate: n,
        shared: a.shared,
        callbacks: a.callbacks
      }, l.updateQueue = u;
      return;
    }
    l = u.lastBaseUpdate, l === null ? u.firstBaseUpdate = t : l.next = t, u.lastBaseUpdate = t;
  }
  var Bf = !1;
  function Ja() {
    if (Bf) {
      var l = na;
      if (l !== null) throw l;
    }
  }
  function wa(l, t, u, a) {
    Bf = !1;
    var e = l.updateQueue;
    tu = !1;
    var n = e.firstBaseUpdate, f = e.lastBaseUpdate, c = e.shared.pending;
    if (c !== null) {
      e.shared.pending = null;
      var i = c, s = i.next;
      i.next = null, f === null ? n = s : f.next = s, f = i;
      var g = l.alternate;
      g !== null && (g = g.updateQueue, c = g.lastBaseUpdate, c !== f && (c === null ? g.firstBaseUpdate = s : c.next = s, g.lastBaseUpdate = i));
    }
    if (n !== null) {
      var T = e.baseState;
      f = 0, g = s = i = null, c = n;
      do {
        var h = c.lane & -536870913, S = h !== c.lane;
        if (S ? (Z & h) === h : (a & h) === h) {
          h !== 0 && h === ea && (Bf = !0), g !== null && (g = g.next = {
            lane: 0,
            tag: c.tag,
            payload: c.payload,
            callback: null,
            next: null
          });
          l: {
            var D = l, R = c;
            h = t;
            var ul = u;
            switch (R.tag) {
              case 1:
                if (D = R.payload, typeof D == "function") {
                  T = D.call(ul, T, h);
                  break l;
                }
                T = D;
                break l;
              case 3:
                D.flags = D.flags & -65537 | 128;
              case 0:
                if (D = R.payload, h = typeof D == "function" ? D.call(ul, T, h) : D, h == null) break l;
                T = p({}, T, h);
                break l;
              case 2:
                tu = !0;
            }
          }
          h = c.callback, h !== null && (l.flags |= 64, S && (l.flags |= 8192), S = e.callbacks, S === null ? e.callbacks = [h] : S.push(h));
        } else
          S = {
            lane: h,
            tag: c.tag,
            payload: c.payload,
            callback: c.callback,
            next: null
          }, g === null ? (s = g = S, i = T) : g = g.next = S, f |= h;
        if (c = c.next, c === null) {
          if (c = e.shared.pending, c === null)
            break;
          S = c, c = S.next, S.next = null, e.lastBaseUpdate = S, e.shared.pending = null;
        }
      } while (!0);
      g === null && (i = T), e.baseState = i, e.firstBaseUpdate = s, e.lastBaseUpdate = g, n === null && (e.shared.lanes = 0), iu |= f, l.lanes = f, l.memoizedState = T;
    }
  }
  function r0(l, t) {
    if (typeof l != "function")
      throw Error(o(191, l));
    l.call(t);
  }
  function H0(l, t) {
    var u = l.callbacks;
    if (u !== null)
      for (l.callbacks = null, l = 0; l < u.length; l++)
        r0(u[l], t);
  }
  var ia = y(null), We = y(0);
  function N0(l, t) {
    l = Lt, M(We, l), M(ia, t), Lt = l | t.baseLanes;
  }
  function Gf() {
    M(We, Lt), M(ia, ia.current);
  }
  function Qf() {
    Lt = We.current, E(ia), E(We);
  }
  var lt = y(null), st = null;
  function eu(l) {
    var t = l.alternate;
    M(ol, ol.current & 1), M(lt, l), st === null && (t === null || ia.current !== null || t.memoizedState !== null) && (st = l);
  }
  function Xf(l) {
    M(ol, ol.current), M(lt, l), st === null && (st = l);
  }
  function R0(l) {
    l.tag === 22 ? (M(ol, ol.current), M(lt, l), st === null && (st = l)) : nu();
  }
  function nu() {
    M(ol, ol.current), M(lt, lt.current);
  }
  function tt(l) {
    E(lt), st === l && (st = null), E(ol);
  }
  var ol = y(0);
  function $e(l) {
    for (var t = l; t !== null; ) {
      if (t.tag === 13) {
        var u = t.memoizedState;
        if (u !== null && (u = u.dehydrated, u === null || Kc(u) || Jc(u)))
          return t;
      } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === l) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === l) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var Bt = 0, B = null, ll = null, bl = null, Fe = !1, va = !1, Yu = !1, ke = 0, Wa = 0, ya = null, Ym = 0;
  function ml() {
    throw Error(o(321));
  }
  function jf(l, t) {
    if (t === null) return !1;
    for (var u = 0; u < t.length && u < l.length; u++)
      if (!Il(l[u], t[u])) return !1;
    return !0;
  }
  function Zf(l, t, u, a, e, n) {
    return Bt = n, B = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, b.H = l === null || l.memoizedState === null ? hv : uc, Yu = !1, n = u(a, e), Yu = !1, va && (n = q0(
      t,
      u,
      a,
      e
    )), p0(l), n;
  }
  function p0(l) {
    b.H = ka;
    var t = ll !== null && ll.next !== null;
    if (Bt = 0, bl = ll = B = null, Fe = !1, Wa = 0, ya = null, t) throw Error(o(300));
    l === null || zl || (l = l.dependencies, l !== null && Ze(l) && (zl = !0));
  }
  function q0(l, t, u, a) {
    B = l;
    var e = 0;
    do {
      if (va && (ya = null), Wa = 0, va = !1, 25 <= e) throw Error(o(301));
      if (e += 1, bl = ll = null, l.updateQueue != null) {
        var n = l.updateQueue;
        n.lastEffect = null, n.events = null, n.stores = null, n.memoCache != null && (n.memoCache.index = 0);
      }
      b.H = ov, n = t(u, a);
    } while (va);
    return n;
  }
  function Bm() {
    var l = b.H, t = l.useState()[0];
    return t = typeof t.then == "function" ? $a(t) : t, l = l.useState()[0], (ll !== null ? ll.memoizedState : null) !== l && (B.flags |= 1024), t;
  }
  function Vf() {
    var l = ke !== 0;
    return ke = 0, l;
  }
  function xf(l, t, u) {
    t.updateQueue = l.updateQueue, t.flags &= -2053, l.lanes &= ~u;
  }
  function Lf(l) {
    if (Fe) {
      for (l = l.memoizedState; l !== null; ) {
        var t = l.queue;
        t !== null && (t.pending = null), l = l.next;
      }
      Fe = !1;
    }
    Bt = 0, bl = ll = B = null, va = !1, Wa = ke = 0, ya = null;
  }
  function Yl() {
    var l = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return bl === null ? B.memoizedState = bl = l : bl = bl.next = l, bl;
  }
  function Sl() {
    if (ll === null) {
      var l = B.alternate;
      l = l !== null ? l.memoizedState : null;
    } else l = ll.next;
    var t = bl === null ? B.memoizedState : bl.next;
    if (t !== null)
      bl = t, ll = l;
    else {
      if (l === null)
        throw B.alternate === null ? Error(o(467)) : Error(o(310));
      ll = l, l = {
        memoizedState: ll.memoizedState,
        baseState: ll.baseState,
        baseQueue: ll.baseQueue,
        queue: ll.queue,
        next: null
      }, bl === null ? B.memoizedState = bl = l : bl = bl.next = l;
    }
    return bl;
  }
  function Ie() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function $a(l) {
    var t = Wa;
    return Wa += 1, ya === null && (ya = []), l = _0(ya, l, t), t = B, (bl === null ? t.memoizedState : bl.next) === null && (t = t.alternate, b.H = t === null || t.memoizedState === null ? hv : uc), l;
  }
  function Pe(l) {
    if (l !== null && typeof l == "object") {
      if (typeof l.then == "function") return $a(l);
      if (l.$$typeof === Nl) return Ul(l);
    }
    throw Error(o(438, String(l)));
  }
  function Kf(l) {
    var t = null, u = B.updateQueue;
    if (u !== null && (t = u.memoCache), t == null) {
      var a = B.alternate;
      a !== null && (a = a.updateQueue, a !== null && (a = a.memoCache, a != null && (t = {
        data: a.data.map(function(e) {
          return e.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), u === null && (u = Ie(), B.updateQueue = u), u.memoCache = t, u = t.data[t.index], u === void 0)
      for (u = t.data[t.index] = Array(l), a = 0; a < l; a++)
        u[a] = Xu;
    return t.index++, u;
  }
  function Gt(l, t) {
    return typeof t == "function" ? t(l) : t;
  }
  function ln(l) {
    var t = Sl();
    return Jf(t, ll, l);
  }
  function Jf(l, t, u) {
    var a = l.queue;
    if (a === null) throw Error(o(311));
    a.lastRenderedReducer = u;
    var e = l.baseQueue, n = a.pending;
    if (n !== null) {
      if (e !== null) {
        var f = e.next;
        e.next = n.next, n.next = f;
      }
      t.baseQueue = e = n, a.pending = null;
    }
    if (n = l.baseState, e === null) l.memoizedState = n;
    else {
      t = e.next;
      var c = f = null, i = null, s = t, g = !1;
      do {
        var T = s.lane & -536870913;
        if (T !== s.lane ? (Z & T) === T : (Bt & T) === T) {
          var h = s.revertLane;
          if (h === 0)
            i !== null && (i = i.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: s.action,
              hasEagerState: s.hasEagerState,
              eagerState: s.eagerState,
              next: null
            }), T === ea && (g = !0);
          else if ((Bt & h) === h) {
            s = s.next, h === ea && (g = !0);
            continue;
          } else
            T = {
              lane: 0,
              revertLane: s.revertLane,
              gesture: null,
              action: s.action,
              hasEagerState: s.hasEagerState,
              eagerState: s.eagerState,
              next: null
            }, i === null ? (c = i = T, f = n) : i = i.next = T, B.lanes |= h, iu |= h;
          T = s.action, Yu && u(n, T), n = s.hasEagerState ? s.eagerState : u(n, T);
        } else
          h = {
            lane: T,
            revertLane: s.revertLane,
            gesture: s.gesture,
            action: s.action,
            hasEagerState: s.hasEagerState,
            eagerState: s.eagerState,
            next: null
          }, i === null ? (c = i = h, f = n) : i = i.next = h, B.lanes |= T, iu |= T;
        s = s.next;
      } while (s !== null && s !== t);
      if (i === null ? f = n : i.next = c, !Il(n, l.memoizedState) && (zl = !0, g && (u = na, u !== null)))
        throw u;
      l.memoizedState = n, l.baseState = f, l.baseQueue = i, a.lastRenderedState = n;
    }
    return e === null && (a.lanes = 0), [l.memoizedState, a.dispatch];
  }
  function wf(l) {
    var t = Sl(), u = t.queue;
    if (u === null) throw Error(o(311));
    u.lastRenderedReducer = l;
    var a = u.dispatch, e = u.pending, n = t.memoizedState;
    if (e !== null) {
      u.pending = null;
      var f = e = e.next;
      do
        n = l(n, f.action), f = f.next;
      while (f !== e);
      Il(n, t.memoizedState) || (zl = !0), t.memoizedState = n, t.baseQueue === null && (t.baseState = n), u.lastRenderedState = n;
    }
    return [n, a];
  }
  function C0(l, t, u) {
    var a = B, e = Sl(), n = L;
    if (n) {
      if (u === void 0) throw Error(o(407));
      u = u();
    } else u = t();
    var f = !Il(
      (ll || e).memoizedState,
      u
    );
    if (f && (e.memoizedState = u, zl = !0), e = e.queue, Ff(G0.bind(null, a, e, l), [
      l
    ]), e.getSnapshot !== t || f || bl !== null && bl.memoizedState.tag & 1) {
      if (a.flags |= 2048, ma(
        9,
        { destroy: void 0 },
        B0.bind(
          null,
          a,
          e,
          u,
          t
        ),
        null
      ), el === null) throw Error(o(349));
      n || (Bt & 127) !== 0 || Y0(a, t, u);
    }
    return u;
  }
  function Y0(l, t, u) {
    l.flags |= 16384, l = { getSnapshot: t, value: u }, t = B.updateQueue, t === null ? (t = Ie(), B.updateQueue = t, t.stores = [l]) : (u = t.stores, u === null ? t.stores = [l] : u.push(l));
  }
  function B0(l, t, u, a) {
    t.value = u, t.getSnapshot = a, Q0(t) && X0(l);
  }
  function G0(l, t, u) {
    return u(function() {
      Q0(t) && X0(l);
    });
  }
  function Q0(l) {
    var t = l.getSnapshot;
    l = l.value;
    try {
      var u = t();
      return !Il(l, u);
    } catch {
      return !0;
    }
  }
  function X0(l) {
    var t = Du(l, 2);
    t !== null && Jl(t, l, 2);
  }
  function Wf(l) {
    var t = Yl();
    if (typeof l == "function") {
      var u = l;
      if (l = u(), Yu) {
        Wt(!0);
        try {
          u();
        } finally {
          Wt(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = l, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Gt,
      lastRenderedState: l
    }, t;
  }
  function j0(l, t, u, a) {
    return l.baseState = u, Jf(
      l,
      ll,
      typeof a == "function" ? a : Gt
    );
  }
  function Gm(l, t, u, a, e) {
    if (an(l)) throw Error(o(485));
    if (l = t.action, l !== null) {
      var n = {
        payload: e,
        action: l,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(f) {
          n.listeners.push(f);
        }
      };
      b.T !== null ? u(!0) : n.isTransition = !1, a(n), u = t.pending, u === null ? (n.next = t.pending = n, Z0(t, n)) : (n.next = u.next, t.pending = u.next = n);
    }
  }
  function Z0(l, t) {
    var u = t.action, a = t.payload, e = l.state;
    if (t.isTransition) {
      var n = b.T, f = {};
      b.T = f;
      try {
        var c = u(e, a), i = b.S;
        i !== null && i(f, c), V0(l, t, c);
      } catch (s) {
        $f(l, t, s);
      } finally {
        n !== null && f.types !== null && (n.types = f.types), b.T = n;
      }
    } else
      try {
        n = u(e, a), V0(l, t, n);
      } catch (s) {
        $f(l, t, s);
      }
  }
  function V0(l, t, u) {
    u !== null && typeof u == "object" && typeof u.then == "function" ? u.then(
      function(a) {
        x0(l, t, a);
      },
      function(a) {
        return $f(l, t, a);
      }
    ) : x0(l, t, u);
  }
  function x0(l, t, u) {
    t.status = "fulfilled", t.value = u, L0(t), l.state = u, t = l.pending, t !== null && (u = t.next, u === t ? l.pending = null : (u = u.next, t.next = u, Z0(l, u)));
  }
  function $f(l, t, u) {
    var a = l.pending;
    if (l.pending = null, a !== null) {
      a = a.next;
      do
        t.status = "rejected", t.reason = u, L0(t), t = t.next;
      while (t !== a);
    }
    l.action = null;
  }
  function L0(l) {
    l = l.listeners;
    for (var t = 0; t < l.length; t++) (0, l[t])();
  }
  function K0(l, t) {
    return t;
  }
  function J0(l, t) {
    if (L) {
      var u = el.formState;
      if (u !== null) {
        l: {
          var a = B;
          if (L) {
            if (nl) {
              t: {
                for (var e = nl, n = dt; e.nodeType !== 8; ) {
                  if (!n) {
                    e = null;
                    break t;
                  }
                  if (e = ht(
                    e.nextSibling
                  ), e === null) {
                    e = null;
                    break t;
                  }
                }
                n = e.data, e = n === "F!" || n === "F" ? e : null;
              }
              if (e) {
                nl = ht(
                  e.nextSibling
                ), a = e.data === "F!";
                break l;
              }
            }
            Pt(a);
          }
          a = !1;
        }
        a && (t = u[0]);
      }
    }
    return u = Yl(), u.memoizedState = u.baseState = t, a = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: K0,
      lastRenderedState: t
    }, u.queue = a, u = mv.bind(
      null,
      B,
      a
    ), a.dispatch = u, a = Wf(!1), n = tc.bind(
      null,
      B,
      !1,
      a.queue
    ), a = Yl(), e = {
      state: t,
      dispatch: null,
      action: l,
      pending: null
    }, a.queue = e, u = Gm.bind(
      null,
      B,
      e,
      n,
      u
    ), e.dispatch = u, a.memoizedState = l, [t, u, !1];
  }
  function w0(l) {
    var t = Sl();
    return W0(t, ll, l);
  }
  function W0(l, t, u) {
    if (t = Jf(
      l,
      t,
      K0
    )[0], l = ln(Gt)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var a = $a(t);
      } catch (f) {
        throw f === fa ? Le : f;
      }
    else a = t;
    t = Sl();
    var e = t.queue, n = e.dispatch;
    return u !== t.memoizedState && (B.flags |= 2048, ma(
      9,
      { destroy: void 0 },
      Qm.bind(null, e, u),
      null
    )), [a, n, l];
  }
  function Qm(l, t) {
    l.action = t;
  }
  function $0(l) {
    var t = Sl(), u = ll;
    if (u !== null)
      return W0(t, u, l);
    Sl(), t = t.memoizedState, u = Sl();
    var a = u.queue.dispatch;
    return u.memoizedState = l, [t, a, !1];
  }
  function ma(l, t, u, a) {
    return l = { tag: l, create: u, deps: a, inst: t, next: null }, t = B.updateQueue, t === null && (t = Ie(), B.updateQueue = t), u = t.lastEffect, u === null ? t.lastEffect = l.next = l : (a = u.next, u.next = l, l.next = a, t.lastEffect = l), l;
  }
  function F0() {
    return Sl().memoizedState;
  }
  function tn(l, t, u, a) {
    var e = Yl();
    B.flags |= l, e.memoizedState = ma(
      1 | t,
      { destroy: void 0 },
      u,
      a === void 0 ? null : a
    );
  }
  function un(l, t, u, a) {
    var e = Sl();
    a = a === void 0 ? null : a;
    var n = e.memoizedState.inst;
    ll !== null && a !== null && jf(a, ll.memoizedState.deps) ? e.memoizedState = ma(t, n, u, a) : (B.flags |= l, e.memoizedState = ma(
      1 | t,
      n,
      u,
      a
    ));
  }
  function k0(l, t) {
    tn(8390656, 8, l, t);
  }
  function Ff(l, t) {
    un(2048, 8, l, t);
  }
  function Xm(l) {
    B.flags |= 4;
    var t = B.updateQueue;
    if (t === null)
      t = Ie(), B.updateQueue = t, t.events = [l];
    else {
      var u = t.events;
      u === null ? t.events = [l] : u.push(l);
    }
  }
  function I0(l) {
    var t = Sl().memoizedState;
    return Xm({ ref: t, nextImpl: l }), function() {
      if ((w & 2) !== 0) throw Error(o(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function P0(l, t) {
    return un(4, 2, l, t);
  }
  function lv(l, t) {
    return un(4, 4, l, t);
  }
  function tv(l, t) {
    if (typeof t == "function") {
      l = l();
      var u = t(l);
      return function() {
        typeof u == "function" ? u() : t(null);
      };
    }
    if (t != null)
      return l = l(), t.current = l, function() {
        t.current = null;
      };
  }
  function uv(l, t, u) {
    u = u != null ? u.concat([l]) : null, un(4, 4, tv.bind(null, t, l), u);
  }
  function kf() {
  }
  function av(l, t) {
    var u = Sl();
    t = t === void 0 ? null : t;
    var a = u.memoizedState;
    return t !== null && jf(t, a[1]) ? a[0] : (u.memoizedState = [l, t], l);
  }
  function ev(l, t) {
    var u = Sl();
    t = t === void 0 ? null : t;
    var a = u.memoizedState;
    if (t !== null && jf(t, a[1]))
      return a[0];
    if (a = l(), Yu) {
      Wt(!0);
      try {
        l();
      } finally {
        Wt(!1);
      }
    }
    return u.memoizedState = [a, t], a;
  }
  function If(l, t, u) {
    return u === void 0 || (Bt & 1073741824) !== 0 && (Z & 261930) === 0 ? l.memoizedState = t : (l.memoizedState = u, l = ny(), B.lanes |= l, iu |= l, u);
  }
  function nv(l, t, u, a) {
    return Il(u, t) ? u : ia.current !== null ? (l = If(l, u, a), Il(l, t) || (zl = !0), l) : (Bt & 42) === 0 || (Bt & 1073741824) !== 0 && (Z & 261930) === 0 ? (zl = !0, l.memoizedState = u) : (l = ny(), B.lanes |= l, iu |= l, t);
  }
  function fv(l, t, u, a, e) {
    var n = O.p;
    O.p = n !== 0 && 8 > n ? n : 8;
    var f = b.T, c = {};
    b.T = c, tc(l, !1, t, u);
    try {
      var i = e(), s = b.S;
      if (s !== null && s(c, i), i !== null && typeof i == "object" && typeof i.then == "function") {
        var g = Cm(
          i,
          a
        );
        Fa(
          l,
          t,
          g,
          et(l)
        );
      } else
        Fa(
          l,
          t,
          a,
          et(l)
        );
    } catch (T) {
      Fa(
        l,
        t,
        { then: function() {
        }, status: "rejected", reason: T },
        et()
      );
    } finally {
      O.p = n, f !== null && c.types !== null && (f.types = c.types), b.T = f;
    }
  }
  function jm() {
  }
  function Pf(l, t, u, a) {
    if (l.tag !== 5) throw Error(o(476));
    var e = cv(l).queue;
    fv(
      l,
      e,
      t,
      q,
      u === null ? jm : function() {
        return iv(l), u(a);
      }
    );
  }
  function cv(l) {
    var t = l.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: q,
      baseState: q,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Gt,
        lastRenderedState: q
      },
      next: null
    };
    var u = {};
    return t.next = {
      memoizedState: u,
      baseState: u,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Gt,
        lastRenderedState: u
      },
      next: null
    }, l.memoizedState = t, l = l.alternate, l !== null && (l.memoizedState = t), t;
  }
  function iv(l) {
    var t = cv(l);
    t.next === null && (t = l.alternate.memoizedState), Fa(
      l,
      t.next.queue,
      {},
      et()
    );
  }
  function lc() {
    return Ul(se);
  }
  function vv() {
    return Sl().memoizedState;
  }
  function yv() {
    return Sl().memoizedState;
  }
  function Zm(l) {
    for (var t = l.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var u = et();
          l = uu(u);
          var a = au(t, l, u);
          a !== null && (Jl(a, t, u), Ka(a, t, u)), t = { cache: Hf() }, l.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function Vm(l, t, u) {
    var a = et();
    u = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: u,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, an(l) ? dv(t, u) : (u = bf(l, t, u, a), u !== null && (Jl(u, l, a), sv(u, t, a)));
  }
  function mv(l, t, u) {
    var a = et();
    Fa(l, t, u, a);
  }
  function Fa(l, t, u, a) {
    var e = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: u,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (an(l)) dv(t, e);
    else {
      var n = l.alternate;
      if (l.lanes === 0 && (n === null || n.lanes === 0) && (n = t.lastRenderedReducer, n !== null))
        try {
          var f = t.lastRenderedState, c = n(f, u);
          if (e.hasEagerState = !0, e.eagerState = c, Il(c, f))
            return Ge(l, t, e, 0), el === null && Be(), !1;
        } catch {
        }
      if (u = bf(l, t, e, a), u !== null)
        return Jl(u, l, a), sv(u, t, a), !0;
    }
    return !1;
  }
  function tc(l, t, u, a) {
    if (a = {
      lane: 2,
      revertLane: qc(),
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, an(l)) {
      if (t) throw Error(o(479));
    } else
      t = bf(
        l,
        u,
        a,
        2
      ), t !== null && Jl(t, l, 2);
  }
  function an(l) {
    var t = l.alternate;
    return l === B || t !== null && t === B;
  }
  function dv(l, t) {
    va = Fe = !0;
    var u = l.pending;
    u === null ? t.next = t : (t.next = u.next, u.next = t), l.pending = t;
  }
  function sv(l, t, u) {
    if ((u & 4194048) !== 0) {
      var a = t.lanes;
      a &= l.pendingLanes, u |= a, t.lanes = u, bi(l, u);
    }
  }
  var ka = {
    readContext: Ul,
    use: Pe,
    useCallback: ml,
    useContext: ml,
    useEffect: ml,
    useImperativeHandle: ml,
    useLayoutEffect: ml,
    useInsertionEffect: ml,
    useMemo: ml,
    useReducer: ml,
    useRef: ml,
    useState: ml,
    useDebugValue: ml,
    useDeferredValue: ml,
    useTransition: ml,
    useSyncExternalStore: ml,
    useId: ml,
    useHostTransitionStatus: ml,
    useFormState: ml,
    useActionState: ml,
    useOptimistic: ml,
    useMemoCache: ml,
    useCacheRefresh: ml
  };
  ka.useEffectEvent = ml;
  var hv = {
    readContext: Ul,
    use: Pe,
    useCallback: function(l, t) {
      return Yl().memoizedState = [
        l,
        t === void 0 ? null : t
      ], l;
    },
    useContext: Ul,
    useEffect: k0,
    useImperativeHandle: function(l, t, u) {
      u = u != null ? u.concat([l]) : null, tn(
        4194308,
        4,
        tv.bind(null, t, l),
        u
      );
    },
    useLayoutEffect: function(l, t) {
      return tn(4194308, 4, l, t);
    },
    useInsertionEffect: function(l, t) {
      tn(4, 2, l, t);
    },
    useMemo: function(l, t) {
      var u = Yl();
      t = t === void 0 ? null : t;
      var a = l();
      if (Yu) {
        Wt(!0);
        try {
          l();
        } finally {
          Wt(!1);
        }
      }
      return u.memoizedState = [a, t], a;
    },
    useReducer: function(l, t, u) {
      var a = Yl();
      if (u !== void 0) {
        var e = u(t);
        if (Yu) {
          Wt(!0);
          try {
            u(t);
          } finally {
            Wt(!1);
          }
        }
      } else e = t;
      return a.memoizedState = a.baseState = e, l = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: l,
        lastRenderedState: e
      }, a.queue = l, l = l.dispatch = Vm.bind(
        null,
        B,
        l
      ), [a.memoizedState, l];
    },
    useRef: function(l) {
      var t = Yl();
      return l = { current: l }, t.memoizedState = l;
    },
    useState: function(l) {
      l = Wf(l);
      var t = l.queue, u = mv.bind(null, B, t);
      return t.dispatch = u, [l.memoizedState, u];
    },
    useDebugValue: kf,
    useDeferredValue: function(l, t) {
      var u = Yl();
      return If(u, l, t);
    },
    useTransition: function() {
      var l = Wf(!1);
      return l = fv.bind(
        null,
        B,
        l.queue,
        !0,
        !1
      ), Yl().memoizedState = l, [!1, l];
    },
    useSyncExternalStore: function(l, t, u) {
      var a = B, e = Yl();
      if (L) {
        if (u === void 0)
          throw Error(o(407));
        u = u();
      } else {
        if (u = t(), el === null)
          throw Error(o(349));
        (Z & 127) !== 0 || Y0(a, t, u);
      }
      e.memoizedState = u;
      var n = { value: u, getSnapshot: t };
      return e.queue = n, k0(G0.bind(null, a, n, l), [
        l
      ]), a.flags |= 2048, ma(
        9,
        { destroy: void 0 },
        B0.bind(
          null,
          a,
          n,
          u,
          t
        ),
        null
      ), u;
    },
    useId: function() {
      var l = Yl(), t = el.identifierPrefix;
      if (L) {
        var u = Ot, a = _t;
        u = (a & ~(1 << 32 - kl(a) - 1)).toString(32) + u, t = "_" + t + "R_" + u, u = ke++, 0 < u && (t += "H" + u.toString(32)), t += "_";
      } else
        u = Ym++, t = "_" + t + "r_" + u.toString(32) + "_";
      return l.memoizedState = t;
    },
    useHostTransitionStatus: lc,
    useFormState: J0,
    useActionState: J0,
    useOptimistic: function(l) {
      var t = Yl();
      t.memoizedState = t.baseState = l;
      var u = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = u, t = tc.bind(
        null,
        B,
        !0,
        u
      ), u.dispatch = t, [l, t];
    },
    useMemoCache: Kf,
    useCacheRefresh: function() {
      return Yl().memoizedState = Zm.bind(
        null,
        B
      );
    },
    useEffectEvent: function(l) {
      var t = Yl(), u = { impl: l };
      return t.memoizedState = u, function() {
        if ((w & 2) !== 0)
          throw Error(o(440));
        return u.impl.apply(void 0, arguments);
      };
    }
  }, uc = {
    readContext: Ul,
    use: Pe,
    useCallback: av,
    useContext: Ul,
    useEffect: Ff,
    useImperativeHandle: uv,
    useInsertionEffect: P0,
    useLayoutEffect: lv,
    useMemo: ev,
    useReducer: ln,
    useRef: F0,
    useState: function() {
      return ln(Gt);
    },
    useDebugValue: kf,
    useDeferredValue: function(l, t) {
      var u = Sl();
      return nv(
        u,
        ll.memoizedState,
        l,
        t
      );
    },
    useTransition: function() {
      var l = ln(Gt)[0], t = Sl().memoizedState;
      return [
        typeof l == "boolean" ? l : $a(l),
        t
      ];
    },
    useSyncExternalStore: C0,
    useId: vv,
    useHostTransitionStatus: lc,
    useFormState: w0,
    useActionState: w0,
    useOptimistic: function(l, t) {
      var u = Sl();
      return j0(u, ll, l, t);
    },
    useMemoCache: Kf,
    useCacheRefresh: yv
  };
  uc.useEffectEvent = I0;
  var ov = {
    readContext: Ul,
    use: Pe,
    useCallback: av,
    useContext: Ul,
    useEffect: Ff,
    useImperativeHandle: uv,
    useInsertionEffect: P0,
    useLayoutEffect: lv,
    useMemo: ev,
    useReducer: wf,
    useRef: F0,
    useState: function() {
      return wf(Gt);
    },
    useDebugValue: kf,
    useDeferredValue: function(l, t) {
      var u = Sl();
      return ll === null ? If(u, l, t) : nv(
        u,
        ll.memoizedState,
        l,
        t
      );
    },
    useTransition: function() {
      var l = wf(Gt)[0], t = Sl().memoizedState;
      return [
        typeof l == "boolean" ? l : $a(l),
        t
      ];
    },
    useSyncExternalStore: C0,
    useId: vv,
    useHostTransitionStatus: lc,
    useFormState: $0,
    useActionState: $0,
    useOptimistic: function(l, t) {
      var u = Sl();
      return ll !== null ? j0(u, ll, l, t) : (u.baseState = l, [l, u.queue.dispatch]);
    },
    useMemoCache: Kf,
    useCacheRefresh: yv
  };
  ov.useEffectEvent = I0;
  function ac(l, t, u, a) {
    t = l.memoizedState, u = u(a, t), u = u == null ? t : p({}, t, u), l.memoizedState = u, l.lanes === 0 && (l.updateQueue.baseState = u);
  }
  var ec = {
    enqueueSetState: function(l, t, u) {
      l = l._reactInternals;
      var a = et(), e = uu(a);
      e.payload = t, u != null && (e.callback = u), t = au(l, e, a), t !== null && (Jl(t, l, a), Ka(t, l, a));
    },
    enqueueReplaceState: function(l, t, u) {
      l = l._reactInternals;
      var a = et(), e = uu(a);
      e.tag = 1, e.payload = t, u != null && (e.callback = u), t = au(l, e, a), t !== null && (Jl(t, l, a), Ka(t, l, a));
    },
    enqueueForceUpdate: function(l, t) {
      l = l._reactInternals;
      var u = et(), a = uu(u);
      a.tag = 2, t != null && (a.callback = t), t = au(l, a, u), t !== null && (Jl(t, l, u), Ka(t, l, u));
    }
  };
  function Sv(l, t, u, a, e, n, f) {
    return l = l.stateNode, typeof l.shouldComponentUpdate == "function" ? l.shouldComponentUpdate(a, n, f) : t.prototype && t.prototype.isPureReactComponent ? !Ga(u, a) || !Ga(e, n) : !0;
  }
  function gv(l, t, u, a) {
    l = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(u, a), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(u, a), t.state !== l && ec.enqueueReplaceState(t, t.state, null);
  }
  function Bu(l, t) {
    var u = t;
    if ("ref" in t) {
      u = {};
      for (var a in t)
        a !== "ref" && (u[a] = t[a]);
    }
    if (l = l.defaultProps) {
      u === t && (u = p({}, u));
      for (var e in l)
        u[e] === void 0 && (u[e] = l[e]);
    }
    return u;
  }
  function bv(l) {
    Ye(l);
  }
  function zv(l) {
    console.error(l);
  }
  function Tv(l) {
    Ye(l);
  }
  function en(l, t) {
    try {
      var u = l.onUncaughtError;
      u(t.value, { componentStack: t.stack });
    } catch (a) {
      setTimeout(function() {
        throw a;
      });
    }
  }
  function Ev(l, t, u) {
    try {
      var a = l.onCaughtError;
      a(u.value, {
        componentStack: u.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (e) {
      setTimeout(function() {
        throw e;
      });
    }
  }
  function nc(l, t, u) {
    return u = uu(u), u.tag = 3, u.payload = { element: null }, u.callback = function() {
      en(l, t);
    }, u;
  }
  function Av(l) {
    return l = uu(l), l.tag = 3, l;
  }
  function _v(l, t, u, a) {
    var e = u.type.getDerivedStateFromError;
    if (typeof e == "function") {
      var n = a.value;
      l.payload = function() {
        return e(n);
      }, l.callback = function() {
        Ev(t, u, a);
      };
    }
    var f = u.stateNode;
    f !== null && typeof f.componentDidCatch == "function" && (l.callback = function() {
      Ev(t, u, a), typeof e != "function" && (vu === null ? vu = /* @__PURE__ */ new Set([this]) : vu.add(this));
      var c = a.stack;
      this.componentDidCatch(a.value, {
        componentStack: c !== null ? c : ""
      });
    });
  }
  function xm(l, t, u, a, e) {
    if (u.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
      if (t = u.alternate, t !== null && aa(
        t,
        u,
        e,
        !0
      ), u = lt.current, u !== null) {
        switch (u.tag) {
          case 31:
          case 13:
            return st === null ? gn() : u.alternate === null && dl === 0 && (dl = 3), u.flags &= -257, u.flags |= 65536, u.lanes = e, a === Ke ? u.flags |= 16384 : (t = u.updateQueue, t === null ? u.updateQueue = /* @__PURE__ */ new Set([a]) : t.add(a), Nc(l, a, e)), !1;
          case 22:
            return u.flags |= 65536, a === Ke ? u.flags |= 16384 : (t = u.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([a])
            }, u.updateQueue = t) : (u = t.retryQueue, u === null ? t.retryQueue = /* @__PURE__ */ new Set([a]) : u.add(a)), Nc(l, a, e)), !1;
        }
        throw Error(o(435, u.tag));
      }
      return Nc(l, a, e), gn(), !1;
    }
    if (L)
      return t = lt.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = e, a !== Of && (l = Error(o(422), { cause: a }), ja(vt(l, u)))) : (a !== Of && (t = Error(o(423), {
        cause: a
      }), ja(
        vt(t, u)
      )), l = l.current.alternate, l.flags |= 65536, e &= -e, l.lanes |= e, a = vt(a, u), e = nc(
        l.stateNode,
        a,
        e
      ), Yf(l, e), dl !== 4 && (dl = 2)), !1;
    var n = Error(o(520), { cause: a });
    if (n = vt(n, u), ne === null ? ne = [n] : ne.push(n), dl !== 4 && (dl = 2), t === null) return !0;
    a = vt(a, u), u = t;
    do {
      switch (u.tag) {
        case 3:
          return u.flags |= 65536, l = e & -e, u.lanes |= l, l = nc(u.stateNode, a, l), Yf(u, l), !1;
        case 1:
          if (t = u.type, n = u.stateNode, (u.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || n !== null && typeof n.componentDidCatch == "function" && (vu === null || !vu.has(n))))
            return u.flags |= 65536, e &= -e, u.lanes |= e, e = Av(e), _v(
              e,
              l,
              u,
              a
            ), Yf(u, e), !1;
      }
      u = u.return;
    } while (u !== null);
    return !1;
  }
  var fc = Error(o(461)), zl = !1;
  function rl(l, t, u, a) {
    t.child = l === null ? U0(t, null, u, a) : Cu(
      t,
      l.child,
      u,
      a
    );
  }
  function Ov(l, t, u, a, e) {
    u = u.render;
    var n = t.ref;
    if ("ref" in a) {
      var f = {};
      for (var c in a)
        c !== "ref" && (f[c] = a[c]);
    } else f = a;
    return Nu(t), a = Zf(
      l,
      t,
      u,
      f,
      n,
      e
    ), c = Vf(), l !== null && !zl ? (xf(l, t, e), Qt(l, t, e)) : (L && c && Af(t), t.flags |= 1, rl(l, t, a, e), t.child);
  }
  function Mv(l, t, u, a, e) {
    if (l === null) {
      var n = u.type;
      return typeof n == "function" && !zf(n) && n.defaultProps === void 0 && u.compare === null ? (t.tag = 15, t.type = n, Dv(
        l,
        t,
        n,
        a,
        e
      )) : (l = Xe(
        u.type,
        null,
        a,
        t,
        t.mode,
        e
      ), l.ref = t.ref, l.return = t, t.child = l);
    }
    if (n = l.child, !hc(l, e)) {
      var f = n.memoizedProps;
      if (u = u.compare, u = u !== null ? u : Ga, u(f, a) && l.ref === t.ref)
        return Qt(l, t, e);
    }
    return t.flags |= 1, l = pt(n, a), l.ref = t.ref, l.return = t, t.child = l;
  }
  function Dv(l, t, u, a, e) {
    if (l !== null) {
      var n = l.memoizedProps;
      if (Ga(n, a) && l.ref === t.ref)
        if (zl = !1, t.pendingProps = a = n, hc(l, e))
          (l.flags & 131072) !== 0 && (zl = !0);
        else
          return t.lanes = l.lanes, Qt(l, t, e);
    }
    return cc(
      l,
      t,
      u,
      a,
      e
    );
  }
  function Uv(l, t, u, a) {
    var e = a.children, n = l !== null ? l.memoizedState : null;
    if (l === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), a.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (n = n !== null ? n.baseLanes | u : u, l !== null) {
          for (a = t.child = l.child, e = 0; a !== null; )
            e = e | a.lanes | a.childLanes, a = a.sibling;
          a = e & ~n;
        } else a = 0, t.child = null;
        return rv(
          l,
          t,
          n,
          u,
          a
        );
      }
      if ((u & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, l !== null && xe(
          t,
          n !== null ? n.cachePool : null
        ), n !== null ? N0(t, n) : Gf(), R0(t);
      else
        return a = t.lanes = 536870912, rv(
          l,
          t,
          n !== null ? n.baseLanes | u : u,
          u,
          a
        );
    } else
      n !== null ? (xe(t, n.cachePool), N0(t, n), nu(), t.memoizedState = null) : (l !== null && xe(t, null), Gf(), nu());
    return rl(l, t, e, u), t.child;
  }
  function Ia(l, t) {
    return l !== null && l.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function rv(l, t, u, a, e) {
    var n = Rf();
    return n = n === null ? null : { parent: gl._currentValue, pool: n }, t.memoizedState = {
      baseLanes: u,
      cachePool: n
    }, l !== null && xe(t, null), Gf(), R0(t), l !== null && aa(l, t, a, !0), t.childLanes = e, null;
  }
  function nn(l, t) {
    return t = cn(
      { mode: t.mode, children: t.children },
      l.mode
    ), t.ref = l.ref, l.child = t, t.return = l, t;
  }
  function Hv(l, t, u) {
    return Cu(t, l.child, null, u), l = nn(t, t.pendingProps), l.flags |= 2, tt(t), t.memoizedState = null, l;
  }
  function Lm(l, t, u) {
    var a = t.pendingProps, e = (t.flags & 128) !== 0;
    if (t.flags &= -129, l === null) {
      if (L) {
        if (a.mode === "hidden")
          return l = nn(t, a), t.lanes = 536870912, Ia(null, l);
        if (Xf(t), (l = nl) ? (l = Zy(
          l,
          dt
        ), l = l !== null && l.data === "&" ? l : null, l !== null && (t.memoizedState = {
          dehydrated: l,
          treeContext: kt !== null ? { id: _t, overflow: Ot } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, u = d0(l), u.return = t, t.child = u, Dl = t, nl = null)) : l = null, l === null) throw Pt(t);
        return t.lanes = 536870912, null;
      }
      return nn(t, a);
    }
    var n = l.memoizedState;
    if (n !== null) {
      var f = n.dehydrated;
      if (Xf(t), e)
        if (t.flags & 256)
          t.flags &= -257, t = Hv(
            l,
            t,
            u
          );
        else if (t.memoizedState !== null)
          t.child = l.child, t.flags |= 128, t = null;
        else throw Error(o(558));
      else if (zl || aa(l, t, u, !1), e = (u & l.childLanes) !== 0, zl || e) {
        if (a = el, a !== null && (f = zi(a, u), f !== 0 && f !== n.retryLane))
          throw n.retryLane = f, Du(l, f), Jl(a, l, f), fc;
        gn(), t = Hv(
          l,
          t,
          u
        );
      } else
        l = n.treeContext, nl = ht(f.nextSibling), Dl = t, L = !0, It = null, dt = !1, l !== null && o0(t, l), t = nn(t, a), t.flags |= 4096;
      return t;
    }
    return l = pt(l.child, {
      mode: a.mode,
      children: a.children
    }), l.ref = t.ref, t.child = l, l.return = t, l;
  }
  function fn(l, t) {
    var u = t.ref;
    if (u === null)
      l !== null && l.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof u != "function" && typeof u != "object")
        throw Error(o(284));
      (l === null || l.ref !== u) && (t.flags |= 4194816);
    }
  }
  function cc(l, t, u, a, e) {
    return Nu(t), u = Zf(
      l,
      t,
      u,
      a,
      void 0,
      e
    ), a = Vf(), l !== null && !zl ? (xf(l, t, e), Qt(l, t, e)) : (L && a && Af(t), t.flags |= 1, rl(l, t, u, e), t.child);
  }
  function Nv(l, t, u, a, e, n) {
    return Nu(t), t.updateQueue = null, u = q0(
      t,
      a,
      u,
      e
    ), p0(l), a = Vf(), l !== null && !zl ? (xf(l, t, n), Qt(l, t, n)) : (L && a && Af(t), t.flags |= 1, rl(l, t, u, n), t.child);
  }
  function Rv(l, t, u, a, e) {
    if (Nu(t), t.stateNode === null) {
      var n = Pu, f = u.contextType;
      typeof f == "object" && f !== null && (n = Ul(f)), n = new u(a, n), t.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = ec, t.stateNode = n, n._reactInternals = t, n = t.stateNode, n.props = a, n.state = t.memoizedState, n.refs = {}, qf(t), f = u.contextType, n.context = typeof f == "object" && f !== null ? Ul(f) : Pu, n.state = t.memoizedState, f = u.getDerivedStateFromProps, typeof f == "function" && (ac(
        t,
        u,
        f,
        a
      ), n.state = t.memoizedState), typeof u.getDerivedStateFromProps == "function" || typeof n.getSnapshotBeforeUpdate == "function" || typeof n.UNSAFE_componentWillMount != "function" && typeof n.componentWillMount != "function" || (f = n.state, typeof n.componentWillMount == "function" && n.componentWillMount(), typeof n.UNSAFE_componentWillMount == "function" && n.UNSAFE_componentWillMount(), f !== n.state && ec.enqueueReplaceState(n, n.state, null), wa(t, a, n, e), Ja(), n.state = t.memoizedState), typeof n.componentDidMount == "function" && (t.flags |= 4194308), a = !0;
    } else if (l === null) {
      n = t.stateNode;
      var c = t.memoizedProps, i = Bu(u, c);
      n.props = i;
      var s = n.context, g = u.contextType;
      f = Pu, typeof g == "object" && g !== null && (f = Ul(g));
      var T = u.getDerivedStateFromProps;
      g = typeof T == "function" || typeof n.getSnapshotBeforeUpdate == "function", c = t.pendingProps !== c, g || typeof n.UNSAFE_componentWillReceiveProps != "function" && typeof n.componentWillReceiveProps != "function" || (c || s !== f) && gv(
        t,
        n,
        a,
        f
      ), tu = !1;
      var h = t.memoizedState;
      n.state = h, wa(t, a, n, e), Ja(), s = t.memoizedState, c || h !== s || tu ? (typeof T == "function" && (ac(
        t,
        u,
        T,
        a
      ), s = t.memoizedState), (i = tu || Sv(
        t,
        u,
        i,
        a,
        h,
        s,
        f
      )) ? (g || typeof n.UNSAFE_componentWillMount != "function" && typeof n.componentWillMount != "function" || (typeof n.componentWillMount == "function" && n.componentWillMount(), typeof n.UNSAFE_componentWillMount == "function" && n.UNSAFE_componentWillMount()), typeof n.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof n.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = a, t.memoizedState = s), n.props = a, n.state = s, n.context = f, a = i) : (typeof n.componentDidMount == "function" && (t.flags |= 4194308), a = !1);
    } else {
      n = t.stateNode, Cf(l, t), f = t.memoizedProps, g = Bu(u, f), n.props = g, T = t.pendingProps, h = n.context, s = u.contextType, i = Pu, typeof s == "object" && s !== null && (i = Ul(s)), c = u.getDerivedStateFromProps, (s = typeof c == "function" || typeof n.getSnapshotBeforeUpdate == "function") || typeof n.UNSAFE_componentWillReceiveProps != "function" && typeof n.componentWillReceiveProps != "function" || (f !== T || h !== i) && gv(
        t,
        n,
        a,
        i
      ), tu = !1, h = t.memoizedState, n.state = h, wa(t, a, n, e), Ja();
      var S = t.memoizedState;
      f !== T || h !== S || tu || l !== null && l.dependencies !== null && Ze(l.dependencies) ? (typeof c == "function" && (ac(
        t,
        u,
        c,
        a
      ), S = t.memoizedState), (g = tu || Sv(
        t,
        u,
        g,
        a,
        h,
        S,
        i
      ) || l !== null && l.dependencies !== null && Ze(l.dependencies)) ? (s || typeof n.UNSAFE_componentWillUpdate != "function" && typeof n.componentWillUpdate != "function" || (typeof n.componentWillUpdate == "function" && n.componentWillUpdate(a, S, i), typeof n.UNSAFE_componentWillUpdate == "function" && n.UNSAFE_componentWillUpdate(
        a,
        S,
        i
      )), typeof n.componentDidUpdate == "function" && (t.flags |= 4), typeof n.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof n.componentDidUpdate != "function" || f === l.memoizedProps && h === l.memoizedState || (t.flags |= 4), typeof n.getSnapshotBeforeUpdate != "function" || f === l.memoizedProps && h === l.memoizedState || (t.flags |= 1024), t.memoizedProps = a, t.memoizedState = S), n.props = a, n.state = S, n.context = i, a = g) : (typeof n.componentDidUpdate != "function" || f === l.memoizedProps && h === l.memoizedState || (t.flags |= 4), typeof n.getSnapshotBeforeUpdate != "function" || f === l.memoizedProps && h === l.memoizedState || (t.flags |= 1024), a = !1);
    }
    return n = a, fn(l, t), a = (t.flags & 128) !== 0, n || a ? (n = t.stateNode, u = a && typeof u.getDerivedStateFromError != "function" ? null : n.render(), t.flags |= 1, l !== null && a ? (t.child = Cu(
      t,
      l.child,
      null,
      e
    ), t.child = Cu(
      t,
      null,
      u,
      e
    )) : rl(l, t, u, e), t.memoizedState = n.state, l = t.child) : l = Qt(
      l,
      t,
      e
    ), l;
  }
  function pv(l, t, u, a) {
    return ru(), t.flags |= 256, rl(l, t, u, a), t.child;
  }
  var ic = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function vc(l) {
    return { baseLanes: l, cachePool: E0() };
  }
  function yc(l, t, u) {
    return l = l !== null ? l.childLanes & ~u : 0, t && (l |= at), l;
  }
  function qv(l, t, u) {
    var a = t.pendingProps, e = !1, n = (t.flags & 128) !== 0, f;
    if ((f = n) || (f = l !== null && l.memoizedState === null ? !1 : (ol.current & 2) !== 0), f && (e = !0, t.flags &= -129), f = (t.flags & 32) !== 0, t.flags &= -33, l === null) {
      if (L) {
        if (e ? eu(t) : nu(), (l = nl) ? (l = Zy(
          l,
          dt
        ), l = l !== null && l.data !== "&" ? l : null, l !== null && (t.memoizedState = {
          dehydrated: l,
          treeContext: kt !== null ? { id: _t, overflow: Ot } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, u = d0(l), u.return = t, t.child = u, Dl = t, nl = null)) : l = null, l === null) throw Pt(t);
        return Jc(l) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var c = a.children;
      return a = a.fallback, e ? (nu(), e = t.mode, c = cn(
        { mode: "hidden", children: c },
        e
      ), a = Uu(
        a,
        e,
        u,
        null
      ), c.return = t, a.return = t, c.sibling = a, t.child = c, a = t.child, a.memoizedState = vc(u), a.childLanes = yc(
        l,
        f,
        u
      ), t.memoizedState = ic, Ia(null, a)) : (eu(t), mc(t, c));
    }
    var i = l.memoizedState;
    if (i !== null && (c = i.dehydrated, c !== null)) {
      if (n)
        t.flags & 256 ? (eu(t), t.flags &= -257, t = dc(
          l,
          t,
          u
        )) : t.memoizedState !== null ? (nu(), t.child = l.child, t.flags |= 128, t = null) : (nu(), c = a.fallback, e = t.mode, a = cn(
          { mode: "visible", children: a.children },
          e
        ), c = Uu(
          c,
          e,
          u,
          null
        ), c.flags |= 2, a.return = t, c.return = t, a.sibling = c, t.child = a, Cu(
          t,
          l.child,
          null,
          u
        ), a = t.child, a.memoizedState = vc(u), a.childLanes = yc(
          l,
          f,
          u
        ), t.memoizedState = ic, t = Ia(null, a));
      else if (eu(t), Jc(c)) {
        if (f = c.nextSibling && c.nextSibling.dataset, f) var s = f.dgst;
        f = s, a = Error(o(419)), a.stack = "", a.digest = f, ja({ value: a, source: null, stack: null }), t = dc(
          l,
          t,
          u
        );
      } else if (zl || aa(l, t, u, !1), f = (u & l.childLanes) !== 0, zl || f) {
        if (f = el, f !== null && (a = zi(f, u), a !== 0 && a !== i.retryLane))
          throw i.retryLane = a, Du(l, a), Jl(f, l, a), fc;
        Kc(c) || gn(), t = dc(
          l,
          t,
          u
        );
      } else
        Kc(c) ? (t.flags |= 192, t.child = l.child, t = null) : (l = i.treeContext, nl = ht(
          c.nextSibling
        ), Dl = t, L = !0, It = null, dt = !1, l !== null && o0(t, l), t = mc(
          t,
          a.children
        ), t.flags |= 4096);
      return t;
    }
    return e ? (nu(), c = a.fallback, e = t.mode, i = l.child, s = i.sibling, a = pt(i, {
      mode: "hidden",
      children: a.children
    }), a.subtreeFlags = i.subtreeFlags & 65011712, s !== null ? c = pt(
      s,
      c
    ) : (c = Uu(
      c,
      e,
      u,
      null
    ), c.flags |= 2), c.return = t, a.return = t, a.sibling = c, t.child = a, Ia(null, a), a = t.child, c = l.child.memoizedState, c === null ? c = vc(u) : (e = c.cachePool, e !== null ? (i = gl._currentValue, e = e.parent !== i ? { parent: i, pool: i } : e) : e = E0(), c = {
      baseLanes: c.baseLanes | u,
      cachePool: e
    }), a.memoizedState = c, a.childLanes = yc(
      l,
      f,
      u
    ), t.memoizedState = ic, Ia(l.child, a)) : (eu(t), u = l.child, l = u.sibling, u = pt(u, {
      mode: "visible",
      children: a.children
    }), u.return = t, u.sibling = null, l !== null && (f = t.deletions, f === null ? (t.deletions = [l], t.flags |= 16) : f.push(l)), t.child = u, t.memoizedState = null, u);
  }
  function mc(l, t) {
    return t = cn(
      { mode: "visible", children: t },
      l.mode
    ), t.return = l, l.child = t;
  }
  function cn(l, t) {
    return l = Pl(22, l, null, t), l.lanes = 0, l;
  }
  function dc(l, t, u) {
    return Cu(t, l.child, null, u), l = mc(
      t,
      t.pendingProps.children
    ), l.flags |= 2, t.memoizedState = null, l;
  }
  function Cv(l, t, u) {
    l.lanes |= t;
    var a = l.alternate;
    a !== null && (a.lanes |= t), Uf(l.return, t, u);
  }
  function sc(l, t, u, a, e, n) {
    var f = l.memoizedState;
    f === null ? l.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: a,
      tail: u,
      tailMode: e,
      treeForkCount: n
    } : (f.isBackwards = t, f.rendering = null, f.renderingStartTime = 0, f.last = a, f.tail = u, f.tailMode = e, f.treeForkCount = n);
  }
  function Yv(l, t, u) {
    var a = t.pendingProps, e = a.revealOrder, n = a.tail;
    a = a.children;
    var f = ol.current, c = (f & 2) !== 0;
    if (c ? (f = f & 1 | 2, t.flags |= 128) : f &= 1, M(ol, f), rl(l, t, a, u), a = L ? Xa : 0, !c && l !== null && (l.flags & 128) !== 0)
      l: for (l = t.child; l !== null; ) {
        if (l.tag === 13)
          l.memoizedState !== null && Cv(l, u, t);
        else if (l.tag === 19)
          Cv(l, u, t);
        else if (l.child !== null) {
          l.child.return = l, l = l.child;
          continue;
        }
        if (l === t) break l;
        for (; l.sibling === null; ) {
          if (l.return === null || l.return === t)
            break l;
          l = l.return;
        }
        l.sibling.return = l.return, l = l.sibling;
      }
    switch (e) {
      case "forwards":
        for (u = t.child, e = null; u !== null; )
          l = u.alternate, l !== null && $e(l) === null && (e = u), u = u.sibling;
        u = e, u === null ? (e = t.child, t.child = null) : (e = u.sibling, u.sibling = null), sc(
          t,
          !1,
          e,
          u,
          n,
          a
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (u = null, e = t.child, t.child = null; e !== null; ) {
          if (l = e.alternate, l !== null && $e(l) === null) {
            t.child = e;
            break;
          }
          l = e.sibling, e.sibling = u, u = e, e = l;
        }
        sc(
          t,
          !0,
          u,
          null,
          n,
          a
        );
        break;
      case "together":
        sc(
          t,
          !1,
          null,
          null,
          void 0,
          a
        );
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function Qt(l, t, u) {
    if (l !== null && (t.dependencies = l.dependencies), iu |= t.lanes, (u & t.childLanes) === 0)
      if (l !== null) {
        if (aa(
          l,
          t,
          u,
          !1
        ), (u & t.childLanes) === 0)
          return null;
      } else return null;
    if (l !== null && t.child !== l.child)
      throw Error(o(153));
    if (t.child !== null) {
      for (l = t.child, u = pt(l, l.pendingProps), t.child = u, u.return = t; l.sibling !== null; )
        l = l.sibling, u = u.sibling = pt(l, l.pendingProps), u.return = t;
      u.sibling = null;
    }
    return t.child;
  }
  function hc(l, t) {
    return (l.lanes & t) !== 0 ? !0 : (l = l.dependencies, !!(l !== null && Ze(l)));
  }
  function Km(l, t, u) {
    switch (t.tag) {
      case 3:
        Cl(t, t.stateNode.containerInfo), lu(t, gl, l.memoizedState.cache), ru();
        break;
      case 27:
      case 5:
        Oa(t);
        break;
      case 4:
        Cl(t, t.stateNode.containerInfo);
        break;
      case 10:
        lu(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, Xf(t), null;
        break;
      case 13:
        var a = t.memoizedState;
        if (a !== null)
          return a.dehydrated !== null ? (eu(t), t.flags |= 128, null) : (u & t.child.childLanes) !== 0 ? qv(l, t, u) : (eu(t), l = Qt(
            l,
            t,
            u
          ), l !== null ? l.sibling : null);
        eu(t);
        break;
      case 19:
        var e = (l.flags & 128) !== 0;
        if (a = (u & t.childLanes) !== 0, a || (aa(
          l,
          t,
          u,
          !1
        ), a = (u & t.childLanes) !== 0), e) {
          if (a)
            return Yv(
              l,
              t,
              u
            );
          t.flags |= 128;
        }
        if (e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null, e.lastEffect = null), M(ol, ol.current), a) break;
        return null;
      case 22:
        return t.lanes = 0, Uv(
          l,
          t,
          u,
          t.pendingProps
        );
      case 24:
        lu(t, gl, l.memoizedState.cache);
    }
    return Qt(l, t, u);
  }
  function Bv(l, t, u) {
    if (l !== null)
      if (l.memoizedProps !== t.pendingProps)
        zl = !0;
      else {
        if (!hc(l, u) && (t.flags & 128) === 0)
          return zl = !1, Km(
            l,
            t,
            u
          );
        zl = (l.flags & 131072) !== 0;
      }
    else
      zl = !1, L && (t.flags & 1048576) !== 0 && h0(t, Xa, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        l: {
          var a = t.pendingProps;
          if (l = pu(t.elementType), t.type = l, typeof l == "function")
            zf(l) ? (a = Bu(l, a), t.tag = 1, t = Rv(
              null,
              t,
              l,
              a,
              u
            )) : (t.tag = 0, t = cc(
              null,
              t,
              l,
              a,
              u
            ));
          else {
            if (l != null) {
              var e = l.$$typeof;
              if (e === nt) {
                t.tag = 11, t = Ov(
                  null,
                  t,
                  l,
                  a,
                  u
                );
                break l;
              } else if (e === x) {
                t.tag = 14, t = Mv(
                  null,
                  t,
                  l,
                  a,
                  u
                );
                break l;
              }
            }
            throw t = rt(l) || l, Error(o(306, t, ""));
          }
        }
        return t;
      case 0:
        return cc(
          l,
          t,
          t.type,
          t.pendingProps,
          u
        );
      case 1:
        return a = t.type, e = Bu(
          a,
          t.pendingProps
        ), Rv(
          l,
          t,
          a,
          e,
          u
        );
      case 3:
        l: {
          if (Cl(
            t,
            t.stateNode.containerInfo
          ), l === null) throw Error(o(387));
          a = t.pendingProps;
          var n = t.memoizedState;
          e = n.element, Cf(l, t), wa(t, a, null, u);
          var f = t.memoizedState;
          if (a = f.cache, lu(t, gl, a), a !== n.cache && rf(
            t,
            [gl],
            u,
            !0
          ), Ja(), a = f.element, n.isDehydrated)
            if (n = {
              element: a,
              isDehydrated: !1,
              cache: f.cache
            }, t.updateQueue.baseState = n, t.memoizedState = n, t.flags & 256) {
              t = pv(
                l,
                t,
                a,
                u
              );
              break l;
            } else if (a !== e) {
              e = vt(
                Error(o(424)),
                t
              ), ja(e), t = pv(
                l,
                t,
                a,
                u
              );
              break l;
            } else
              for (l = t.stateNode.containerInfo, l.nodeType === 9 ? l = l.body : l = l.nodeName === "HTML" ? l.ownerDocument.body : l, nl = ht(l.firstChild), Dl = t, L = !0, It = null, dt = !0, u = U0(
                t,
                null,
                a,
                u
              ), t.child = u; u; )
                u.flags = u.flags & -3 | 4096, u = u.sibling;
          else {
            if (ru(), a === e) {
              t = Qt(
                l,
                t,
                u
              );
              break l;
            }
            rl(l, t, a, u);
          }
          t = t.child;
        }
        return t;
      case 26:
        return fn(l, t), l === null ? (u = wy(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = u : L || (u = t.type, l = t.pendingProps, a = On(
          Q.current
        ).createElement(u), a[Ml] = t, a[jl] = l, Hl(a, u, l), _l(a), t.stateNode = a) : t.memoizedState = wy(
          t.type,
          l.memoizedProps,
          t.pendingProps,
          l.memoizedState
        ), null;
      case 27:
        return Oa(t), l === null && L && (a = t.stateNode = Ly(
          t.type,
          t.pendingProps,
          Q.current
        ), Dl = t, dt = !0, e = nl, su(t.type) ? (wc = e, nl = ht(a.firstChild)) : nl = e), rl(
          l,
          t,
          t.pendingProps.children,
          u
        ), fn(l, t), l === null && (t.flags |= 4194304), t.child;
      case 5:
        return l === null && L && ((e = a = nl) && (a = Ed(
          a,
          t.type,
          t.pendingProps,
          dt
        ), a !== null ? (t.stateNode = a, Dl = t, nl = ht(a.firstChild), dt = !1, e = !0) : e = !1), e || Pt(t)), Oa(t), e = t.type, n = t.pendingProps, f = l !== null ? l.memoizedProps : null, a = n.children, Vc(e, n) ? a = null : f !== null && Vc(e, f) && (t.flags |= 32), t.memoizedState !== null && (e = Zf(
          l,
          t,
          Bm,
          null,
          null,
          u
        ), se._currentValue = e), fn(l, t), rl(l, t, a, u), t.child;
      case 6:
        return l === null && L && ((l = u = nl) && (u = Ad(
          u,
          t.pendingProps,
          dt
        ), u !== null ? (t.stateNode = u, Dl = t, nl = null, l = !0) : l = !1), l || Pt(t)), null;
      case 13:
        return qv(l, t, u);
      case 4:
        return Cl(
          t,
          t.stateNode.containerInfo
        ), a = t.pendingProps, l === null ? t.child = Cu(
          t,
          null,
          a,
          u
        ) : rl(l, t, a, u), t.child;
      case 11:
        return Ov(
          l,
          t,
          t.type,
          t.pendingProps,
          u
        );
      case 7:
        return rl(
          l,
          t,
          t.pendingProps,
          u
        ), t.child;
      case 8:
        return rl(
          l,
          t,
          t.pendingProps.children,
          u
        ), t.child;
      case 12:
        return rl(
          l,
          t,
          t.pendingProps.children,
          u
        ), t.child;
      case 10:
        return a = t.pendingProps, lu(t, t.type, a.value), rl(l, t, a.children, u), t.child;
      case 9:
        return e = t.type._context, a = t.pendingProps.children, Nu(t), e = Ul(e), a = a(e), t.flags |= 1, rl(l, t, a, u), t.child;
      case 14:
        return Mv(
          l,
          t,
          t.type,
          t.pendingProps,
          u
        );
      case 15:
        return Dv(
          l,
          t,
          t.type,
          t.pendingProps,
          u
        );
      case 19:
        return Yv(l, t, u);
      case 31:
        return Lm(l, t, u);
      case 22:
        return Uv(
          l,
          t,
          u,
          t.pendingProps
        );
      case 24:
        return Nu(t), a = Ul(gl), l === null ? (e = Rf(), e === null && (e = el, n = Hf(), e.pooledCache = n, n.refCount++, n !== null && (e.pooledCacheLanes |= u), e = n), t.memoizedState = { parent: a, cache: e }, qf(t), lu(t, gl, e)) : ((l.lanes & u) !== 0 && (Cf(l, t), wa(t, null, null, u), Ja()), e = l.memoizedState, n = t.memoizedState, e.parent !== a ? (e = { parent: a, cache: a }, t.memoizedState = e, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = e), lu(t, gl, a)) : (a = n.cache, lu(t, gl, a), a !== e.cache && rf(
          t,
          [gl],
          u,
          !0
        ))), rl(
          l,
          t,
          t.pendingProps.children,
          u
        ), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(o(156, t.tag));
  }
  function Xt(l) {
    l.flags |= 4;
  }
  function oc(l, t, u, a, e) {
    if ((t = (l.mode & 32) !== 0) && (t = !1), t) {
      if (l.flags |= 16777216, (e & 335544128) === e)
        if (l.stateNode.complete) l.flags |= 8192;
        else if (vy()) l.flags |= 8192;
        else
          throw qu = Ke, pf;
    } else l.flags &= -16777217;
  }
  function Gv(l, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      l.flags &= -16777217;
    else if (l.flags |= 16777216, !Iy(t))
      if (vy()) l.flags |= 8192;
      else
        throw qu = Ke, pf;
  }
  function vn(l, t) {
    t !== null && (l.flags |= 4), l.flags & 16384 && (t = l.tag !== 22 ? Si() : 536870912, l.lanes |= t, oa |= t);
  }
  function Pa(l, t) {
    if (!L)
      switch (l.tailMode) {
        case "hidden":
          t = l.tail;
          for (var u = null; t !== null; )
            t.alternate !== null && (u = t), t = t.sibling;
          u === null ? l.tail = null : u.sibling = null;
          break;
        case "collapsed":
          u = l.tail;
          for (var a = null; u !== null; )
            u.alternate !== null && (a = u), u = u.sibling;
          a === null ? t || l.tail === null ? l.tail = null : l.tail.sibling = null : a.sibling = null;
      }
  }
  function fl(l) {
    var t = l.alternate !== null && l.alternate.child === l.child, u = 0, a = 0;
    if (t)
      for (var e = l.child; e !== null; )
        u |= e.lanes | e.childLanes, a |= e.subtreeFlags & 65011712, a |= e.flags & 65011712, e.return = l, e = e.sibling;
    else
      for (e = l.child; e !== null; )
        u |= e.lanes | e.childLanes, a |= e.subtreeFlags, a |= e.flags, e.return = l, e = e.sibling;
    return l.subtreeFlags |= a, l.childLanes = u, t;
  }
  function Jm(l, t, u) {
    var a = t.pendingProps;
    switch (_f(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return fl(t), null;
      case 1:
        return fl(t), null;
      case 3:
        return u = t.stateNode, a = null, l !== null && (a = l.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), Yt(gl), hl(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (l === null || l.child === null) && (ua(t) ? Xt(t) : l === null || l.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Mf())), fl(t), null;
      case 26:
        var e = t.type, n = t.memoizedState;
        return l === null ? (Xt(t), n !== null ? (fl(t), Gv(t, n)) : (fl(t), oc(
          t,
          e,
          null,
          a,
          u
        ))) : n ? n !== l.memoizedState ? (Xt(t), fl(t), Gv(t, n)) : (fl(t), t.flags &= -16777217) : (l = l.memoizedProps, l !== a && Xt(t), fl(t), oc(
          t,
          e,
          l,
          a,
          u
        )), null;
      case 27:
        if (ze(t), u = Q.current, e = t.type, l !== null && t.stateNode != null)
          l.memoizedProps !== a && Xt(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(o(166));
            return fl(t), null;
          }
          l = U.current, ua(t) ? S0(t) : (l = Ly(e, a, u), t.stateNode = l, Xt(t));
        }
        return fl(t), null;
      case 5:
        if (ze(t), e = t.type, l !== null && t.stateNode != null)
          l.memoizedProps !== a && Xt(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(o(166));
            return fl(t), null;
          }
          if (n = U.current, ua(t))
            S0(t);
          else {
            var f = On(
              Q.current
            );
            switch (n) {
              case 1:
                n = f.createElementNS(
                  "http://www.w3.org/2000/svg",
                  e
                );
                break;
              case 2:
                n = f.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  e
                );
                break;
              default:
                switch (e) {
                  case "svg":
                    n = f.createElementNS(
                      "http://www.w3.org/2000/svg",
                      e
                    );
                    break;
                  case "math":
                    n = f.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      e
                    );
                    break;
                  case "script":
                    n = f.createElement("div"), n.innerHTML = "<script><\/script>", n = n.removeChild(
                      n.firstChild
                    );
                    break;
                  case "select":
                    n = typeof a.is == "string" ? f.createElement("select", {
                      is: a.is
                    }) : f.createElement("select"), a.multiple ? n.multiple = !0 : a.size && (n.size = a.size);
                    break;
                  default:
                    n = typeof a.is == "string" ? f.createElement(e, { is: a.is }) : f.createElement(e);
                }
            }
            n[Ml] = t, n[jl] = a;
            l: for (f = t.child; f !== null; ) {
              if (f.tag === 5 || f.tag === 6)
                n.appendChild(f.stateNode);
              else if (f.tag !== 4 && f.tag !== 27 && f.child !== null) {
                f.child.return = f, f = f.child;
                continue;
              }
              if (f === t) break l;
              for (; f.sibling === null; ) {
                if (f.return === null || f.return === t)
                  break l;
                f = f.return;
              }
              f.sibling.return = f.return, f = f.sibling;
            }
            t.stateNode = n;
            l: switch (Hl(n, e, a), e) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                a = !!a.autoFocus;
                break l;
              case "img":
                a = !0;
                break l;
              default:
                a = !1;
            }
            a && Xt(t);
          }
        }
        return fl(t), oc(
          t,
          t.type,
          l === null ? null : l.memoizedProps,
          t.pendingProps,
          u
        ), null;
      case 6:
        if (l && t.stateNode != null)
          l.memoizedProps !== a && Xt(t);
        else {
          if (typeof a != "string" && t.stateNode === null)
            throw Error(o(166));
          if (l = Q.current, ua(t)) {
            if (l = t.stateNode, u = t.memoizedProps, a = null, e = Dl, e !== null)
              switch (e.tag) {
                case 27:
                case 5:
                  a = e.memoizedProps;
              }
            l[Ml] = t, l = !!(l.nodeValue === u || a !== null && a.suppressHydrationWarning === !0 || qy(l.nodeValue, u)), l || Pt(t, !0);
          } else
            l = On(l).createTextNode(
              a
            ), l[Ml] = t, t.stateNode = l;
        }
        return fl(t), null;
      case 31:
        if (u = t.memoizedState, l === null || l.memoizedState !== null) {
          if (a = ua(t), u !== null) {
            if (l === null) {
              if (!a) throw Error(o(318));
              if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(o(557));
              l[Ml] = t;
            } else
              ru(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            fl(t), l = !1;
          } else
            u = Mf(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = u), l = !0;
          if (!l)
            return t.flags & 256 ? (tt(t), t) : (tt(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(o(558));
        }
        return fl(t), null;
      case 13:
        if (a = t.memoizedState, l === null || l.memoizedState !== null && l.memoizedState.dehydrated !== null) {
          if (e = ua(t), a !== null && a.dehydrated !== null) {
            if (l === null) {
              if (!e) throw Error(o(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(o(317));
              e[Ml] = t;
            } else
              ru(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            fl(t), e = !1;
          } else
            e = Mf(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = e), e = !0;
          if (!e)
            return t.flags & 256 ? (tt(t), t) : (tt(t), null);
        }
        return tt(t), (t.flags & 128) !== 0 ? (t.lanes = u, t) : (u = a !== null, l = l !== null && l.memoizedState !== null, u && (a = t.child, e = null, a.alternate !== null && a.alternate.memoizedState !== null && a.alternate.memoizedState.cachePool !== null && (e = a.alternate.memoizedState.cachePool.pool), n = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (n = a.memoizedState.cachePool.pool), n !== e && (a.flags |= 2048)), u !== l && u && (t.child.flags |= 8192), vn(t, t.updateQueue), fl(t), null);
      case 4:
        return hl(), l === null && Gc(t.stateNode.containerInfo), fl(t), null;
      case 10:
        return Yt(t.type), fl(t), null;
      case 19:
        if (E(ol), a = t.memoizedState, a === null) return fl(t), null;
        if (e = (t.flags & 128) !== 0, n = a.rendering, n === null)
          if (e) Pa(a, !1);
          else {
            if (dl !== 0 || l !== null && (l.flags & 128) !== 0)
              for (l = t.child; l !== null; ) {
                if (n = $e(l), n !== null) {
                  for (t.flags |= 128, Pa(a, !1), l = n.updateQueue, t.updateQueue = l, vn(t, l), t.subtreeFlags = 0, l = u, u = t.child; u !== null; )
                    m0(u, l), u = u.sibling;
                  return M(
                    ol,
                    ol.current & 1 | 2
                  ), L && qt(t, a.treeForkCount), t.child;
                }
                l = l.sibling;
              }
            a.tail !== null && $l() > hn && (t.flags |= 128, e = !0, Pa(a, !1), t.lanes = 4194304);
          }
        else {
          if (!e)
            if (l = $e(n), l !== null) {
              if (t.flags |= 128, e = !0, l = l.updateQueue, t.updateQueue = l, vn(t, l), Pa(a, !0), a.tail === null && a.tailMode === "hidden" && !n.alternate && !L)
                return fl(t), null;
            } else
              2 * $l() - a.renderingStartTime > hn && u !== 536870912 && (t.flags |= 128, e = !0, Pa(a, !1), t.lanes = 4194304);
          a.isBackwards ? (n.sibling = t.child, t.child = n) : (l = a.last, l !== null ? l.sibling = n : t.child = n, a.last = n);
        }
        return a.tail !== null ? (l = a.tail, a.rendering = l, a.tail = l.sibling, a.renderingStartTime = $l(), l.sibling = null, u = ol.current, M(
          ol,
          e ? u & 1 | 2 : u & 1
        ), L && qt(t, a.treeForkCount), l) : (fl(t), null);
      case 22:
      case 23:
        return tt(t), Qf(), a = t.memoizedState !== null, l !== null ? l.memoizedState !== null !== a && (t.flags |= 8192) : a && (t.flags |= 8192), a ? (u & 536870912) !== 0 && (t.flags & 128) === 0 && (fl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : fl(t), u = t.updateQueue, u !== null && vn(t, u.retryQueue), u = null, l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (u = l.memoizedState.cachePool.pool), a = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (a = t.memoizedState.cachePool.pool), a !== u && (t.flags |= 2048), l !== null && E(Ru), null;
      case 24:
        return u = null, l !== null && (u = l.memoizedState.cache), t.memoizedState.cache !== u && (t.flags |= 2048), Yt(gl), fl(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(o(156, t.tag));
  }
  function wm(l, t) {
    switch (_f(t), t.tag) {
      case 1:
        return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 3:
        return Yt(gl), hl(), l = t.flags, (l & 65536) !== 0 && (l & 128) === 0 ? (t.flags = l & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return ze(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (tt(t), t.alternate === null)
            throw Error(o(340));
          ru();
        }
        return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 13:
        if (tt(t), l = t.memoizedState, l !== null && l.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(o(340));
          ru();
        }
        return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 19:
        return E(ol), null;
      case 4:
        return hl(), null;
      case 10:
        return Yt(t.type), null;
      case 22:
      case 23:
        return tt(t), Qf(), l !== null && E(Ru), l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 24:
        return Yt(gl), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Qv(l, t) {
    switch (_f(t), t.tag) {
      case 3:
        Yt(gl), hl();
        break;
      case 26:
      case 27:
      case 5:
        ze(t);
        break;
      case 4:
        hl();
        break;
      case 31:
        t.memoizedState !== null && tt(t);
        break;
      case 13:
        tt(t);
        break;
      case 19:
        E(ol);
        break;
      case 10:
        Yt(t.type);
        break;
      case 22:
      case 23:
        tt(t), Qf(), l !== null && E(Ru);
        break;
      case 24:
        Yt(gl);
    }
  }
  function le(l, t) {
    try {
      var u = t.updateQueue, a = u !== null ? u.lastEffect : null;
      if (a !== null) {
        var e = a.next;
        u = e;
        do {
          if ((u.tag & l) === l) {
            a = void 0;
            var n = u.create, f = u.inst;
            a = n(), f.destroy = a;
          }
          u = u.next;
        } while (u !== e);
      }
    } catch (c) {
      I(t, t.return, c);
    }
  }
  function fu(l, t, u) {
    try {
      var a = t.updateQueue, e = a !== null ? a.lastEffect : null;
      if (e !== null) {
        var n = e.next;
        a = n;
        do {
          if ((a.tag & l) === l) {
            var f = a.inst, c = f.destroy;
            if (c !== void 0) {
              f.destroy = void 0, e = t;
              var i = u, s = c;
              try {
                s();
              } catch (g) {
                I(
                  e,
                  i,
                  g
                );
              }
            }
          }
          a = a.next;
        } while (a !== n);
      }
    } catch (g) {
      I(t, t.return, g);
    }
  }
  function Xv(l) {
    var t = l.updateQueue;
    if (t !== null) {
      var u = l.stateNode;
      try {
        H0(t, u);
      } catch (a) {
        I(l, l.return, a);
      }
    }
  }
  function jv(l, t, u) {
    u.props = Bu(
      l.type,
      l.memoizedProps
    ), u.state = l.memoizedState;
    try {
      u.componentWillUnmount();
    } catch (a) {
      I(l, t, a);
    }
  }
  function te(l, t) {
    try {
      var u = l.ref;
      if (u !== null) {
        switch (l.tag) {
          case 26:
          case 27:
          case 5:
            var a = l.stateNode;
            break;
          case 30:
            a = l.stateNode;
            break;
          default:
            a = l.stateNode;
        }
        typeof u == "function" ? l.refCleanup = u(a) : u.current = a;
      }
    } catch (e) {
      I(l, t, e);
    }
  }
  function Mt(l, t) {
    var u = l.ref, a = l.refCleanup;
    if (u !== null)
      if (typeof a == "function")
        try {
          a();
        } catch (e) {
          I(l, t, e);
        } finally {
          l.refCleanup = null, l = l.alternate, l != null && (l.refCleanup = null);
        }
      else if (typeof u == "function")
        try {
          u(null);
        } catch (e) {
          I(l, t, e);
        }
      else u.current = null;
  }
  function Zv(l) {
    var t = l.type, u = l.memoizedProps, a = l.stateNode;
    try {
      l: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          u.autoFocus && a.focus();
          break l;
        case "img":
          u.src ? a.src = u.src : u.srcSet && (a.srcset = u.srcSet);
      }
    } catch (e) {
      I(l, l.return, e);
    }
  }
  function Sc(l, t, u) {
    try {
      var a = l.stateNode;
      od(a, l.type, u, t), a[jl] = t;
    } catch (e) {
      I(l, l.return, e);
    }
  }
  function Vv(l) {
    return l.tag === 5 || l.tag === 3 || l.tag === 26 || l.tag === 27 && su(l.type) || l.tag === 4;
  }
  function gc(l) {
    l: for (; ; ) {
      for (; l.sibling === null; ) {
        if (l.return === null || Vv(l.return)) return null;
        l = l.return;
      }
      for (l.sibling.return = l.return, l = l.sibling; l.tag !== 5 && l.tag !== 6 && l.tag !== 18; ) {
        if (l.tag === 27 && su(l.type) || l.flags & 2 || l.child === null || l.tag === 4) continue l;
        l.child.return = l, l = l.child;
      }
      if (!(l.flags & 2)) return l.stateNode;
    }
  }
  function bc(l, t, u) {
    var a = l.tag;
    if (a === 5 || a === 6)
      l = l.stateNode, t ? (u.nodeType === 9 ? u.body : u.nodeName === "HTML" ? u.ownerDocument.body : u).insertBefore(l, t) : (t = u.nodeType === 9 ? u.body : u.nodeName === "HTML" ? u.ownerDocument.body : u, t.appendChild(l), u = u._reactRootContainer, u != null || t.onclick !== null || (t.onclick = Nt));
    else if (a !== 4 && (a === 27 && su(l.type) && (u = l.stateNode, t = null), l = l.child, l !== null))
      for (bc(l, t, u), l = l.sibling; l !== null; )
        bc(l, t, u), l = l.sibling;
  }
  function yn(l, t, u) {
    var a = l.tag;
    if (a === 5 || a === 6)
      l = l.stateNode, t ? u.insertBefore(l, t) : u.appendChild(l);
    else if (a !== 4 && (a === 27 && su(l.type) && (u = l.stateNode), l = l.child, l !== null))
      for (yn(l, t, u), l = l.sibling; l !== null; )
        yn(l, t, u), l = l.sibling;
  }
  function xv(l) {
    var t = l.stateNode, u = l.memoizedProps;
    try {
      for (var a = l.type, e = t.attributes; e.length; )
        t.removeAttributeNode(e[0]);
      Hl(t, a, u), t[Ml] = l, t[jl] = u;
    } catch (n) {
      I(l, l.return, n);
    }
  }
  var jt = !1, Tl = !1, zc = !1, Lv = typeof WeakSet == "function" ? WeakSet : Set, Ol = null;
  function Wm(l, t) {
    if (l = l.containerInfo, jc = Rn, l = u0(l), df(l)) {
      if ("selectionStart" in l)
        var u = {
          start: l.selectionStart,
          end: l.selectionEnd
        };
      else
        l: {
          u = (u = l.ownerDocument) && u.defaultView || window;
          var a = u.getSelection && u.getSelection();
          if (a && a.rangeCount !== 0) {
            u = a.anchorNode;
            var e = a.anchorOffset, n = a.focusNode;
            a = a.focusOffset;
            try {
              u.nodeType, n.nodeType;
            } catch {
              u = null;
              break l;
            }
            var f = 0, c = -1, i = -1, s = 0, g = 0, T = l, h = null;
            t: for (; ; ) {
              for (var S; T !== u || e !== 0 && T.nodeType !== 3 || (c = f + e), T !== n || a !== 0 && T.nodeType !== 3 || (i = f + a), T.nodeType === 3 && (f += T.nodeValue.length), (S = T.firstChild) !== null; )
                h = T, T = S;
              for (; ; ) {
                if (T === l) break t;
                if (h === u && ++s === e && (c = f), h === n && ++g === a && (i = f), (S = T.nextSibling) !== null) break;
                T = h, h = T.parentNode;
              }
              T = S;
            }
            u = c === -1 || i === -1 ? null : { start: c, end: i };
          } else u = null;
        }
      u = u || { start: 0, end: 0 };
    } else u = null;
    for (Zc = { focusedElem: l, selectionRange: u }, Rn = !1, Ol = t; Ol !== null; )
      if (t = Ol, l = t.child, (t.subtreeFlags & 1028) !== 0 && l !== null)
        l.return = t, Ol = l;
      else
        for (; Ol !== null; ) {
          switch (t = Ol, n = t.alternate, l = t.flags, t.tag) {
            case 0:
              if ((l & 4) !== 0 && (l = t.updateQueue, l = l !== null ? l.events : null, l !== null))
                for (u = 0; u < l.length; u++)
                  e = l[u], e.ref.impl = e.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((l & 1024) !== 0 && n !== null) {
                l = void 0, u = t, e = n.memoizedProps, n = n.memoizedState, a = u.stateNode;
                try {
                  var D = Bu(
                    u.type,
                    e
                  );
                  l = a.getSnapshotBeforeUpdate(
                    D,
                    n
                  ), a.__reactInternalSnapshotBeforeUpdate = l;
                } catch (R) {
                  I(
                    u,
                    u.return,
                    R
                  );
                }
              }
              break;
            case 3:
              if ((l & 1024) !== 0) {
                if (l = t.stateNode.containerInfo, u = l.nodeType, u === 9)
                  Lc(l);
                else if (u === 1)
                  switch (l.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      Lc(l);
                      break;
                    default:
                      l.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((l & 1024) !== 0) throw Error(o(163));
          }
          if (l = t.sibling, l !== null) {
            l.return = t.return, Ol = l;
            break;
          }
          Ol = t.return;
        }
  }
  function Kv(l, t, u) {
    var a = u.flags;
    switch (u.tag) {
      case 0:
      case 11:
      case 15:
        Vt(l, u), a & 4 && le(5, u);
        break;
      case 1:
        if (Vt(l, u), a & 4)
          if (l = u.stateNode, t === null)
            try {
              l.componentDidMount();
            } catch (f) {
              I(u, u.return, f);
            }
          else {
            var e = Bu(
              u.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              l.componentDidUpdate(
                e,
                t,
                l.__reactInternalSnapshotBeforeUpdate
              );
            } catch (f) {
              I(
                u,
                u.return,
                f
              );
            }
          }
        a & 64 && Xv(u), a & 512 && te(u, u.return);
        break;
      case 3:
        if (Vt(l, u), a & 64 && (l = u.updateQueue, l !== null)) {
          if (t = null, u.child !== null)
            switch (u.child.tag) {
              case 27:
              case 5:
                t = u.child.stateNode;
                break;
              case 1:
                t = u.child.stateNode;
            }
          try {
            H0(l, t);
          } catch (f) {
            I(u, u.return, f);
          }
        }
        break;
      case 27:
        t === null && a & 4 && xv(u);
      case 26:
      case 5:
        Vt(l, u), t === null && a & 4 && Zv(u), a & 512 && te(u, u.return);
        break;
      case 12:
        Vt(l, u);
        break;
      case 31:
        Vt(l, u), a & 4 && Wv(l, u);
        break;
      case 13:
        Vt(l, u), a & 4 && $v(l, u), a & 64 && (l = u.memoizedState, l !== null && (l = l.dehydrated, l !== null && (u = ad.bind(
          null,
          u
        ), _d(l, u))));
        break;
      case 22:
        if (a = u.memoizedState !== null || jt, !a) {
          t = t !== null && t.memoizedState !== null || Tl, e = jt;
          var n = Tl;
          jt = a, (Tl = t) && !n ? xt(
            l,
            u,
            (u.subtreeFlags & 8772) !== 0
          ) : Vt(l, u), jt = e, Tl = n;
        }
        break;
      case 30:
        break;
      default:
        Vt(l, u);
    }
  }
  function Jv(l) {
    var t = l.alternate;
    t !== null && (l.alternate = null, Jv(t)), l.child = null, l.deletions = null, l.sibling = null, l.tag === 5 && (t = l.stateNode, t !== null && Wn(t)), l.stateNode = null, l.return = null, l.dependencies = null, l.memoizedProps = null, l.memoizedState = null, l.pendingProps = null, l.stateNode = null, l.updateQueue = null;
  }
  var il = null, Vl = !1;
  function Zt(l, t, u) {
    for (u = u.child; u !== null; )
      wv(l, t, u), u = u.sibling;
  }
  function wv(l, t, u) {
    if (Fl && typeof Fl.onCommitFiberUnmount == "function")
      try {
        Fl.onCommitFiberUnmount(Ma, u);
      } catch {
      }
    switch (u.tag) {
      case 26:
        Tl || Mt(u, t), Zt(
          l,
          t,
          u
        ), u.memoizedState ? u.memoizedState.count-- : u.stateNode && (u = u.stateNode, u.parentNode.removeChild(u));
        break;
      case 27:
        Tl || Mt(u, t);
        var a = il, e = Vl;
        su(u.type) && (il = u.stateNode, Vl = !1), Zt(
          l,
          t,
          u
        ), ye(u.stateNode), il = a, Vl = e;
        break;
      case 5:
        Tl || Mt(u, t);
      case 6:
        if (a = il, e = Vl, il = null, Zt(
          l,
          t,
          u
        ), il = a, Vl = e, il !== null)
          if (Vl)
            try {
              (il.nodeType === 9 ? il.body : il.nodeName === "HTML" ? il.ownerDocument.body : il).removeChild(u.stateNode);
            } catch (n) {
              I(
                u,
                t,
                n
              );
            }
          else
            try {
              il.removeChild(u.stateNode);
            } catch (n) {
              I(
                u,
                t,
                n
              );
            }
        break;
      case 18:
        il !== null && (Vl ? (l = il, Xy(
          l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l,
          u.stateNode
        ), _a(l)) : Xy(il, u.stateNode));
        break;
      case 4:
        a = il, e = Vl, il = u.stateNode.containerInfo, Vl = !0, Zt(
          l,
          t,
          u
        ), il = a, Vl = e;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        fu(2, u, t), Tl || fu(4, u, t), Zt(
          l,
          t,
          u
        );
        break;
      case 1:
        Tl || (Mt(u, t), a = u.stateNode, typeof a.componentWillUnmount == "function" && jv(
          u,
          t,
          a
        )), Zt(
          l,
          t,
          u
        );
        break;
      case 21:
        Zt(
          l,
          t,
          u
        );
        break;
      case 22:
        Tl = (a = Tl) || u.memoizedState !== null, Zt(
          l,
          t,
          u
        ), Tl = a;
        break;
      default:
        Zt(
          l,
          t,
          u
        );
    }
  }
  function Wv(l, t) {
    if (t.memoizedState === null && (l = t.alternate, l !== null && (l = l.memoizedState, l !== null))) {
      l = l.dehydrated;
      try {
        _a(l);
      } catch (u) {
        I(t, t.return, u);
      }
    }
  }
  function $v(l, t) {
    if (t.memoizedState === null && (l = t.alternate, l !== null && (l = l.memoizedState, l !== null && (l = l.dehydrated, l !== null))))
      try {
        _a(l);
      } catch (u) {
        I(t, t.return, u);
      }
  }
  function $m(l) {
    switch (l.tag) {
      case 31:
      case 13:
      case 19:
        var t = l.stateNode;
        return t === null && (t = l.stateNode = new Lv()), t;
      case 22:
        return l = l.stateNode, t = l._retryCache, t === null && (t = l._retryCache = new Lv()), t;
      default:
        throw Error(o(435, l.tag));
    }
  }
  function mn(l, t) {
    var u = $m(l);
    t.forEach(function(a) {
      if (!u.has(a)) {
        u.add(a);
        var e = ed.bind(null, l, a);
        a.then(e, e);
      }
    });
  }
  function xl(l, t) {
    var u = t.deletions;
    if (u !== null)
      for (var a = 0; a < u.length; a++) {
        var e = u[a], n = l, f = t, c = f;
        l: for (; c !== null; ) {
          switch (c.tag) {
            case 27:
              if (su(c.type)) {
                il = c.stateNode, Vl = !1;
                break l;
              }
              break;
            case 5:
              il = c.stateNode, Vl = !1;
              break l;
            case 3:
            case 4:
              il = c.stateNode.containerInfo, Vl = !0;
              break l;
          }
          c = c.return;
        }
        if (il === null) throw Error(o(160));
        wv(n, f, e), il = null, Vl = !1, n = e.alternate, n !== null && (n.return = null), e.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        Fv(t, l), t = t.sibling;
  }
  var bt = null;
  function Fv(l, t) {
    var u = l.alternate, a = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        xl(t, l), Ll(l), a & 4 && (fu(3, l, l.return), le(3, l), fu(5, l, l.return));
        break;
      case 1:
        xl(t, l), Ll(l), a & 512 && (Tl || u === null || Mt(u, u.return)), a & 64 && jt && (l = l.updateQueue, l !== null && (a = l.callbacks, a !== null && (u = l.shared.hiddenCallbacks, l.shared.hiddenCallbacks = u === null ? a : u.concat(a))));
        break;
      case 26:
        var e = bt;
        if (xl(t, l), Ll(l), a & 512 && (Tl || u === null || Mt(u, u.return)), a & 4) {
          var n = u !== null ? u.memoizedState : null;
          if (a = l.memoizedState, u === null)
            if (a === null)
              if (l.stateNode === null) {
                l: {
                  a = l.type, u = l.memoizedProps, e = e.ownerDocument || e;
                  t: switch (a) {
                    case "title":
                      n = e.getElementsByTagName("title")[0], (!n || n[ra] || n[Ml] || n.namespaceURI === "http://www.w3.org/2000/svg" || n.hasAttribute("itemprop")) && (n = e.createElement(a), e.head.insertBefore(
                        n,
                        e.querySelector("head > title")
                      )), Hl(n, a, u), n[Ml] = l, _l(n), a = n;
                      break l;
                    case "link":
                      var f = Fy(
                        "link",
                        "href",
                        e
                      ).get(a + (u.href || ""));
                      if (f) {
                        for (var c = 0; c < f.length; c++)
                          if (n = f[c], n.getAttribute("href") === (u.href == null || u.href === "" ? null : u.href) && n.getAttribute("rel") === (u.rel == null ? null : u.rel) && n.getAttribute("title") === (u.title == null ? null : u.title) && n.getAttribute("crossorigin") === (u.crossOrigin == null ? null : u.crossOrigin)) {
                            f.splice(c, 1);
                            break t;
                          }
                      }
                      n = e.createElement(a), Hl(n, a, u), e.head.appendChild(n);
                      break;
                    case "meta":
                      if (f = Fy(
                        "meta",
                        "content",
                        e
                      ).get(a + (u.content || ""))) {
                        for (c = 0; c < f.length; c++)
                          if (n = f[c], n.getAttribute("content") === (u.content == null ? null : "" + u.content) && n.getAttribute("name") === (u.name == null ? null : u.name) && n.getAttribute("property") === (u.property == null ? null : u.property) && n.getAttribute("http-equiv") === (u.httpEquiv == null ? null : u.httpEquiv) && n.getAttribute("charset") === (u.charSet == null ? null : u.charSet)) {
                            f.splice(c, 1);
                            break t;
                          }
                      }
                      n = e.createElement(a), Hl(n, a, u), e.head.appendChild(n);
                      break;
                    default:
                      throw Error(o(468, a));
                  }
                  n[Ml] = l, _l(n), a = n;
                }
                l.stateNode = a;
              } else
                ky(
                  e,
                  l.type,
                  l.stateNode
                );
            else
              l.stateNode = $y(
                e,
                a,
                l.memoizedProps
              );
          else
            n !== a ? (n === null ? u.stateNode !== null && (u = u.stateNode, u.parentNode.removeChild(u)) : n.count--, a === null ? ky(
              e,
              l.type,
              l.stateNode
            ) : $y(
              e,
              a,
              l.memoizedProps
            )) : a === null && l.stateNode !== null && Sc(
              l,
              l.memoizedProps,
              u.memoizedProps
            );
        }
        break;
      case 27:
        xl(t, l), Ll(l), a & 512 && (Tl || u === null || Mt(u, u.return)), u !== null && a & 4 && Sc(
          l,
          l.memoizedProps,
          u.memoizedProps
        );
        break;
      case 5:
        if (xl(t, l), Ll(l), a & 512 && (Tl || u === null || Mt(u, u.return)), l.flags & 32) {
          e = l.stateNode;
          try {
            Ju(e, "");
          } catch (D) {
            I(l, l.return, D);
          }
        }
        a & 4 && l.stateNode != null && (e = l.memoizedProps, Sc(
          l,
          e,
          u !== null ? u.memoizedProps : e
        )), a & 1024 && (zc = !0);
        break;
      case 6:
        if (xl(t, l), Ll(l), a & 4) {
          if (l.stateNode === null)
            throw Error(o(162));
          a = l.memoizedProps, u = l.stateNode;
          try {
            u.nodeValue = a;
          } catch (D) {
            I(l, l.return, D);
          }
        }
        break;
      case 3:
        if (Un = null, e = bt, bt = Mn(t.containerInfo), xl(t, l), bt = e, Ll(l), a & 4 && u !== null && u.memoizedState.isDehydrated)
          try {
            _a(t.containerInfo);
          } catch (D) {
            I(l, l.return, D);
          }
        zc && (zc = !1, kv(l));
        break;
      case 4:
        a = bt, bt = Mn(
          l.stateNode.containerInfo
        ), xl(t, l), Ll(l), bt = a;
        break;
      case 12:
        xl(t, l), Ll(l);
        break;
      case 31:
        xl(t, l), Ll(l), a & 4 && (a = l.updateQueue, a !== null && (l.updateQueue = null, mn(l, a)));
        break;
      case 13:
        xl(t, l), Ll(l), l.child.flags & 8192 && l.memoizedState !== null != (u !== null && u.memoizedState !== null) && (sn = $l()), a & 4 && (a = l.updateQueue, a !== null && (l.updateQueue = null, mn(l, a)));
        break;
      case 22:
        e = l.memoizedState !== null;
        var i = u !== null && u.memoizedState !== null, s = jt, g = Tl;
        if (jt = s || e, Tl = g || i, xl(t, l), Tl = g, jt = s, Ll(l), a & 8192)
          l: for (t = l.stateNode, t._visibility = e ? t._visibility & -2 : t._visibility | 1, e && (u === null || i || jt || Tl || Gu(l)), u = null, t = l; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (u === null) {
                i = u = t;
                try {
                  if (n = i.stateNode, e)
                    f = n.style, typeof f.setProperty == "function" ? f.setProperty("display", "none", "important") : f.display = "none";
                  else {
                    c = i.stateNode;
                    var T = i.memoizedProps.style, h = T != null && T.hasOwnProperty("display") ? T.display : null;
                    c.style.display = h == null || typeof h == "boolean" ? "" : ("" + h).trim();
                  }
                } catch (D) {
                  I(i, i.return, D);
                }
              }
            } else if (t.tag === 6) {
              if (u === null) {
                i = t;
                try {
                  i.stateNode.nodeValue = e ? "" : i.memoizedProps;
                } catch (D) {
                  I(i, i.return, D);
                }
              }
            } else if (t.tag === 18) {
              if (u === null) {
                i = t;
                try {
                  var S = i.stateNode;
                  e ? jy(S, !0) : jy(i.stateNode, !1);
                } catch (D) {
                  I(i, i.return, D);
                }
              }
            } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === l) && t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === l) break l;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === l) break l;
              u === t && (u = null), t = t.return;
            }
            u === t && (u = null), t.sibling.return = t.return, t = t.sibling;
          }
        a & 4 && (a = l.updateQueue, a !== null && (u = a.retryQueue, u !== null && (a.retryQueue = null, mn(l, u))));
        break;
      case 19:
        xl(t, l), Ll(l), a & 4 && (a = l.updateQueue, a !== null && (l.updateQueue = null, mn(l, a)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        xl(t, l), Ll(l);
    }
  }
  function Ll(l) {
    var t = l.flags;
    if (t & 2) {
      try {
        for (var u, a = l.return; a !== null; ) {
          if (Vv(a)) {
            u = a;
            break;
          }
          a = a.return;
        }
        if (u == null) throw Error(o(160));
        switch (u.tag) {
          case 27:
            var e = u.stateNode, n = gc(l);
            yn(l, n, e);
            break;
          case 5:
            var f = u.stateNode;
            u.flags & 32 && (Ju(f, ""), u.flags &= -33);
            var c = gc(l);
            yn(l, c, f);
            break;
          case 3:
          case 4:
            var i = u.stateNode.containerInfo, s = gc(l);
            bc(
              l,
              s,
              i
            );
            break;
          default:
            throw Error(o(161));
        }
      } catch (g) {
        I(l, l.return, g);
      }
      l.flags &= -3;
    }
    t & 4096 && (l.flags &= -4097);
  }
  function kv(l) {
    if (l.subtreeFlags & 1024)
      for (l = l.child; l !== null; ) {
        var t = l;
        kv(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), l = l.sibling;
      }
  }
  function Vt(l, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        Kv(l, t.alternate, t), t = t.sibling;
  }
  function Gu(l) {
    for (l = l.child; l !== null; ) {
      var t = l;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          fu(4, t, t.return), Gu(t);
          break;
        case 1:
          Mt(t, t.return);
          var u = t.stateNode;
          typeof u.componentWillUnmount == "function" && jv(
            t,
            t.return,
            u
          ), Gu(t);
          break;
        case 27:
          ye(t.stateNode);
        case 26:
        case 5:
          Mt(t, t.return), Gu(t);
          break;
        case 22:
          t.memoizedState === null && Gu(t);
          break;
        case 30:
          Gu(t);
          break;
        default:
          Gu(t);
      }
      l = l.sibling;
    }
  }
  function xt(l, t, u) {
    for (u = u && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var a = t.alternate, e = l, n = t, f = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          xt(
            e,
            n,
            u
          ), le(4, n);
          break;
        case 1:
          if (xt(
            e,
            n,
            u
          ), a = n, e = a.stateNode, typeof e.componentDidMount == "function")
            try {
              e.componentDidMount();
            } catch (s) {
              I(a, a.return, s);
            }
          if (a = n, e = a.updateQueue, e !== null) {
            var c = a.stateNode;
            try {
              var i = e.shared.hiddenCallbacks;
              if (i !== null)
                for (e.shared.hiddenCallbacks = null, e = 0; e < i.length; e++)
                  r0(i[e], c);
            } catch (s) {
              I(a, a.return, s);
            }
          }
          u && f & 64 && Xv(n), te(n, n.return);
          break;
        case 27:
          xv(n);
        case 26:
        case 5:
          xt(
            e,
            n,
            u
          ), u && a === null && f & 4 && Zv(n), te(n, n.return);
          break;
        case 12:
          xt(
            e,
            n,
            u
          );
          break;
        case 31:
          xt(
            e,
            n,
            u
          ), u && f & 4 && Wv(e, n);
          break;
        case 13:
          xt(
            e,
            n,
            u
          ), u && f & 4 && $v(e, n);
          break;
        case 22:
          n.memoizedState === null && xt(
            e,
            n,
            u
          ), te(n, n.return);
          break;
        case 30:
          break;
        default:
          xt(
            e,
            n,
            u
          );
      }
      t = t.sibling;
    }
  }
  function Tc(l, t) {
    var u = null;
    l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (u = l.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== u && (l != null && l.refCount++, u != null && Za(u));
  }
  function Ec(l, t) {
    l = null, t.alternate !== null && (l = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== l && (t.refCount++, l != null && Za(l));
  }
  function zt(l, t, u, a) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        Iv(
          l,
          t,
          u,
          a
        ), t = t.sibling;
  }
  function Iv(l, t, u, a) {
    var e = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        zt(
          l,
          t,
          u,
          a
        ), e & 2048 && le(9, t);
        break;
      case 1:
        zt(
          l,
          t,
          u,
          a
        );
        break;
      case 3:
        zt(
          l,
          t,
          u,
          a
        ), e & 2048 && (l = null, t.alternate !== null && (l = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== l && (t.refCount++, l != null && Za(l)));
        break;
      case 12:
        if (e & 2048) {
          zt(
            l,
            t,
            u,
            a
          ), l = t.stateNode;
          try {
            var n = t.memoizedProps, f = n.id, c = n.onPostCommit;
            typeof c == "function" && c(
              f,
              t.alternate === null ? "mount" : "update",
              l.passiveEffectDuration,
              -0
            );
          } catch (i) {
            I(t, t.return, i);
          }
        } else
          zt(
            l,
            t,
            u,
            a
          );
        break;
      case 31:
        zt(
          l,
          t,
          u,
          a
        );
        break;
      case 13:
        zt(
          l,
          t,
          u,
          a
        );
        break;
      case 23:
        break;
      case 22:
        n = t.stateNode, f = t.alternate, t.memoizedState !== null ? n._visibility & 2 ? zt(
          l,
          t,
          u,
          a
        ) : ue(l, t) : n._visibility & 2 ? zt(
          l,
          t,
          u,
          a
        ) : (n._visibility |= 2, da(
          l,
          t,
          u,
          a,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), e & 2048 && Tc(f, t);
        break;
      case 24:
        zt(
          l,
          t,
          u,
          a
        ), e & 2048 && Ec(t.alternate, t);
        break;
      default:
        zt(
          l,
          t,
          u,
          a
        );
    }
  }
  function da(l, t, u, a, e) {
    for (e = e && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var n = l, f = t, c = u, i = a, s = f.flags;
      switch (f.tag) {
        case 0:
        case 11:
        case 15:
          da(
            n,
            f,
            c,
            i,
            e
          ), le(8, f);
          break;
        case 23:
          break;
        case 22:
          var g = f.stateNode;
          f.memoizedState !== null ? g._visibility & 2 ? da(
            n,
            f,
            c,
            i,
            e
          ) : ue(
            n,
            f
          ) : (g._visibility |= 2, da(
            n,
            f,
            c,
            i,
            e
          )), e && s & 2048 && Tc(
            f.alternate,
            f
          );
          break;
        case 24:
          da(
            n,
            f,
            c,
            i,
            e
          ), e && s & 2048 && Ec(f.alternate, f);
          break;
        default:
          da(
            n,
            f,
            c,
            i,
            e
          );
      }
      t = t.sibling;
    }
  }
  function ue(l, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var u = l, a = t, e = a.flags;
        switch (a.tag) {
          case 22:
            ue(u, a), e & 2048 && Tc(
              a.alternate,
              a
            );
            break;
          case 24:
            ue(u, a), e & 2048 && Ec(a.alternate, a);
            break;
          default:
            ue(u, a);
        }
        t = t.sibling;
      }
  }
  var ae = 8192;
  function sa(l, t, u) {
    if (l.subtreeFlags & ae)
      for (l = l.child; l !== null; )
        Pv(
          l,
          t,
          u
        ), l = l.sibling;
  }
  function Pv(l, t, u) {
    switch (l.tag) {
      case 26:
        sa(
          l,
          t,
          u
        ), l.flags & ae && l.memoizedState !== null && Yd(
          u,
          bt,
          l.memoizedState,
          l.memoizedProps
        );
        break;
      case 5:
        sa(
          l,
          t,
          u
        );
        break;
      case 3:
      case 4:
        var a = bt;
        bt = Mn(l.stateNode.containerInfo), sa(
          l,
          t,
          u
        ), bt = a;
        break;
      case 22:
        l.memoizedState === null && (a = l.alternate, a !== null && a.memoizedState !== null ? (a = ae, ae = 16777216, sa(
          l,
          t,
          u
        ), ae = a) : sa(
          l,
          t,
          u
        ));
        break;
      default:
        sa(
          l,
          t,
          u
        );
    }
  }
  function ly(l) {
    var t = l.alternate;
    if (t !== null && (l = t.child, l !== null)) {
      t.child = null;
      do
        t = l.sibling, l.sibling = null, l = t;
      while (l !== null);
    }
  }
  function ee(l) {
    var t = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (t !== null)
        for (var u = 0; u < t.length; u++) {
          var a = t[u];
          Ol = a, uy(
            a,
            l
          );
        }
      ly(l);
    }
    if (l.subtreeFlags & 10256)
      for (l = l.child; l !== null; )
        ty(l), l = l.sibling;
  }
  function ty(l) {
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        ee(l), l.flags & 2048 && fu(9, l, l.return);
        break;
      case 3:
        ee(l);
        break;
      case 12:
        ee(l);
        break;
      case 22:
        var t = l.stateNode;
        l.memoizedState !== null && t._visibility & 2 && (l.return === null || l.return.tag !== 13) ? (t._visibility &= -3, dn(l)) : ee(l);
        break;
      default:
        ee(l);
    }
  }
  function dn(l) {
    var t = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (t !== null)
        for (var u = 0; u < t.length; u++) {
          var a = t[u];
          Ol = a, uy(
            a,
            l
          );
        }
      ly(l);
    }
    for (l = l.child; l !== null; ) {
      switch (t = l, t.tag) {
        case 0:
        case 11:
        case 15:
          fu(8, t, t.return), dn(t);
          break;
        case 22:
          u = t.stateNode, u._visibility & 2 && (u._visibility &= -3, dn(t));
          break;
        default:
          dn(t);
      }
      l = l.sibling;
    }
  }
  function uy(l, t) {
    for (; Ol !== null; ) {
      var u = Ol;
      switch (u.tag) {
        case 0:
        case 11:
        case 15:
          fu(8, u, t);
          break;
        case 23:
        case 22:
          if (u.memoizedState !== null && u.memoizedState.cachePool !== null) {
            var a = u.memoizedState.cachePool.pool;
            a != null && a.refCount++;
          }
          break;
        case 24:
          Za(u.memoizedState.cache);
      }
      if (a = u.child, a !== null) a.return = u, Ol = a;
      else
        l: for (u = l; Ol !== null; ) {
          a = Ol;
          var e = a.sibling, n = a.return;
          if (Jv(a), a === u) {
            Ol = null;
            break l;
          }
          if (e !== null) {
            e.return = n, Ol = e;
            break l;
          }
          Ol = n;
        }
    }
  }
  var Fm = {
    getCacheForType: function(l) {
      var t = Ul(gl), u = t.data.get(l);
      return u === void 0 && (u = l(), t.data.set(l, u)), u;
    },
    cacheSignal: function() {
      return Ul(gl).controller.signal;
    }
  }, km = typeof WeakMap == "function" ? WeakMap : Map, w = 0, el = null, X = null, Z = 0, k = 0, ut = null, cu = !1, ha = !1, Ac = !1, Lt = 0, dl = 0, iu = 0, Qu = 0, _c = 0, at = 0, oa = 0, ne = null, Kl = null, Oc = !1, sn = 0, ay = 0, hn = 1 / 0, on = null, vu = null, Al = 0, yu = null, Sa = null, Kt = 0, Mc = 0, Dc = null, ey = null, fe = 0, Uc = null;
  function et() {
    return (w & 2) !== 0 && Z !== 0 ? Z & -Z : b.T !== null ? qc() : Ti();
  }
  function ny() {
    if (at === 0)
      if ((Z & 536870912) === 0 || L) {
        var l = Ae;
        Ae <<= 1, (Ae & 3932160) === 0 && (Ae = 262144), at = l;
      } else at = 536870912;
    return l = lt.current, l !== null && (l.flags |= 32), at;
  }
  function Jl(l, t, u) {
    (l === el && (k === 2 || k === 9) || l.cancelPendingCommit !== null) && (ga(l, 0), mu(
      l,
      Z,
      at,
      !1
    )), Ua(l, u), ((w & 2) === 0 || l !== el) && (l === el && ((w & 2) === 0 && (Qu |= u), dl === 4 && mu(
      l,
      Z,
      at,
      !1
    )), Dt(l));
  }
  function fy(l, t, u) {
    if ((w & 6) !== 0) throw Error(o(327));
    var a = !u && (t & 127) === 0 && (t & l.expiredLanes) === 0 || Da(l, t), e = a ? ld(l, t) : Hc(l, t, !0), n = a;
    do {
      if (e === 0) {
        ha && !a && mu(l, t, 0, !1);
        break;
      } else {
        if (u = l.current.alternate, n && !Im(u)) {
          e = Hc(l, t, !1), n = !1;
          continue;
        }
        if (e === 2) {
          if (n = t, l.errorRecoveryDisabledLanes & n)
            var f = 0;
          else
            f = l.pendingLanes & -536870913, f = f !== 0 ? f : f & 536870912 ? 536870912 : 0;
          if (f !== 0) {
            t = f;
            l: {
              var c = l;
              e = ne;
              var i = c.current.memoizedState.isDehydrated;
              if (i && (ga(c, f).flags |= 256), f = Hc(
                c,
                f,
                !1
              ), f !== 2) {
                if (Ac && !i) {
                  c.errorRecoveryDisabledLanes |= n, Qu |= n, e = 4;
                  break l;
                }
                n = Kl, Kl = e, n !== null && (Kl === null ? Kl = n : Kl.push.apply(
                  Kl,
                  n
                ));
              }
              e = f;
            }
            if (n = !1, e !== 2) continue;
          }
        }
        if (e === 1) {
          ga(l, 0), mu(l, t, 0, !0);
          break;
        }
        l: {
          switch (a = l, n = e, n) {
            case 0:
            case 1:
              throw Error(o(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              mu(
                a,
                t,
                at,
                !cu
              );
              break l;
            case 2:
              Kl = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(o(329));
          }
          if ((t & 62914560) === t && (e = sn + 300 - $l(), 10 < e)) {
            if (mu(
              a,
              t,
              at,
              !cu
            ), Oe(a, 0, !0) !== 0) break l;
            Kt = t, a.timeoutHandle = Gy(
              cy.bind(
                null,
                a,
                u,
                Kl,
                on,
                Oc,
                t,
                at,
                Qu,
                oa,
                cu,
                n,
                "Throttled",
                -0,
                0
              ),
              e
            );
            break l;
          }
          cy(
            a,
            u,
            Kl,
            on,
            Oc,
            t,
            at,
            Qu,
            oa,
            cu,
            n,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    Dt(l);
  }
  function cy(l, t, u, a, e, n, f, c, i, s, g, T, h, S) {
    if (l.timeoutHandle = -1, T = t.subtreeFlags, T & 8192 || (T & 16785408) === 16785408) {
      T = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: Nt
      }, Pv(
        t,
        n,
        T
      );
      var D = (n & 62914560) === n ? sn - $l() : (n & 4194048) === n ? ay - $l() : 0;
      if (D = Bd(
        T,
        D
      ), D !== null) {
        Kt = n, l.cancelPendingCommit = D(
          oy.bind(
            null,
            l,
            t,
            n,
            u,
            a,
            e,
            f,
            c,
            i,
            g,
            T,
            null,
            h,
            S
          )
        ), mu(l, n, f, !s);
        return;
      }
    }
    oy(
      l,
      t,
      n,
      u,
      a,
      e,
      f,
      c,
      i
    );
  }
  function Im(l) {
    for (var t = l; ; ) {
      var u = t.tag;
      if ((u === 0 || u === 11 || u === 15) && t.flags & 16384 && (u = t.updateQueue, u !== null && (u = u.stores, u !== null)))
        for (var a = 0; a < u.length; a++) {
          var e = u[a], n = e.getSnapshot;
          e = e.value;
          try {
            if (!Il(n(), e)) return !1;
          } catch {
            return !1;
          }
        }
      if (u = t.child, t.subtreeFlags & 16384 && u !== null)
        u.return = t, t = u;
      else {
        if (t === l) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === l) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function mu(l, t, u, a) {
    t &= ~_c, t &= ~Qu, l.suspendedLanes |= t, l.pingedLanes &= ~t, a && (l.warmLanes |= t), a = l.expirationTimes;
    for (var e = t; 0 < e; ) {
      var n = 31 - kl(e), f = 1 << n;
      a[n] = -1, e &= ~f;
    }
    u !== 0 && gi(l, u, t);
  }
  function Sn() {
    return (w & 6) === 0 ? (ce(0), !1) : !0;
  }
  function rc() {
    if (X !== null) {
      if (k === 0)
        var l = X.return;
      else
        l = X, Ct = Hu = null, Lf(l), ca = null, xa = 0, l = X;
      for (; l !== null; )
        Qv(l.alternate, l), l = l.return;
      X = null;
    }
  }
  function ga(l, t) {
    var u = l.timeoutHandle;
    u !== -1 && (l.timeoutHandle = -1, bd(u)), u = l.cancelPendingCommit, u !== null && (l.cancelPendingCommit = null, u()), Kt = 0, rc(), el = l, X = u = pt(l.current, null), Z = t, k = 0, ut = null, cu = !1, ha = Da(l, t), Ac = !1, oa = at = _c = Qu = iu = dl = 0, Kl = ne = null, Oc = !1, (t & 8) !== 0 && (t |= t & 32);
    var a = l.entangledLanes;
    if (a !== 0)
      for (l = l.entanglements, a &= t; 0 < a; ) {
        var e = 31 - kl(a), n = 1 << e;
        t |= l[e], a &= ~n;
      }
    return Lt = t, Be(), u;
  }
  function iy(l, t) {
    B = null, b.H = ka, t === fa || t === Le ? (t = O0(), k = 3) : t === pf ? (t = O0(), k = 4) : k = t === fc ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, ut = t, X === null && (dl = 1, en(
      l,
      vt(t, l.current)
    ));
  }
  function vy() {
    var l = lt.current;
    return l === null ? !0 : (Z & 4194048) === Z ? st === null : (Z & 62914560) === Z || (Z & 536870912) !== 0 ? l === st : !1;
  }
  function yy() {
    var l = b.H;
    return b.H = ka, l === null ? ka : l;
  }
  function my() {
    var l = b.A;
    return b.A = Fm, l;
  }
  function gn() {
    dl = 4, cu || (Z & 4194048) !== Z && lt.current !== null || (ha = !0), (iu & 134217727) === 0 && (Qu & 134217727) === 0 || el === null || mu(
      el,
      Z,
      at,
      !1
    );
  }
  function Hc(l, t, u) {
    var a = w;
    w |= 2;
    var e = yy(), n = my();
    (el !== l || Z !== t) && (on = null, ga(l, t)), t = !1;
    var f = dl;
    l: do
      try {
        if (k !== 0 && X !== null) {
          var c = X, i = ut;
          switch (k) {
            case 8:
              rc(), f = 6;
              break l;
            case 3:
            case 2:
            case 9:
            case 6:
              lt.current === null && (t = !0);
              var s = k;
              if (k = 0, ut = null, ba(l, c, i, s), u && ha) {
                f = 0;
                break l;
              }
              break;
            default:
              s = k, k = 0, ut = null, ba(l, c, i, s);
          }
        }
        Pm(), f = dl;
        break;
      } catch (g) {
        iy(l, g);
      }
    while (!0);
    return t && l.shellSuspendCounter++, Ct = Hu = null, w = a, b.H = e, b.A = n, X === null && (el = null, Z = 0, Be()), f;
  }
  function Pm() {
    for (; X !== null; ) dy(X);
  }
  function ld(l, t) {
    var u = w;
    w |= 2;
    var a = yy(), e = my();
    el !== l || Z !== t ? (on = null, hn = $l() + 500, ga(l, t)) : ha = Da(
      l,
      t
    );
    l: do
      try {
        if (k !== 0 && X !== null) {
          t = X;
          var n = ut;
          t: switch (k) {
            case 1:
              k = 0, ut = null, ba(l, t, n, 1);
              break;
            case 2:
            case 9:
              if (A0(n)) {
                k = 0, ut = null, sy(t);
                break;
              }
              t = function() {
                k !== 2 && k !== 9 || el !== l || (k = 7), Dt(l);
              }, n.then(t, t);
              break l;
            case 3:
              k = 7;
              break l;
            case 4:
              k = 5;
              break l;
            case 7:
              A0(n) ? (k = 0, ut = null, sy(t)) : (k = 0, ut = null, ba(l, t, n, 7));
              break;
            case 5:
              var f = null;
              switch (X.tag) {
                case 26:
                  f = X.memoizedState;
                case 5:
                case 27:
                  var c = X;
                  if (f ? Iy(f) : c.stateNode.complete) {
                    k = 0, ut = null;
                    var i = c.sibling;
                    if (i !== null) X = i;
                    else {
                      var s = c.return;
                      s !== null ? (X = s, bn(s)) : X = null;
                    }
                    break t;
                  }
              }
              k = 0, ut = null, ba(l, t, n, 5);
              break;
            case 6:
              k = 0, ut = null, ba(l, t, n, 6);
              break;
            case 8:
              rc(), dl = 6;
              break l;
            default:
              throw Error(o(462));
          }
        }
        td();
        break;
      } catch (g) {
        iy(l, g);
      }
    while (!0);
    return Ct = Hu = null, b.H = a, b.A = e, w = u, X !== null ? 0 : (el = null, Z = 0, Be(), dl);
  }
  function td() {
    for (; X !== null && !O1(); )
      dy(X);
  }
  function dy(l) {
    var t = Bv(l.alternate, l, Lt);
    l.memoizedProps = l.pendingProps, t === null ? bn(l) : X = t;
  }
  function sy(l) {
    var t = l, u = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = Nv(
          u,
          t,
          t.pendingProps,
          t.type,
          void 0,
          Z
        );
        break;
      case 11:
        t = Nv(
          u,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          Z
        );
        break;
      case 5:
        Lf(t);
      default:
        Qv(u, t), t = X = m0(t, Lt), t = Bv(u, t, Lt);
    }
    l.memoizedProps = l.pendingProps, t === null ? bn(l) : X = t;
  }
  function ba(l, t, u, a) {
    Ct = Hu = null, Lf(t), ca = null, xa = 0;
    var e = t.return;
    try {
      if (xm(
        l,
        e,
        t,
        u,
        Z
      )) {
        dl = 1, en(
          l,
          vt(u, l.current)
        ), X = null;
        return;
      }
    } catch (n) {
      if (e !== null) throw X = e, n;
      dl = 1, en(
        l,
        vt(u, l.current)
      ), X = null;
      return;
    }
    t.flags & 32768 ? (L || a === 1 ? l = !0 : ha || (Z & 536870912) !== 0 ? l = !1 : (cu = l = !0, (a === 2 || a === 9 || a === 3 || a === 6) && (a = lt.current, a !== null && a.tag === 13 && (a.flags |= 16384))), hy(t, l)) : bn(t);
  }
  function bn(l) {
    var t = l;
    do {
      if ((t.flags & 32768) !== 0) {
        hy(
          t,
          cu
        );
        return;
      }
      l = t.return;
      var u = Jm(
        t.alternate,
        t,
        Lt
      );
      if (u !== null) {
        X = u;
        return;
      }
      if (t = t.sibling, t !== null) {
        X = t;
        return;
      }
      X = t = l;
    } while (t !== null);
    dl === 0 && (dl = 5);
  }
  function hy(l, t) {
    do {
      var u = wm(l.alternate, l);
      if (u !== null) {
        u.flags &= 32767, X = u;
        return;
      }
      if (u = l.return, u !== null && (u.flags |= 32768, u.subtreeFlags = 0, u.deletions = null), !t && (l = l.sibling, l !== null)) {
        X = l;
        return;
      }
      X = l = u;
    } while (l !== null);
    dl = 6, X = null;
  }
  function oy(l, t, u, a, e, n, f, c, i) {
    l.cancelPendingCommit = null;
    do
      zn();
    while (Al !== 0);
    if ((w & 6) !== 0) throw Error(o(327));
    if (t !== null) {
      if (t === l.current) throw Error(o(177));
      if (n = t.lanes | t.childLanes, n |= gf, C1(
        l,
        u,
        n,
        f,
        c,
        i
      ), l === el && (X = el = null, Z = 0), Sa = t, yu = l, Kt = u, Mc = n, Dc = e, ey = a, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (l.callbackNode = null, l.callbackPriority = 0, nd(Te, function() {
        return Ty(), null;
      })) : (l.callbackNode = null, l.callbackPriority = 0), a = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || a) {
        a = b.T, b.T = null, e = O.p, O.p = 2, f = w, w |= 4;
        try {
          Wm(l, t, u);
        } finally {
          w = f, O.p = e, b.T = a;
        }
      }
      Al = 1, Sy(), gy(), by();
    }
  }
  function Sy() {
    if (Al === 1) {
      Al = 0;
      var l = yu, t = Sa, u = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || u) {
        u = b.T, b.T = null;
        var a = O.p;
        O.p = 2;
        var e = w;
        w |= 4;
        try {
          Fv(t, l);
          var n = Zc, f = u0(l.containerInfo), c = n.focusedElem, i = n.selectionRange;
          if (f !== c && c && c.ownerDocument && t0(
            c.ownerDocument.documentElement,
            c
          )) {
            if (i !== null && df(c)) {
              var s = i.start, g = i.end;
              if (g === void 0 && (g = s), "selectionStart" in c)
                c.selectionStart = s, c.selectionEnd = Math.min(
                  g,
                  c.value.length
                );
              else {
                var T = c.ownerDocument || document, h = T && T.defaultView || window;
                if (h.getSelection) {
                  var S = h.getSelection(), D = c.textContent.length, R = Math.min(i.start, D), ul = i.end === void 0 ? R : Math.min(i.end, D);
                  !S.extend && R > ul && (f = ul, ul = R, R = f);
                  var m = l0(
                    c,
                    R
                  ), v = l0(
                    c,
                    ul
                  );
                  if (m && v && (S.rangeCount !== 1 || S.anchorNode !== m.node || S.anchorOffset !== m.offset || S.focusNode !== v.node || S.focusOffset !== v.offset)) {
                    var d = T.createRange();
                    d.setStart(m.node, m.offset), S.removeAllRanges(), R > ul ? (S.addRange(d), S.extend(v.node, v.offset)) : (d.setEnd(v.node, v.offset), S.addRange(d));
                  }
                }
              }
            }
            for (T = [], S = c; S = S.parentNode; )
              S.nodeType === 1 && T.push({
                element: S,
                left: S.scrollLeft,
                top: S.scrollTop
              });
            for (typeof c.focus == "function" && c.focus(), c = 0; c < T.length; c++) {
              var z = T[c];
              z.element.scrollLeft = z.left, z.element.scrollTop = z.top;
            }
          }
          Rn = !!jc, Zc = jc = null;
        } finally {
          w = e, O.p = a, b.T = u;
        }
      }
      l.current = t, Al = 2;
    }
  }
  function gy() {
    if (Al === 2) {
      Al = 0;
      var l = yu, t = Sa, u = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || u) {
        u = b.T, b.T = null;
        var a = O.p;
        O.p = 2;
        var e = w;
        w |= 4;
        try {
          Kv(l, t.alternate, t);
        } finally {
          w = e, O.p = a, b.T = u;
        }
      }
      Al = 3;
    }
  }
  function by() {
    if (Al === 4 || Al === 3) {
      Al = 0, M1();
      var l = yu, t = Sa, u = Kt, a = ey;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Al = 5 : (Al = 0, Sa = yu = null, zy(l, l.pendingLanes));
      var e = l.pendingLanes;
      if (e === 0 && (vu = null), Jn(u), t = t.stateNode, Fl && typeof Fl.onCommitFiberRoot == "function")
        try {
          Fl.onCommitFiberRoot(
            Ma,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (a !== null) {
        t = b.T, e = O.p, O.p = 2, b.T = null;
        try {
          for (var n = l.onRecoverableError, f = 0; f < a.length; f++) {
            var c = a[f];
            n(c.value, {
              componentStack: c.stack
            });
          }
        } finally {
          b.T = t, O.p = e;
        }
      }
      (Kt & 3) !== 0 && zn(), Dt(l), e = l.pendingLanes, (u & 261930) !== 0 && (e & 42) !== 0 ? l === Uc ? fe++ : (fe = 0, Uc = l) : fe = 0, ce(0);
    }
  }
  function zy(l, t) {
    (l.pooledCacheLanes &= t) === 0 && (t = l.pooledCache, t != null && (l.pooledCache = null, Za(t)));
  }
  function zn() {
    return Sy(), gy(), by(), Ty();
  }
  function Ty() {
    if (Al !== 5) return !1;
    var l = yu, t = Mc;
    Mc = 0;
    var u = Jn(Kt), a = b.T, e = O.p;
    try {
      O.p = 32 > u ? 32 : u, b.T = null, u = Dc, Dc = null;
      var n = yu, f = Kt;
      if (Al = 0, Sa = yu = null, Kt = 0, (w & 6) !== 0) throw Error(o(331));
      var c = w;
      if (w |= 4, ty(n.current), Iv(
        n,
        n.current,
        f,
        u
      ), w = c, ce(0, !1), Fl && typeof Fl.onPostCommitFiberRoot == "function")
        try {
          Fl.onPostCommitFiberRoot(Ma, n);
        } catch {
        }
      return !0;
    } finally {
      O.p = e, b.T = a, zy(l, t);
    }
  }
  function Ey(l, t, u) {
    t = vt(u, t), t = nc(l.stateNode, t, 2), l = au(l, t, 2), l !== null && (Ua(l, 2), Dt(l));
  }
  function I(l, t, u) {
    if (l.tag === 3)
      Ey(l, l, u);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Ey(
            t,
            l,
            u
          );
          break;
        } else if (t.tag === 1) {
          var a = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof a.componentDidCatch == "function" && (vu === null || !vu.has(a))) {
            l = vt(u, l), u = Av(2), a = au(t, u, 2), a !== null && (_v(
              u,
              a,
              t,
              l
            ), Ua(a, 2), Dt(a));
            break;
          }
        }
        t = t.return;
      }
  }
  function Nc(l, t, u) {
    var a = l.pingCache;
    if (a === null) {
      a = l.pingCache = new km();
      var e = /* @__PURE__ */ new Set();
      a.set(t, e);
    } else
      e = a.get(t), e === void 0 && (e = /* @__PURE__ */ new Set(), a.set(t, e));
    e.has(u) || (Ac = !0, e.add(u), l = ud.bind(null, l, t, u), t.then(l, l));
  }
  function ud(l, t, u) {
    var a = l.pingCache;
    a !== null && a.delete(t), l.pingedLanes |= l.suspendedLanes & u, l.warmLanes &= ~u, el === l && (Z & u) === u && (dl === 4 || dl === 3 && (Z & 62914560) === Z && 300 > $l() - sn ? (w & 2) === 0 && ga(l, 0) : _c |= u, oa === Z && (oa = 0)), Dt(l);
  }
  function Ay(l, t) {
    t === 0 && (t = Si()), l = Du(l, t), l !== null && (Ua(l, t), Dt(l));
  }
  function ad(l) {
    var t = l.memoizedState, u = 0;
    t !== null && (u = t.retryLane), Ay(l, u);
  }
  function ed(l, t) {
    var u = 0;
    switch (l.tag) {
      case 31:
      case 13:
        var a = l.stateNode, e = l.memoizedState;
        e !== null && (u = e.retryLane);
        break;
      case 19:
        a = l.stateNode;
        break;
      case 22:
        a = l.stateNode._retryCache;
        break;
      default:
        throw Error(o(314));
    }
    a !== null && a.delete(t), Ay(l, u);
  }
  function nd(l, t) {
    return Vn(l, t);
  }
  var Tn = null, za = null, Rc = !1, En = !1, pc = !1, du = 0;
  function Dt(l) {
    l !== za && l.next === null && (za === null ? Tn = za = l : za = za.next = l), En = !0, Rc || (Rc = !0, cd());
  }
  function ce(l, t) {
    if (!pc && En) {
      pc = !0;
      do
        for (var u = !1, a = Tn; a !== null; ) {
          if (l !== 0) {
            var e = a.pendingLanes;
            if (e === 0) var n = 0;
            else {
              var f = a.suspendedLanes, c = a.pingedLanes;
              n = (1 << 31 - kl(42 | l) + 1) - 1, n &= e & ~(f & ~c), n = n & 201326741 ? n & 201326741 | 1 : n ? n | 2 : 0;
            }
            n !== 0 && (u = !0, Dy(a, n));
          } else
            n = Z, n = Oe(
              a,
              a === el ? n : 0,
              a.cancelPendingCommit !== null || a.timeoutHandle !== -1
            ), (n & 3) === 0 || Da(a, n) || (u = !0, Dy(a, n));
          a = a.next;
        }
      while (u);
      pc = !1;
    }
  }
  function fd() {
    _y();
  }
  function _y() {
    En = Rc = !1;
    var l = 0;
    du !== 0 && gd() && (l = du);
    for (var t = $l(), u = null, a = Tn; a !== null; ) {
      var e = a.next, n = Oy(a, t);
      n === 0 ? (a.next = null, u === null ? Tn = e : u.next = e, e === null && (za = u)) : (u = a, (l !== 0 || (n & 3) !== 0) && (En = !0)), a = e;
    }
    Al !== 0 && Al !== 5 || ce(l), du !== 0 && (du = 0);
  }
  function Oy(l, t) {
    for (var u = l.suspendedLanes, a = l.pingedLanes, e = l.expirationTimes, n = l.pendingLanes & -62914561; 0 < n; ) {
      var f = 31 - kl(n), c = 1 << f, i = e[f];
      i === -1 ? ((c & u) === 0 || (c & a) !== 0) && (e[f] = q1(c, t)) : i <= t && (l.expiredLanes |= c), n &= ~c;
    }
    if (t = el, u = Z, u = Oe(
      l,
      l === t ? u : 0,
      l.cancelPendingCommit !== null || l.timeoutHandle !== -1
    ), a = l.callbackNode, u === 0 || l === t && (k === 2 || k === 9) || l.cancelPendingCommit !== null)
      return a !== null && a !== null && xn(a), l.callbackNode = null, l.callbackPriority = 0;
    if ((u & 3) === 0 || Da(l, u)) {
      if (t = u & -u, t === l.callbackPriority) return t;
      switch (a !== null && xn(a), Jn(u)) {
        case 2:
        case 8:
          u = hi;
          break;
        case 32:
          u = Te;
          break;
        case 268435456:
          u = oi;
          break;
        default:
          u = Te;
      }
      return a = My.bind(null, l), u = Vn(u, a), l.callbackPriority = t, l.callbackNode = u, t;
    }
    return a !== null && a !== null && xn(a), l.callbackPriority = 2, l.callbackNode = null, 2;
  }
  function My(l, t) {
    if (Al !== 0 && Al !== 5)
      return l.callbackNode = null, l.callbackPriority = 0, null;
    var u = l.callbackNode;
    if (zn() && l.callbackNode !== u)
      return null;
    var a = Z;
    return a = Oe(
      l,
      l === el ? a : 0,
      l.cancelPendingCommit !== null || l.timeoutHandle !== -1
    ), a === 0 ? null : (fy(l, a, t), Oy(l, $l()), l.callbackNode != null && l.callbackNode === u ? My.bind(null, l) : null);
  }
  function Dy(l, t) {
    if (zn()) return null;
    fy(l, t, !0);
  }
  function cd() {
    zd(function() {
      (w & 6) !== 0 ? Vn(
        si,
        fd
      ) : _y();
    });
  }
  function qc() {
    if (du === 0) {
      var l = ea;
      l === 0 && (l = Ee, Ee <<= 1, (Ee & 261888) === 0 && (Ee = 256)), du = l;
    }
    return du;
  }
  function Uy(l) {
    return l == null || typeof l == "symbol" || typeof l == "boolean" ? null : typeof l == "function" ? l : re("" + l);
  }
  function ry(l, t) {
    var u = t.ownerDocument.createElement("input");
    return u.name = t.name, u.value = t.value, l.id && u.setAttribute("form", l.id), t.parentNode.insertBefore(u, t), l = new FormData(l), u.parentNode.removeChild(u), l;
  }
  function id(l, t, u, a, e) {
    if (t === "submit" && u && u.stateNode === e) {
      var n = Uy(
        (e[jl] || null).action
      ), f = a.submitter;
      f && (t = (t = f[jl] || null) ? Uy(t.formAction) : f.getAttribute("formAction"), t !== null && (n = t, f = null));
      var c = new pe(
        "action",
        "action",
        null,
        a,
        e
      );
      l.push({
        event: c,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (a.defaultPrevented) {
                if (du !== 0) {
                  var i = f ? ry(e, f) : new FormData(e);
                  Pf(
                    u,
                    {
                      pending: !0,
                      data: i,
                      method: e.method,
                      action: n
                    },
                    null,
                    i
                  );
                }
              } else
                typeof n == "function" && (c.preventDefault(), i = f ? ry(e, f) : new FormData(e), Pf(
                  u,
                  {
                    pending: !0,
                    data: i,
                    method: e.method,
                    action: n
                  },
                  n,
                  i
                ));
            },
            currentTarget: e
          }
        ]
      });
    }
  }
  for (var Cc = 0; Cc < Sf.length; Cc++) {
    var Yc = Sf[Cc], vd = Yc.toLowerCase(), yd = Yc[0].toUpperCase() + Yc.slice(1);
    gt(
      vd,
      "on" + yd
    );
  }
  gt(n0, "onAnimationEnd"), gt(f0, "onAnimationIteration"), gt(c0, "onAnimationStart"), gt("dblclick", "onDoubleClick"), gt("focusin", "onFocus"), gt("focusout", "onBlur"), gt(Dm, "onTransitionRun"), gt(Um, "onTransitionStart"), gt(rm, "onTransitionCancel"), gt(i0, "onTransitionEnd"), Lu("onMouseEnter", ["mouseout", "mouseover"]), Lu("onMouseLeave", ["mouseout", "mouseover"]), Lu("onPointerEnter", ["pointerout", "pointerover"]), Lu("onPointerLeave", ["pointerout", "pointerover"]), Au(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), Au(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), Au("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), Au(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), Au(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), Au(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var ie = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), md = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ie)
  );
  function Hy(l, t) {
    t = (t & 4) !== 0;
    for (var u = 0; u < l.length; u++) {
      var a = l[u], e = a.event;
      a = a.listeners;
      l: {
        var n = void 0;
        if (t)
          for (var f = a.length - 1; 0 <= f; f--) {
            var c = a[f], i = c.instance, s = c.currentTarget;
            if (c = c.listener, i !== n && e.isPropagationStopped())
              break l;
            n = c, e.currentTarget = s;
            try {
              n(e);
            } catch (g) {
              Ye(g);
            }
            e.currentTarget = null, n = i;
          }
        else
          for (f = 0; f < a.length; f++) {
            if (c = a[f], i = c.instance, s = c.currentTarget, c = c.listener, i !== n && e.isPropagationStopped())
              break l;
            n = c, e.currentTarget = s;
            try {
              n(e);
            } catch (g) {
              Ye(g);
            }
            e.currentTarget = null, n = i;
          }
      }
    }
  }
  function j(l, t) {
    var u = t[wn];
    u === void 0 && (u = t[wn] = /* @__PURE__ */ new Set());
    var a = l + "__bubble";
    u.has(a) || (Ny(t, l, 2, !1), u.add(a));
  }
  function Bc(l, t, u) {
    var a = 0;
    t && (a |= 4), Ny(
      u,
      l,
      a,
      t
    );
  }
  var An = "_reactListening" + Math.random().toString(36).slice(2);
  function Gc(l) {
    if (!l[An]) {
      l[An] = !0, _i.forEach(function(u) {
        u !== "selectionchange" && (md.has(u) || Bc(u, !1, l), Bc(u, !0, l));
      });
      var t = l.nodeType === 9 ? l : l.ownerDocument;
      t === null || t[An] || (t[An] = !0, Bc("selectionchange", !1, t));
    }
  }
  function Ny(l, t, u, a) {
    switch (n1(t)) {
      case 2:
        var e = Xd;
        break;
      case 8:
        e = jd;
        break;
      default:
        e = Ic;
    }
    u = e.bind(
      null,
      t,
      u,
      l
    ), e = void 0, !uf || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (e = !0), a ? e !== void 0 ? l.addEventListener(t, u, {
      capture: !0,
      passive: e
    }) : l.addEventListener(t, u, !0) : e !== void 0 ? l.addEventListener(t, u, {
      passive: e
    }) : l.addEventListener(t, u, !1);
  }
  function Qc(l, t, u, a, e) {
    var n = a;
    if ((t & 1) === 0 && (t & 2) === 0 && a !== null)
      l: for (; ; ) {
        if (a === null) return;
        var f = a.tag;
        if (f === 3 || f === 4) {
          var c = a.stateNode.containerInfo;
          if (c === e) break;
          if (f === 4)
            for (f = a.return; f !== null; ) {
              var i = f.tag;
              if ((i === 3 || i === 4) && f.stateNode.containerInfo === e)
                return;
              f = f.return;
            }
          for (; c !== null; ) {
            if (f = Zu(c), f === null) return;
            if (i = f.tag, i === 5 || i === 6 || i === 26 || i === 27) {
              a = n = f;
              continue l;
            }
            c = c.parentNode;
          }
        }
        a = a.return;
      }
    Yi(function() {
      var s = n, g = lf(u), T = [];
      l: {
        var h = v0.get(l);
        if (h !== void 0) {
          var S = pe, D = l;
          switch (l) {
            case "keypress":
              if (Ne(u) === 0) break l;
            case "keydown":
            case "keyup":
              S = em;
              break;
            case "focusin":
              D = "focus", S = ff;
              break;
            case "focusout":
              D = "blur", S = ff;
              break;
            case "beforeblur":
            case "afterblur":
              S = ff;
              break;
            case "click":
              if (u.button === 2) break l;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              S = Qi;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              S = J1;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              S = cm;
              break;
            case n0:
            case f0:
            case c0:
              S = $1;
              break;
            case i0:
              S = vm;
              break;
            case "scroll":
            case "scrollend":
              S = L1;
              break;
            case "wheel":
              S = mm;
              break;
            case "copy":
            case "cut":
            case "paste":
              S = k1;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              S = ji;
              break;
            case "toggle":
            case "beforetoggle":
              S = sm;
          }
          var R = (t & 4) !== 0, ul = !R && (l === "scroll" || l === "scrollend"), m = R ? h !== null ? h + "Capture" : null : h;
          R = [];
          for (var v = s, d; v !== null; ) {
            var z = v;
            if (d = z.stateNode, z = z.tag, z !== 5 && z !== 26 && z !== 27 || d === null || m === null || (z = Na(v, m), z != null && R.push(
              ve(v, z, d)
            )), ul) break;
            v = v.return;
          }
          0 < R.length && (h = new S(
            h,
            D,
            null,
            u,
            g
          ), T.push({ event: h, listeners: R }));
        }
      }
      if ((t & 7) === 0) {
        l: {
          if (h = l === "mouseover" || l === "pointerover", S = l === "mouseout" || l === "pointerout", h && u !== Pn && (D = u.relatedTarget || u.fromElement) && (Zu(D) || D[ju]))
            break l;
          if ((S || h) && (h = g.window === g ? g : (h = g.ownerDocument) ? h.defaultView || h.parentWindow : window, S ? (D = u.relatedTarget || u.toElement, S = s, D = D ? Zu(D) : null, D !== null && (ul = sl(D), R = D.tag, D !== ul || R !== 5 && R !== 27 && R !== 6) && (D = null)) : (S = null, D = s), S !== D)) {
            if (R = Qi, z = "onMouseLeave", m = "onMouseEnter", v = "mouse", (l === "pointerout" || l === "pointerover") && (R = ji, z = "onPointerLeave", m = "onPointerEnter", v = "pointer"), ul = S == null ? h : Ha(S), d = D == null ? h : Ha(D), h = new R(
              z,
              v + "leave",
              S,
              u,
              g
            ), h.target = ul, h.relatedTarget = d, z = null, Zu(g) === s && (R = new R(
              m,
              v + "enter",
              D,
              u,
              g
            ), R.target = d, R.relatedTarget = ul, z = R), ul = z, S && D)
              t: {
                for (R = dd, m = S, v = D, d = 0, z = m; z; z = R(z))
                  d++;
                z = 0;
                for (var H = v; H; H = R(H))
                  z++;
                for (; 0 < d - z; )
                  m = R(m), d--;
                for (; 0 < z - d; )
                  v = R(v), z--;
                for (; d--; ) {
                  if (m === v || v !== null && m === v.alternate) {
                    R = m;
                    break t;
                  }
                  m = R(m), v = R(v);
                }
                R = null;
              }
            else R = null;
            S !== null && Ry(
              T,
              h,
              S,
              R,
              !1
            ), D !== null && ul !== null && Ry(
              T,
              ul,
              D,
              R,
              !0
            );
          }
        }
        l: {
          if (h = s ? Ha(s) : window, S = h.nodeName && h.nodeName.toLowerCase(), S === "select" || S === "input" && h.type === "file")
            var K = Wi;
          else if (Ji(h))
            if ($i)
              K = _m;
            else {
              K = Em;
              var r = Tm;
            }
          else
            S = h.nodeName, !S || S.toLowerCase() !== "input" || h.type !== "checkbox" && h.type !== "radio" ? s && In(s.elementType) && (K = Wi) : K = Am;
          if (K && (K = K(l, s))) {
            wi(
              T,
              K,
              u,
              g
            );
            break l;
          }
          r && r(l, h, s), l === "focusout" && s && h.type === "number" && s.memoizedProps.value != null && kn(h, "number", h.value);
        }
        switch (r = s ? Ha(s) : window, l) {
          case "focusin":
            (Ji(r) || r.contentEditable === "true") && (Fu = r, sf = s, Qa = null);
            break;
          case "focusout":
            Qa = sf = Fu = null;
            break;
          case "mousedown":
            hf = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            hf = !1, a0(T, u, g);
            break;
          case "selectionchange":
            if (Mm) break;
          case "keydown":
          case "keyup":
            a0(T, u, g);
        }
        var G;
        if (vf)
          l: {
            switch (l) {
              case "compositionstart":
                var V = "onCompositionStart";
                break l;
              case "compositionend":
                V = "onCompositionEnd";
                break l;
              case "compositionupdate":
                V = "onCompositionUpdate";
                break l;
            }
            V = void 0;
          }
        else
          $u ? Li(l, u) && (V = "onCompositionEnd") : l === "keydown" && u.keyCode === 229 && (V = "onCompositionStart");
        V && (Zi && u.locale !== "ko" && ($u || V !== "onCompositionStart" ? V === "onCompositionEnd" && $u && (G = Bi()) : (Ft = g, af = "value" in Ft ? Ft.value : Ft.textContent, $u = !0)), r = _n(s, V), 0 < r.length && (V = new Xi(
          V,
          l,
          null,
          u,
          g
        ), T.push({ event: V, listeners: r }), G ? V.data = G : (G = Ki(u), G !== null && (V.data = G)))), (G = om ? Sm(l, u) : gm(l, u)) && (V = _n(s, "onBeforeInput"), 0 < V.length && (r = new Xi(
          "onBeforeInput",
          "beforeinput",
          null,
          u,
          g
        ), T.push({
          event: r,
          listeners: V
        }), r.data = G)), id(
          T,
          l,
          s,
          u,
          g
        );
      }
      Hy(T, t);
    });
  }
  function ve(l, t, u) {
    return {
      instance: l,
      listener: t,
      currentTarget: u
    };
  }
  function _n(l, t) {
    for (var u = t + "Capture", a = []; l !== null; ) {
      var e = l, n = e.stateNode;
      if (e = e.tag, e !== 5 && e !== 26 && e !== 27 || n === null || (e = Na(l, u), e != null && a.unshift(
        ve(l, e, n)
      ), e = Na(l, t), e != null && a.push(
        ve(l, e, n)
      )), l.tag === 3) return a;
      l = l.return;
    }
    return [];
  }
  function dd(l) {
    if (l === null) return null;
    do
      l = l.return;
    while (l && l.tag !== 5 && l.tag !== 27);
    return l || null;
  }
  function Ry(l, t, u, a, e) {
    for (var n = t._reactName, f = []; u !== null && u !== a; ) {
      var c = u, i = c.alternate, s = c.stateNode;
      if (c = c.tag, i !== null && i === a) break;
      c !== 5 && c !== 26 && c !== 27 || s === null || (i = s, e ? (s = Na(u, n), s != null && f.unshift(
        ve(u, s, i)
      )) : e || (s = Na(u, n), s != null && f.push(
        ve(u, s, i)
      ))), u = u.return;
    }
    f.length !== 0 && l.push({ event: t, listeners: f });
  }
  var sd = /\r\n?/g, hd = /\u0000|\uFFFD/g;
  function py(l) {
    return (typeof l == "string" ? l : "" + l).replace(sd, `
`).replace(hd, "");
  }
  function qy(l, t) {
    return t = py(t), py(l) === t;
  }
  function tl(l, t, u, a, e, n) {
    switch (u) {
      case "children":
        typeof a == "string" ? t === "body" || t === "textarea" && a === "" || Ju(l, a) : (typeof a == "number" || typeof a == "bigint") && t !== "body" && Ju(l, "" + a);
        break;
      case "className":
        De(l, "class", a);
        break;
      case "tabIndex":
        De(l, "tabindex", a);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        De(l, u, a);
        break;
      case "style":
        qi(l, a, n);
        break;
      case "data":
        if (t !== "object") {
          De(l, "data", a);
          break;
        }
      case "src":
      case "href":
        if (a === "" && (t !== "a" || u !== "href")) {
          l.removeAttribute(u);
          break;
        }
        if (a == null || typeof a == "function" || typeof a == "symbol" || typeof a == "boolean") {
          l.removeAttribute(u);
          break;
        }
        a = re("" + a), l.setAttribute(u, a);
        break;
      case "action":
      case "formAction":
        if (typeof a == "function") {
          l.setAttribute(
            u,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof n == "function" && (u === "formAction" ? (t !== "input" && tl(l, t, "name", e.name, e, null), tl(
            l,
            t,
            "formEncType",
            e.formEncType,
            e,
            null
          ), tl(
            l,
            t,
            "formMethod",
            e.formMethod,
            e,
            null
          ), tl(
            l,
            t,
            "formTarget",
            e.formTarget,
            e,
            null
          )) : (tl(l, t, "encType", e.encType, e, null), tl(l, t, "method", e.method, e, null), tl(l, t, "target", e.target, e, null)));
        if (a == null || typeof a == "symbol" || typeof a == "boolean") {
          l.removeAttribute(u);
          break;
        }
        a = re("" + a), l.setAttribute(u, a);
        break;
      case "onClick":
        a != null && (l.onclick = Nt);
        break;
      case "onScroll":
        a != null && j("scroll", l);
        break;
      case "onScrollEnd":
        a != null && j("scrollend", l);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(o(61));
          if (u = a.__html, u != null) {
            if (e.children != null) throw Error(o(60));
            l.innerHTML = u;
          }
        }
        break;
      case "multiple":
        l.multiple = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "muted":
        l.muted = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (a == null || typeof a == "function" || typeof a == "boolean" || typeof a == "symbol") {
          l.removeAttribute("xlink:href");
          break;
        }
        u = re("" + a), l.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          u
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        a != null && typeof a != "function" && typeof a != "symbol" ? l.setAttribute(u, "" + a) : l.removeAttribute(u);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        a && typeof a != "function" && typeof a != "symbol" ? l.setAttribute(u, "") : l.removeAttribute(u);
        break;
      case "capture":
      case "download":
        a === !0 ? l.setAttribute(u, "") : a !== !1 && a != null && typeof a != "function" && typeof a != "symbol" ? l.setAttribute(u, a) : l.removeAttribute(u);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        a != null && typeof a != "function" && typeof a != "symbol" && !isNaN(a) && 1 <= a ? l.setAttribute(u, a) : l.removeAttribute(u);
        break;
      case "rowSpan":
      case "start":
        a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a) ? l.removeAttribute(u) : l.setAttribute(u, a);
        break;
      case "popover":
        j("beforetoggle", l), j("toggle", l), Me(l, "popover", a);
        break;
      case "xlinkActuate":
        Ht(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          a
        );
        break;
      case "xlinkArcrole":
        Ht(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          a
        );
        break;
      case "xlinkRole":
        Ht(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          a
        );
        break;
      case "xlinkShow":
        Ht(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          a
        );
        break;
      case "xlinkTitle":
        Ht(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          a
        );
        break;
      case "xlinkType":
        Ht(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          a
        );
        break;
      case "xmlBase":
        Ht(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          a
        );
        break;
      case "xmlLang":
        Ht(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          a
        );
        break;
      case "xmlSpace":
        Ht(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          a
        );
        break;
      case "is":
        Me(l, "is", a);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < u.length) || u[0] !== "o" && u[0] !== "O" || u[1] !== "n" && u[1] !== "N") && (u = V1.get(u) || u, Me(l, u, a));
    }
  }
  function Xc(l, t, u, a, e, n) {
    switch (u) {
      case "style":
        qi(l, a, n);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(o(61));
          if (u = a.__html, u != null) {
            if (e.children != null) throw Error(o(60));
            l.innerHTML = u;
          }
        }
        break;
      case "children":
        typeof a == "string" ? Ju(l, a) : (typeof a == "number" || typeof a == "bigint") && Ju(l, "" + a);
        break;
      case "onScroll":
        a != null && j("scroll", l);
        break;
      case "onScrollEnd":
        a != null && j("scrollend", l);
        break;
      case "onClick":
        a != null && (l.onclick = Nt);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Oi.hasOwnProperty(u))
          l: {
            if (u[0] === "o" && u[1] === "n" && (e = u.endsWith("Capture"), t = u.slice(2, e ? u.length - 7 : void 0), n = l[jl] || null, n = n != null ? n[u] : null, typeof n == "function" && l.removeEventListener(t, n, e), typeof a == "function")) {
              typeof n != "function" && n !== null && (u in l ? l[u] = null : l.hasAttribute(u) && l.removeAttribute(u)), l.addEventListener(t, a, e);
              break l;
            }
            u in l ? l[u] = a : a === !0 ? l.setAttribute(u, "") : Me(l, u, a);
          }
    }
  }
  function Hl(l, t, u) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        j("error", l), j("load", l);
        var a = !1, e = !1, n;
        for (n in u)
          if (u.hasOwnProperty(n)) {
            var f = u[n];
            if (f != null)
              switch (n) {
                case "src":
                  a = !0;
                  break;
                case "srcSet":
                  e = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(o(137, t));
                default:
                  tl(l, t, n, f, u, null);
              }
          }
        e && tl(l, t, "srcSet", u.srcSet, u, null), a && tl(l, t, "src", u.src, u, null);
        return;
      case "input":
        j("invalid", l);
        var c = n = f = e = null, i = null, s = null;
        for (a in u)
          if (u.hasOwnProperty(a)) {
            var g = u[a];
            if (g != null)
              switch (a) {
                case "name":
                  e = g;
                  break;
                case "type":
                  f = g;
                  break;
                case "checked":
                  i = g;
                  break;
                case "defaultChecked":
                  s = g;
                  break;
                case "value":
                  n = g;
                  break;
                case "defaultValue":
                  c = g;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (g != null)
                    throw Error(o(137, t));
                  break;
                default:
                  tl(l, t, a, g, u, null);
              }
          }
        Hi(
          l,
          n,
          c,
          i,
          s,
          f,
          e,
          !1
        );
        return;
      case "select":
        j("invalid", l), a = f = n = null;
        for (e in u)
          if (u.hasOwnProperty(e) && (c = u[e], c != null))
            switch (e) {
              case "value":
                n = c;
                break;
              case "defaultValue":
                f = c;
                break;
              case "multiple":
                a = c;
              default:
                tl(l, t, e, c, u, null);
            }
        t = n, u = f, l.multiple = !!a, t != null ? Ku(l, !!a, t, !1) : u != null && Ku(l, !!a, u, !0);
        return;
      case "textarea":
        j("invalid", l), n = e = a = null;
        for (f in u)
          if (u.hasOwnProperty(f) && (c = u[f], c != null))
            switch (f) {
              case "value":
                a = c;
                break;
              case "defaultValue":
                e = c;
                break;
              case "children":
                n = c;
                break;
              case "dangerouslySetInnerHTML":
                if (c != null) throw Error(o(91));
                break;
              default:
                tl(l, t, f, c, u, null);
            }
        Ri(l, a, e, n);
        return;
      case "option":
        for (i in u)
          u.hasOwnProperty(i) && (a = u[i], a != null) && (i === "selected" ? l.selected = a && typeof a != "function" && typeof a != "symbol" : tl(l, t, i, a, u, null));
        return;
      case "dialog":
        j("beforetoggle", l), j("toggle", l), j("cancel", l), j("close", l);
        break;
      case "iframe":
      case "object":
        j("load", l);
        break;
      case "video":
      case "audio":
        for (a = 0; a < ie.length; a++)
          j(ie[a], l);
        break;
      case "image":
        j("error", l), j("load", l);
        break;
      case "details":
        j("toggle", l);
        break;
      case "embed":
      case "source":
      case "link":
        j("error", l), j("load", l);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (s in u)
          if (u.hasOwnProperty(s) && (a = u[s], a != null))
            switch (s) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(o(137, t));
              default:
                tl(l, t, s, a, u, null);
            }
        return;
      default:
        if (In(t)) {
          for (g in u)
            u.hasOwnProperty(g) && (a = u[g], a !== void 0 && Xc(
              l,
              t,
              g,
              a,
              u,
              void 0
            ));
          return;
        }
    }
    for (c in u)
      u.hasOwnProperty(c) && (a = u[c], a != null && tl(l, t, c, a, u, null));
  }
  function od(l, t, u, a) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var e = null, n = null, f = null, c = null, i = null, s = null, g = null;
        for (S in u) {
          var T = u[S];
          if (u.hasOwnProperty(S) && T != null)
            switch (S) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                i = T;
              default:
                a.hasOwnProperty(S) || tl(l, t, S, null, a, T);
            }
        }
        for (var h in a) {
          var S = a[h];
          if (T = u[h], a.hasOwnProperty(h) && (S != null || T != null))
            switch (h) {
              case "type":
                n = S;
                break;
              case "name":
                e = S;
                break;
              case "checked":
                s = S;
                break;
              case "defaultChecked":
                g = S;
                break;
              case "value":
                f = S;
                break;
              case "defaultValue":
                c = S;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (S != null)
                  throw Error(o(137, t));
                break;
              default:
                S !== T && tl(
                  l,
                  t,
                  h,
                  S,
                  a,
                  T
                );
            }
        }
        Fn(
          l,
          f,
          c,
          i,
          s,
          g,
          n,
          e
        );
        return;
      case "select":
        S = f = c = h = null;
        for (n in u)
          if (i = u[n], u.hasOwnProperty(n) && i != null)
            switch (n) {
              case "value":
                break;
              case "multiple":
                S = i;
              default:
                a.hasOwnProperty(n) || tl(
                  l,
                  t,
                  n,
                  null,
                  a,
                  i
                );
            }
        for (e in a)
          if (n = a[e], i = u[e], a.hasOwnProperty(e) && (n != null || i != null))
            switch (e) {
              case "value":
                h = n;
                break;
              case "defaultValue":
                c = n;
                break;
              case "multiple":
                f = n;
              default:
                n !== i && tl(
                  l,
                  t,
                  e,
                  n,
                  a,
                  i
                );
            }
        t = c, u = f, a = S, h != null ? Ku(l, !!u, h, !1) : !!a != !!u && (t != null ? Ku(l, !!u, t, !0) : Ku(l, !!u, u ? [] : "", !1));
        return;
      case "textarea":
        S = h = null;
        for (c in u)
          if (e = u[c], u.hasOwnProperty(c) && e != null && !a.hasOwnProperty(c))
            switch (c) {
              case "value":
                break;
              case "children":
                break;
              default:
                tl(l, t, c, null, a, e);
            }
        for (f in a)
          if (e = a[f], n = u[f], a.hasOwnProperty(f) && (e != null || n != null))
            switch (f) {
              case "value":
                h = e;
                break;
              case "defaultValue":
                S = e;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (e != null) throw Error(o(91));
                break;
              default:
                e !== n && tl(l, t, f, e, a, n);
            }
        Ni(l, h, S);
        return;
      case "option":
        for (var D in u)
          h = u[D], u.hasOwnProperty(D) && h != null && !a.hasOwnProperty(D) && (D === "selected" ? l.selected = !1 : tl(
            l,
            t,
            D,
            null,
            a,
            h
          ));
        for (i in a)
          h = a[i], S = u[i], a.hasOwnProperty(i) && h !== S && (h != null || S != null) && (i === "selected" ? l.selected = h && typeof h != "function" && typeof h != "symbol" : tl(
            l,
            t,
            i,
            h,
            a,
            S
          ));
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var R in u)
          h = u[R], u.hasOwnProperty(R) && h != null && !a.hasOwnProperty(R) && tl(l, t, R, null, a, h);
        for (s in a)
          if (h = a[s], S = u[s], a.hasOwnProperty(s) && h !== S && (h != null || S != null))
            switch (s) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (h != null)
                  throw Error(o(137, t));
                break;
              default:
                tl(
                  l,
                  t,
                  s,
                  h,
                  a,
                  S
                );
            }
        return;
      default:
        if (In(t)) {
          for (var ul in u)
            h = u[ul], u.hasOwnProperty(ul) && h !== void 0 && !a.hasOwnProperty(ul) && Xc(
              l,
              t,
              ul,
              void 0,
              a,
              h
            );
          for (g in a)
            h = a[g], S = u[g], !a.hasOwnProperty(g) || h === S || h === void 0 && S === void 0 || Xc(
              l,
              t,
              g,
              h,
              a,
              S
            );
          return;
        }
    }
    for (var m in u)
      h = u[m], u.hasOwnProperty(m) && h != null && !a.hasOwnProperty(m) && tl(l, t, m, null, a, h);
    for (T in a)
      h = a[T], S = u[T], !a.hasOwnProperty(T) || h === S || h == null && S == null || tl(l, t, T, h, a, S);
  }
  function Cy(l) {
    switch (l) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function Sd() {
    if (typeof performance.getEntriesByType == "function") {
      for (var l = 0, t = 0, u = performance.getEntriesByType("resource"), a = 0; a < u.length; a++) {
        var e = u[a], n = e.transferSize, f = e.initiatorType, c = e.duration;
        if (n && c && Cy(f)) {
          for (f = 0, c = e.responseEnd, a += 1; a < u.length; a++) {
            var i = u[a], s = i.startTime;
            if (s > c) break;
            var g = i.transferSize, T = i.initiatorType;
            g && Cy(T) && (i = i.responseEnd, f += g * (i < c ? 1 : (c - s) / (i - s)));
          }
          if (--a, t += 8 * (n + f) / (e.duration / 1e3), l++, 10 < l) break;
        }
      }
      if (0 < l) return t / l / 1e6;
    }
    return navigator.connection && (l = navigator.connection.downlink, typeof l == "number") ? l : 5;
  }
  var jc = null, Zc = null;
  function On(l) {
    return l.nodeType === 9 ? l : l.ownerDocument;
  }
  function Yy(l) {
    switch (l) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function By(l, t) {
    if (l === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return l === 1 && t === "foreignObject" ? 0 : l;
  }
  function Vc(l, t) {
    return l === "textarea" || l === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var xc = null;
  function gd() {
    var l = window.event;
    return l && l.type === "popstate" ? l === xc ? !1 : (xc = l, !0) : (xc = null, !1);
  }
  var Gy = typeof setTimeout == "function" ? setTimeout : void 0, bd = typeof clearTimeout == "function" ? clearTimeout : void 0, Qy = typeof Promise == "function" ? Promise : void 0, zd = typeof queueMicrotask == "function" ? queueMicrotask : typeof Qy < "u" ? function(l) {
    return Qy.resolve(null).then(l).catch(Td);
  } : Gy;
  function Td(l) {
    setTimeout(function() {
      throw l;
    });
  }
  function su(l) {
    return l === "head";
  }
  function Xy(l, t) {
    var u = t, a = 0;
    do {
      var e = u.nextSibling;
      if (l.removeChild(u), e && e.nodeType === 8)
        if (u = e.data, u === "/$" || u === "/&") {
          if (a === 0) {
            l.removeChild(e), _a(t);
            return;
          }
          a--;
        } else if (u === "$" || u === "$?" || u === "$~" || u === "$!" || u === "&")
          a++;
        else if (u === "html")
          ye(l.ownerDocument.documentElement);
        else if (u === "head") {
          u = l.ownerDocument.head, ye(u);
          for (var n = u.firstChild; n; ) {
            var f = n.nextSibling, c = n.nodeName;
            n[ra] || c === "SCRIPT" || c === "STYLE" || c === "LINK" && n.rel.toLowerCase() === "stylesheet" || u.removeChild(n), n = f;
          }
        } else
          u === "body" && ye(l.ownerDocument.body);
      u = e;
    } while (u);
    _a(t);
  }
  function jy(l, t) {
    var u = l;
    l = 0;
    do {
      var a = u.nextSibling;
      if (u.nodeType === 1 ? t ? (u._stashedDisplay = u.style.display, u.style.display = "none") : (u.style.display = u._stashedDisplay || "", u.getAttribute("style") === "" && u.removeAttribute("style")) : u.nodeType === 3 && (t ? (u._stashedText = u.nodeValue, u.nodeValue = "") : u.nodeValue = u._stashedText || ""), a && a.nodeType === 8)
        if (u = a.data, u === "/$") {
          if (l === 0) break;
          l--;
        } else
          u !== "$" && u !== "$?" && u !== "$~" && u !== "$!" || l++;
      u = a;
    } while (u);
  }
  function Lc(l) {
    var t = l.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var u = t;
      switch (t = t.nextSibling, u.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          Lc(u), Wn(u);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (u.rel.toLowerCase() === "stylesheet") continue;
      }
      l.removeChild(u);
    }
  }
  function Ed(l, t, u, a) {
    for (; l.nodeType === 1; ) {
      var e = u;
      if (l.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!a && (l.nodeName !== "INPUT" || l.type !== "hidden"))
          break;
      } else if (a) {
        if (!l[ra])
          switch (t) {
            case "meta":
              if (!l.hasAttribute("itemprop")) break;
              return l;
            case "link":
              if (n = l.getAttribute("rel"), n === "stylesheet" && l.hasAttribute("data-precedence"))
                break;
              if (n !== e.rel || l.getAttribute("href") !== (e.href == null || e.href === "" ? null : e.href) || l.getAttribute("crossorigin") !== (e.crossOrigin == null ? null : e.crossOrigin) || l.getAttribute("title") !== (e.title == null ? null : e.title))
                break;
              return l;
            case "style":
              if (l.hasAttribute("data-precedence")) break;
              return l;
            case "script":
              if (n = l.getAttribute("src"), (n !== (e.src == null ? null : e.src) || l.getAttribute("type") !== (e.type == null ? null : e.type) || l.getAttribute("crossorigin") !== (e.crossOrigin == null ? null : e.crossOrigin)) && n && l.hasAttribute("async") && !l.hasAttribute("itemprop"))
                break;
              return l;
            default:
              return l;
          }
      } else if (t === "input" && l.type === "hidden") {
        var n = e.name == null ? null : "" + e.name;
        if (e.type === "hidden" && l.getAttribute("name") === n)
          return l;
      } else return l;
      if (l = ht(l.nextSibling), l === null) break;
    }
    return null;
  }
  function Ad(l, t, u) {
    if (t === "") return null;
    for (; l.nodeType !== 3; )
      if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !u || (l = ht(l.nextSibling), l === null)) return null;
    return l;
  }
  function Zy(l, t) {
    for (; l.nodeType !== 8; )
      if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !t || (l = ht(l.nextSibling), l === null)) return null;
    return l;
  }
  function Kc(l) {
    return l.data === "$?" || l.data === "$~";
  }
  function Jc(l) {
    return l.data === "$!" || l.data === "$?" && l.ownerDocument.readyState !== "loading";
  }
  function _d(l, t) {
    var u = l.ownerDocument;
    if (l.data === "$~") l._reactRetry = t;
    else if (l.data !== "$?" || u.readyState !== "loading")
      t();
    else {
      var a = function() {
        t(), u.removeEventListener("DOMContentLoaded", a);
      };
      u.addEventListener("DOMContentLoaded", a), l._reactRetry = a;
    }
  }
  function ht(l) {
    for (; l != null; l = l.nextSibling) {
      var t = l.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = l.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
          break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return l;
  }
  var wc = null;
  function Vy(l) {
    l = l.nextSibling;
    for (var t = 0; l; ) {
      if (l.nodeType === 8) {
        var u = l.data;
        if (u === "/$" || u === "/&") {
          if (t === 0)
            return ht(l.nextSibling);
          t--;
        } else
          u !== "$" && u !== "$!" && u !== "$?" && u !== "$~" && u !== "&" || t++;
      }
      l = l.nextSibling;
    }
    return null;
  }
  function xy(l) {
    l = l.previousSibling;
    for (var t = 0; l; ) {
      if (l.nodeType === 8) {
        var u = l.data;
        if (u === "$" || u === "$!" || u === "$?" || u === "$~" || u === "&") {
          if (t === 0) return l;
          t--;
        } else u !== "/$" && u !== "/&" || t++;
      }
      l = l.previousSibling;
    }
    return null;
  }
  function Ly(l, t, u) {
    switch (t = On(u), l) {
      case "html":
        if (l = t.documentElement, !l) throw Error(o(452));
        return l;
      case "head":
        if (l = t.head, !l) throw Error(o(453));
        return l;
      case "body":
        if (l = t.body, !l) throw Error(o(454));
        return l;
      default:
        throw Error(o(451));
    }
  }
  function ye(l) {
    for (var t = l.attributes; t.length; )
      l.removeAttributeNode(t[0]);
    Wn(l);
  }
  var ot = /* @__PURE__ */ new Map(), Ky = /* @__PURE__ */ new Set();
  function Mn(l) {
    return typeof l.getRootNode == "function" ? l.getRootNode() : l.nodeType === 9 ? l : l.ownerDocument;
  }
  var Jt = O.d;
  O.d = {
    f: Od,
    r: Md,
    D: Dd,
    C: Ud,
    L: rd,
    m: Hd,
    X: Rd,
    S: Nd,
    M: pd
  };
  function Od() {
    var l = Jt.f(), t = Sn();
    return l || t;
  }
  function Md(l) {
    var t = Vu(l);
    t !== null && t.tag === 5 && t.type === "form" ? iv(t) : Jt.r(l);
  }
  var Ta = typeof document > "u" ? null : document;
  function Jy(l, t, u) {
    var a = Ta;
    if (a && typeof t == "string" && t) {
      var e = ct(t);
      e = 'link[rel="' + l + '"][href="' + e + '"]', typeof u == "string" && (e += '[crossorigin="' + u + '"]'), Ky.has(e) || (Ky.add(e), l = { rel: l, crossOrigin: u, href: t }, a.querySelector(e) === null && (t = a.createElement("link"), Hl(t, "link", l), _l(t), a.head.appendChild(t)));
    }
  }
  function Dd(l) {
    Jt.D(l), Jy("dns-prefetch", l, null);
  }
  function Ud(l, t) {
    Jt.C(l, t), Jy("preconnect", l, t);
  }
  function rd(l, t, u) {
    Jt.L(l, t, u);
    var a = Ta;
    if (a && l && t) {
      var e = 'link[rel="preload"][as="' + ct(t) + '"]';
      t === "image" && u && u.imageSrcSet ? (e += '[imagesrcset="' + ct(
        u.imageSrcSet
      ) + '"]', typeof u.imageSizes == "string" && (e += '[imagesizes="' + ct(
        u.imageSizes
      ) + '"]')) : e += '[href="' + ct(l) + '"]';
      var n = e;
      switch (t) {
        case "style":
          n = Ea(l);
          break;
        case "script":
          n = Aa(l);
      }
      ot.has(n) || (l = p(
        {
          rel: "preload",
          href: t === "image" && u && u.imageSrcSet ? void 0 : l,
          as: t
        },
        u
      ), ot.set(n, l), a.querySelector(e) !== null || t === "style" && a.querySelector(me(n)) || t === "script" && a.querySelector(de(n)) || (t = a.createElement("link"), Hl(t, "link", l), _l(t), a.head.appendChild(t)));
    }
  }
  function Hd(l, t) {
    Jt.m(l, t);
    var u = Ta;
    if (u && l) {
      var a = t && typeof t.as == "string" ? t.as : "script", e = 'link[rel="modulepreload"][as="' + ct(a) + '"][href="' + ct(l) + '"]', n = e;
      switch (a) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          n = Aa(l);
      }
      if (!ot.has(n) && (l = p({ rel: "modulepreload", href: l }, t), ot.set(n, l), u.querySelector(e) === null)) {
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (u.querySelector(de(n)))
              return;
        }
        a = u.createElement("link"), Hl(a, "link", l), _l(a), u.head.appendChild(a);
      }
    }
  }
  function Nd(l, t, u) {
    Jt.S(l, t, u);
    var a = Ta;
    if (a && l) {
      var e = xu(a).hoistableStyles, n = Ea(l);
      t = t || "default";
      var f = e.get(n);
      if (!f) {
        var c = { loading: 0, preload: null };
        if (f = a.querySelector(
          me(n)
        ))
          c.loading = 5;
        else {
          l = p(
            { rel: "stylesheet", href: l, "data-precedence": t },
            u
          ), (u = ot.get(n)) && Wc(l, u);
          var i = f = a.createElement("link");
          _l(i), Hl(i, "link", l), i._p = new Promise(function(s, g) {
            i.onload = s, i.onerror = g;
          }), i.addEventListener("load", function() {
            c.loading |= 1;
          }), i.addEventListener("error", function() {
            c.loading |= 2;
          }), c.loading |= 4, Dn(f, t, a);
        }
        f = {
          type: "stylesheet",
          instance: f,
          count: 1,
          state: c
        }, e.set(n, f);
      }
    }
  }
  function Rd(l, t) {
    Jt.X(l, t);
    var u = Ta;
    if (u && l) {
      var a = xu(u).hoistableScripts, e = Aa(l), n = a.get(e);
      n || (n = u.querySelector(de(e)), n || (l = p({ src: l, async: !0 }, t), (t = ot.get(e)) && $c(l, t), n = u.createElement("script"), _l(n), Hl(n, "link", l), u.head.appendChild(n)), n = {
        type: "script",
        instance: n,
        count: 1,
        state: null
      }, a.set(e, n));
    }
  }
  function pd(l, t) {
    Jt.M(l, t);
    var u = Ta;
    if (u && l) {
      var a = xu(u).hoistableScripts, e = Aa(l), n = a.get(e);
      n || (n = u.querySelector(de(e)), n || (l = p({ src: l, async: !0, type: "module" }, t), (t = ot.get(e)) && $c(l, t), n = u.createElement("script"), _l(n), Hl(n, "link", l), u.head.appendChild(n)), n = {
        type: "script",
        instance: n,
        count: 1,
        state: null
      }, a.set(e, n));
    }
  }
  function wy(l, t, u, a) {
    var e = (e = Q.current) ? Mn(e) : null;
    if (!e) throw Error(o(446));
    switch (l) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof u.precedence == "string" && typeof u.href == "string" ? (t = Ea(u.href), u = xu(
          e
        ).hoistableStyles, a = u.get(t), a || (a = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, u.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (u.rel === "stylesheet" && typeof u.href == "string" && typeof u.precedence == "string") {
          l = Ea(u.href);
          var n = xu(
            e
          ).hoistableStyles, f = n.get(l);
          if (f || (e = e.ownerDocument || e, f = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, n.set(l, f), (n = e.querySelector(
            me(l)
          )) && !n._p && (f.instance = n, f.state.loading = 5), ot.has(l) || (u = {
            rel: "preload",
            as: "style",
            href: u.href,
            crossOrigin: u.crossOrigin,
            integrity: u.integrity,
            media: u.media,
            hrefLang: u.hrefLang,
            referrerPolicy: u.referrerPolicy
          }, ot.set(l, u), n || qd(
            e,
            l,
            u,
            f.state
          ))), t && a === null)
            throw Error(o(528, ""));
          return f;
        }
        if (t && a !== null)
          throw Error(o(529, ""));
        return null;
      case "script":
        return t = u.async, u = u.src, typeof u == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Aa(u), u = xu(
          e
        ).hoistableScripts, a = u.get(t), a || (a = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, u.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(o(444, l));
    }
  }
  function Ea(l) {
    return 'href="' + ct(l) + '"';
  }
  function me(l) {
    return 'link[rel="stylesheet"][' + l + "]";
  }
  function Wy(l) {
    return p({}, l, {
      "data-precedence": l.precedence,
      precedence: null
    });
  }
  function qd(l, t, u, a) {
    l.querySelector('link[rel="preload"][as="style"][' + t + "]") ? a.loading = 1 : (t = l.createElement("link"), a.preload = t, t.addEventListener("load", function() {
      return a.loading |= 1;
    }), t.addEventListener("error", function() {
      return a.loading |= 2;
    }), Hl(t, "link", u), _l(t), l.head.appendChild(t));
  }
  function Aa(l) {
    return '[src="' + ct(l) + '"]';
  }
  function de(l) {
    return "script[async]" + l;
  }
  function $y(l, t, u) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var a = l.querySelector(
            'style[data-href~="' + ct(u.href) + '"]'
          );
          if (a)
            return t.instance = a, _l(a), a;
          var e = p({}, u, {
            "data-href": u.href,
            "data-precedence": u.precedence,
            href: null,
            precedence: null
          });
          return a = (l.ownerDocument || l).createElement(
            "style"
          ), _l(a), Hl(a, "style", e), Dn(a, u.precedence, l), t.instance = a;
        case "stylesheet":
          e = Ea(u.href);
          var n = l.querySelector(
            me(e)
          );
          if (n)
            return t.state.loading |= 4, t.instance = n, _l(n), n;
          a = Wy(u), (e = ot.get(e)) && Wc(a, e), n = (l.ownerDocument || l).createElement("link"), _l(n);
          var f = n;
          return f._p = new Promise(function(c, i) {
            f.onload = c, f.onerror = i;
          }), Hl(n, "link", a), t.state.loading |= 4, Dn(n, u.precedence, l), t.instance = n;
        case "script":
          return n = Aa(u.src), (e = l.querySelector(
            de(n)
          )) ? (t.instance = e, _l(e), e) : (a = u, (e = ot.get(n)) && (a = p({}, u), $c(a, e)), l = l.ownerDocument || l, e = l.createElement("script"), _l(e), Hl(e, "link", a), l.head.appendChild(e), t.instance = e);
        case "void":
          return null;
        default:
          throw Error(o(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (a = t.instance, t.state.loading |= 4, Dn(a, u.precedence, l));
    return t.instance;
  }
  function Dn(l, t, u) {
    for (var a = u.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), e = a.length ? a[a.length - 1] : null, n = e, f = 0; f < a.length; f++) {
      var c = a[f];
      if (c.dataset.precedence === t) n = c;
      else if (n !== e) break;
    }
    n ? n.parentNode.insertBefore(l, n.nextSibling) : (t = u.nodeType === 9 ? u.head : u, t.insertBefore(l, t.firstChild));
  }
  function Wc(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy), l.title == null && (l.title = t.title);
  }
  function $c(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy), l.integrity == null && (l.integrity = t.integrity);
  }
  var Un = null;
  function Fy(l, t, u) {
    if (Un === null) {
      var a = /* @__PURE__ */ new Map(), e = Un = /* @__PURE__ */ new Map();
      e.set(u, a);
    } else
      e = Un, a = e.get(u), a || (a = /* @__PURE__ */ new Map(), e.set(u, a));
    if (a.has(l)) return a;
    for (a.set(l, null), u = u.getElementsByTagName(l), e = 0; e < u.length; e++) {
      var n = u[e];
      if (!(n[ra] || n[Ml] || l === "link" && n.getAttribute("rel") === "stylesheet") && n.namespaceURI !== "http://www.w3.org/2000/svg") {
        var f = n.getAttribute(t) || "";
        f = l + f;
        var c = a.get(f);
        c ? c.push(n) : a.set(f, [n]);
      }
    }
    return a;
  }
  function ky(l, t, u) {
    l = l.ownerDocument || l, l.head.insertBefore(
      u,
      t === "title" ? l.querySelector("head > title") : null
    );
  }
  function Cd(l, t, u) {
    if (u === 1 || t.itemProp != null) return !1;
    switch (l) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
          break;
        return !0;
      case "link":
        if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
          break;
        return t.rel === "stylesheet" ? (l = t.disabled, typeof t.precedence == "string" && l == null) : !0;
      case "script":
        if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
          return !0;
    }
    return !1;
  }
  function Iy(l) {
    return !(l.type === "stylesheet" && (l.state.loading & 3) === 0);
  }
  function Yd(l, t, u, a) {
    if (u.type === "stylesheet" && (typeof a.media != "string" || matchMedia(a.media).matches !== !1) && (u.state.loading & 4) === 0) {
      if (u.instance === null) {
        var e = Ea(a.href), n = t.querySelector(
          me(e)
        );
        if (n) {
          t = n._p, t !== null && typeof t == "object" && typeof t.then == "function" && (l.count++, l = rn.bind(l), t.then(l, l)), u.state.loading |= 4, u.instance = n, _l(n);
          return;
        }
        n = t.ownerDocument || t, a = Wy(a), (e = ot.get(e)) && Wc(a, e), n = n.createElement("link"), _l(n);
        var f = n;
        f._p = new Promise(function(c, i) {
          f.onload = c, f.onerror = i;
        }), Hl(n, "link", a), u.instance = n;
      }
      l.stylesheets === null && (l.stylesheets = /* @__PURE__ */ new Map()), l.stylesheets.set(u, t), (t = u.state.preload) && (u.state.loading & 3) === 0 && (l.count++, u = rn.bind(l), t.addEventListener("load", u), t.addEventListener("error", u));
    }
  }
  var Fc = 0;
  function Bd(l, t) {
    return l.stylesheets && l.count === 0 && Nn(l, l.stylesheets), 0 < l.count || 0 < l.imgCount ? function(u) {
      var a = setTimeout(function() {
        if (l.stylesheets && Nn(l, l.stylesheets), l.unsuspend) {
          var n = l.unsuspend;
          l.unsuspend = null, n();
        }
      }, 6e4 + t);
      0 < l.imgBytes && Fc === 0 && (Fc = 62500 * Sd());
      var e = setTimeout(
        function() {
          if (l.waitingForImages = !1, l.count === 0 && (l.stylesheets && Nn(l, l.stylesheets), l.unsuspend)) {
            var n = l.unsuspend;
            l.unsuspend = null, n();
          }
        },
        (l.imgBytes > Fc ? 50 : 800) + t
      );
      return l.unsuspend = u, function() {
        l.unsuspend = null, clearTimeout(a), clearTimeout(e);
      };
    } : null;
  }
  function rn() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Nn(this, this.stylesheets);
      else if (this.unsuspend) {
        var l = this.unsuspend;
        this.unsuspend = null, l();
      }
    }
  }
  var Hn = null;
  function Nn(l, t) {
    l.stylesheets = null, l.unsuspend !== null && (l.count++, Hn = /* @__PURE__ */ new Map(), t.forEach(Gd, l), Hn = null, rn.call(l));
  }
  function Gd(l, t) {
    if (!(t.state.loading & 4)) {
      var u = Hn.get(l);
      if (u) var a = u.get(null);
      else {
        u = /* @__PURE__ */ new Map(), Hn.set(l, u);
        for (var e = l.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), n = 0; n < e.length; n++) {
          var f = e[n];
          (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") && (u.set(f.dataset.precedence, f), a = f);
        }
        a && u.set(null, a);
      }
      e = t.instance, f = e.getAttribute("data-precedence"), n = u.get(f) || a, n === a && u.set(null, e), u.set(f, e), this.count++, a = rn.bind(this), e.addEventListener("load", a), e.addEventListener("error", a), n ? n.parentNode.insertBefore(e, n.nextSibling) : (l = l.nodeType === 9 ? l.head : l, l.insertBefore(e, l.firstChild)), t.state.loading |= 4;
    }
  }
  var se = {
    $$typeof: Nl,
    Provider: null,
    Consumer: null,
    _currentValue: q,
    _currentValue2: q,
    _threadCount: 0
  };
  function Qd(l, t, u, a, e, n, f, c, i) {
    this.tag = 1, this.containerInfo = l, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ln(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ln(0), this.hiddenUpdates = Ln(null), this.identifierPrefix = a, this.onUncaughtError = e, this.onCaughtError = n, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = i, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function Py(l, t, u, a, e, n, f, c, i, s, g, T) {
    return l = new Qd(
      l,
      t,
      u,
      f,
      i,
      s,
      g,
      T,
      c
    ), t = 1, n === !0 && (t |= 24), n = Pl(3, null, null, t), l.current = n, n.stateNode = l, t = Hf(), t.refCount++, l.pooledCache = t, t.refCount++, n.memoizedState = {
      element: a,
      isDehydrated: u,
      cache: t
    }, qf(n), l;
  }
  function l1(l) {
    return l ? (l = Pu, l) : Pu;
  }
  function t1(l, t, u, a, e, n) {
    e = l1(e), a.context === null ? a.context = e : a.pendingContext = e, a = uu(t), a.payload = { element: u }, n = n === void 0 ? null : n, n !== null && (a.callback = n), u = au(l, a, t), u !== null && (Jl(u, l, t), Ka(u, l, t));
  }
  function u1(l, t) {
    if (l = l.memoizedState, l !== null && l.dehydrated !== null) {
      var u = l.retryLane;
      l.retryLane = u !== 0 && u < t ? u : t;
    }
  }
  function kc(l, t) {
    u1(l, t), (l = l.alternate) && u1(l, t);
  }
  function a1(l) {
    if (l.tag === 13 || l.tag === 31) {
      var t = Du(l, 67108864);
      t !== null && Jl(t, l, 67108864), kc(l, 67108864);
    }
  }
  function e1(l) {
    if (l.tag === 13 || l.tag === 31) {
      var t = et();
      t = Kn(t);
      var u = Du(l, t);
      u !== null && Jl(u, l, t), kc(l, t);
    }
  }
  var Rn = !0;
  function Xd(l, t, u, a) {
    var e = b.T;
    b.T = null;
    var n = O.p;
    try {
      O.p = 2, Ic(l, t, u, a);
    } finally {
      O.p = n, b.T = e;
    }
  }
  function jd(l, t, u, a) {
    var e = b.T;
    b.T = null;
    var n = O.p;
    try {
      O.p = 8, Ic(l, t, u, a);
    } finally {
      O.p = n, b.T = e;
    }
  }
  function Ic(l, t, u, a) {
    if (Rn) {
      var e = Pc(a);
      if (e === null)
        Qc(
          l,
          t,
          a,
          pn,
          u
        ), f1(l, a);
      else if (Vd(
        e,
        l,
        t,
        u,
        a
      ))
        a.stopPropagation();
      else if (f1(l, a), t & 4 && -1 < Zd.indexOf(l)) {
        for (; e !== null; ) {
          var n = Vu(e);
          if (n !== null)
            switch (n.tag) {
              case 3:
                if (n = n.stateNode, n.current.memoizedState.isDehydrated) {
                  var f = Eu(n.pendingLanes);
                  if (f !== 0) {
                    var c = n;
                    for (c.pendingLanes |= 2, c.entangledLanes |= 2; f; ) {
                      var i = 1 << 31 - kl(f);
                      c.entanglements[1] |= i, f &= ~i;
                    }
                    Dt(n), (w & 6) === 0 && (hn = $l() + 500, ce(0));
                  }
                }
                break;
              case 31:
              case 13:
                c = Du(n, 2), c !== null && Jl(c, n, 2), Sn(), kc(n, 2);
            }
          if (n = Pc(a), n === null && Qc(
            l,
            t,
            a,
            pn,
            u
          ), n === e) break;
          e = n;
        }
        e !== null && a.stopPropagation();
      } else
        Qc(
          l,
          t,
          a,
          null,
          u
        );
    }
  }
  function Pc(l) {
    return l = lf(l), li(l);
  }
  var pn = null;
  function li(l) {
    if (pn = null, l = Zu(l), l !== null) {
      var t = sl(l);
      if (t === null) l = null;
      else {
        var u = t.tag;
        if (u === 13) {
          if (l = El(t), l !== null) return l;
          l = null;
        } else if (u === 31) {
          if (l = pl(t), l !== null) return l;
          l = null;
        } else if (u === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          l = null;
        } else t !== l && (l = null);
      }
    }
    return pn = l, null;
  }
  function n1(l) {
    switch (l) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (D1()) {
          case si:
            return 2;
          case hi:
            return 8;
          case Te:
          case U1:
            return 32;
          case oi:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var ti = !1, hu = null, ou = null, Su = null, he = /* @__PURE__ */ new Map(), oe = /* @__PURE__ */ new Map(), gu = [], Zd = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function f1(l, t) {
    switch (l) {
      case "focusin":
      case "focusout":
        hu = null;
        break;
      case "dragenter":
      case "dragleave":
        ou = null;
        break;
      case "mouseover":
      case "mouseout":
        Su = null;
        break;
      case "pointerover":
      case "pointerout":
        he.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        oe.delete(t.pointerId);
    }
  }
  function Se(l, t, u, a, e, n) {
    return l === null || l.nativeEvent !== n ? (l = {
      blockedOn: t,
      domEventName: u,
      eventSystemFlags: a,
      nativeEvent: n,
      targetContainers: [e]
    }, t !== null && (t = Vu(t), t !== null && a1(t)), l) : (l.eventSystemFlags |= a, t = l.targetContainers, e !== null && t.indexOf(e) === -1 && t.push(e), l);
  }
  function Vd(l, t, u, a, e) {
    switch (t) {
      case "focusin":
        return hu = Se(
          hu,
          l,
          t,
          u,
          a,
          e
        ), !0;
      case "dragenter":
        return ou = Se(
          ou,
          l,
          t,
          u,
          a,
          e
        ), !0;
      case "mouseover":
        return Su = Se(
          Su,
          l,
          t,
          u,
          a,
          e
        ), !0;
      case "pointerover":
        var n = e.pointerId;
        return he.set(
          n,
          Se(
            he.get(n) || null,
            l,
            t,
            u,
            a,
            e
          )
        ), !0;
      case "gotpointercapture":
        return n = e.pointerId, oe.set(
          n,
          Se(
            oe.get(n) || null,
            l,
            t,
            u,
            a,
            e
          )
        ), !0;
    }
    return !1;
  }
  function c1(l) {
    var t = Zu(l.target);
    if (t !== null) {
      var u = sl(t);
      if (u !== null) {
        if (t = u.tag, t === 13) {
          if (t = El(u), t !== null) {
            l.blockedOn = t, Ei(l.priority, function() {
              e1(u);
            });
            return;
          }
        } else if (t === 31) {
          if (t = pl(u), t !== null) {
            l.blockedOn = t, Ei(l.priority, function() {
              e1(u);
            });
            return;
          }
        } else if (t === 3 && u.stateNode.current.memoizedState.isDehydrated) {
          l.blockedOn = u.tag === 3 ? u.stateNode.containerInfo : null;
          return;
        }
      }
    }
    l.blockedOn = null;
  }
  function qn(l) {
    if (l.blockedOn !== null) return !1;
    for (var t = l.targetContainers; 0 < t.length; ) {
      var u = Pc(l.nativeEvent);
      if (u === null) {
        u = l.nativeEvent;
        var a = new u.constructor(
          u.type,
          u
        );
        Pn = a, u.target.dispatchEvent(a), Pn = null;
      } else
        return t = Vu(u), t !== null && a1(t), l.blockedOn = u, !1;
      t.shift();
    }
    return !0;
  }
  function i1(l, t, u) {
    qn(l) && u.delete(t);
  }
  function xd() {
    ti = !1, hu !== null && qn(hu) && (hu = null), ou !== null && qn(ou) && (ou = null), Su !== null && qn(Su) && (Su = null), he.forEach(i1), oe.forEach(i1);
  }
  function Cn(l, t) {
    l.blockedOn === t && (l.blockedOn = null, ti || (ti = !0, _.unstable_scheduleCallback(
      _.unstable_NormalPriority,
      xd
    )));
  }
  var Yn = null;
  function v1(l) {
    Yn !== l && (Yn = l, _.unstable_scheduleCallback(
      _.unstable_NormalPriority,
      function() {
        Yn === l && (Yn = null);
        for (var t = 0; t < l.length; t += 3) {
          var u = l[t], a = l[t + 1], e = l[t + 2];
          if (typeof a != "function") {
            if (li(a || u) === null)
              continue;
            break;
          }
          var n = Vu(u);
          n !== null && (l.splice(t, 3), t -= 3, Pf(
            n,
            {
              pending: !0,
              data: e,
              method: u.method,
              action: a
            },
            a,
            e
          ));
        }
      }
    ));
  }
  function _a(l) {
    function t(i) {
      return Cn(i, l);
    }
    hu !== null && Cn(hu, l), ou !== null && Cn(ou, l), Su !== null && Cn(Su, l), he.forEach(t), oe.forEach(t);
    for (var u = 0; u < gu.length; u++) {
      var a = gu[u];
      a.blockedOn === l && (a.blockedOn = null);
    }
    for (; 0 < gu.length && (u = gu[0], u.blockedOn === null); )
      c1(u), u.blockedOn === null && gu.shift();
    if (u = (l.ownerDocument || l).$$reactFormReplay, u != null)
      for (a = 0; a < u.length; a += 3) {
        var e = u[a], n = u[a + 1], f = e[jl] || null;
        if (typeof n == "function")
          f || v1(u);
        else if (f) {
          var c = null;
          if (n && n.hasAttribute("formAction")) {
            if (e = n, f = n[jl] || null)
              c = f.formAction;
            else if (li(e) !== null) continue;
          } else c = f.action;
          typeof c == "function" ? u[a + 1] = c : (u.splice(a, 3), a -= 3), v1(u);
        }
      }
  }
  function y1() {
    function l(n) {
      n.canIntercept && n.info === "react-transition" && n.intercept({
        handler: function() {
          return new Promise(function(f) {
            return e = f;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      e !== null && (e(), e = null), a || setTimeout(u, 20);
    }
    function u() {
      if (!a && !navigation.transition) {
        var n = navigation.currentEntry;
        n && n.url != null && navigation.navigate(n.url, {
          state: n.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var a = !1, e = null;
      return navigation.addEventListener("navigate", l), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(u, 100), function() {
        a = !0, navigation.removeEventListener("navigate", l), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), e !== null && (e(), e = null);
      };
    }
  }
  function ui(l) {
    this._internalRoot = l;
  }
  Bn.prototype.render = ui.prototype.render = function(l) {
    var t = this._internalRoot;
    if (t === null) throw Error(o(409));
    var u = t.current, a = et();
    t1(u, a, l, t, null, null);
  }, Bn.prototype.unmount = ui.prototype.unmount = function() {
    var l = this._internalRoot;
    if (l !== null) {
      this._internalRoot = null;
      var t = l.containerInfo;
      t1(l.current, 2, null, l, null, null), Sn(), t[ju] = null;
    }
  };
  function Bn(l) {
    this._internalRoot = l;
  }
  Bn.prototype.unstable_scheduleHydration = function(l) {
    if (l) {
      var t = Ti();
      l = { blockedOn: null, target: l, priority: t };
      for (var u = 0; u < gu.length && t !== 0 && t < gu[u].priority; u++) ;
      gu.splice(u, 0, l), u === 0 && c1(l);
    }
  };
  var m1 = vl.version;
  if (m1 !== "19.2.3")
    throw Error(
      o(
        527,
        m1,
        "19.2.3"
      )
    );
  O.findDOMNode = function(l) {
    var t = l._reactInternals;
    if (t === void 0)
      throw typeof l.render == "function" ? Error(o(188)) : (l = Object.keys(l).join(","), Error(o(268, l)));
    return l = A(t), l = l !== null ? $(l) : null, l = l === null ? null : l.stateNode, l;
  };
  var Ld = {
    bundleType: 0,
    version: "19.2.3",
    rendererPackageName: "react-dom",
    currentDispatcherRef: b,
    reconcilerVersion: "19.2.3"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Gn = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Gn.isDisabled && Gn.supportsFiber)
      try {
        Ma = Gn.inject(
          Ld
        ), Fl = Gn;
      } catch {
      }
  }
  return be.createRoot = function(l, t) {
    if (!yl(l)) throw Error(o(299));
    var u = !1, a = "", e = bv, n = zv, f = Tv;
    return t != null && (t.unstable_strictMode === !0 && (u = !0), t.identifierPrefix !== void 0 && (a = t.identifierPrefix), t.onUncaughtError !== void 0 && (e = t.onUncaughtError), t.onCaughtError !== void 0 && (n = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError)), t = Py(
      l,
      1,
      !1,
      null,
      null,
      u,
      a,
      null,
      e,
      n,
      f,
      y1
    ), l[ju] = t.current, Gc(l), new ui(t);
  }, be.hydrateRoot = function(l, t, u) {
    if (!yl(l)) throw Error(o(299));
    var a = !1, e = "", n = bv, f = zv, c = Tv, i = null;
    return u != null && (u.unstable_strictMode === !0 && (a = !0), u.identifierPrefix !== void 0 && (e = u.identifierPrefix), u.onUncaughtError !== void 0 && (n = u.onUncaughtError), u.onCaughtError !== void 0 && (f = u.onCaughtError), u.onRecoverableError !== void 0 && (c = u.onRecoverableError), u.formState !== void 0 && (i = u.formState)), t = Py(
      l,
      1,
      !0,
      t,
      u ?? null,
      a,
      e,
      i,
      n,
      f,
      c,
      y1
    ), t.context = l1(null), u = t.current, a = et(), a = Kn(a), e = uu(a), e.callback = null, au(u, e, a), u = a, t.current.lanes = u, Ua(t, u), Dt(t), l[ju] = t.current, Gc(l), new Bn(t);
  }, be.version = "19.2.3", be;
}
var A1;
function es() {
  if (A1) return ni.exports;
  A1 = 1;
  function _() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(_);
      } catch (vl) {
        console.error(vl);
      }
  }
  return _(), ni.exports = as(), ni.exports;
}
var ns = es(), fs = ns.createRoot(document.getElementById("app"));
fs.render(/* @__PURE__ */ vi.jsx(Id, {}));
export {
  fs as root
};

(function (yc) {
    'use strict';
    var Ao = document.createElement('style');
    ((Ao.textContent = `/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-border-style:solid;--tw-font-weight:initial}}}@layer theme{:root,:host{--font-sans:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;--color-red-400:oklch(70.4% .191 22.216);--color-gray-400:oklch(70.7% .022 261.325);--spacing:.25rem;--text-sm:.875rem;--text-sm--line-height:calc(1.25 / .875);--text-base:1rem;--text-base--line-height: 1.5 ;--text-xl:1.25rem;--text-xl--line-height:calc(1.75 / 1.25);--font-weight-medium:500;--font-weight-bold:700;--animate-spin:spin 1s linear infinite;--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){-webkit-appearance:button;-moz-appearance:button;appearance:button}::file-selector-button{-webkit-appearance:button;-moz-appearance:button;appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}*{margin:calc(var(--spacing) * 0);box-sizing:border-box;touch-action:none;padding:calc(var(--spacing) * 0);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;--tw-outline-style:none!important;-webkit-user-select:none!important;user-select:none!important;outline-style:none!important}img,video,svg{display:block}a{text-decoration-line:none}}@layer components;@layer utilities{.flex{display:flex}.h-6{height:calc(var(--spacing) * 6)}.h-8{height:calc(var(--spacing) * 8)}.min-h-screen{min-height:100vh}.w-6{width:calc(var(--spacing) * 6)}.w-8{width:calc(var(--spacing) * 8)}.min-w-0{min-width:calc(var(--spacing) * 0)}.min-w-screen{min-width:100vw}.flex-1{flex:1}.shrink-0{flex-shrink:0}.grow{flex-grow:1}.animate-spin{animation:var(--animate-spin)}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.gap-2{gap:calc(var(--spacing) * 2)}.gap-3{gap:calc(var(--spacing) * 3)}.gap-4{gap:calc(var(--spacing) * 4)}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.rounded-full{border-radius:3.40282e38px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-b-2{border-bottom-style:var(--tw-border-style);border-bottom-width:2px}.border-current{border-color:currentColor}.p-3{padding:calc(var(--spacing) * 3)}.p-4{padding:calc(var(--spacing) * 4)}.p-8{padding:calc(var(--spacing) * 8)}.text-center{text-align:center}.font-mono{font-family:var(--font-mono)}.text-base{font-size:var(--text-base);line-height:var(--tw-leading,var(--text-base--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xl{font-size:var(--text-xl);line-height:var(--tw-leading,var(--text-xl--line-height))}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.text-gray-400{color:var(--color-gray-400)}.text-red-400{color:var(--color-red-400)}.opacity-60{opacity:.6}.opacity-80{opacity:.8}}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-font-weight{syntax:"*";inherits:false}@keyframes spin{to{transform:rotate(360deg)}}
/*$vite$:1*/`),
        document.head.appendChild(Ao));
    function wc(e) {
        return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, 'default') ? e.default : e;
    }
    var Bo = { exports: {} },
        nr = {},
        $o = { exports: {} },
        L = {};
    /**
     * @license React
     * react.production.min.js
     *
     * Copyright (c) Facebook, Inc. and its affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */ var cn = Symbol.for('react.element'),
        kc = Symbol.for('react.portal'),
        Sc = Symbol.for('react.fragment'),
        xc = Symbol.for('react.strict_mode'),
        Ec = Symbol.for('react.profiler'),
        _c = Symbol.for('react.provider'),
        Cc = Symbol.for('react.context'),
        Nc = Symbol.for('react.forward_ref'),
        zc = Symbol.for('react.suspense'),
        Pc = Symbol.for('react.memo'),
        Tc = Symbol.for('react.lazy'),
        Vo = Symbol.iterator;
    function Lc(e) {
        return e === null || typeof e != 'object'
            ? null
            : ((e = (Vo && e[Vo]) || e['@@iterator']), typeof e == 'function' ? e : null);
    }
    var Ho = {
            isMounted: function () {
                return !1;
            },
            enqueueForceUpdate: function () {},
            enqueueReplaceState: function () {},
            enqueueSetState: function () {}
        },
        Wo = Object.assign,
        Qo = {};
    function Ft(e, t, n) {
        ((this.props = e), (this.context = t), (this.refs = Qo), (this.updater = n || Ho));
    }
    ((Ft.prototype.isReactComponent = {}),
        (Ft.prototype.setState = function (e, t) {
            if (typeof e != 'object' && typeof e != 'function' && e != null)
                throw Error(
                    'setState(...): takes an object of state variables to update or a function which returns an object of state variables.'
                );
            this.updater.enqueueSetState(this, e, t, 'setState');
        }),
        (Ft.prototype.forceUpdate = function (e) {
            this.updater.enqueueForceUpdate(this, e, 'forceUpdate');
        }));
    function Ko() {}
    Ko.prototype = Ft.prototype;
    function xl(e, t, n) {
        ((this.props = e), (this.context = t), (this.refs = Qo), (this.updater = n || Ho));
    }
    var El = (xl.prototype = new Ko());
    ((El.constructor = xl), Wo(El, Ft.prototype), (El.isPureReactComponent = !0));
    var Go = Array.isArray,
        Yo = Object.prototype.hasOwnProperty,
        _l = { current: null },
        Xo = { key: !0, ref: !0, __self: !0, __source: !0 };
    function Zo(e, t, n) {
        var r,
            l = {},
            i = null,
            o = null;
        if (t != null)
            for (r in (t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = '' + t.key), t))
                Yo.call(t, r) && !Xo.hasOwnProperty(r) && (l[r] = t[r]);
        var u = arguments.length - 2;
        if (u === 1) l.children = n;
        else if (1 < u) {
            for (var a = Array(u), s = 0; s < u; s++) a[s] = arguments[s + 2];
            l.children = a;
        }
        if (e && e.defaultProps) for (r in ((u = e.defaultProps), u)) l[r] === void 0 && (l[r] = u[r]);
        return { $$typeof: cn, type: e, key: i, ref: o, props: l, _owner: _l.current };
    }
    function jc(e, t) {
        return { $$typeof: cn, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
    }
    function Cl(e) {
        return typeof e == 'object' && e !== null && e.$$typeof === cn;
    }
    function Oc(e) {
        var t = { '=': '=0', ':': '=2' };
        return (
            '$' +
            e.replace(/[=:]/g, function (n) {
                return t[n];
            })
        );
    }
    var Jo = /\/+/g;
    function Nl(e, t) {
        return typeof e == 'object' && e !== null && e.key != null ? Oc('' + e.key) : t.toString(36);
    }
    function rr(e, t, n, r, l) {
        var i = typeof e;
        (i === 'undefined' || i === 'boolean') && (e = null);
        var o = !1;
        if (e === null) o = !0;
        else
            switch (i) {
                case 'string':
                case 'number':
                    o = !0;
                    break;
                case 'object':
                    switch (e.$$typeof) {
                        case cn:
                        case kc:
                            o = !0;
                    }
            }
        if (o)
            return (
                (o = e),
                (l = l(o)),
                (e = r === '' ? '.' + Nl(o, 0) : r),
                Go(l)
                    ? ((n = ''),
                      e != null && (n = e.replace(Jo, '$&/') + '/'),
                      rr(l, t, n, '', function (s) {
                          return s;
                      }))
                    : l != null &&
                      (Cl(l) &&
                          (l = jc(
                              l,
                              n + (!l.key || (o && o.key === l.key) ? '' : ('' + l.key).replace(Jo, '$&/') + '/') + e
                          )),
                      t.push(l)),
                1
            );
        if (((o = 0), (r = r === '' ? '.' : r + ':'), Go(e)))
            for (var u = 0; u < e.length; u++) {
                i = e[u];
                var a = r + Nl(i, u);
                o += rr(i, t, n, a, l);
            }
        else if (((a = Lc(e)), typeof a == 'function'))
            for (e = a.call(e), u = 0; !(i = e.next()).done; )
                ((i = i.value), (a = r + Nl(i, u++)), (o += rr(i, t, n, a, l)));
        else if (i === 'object')
            throw (
                (t = String(e)),
                Error(
                    'Objects are not valid as a React child (found: ' +
                        (t === '[object Object]' ? 'object with keys {' + Object.keys(e).join(', ') + '}' : t) +
                        '). If you meant to render a collection of children, use an array instead.'
                )
            );
        return o;
    }
    function lr(e, t, n) {
        if (e == null) return e;
        var r = [],
            l = 0;
        return (
            rr(e, r, '', '', function (i) {
                return t.call(n, i, l++);
            }),
            r
        );
    }
    function Rc(e) {
        if (e._status === -1) {
            var t = e._result;
            ((t = t()),
                t.then(
                    function (n) {
                        (e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = n));
                    },
                    function (n) {
                        (e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = n));
                    }
                ),
                e._status === -1 && ((e._status = 0), (e._result = t)));
        }
        if (e._status === 1) return e._result.default;
        throw e._result;
    }
    var ie = { current: null },
        ir = { transition: null },
        Fc = { ReactCurrentDispatcher: ie, ReactCurrentBatchConfig: ir, ReactCurrentOwner: _l };
    function qo() {
        throw Error('act(...) is not supported in production builds of React.');
    }
    ((L.Children = {
        map: lr,
        forEach: function (e, t, n) {
            lr(
                e,
                function () {
                    t.apply(this, arguments);
                },
                n
            );
        },
        count: function (e) {
            var t = 0;
            return (
                lr(e, function () {
                    t++;
                }),
                t
            );
        },
        toArray: function (e) {
            return (
                lr(e, function (t) {
                    return t;
                }) || []
            );
        },
        only: function (e) {
            if (!Cl(e)) throw Error('React.Children.only expected to receive a single React element child.');
            return e;
        }
    }),
        (L.Component = Ft),
        (L.Fragment = Sc),
        (L.Profiler = Ec),
        (L.PureComponent = xl),
        (L.StrictMode = xc),
        (L.Suspense = zc),
        (L.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Fc),
        (L.act = qo),
        (L.cloneElement = function (e, t, n) {
            if (e == null)
                throw Error('React.cloneElement(...): The argument must be a React element, but you passed ' + e + '.');
            var r = Wo({}, e.props),
                l = e.key,
                i = e.ref,
                o = e._owner;
            if (t != null) {
                if (
                    (t.ref !== void 0 && ((i = t.ref), (o = _l.current)),
                    t.key !== void 0 && (l = '' + t.key),
                    e.type && e.type.defaultProps)
                )
                    var u = e.type.defaultProps;
                for (a in t)
                    Yo.call(t, a) && !Xo.hasOwnProperty(a) && (r[a] = t[a] === void 0 && u !== void 0 ? u[a] : t[a]);
            }
            var a = arguments.length - 2;
            if (a === 1) r.children = n;
            else if (1 < a) {
                u = Array(a);
                for (var s = 0; s < a; s++) u[s] = arguments[s + 2];
                r.children = u;
            }
            return { $$typeof: cn, type: e.type, key: l, ref: i, props: r, _owner: o };
        }),
        (L.createContext = function (e) {
            return (
                (e = {
                    $$typeof: Cc,
                    _currentValue: e,
                    _currentValue2: e,
                    _threadCount: 0,
                    Provider: null,
                    Consumer: null,
                    _defaultValue: null,
                    _globalName: null
                }),
                (e.Provider = { $$typeof: _c, _context: e }),
                (e.Consumer = e)
            );
        }),
        (L.createElement = Zo),
        (L.createFactory = function (e) {
            var t = Zo.bind(null, e);
            return ((t.type = e), t);
        }),
        (L.createRef = function () {
            return { current: null };
        }),
        (L.forwardRef = function (e) {
            return { $$typeof: Nc, render: e };
        }),
        (L.isValidElement = Cl),
        (L.lazy = function (e) {
            return { $$typeof: Tc, _payload: { _status: -1, _result: e }, _init: Rc };
        }),
        (L.memo = function (e, t) {
            return { $$typeof: Pc, type: e, compare: t === void 0 ? null : t };
        }),
        (L.startTransition = function (e) {
            var t = ir.transition;
            ir.transition = {};
            try {
                e();
            } finally {
                ir.transition = t;
            }
        }),
        (L.unstable_act = qo),
        (L.useCallback = function (e, t) {
            return ie.current.useCallback(e, t);
        }),
        (L.useContext = function (e) {
            return ie.current.useContext(e);
        }),
        (L.useDebugValue = function () {}),
        (L.useDeferredValue = function (e) {
            return ie.current.useDeferredValue(e);
        }),
        (L.useEffect = function (e, t) {
            return ie.current.useEffect(e, t);
        }),
        (L.useId = function () {
            return ie.current.useId();
        }),
        (L.useImperativeHandle = function (e, t, n) {
            return ie.current.useImperativeHandle(e, t, n);
        }),
        (L.useInsertionEffect = function (e, t) {
            return ie.current.useInsertionEffect(e, t);
        }),
        (L.useLayoutEffect = function (e, t) {
            return ie.current.useLayoutEffect(e, t);
        }),
        (L.useMemo = function (e, t) {
            return ie.current.useMemo(e, t);
        }),
        (L.useReducer = function (e, t, n) {
            return ie.current.useReducer(e, t, n);
        }),
        (L.useRef = function (e) {
            return ie.current.useRef(e);
        }),
        (L.useState = function (e) {
            return ie.current.useState(e);
        }),
        (L.useSyncExternalStore = function (e, t, n) {
            return ie.current.useSyncExternalStore(e, t, n);
        }),
        (L.useTransition = function () {
            return ie.current.useTransition();
        }),
        (L.version = '18.3.1'),
        ($o.exports = L));
    var gt = $o.exports;
    /**
     * @license React
     * react-jsx-runtime.production.min.js
     *
     * Copyright (c) Facebook, Inc. and its affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */ var Mc = gt,
        Ic = Symbol.for('react.element'),
        Dc = Symbol.for('react.fragment'),
        Uc = Object.prototype.hasOwnProperty,
        Ac = Mc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
        Bc = { key: !0, ref: !0, __self: !0, __source: !0 };
    function bo(e, t, n) {
        var r,
            l = {},
            i = null,
            o = null;
        (n !== void 0 && (i = '' + n), t.key !== void 0 && (i = '' + t.key), t.ref !== void 0 && (o = t.ref));
        for (r in t) Uc.call(t, r) && !Bc.hasOwnProperty(r) && (l[r] = t[r]);
        if (e && e.defaultProps) for (r in ((t = e.defaultProps), t)) l[r] === void 0 && (l[r] = t[r]);
        return { $$typeof: Ic, type: e, key: i, ref: o, props: l, _owner: Ac.current };
    }
    ((nr.Fragment = Dc), (nr.jsx = bo), (nr.jsxs = bo), (Bo.exports = nr));
    var M = Bo.exports,
        eu = { exports: {} },
        me = {},
        tu = { exports: {} },
        nu = {};
    /**
     * @license React
     * scheduler.production.min.js
     *
     * Copyright (c) Facebook, Inc. and its affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */ ((function (e) {
        function t(E, P) {
            var T = E.length;
            E.push(P);
            e: for (; 0 < T; ) {
                var Q = (T - 1) >>> 1,
                    J = E[Q];
                if (0 < l(J, P)) ((E[Q] = P), (E[T] = J), (T = Q));
                else break e;
            }
        }
        function n(E) {
            return E.length === 0 ? null : E[0];
        }
        function r(E) {
            if (E.length === 0) return null;
            var P = E[0],
                T = E.pop();
            if (T !== P) {
                E[0] = T;
                e: for (var Q = 0, J = E.length, kl = J >>> 1; Q < kl; ) {
                    var Ot = 2 * (Q + 1) - 1,
                        Uo = E[Ot],
                        Rt = Ot + 1,
                        Sl = E[Rt];
                    if (0 > l(Uo, T))
                        Rt < J && 0 > l(Sl, Uo)
                            ? ((E[Q] = Sl), (E[Rt] = T), (Q = Rt))
                            : ((E[Q] = Uo), (E[Ot] = T), (Q = Ot));
                    else if (Rt < J && 0 > l(Sl, T)) ((E[Q] = Sl), (E[Rt] = T), (Q = Rt));
                    else break e;
                }
            }
            return P;
        }
        function l(E, P) {
            var T = E.sortIndex - P.sortIndex;
            return T !== 0 ? T : E.id - P.id;
        }
        if (typeof performance == 'object' && typeof performance.now == 'function') {
            var i = performance;
            e.unstable_now = function () {
                return i.now();
            };
        } else {
            var o = Date,
                u = o.now();
            e.unstable_now = function () {
                return o.now() - u;
            };
        }
        var a = [],
            s = [],
            d = 1,
            f = null,
            c = 3,
            v = !1,
            w = !1,
            k = !1,
            z = typeof setTimeout == 'function' ? setTimeout : null,
            m = typeof clearTimeout == 'function' ? clearTimeout : null,
            p = typeof setImmediate < 'u' ? setImmediate : null;
        typeof navigator < 'u' &&
            navigator.scheduling !== void 0 &&
            navigator.scheduling.isInputPending !== void 0 &&
            navigator.scheduling.isInputPending.bind(navigator.scheduling);
        function h(E) {
            for (var P = n(s); P !== null; ) {
                if (P.callback === null) r(s);
                else if (P.startTime <= E) (r(s), (P.sortIndex = P.expirationTime), t(a, P));
                else break;
                P = n(s);
            }
        }
        function g(E) {
            if (((k = !1), h(E), !w))
                if (n(a) !== null) ((w = !0), Io(x));
                else {
                    var P = n(s);
                    P !== null && Do(g, P.startTime - E);
                }
        }
        function x(E, P) {
            ((w = !1), k && ((k = !1), m(N), (N = -1)), (v = !0));
            var T = c;
            try {
                for (h(P), f = n(a); f !== null && (!(f.expirationTime > P) || (E && !Fe())); ) {
                    var Q = f.callback;
                    if (typeof Q == 'function') {
                        ((f.callback = null), (c = f.priorityLevel));
                        var J = Q(f.expirationTime <= P);
                        ((P = e.unstable_now()), typeof J == 'function' ? (f.callback = J) : f === n(a) && r(a), h(P));
                    } else r(a);
                    f = n(a);
                }
                if (f !== null) var kl = !0;
                else {
                    var Ot = n(s);
                    (Ot !== null && Do(g, Ot.startTime - P), (kl = !1));
                }
                return kl;
            } finally {
                ((f = null), (c = T), (v = !1));
            }
        }
        var _ = !1,
            C = null,
            N = -1,
            W = 5,
            j = -1;
        function Fe() {
            return !(e.unstable_now() - j < W);
        }
        function er() {
            if (C !== null) {
                var E = e.unstable_now();
                j = E;
                var P = !0;
                try {
                    P = C(!0, E);
                } finally {
                    P ? tr() : ((_ = !1), (C = null));
                }
            } else _ = !1;
        }
        var tr;
        if (typeof p == 'function')
            tr = function () {
                p(er);
            };
        else if (typeof MessageChannel < 'u') {
            var gc = new MessageChannel(),
                _p = gc.port2;
            ((gc.port1.onmessage = er),
                (tr = function () {
                    _p.postMessage(null);
                }));
        } else
            tr = function () {
                z(er, 0);
            };
        function Io(E) {
            ((C = E), _ || ((_ = !0), tr()));
        }
        function Do(E, P) {
            N = z(function () {
                E(e.unstable_now());
            }, P);
        }
        ((e.unstable_IdlePriority = 5),
            (e.unstable_ImmediatePriority = 1),
            (e.unstable_LowPriority = 4),
            (e.unstable_NormalPriority = 3),
            (e.unstable_Profiling = null),
            (e.unstable_UserBlockingPriority = 2),
            (e.unstable_cancelCallback = function (E) {
                E.callback = null;
            }),
            (e.unstable_continueExecution = function () {
                w || v || ((w = !0), Io(x));
            }),
            (e.unstable_forceFrameRate = function (E) {
                0 > E || 125 < E
                    ? console.error(
                          'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported'
                      )
                    : (W = 0 < E ? Math.floor(1e3 / E) : 5);
            }),
            (e.unstable_getCurrentPriorityLevel = function () {
                return c;
            }),
            (e.unstable_getFirstCallbackNode = function () {
                return n(a);
            }),
            (e.unstable_next = function (E) {
                switch (c) {
                    case 1:
                    case 2:
                    case 3:
                        var P = 3;
                        break;
                    default:
                        P = c;
                }
                var T = c;
                c = P;
                try {
                    return E();
                } finally {
                    c = T;
                }
            }),
            (e.unstable_pauseExecution = function () {}),
            (e.unstable_requestPaint = function () {}),
            (e.unstable_runWithPriority = function (E, P) {
                switch (E) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        break;
                    default:
                        E = 3;
                }
                var T = c;
                c = E;
                try {
                    return P();
                } finally {
                    c = T;
                }
            }),
            (e.unstable_scheduleCallback = function (E, P, T) {
                var Q = e.unstable_now();
                switch (
                    (typeof T == 'object' && T !== null
                        ? ((T = T.delay), (T = typeof T == 'number' && 0 < T ? Q + T : Q))
                        : (T = Q),
                    E)
                ) {
                    case 1:
                        var J = -1;
                        break;
                    case 2:
                        J = 250;
                        break;
                    case 5:
                        J = 1073741823;
                        break;
                    case 4:
                        J = 1e4;
                        break;
                    default:
                        J = 5e3;
                }
                return (
                    (J = T + J),
                    (E = { id: d++, callback: P, priorityLevel: E, startTime: T, expirationTime: J, sortIndex: -1 }),
                    T > Q
                        ? ((E.sortIndex = T),
                          t(s, E),
                          n(a) === null && E === n(s) && (k ? (m(N), (N = -1)) : (k = !0), Do(g, T - Q)))
                        : ((E.sortIndex = J), t(a, E), w || v || ((w = !0), Io(x))),
                    E
                );
            }),
            (e.unstable_shouldYield = Fe),
            (e.unstable_wrapCallback = function (E) {
                var P = c;
                return function () {
                    var T = c;
                    c = P;
                    try {
                        return E.apply(this, arguments);
                    } finally {
                        c = T;
                    }
                };
            }));
    })(nu),
        (tu.exports = nu));
    var $c = tu.exports;
    /**
     * @license React
     * react-dom.production.min.js
     *
     * Copyright (c) Facebook, Inc. and its affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */ var Vc = gt,
        he = $c;
    function y(e) {
        for (var t = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, n = 1; n < arguments.length; n++)
            t += '&args[]=' + encodeURIComponent(arguments[n]);
        return (
            'Minified React error #' +
            e +
            '; visit ' +
            t +
            ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
        );
    }
    var ru = new Set(),
        fn = {};
    function yt(e, t) {
        (Mt(e, t), Mt(e + 'Capture', t));
    }
    function Mt(e, t) {
        for (fn[e] = t, e = 0; e < t.length; e++) ru.add(t[e]);
    }
    var Be = !(typeof window > 'u' || typeof window.document > 'u' || typeof window.document.createElement > 'u'),
        zl = Object.prototype.hasOwnProperty,
        Hc =
            /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
        lu = {},
        iu = {};
    function Wc(e) {
        return zl.call(iu, e) ? !0 : zl.call(lu, e) ? !1 : Hc.test(e) ? (iu[e] = !0) : ((lu[e] = !0), !1);
    }
    function Qc(e, t, n, r) {
        if (n !== null && n.type === 0) return !1;
        switch (typeof t) {
            case 'function':
            case 'symbol':
                return !0;
            case 'boolean':
                return r
                    ? !1
                    : n !== null
                      ? !n.acceptsBooleans
                      : ((e = e.toLowerCase().slice(0, 5)), e !== 'data-' && e !== 'aria-');
            default:
                return !1;
        }
    }
    function Kc(e, t, n, r) {
        if (t === null || typeof t > 'u' || Qc(e, t, n, r)) return !0;
        if (r) return !1;
        if (n !== null)
            switch (n.type) {
                case 3:
                    return !t;
                case 4:
                    return t === !1;
                case 5:
                    return isNaN(t);
                case 6:
                    return isNaN(t) || 1 > t;
            }
        return !1;
    }
    function oe(e, t, n, r, l, i, o) {
        ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
            (this.attributeName = r),
            (this.attributeNamespace = l),
            (this.mustUseProperty = n),
            (this.propertyName = e),
            (this.type = t),
            (this.sanitizeURL = i),
            (this.removeEmptyString = o));
    }
    var q = {};
    ('children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
        .split(' ')
        .forEach(function (e) {
            q[e] = new oe(e, 0, !1, e, null, !1, !1);
        }),
        [
            ['acceptCharset', 'accept-charset'],
            ['className', 'class'],
            ['htmlFor', 'for'],
            ['httpEquiv', 'http-equiv']
        ].forEach(function (e) {
            var t = e[0];
            q[t] = new oe(t, 1, !1, e[1], null, !1, !1);
        }),
        ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
            q[e] = new oe(e, 2, !1, e.toLowerCase(), null, !1, !1);
        }),
        ['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (e) {
            q[e] = new oe(e, 2, !1, e, null, !1, !1);
        }),
        'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
            .split(' ')
            .forEach(function (e) {
                q[e] = new oe(e, 3, !1, e.toLowerCase(), null, !1, !1);
            }),
        ['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
            q[e] = new oe(e, 3, !0, e, null, !1, !1);
        }),
        ['capture', 'download'].forEach(function (e) {
            q[e] = new oe(e, 4, !1, e, null, !1, !1);
        }),
        ['cols', 'rows', 'size', 'span'].forEach(function (e) {
            q[e] = new oe(e, 6, !1, e, null, !1, !1);
        }),
        ['rowSpan', 'start'].forEach(function (e) {
            q[e] = new oe(e, 5, !1, e.toLowerCase(), null, !1, !1);
        }));
    var Pl = /[\-:]([a-z])/g;
    function Tl(e) {
        return e[1].toUpperCase();
    }
    ('accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
        .split(' ')
        .forEach(function (e) {
            var t = e.replace(Pl, Tl);
            q[t] = new oe(t, 1, !1, e, null, !1, !1);
        }),
        'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'.split(' ').forEach(function (e) {
            var t = e.replace(Pl, Tl);
            q[t] = new oe(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1);
        }),
        ['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
            var t = e.replace(Pl, Tl);
            q[t] = new oe(t, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1);
        }),
        ['tabIndex', 'crossOrigin'].forEach(function (e) {
            q[e] = new oe(e, 1, !1, e.toLowerCase(), null, !1, !1);
        }),
        (q.xlinkHref = new oe('xlinkHref', 1, !1, 'xlink:href', 'http://www.w3.org/1999/xlink', !0, !1)),
        ['src', 'href', 'action', 'formAction'].forEach(function (e) {
            q[e] = new oe(e, 1, !1, e.toLowerCase(), null, !0, !0);
        }));
    function Ll(e, t, n, r) {
        var l = q.hasOwnProperty(t) ? q[t] : null;
        (l !== null
            ? l.type !== 0
            : r || !(2 < t.length) || (t[0] !== 'o' && t[0] !== 'O') || (t[1] !== 'n' && t[1] !== 'N')) &&
            (Kc(t, n, l, r) && (n = null),
            r || l === null
                ? Wc(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, '' + n))
                : l.mustUseProperty
                  ? (e[l.propertyName] = n === null ? (l.type === 3 ? !1 : '') : n)
                  : ((t = l.attributeName),
                    (r = l.attributeNamespace),
                    n === null
                        ? e.removeAttribute(t)
                        : ((l = l.type),
                          (n = l === 3 || (l === 4 && n === !0) ? '' : '' + n),
                          r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
    }
    var $e = Vc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
        or = Symbol.for('react.element'),
        It = Symbol.for('react.portal'),
        Dt = Symbol.for('react.fragment'),
        jl = Symbol.for('react.strict_mode'),
        Ol = Symbol.for('react.profiler'),
        ou = Symbol.for('react.provider'),
        uu = Symbol.for('react.context'),
        Rl = Symbol.for('react.forward_ref'),
        Fl = Symbol.for('react.suspense'),
        Ml = Symbol.for('react.suspense_list'),
        Il = Symbol.for('react.memo'),
        Ze = Symbol.for('react.lazy'),
        su = Symbol.for('react.offscreen'),
        au = Symbol.iterator;
    function dn(e) {
        return e === null || typeof e != 'object'
            ? null
            : ((e = (au && e[au]) || e['@@iterator']), typeof e == 'function' ? e : null);
    }
    var A = Object.assign,
        Dl;
    function pn(e) {
        if (Dl === void 0)
            try {
                throw Error();
            } catch (n) {
                var t = n.stack.trim().match(/\n( *(at )?)/);
                Dl = (t && t[1]) || '';
            }
        return (
            `
` +
            Dl +
            e
        );
    }
    var Ul = !1;
    function Al(e, t) {
        if (!e || Ul) return '';
        Ul = !0;
        var n = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            if (t)
                if (
                    ((t = function () {
                        throw Error();
                    }),
                    Object.defineProperty(t.prototype, 'props', {
                        set: function () {
                            throw Error();
                        }
                    }),
                    typeof Reflect == 'object' && Reflect.construct)
                ) {
                    try {
                        Reflect.construct(t, []);
                    } catch (s) {
                        var r = s;
                    }
                    Reflect.construct(e, [], t);
                } else {
                    try {
                        t.call();
                    } catch (s) {
                        r = s;
                    }
                    e.call(t.prototype);
                }
            else {
                try {
                    throw Error();
                } catch (s) {
                    r = s;
                }
                e();
            }
        } catch (s) {
            if (s && r && typeof s.stack == 'string') {
                for (
                    var l = s.stack.split(`
`),
                        i = r.stack.split(`
`),
                        o = l.length - 1,
                        u = i.length - 1;
                    1 <= o && 0 <= u && l[o] !== i[u];
                )
                    u--;
                for (; 1 <= o && 0 <= u; o--, u--)
                    if (l[o] !== i[u]) {
                        if (o !== 1 || u !== 1)
                            do
                                if ((o--, u--, 0 > u || l[o] !== i[u])) {
                                    var a =
                                        `
` + l[o].replace(' at new ', ' at ');
                                    return (
                                        e.displayName &&
                                            a.includes('<anonymous>') &&
                                            (a = a.replace('<anonymous>', e.displayName)),
                                        a
                                    );
                                }
                            while (1 <= o && 0 <= u);
                        break;
                    }
            }
        } finally {
            ((Ul = !1), (Error.prepareStackTrace = n));
        }
        return (e = e ? e.displayName || e.name : '') ? pn(e) : '';
    }
    function Gc(e) {
        switch (e.tag) {
            case 5:
                return pn(e.type);
            case 16:
                return pn('Lazy');
            case 13:
                return pn('Suspense');
            case 19:
                return pn('SuspenseList');
            case 0:
            case 2:
            case 15:
                return ((e = Al(e.type, !1)), e);
            case 11:
                return ((e = Al(e.type.render, !1)), e);
            case 1:
                return ((e = Al(e.type, !0)), e);
            default:
                return '';
        }
    }
    function Bl(e) {
        if (e == null) return null;
        if (typeof e == 'function') return e.displayName || e.name || null;
        if (typeof e == 'string') return e;
        switch (e) {
            case Dt:
                return 'Fragment';
            case It:
                return 'Portal';
            case Ol:
                return 'Profiler';
            case jl:
                return 'StrictMode';
            case Fl:
                return 'Suspense';
            case Ml:
                return 'SuspenseList';
        }
        if (typeof e == 'object')
            switch (e.$$typeof) {
                case uu:
                    return (e.displayName || 'Context') + '.Consumer';
                case ou:
                    return (e._context.displayName || 'Context') + '.Provider';
                case Rl:
                    var t = e.render;
                    return (
                        (e = e.displayName),
                        e ||
                            ((e = t.displayName || t.name || ''),
                            (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
                        e
                    );
                case Il:
                    return ((t = e.displayName || null), t !== null ? t : Bl(e.type) || 'Memo');
                case Ze:
                    ((t = e._payload), (e = e._init));
                    try {
                        return Bl(e(t));
                    } catch {}
            }
        return null;
    }
    function Yc(e) {
        var t = e.type;
        switch (e.tag) {
            case 24:
                return 'Cache';
            case 9:
                return (t.displayName || 'Context') + '.Consumer';
            case 10:
                return (t._context.displayName || 'Context') + '.Provider';
            case 18:
                return 'DehydratedFragment';
            case 11:
                return (
                    (e = t.render),
                    (e = e.displayName || e.name || ''),
                    t.displayName || (e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')
                );
            case 7:
                return 'Fragment';
            case 5:
                return t;
            case 4:
                return 'Portal';
            case 3:
                return 'Root';
            case 6:
                return 'Text';
            case 16:
                return Bl(t);
            case 8:
                return t === jl ? 'StrictMode' : 'Mode';
            case 22:
                return 'Offscreen';
            case 12:
                return 'Profiler';
            case 21:
                return 'Scope';
            case 13:
                return 'Suspense';
            case 19:
                return 'SuspenseList';
            case 25:
                return 'TracingMarker';
            case 1:
            case 0:
            case 17:
            case 2:
            case 14:
            case 15:
                if (typeof t == 'function') return t.displayName || t.name || null;
                if (typeof t == 'string') return t;
        }
        return null;
    }
    function Je(e) {
        switch (typeof e) {
            case 'boolean':
            case 'number':
            case 'string':
            case 'undefined':
                return e;
            case 'object':
                return e;
            default:
                return '';
        }
    }
    function cu(e) {
        var t = e.type;
        return (e = e.nodeName) && e.toLowerCase() === 'input' && (t === 'checkbox' || t === 'radio');
    }
    function Xc(e) {
        var t = cu(e) ? 'checked' : 'value',
            n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
            r = '' + e[t];
        if (!e.hasOwnProperty(t) && typeof n < 'u' && typeof n.get == 'function' && typeof n.set == 'function') {
            var l = n.get,
                i = n.set;
            return (
                Object.defineProperty(e, t, {
                    configurable: !0,
                    get: function () {
                        return l.call(this);
                    },
                    set: function (o) {
                        ((r = '' + o), i.call(this, o));
                    }
                }),
                Object.defineProperty(e, t, { enumerable: n.enumerable }),
                {
                    getValue: function () {
                        return r;
                    },
                    setValue: function (o) {
                        r = '' + o;
                    },
                    stopTracking: function () {
                        ((e._valueTracker = null), delete e[t]);
                    }
                }
            );
        }
    }
    function ur(e) {
        e._valueTracker || (e._valueTracker = Xc(e));
    }
    function fu(e) {
        if (!e) return !1;
        var t = e._valueTracker;
        if (!t) return !0;
        var n = t.getValue(),
            r = '';
        return (
            e && (r = cu(e) ? (e.checked ? 'true' : 'false') : e.value),
            (e = r),
            e !== n ? (t.setValue(e), !0) : !1
        );
    }
    function sr(e) {
        if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u')) return null;
        try {
            return e.activeElement || e.body;
        } catch {
            return e.body;
        }
    }
    function $l(e, t) {
        var n = t.checked;
        return A({}, t, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: n ?? e._wrapperState.initialChecked
        });
    }
    function du(e, t) {
        var n = t.defaultValue == null ? '' : t.defaultValue,
            r = t.checked != null ? t.checked : t.defaultChecked;
        ((n = Je(t.value != null ? t.value : n)),
            (e._wrapperState = {
                initialChecked: r,
                initialValue: n,
                controlled: t.type === 'checkbox' || t.type === 'radio' ? t.checked != null : t.value != null
            }));
    }
    function pu(e, t) {
        ((t = t.checked), t != null && Ll(e, 'checked', t, !1));
    }
    function Vl(e, t) {
        pu(e, t);
        var n = Je(t.value),
            r = t.type;
        if (n != null)
            r === 'number'
                ? ((n === 0 && e.value === '') || e.value != n) && (e.value = '' + n)
                : e.value !== '' + n && (e.value = '' + n);
        else if (r === 'submit' || r === 'reset') {
            e.removeAttribute('value');
            return;
        }
        (t.hasOwnProperty('value')
            ? Hl(e, t.type, n)
            : t.hasOwnProperty('defaultValue') && Hl(e, t.type, Je(t.defaultValue)),
            t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked));
    }
    function mu(e, t, n) {
        if (t.hasOwnProperty('value') || t.hasOwnProperty('defaultValue')) {
            var r = t.type;
            if (!((r !== 'submit' && r !== 'reset') || (t.value !== void 0 && t.value !== null))) return;
            ((t = '' + e._wrapperState.initialValue), n || t === e.value || (e.value = t), (e.defaultValue = t));
        }
        ((n = e.name),
            n !== '' && (e.name = ''),
            (e.defaultChecked = !!e._wrapperState.initialChecked),
            n !== '' && (e.name = n));
    }
    function Hl(e, t, n) {
        (t !== 'number' || sr(e.ownerDocument) !== e) &&
            (n == null
                ? (e.defaultValue = '' + e._wrapperState.initialValue)
                : e.defaultValue !== '' + n && (e.defaultValue = '' + n));
    }
    var mn = Array.isArray;
    function Ut(e, t, n, r) {
        if (((e = e.options), t)) {
            t = {};
            for (var l = 0; l < n.length; l++) t['$' + n[l]] = !0;
            for (n = 0; n < e.length; n++)
                ((l = t.hasOwnProperty('$' + e[n].value)),
                    e[n].selected !== l && (e[n].selected = l),
                    l && r && (e[n].defaultSelected = !0));
        } else {
            for (n = '' + Je(n), t = null, l = 0; l < e.length; l++) {
                if (e[l].value === n) {
                    ((e[l].selected = !0), r && (e[l].defaultSelected = !0));
                    return;
                }
                t !== null || e[l].disabled || (t = e[l]);
            }
            t !== null && (t.selected = !0);
        }
    }
    function Wl(e, t) {
        if (t.dangerouslySetInnerHTML != null) throw Error(y(91));
        return A({}, t, { value: void 0, defaultValue: void 0, children: '' + e._wrapperState.initialValue });
    }
    function hu(e, t) {
        var n = t.value;
        if (n == null) {
            if (((n = t.children), (t = t.defaultValue), n != null)) {
                if (t != null) throw Error(y(92));
                if (mn(n)) {
                    if (1 < n.length) throw Error(y(93));
                    n = n[0];
                }
                t = n;
            }
            (t == null && (t = ''), (n = t));
        }
        e._wrapperState = { initialValue: Je(n) };
    }
    function vu(e, t) {
        var n = Je(t.value),
            r = Je(t.defaultValue);
        (n != null &&
            ((n = '' + n),
            n !== e.value && (e.value = n),
            t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
            r != null && (e.defaultValue = '' + r));
    }
    function gu(e) {
        var t = e.textContent;
        t === e._wrapperState.initialValue && t !== '' && t !== null && (e.value = t);
    }
    function yu(e) {
        switch (e) {
            case 'svg':
                return 'http://www.w3.org/2000/svg';
            case 'math':
                return 'http://www.w3.org/1998/Math/MathML';
            default:
                return 'http://www.w3.org/1999/xhtml';
        }
    }
    function Ql(e, t) {
        return e == null || e === 'http://www.w3.org/1999/xhtml'
            ? yu(t)
            : e === 'http://www.w3.org/2000/svg' && t === 'foreignObject'
              ? 'http://www.w3.org/1999/xhtml'
              : e;
    }
    var ar,
        wu = (function (e) {
            return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
                ? function (t, n, r, l) {
                      MSApp.execUnsafeLocalFunction(function () {
                          return e(t, n, r, l);
                      });
                  }
                : e;
        })(function (e, t) {
            if (e.namespaceURI !== 'http://www.w3.org/2000/svg' || 'innerHTML' in e) e.innerHTML = t;
            else {
                for (
                    ar = ar || document.createElement('div'),
                        ar.innerHTML = '<svg>' + t.valueOf().toString() + '</svg>',
                        t = ar.firstChild;
                    e.firstChild;
                )
                    e.removeChild(e.firstChild);
                for (; t.firstChild; ) e.appendChild(t.firstChild);
            }
        });
    function hn(e, t) {
        if (t) {
            var n = e.firstChild;
            if (n && n === e.lastChild && n.nodeType === 3) {
                n.nodeValue = t;
                return;
            }
        }
        e.textContent = t;
    }
    var vn = {
            animationIterationCount: !0,
            aspectRatio: !0,
            borderImageOutset: !0,
            borderImageSlice: !0,
            borderImageWidth: !0,
            boxFlex: !0,
            boxFlexGroup: !0,
            boxOrdinalGroup: !0,
            columnCount: !0,
            columns: !0,
            flex: !0,
            flexGrow: !0,
            flexPositive: !0,
            flexShrink: !0,
            flexNegative: !0,
            flexOrder: !0,
            gridArea: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowSpan: !0,
            gridRowStart: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnSpan: !0,
            gridColumnStart: !0,
            fontWeight: !0,
            lineClamp: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            tabSize: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0,
            fillOpacity: !0,
            floodOpacity: !0,
            stopOpacity: !0,
            strokeDasharray: !0,
            strokeDashoffset: !0,
            strokeMiterlimit: !0,
            strokeOpacity: !0,
            strokeWidth: !0
        },
        Zc = ['Webkit', 'ms', 'Moz', 'O'];
    Object.keys(vn).forEach(function (e) {
        Zc.forEach(function (t) {
            ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (vn[t] = vn[e]));
        });
    });
    function ku(e, t, n) {
        return t == null || typeof t == 'boolean' || t === ''
            ? ''
            : n || typeof t != 'number' || t === 0 || (vn.hasOwnProperty(e) && vn[e])
              ? ('' + t).trim()
              : t + 'px';
    }
    function Su(e, t) {
        e = e.style;
        for (var n in t)
            if (t.hasOwnProperty(n)) {
                var r = n.indexOf('--') === 0,
                    l = ku(n, t[n], r);
                (n === 'float' && (n = 'cssFloat'), r ? e.setProperty(n, l) : (e[n] = l));
            }
    }
    var Jc = A(
        { menuitem: !0 },
        {
            area: !0,
            base: !0,
            br: !0,
            col: !0,
            embed: !0,
            hr: !0,
            img: !0,
            input: !0,
            keygen: !0,
            link: !0,
            meta: !0,
            param: !0,
            source: !0,
            track: !0,
            wbr: !0
        }
    );
    function Kl(e, t) {
        if (t) {
            if (Jc[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(y(137, e));
            if (t.dangerouslySetInnerHTML != null) {
                if (t.children != null) throw Error(y(60));
                if (typeof t.dangerouslySetInnerHTML != 'object' || !('__html' in t.dangerouslySetInnerHTML))
                    throw Error(y(61));
            }
            if (t.style != null && typeof t.style != 'object') throw Error(y(62));
        }
    }
    function Gl(e, t) {
        if (e.indexOf('-') === -1) return typeof t.is == 'string';
        switch (e) {
            case 'annotation-xml':
            case 'color-profile':
            case 'font-face':
            case 'font-face-src':
            case 'font-face-uri':
            case 'font-face-format':
            case 'font-face-name':
            case 'missing-glyph':
                return !1;
            default:
                return !0;
        }
    }
    var Yl = null;
    function Xl(e) {
        return (
            (e = e.target || e.srcElement || window),
            e.correspondingUseElement && (e = e.correspondingUseElement),
            e.nodeType === 3 ? e.parentNode : e
        );
    }
    var Zl = null,
        At = null,
        Bt = null;
    function xu(e) {
        if ((e = Un(e))) {
            if (typeof Zl != 'function') throw Error(y(280));
            var t = e.stateNode;
            t && ((t = Or(t)), Zl(e.stateNode, e.type, t));
        }
    }
    function Eu(e) {
        At ? (Bt ? Bt.push(e) : (Bt = [e])) : (At = e);
    }
    function _u() {
        if (At) {
            var e = At,
                t = Bt;
            if (((Bt = At = null), xu(e), t)) for (e = 0; e < t.length; e++) xu(t[e]);
        }
    }
    function Cu(e, t) {
        return e(t);
    }
    function Nu() {}
    var Jl = !1;
    function zu(e, t, n) {
        if (Jl) return e(t, n);
        Jl = !0;
        try {
            return Cu(e, t, n);
        } finally {
            ((Jl = !1), (At !== null || Bt !== null) && (Nu(), _u()));
        }
    }
    function gn(e, t) {
        var n = e.stateNode;
        if (n === null) return null;
        var r = Or(n);
        if (r === null) return null;
        n = r[t];
        e: switch (t) {
            case 'onClick':
            case 'onClickCapture':
            case 'onDoubleClick':
            case 'onDoubleClickCapture':
            case 'onMouseDown':
            case 'onMouseDownCapture':
            case 'onMouseMove':
            case 'onMouseMoveCapture':
            case 'onMouseUp':
            case 'onMouseUpCapture':
            case 'onMouseEnter':
                ((r = !r.disabled) ||
                    ((e = e.type), (r = !(e === 'button' || e === 'input' || e === 'select' || e === 'textarea'))),
                    (e = !r));
                break e;
            default:
                e = !1;
        }
        if (e) return null;
        if (n && typeof n != 'function') throw Error(y(231, t, typeof n));
        return n;
    }
    var ql = !1;
    if (Be)
        try {
            var yn = {};
            (Object.defineProperty(yn, 'passive', {
                get: function () {
                    ql = !0;
                }
            }),
                window.addEventListener('test', yn, yn),
                window.removeEventListener('test', yn, yn));
        } catch {
            ql = !1;
        }
    function qc(e, t, n, r, l, i, o, u, a) {
        var s = Array.prototype.slice.call(arguments, 3);
        try {
            t.apply(n, s);
        } catch (d) {
            this.onError(d);
        }
    }
    var wn = !1,
        cr = null,
        fr = !1,
        bl = null,
        bc = {
            onError: function (e) {
                ((wn = !0), (cr = e));
            }
        };
    function ef(e, t, n, r, l, i, o, u, a) {
        ((wn = !1), (cr = null), qc.apply(bc, arguments));
    }
    function tf(e, t, n, r, l, i, o, u, a) {
        if ((ef.apply(this, arguments), wn)) {
            if (wn) {
                var s = cr;
                ((wn = !1), (cr = null));
            } else throw Error(y(198));
            fr || ((fr = !0), (bl = s));
        }
    }
    function wt(e) {
        var t = e,
            n = e;
        if (e.alternate) for (; t.return; ) t = t.return;
        else {
            e = t;
            do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
            while (e);
        }
        return t.tag === 3 ? n : null;
    }
    function Pu(e) {
        if (e.tag === 13) {
            var t = e.memoizedState;
            if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null))
                return t.dehydrated;
        }
        return null;
    }
    function Tu(e) {
        if (wt(e) !== e) throw Error(y(188));
    }
    function nf(e) {
        var t = e.alternate;
        if (!t) {
            if (((t = wt(e)), t === null)) throw Error(y(188));
            return t !== e ? null : e;
        }
        for (var n = e, r = t; ; ) {
            var l = n.return;
            if (l === null) break;
            var i = l.alternate;
            if (i === null) {
                if (((r = l.return), r !== null)) {
                    n = r;
                    continue;
                }
                break;
            }
            if (l.child === i.child) {
                for (i = l.child; i; ) {
                    if (i === n) return (Tu(l), e);
                    if (i === r) return (Tu(l), t);
                    i = i.sibling;
                }
                throw Error(y(188));
            }
            if (n.return !== r.return) ((n = l), (r = i));
            else {
                for (var o = !1, u = l.child; u; ) {
                    if (u === n) {
                        ((o = !0), (n = l), (r = i));
                        break;
                    }
                    if (u === r) {
                        ((o = !0), (r = l), (n = i));
                        break;
                    }
                    u = u.sibling;
                }
                if (!o) {
                    for (u = i.child; u; ) {
                        if (u === n) {
                            ((o = !0), (n = i), (r = l));
                            break;
                        }
                        if (u === r) {
                            ((o = !0), (r = i), (n = l));
                            break;
                        }
                        u = u.sibling;
                    }
                    if (!o) throw Error(y(189));
                }
            }
            if (n.alternate !== r) throw Error(y(190));
        }
        if (n.tag !== 3) throw Error(y(188));
        return n.stateNode.current === n ? e : t;
    }
    function Lu(e) {
        return ((e = nf(e)), e !== null ? ju(e) : null);
    }
    function ju(e) {
        if (e.tag === 5 || e.tag === 6) return e;
        for (e = e.child; e !== null; ) {
            var t = ju(e);
            if (t !== null) return t;
            e = e.sibling;
        }
        return null;
    }
    var Ou = he.unstable_scheduleCallback,
        Ru = he.unstable_cancelCallback,
        rf = he.unstable_shouldYield,
        lf = he.unstable_requestPaint,
        H = he.unstable_now,
        of = he.unstable_getCurrentPriorityLevel,
        ei = he.unstable_ImmediatePriority,
        Fu = he.unstable_UserBlockingPriority,
        dr = he.unstable_NormalPriority,
        uf = he.unstable_LowPriority,
        Mu = he.unstable_IdlePriority,
        pr = null,
        Me = null;
    function sf(e) {
        if (Me && typeof Me.onCommitFiberRoot == 'function')
            try {
                Me.onCommitFiberRoot(pr, e, void 0, (e.current.flags & 128) === 128);
            } catch {}
    }
    var ze = Math.clz32 ? Math.clz32 : ff,
        af = Math.log,
        cf = Math.LN2;
    function ff(e) {
        return ((e >>>= 0), e === 0 ? 32 : (31 - ((af(e) / cf) | 0)) | 0);
    }
    var mr = 64,
        hr = 4194304;
    function kn(e) {
        switch (e & -e) {
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
                return e & 4194240;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
                return e & 130023424;
            case 134217728:
                return 134217728;
            case 268435456:
                return 268435456;
            case 536870912:
                return 536870912;
            case 1073741824:
                return 1073741824;
            default:
                return e;
        }
    }
    function vr(e, t) {
        var n = e.pendingLanes;
        if (n === 0) return 0;
        var r = 0,
            l = e.suspendedLanes,
            i = e.pingedLanes,
            o = n & 268435455;
        if (o !== 0) {
            var u = o & ~l;
            u !== 0 ? (r = kn(u)) : ((i &= o), i !== 0 && (r = kn(i)));
        } else ((o = n & ~l), o !== 0 ? (r = kn(o)) : i !== 0 && (r = kn(i)));
        if (r === 0) return 0;
        if (t !== 0 && t !== r && !(t & l) && ((l = r & -r), (i = t & -t), l >= i || (l === 16 && (i & 4194240) !== 0)))
            return t;
        if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
            for (e = e.entanglements, t &= r; 0 < t; ) ((n = 31 - ze(t)), (l = 1 << n), (r |= e[n]), (t &= ~l));
        return r;
    }
    function df(e, t) {
        switch (e) {
            case 1:
            case 2:
            case 4:
                return t + 250;
            case 8:
            case 16:
            case 32:
            case 64:
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
            case 67108864:
                return -1;
            case 134217728:
            case 268435456:
            case 536870912:
            case 1073741824:
                return -1;
            default:
                return -1;
        }
    }
    function pf(e, t) {
        for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
            var o = 31 - ze(i),
                u = 1 << o,
                a = l[o];
            (a === -1 ? (!(u & n) || u & r) && (l[o] = df(u, t)) : a <= t && (e.expiredLanes |= u), (i &= ~u));
        }
    }
    function ti(e) {
        return ((e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0);
    }
    function Iu() {
        var e = mr;
        return ((mr <<= 1), !(mr & 4194240) && (mr = 64), e);
    }
    function ni(e) {
        for (var t = [], n = 0; 31 > n; n++) t.push(e);
        return t;
    }
    function Sn(e, t, n) {
        ((e.pendingLanes |= t),
            t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
            (e = e.eventTimes),
            (t = 31 - ze(t)),
            (e[t] = n));
    }
    function mf(e, t) {
        var n = e.pendingLanes & ~t;
        ((e.pendingLanes = t),
            (e.suspendedLanes = 0),
            (e.pingedLanes = 0),
            (e.expiredLanes &= t),
            (e.mutableReadLanes &= t),
            (e.entangledLanes &= t),
            (t = e.entanglements));
        var r = e.eventTimes;
        for (e = e.expirationTimes; 0 < n; ) {
            var l = 31 - ze(n),
                i = 1 << l;
            ((t[l] = 0), (r[l] = -1), (e[l] = -1), (n &= ~i));
        }
    }
    function ri(e, t) {
        var n = (e.entangledLanes |= t);
        for (e = e.entanglements; n; ) {
            var r = 31 - ze(n),
                l = 1 << r;
            ((l & t) | (e[r] & t) && (e[r] |= t), (n &= ~l));
        }
    }
    var R = 0;
    function Du(e) {
        return ((e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1);
    }
    var Uu,
        li,
        Au,
        Bu,
        $u,
        ii = !1,
        gr = [],
        qe = null,
        be = null,
        et = null,
        xn = new Map(),
        En = new Map(),
        tt = [],
        hf =
            'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
                ' '
            );
    function Vu(e, t) {
        switch (e) {
            case 'focusin':
            case 'focusout':
                qe = null;
                break;
            case 'dragenter':
            case 'dragleave':
                be = null;
                break;
            case 'mouseover':
            case 'mouseout':
                et = null;
                break;
            case 'pointerover':
            case 'pointerout':
                xn.delete(t.pointerId);
                break;
            case 'gotpointercapture':
            case 'lostpointercapture':
                En.delete(t.pointerId);
        }
    }
    function _n(e, t, n, r, l, i) {
        return e === null || e.nativeEvent !== i
            ? ((e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }),
              t !== null && ((t = Un(t)), t !== null && li(t)),
              e)
            : ((e.eventSystemFlags |= r), (t = e.targetContainers), l !== null && t.indexOf(l) === -1 && t.push(l), e);
    }
    function vf(e, t, n, r, l) {
        switch (t) {
            case 'focusin':
                return ((qe = _n(qe, e, t, n, r, l)), !0);
            case 'dragenter':
                return ((be = _n(be, e, t, n, r, l)), !0);
            case 'mouseover':
                return ((et = _n(et, e, t, n, r, l)), !0);
            case 'pointerover':
                var i = l.pointerId;
                return (xn.set(i, _n(xn.get(i) || null, e, t, n, r, l)), !0);
            case 'gotpointercapture':
                return ((i = l.pointerId), En.set(i, _n(En.get(i) || null, e, t, n, r, l)), !0);
        }
        return !1;
    }
    function Hu(e) {
        var t = kt(e.target);
        if (t !== null) {
            var n = wt(t);
            if (n !== null) {
                if (((t = n.tag), t === 13)) {
                    if (((t = Pu(n)), t !== null)) {
                        ((e.blockedOn = t),
                            $u(e.priority, function () {
                                Au(n);
                            }));
                        return;
                    }
                } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
                    e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
                    return;
                }
            }
        }
        e.blockedOn = null;
    }
    function yr(e) {
        if (e.blockedOn !== null) return !1;
        for (var t = e.targetContainers; 0 < t.length; ) {
            var n = ui(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
            if (n === null) {
                n = e.nativeEvent;
                var r = new n.constructor(n.type, n);
                ((Yl = r), n.target.dispatchEvent(r), (Yl = null));
            } else return ((t = Un(n)), t !== null && li(t), (e.blockedOn = n), !1);
            t.shift();
        }
        return !0;
    }
    function Wu(e, t, n) {
        yr(e) && n.delete(t);
    }
    function gf() {
        ((ii = !1),
            qe !== null && yr(qe) && (qe = null),
            be !== null && yr(be) && (be = null),
            et !== null && yr(et) && (et = null),
            xn.forEach(Wu),
            En.forEach(Wu));
    }
    function Cn(e, t) {
        e.blockedOn === t &&
            ((e.blockedOn = null), ii || ((ii = !0), he.unstable_scheduleCallback(he.unstable_NormalPriority, gf)));
    }
    function Nn(e) {
        function t(l) {
            return Cn(l, e);
        }
        if (0 < gr.length) {
            Cn(gr[0], e);
            for (var n = 1; n < gr.length; n++) {
                var r = gr[n];
                r.blockedOn === e && (r.blockedOn = null);
            }
        }
        for (
            qe !== null && Cn(qe, e),
                be !== null && Cn(be, e),
                et !== null && Cn(et, e),
                xn.forEach(t),
                En.forEach(t),
                n = 0;
            n < tt.length;
            n++
        )
            ((r = tt[n]), r.blockedOn === e && (r.blockedOn = null));
        for (; 0 < tt.length && ((n = tt[0]), n.blockedOn === null); ) (Hu(n), n.blockedOn === null && tt.shift());
    }
    var $t = $e.ReactCurrentBatchConfig,
        wr = !0;
    function yf(e, t, n, r) {
        var l = R,
            i = $t.transition;
        $t.transition = null;
        try {
            ((R = 1), oi(e, t, n, r));
        } finally {
            ((R = l), ($t.transition = i));
        }
    }
    function wf(e, t, n, r) {
        var l = R,
            i = $t.transition;
        $t.transition = null;
        try {
            ((R = 4), oi(e, t, n, r));
        } finally {
            ((R = l), ($t.transition = i));
        }
    }
    function oi(e, t, n, r) {
        if (wr) {
            var l = ui(e, t, n, r);
            if (l === null) (_i(e, t, r, kr, n), Vu(e, r));
            else if (vf(l, e, t, n, r)) r.stopPropagation();
            else if ((Vu(e, r), t & 4 && -1 < hf.indexOf(e))) {
                for (; l !== null; ) {
                    var i = Un(l);
                    if ((i !== null && Uu(i), (i = ui(e, t, n, r)), i === null && _i(e, t, r, kr, n), i === l)) break;
                    l = i;
                }
                l !== null && r.stopPropagation();
            } else _i(e, t, r, null, n);
        }
    }
    var kr = null;
    function ui(e, t, n, r) {
        if (((kr = null), (e = Xl(r)), (e = kt(e)), e !== null))
            if (((t = wt(e)), t === null)) e = null;
            else if (((n = t.tag), n === 13)) {
                if (((e = Pu(t)), e !== null)) return e;
                e = null;
            } else if (n === 3) {
                if (t.stateNode.current.memoizedState.isDehydrated)
                    return t.tag === 3 ? t.stateNode.containerInfo : null;
                e = null;
            } else t !== e && (e = null);
        return ((kr = e), null);
    }
    function Qu(e) {
        switch (e) {
            case 'cancel':
            case 'click':
            case 'close':
            case 'contextmenu':
            case 'copy':
            case 'cut':
            case 'auxclick':
            case 'dblclick':
            case 'dragend':
            case 'dragstart':
            case 'drop':
            case 'focusin':
            case 'focusout':
            case 'input':
            case 'invalid':
            case 'keydown':
            case 'keypress':
            case 'keyup':
            case 'mousedown':
            case 'mouseup':
            case 'paste':
            case 'pause':
            case 'play':
            case 'pointercancel':
            case 'pointerdown':
            case 'pointerup':
            case 'ratechange':
            case 'reset':
            case 'resize':
            case 'seeked':
            case 'submit':
            case 'touchcancel':
            case 'touchend':
            case 'touchstart':
            case 'volumechange':
            case 'change':
            case 'selectionchange':
            case 'textInput':
            case 'compositionstart':
            case 'compositionend':
            case 'compositionupdate':
            case 'beforeblur':
            case 'afterblur':
            case 'beforeinput':
            case 'blur':
            case 'fullscreenchange':
            case 'focus':
            case 'hashchange':
            case 'popstate':
            case 'select':
            case 'selectstart':
                return 1;
            case 'drag':
            case 'dragenter':
            case 'dragexit':
            case 'dragleave':
            case 'dragover':
            case 'mousemove':
            case 'mouseout':
            case 'mouseover':
            case 'pointermove':
            case 'pointerout':
            case 'pointerover':
            case 'scroll':
            case 'toggle':
            case 'touchmove':
            case 'wheel':
            case 'mouseenter':
            case 'mouseleave':
            case 'pointerenter':
            case 'pointerleave':
                return 4;
            case 'message':
                switch (of()) {
                    case ei:
                        return 1;
                    case Fu:
                        return 4;
                    case dr:
                    case uf:
                        return 16;
                    case Mu:
                        return 536870912;
                    default:
                        return 16;
                }
            default:
                return 16;
        }
    }
    var nt = null,
        si = null,
        Sr = null;
    function Ku() {
        if (Sr) return Sr;
        var e,
            t = si,
            n = t.length,
            r,
            l = 'value' in nt ? nt.value : nt.textContent,
            i = l.length;
        for (e = 0; e < n && t[e] === l[e]; e++);
        var o = n - e;
        for (r = 1; r <= o && t[n - r] === l[i - r]; r++);
        return (Sr = l.slice(e, 1 < r ? 1 - r : void 0));
    }
    function xr(e) {
        var t = e.keyCode;
        return (
            'charCode' in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
            e === 10 && (e = 13),
            32 <= e || e === 13 ? e : 0
        );
    }
    function Er() {
        return !0;
    }
    function Gu() {
        return !1;
    }
    function ve(e) {
        function t(n, r, l, i, o) {
            ((this._reactName = n),
                (this._targetInst = l),
                (this.type = r),
                (this.nativeEvent = i),
                (this.target = o),
                (this.currentTarget = null));
            for (var u in e) e.hasOwnProperty(u) && ((n = e[u]), (this[u] = n ? n(i) : i[u]));
            return (
                (this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1)
                    ? Er
                    : Gu),
                (this.isPropagationStopped = Gu),
                this
            );
        }
        return (
            A(t.prototype, {
                preventDefault: function () {
                    this.defaultPrevented = !0;
                    var n = this.nativeEvent;
                    n &&
                        (n.preventDefault
                            ? n.preventDefault()
                            : typeof n.returnValue != 'unknown' && (n.returnValue = !1),
                        (this.isDefaultPrevented = Er));
                },
                stopPropagation: function () {
                    var n = this.nativeEvent;
                    n &&
                        (n.stopPropagation
                            ? n.stopPropagation()
                            : typeof n.cancelBubble != 'unknown' && (n.cancelBubble = !0),
                        (this.isPropagationStopped = Er));
                },
                persist: function () {},
                isPersistent: Er
            }),
            t
        );
    }
    var Vt = {
            eventPhase: 0,
            bubbles: 0,
            cancelable: 0,
            timeStamp: function (e) {
                return e.timeStamp || Date.now();
            },
            defaultPrevented: 0,
            isTrusted: 0
        },
        ai = ve(Vt),
        zn = A({}, Vt, { view: 0, detail: 0 }),
        kf = ve(zn),
        ci,
        fi,
        Pn,
        _r = A({}, zn, {
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
            getModifierState: pi,
            button: 0,
            buttons: 0,
            relatedTarget: function (e) {
                return e.relatedTarget === void 0
                    ? e.fromElement === e.srcElement
                        ? e.toElement
                        : e.fromElement
                    : e.relatedTarget;
            },
            movementX: function (e) {
                return 'movementX' in e
                    ? e.movementX
                    : (e !== Pn &&
                          (Pn && e.type === 'mousemove'
                              ? ((ci = e.screenX - Pn.screenX), (fi = e.screenY - Pn.screenY))
                              : (fi = ci = 0),
                          (Pn = e)),
                      ci);
            },
            movementY: function (e) {
                return 'movementY' in e ? e.movementY : fi;
            }
        }),
        Yu = ve(_r),
        Sf = A({}, _r, { dataTransfer: 0 }),
        xf = ve(Sf),
        Ef = A({}, zn, { relatedTarget: 0 }),
        di = ve(Ef),
        _f = A({}, Vt, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
        Cf = ve(_f),
        Nf = A({}, Vt, {
            clipboardData: function (e) {
                return 'clipboardData' in e ? e.clipboardData : window.clipboardData;
            }
        }),
        zf = ve(Nf),
        Pf = A({}, Vt, { data: 0 }),
        Xu = ve(Pf),
        Tf = {
            Esc: 'Escape',
            Spacebar: ' ',
            Left: 'ArrowLeft',
            Up: 'ArrowUp',
            Right: 'ArrowRight',
            Down: 'ArrowDown',
            Del: 'Delete',
            Win: 'OS',
            Menu: 'ContextMenu',
            Apps: 'ContextMenu',
            Scroll: 'ScrollLock',
            MozPrintableKey: 'Unidentified'
        },
        Lf = {
            8: 'Backspace',
            9: 'Tab',
            12: 'Clear',
            13: 'Enter',
            16: 'Shift',
            17: 'Control',
            18: 'Alt',
            19: 'Pause',
            20: 'CapsLock',
            27: 'Escape',
            32: ' ',
            33: 'PageUp',
            34: 'PageDown',
            35: 'End',
            36: 'Home',
            37: 'ArrowLeft',
            38: 'ArrowUp',
            39: 'ArrowRight',
            40: 'ArrowDown',
            45: 'Insert',
            46: 'Delete',
            112: 'F1',
            113: 'F2',
            114: 'F3',
            115: 'F4',
            116: 'F5',
            117: 'F6',
            118: 'F7',
            119: 'F8',
            120: 'F9',
            121: 'F10',
            122: 'F11',
            123: 'F12',
            144: 'NumLock',
            145: 'ScrollLock',
            224: 'Meta'
        },
        jf = { Alt: 'altKey', Control: 'ctrlKey', Meta: 'metaKey', Shift: 'shiftKey' };
    function Of(e) {
        var t = this.nativeEvent;
        return t.getModifierState ? t.getModifierState(e) : (e = jf[e]) ? !!t[e] : !1;
    }
    function pi() {
        return Of;
    }
    var Rf = A({}, zn, {
            key: function (e) {
                if (e.key) {
                    var t = Tf[e.key] || e.key;
                    if (t !== 'Unidentified') return t;
                }
                return e.type === 'keypress'
                    ? ((e = xr(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
                    : e.type === 'keydown' || e.type === 'keyup'
                      ? Lf[e.keyCode] || 'Unidentified'
                      : '';
            },
            code: 0,
            location: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            repeat: 0,
            locale: 0,
            getModifierState: pi,
            charCode: function (e) {
                return e.type === 'keypress' ? xr(e) : 0;
            },
            keyCode: function (e) {
                return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
            },
            which: function (e) {
                return e.type === 'keypress' ? xr(e) : e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
            }
        }),
        Ff = ve(Rf),
        Mf = A({}, _r, {
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
        }),
        Zu = ve(Mf),
        If = A({}, zn, {
            touches: 0,
            targetTouches: 0,
            changedTouches: 0,
            altKey: 0,
            metaKey: 0,
            ctrlKey: 0,
            shiftKey: 0,
            getModifierState: pi
        }),
        Df = ve(If),
        Uf = A({}, Vt, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
        Af = ve(Uf),
        Bf = A({}, _r, {
            deltaX: function (e) {
                return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0;
            },
            deltaY: function (e) {
                return 'deltaY' in e
                    ? e.deltaY
                    : 'wheelDeltaY' in e
                      ? -e.wheelDeltaY
                      : 'wheelDelta' in e
                        ? -e.wheelDelta
                        : 0;
            },
            deltaZ: 0,
            deltaMode: 0
        }),
        $f = ve(Bf),
        Vf = [9, 13, 27, 32],
        mi = Be && 'CompositionEvent' in window,
        Tn = null;
    Be && 'documentMode' in document && (Tn = document.documentMode);
    var Hf = Be && 'TextEvent' in window && !Tn,
        Ju = Be && (!mi || (Tn && 8 < Tn && 11 >= Tn)),
        qu = ' ',
        bu = !1;
    function es(e, t) {
        switch (e) {
            case 'keyup':
                return Vf.indexOf(t.keyCode) !== -1;
            case 'keydown':
                return t.keyCode !== 229;
            case 'keypress':
            case 'mousedown':
            case 'focusout':
                return !0;
            default:
                return !1;
        }
    }
    function ts(e) {
        return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null);
    }
    var Ht = !1;
    function Wf(e, t) {
        switch (e) {
            case 'compositionend':
                return ts(t);
            case 'keypress':
                return t.which !== 32 ? null : ((bu = !0), qu);
            case 'textInput':
                return ((e = t.data), e === qu && bu ? null : e);
            default:
                return null;
        }
    }
    function Qf(e, t) {
        if (Ht)
            return e === 'compositionend' || (!mi && es(e, t))
                ? ((e = Ku()), (Sr = si = nt = null), (Ht = !1), e)
                : null;
        switch (e) {
            case 'paste':
                return null;
            case 'keypress':
                if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
                    if (t.char && 1 < t.char.length) return t.char;
                    if (t.which) return String.fromCharCode(t.which);
                }
                return null;
            case 'compositionend':
                return Ju && t.locale !== 'ko' ? null : t.data;
            default:
                return null;
        }
    }
    var Kf = {
        color: !0,
        date: !0,
        datetime: !0,
        'datetime-local': !0,
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
    function ns(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return t === 'input' ? !!Kf[e.type] : t === 'textarea';
    }
    function rs(e, t, n, r) {
        (Eu(r),
            (t = Tr(t, 'onChange')),
            0 < t.length && ((n = new ai('onChange', 'change', null, n, r)), e.push({ event: n, listeners: t })));
    }
    var Ln = null,
        jn = null;
    function Gf(e) {
        Ss(e, 0);
    }
    function Cr(e) {
        var t = Yt(e);
        if (fu(t)) return e;
    }
    function Yf(e, t) {
        if (e === 'change') return t;
    }
    var ls = !1;
    if (Be) {
        var hi;
        if (Be) {
            var vi = 'oninput' in document;
            if (!vi) {
                var is = document.createElement('div');
                (is.setAttribute('oninput', 'return;'), (vi = typeof is.oninput == 'function'));
            }
            hi = vi;
        } else hi = !1;
        ls = hi && (!document.documentMode || 9 < document.documentMode);
    }
    function os() {
        Ln && (Ln.detachEvent('onpropertychange', us), (jn = Ln = null));
    }
    function us(e) {
        if (e.propertyName === 'value' && Cr(jn)) {
            var t = [];
            (rs(t, jn, e, Xl(e)), zu(Gf, t));
        }
    }
    function Xf(e, t, n) {
        e === 'focusin' ? (os(), (Ln = t), (jn = n), Ln.attachEvent('onpropertychange', us)) : e === 'focusout' && os();
    }
    function Zf(e) {
        if (e === 'selectionchange' || e === 'keyup' || e === 'keydown') return Cr(jn);
    }
    function Jf(e, t) {
        if (e === 'click') return Cr(t);
    }
    function qf(e, t) {
        if (e === 'input' || e === 'change') return Cr(t);
    }
    function bf(e, t) {
        return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
    }
    var Pe = typeof Object.is == 'function' ? Object.is : bf;
    function On(e, t) {
        if (Pe(e, t)) return !0;
        if (typeof e != 'object' || e === null || typeof t != 'object' || t === null) return !1;
        var n = Object.keys(e),
            r = Object.keys(t);
        if (n.length !== r.length) return !1;
        for (r = 0; r < n.length; r++) {
            var l = n[r];
            if (!zl.call(t, l) || !Pe(e[l], t[l])) return !1;
        }
        return !0;
    }
    function ss(e) {
        for (; e && e.firstChild; ) e = e.firstChild;
        return e;
    }
    function as(e, t) {
        var n = ss(e);
        e = 0;
        for (var r; n; ) {
            if (n.nodeType === 3) {
                if (((r = e + n.textContent.length), e <= t && r >= t)) return { node: n, offset: t - e };
                e = r;
            }
            e: {
                for (; n; ) {
                    if (n.nextSibling) {
                        n = n.nextSibling;
                        break e;
                    }
                    n = n.parentNode;
                }
                n = void 0;
            }
            n = ss(n);
        }
    }
    function cs(e, t) {
        return e && t
            ? e === t
                ? !0
                : e && e.nodeType === 3
                  ? !1
                  : t && t.nodeType === 3
                    ? cs(e, t.parentNode)
                    : 'contains' in e
                      ? e.contains(t)
                      : e.compareDocumentPosition
                        ? !!(e.compareDocumentPosition(t) & 16)
                        : !1
            : !1;
    }
    function fs() {
        for (var e = window, t = sr(); t instanceof e.HTMLIFrameElement; ) {
            try {
                var n = typeof t.contentWindow.location.href == 'string';
            } catch {
                n = !1;
            }
            if (n) e = t.contentWindow;
            else break;
            t = sr(e.document);
        }
        return t;
    }
    function gi(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return (
            t &&
            ((t === 'input' &&
                (e.type === 'text' ||
                    e.type === 'search' ||
                    e.type === 'tel' ||
                    e.type === 'url' ||
                    e.type === 'password')) ||
                t === 'textarea' ||
                e.contentEditable === 'true')
        );
    }
    function ed(e) {
        var t = fs(),
            n = e.focusedElem,
            r = e.selectionRange;
        if (t !== n && n && n.ownerDocument && cs(n.ownerDocument.documentElement, n)) {
            if (r !== null && gi(n)) {
                if (((t = r.start), (e = r.end), e === void 0 && (e = t), 'selectionStart' in n))
                    ((n.selectionStart = t), (n.selectionEnd = Math.min(e, n.value.length)));
                else if (((e = ((t = n.ownerDocument || document) && t.defaultView) || window), e.getSelection)) {
                    e = e.getSelection();
                    var l = n.textContent.length,
                        i = Math.min(r.start, l);
                    ((r = r.end === void 0 ? i : Math.min(r.end, l)),
                        !e.extend && i > r && ((l = r), (r = i), (i = l)),
                        (l = as(n, i)));
                    var o = as(n, r);
                    l &&
                        o &&
                        (e.rangeCount !== 1 ||
                            e.anchorNode !== l.node ||
                            e.anchorOffset !== l.offset ||
                            e.focusNode !== o.node ||
                            e.focusOffset !== o.offset) &&
                        ((t = t.createRange()),
                        t.setStart(l.node, l.offset),
                        e.removeAllRanges(),
                        i > r
                            ? (e.addRange(t), e.extend(o.node, o.offset))
                            : (t.setEnd(o.node, o.offset), e.addRange(t)));
                }
            }
            for (t = [], e = n; (e = e.parentNode); )
                e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
            for (typeof n.focus == 'function' && n.focus(), n = 0; n < t.length; n++)
                ((e = t[n]), (e.element.scrollLeft = e.left), (e.element.scrollTop = e.top));
        }
    }
    var td = Be && 'documentMode' in document && 11 >= document.documentMode,
        Wt = null,
        yi = null,
        Rn = null,
        wi = !1;
    function ds(e, t, n) {
        var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
        wi ||
            Wt == null ||
            Wt !== sr(r) ||
            ((r = Wt),
            'selectionStart' in r && gi(r)
                ? (r = { start: r.selectionStart, end: r.selectionEnd })
                : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
                  (r = {
                      anchorNode: r.anchorNode,
                      anchorOffset: r.anchorOffset,
                      focusNode: r.focusNode,
                      focusOffset: r.focusOffset
                  })),
            (Rn && On(Rn, r)) ||
                ((Rn = r),
                (r = Tr(yi, 'onSelect')),
                0 < r.length &&
                    ((t = new ai('onSelect', 'select', null, t, n)),
                    e.push({ event: t, listeners: r }),
                    (t.target = Wt))));
    }
    function Nr(e, t) {
        var n = {};
        return (
            (n[e.toLowerCase()] = t.toLowerCase()),
            (n['Webkit' + e] = 'webkit' + t),
            (n['Moz' + e] = 'moz' + t),
            n
        );
    }
    var Qt = {
            animationend: Nr('Animation', 'AnimationEnd'),
            animationiteration: Nr('Animation', 'AnimationIteration'),
            animationstart: Nr('Animation', 'AnimationStart'),
            transitionend: Nr('Transition', 'TransitionEnd')
        },
        ki = {},
        ps = {};
    Be &&
        ((ps = document.createElement('div').style),
        'AnimationEvent' in window ||
            (delete Qt.animationend.animation,
            delete Qt.animationiteration.animation,
            delete Qt.animationstart.animation),
        'TransitionEvent' in window || delete Qt.transitionend.transition);
    function zr(e) {
        if (ki[e]) return ki[e];
        if (!Qt[e]) return e;
        var t = Qt[e],
            n;
        for (n in t) if (t.hasOwnProperty(n) && n in ps) return (ki[e] = t[n]);
        return e;
    }
    var ms = zr('animationend'),
        hs = zr('animationiteration'),
        vs = zr('animationstart'),
        gs = zr('transitionend'),
        ys = new Map(),
        ws =
            'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
                ' '
            );
    function rt(e, t) {
        (ys.set(e, t), yt(t, [e]));
    }
    for (var Si = 0; Si < ws.length; Si++) {
        var xi = ws[Si],
            nd = xi.toLowerCase(),
            rd = xi[0].toUpperCase() + xi.slice(1);
        rt(nd, 'on' + rd);
    }
    (rt(ms, 'onAnimationEnd'),
        rt(hs, 'onAnimationIteration'),
        rt(vs, 'onAnimationStart'),
        rt('dblclick', 'onDoubleClick'),
        rt('focusin', 'onFocus'),
        rt('focusout', 'onBlur'),
        rt(gs, 'onTransitionEnd'),
        Mt('onMouseEnter', ['mouseout', 'mouseover']),
        Mt('onMouseLeave', ['mouseout', 'mouseover']),
        Mt('onPointerEnter', ['pointerout', 'pointerover']),
        Mt('onPointerLeave', ['pointerout', 'pointerover']),
        yt('onChange', 'change click focusin focusout input keydown keyup selectionchange'.split(' ')),
        yt(
            'onSelect',
            'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(' ')
        ),
        yt('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste']),
        yt('onCompositionEnd', 'compositionend focusout keydown keypress keyup mousedown'.split(' ')),
        yt('onCompositionStart', 'compositionstart focusout keydown keypress keyup mousedown'.split(' ')),
        yt('onCompositionUpdate', 'compositionupdate focusout keydown keypress keyup mousedown'.split(' ')));
    var Fn =
            'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
                ' '
            ),
        ld = new Set('cancel close invalid load scroll toggle'.split(' ').concat(Fn));
    function ks(e, t, n) {
        var r = e.type || 'unknown-event';
        ((e.currentTarget = n), tf(r, t, void 0, e), (e.currentTarget = null));
    }
    function Ss(e, t) {
        t = (t & 4) !== 0;
        for (var n = 0; n < e.length; n++) {
            var r = e[n],
                l = r.event;
            r = r.listeners;
            e: {
                var i = void 0;
                if (t)
                    for (var o = r.length - 1; 0 <= o; o--) {
                        var u = r[o],
                            a = u.instance,
                            s = u.currentTarget;
                        if (((u = u.listener), a !== i && l.isPropagationStopped())) break e;
                        (ks(l, u, s), (i = a));
                    }
                else
                    for (o = 0; o < r.length; o++) {
                        if (
                            ((u = r[o]),
                            (a = u.instance),
                            (s = u.currentTarget),
                            (u = u.listener),
                            a !== i && l.isPropagationStopped())
                        )
                            break e;
                        (ks(l, u, s), (i = a));
                    }
            }
        }
        if (fr) throw ((e = bl), (fr = !1), (bl = null), e);
    }
    function I(e, t) {
        var n = t[Li];
        n === void 0 && (n = t[Li] = new Set());
        var r = e + '__bubble';
        n.has(r) || (xs(t, e, 2, !1), n.add(r));
    }
    function Ei(e, t, n) {
        var r = 0;
        (t && (r |= 4), xs(n, e, r, t));
    }
    var Pr = '_reactListening' + Math.random().toString(36).slice(2);
    function Mn(e) {
        if (!e[Pr]) {
            ((e[Pr] = !0),
                ru.forEach(function (n) {
                    n !== 'selectionchange' && (ld.has(n) || Ei(n, !1, e), Ei(n, !0, e));
                }));
            var t = e.nodeType === 9 ? e : e.ownerDocument;
            t === null || t[Pr] || ((t[Pr] = !0), Ei('selectionchange', !1, t));
        }
    }
    function xs(e, t, n, r) {
        switch (Qu(t)) {
            case 1:
                var l = yf;
                break;
            case 4:
                l = wf;
                break;
            default:
                l = oi;
        }
        ((n = l.bind(null, t, n, e)),
            (l = void 0),
            !ql || (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') || (l = !0),
            r
                ? l !== void 0
                    ? e.addEventListener(t, n, { capture: !0, passive: l })
                    : e.addEventListener(t, n, !0)
                : l !== void 0
                  ? e.addEventListener(t, n, { passive: l })
                  : e.addEventListener(t, n, !1));
    }
    function _i(e, t, n, r, l) {
        var i = r;
        if (!(t & 1) && !(t & 2) && r !== null)
            e: for (;;) {
                if (r === null) return;
                var o = r.tag;
                if (o === 3 || o === 4) {
                    var u = r.stateNode.containerInfo;
                    if (u === l || (u.nodeType === 8 && u.parentNode === l)) break;
                    if (o === 4)
                        for (o = r.return; o !== null; ) {
                            var a = o.tag;
                            if (
                                (a === 3 || a === 4) &&
                                ((a = o.stateNode.containerInfo), a === l || (a.nodeType === 8 && a.parentNode === l))
                            )
                                return;
                            o = o.return;
                        }
                    for (; u !== null; ) {
                        if (((o = kt(u)), o === null)) return;
                        if (((a = o.tag), a === 5 || a === 6)) {
                            r = i = o;
                            continue e;
                        }
                        u = u.parentNode;
                    }
                }
                r = r.return;
            }
        zu(function () {
            var s = i,
                d = Xl(n),
                f = [];
            e: {
                var c = ys.get(e);
                if (c !== void 0) {
                    var v = ai,
                        w = e;
                    switch (e) {
                        case 'keypress':
                            if (xr(n) === 0) break e;
                        case 'keydown':
                        case 'keyup':
                            v = Ff;
                            break;
                        case 'focusin':
                            ((w = 'focus'), (v = di));
                            break;
                        case 'focusout':
                            ((w = 'blur'), (v = di));
                            break;
                        case 'beforeblur':
                        case 'afterblur':
                            v = di;
                            break;
                        case 'click':
                            if (n.button === 2) break e;
                        case 'auxclick':
                        case 'dblclick':
                        case 'mousedown':
                        case 'mousemove':
                        case 'mouseup':
                        case 'mouseout':
                        case 'mouseover':
                        case 'contextmenu':
                            v = Yu;
                            break;
                        case 'drag':
                        case 'dragend':
                        case 'dragenter':
                        case 'dragexit':
                        case 'dragleave':
                        case 'dragover':
                        case 'dragstart':
                        case 'drop':
                            v = xf;
                            break;
                        case 'touchcancel':
                        case 'touchend':
                        case 'touchmove':
                        case 'touchstart':
                            v = Df;
                            break;
                        case ms:
                        case hs:
                        case vs:
                            v = Cf;
                            break;
                        case gs:
                            v = Af;
                            break;
                        case 'scroll':
                            v = kf;
                            break;
                        case 'wheel':
                            v = $f;
                            break;
                        case 'copy':
                        case 'cut':
                        case 'paste':
                            v = zf;
                            break;
                        case 'gotpointercapture':
                        case 'lostpointercapture':
                        case 'pointercancel':
                        case 'pointerdown':
                        case 'pointermove':
                        case 'pointerout':
                        case 'pointerover':
                        case 'pointerup':
                            v = Zu;
                    }
                    var k = (t & 4) !== 0,
                        z = !k && e === 'scroll',
                        m = k ? (c !== null ? c + 'Capture' : null) : c;
                    k = [];
                    for (var p = s, h; p !== null; ) {
                        h = p;
                        var g = h.stateNode;
                        if (
                            (h.tag === 5 &&
                                g !== null &&
                                ((h = g), m !== null && ((g = gn(p, m)), g != null && k.push(In(p, g, h)))),
                            z)
                        )
                            break;
                        p = p.return;
                    }
                    0 < k.length && ((c = new v(c, w, null, n, d)), f.push({ event: c, listeners: k }));
                }
            }
            if (!(t & 7)) {
                e: {
                    if (
                        ((c = e === 'mouseover' || e === 'pointerover'),
                        (v = e === 'mouseout' || e === 'pointerout'),
                        c && n !== Yl && (w = n.relatedTarget || n.fromElement) && (kt(w) || w[Ve]))
                    )
                        break e;
                    if (
                        (v || c) &&
                        ((c = d.window === d ? d : (c = d.ownerDocument) ? c.defaultView || c.parentWindow : window),
                        v
                            ? ((w = n.relatedTarget || n.toElement),
                              (v = s),
                              (w = w ? kt(w) : null),
                              w !== null && ((z = wt(w)), w !== z || (w.tag !== 5 && w.tag !== 6)) && (w = null))
                            : ((v = null), (w = s)),
                        v !== w)
                    ) {
                        if (
                            ((k = Yu),
                            (g = 'onMouseLeave'),
                            (m = 'onMouseEnter'),
                            (p = 'mouse'),
                            (e === 'pointerout' || e === 'pointerover') &&
                                ((k = Zu), (g = 'onPointerLeave'), (m = 'onPointerEnter'), (p = 'pointer')),
                            (z = v == null ? c : Yt(v)),
                            (h = w == null ? c : Yt(w)),
                            (c = new k(g, p + 'leave', v, n, d)),
                            (c.target = z),
                            (c.relatedTarget = h),
                            (g = null),
                            kt(d) === s &&
                                ((k = new k(m, p + 'enter', w, n, d)), (k.target = h), (k.relatedTarget = z), (g = k)),
                            (z = g),
                            v && w)
                        )
                            t: {
                                for (k = v, m = w, p = 0, h = k; h; h = Kt(h)) p++;
                                for (h = 0, g = m; g; g = Kt(g)) h++;
                                for (; 0 < p - h; ) ((k = Kt(k)), p--);
                                for (; 0 < h - p; ) ((m = Kt(m)), h--);
                                for (; p--; ) {
                                    if (k === m || (m !== null && k === m.alternate)) break t;
                                    ((k = Kt(k)), (m = Kt(m)));
                                }
                                k = null;
                            }
                        else k = null;
                        (v !== null && Es(f, c, v, k, !1), w !== null && z !== null && Es(f, z, w, k, !0));
                    }
                }
                e: {
                    if (
                        ((c = s ? Yt(s) : window),
                        (v = c.nodeName && c.nodeName.toLowerCase()),
                        v === 'select' || (v === 'input' && c.type === 'file'))
                    )
                        var x = Yf;
                    else if (ns(c))
                        if (ls) x = qf;
                        else {
                            x = Zf;
                            var _ = Xf;
                        }
                    else
                        (v = c.nodeName) &&
                            v.toLowerCase() === 'input' &&
                            (c.type === 'checkbox' || c.type === 'radio') &&
                            (x = Jf);
                    if (x && (x = x(e, s))) {
                        rs(f, x, n, d);
                        break e;
                    }
                    (_ && _(e, c, s),
                        e === 'focusout' &&
                            (_ = c._wrapperState) &&
                            _.controlled &&
                            c.type === 'number' &&
                            Hl(c, 'number', c.value));
                }
                switch (((_ = s ? Yt(s) : window), e)) {
                    case 'focusin':
                        (ns(_) || _.contentEditable === 'true') && ((Wt = _), (yi = s), (Rn = null));
                        break;
                    case 'focusout':
                        Rn = yi = Wt = null;
                        break;
                    case 'mousedown':
                        wi = !0;
                        break;
                    case 'contextmenu':
                    case 'mouseup':
                    case 'dragend':
                        ((wi = !1), ds(f, n, d));
                        break;
                    case 'selectionchange':
                        if (td) break;
                    case 'keydown':
                    case 'keyup':
                        ds(f, n, d);
                }
                var C;
                if (mi)
                    e: {
                        switch (e) {
                            case 'compositionstart':
                                var N = 'onCompositionStart';
                                break e;
                            case 'compositionend':
                                N = 'onCompositionEnd';
                                break e;
                            case 'compositionupdate':
                                N = 'onCompositionUpdate';
                                break e;
                        }
                        N = void 0;
                    }
                else
                    Ht
                        ? es(e, n) && (N = 'onCompositionEnd')
                        : e === 'keydown' && n.keyCode === 229 && (N = 'onCompositionStart');
                (N &&
                    (Ju &&
                        n.locale !== 'ko' &&
                        (Ht || N !== 'onCompositionStart'
                            ? N === 'onCompositionEnd' && Ht && (C = Ku())
                            : ((nt = d), (si = 'value' in nt ? nt.value : nt.textContent), (Ht = !0))),
                    (_ = Tr(s, N)),
                    0 < _.length &&
                        ((N = new Xu(N, e, null, n, d)),
                        f.push({ event: N, listeners: _ }),
                        C ? (N.data = C) : ((C = ts(n)), C !== null && (N.data = C)))),
                    (C = Hf ? Wf(e, n) : Qf(e, n)) &&
                        ((s = Tr(s, 'onBeforeInput')),
                        0 < s.length &&
                            ((d = new Xu('onBeforeInput', 'beforeinput', null, n, d)),
                            f.push({ event: d, listeners: s }),
                            (d.data = C))));
            }
            Ss(f, t);
        });
    }
    function In(e, t, n) {
        return { instance: e, listener: t, currentTarget: n };
    }
    function Tr(e, t) {
        for (var n = t + 'Capture', r = []; e !== null; ) {
            var l = e,
                i = l.stateNode;
            (l.tag === 5 &&
                i !== null &&
                ((l = i),
                (i = gn(e, n)),
                i != null && r.unshift(In(e, i, l)),
                (i = gn(e, t)),
                i != null && r.push(In(e, i, l))),
                (e = e.return));
        }
        return r;
    }
    function Kt(e) {
        if (e === null) return null;
        do e = e.return;
        while (e && e.tag !== 5);
        return e || null;
    }
    function Es(e, t, n, r, l) {
        for (var i = t._reactName, o = []; n !== null && n !== r; ) {
            var u = n,
                a = u.alternate,
                s = u.stateNode;
            if (a !== null && a === r) break;
            (u.tag === 5 &&
                s !== null &&
                ((u = s),
                l
                    ? ((a = gn(n, i)), a != null && o.unshift(In(n, a, u)))
                    : l || ((a = gn(n, i)), a != null && o.push(In(n, a, u)))),
                (n = n.return));
        }
        o.length !== 0 && e.push({ event: t, listeners: o });
    }
    var id = /\r\n?/g,
        od = /\u0000|\uFFFD/g;
    function _s(e) {
        return (typeof e == 'string' ? e : '' + e)
            .replace(
                id,
                `
`
            )
            .replace(od, '');
    }
    function Lr(e, t, n) {
        if (((t = _s(t)), _s(e) !== t && n)) throw Error(y(425));
    }
    function jr() {}
    var Ci = null,
        Ni = null;
    function zi(e, t) {
        return (
            e === 'textarea' ||
            e === 'noscript' ||
            typeof t.children == 'string' ||
            typeof t.children == 'number' ||
            (typeof t.dangerouslySetInnerHTML == 'object' &&
                t.dangerouslySetInnerHTML !== null &&
                t.dangerouslySetInnerHTML.__html != null)
        );
    }
    var Pi = typeof setTimeout == 'function' ? setTimeout : void 0,
        ud = typeof clearTimeout == 'function' ? clearTimeout : void 0,
        Cs = typeof Promise == 'function' ? Promise : void 0,
        sd =
            typeof queueMicrotask == 'function'
                ? queueMicrotask
                : typeof Cs < 'u'
                  ? function (e) {
                        return Cs.resolve(null).then(e).catch(ad);
                    }
                  : Pi;
    function ad(e) {
        setTimeout(function () {
            throw e;
        });
    }
    function Ti(e, t) {
        var n = t,
            r = 0;
        do {
            var l = n.nextSibling;
            if ((e.removeChild(n), l && l.nodeType === 8))
                if (((n = l.data), n === '/$')) {
                    if (r === 0) {
                        (e.removeChild(l), Nn(t));
                        return;
                    }
                    r--;
                } else (n !== '$' && n !== '$?' && n !== '$!') || r++;
            n = l;
        } while (n);
        Nn(t);
    }
    function lt(e) {
        for (; e != null; e = e.nextSibling) {
            var t = e.nodeType;
            if (t === 1 || t === 3) break;
            if (t === 8) {
                if (((t = e.data), t === '$' || t === '$!' || t === '$?')) break;
                if (t === '/$') return null;
            }
        }
        return e;
    }
    function Ns(e) {
        e = e.previousSibling;
        for (var t = 0; e; ) {
            if (e.nodeType === 8) {
                var n = e.data;
                if (n === '$' || n === '$!' || n === '$?') {
                    if (t === 0) return e;
                    t--;
                } else n === '/$' && t++;
            }
            e = e.previousSibling;
        }
        return null;
    }
    var Gt = Math.random().toString(36).slice(2),
        Ie = '__reactFiber$' + Gt,
        Dn = '__reactProps$' + Gt,
        Ve = '__reactContainer$' + Gt,
        Li = '__reactEvents$' + Gt,
        cd = '__reactListeners$' + Gt,
        fd = '__reactHandles$' + Gt;
    function kt(e) {
        var t = e[Ie];
        if (t) return t;
        for (var n = e.parentNode; n; ) {
            if ((t = n[Ve] || n[Ie])) {
                if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null)))
                    for (e = Ns(e); e !== null; ) {
                        if ((n = e[Ie])) return n;
                        e = Ns(e);
                    }
                return t;
            }
            ((e = n), (n = e.parentNode));
        }
        return null;
    }
    function Un(e) {
        return ((e = e[Ie] || e[Ve]), !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e);
    }
    function Yt(e) {
        if (e.tag === 5 || e.tag === 6) return e.stateNode;
        throw Error(y(33));
    }
    function Or(e) {
        return e[Dn] || null;
    }
    var ji = [],
        Xt = -1;
    function it(e) {
        return { current: e };
    }
    function D(e) {
        0 > Xt || ((e.current = ji[Xt]), (ji[Xt] = null), Xt--);
    }
    function F(e, t) {
        (Xt++, (ji[Xt] = e.current), (e.current = t));
    }
    var ot = {},
        te = it(ot),
        ae = it(!1),
        St = ot;
    function Zt(e, t) {
        var n = e.type.contextTypes;
        if (!n) return ot;
        var r = e.stateNode;
        if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
            return r.__reactInternalMemoizedMaskedChildContext;
        var l = {},
            i;
        for (i in n) l[i] = t[i];
        return (
            r &&
                ((e = e.stateNode),
                (e.__reactInternalMemoizedUnmaskedChildContext = t),
                (e.__reactInternalMemoizedMaskedChildContext = l)),
            l
        );
    }
    function ce(e) {
        return ((e = e.childContextTypes), e != null);
    }
    function Rr() {
        (D(ae), D(te));
    }
    function zs(e, t, n) {
        if (te.current !== ot) throw Error(y(168));
        (F(te, t), F(ae, n));
    }
    function Ps(e, t, n) {
        var r = e.stateNode;
        if (((t = t.childContextTypes), typeof r.getChildContext != 'function')) return n;
        r = r.getChildContext();
        for (var l in r) if (!(l in t)) throw Error(y(108, Yc(e) || 'Unknown', l));
        return A({}, n, r);
    }
    function Fr(e) {
        return (
            (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || ot),
            (St = te.current),
            F(te, e),
            F(ae, ae.current),
            !0
        );
    }
    function Ts(e, t, n) {
        var r = e.stateNode;
        if (!r) throw Error(y(169));
        (n ? ((e = Ps(e, t, St)), (r.__reactInternalMemoizedMergedChildContext = e), D(ae), D(te), F(te, e)) : D(ae),
            F(ae, n));
    }
    var He = null,
        Mr = !1,
        Oi = !1;
    function Ls(e) {
        He === null ? (He = [e]) : He.push(e);
    }
    function dd(e) {
        ((Mr = !0), Ls(e));
    }
    function ut() {
        if (!Oi && He !== null) {
            Oi = !0;
            var e = 0,
                t = R;
            try {
                var n = He;
                for (R = 1; e < n.length; e++) {
                    var r = n[e];
                    do r = r(!0);
                    while (r !== null);
                }
                ((He = null), (Mr = !1));
            } catch (l) {
                throw (He !== null && (He = He.slice(e + 1)), Ou(ei, ut), l);
            } finally {
                ((R = t), (Oi = !1));
            }
        }
        return null;
    }
    var Jt = [],
        qt = 0,
        Ir = null,
        Dr = 0,
        Se = [],
        xe = 0,
        xt = null,
        We = 1,
        Qe = '';
    function Et(e, t) {
        ((Jt[qt++] = Dr), (Jt[qt++] = Ir), (Ir = e), (Dr = t));
    }
    function js(e, t, n) {
        ((Se[xe++] = We), (Se[xe++] = Qe), (Se[xe++] = xt), (xt = e));
        var r = We;
        e = Qe;
        var l = 32 - ze(r) - 1;
        ((r &= ~(1 << l)), (n += 1));
        var i = 32 - ze(t) + l;
        if (30 < i) {
            var o = l - (l % 5);
            ((i = (r & ((1 << o) - 1)).toString(32)),
                (r >>= o),
                (l -= o),
                (We = (1 << (32 - ze(t) + l)) | (n << l) | r),
                (Qe = i + e));
        } else ((We = (1 << i) | (n << l) | r), (Qe = e));
    }
    function Ri(e) {
        e.return !== null && (Et(e, 1), js(e, 1, 0));
    }
    function Fi(e) {
        for (; e === Ir; ) ((Ir = Jt[--qt]), (Jt[qt] = null), (Dr = Jt[--qt]), (Jt[qt] = null));
        for (; e === xt; )
            ((xt = Se[--xe]), (Se[xe] = null), (Qe = Se[--xe]), (Se[xe] = null), (We = Se[--xe]), (Se[xe] = null));
    }
    var ge = null,
        ye = null,
        U = !1,
        Te = null;
    function Os(e, t) {
        var n = Ne(5, null, null, 0);
        ((n.elementType = 'DELETED'),
            (n.stateNode = t),
            (n.return = e),
            (t = e.deletions),
            t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
    }
    function Rs(e, t) {
        switch (e.tag) {
            case 5:
                var n = e.type;
                return (
                    (t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t),
                    t !== null ? ((e.stateNode = t), (ge = e), (ye = lt(t.firstChild)), !0) : !1
                );
            case 6:
                return (
                    (t = e.pendingProps === '' || t.nodeType !== 3 ? null : t),
                    t !== null ? ((e.stateNode = t), (ge = e), (ye = null), !0) : !1
                );
            case 13:
                return (
                    (t = t.nodeType !== 8 ? null : t),
                    t !== null
                        ? ((n = xt !== null ? { id: We, overflow: Qe } : null),
                          (e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }),
                          (n = Ne(18, null, null, 0)),
                          (n.stateNode = t),
                          (n.return = e),
                          (e.child = n),
                          (ge = e),
                          (ye = null),
                          !0)
                        : !1
                );
            default:
                return !1;
        }
    }
    function Mi(e) {
        return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
    }
    function Ii(e) {
        if (U) {
            var t = ye;
            if (t) {
                var n = t;
                if (!Rs(e, t)) {
                    if (Mi(e)) throw Error(y(418));
                    t = lt(n.nextSibling);
                    var r = ge;
                    t && Rs(e, t) ? Os(r, n) : ((e.flags = (e.flags & -4097) | 2), (U = !1), (ge = e));
                }
            } else {
                if (Mi(e)) throw Error(y(418));
                ((e.flags = (e.flags & -4097) | 2), (U = !1), (ge = e));
            }
        }
    }
    function Fs(e) {
        for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
        ge = e;
    }
    function Ur(e) {
        if (e !== ge) return !1;
        if (!U) return (Fs(e), (U = !0), !1);
        var t;
        if (
            ((t = e.tag !== 3) &&
                !(t = e.tag !== 5) &&
                ((t = e.type), (t = t !== 'head' && t !== 'body' && !zi(e.type, e.memoizedProps))),
            t && (t = ye))
        ) {
            if (Mi(e)) throw (Ms(), Error(y(418)));
            for (; t; ) (Os(e, t), (t = lt(t.nextSibling)));
        }
        if ((Fs(e), e.tag === 13)) {
            if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(y(317));
            e: {
                for (e = e.nextSibling, t = 0; e; ) {
                    if (e.nodeType === 8) {
                        var n = e.data;
                        if (n === '/$') {
                            if (t === 0) {
                                ye = lt(e.nextSibling);
                                break e;
                            }
                            t--;
                        } else (n !== '$' && n !== '$!' && n !== '$?') || t++;
                    }
                    e = e.nextSibling;
                }
                ye = null;
            }
        } else ye = ge ? lt(e.stateNode.nextSibling) : null;
        return !0;
    }
    function Ms() {
        for (var e = ye; e; ) e = lt(e.nextSibling);
    }
    function bt() {
        ((ye = ge = null), (U = !1));
    }
    function Di(e) {
        Te === null ? (Te = [e]) : Te.push(e);
    }
    var pd = $e.ReactCurrentBatchConfig;
    function An(e, t, n) {
        if (((e = n.ref), e !== null && typeof e != 'function' && typeof e != 'object')) {
            if (n._owner) {
                if (((n = n._owner), n)) {
                    if (n.tag !== 1) throw Error(y(309));
                    var r = n.stateNode;
                }
                if (!r) throw Error(y(147, e));
                var l = r,
                    i = '' + e;
                return t !== null && t.ref !== null && typeof t.ref == 'function' && t.ref._stringRef === i
                    ? t.ref
                    : ((t = function (o) {
                          var u = l.refs;
                          o === null ? delete u[i] : (u[i] = o);
                      }),
                      (t._stringRef = i),
                      t);
            }
            if (typeof e != 'string') throw Error(y(284));
            if (!n._owner) throw Error(y(290, e));
        }
        return e;
    }
    function Ar(e, t) {
        throw (
            (e = Object.prototype.toString.call(t)),
            Error(y(31, e === '[object Object]' ? 'object with keys {' + Object.keys(t).join(', ') + '}' : e))
        );
    }
    function Is(e) {
        var t = e._init;
        return t(e._payload);
    }
    function Ds(e) {
        function t(m, p) {
            if (e) {
                var h = m.deletions;
                h === null ? ((m.deletions = [p]), (m.flags |= 16)) : h.push(p);
            }
        }
        function n(m, p) {
            if (!e) return null;
            for (; p !== null; ) (t(m, p), (p = p.sibling));
            return null;
        }
        function r(m, p) {
            for (m = new Map(); p !== null; ) (p.key !== null ? m.set(p.key, p) : m.set(p.index, p), (p = p.sibling));
            return m;
        }
        function l(m, p) {
            return ((m = ht(m, p)), (m.index = 0), (m.sibling = null), m);
        }
        function i(m, p, h) {
            return (
                (m.index = h),
                e
                    ? ((h = m.alternate),
                      h !== null ? ((h = h.index), h < p ? ((m.flags |= 2), p) : h) : ((m.flags |= 2), p))
                    : ((m.flags |= 1048576), p)
            );
        }
        function o(m) {
            return (e && m.alternate === null && (m.flags |= 2), m);
        }
        function u(m, p, h, g) {
            return p === null || p.tag !== 6
                ? ((p = To(h, m.mode, g)), (p.return = m), p)
                : ((p = l(p, h)), (p.return = m), p);
        }
        function a(m, p, h, g) {
            var x = h.type;
            return x === Dt
                ? d(m, p, h.props.children, g, h.key)
                : p !== null &&
                    (p.elementType === x ||
                        (typeof x == 'object' && x !== null && x.$$typeof === Ze && Is(x) === p.type))
                  ? ((g = l(p, h.props)), (g.ref = An(m, p, h)), (g.return = m), g)
                  : ((g = al(h.type, h.key, h.props, null, m.mode, g)), (g.ref = An(m, p, h)), (g.return = m), g);
        }
        function s(m, p, h, g) {
            return p === null ||
                p.tag !== 4 ||
                p.stateNode.containerInfo !== h.containerInfo ||
                p.stateNode.implementation !== h.implementation
                ? ((p = Lo(h, m.mode, g)), (p.return = m), p)
                : ((p = l(p, h.children || [])), (p.return = m), p);
        }
        function d(m, p, h, g, x) {
            return p === null || p.tag !== 7
                ? ((p = jt(h, m.mode, g, x)), (p.return = m), p)
                : ((p = l(p, h)), (p.return = m), p);
        }
        function f(m, p, h) {
            if ((typeof p == 'string' && p !== '') || typeof p == 'number')
                return ((p = To('' + p, m.mode, h)), (p.return = m), p);
            if (typeof p == 'object' && p !== null) {
                switch (p.$$typeof) {
                    case or:
                        return (
                            (h = al(p.type, p.key, p.props, null, m.mode, h)),
                            (h.ref = An(m, null, p)),
                            (h.return = m),
                            h
                        );
                    case It:
                        return ((p = Lo(p, m.mode, h)), (p.return = m), p);
                    case Ze:
                        var g = p._init;
                        return f(m, g(p._payload), h);
                }
                if (mn(p) || dn(p)) return ((p = jt(p, m.mode, h, null)), (p.return = m), p);
                Ar(m, p);
            }
            return null;
        }
        function c(m, p, h, g) {
            var x = p !== null ? p.key : null;
            if ((typeof h == 'string' && h !== '') || typeof h == 'number')
                return x !== null ? null : u(m, p, '' + h, g);
            if (typeof h == 'object' && h !== null) {
                switch (h.$$typeof) {
                    case or:
                        return h.key === x ? a(m, p, h, g) : null;
                    case It:
                        return h.key === x ? s(m, p, h, g) : null;
                    case Ze:
                        return ((x = h._init), c(m, p, x(h._payload), g));
                }
                if (mn(h) || dn(h)) return x !== null ? null : d(m, p, h, g, null);
                Ar(m, h);
            }
            return null;
        }
        function v(m, p, h, g, x) {
            if ((typeof g == 'string' && g !== '') || typeof g == 'number')
                return ((m = m.get(h) || null), u(p, m, '' + g, x));
            if (typeof g == 'object' && g !== null) {
                switch (g.$$typeof) {
                    case or:
                        return ((m = m.get(g.key === null ? h : g.key) || null), a(p, m, g, x));
                    case It:
                        return ((m = m.get(g.key === null ? h : g.key) || null), s(p, m, g, x));
                    case Ze:
                        var _ = g._init;
                        return v(m, p, h, _(g._payload), x);
                }
                if (mn(g) || dn(g)) return ((m = m.get(h) || null), d(p, m, g, x, null));
                Ar(p, g);
            }
            return null;
        }
        function w(m, p, h, g) {
            for (var x = null, _ = null, C = p, N = (p = 0), W = null; C !== null && N < h.length; N++) {
                C.index > N ? ((W = C), (C = null)) : (W = C.sibling);
                var j = c(m, C, h[N], g);
                if (j === null) {
                    C === null && (C = W);
                    break;
                }
                (e && C && j.alternate === null && t(m, C),
                    (p = i(j, p, N)),
                    _ === null ? (x = j) : (_.sibling = j),
                    (_ = j),
                    (C = W));
            }
            if (N === h.length) return (n(m, C), U && Et(m, N), x);
            if (C === null) {
                for (; N < h.length; N++)
                    ((C = f(m, h[N], g)),
                        C !== null && ((p = i(C, p, N)), _ === null ? (x = C) : (_.sibling = C), (_ = C)));
                return (U && Et(m, N), x);
            }
            for (C = r(m, C); N < h.length; N++)
                ((W = v(C, m, N, h[N], g)),
                    W !== null &&
                        (e && W.alternate !== null && C.delete(W.key === null ? N : W.key),
                        (p = i(W, p, N)),
                        _ === null ? (x = W) : (_.sibling = W),
                        (_ = W)));
            return (
                e &&
                    C.forEach(function (Fe) {
                        return t(m, Fe);
                    }),
                U && Et(m, N),
                x
            );
        }
        function k(m, p, h, g) {
            var x = dn(h);
            if (typeof x != 'function') throw Error(y(150));
            if (((h = x.call(h)), h == null)) throw Error(y(151));
            for (
                var _ = (x = null), C = p, N = (p = 0), W = null, j = h.next();
                C !== null && !j.done;
                N++, j = h.next()
            ) {
                C.index > N ? ((W = C), (C = null)) : (W = C.sibling);
                var Fe = c(m, C, j.value, g);
                if (Fe === null) {
                    C === null && (C = W);
                    break;
                }
                (e && C && Fe.alternate === null && t(m, C),
                    (p = i(Fe, p, N)),
                    _ === null ? (x = Fe) : (_.sibling = Fe),
                    (_ = Fe),
                    (C = W));
            }
            if (j.done) return (n(m, C), U && Et(m, N), x);
            if (C === null) {
                for (; !j.done; N++, j = h.next())
                    ((j = f(m, j.value, g)),
                        j !== null && ((p = i(j, p, N)), _ === null ? (x = j) : (_.sibling = j), (_ = j)));
                return (U && Et(m, N), x);
            }
            for (C = r(m, C); !j.done; N++, j = h.next())
                ((j = v(C, m, N, j.value, g)),
                    j !== null &&
                        (e && j.alternate !== null && C.delete(j.key === null ? N : j.key),
                        (p = i(j, p, N)),
                        _ === null ? (x = j) : (_.sibling = j),
                        (_ = j)));
            return (
                e &&
                    C.forEach(function (er) {
                        return t(m, er);
                    }),
                U && Et(m, N),
                x
            );
        }
        function z(m, p, h, g) {
            if (
                (typeof h == 'object' && h !== null && h.type === Dt && h.key === null && (h = h.props.children),
                typeof h == 'object' && h !== null)
            ) {
                switch (h.$$typeof) {
                    case or:
                        e: {
                            for (var x = h.key, _ = p; _ !== null; ) {
                                if (_.key === x) {
                                    if (((x = h.type), x === Dt)) {
                                        if (_.tag === 7) {
                                            (n(m, _.sibling), (p = l(_, h.props.children)), (p.return = m), (m = p));
                                            break e;
                                        }
                                    } else if (
                                        _.elementType === x ||
                                        (typeof x == 'object' && x !== null && x.$$typeof === Ze && Is(x) === _.type)
                                    ) {
                                        (n(m, _.sibling),
                                            (p = l(_, h.props)),
                                            (p.ref = An(m, _, h)),
                                            (p.return = m),
                                            (m = p));
                                        break e;
                                    }
                                    n(m, _);
                                    break;
                                } else t(m, _);
                                _ = _.sibling;
                            }
                            h.type === Dt
                                ? ((p = jt(h.props.children, m.mode, g, h.key)), (p.return = m), (m = p))
                                : ((g = al(h.type, h.key, h.props, null, m.mode, g)),
                                  (g.ref = An(m, p, h)),
                                  (g.return = m),
                                  (m = g));
                        }
                        return o(m);
                    case It:
                        e: {
                            for (_ = h.key; p !== null; ) {
                                if (p.key === _)
                                    if (
                                        p.tag === 4 &&
                                        p.stateNode.containerInfo === h.containerInfo &&
                                        p.stateNode.implementation === h.implementation
                                    ) {
                                        (n(m, p.sibling), (p = l(p, h.children || [])), (p.return = m), (m = p));
                                        break e;
                                    } else {
                                        n(m, p);
                                        break;
                                    }
                                else t(m, p);
                                p = p.sibling;
                            }
                            ((p = Lo(h, m.mode, g)), (p.return = m), (m = p));
                        }
                        return o(m);
                    case Ze:
                        return ((_ = h._init), z(m, p, _(h._payload), g));
                }
                if (mn(h)) return w(m, p, h, g);
                if (dn(h)) return k(m, p, h, g);
                Ar(m, h);
            }
            return (typeof h == 'string' && h !== '') || typeof h == 'number'
                ? ((h = '' + h),
                  p !== null && p.tag === 6
                      ? (n(m, p.sibling), (p = l(p, h)), (p.return = m), (m = p))
                      : (n(m, p), (p = To(h, m.mode, g)), (p.return = m), (m = p)),
                  o(m))
                : n(m, p);
        }
        return z;
    }
    var en = Ds(!0),
        Us = Ds(!1),
        Br = it(null),
        $r = null,
        tn = null,
        Ui = null;
    function Ai() {
        Ui = tn = $r = null;
    }
    function Bi(e) {
        var t = Br.current;
        (D(Br), (e._currentValue = t));
    }
    function $i(e, t, n) {
        for (; e !== null; ) {
            var r = e.alternate;
            if (
                ((e.childLanes & t) !== t
                    ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
                    : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
                e === n)
            )
                break;
            e = e.return;
        }
    }
    function nn(e, t) {
        (($r = e),
            (Ui = tn = null),
            (e = e.dependencies),
            e !== null && e.firstContext !== null && (e.lanes & t && (fe = !0), (e.firstContext = null)));
    }
    function Ee(e) {
        var t = e._currentValue;
        if (Ui !== e)
            if (((e = { context: e, memoizedValue: t, next: null }), tn === null)) {
                if ($r === null) throw Error(y(308));
                ((tn = e), ($r.dependencies = { lanes: 0, firstContext: e }));
            } else tn = tn.next = e;
        return t;
    }
    var _t = null;
    function Vi(e) {
        _t === null ? (_t = [e]) : _t.push(e);
    }
    function As(e, t, n, r) {
        var l = t.interleaved;
        return (l === null ? ((n.next = n), Vi(t)) : ((n.next = l.next), (l.next = n)), (t.interleaved = n), Ke(e, r));
    }
    function Ke(e, t) {
        e.lanes |= t;
        var n = e.alternate;
        for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
            ((e.childLanes |= t), (n = e.alternate), n !== null && (n.childLanes |= t), (n = e), (e = e.return));
        return n.tag === 3 ? n.stateNode : null;
    }
    var st = !1;
    function Hi(e) {
        e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: { pending: null, interleaved: null, lanes: 0 },
            effects: null
        };
    }
    function Bs(e, t) {
        ((e = e.updateQueue),
            t.updateQueue === e &&
                (t.updateQueue = {
                    baseState: e.baseState,
                    firstBaseUpdate: e.firstBaseUpdate,
                    lastBaseUpdate: e.lastBaseUpdate,
                    shared: e.shared,
                    effects: e.effects
                }));
    }
    function Ge(e, t) {
        return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
    }
    function at(e, t, n) {
        var r = e.updateQueue;
        if (r === null) return null;
        if (((r = r.shared), O & 2)) {
            var l = r.pending;
            return (l === null ? (t.next = t) : ((t.next = l.next), (l.next = t)), (r.pending = t), Ke(e, n));
        }
        return (
            (l = r.interleaved),
            l === null ? ((t.next = t), Vi(r)) : ((t.next = l.next), (l.next = t)),
            (r.interleaved = t),
            Ke(e, n)
        );
    }
    function Vr(e, t, n) {
        if (((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))) {
            var r = t.lanes;
            ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ri(e, n));
        }
    }
    function $s(e, t) {
        var n = e.updateQueue,
            r = e.alternate;
        if (r !== null && ((r = r.updateQueue), n === r)) {
            var l = null,
                i = null;
            if (((n = n.firstBaseUpdate), n !== null)) {
                do {
                    var o = {
                        eventTime: n.eventTime,
                        lane: n.lane,
                        tag: n.tag,
                        payload: n.payload,
                        callback: n.callback,
                        next: null
                    };
                    (i === null ? (l = i = o) : (i = i.next = o), (n = n.next));
                } while (n !== null);
                i === null ? (l = i = t) : (i = i.next = t);
            } else l = i = t;
            ((n = {
                baseState: r.baseState,
                firstBaseUpdate: l,
                lastBaseUpdate: i,
                shared: r.shared,
                effects: r.effects
            }),
                (e.updateQueue = n));
            return;
        }
        ((e = n.lastBaseUpdate), e === null ? (n.firstBaseUpdate = t) : (e.next = t), (n.lastBaseUpdate = t));
    }
    function Hr(e, t, n, r) {
        var l = e.updateQueue;
        st = !1;
        var i = l.firstBaseUpdate,
            o = l.lastBaseUpdate,
            u = l.shared.pending;
        if (u !== null) {
            l.shared.pending = null;
            var a = u,
                s = a.next;
            ((a.next = null), o === null ? (i = s) : (o.next = s), (o = a));
            var d = e.alternate;
            d !== null &&
                ((d = d.updateQueue),
                (u = d.lastBaseUpdate),
                u !== o && (u === null ? (d.firstBaseUpdate = s) : (u.next = s), (d.lastBaseUpdate = a)));
        }
        if (i !== null) {
            var f = l.baseState;
            ((o = 0), (d = s = a = null), (u = i));
            do {
                var c = u.lane,
                    v = u.eventTime;
                if ((r & c) === c) {
                    d !== null &&
                        (d = d.next =
                            {
                                eventTime: v,
                                lane: 0,
                                tag: u.tag,
                                payload: u.payload,
                                callback: u.callback,
                                next: null
                            });
                    e: {
                        var w = e,
                            k = u;
                        switch (((c = t), (v = n), k.tag)) {
                            case 1:
                                if (((w = k.payload), typeof w == 'function')) {
                                    f = w.call(v, f, c);
                                    break e;
                                }
                                f = w;
                                break e;
                            case 3:
                                w.flags = (w.flags & -65537) | 128;
                            case 0:
                                if (((w = k.payload), (c = typeof w == 'function' ? w.call(v, f, c) : w), c == null))
                                    break e;
                                f = A({}, f, c);
                                break e;
                            case 2:
                                st = !0;
                        }
                    }
                    u.callback !== null &&
                        u.lane !== 0 &&
                        ((e.flags |= 64), (c = l.effects), c === null ? (l.effects = [u]) : c.push(u));
                } else
                    ((v = { eventTime: v, lane: c, tag: u.tag, payload: u.payload, callback: u.callback, next: null }),
                        d === null ? ((s = d = v), (a = f)) : (d = d.next = v),
                        (o |= c));
                if (((u = u.next), u === null)) {
                    if (((u = l.shared.pending), u === null)) break;
                    ((c = u), (u = c.next), (c.next = null), (l.lastBaseUpdate = c), (l.shared.pending = null));
                }
            } while (!0);
            if (
                (d === null && (a = f),
                (l.baseState = a),
                (l.firstBaseUpdate = s),
                (l.lastBaseUpdate = d),
                (t = l.shared.interleaved),
                t !== null)
            ) {
                l = t;
                do ((o |= l.lane), (l = l.next));
                while (l !== t);
            } else i === null && (l.shared.lanes = 0);
            ((zt |= o), (e.lanes = o), (e.memoizedState = f));
        }
    }
    function Vs(e, t, n) {
        if (((e = t.effects), (t.effects = null), e !== null))
            for (t = 0; t < e.length; t++) {
                var r = e[t],
                    l = r.callback;
                if (l !== null) {
                    if (((r.callback = null), (r = n), typeof l != 'function')) throw Error(y(191, l));
                    l.call(r);
                }
            }
    }
    var Bn = {},
        De = it(Bn),
        $n = it(Bn),
        Vn = it(Bn);
    function Ct(e) {
        if (e === Bn) throw Error(y(174));
        return e;
    }
    function Wi(e, t) {
        switch ((F(Vn, t), F($n, e), F(De, Bn), (e = t.nodeType), e)) {
            case 9:
            case 11:
                t = (t = t.documentElement) ? t.namespaceURI : Ql(null, '');
                break;
            default:
                ((e = e === 8 ? t.parentNode : t), (t = e.namespaceURI || null), (e = e.tagName), (t = Ql(t, e)));
        }
        (D(De), F(De, t));
    }
    function rn() {
        (D(De), D($n), D(Vn));
    }
    function Hs(e) {
        Ct(Vn.current);
        var t = Ct(De.current),
            n = Ql(t, e.type);
        t !== n && (F($n, e), F(De, n));
    }
    function Qi(e) {
        $n.current === e && (D(De), D($n));
    }
    var B = it(0);
    function Wr(e) {
        for (var t = e; t !== null; ) {
            if (t.tag === 13) {
                var n = t.memoizedState;
                if (n !== null && ((n = n.dehydrated), n === null || n.data === '$?' || n.data === '$!')) return t;
            } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
                if (t.flags & 128) return t;
            } else if (t.child !== null) {
                ((t.child.return = t), (t = t.child));
                continue;
            }
            if (t === e) break;
            for (; t.sibling === null; ) {
                if (t.return === null || t.return === e) return null;
                t = t.return;
            }
            ((t.sibling.return = t.return), (t = t.sibling));
        }
        return null;
    }
    var Ki = [];
    function Gi() {
        for (var e = 0; e < Ki.length; e++) Ki[e]._workInProgressVersionPrimary = null;
        Ki.length = 0;
    }
    var Qr = $e.ReactCurrentDispatcher,
        Yi = $e.ReactCurrentBatchConfig,
        Nt = 0,
        $ = null,
        G = null,
        X = null,
        Kr = !1,
        Hn = !1,
        Wn = 0,
        md = 0;
    function ne() {
        throw Error(y(321));
    }
    function Xi(e, t) {
        if (t === null) return !1;
        for (var n = 0; n < t.length && n < e.length; n++) if (!Pe(e[n], t[n])) return !1;
        return !0;
    }
    function Zi(e, t, n, r, l, i) {
        if (
            ((Nt = i),
            ($ = t),
            (t.memoizedState = null),
            (t.updateQueue = null),
            (t.lanes = 0),
            (Qr.current = e === null || e.memoizedState === null ? yd : wd),
            (e = n(r, l)),
            Hn)
        ) {
            i = 0;
            do {
                if (((Hn = !1), (Wn = 0), 25 <= i)) throw Error(y(301));
                ((i += 1), (X = G = null), (t.updateQueue = null), (Qr.current = kd), (e = n(r, l)));
            } while (Hn);
        }
        if (((Qr.current = Xr), (t = G !== null && G.next !== null), (Nt = 0), (X = G = $ = null), (Kr = !1), t))
            throw Error(y(300));
        return e;
    }
    function Ji() {
        var e = Wn !== 0;
        return ((Wn = 0), e);
    }
    function Ue() {
        var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
        return (X === null ? ($.memoizedState = X = e) : (X = X.next = e), X);
    }
    function _e() {
        if (G === null) {
            var e = $.alternate;
            e = e !== null ? e.memoizedState : null;
        } else e = G.next;
        var t = X === null ? $.memoizedState : X.next;
        if (t !== null) ((X = t), (G = e));
        else {
            if (e === null) throw Error(y(310));
            ((G = e),
                (e = {
                    memoizedState: G.memoizedState,
                    baseState: G.baseState,
                    baseQueue: G.baseQueue,
                    queue: G.queue,
                    next: null
                }),
                X === null ? ($.memoizedState = X = e) : (X = X.next = e));
        }
        return X;
    }
    function Qn(e, t) {
        return typeof t == 'function' ? t(e) : t;
    }
    function qi(e) {
        var t = _e(),
            n = t.queue;
        if (n === null) throw Error(y(311));
        n.lastRenderedReducer = e;
        var r = G,
            l = r.baseQueue,
            i = n.pending;
        if (i !== null) {
            if (l !== null) {
                var o = l.next;
                ((l.next = i.next), (i.next = o));
            }
            ((r.baseQueue = l = i), (n.pending = null));
        }
        if (l !== null) {
            ((i = l.next), (r = r.baseState));
            var u = (o = null),
                a = null,
                s = i;
            do {
                var d = s.lane;
                if ((Nt & d) === d)
                    (a !== null &&
                        (a = a.next =
                            {
                                lane: 0,
                                action: s.action,
                                hasEagerState: s.hasEagerState,
                                eagerState: s.eagerState,
                                next: null
                            }),
                        (r = s.hasEagerState ? s.eagerState : e(r, s.action)));
                else {
                    var f = {
                        lane: d,
                        action: s.action,
                        hasEagerState: s.hasEagerState,
                        eagerState: s.eagerState,
                        next: null
                    };
                    (a === null ? ((u = a = f), (o = r)) : (a = a.next = f), ($.lanes |= d), (zt |= d));
                }
                s = s.next;
            } while (s !== null && s !== i);
            (a === null ? (o = r) : (a.next = u),
                Pe(r, t.memoizedState) || (fe = !0),
                (t.memoizedState = r),
                (t.baseState = o),
                (t.baseQueue = a),
                (n.lastRenderedState = r));
        }
        if (((e = n.interleaved), e !== null)) {
            l = e;
            do ((i = l.lane), ($.lanes |= i), (zt |= i), (l = l.next));
            while (l !== e);
        } else l === null && (n.lanes = 0);
        return [t.memoizedState, n.dispatch];
    }
    function bi(e) {
        var t = _e(),
            n = t.queue;
        if (n === null) throw Error(y(311));
        n.lastRenderedReducer = e;
        var r = n.dispatch,
            l = n.pending,
            i = t.memoizedState;
        if (l !== null) {
            n.pending = null;
            var o = (l = l.next);
            do ((i = e(i, o.action)), (o = o.next));
            while (o !== l);
            (Pe(i, t.memoizedState) || (fe = !0),
                (t.memoizedState = i),
                t.baseQueue === null && (t.baseState = i),
                (n.lastRenderedState = i));
        }
        return [i, r];
    }
    function Ws() {}
    function Qs(e, t) {
        var n = $,
            r = _e(),
            l = t(),
            i = !Pe(r.memoizedState, l);
        if (
            (i && ((r.memoizedState = l), (fe = !0)),
            (r = r.queue),
            eo(Ys.bind(null, n, r, e), [e]),
            r.getSnapshot !== t || i || (X !== null && X.memoizedState.tag & 1))
        ) {
            if (((n.flags |= 2048), Kn(9, Gs.bind(null, n, r, l, t), void 0, null), Z === null)) throw Error(y(349));
            Nt & 30 || Ks(n, t, l);
        }
        return l;
    }
    function Ks(e, t, n) {
        ((e.flags |= 16384),
            (e = { getSnapshot: t, value: n }),
            (t = $.updateQueue),
            t === null
                ? ((t = { lastEffect: null, stores: null }), ($.updateQueue = t), (t.stores = [e]))
                : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
    }
    function Gs(e, t, n, r) {
        ((t.value = n), (t.getSnapshot = r), Xs(t) && Zs(e));
    }
    function Ys(e, t, n) {
        return n(function () {
            Xs(t) && Zs(e);
        });
    }
    function Xs(e) {
        var t = e.getSnapshot;
        e = e.value;
        try {
            var n = t();
            return !Pe(e, n);
        } catch {
            return !0;
        }
    }
    function Zs(e) {
        var t = Ke(e, 1);
        t !== null && Re(t, e, 1, -1);
    }
    function Js(e) {
        var t = Ue();
        return (
            typeof e == 'function' && (e = e()),
            (t.memoizedState = t.baseState = e),
            (e = {
                pending: null,
                interleaved: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: Qn,
                lastRenderedState: e
            }),
            (t.queue = e),
            (e = e.dispatch = gd.bind(null, $, e)),
            [t.memoizedState, e]
        );
    }
    function Kn(e, t, n, r) {
        return (
            (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
            (t = $.updateQueue),
            t === null
                ? ((t = { lastEffect: null, stores: null }), ($.updateQueue = t), (t.lastEffect = e.next = e))
                : ((n = t.lastEffect),
                  n === null
                      ? (t.lastEffect = e.next = e)
                      : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
            e
        );
    }
    function qs() {
        return _e().memoizedState;
    }
    function Gr(e, t, n, r) {
        var l = Ue();
        (($.flags |= e), (l.memoizedState = Kn(1 | t, n, void 0, r === void 0 ? null : r)));
    }
    function Yr(e, t, n, r) {
        var l = _e();
        r = r === void 0 ? null : r;
        var i = void 0;
        if (G !== null) {
            var o = G.memoizedState;
            if (((i = o.destroy), r !== null && Xi(r, o.deps))) {
                l.memoizedState = Kn(t, n, i, r);
                return;
            }
        }
        (($.flags |= e), (l.memoizedState = Kn(1 | t, n, i, r)));
    }
    function bs(e, t) {
        return Gr(8390656, 8, e, t);
    }
    function eo(e, t) {
        return Yr(2048, 8, e, t);
    }
    function ea(e, t) {
        return Yr(4, 2, e, t);
    }
    function ta(e, t) {
        return Yr(4, 4, e, t);
    }
    function na(e, t) {
        if (typeof t == 'function')
            return (
                (e = e()),
                t(e),
                function () {
                    t(null);
                }
            );
        if (t != null)
            return (
                (e = e()),
                (t.current = e),
                function () {
                    t.current = null;
                }
            );
    }
    function ra(e, t, n) {
        return ((n = n != null ? n.concat([e]) : null), Yr(4, 4, na.bind(null, t, e), n));
    }
    function to() {}
    function la(e, t) {
        var n = _e();
        t = t === void 0 ? null : t;
        var r = n.memoizedState;
        return r !== null && t !== null && Xi(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e);
    }
    function ia(e, t) {
        var n = _e();
        t = t === void 0 ? null : t;
        var r = n.memoizedState;
        return r !== null && t !== null && Xi(t, r[1]) ? r[0] : ((e = e()), (n.memoizedState = [e, t]), e);
    }
    function oa(e, t, n) {
        return Nt & 21
            ? (Pe(n, t) || ((n = Iu()), ($.lanes |= n), (zt |= n), (e.baseState = !0)), t)
            : (e.baseState && ((e.baseState = !1), (fe = !0)), (e.memoizedState = n));
    }
    function hd(e, t) {
        var n = R;
        ((R = n !== 0 && 4 > n ? n : 4), e(!0));
        var r = Yi.transition;
        Yi.transition = {};
        try {
            (e(!1), t());
        } finally {
            ((R = n), (Yi.transition = r));
        }
    }
    function ua() {
        return _e().memoizedState;
    }
    function vd(e, t, n) {
        var r = pt(e);
        if (((n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }), sa(e))) aa(t, n);
        else if (((n = As(e, t, n, r)), n !== null)) {
            var l = se();
            (Re(n, e, r, l), ca(n, t, r));
        }
    }
    function gd(e, t, n) {
        var r = pt(e),
            l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
        if (sa(e)) aa(t, l);
        else {
            var i = e.alternate;
            if (e.lanes === 0 && (i === null || i.lanes === 0) && ((i = t.lastRenderedReducer), i !== null))
                try {
                    var o = t.lastRenderedState,
                        u = i(o, n);
                    if (((l.hasEagerState = !0), (l.eagerState = u), Pe(u, o))) {
                        var a = t.interleaved;
                        (a === null ? ((l.next = l), Vi(t)) : ((l.next = a.next), (a.next = l)), (t.interleaved = l));
                        return;
                    }
                } catch {
                } finally {
                }
            ((n = As(e, t, l, r)), n !== null && ((l = se()), Re(n, e, r, l), ca(n, t, r)));
        }
    }
    function sa(e) {
        var t = e.alternate;
        return e === $ || (t !== null && t === $);
    }
    function aa(e, t) {
        Hn = Kr = !0;
        var n = e.pending;
        (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t));
    }
    function ca(e, t, n) {
        if (n & 4194240) {
            var r = t.lanes;
            ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ri(e, n));
        }
    }
    var Xr = {
            readContext: Ee,
            useCallback: ne,
            useContext: ne,
            useEffect: ne,
            useImperativeHandle: ne,
            useInsertionEffect: ne,
            useLayoutEffect: ne,
            useMemo: ne,
            useReducer: ne,
            useRef: ne,
            useState: ne,
            useDebugValue: ne,
            useDeferredValue: ne,
            useTransition: ne,
            useMutableSource: ne,
            useSyncExternalStore: ne,
            useId: ne,
            unstable_isNewReconciler: !1
        },
        yd = {
            readContext: Ee,
            useCallback: function (e, t) {
                return ((Ue().memoizedState = [e, t === void 0 ? null : t]), e);
            },
            useContext: Ee,
            useEffect: bs,
            useImperativeHandle: function (e, t, n) {
                return ((n = n != null ? n.concat([e]) : null), Gr(4194308, 4, na.bind(null, t, e), n));
            },
            useLayoutEffect: function (e, t) {
                return Gr(4194308, 4, e, t);
            },
            useInsertionEffect: function (e, t) {
                return Gr(4, 2, e, t);
            },
            useMemo: function (e, t) {
                var n = Ue();
                return ((t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e);
            },
            useReducer: function (e, t, n) {
                var r = Ue();
                return (
                    (t = n !== void 0 ? n(t) : t),
                    (r.memoizedState = r.baseState = t),
                    (e = {
                        pending: null,
                        interleaved: null,
                        lanes: 0,
                        dispatch: null,
                        lastRenderedReducer: e,
                        lastRenderedState: t
                    }),
                    (r.queue = e),
                    (e = e.dispatch = vd.bind(null, $, e)),
                    [r.memoizedState, e]
                );
            },
            useRef: function (e) {
                var t = Ue();
                return ((e = { current: e }), (t.memoizedState = e));
            },
            useState: Js,
            useDebugValue: to,
            useDeferredValue: function (e) {
                return (Ue().memoizedState = e);
            },
            useTransition: function () {
                var e = Js(!1),
                    t = e[0];
                return ((e = hd.bind(null, e[1])), (Ue().memoizedState = e), [t, e]);
            },
            useMutableSource: function () {},
            useSyncExternalStore: function (e, t, n) {
                var r = $,
                    l = Ue();
                if (U) {
                    if (n === void 0) throw Error(y(407));
                    n = n();
                } else {
                    if (((n = t()), Z === null)) throw Error(y(349));
                    Nt & 30 || Ks(r, t, n);
                }
                l.memoizedState = n;
                var i = { value: n, getSnapshot: t };
                return (
                    (l.queue = i),
                    bs(Ys.bind(null, r, i, e), [e]),
                    (r.flags |= 2048),
                    Kn(9, Gs.bind(null, r, i, n, t), void 0, null),
                    n
                );
            },
            useId: function () {
                var e = Ue(),
                    t = Z.identifierPrefix;
                if (U) {
                    var n = Qe,
                        r = We;
                    ((n = (r & ~(1 << (32 - ze(r) - 1))).toString(32) + n),
                        (t = ':' + t + 'R' + n),
                        (n = Wn++),
                        0 < n && (t += 'H' + n.toString(32)),
                        (t += ':'));
                } else ((n = md++), (t = ':' + t + 'r' + n.toString(32) + ':'));
                return (e.memoizedState = t);
            },
            unstable_isNewReconciler: !1
        },
        wd = {
            readContext: Ee,
            useCallback: la,
            useContext: Ee,
            useEffect: eo,
            useImperativeHandle: ra,
            useInsertionEffect: ea,
            useLayoutEffect: ta,
            useMemo: ia,
            useReducer: qi,
            useRef: qs,
            useState: function () {
                return qi(Qn);
            },
            useDebugValue: to,
            useDeferredValue: function (e) {
                var t = _e();
                return oa(t, G.memoizedState, e);
            },
            useTransition: function () {
                var e = qi(Qn)[0],
                    t = _e().memoizedState;
                return [e, t];
            },
            useMutableSource: Ws,
            useSyncExternalStore: Qs,
            useId: ua,
            unstable_isNewReconciler: !1
        },
        kd = {
            readContext: Ee,
            useCallback: la,
            useContext: Ee,
            useEffect: eo,
            useImperativeHandle: ra,
            useInsertionEffect: ea,
            useLayoutEffect: ta,
            useMemo: ia,
            useReducer: bi,
            useRef: qs,
            useState: function () {
                return bi(Qn);
            },
            useDebugValue: to,
            useDeferredValue: function (e) {
                var t = _e();
                return G === null ? (t.memoizedState = e) : oa(t, G.memoizedState, e);
            },
            useTransition: function () {
                var e = bi(Qn)[0],
                    t = _e().memoizedState;
                return [e, t];
            },
            useMutableSource: Ws,
            useSyncExternalStore: Qs,
            useId: ua,
            unstable_isNewReconciler: !1
        };
    function Le(e, t) {
        if (e && e.defaultProps) {
            ((t = A({}, t)), (e = e.defaultProps));
            for (var n in e) t[n] === void 0 && (t[n] = e[n]);
            return t;
        }
        return t;
    }
    function no(e, t, n, r) {
        ((t = e.memoizedState),
            (n = n(r, t)),
            (n = n == null ? t : A({}, t, n)),
            (e.memoizedState = n),
            e.lanes === 0 && (e.updateQueue.baseState = n));
    }
    var Zr = {
        isMounted: function (e) {
            return (e = e._reactInternals) ? wt(e) === e : !1;
        },
        enqueueSetState: function (e, t, n) {
            e = e._reactInternals;
            var r = se(),
                l = pt(e),
                i = Ge(r, l);
            ((i.payload = t),
                n != null && (i.callback = n),
                (t = at(e, i, l)),
                t !== null && (Re(t, e, l, r), Vr(t, e, l)));
        },
        enqueueReplaceState: function (e, t, n) {
            e = e._reactInternals;
            var r = se(),
                l = pt(e),
                i = Ge(r, l);
            ((i.tag = 1),
                (i.payload = t),
                n != null && (i.callback = n),
                (t = at(e, i, l)),
                t !== null && (Re(t, e, l, r), Vr(t, e, l)));
        },
        enqueueForceUpdate: function (e, t) {
            e = e._reactInternals;
            var n = se(),
                r = pt(e),
                l = Ge(n, r);
            ((l.tag = 2),
                t != null && (l.callback = t),
                (t = at(e, l, r)),
                t !== null && (Re(t, e, r, n), Vr(t, e, r)));
        }
    };
    function fa(e, t, n, r, l, i, o) {
        return (
            (e = e.stateNode),
            typeof e.shouldComponentUpdate == 'function'
                ? e.shouldComponentUpdate(r, i, o)
                : t.prototype && t.prototype.isPureReactComponent
                  ? !On(n, r) || !On(l, i)
                  : !0
        );
    }
    function da(e, t, n) {
        var r = !1,
            l = ot,
            i = t.contextType;
        return (
            typeof i == 'object' && i !== null
                ? (i = Ee(i))
                : ((l = ce(t) ? St : te.current), (r = t.contextTypes), (i = (r = r != null) ? Zt(e, l) : ot)),
            (t = new t(n, i)),
            (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
            (t.updater = Zr),
            (e.stateNode = t),
            (t._reactInternals = e),
            r &&
                ((e = e.stateNode),
                (e.__reactInternalMemoizedUnmaskedChildContext = l),
                (e.__reactInternalMemoizedMaskedChildContext = i)),
            t
        );
    }
    function pa(e, t, n, r) {
        ((e = t.state),
            typeof t.componentWillReceiveProps == 'function' && t.componentWillReceiveProps(n, r),
            typeof t.UNSAFE_componentWillReceiveProps == 'function' && t.UNSAFE_componentWillReceiveProps(n, r),
            t.state !== e && Zr.enqueueReplaceState(t, t.state, null));
    }
    function ro(e, t, n, r) {
        var l = e.stateNode;
        ((l.props = n), (l.state = e.memoizedState), (l.refs = {}), Hi(e));
        var i = t.contextType;
        (typeof i == 'object' && i !== null
            ? (l.context = Ee(i))
            : ((i = ce(t) ? St : te.current), (l.context = Zt(e, i))),
            (l.state = e.memoizedState),
            (i = t.getDerivedStateFromProps),
            typeof i == 'function' && (no(e, t, i, n), (l.state = e.memoizedState)),
            typeof t.getDerivedStateFromProps == 'function' ||
                typeof l.getSnapshotBeforeUpdate == 'function' ||
                (typeof l.UNSAFE_componentWillMount != 'function' && typeof l.componentWillMount != 'function') ||
                ((t = l.state),
                typeof l.componentWillMount == 'function' && l.componentWillMount(),
                typeof l.UNSAFE_componentWillMount == 'function' && l.UNSAFE_componentWillMount(),
                t !== l.state && Zr.enqueueReplaceState(l, l.state, null),
                Hr(e, n, l, r),
                (l.state = e.memoizedState)),
            typeof l.componentDidMount == 'function' && (e.flags |= 4194308));
    }
    function ln(e, t) {
        try {
            var n = '',
                r = t;
            do ((n += Gc(r)), (r = r.return));
            while (r);
            var l = n;
        } catch (i) {
            l =
                `
Error generating stack: ` +
                i.message +
                `
` +
                i.stack;
        }
        return { value: e, source: t, stack: l, digest: null };
    }
    function lo(e, t, n) {
        return { value: e, source: null, stack: n ?? null, digest: t ?? null };
    }
    function io(e, t) {
        try {
            console.error(t.value);
        } catch (n) {
            setTimeout(function () {
                throw n;
            });
        }
    }
    var Sd = typeof WeakMap == 'function' ? WeakMap : Map;
    function ma(e, t, n) {
        ((n = Ge(-1, n)), (n.tag = 3), (n.payload = { element: null }));
        var r = t.value;
        return (
            (n.callback = function () {
                (rl || ((rl = !0), (So = r)), io(e, t));
            }),
            n
        );
    }
    function ha(e, t, n) {
        ((n = Ge(-1, n)), (n.tag = 3));
        var r = e.type.getDerivedStateFromError;
        if (typeof r == 'function') {
            var l = t.value;
            ((n.payload = function () {
                return r(l);
            }),
                (n.callback = function () {
                    io(e, t);
                }));
        }
        var i = e.stateNode;
        return (
            i !== null &&
                typeof i.componentDidCatch == 'function' &&
                (n.callback = function () {
                    (io(e, t), typeof r != 'function' && (ft === null ? (ft = new Set([this])) : ft.add(this)));
                    var o = t.stack;
                    this.componentDidCatch(t.value, { componentStack: o !== null ? o : '' });
                }),
            n
        );
    }
    function va(e, t, n) {
        var r = e.pingCache;
        if (r === null) {
            r = e.pingCache = new Sd();
            var l = new Set();
            r.set(t, l);
        } else ((l = r.get(t)), l === void 0 && ((l = new Set()), r.set(t, l)));
        l.has(n) || (l.add(n), (e = Md.bind(null, e, t, n)), t.then(e, e));
    }
    function ga(e) {
        do {
            var t;
            if (((t = e.tag === 13) && ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)), t))
                return e;
            e = e.return;
        } while (e !== null);
        return null;
    }
    function ya(e, t, n, r, l) {
        return e.mode & 1
            ? ((e.flags |= 65536), (e.lanes = l), e)
            : (e === t
                  ? (e.flags |= 65536)
                  : ((e.flags |= 128),
                    (n.flags |= 131072),
                    (n.flags &= -52805),
                    n.tag === 1 && (n.alternate === null ? (n.tag = 17) : ((t = Ge(-1, 1)), (t.tag = 2), at(n, t, 1))),
                    (n.lanes |= 1)),
              e);
    }
    var xd = $e.ReactCurrentOwner,
        fe = !1;
    function ue(e, t, n, r) {
        t.child = e === null ? Us(t, null, n, r) : en(t, e.child, n, r);
    }
    function wa(e, t, n, r, l) {
        n = n.render;
        var i = t.ref;
        return (
            nn(t, l),
            (r = Zi(e, t, n, r, i, l)),
            (n = Ji()),
            e !== null && !fe
                ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), Ye(e, t, l))
                : (U && n && Ri(t), (t.flags |= 1), ue(e, t, r, l), t.child)
        );
    }
    function ka(e, t, n, r, l) {
        if (e === null) {
            var i = n.type;
            return typeof i == 'function' &&
                !Po(i) &&
                i.defaultProps === void 0 &&
                n.compare === null &&
                n.defaultProps === void 0
                ? ((t.tag = 15), (t.type = i), Sa(e, t, i, r, l))
                : ((e = al(n.type, null, r, t, t.mode, l)), (e.ref = t.ref), (e.return = t), (t.child = e));
        }
        if (((i = e.child), !(e.lanes & l))) {
            var o = i.memoizedProps;
            if (((n = n.compare), (n = n !== null ? n : On), n(o, r) && e.ref === t.ref)) return Ye(e, t, l);
        }
        return ((t.flags |= 1), (e = ht(i, r)), (e.ref = t.ref), (e.return = t), (t.child = e));
    }
    function Sa(e, t, n, r, l) {
        if (e !== null) {
            var i = e.memoizedProps;
            if (On(i, r) && e.ref === t.ref)
                if (((fe = !1), (t.pendingProps = r = i), (e.lanes & l) !== 0)) e.flags & 131072 && (fe = !0);
                else return ((t.lanes = e.lanes), Ye(e, t, l));
        }
        return oo(e, t, n, r, l);
    }
    function xa(e, t, n) {
        var r = t.pendingProps,
            l = r.children,
            i = e !== null ? e.memoizedState : null;
        if (r.mode === 'hidden')
            if (!(t.mode & 1))
                ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }), F(un, we), (we |= n));
            else {
                if (!(n & 1073741824))
                    return (
                        (e = i !== null ? i.baseLanes | n : n),
                        (t.lanes = t.childLanes = 1073741824),
                        (t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }),
                        (t.updateQueue = null),
                        F(un, we),
                        (we |= e),
                        null
                    );
                ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
                    (r = i !== null ? i.baseLanes : n),
                    F(un, we),
                    (we |= r));
            }
        else (i !== null ? ((r = i.baseLanes | n), (t.memoizedState = null)) : (r = n), F(un, we), (we |= r));
        return (ue(e, t, l, n), t.child);
    }
    function Ea(e, t) {
        var n = t.ref;
        ((e === null && n !== null) || (e !== null && e.ref !== n)) && ((t.flags |= 512), (t.flags |= 2097152));
    }
    function oo(e, t, n, r, l) {
        var i = ce(n) ? St : te.current;
        return (
            (i = Zt(t, i)),
            nn(t, l),
            (n = Zi(e, t, n, r, i, l)),
            (r = Ji()),
            e !== null && !fe
                ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), Ye(e, t, l))
                : (U && r && Ri(t), (t.flags |= 1), ue(e, t, n, l), t.child)
        );
    }
    function _a(e, t, n, r, l) {
        if (ce(n)) {
            var i = !0;
            Fr(t);
        } else i = !1;
        if ((nn(t, l), t.stateNode === null)) (qr(e, t), da(t, n, r), ro(t, n, r, l), (r = !0));
        else if (e === null) {
            var o = t.stateNode,
                u = t.memoizedProps;
            o.props = u;
            var a = o.context,
                s = n.contextType;
            typeof s == 'object' && s !== null ? (s = Ee(s)) : ((s = ce(n) ? St : te.current), (s = Zt(t, s)));
            var d = n.getDerivedStateFromProps,
                f = typeof d == 'function' || typeof o.getSnapshotBeforeUpdate == 'function';
            (f ||
                (typeof o.UNSAFE_componentWillReceiveProps != 'function' &&
                    typeof o.componentWillReceiveProps != 'function') ||
                ((u !== r || a !== s) && pa(t, o, r, s)),
                (st = !1));
            var c = t.memoizedState;
            ((o.state = c),
                Hr(t, r, o, l),
                (a = t.memoizedState),
                u !== r || c !== a || ae.current || st
                    ? (typeof d == 'function' && (no(t, n, d, r), (a = t.memoizedState)),
                      (u = st || fa(t, n, u, r, c, a, s))
                          ? (f ||
                                (typeof o.UNSAFE_componentWillMount != 'function' &&
                                    typeof o.componentWillMount != 'function') ||
                                (typeof o.componentWillMount == 'function' && o.componentWillMount(),
                                typeof o.UNSAFE_componentWillMount == 'function' && o.UNSAFE_componentWillMount()),
                            typeof o.componentDidMount == 'function' && (t.flags |= 4194308))
                          : (typeof o.componentDidMount == 'function' && (t.flags |= 4194308),
                            (t.memoizedProps = r),
                            (t.memoizedState = a)),
                      (o.props = r),
                      (o.state = a),
                      (o.context = s),
                      (r = u))
                    : (typeof o.componentDidMount == 'function' && (t.flags |= 4194308), (r = !1)));
        } else {
            ((o = t.stateNode),
                Bs(e, t),
                (u = t.memoizedProps),
                (s = t.type === t.elementType ? u : Le(t.type, u)),
                (o.props = s),
                (f = t.pendingProps),
                (c = o.context),
                (a = n.contextType),
                typeof a == 'object' && a !== null ? (a = Ee(a)) : ((a = ce(n) ? St : te.current), (a = Zt(t, a))));
            var v = n.getDerivedStateFromProps;
            ((d = typeof v == 'function' || typeof o.getSnapshotBeforeUpdate == 'function') ||
                (typeof o.UNSAFE_componentWillReceiveProps != 'function' &&
                    typeof o.componentWillReceiveProps != 'function') ||
                ((u !== f || c !== a) && pa(t, o, r, a)),
                (st = !1),
                (c = t.memoizedState),
                (o.state = c),
                Hr(t, r, o, l));
            var w = t.memoizedState;
            u !== f || c !== w || ae.current || st
                ? (typeof v == 'function' && (no(t, n, v, r), (w = t.memoizedState)),
                  (s = st || fa(t, n, s, r, c, w, a) || !1)
                      ? (d ||
                            (typeof o.UNSAFE_componentWillUpdate != 'function' &&
                                typeof o.componentWillUpdate != 'function') ||
                            (typeof o.componentWillUpdate == 'function' && o.componentWillUpdate(r, w, a),
                            typeof o.UNSAFE_componentWillUpdate == 'function' && o.UNSAFE_componentWillUpdate(r, w, a)),
                        typeof o.componentDidUpdate == 'function' && (t.flags |= 4),
                        typeof o.getSnapshotBeforeUpdate == 'function' && (t.flags |= 1024))
                      : (typeof o.componentDidUpdate != 'function' ||
                            (u === e.memoizedProps && c === e.memoizedState) ||
                            (t.flags |= 4),
                        typeof o.getSnapshotBeforeUpdate != 'function' ||
                            (u === e.memoizedProps && c === e.memoizedState) ||
                            (t.flags |= 1024),
                        (t.memoizedProps = r),
                        (t.memoizedState = w)),
                  (o.props = r),
                  (o.state = w),
                  (o.context = a),
                  (r = s))
                : (typeof o.componentDidUpdate != 'function' ||
                      (u === e.memoizedProps && c === e.memoizedState) ||
                      (t.flags |= 4),
                  typeof o.getSnapshotBeforeUpdate != 'function' ||
                      (u === e.memoizedProps && c === e.memoizedState) ||
                      (t.flags |= 1024),
                  (r = !1));
        }
        return uo(e, t, n, r, i, l);
    }
    function uo(e, t, n, r, l, i) {
        Ea(e, t);
        var o = (t.flags & 128) !== 0;
        if (!r && !o) return (l && Ts(t, n, !1), Ye(e, t, i));
        ((r = t.stateNode), (xd.current = t));
        var u = o && typeof n.getDerivedStateFromError != 'function' ? null : r.render();
        return (
            (t.flags |= 1),
            e !== null && o ? ((t.child = en(t, e.child, null, i)), (t.child = en(t, null, u, i))) : ue(e, t, u, i),
            (t.memoizedState = r.state),
            l && Ts(t, n, !0),
            t.child
        );
    }
    function Ca(e) {
        var t = e.stateNode;
        (t.pendingContext ? zs(e, t.pendingContext, t.pendingContext !== t.context) : t.context && zs(e, t.context, !1),
            Wi(e, t.containerInfo));
    }
    function Na(e, t, n, r, l) {
        return (bt(), Di(l), (t.flags |= 256), ue(e, t, n, r), t.child);
    }
    var so = { dehydrated: null, treeContext: null, retryLane: 0 };
    function ao(e) {
        return { baseLanes: e, cachePool: null, transitions: null };
    }
    function za(e, t, n) {
        var r = t.pendingProps,
            l = B.current,
            i = !1,
            o = (t.flags & 128) !== 0,
            u;
        if (
            ((u = o) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
            u ? ((i = !0), (t.flags &= -129)) : (e === null || e.memoizedState !== null) && (l |= 1),
            F(B, l & 1),
            e === null)
        )
            return (
                Ii(t),
                (e = t.memoizedState),
                e !== null && ((e = e.dehydrated), e !== null)
                    ? (t.mode & 1 ? (e.data === '$!' ? (t.lanes = 8) : (t.lanes = 1073741824)) : (t.lanes = 1), null)
                    : ((o = r.children),
                      (e = r.fallback),
                      i
                          ? ((r = t.mode),
                            (i = t.child),
                            (o = { mode: 'hidden', children: o }),
                            !(r & 1) && i !== null
                                ? ((i.childLanes = 0), (i.pendingProps = o))
                                : (i = cl(o, r, 0, null)),
                            (e = jt(e, r, n, null)),
                            (i.return = t),
                            (e.return = t),
                            (i.sibling = e),
                            (t.child = i),
                            (t.child.memoizedState = ao(n)),
                            (t.memoizedState = so),
                            e)
                          : co(t, o))
            );
        if (((l = e.memoizedState), l !== null && ((u = l.dehydrated), u !== null))) return Ed(e, t, o, r, u, l, n);
        if (i) {
            ((i = r.fallback), (o = t.mode), (l = e.child), (u = l.sibling));
            var a = { mode: 'hidden', children: r.children };
            return (
                !(o & 1) && t.child !== l
                    ? ((r = t.child), (r.childLanes = 0), (r.pendingProps = a), (t.deletions = null))
                    : ((r = ht(l, a)), (r.subtreeFlags = l.subtreeFlags & 14680064)),
                u !== null ? (i = ht(u, i)) : ((i = jt(i, o, n, null)), (i.flags |= 2)),
                (i.return = t),
                (r.return = t),
                (r.sibling = i),
                (t.child = r),
                (r = i),
                (i = t.child),
                (o = e.child.memoizedState),
                (o = o === null ? ao(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }),
                (i.memoizedState = o),
                (i.childLanes = e.childLanes & ~n),
                (t.memoizedState = so),
                r
            );
        }
        return (
            (i = e.child),
            (e = i.sibling),
            (r = ht(i, { mode: 'visible', children: r.children })),
            !(t.mode & 1) && (r.lanes = n),
            (r.return = t),
            (r.sibling = null),
            e !== null && ((n = t.deletions), n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
            (t.child = r),
            (t.memoizedState = null),
            r
        );
    }
    function co(e, t) {
        return ((t = cl({ mode: 'visible', children: t }, e.mode, 0, null)), (t.return = e), (e.child = t));
    }
    function Jr(e, t, n, r) {
        return (
            r !== null && Di(r),
            en(t, e.child, null, n),
            (e = co(t, t.pendingProps.children)),
            (e.flags |= 2),
            (t.memoizedState = null),
            e
        );
    }
    function Ed(e, t, n, r, l, i, o) {
        if (n)
            return t.flags & 256
                ? ((t.flags &= -257), (r = lo(Error(y(422)))), Jr(e, t, o, r))
                : t.memoizedState !== null
                  ? ((t.child = e.child), (t.flags |= 128), null)
                  : ((i = r.fallback),
                    (l = t.mode),
                    (r = cl({ mode: 'visible', children: r.children }, l, 0, null)),
                    (i = jt(i, l, o, null)),
                    (i.flags |= 2),
                    (r.return = t),
                    (i.return = t),
                    (r.sibling = i),
                    (t.child = r),
                    t.mode & 1 && en(t, e.child, null, o),
                    (t.child.memoizedState = ao(o)),
                    (t.memoizedState = so),
                    i);
        if (!(t.mode & 1)) return Jr(e, t, o, null);
        if (l.data === '$!') {
            if (((r = l.nextSibling && l.nextSibling.dataset), r)) var u = r.dgst;
            return ((r = u), (i = Error(y(419))), (r = lo(i, r, void 0)), Jr(e, t, o, r));
        }
        if (((u = (o & e.childLanes) !== 0), fe || u)) {
            if (((r = Z), r !== null)) {
                switch (o & -o) {
                    case 4:
                        l = 2;
                        break;
                    case 16:
                        l = 8;
                        break;
                    case 64:
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
                    case 4194304:
                    case 8388608:
                    case 16777216:
                    case 33554432:
                    case 67108864:
                        l = 32;
                        break;
                    case 536870912:
                        l = 268435456;
                        break;
                    default:
                        l = 0;
                }
                ((l = l & (r.suspendedLanes | o) ? 0 : l),
                    l !== 0 && l !== i.retryLane && ((i.retryLane = l), Ke(e, l), Re(r, e, l, -1)));
            }
            return (zo(), (r = lo(Error(y(421)))), Jr(e, t, o, r));
        }
        return l.data === '$?'
            ? ((t.flags |= 128), (t.child = e.child), (t = Id.bind(null, e)), (l._reactRetry = t), null)
            : ((e = i.treeContext),
              (ye = lt(l.nextSibling)),
              (ge = t),
              (U = !0),
              (Te = null),
              e !== null &&
                  ((Se[xe++] = We), (Se[xe++] = Qe), (Se[xe++] = xt), (We = e.id), (Qe = e.overflow), (xt = t)),
              (t = co(t, r.children)),
              (t.flags |= 4096),
              t);
    }
    function Pa(e, t, n) {
        e.lanes |= t;
        var r = e.alternate;
        (r !== null && (r.lanes |= t), $i(e.return, t, n));
    }
    function fo(e, t, n, r, l) {
        var i = e.memoizedState;
        i === null
            ? (e.memoizedState = {
                  isBackwards: t,
                  rendering: null,
                  renderingStartTime: 0,
                  last: r,
                  tail: n,
                  tailMode: l
              })
            : ((i.isBackwards = t),
              (i.rendering = null),
              (i.renderingStartTime = 0),
              (i.last = r),
              (i.tail = n),
              (i.tailMode = l));
    }
    function Ta(e, t, n) {
        var r = t.pendingProps,
            l = r.revealOrder,
            i = r.tail;
        if ((ue(e, t, r.children, n), (r = B.current), r & 2)) ((r = (r & 1) | 2), (t.flags |= 128));
        else {
            if (e !== null && e.flags & 128)
                e: for (e = t.child; e !== null; ) {
                    if (e.tag === 13) e.memoizedState !== null && Pa(e, n, t);
                    else if (e.tag === 19) Pa(e, n, t);
                    else if (e.child !== null) {
                        ((e.child.return = e), (e = e.child));
                        continue;
                    }
                    if (e === t) break e;
                    for (; e.sibling === null; ) {
                        if (e.return === null || e.return === t) break e;
                        e = e.return;
                    }
                    ((e.sibling.return = e.return), (e = e.sibling));
                }
            r &= 1;
        }
        if ((F(B, r), !(t.mode & 1))) t.memoizedState = null;
        else
            switch (l) {
                case 'forwards':
                    for (n = t.child, l = null; n !== null; )
                        ((e = n.alternate), e !== null && Wr(e) === null && (l = n), (n = n.sibling));
                    ((n = l),
                        n === null ? ((l = t.child), (t.child = null)) : ((l = n.sibling), (n.sibling = null)),
                        fo(t, !1, l, n, i));
                    break;
                case 'backwards':
                    for (n = null, l = t.child, t.child = null; l !== null; ) {
                        if (((e = l.alternate), e !== null && Wr(e) === null)) {
                            t.child = l;
                            break;
                        }
                        ((e = l.sibling), (l.sibling = n), (n = l), (l = e));
                    }
                    fo(t, !0, n, null, i);
                    break;
                case 'together':
                    fo(t, !1, null, null, void 0);
                    break;
                default:
                    t.memoizedState = null;
            }
        return t.child;
    }
    function qr(e, t) {
        !(t.mode & 1) && e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
    }
    function Ye(e, t, n) {
        if ((e !== null && (t.dependencies = e.dependencies), (zt |= t.lanes), !(n & t.childLanes))) return null;
        if (e !== null && t.child !== e.child) throw Error(y(153));
        if (t.child !== null) {
            for (e = t.child, n = ht(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
                ((e = e.sibling), (n = n.sibling = ht(e, e.pendingProps)), (n.return = t));
            n.sibling = null;
        }
        return t.child;
    }
    function _d(e, t, n) {
        switch (t.tag) {
            case 3:
                (Ca(t), bt());
                break;
            case 5:
                Hs(t);
                break;
            case 1:
                ce(t.type) && Fr(t);
                break;
            case 4:
                Wi(t, t.stateNode.containerInfo);
                break;
            case 10:
                var r = t.type._context,
                    l = t.memoizedProps.value;
                (F(Br, r._currentValue), (r._currentValue = l));
                break;
            case 13:
                if (((r = t.memoizedState), r !== null))
                    return r.dehydrated !== null
                        ? (F(B, B.current & 1), (t.flags |= 128), null)
                        : n & t.child.childLanes
                          ? za(e, t, n)
                          : (F(B, B.current & 1), (e = Ye(e, t, n)), e !== null ? e.sibling : null);
                F(B, B.current & 1);
                break;
            case 19:
                if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
                    if (r) return Ta(e, t, n);
                    t.flags |= 128;
                }
                if (
                    ((l = t.memoizedState),
                    l !== null && ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
                    F(B, B.current),
                    r)
                )
                    break;
                return null;
            case 22:
            case 23:
                return ((t.lanes = 0), xa(e, t, n));
        }
        return Ye(e, t, n);
    }
    var La, po, ja, Oa;
    ((La = function (e, t) {
        for (var n = t.child; n !== null; ) {
            if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
            else if (n.tag !== 4 && n.child !== null) {
                ((n.child.return = n), (n = n.child));
                continue;
            }
            if (n === t) break;
            for (; n.sibling === null; ) {
                if (n.return === null || n.return === t) return;
                n = n.return;
            }
            ((n.sibling.return = n.return), (n = n.sibling));
        }
    }),
        (po = function () {}),
        (ja = function (e, t, n, r) {
            var l = e.memoizedProps;
            if (l !== r) {
                ((e = t.stateNode), Ct(De.current));
                var i = null;
                switch (n) {
                    case 'input':
                        ((l = $l(e, l)), (r = $l(e, r)), (i = []));
                        break;
                    case 'select':
                        ((l = A({}, l, { value: void 0 })), (r = A({}, r, { value: void 0 })), (i = []));
                        break;
                    case 'textarea':
                        ((l = Wl(e, l)), (r = Wl(e, r)), (i = []));
                        break;
                    default:
                        typeof l.onClick != 'function' && typeof r.onClick == 'function' && (e.onclick = jr);
                }
                Kl(n, r);
                var o;
                n = null;
                for (s in l)
                    if (!r.hasOwnProperty(s) && l.hasOwnProperty(s) && l[s] != null)
                        if (s === 'style') {
                            var u = l[s];
                            for (o in u) u.hasOwnProperty(o) && (n || (n = {}), (n[o] = ''));
                        } else
                            s !== 'dangerouslySetInnerHTML' &&
                                s !== 'children' &&
                                s !== 'suppressContentEditableWarning' &&
                                s !== 'suppressHydrationWarning' &&
                                s !== 'autoFocus' &&
                                (fn.hasOwnProperty(s) ? i || (i = []) : (i = i || []).push(s, null));
                for (s in r) {
                    var a = r[s];
                    if (((u = l != null ? l[s] : void 0), r.hasOwnProperty(s) && a !== u && (a != null || u != null)))
                        if (s === 'style')
                            if (u) {
                                for (o in u)
                                    !u.hasOwnProperty(o) || (a && a.hasOwnProperty(o)) || (n || (n = {}), (n[o] = ''));
                                for (o in a) a.hasOwnProperty(o) && u[o] !== a[o] && (n || (n = {}), (n[o] = a[o]));
                            } else (n || (i || (i = []), i.push(s, n)), (n = a));
                        else
                            s === 'dangerouslySetInnerHTML'
                                ? ((a = a ? a.__html : void 0),
                                  (u = u ? u.__html : void 0),
                                  a != null && u !== a && (i = i || []).push(s, a))
                                : s === 'children'
                                  ? (typeof a != 'string' && typeof a != 'number') || (i = i || []).push(s, '' + a)
                                  : s !== 'suppressContentEditableWarning' &&
                                    s !== 'suppressHydrationWarning' &&
                                    (fn.hasOwnProperty(s)
                                        ? (a != null && s === 'onScroll' && I('scroll', e), i || u === a || (i = []))
                                        : (i = i || []).push(s, a));
                }
                n && (i = i || []).push('style', n);
                var s = i;
                (t.updateQueue = s) && (t.flags |= 4);
            }
        }),
        (Oa = function (e, t, n, r) {
            n !== r && (t.flags |= 4);
        }));
    function Gn(e, t) {
        if (!U)
            switch (e.tailMode) {
                case 'hidden':
                    t = e.tail;
                    for (var n = null; t !== null; ) (t.alternate !== null && (n = t), (t = t.sibling));
                    n === null ? (e.tail = null) : (n.sibling = null);
                    break;
                case 'collapsed':
                    n = e.tail;
                    for (var r = null; n !== null; ) (n.alternate !== null && (r = n), (n = n.sibling));
                    r === null
                        ? t || e.tail === null
                            ? (e.tail = null)
                            : (e.tail.sibling = null)
                        : (r.sibling = null);
            }
    }
    function re(e) {
        var t = e.alternate !== null && e.alternate.child === e.child,
            n = 0,
            r = 0;
        if (t)
            for (var l = e.child; l !== null; )
                ((n |= l.lanes | l.childLanes),
                    (r |= l.subtreeFlags & 14680064),
                    (r |= l.flags & 14680064),
                    (l.return = e),
                    (l = l.sibling));
        else
            for (l = e.child; l !== null; )
                ((n |= l.lanes | l.childLanes), (r |= l.subtreeFlags), (r |= l.flags), (l.return = e), (l = l.sibling));
        return ((e.subtreeFlags |= r), (e.childLanes = n), t);
    }
    function Cd(e, t, n) {
        var r = t.pendingProps;
        switch ((Fi(t), t.tag)) {
            case 2:
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
                return (re(t), null);
            case 1:
                return (ce(t.type) && Rr(), re(t), null);
            case 3:
                return (
                    (r = t.stateNode),
                    rn(),
                    D(ae),
                    D(te),
                    Gi(),
                    r.pendingContext && ((r.context = r.pendingContext), (r.pendingContext = null)),
                    (e === null || e.child === null) &&
                        (Ur(t)
                            ? (t.flags |= 4)
                            : e === null ||
                              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
                              ((t.flags |= 1024), Te !== null && (_o(Te), (Te = null)))),
                    po(e, t),
                    re(t),
                    null
                );
            case 5:
                Qi(t);
                var l = Ct(Vn.current);
                if (((n = t.type), e !== null && t.stateNode != null))
                    (ja(e, t, n, r, l), e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
                else {
                    if (!r) {
                        if (t.stateNode === null) throw Error(y(166));
                        return (re(t), null);
                    }
                    if (((e = Ct(De.current)), Ur(t))) {
                        ((r = t.stateNode), (n = t.type));
                        var i = t.memoizedProps;
                        switch (((r[Ie] = t), (r[Dn] = i), (e = (t.mode & 1) !== 0), n)) {
                            case 'dialog':
                                (I('cancel', r), I('close', r));
                                break;
                            case 'iframe':
                            case 'object':
                            case 'embed':
                                I('load', r);
                                break;
                            case 'video':
                            case 'audio':
                                for (l = 0; l < Fn.length; l++) I(Fn[l], r);
                                break;
                            case 'source':
                                I('error', r);
                                break;
                            case 'img':
                            case 'image':
                            case 'link':
                                (I('error', r), I('load', r));
                                break;
                            case 'details':
                                I('toggle', r);
                                break;
                            case 'input':
                                (du(r, i), I('invalid', r));
                                break;
                            case 'select':
                                ((r._wrapperState = { wasMultiple: !!i.multiple }), I('invalid', r));
                                break;
                            case 'textarea':
                                (hu(r, i), I('invalid', r));
                        }
                        (Kl(n, i), (l = null));
                        for (var o in i)
                            if (i.hasOwnProperty(o)) {
                                var u = i[o];
                                o === 'children'
                                    ? typeof u == 'string'
                                        ? r.textContent !== u &&
                                          (i.suppressHydrationWarning !== !0 && Lr(r.textContent, u, e),
                                          (l = ['children', u]))
                                        : typeof u == 'number' &&
                                          r.textContent !== '' + u &&
                                          (i.suppressHydrationWarning !== !0 && Lr(r.textContent, u, e),
                                          (l = ['children', '' + u]))
                                    : fn.hasOwnProperty(o) && u != null && o === 'onScroll' && I('scroll', r);
                            }
                        switch (n) {
                            case 'input':
                                (ur(r), mu(r, i, !0));
                                break;
                            case 'textarea':
                                (ur(r), gu(r));
                                break;
                            case 'select':
                            case 'option':
                                break;
                            default:
                                typeof i.onClick == 'function' && (r.onclick = jr);
                        }
                        ((r = l), (t.updateQueue = r), r !== null && (t.flags |= 4));
                    } else {
                        ((o = l.nodeType === 9 ? l : l.ownerDocument),
                            e === 'http://www.w3.org/1999/xhtml' && (e = yu(n)),
                            e === 'http://www.w3.org/1999/xhtml'
                                ? n === 'script'
                                    ? ((e = o.createElement('div')),
                                      (e.innerHTML = '<script><\/script>'),
                                      (e = e.removeChild(e.firstChild)))
                                    : typeof r.is == 'string'
                                      ? (e = o.createElement(n, { is: r.is }))
                                      : ((e = o.createElement(n)),
                                        n === 'select' &&
                                            ((o = e), r.multiple ? (o.multiple = !0) : r.size && (o.size = r.size)))
                                : (e = o.createElementNS(e, n)),
                            (e[Ie] = t),
                            (e[Dn] = r),
                            La(e, t, !1, !1),
                            (t.stateNode = e));
                        e: {
                            switch (((o = Gl(n, r)), n)) {
                                case 'dialog':
                                    (I('cancel', e), I('close', e), (l = r));
                                    break;
                                case 'iframe':
                                case 'object':
                                case 'embed':
                                    (I('load', e), (l = r));
                                    break;
                                case 'video':
                                case 'audio':
                                    for (l = 0; l < Fn.length; l++) I(Fn[l], e);
                                    l = r;
                                    break;
                                case 'source':
                                    (I('error', e), (l = r));
                                    break;
                                case 'img':
                                case 'image':
                                case 'link':
                                    (I('error', e), I('load', e), (l = r));
                                    break;
                                case 'details':
                                    (I('toggle', e), (l = r));
                                    break;
                                case 'input':
                                    (du(e, r), (l = $l(e, r)), I('invalid', e));
                                    break;
                                case 'option':
                                    l = r;
                                    break;
                                case 'select':
                                    ((e._wrapperState = { wasMultiple: !!r.multiple }),
                                        (l = A({}, r, { value: void 0 })),
                                        I('invalid', e));
                                    break;
                                case 'textarea':
                                    (hu(e, r), (l = Wl(e, r)), I('invalid', e));
                                    break;
                                default:
                                    l = r;
                            }
                            (Kl(n, l), (u = l));
                            for (i in u)
                                if (u.hasOwnProperty(i)) {
                                    var a = u[i];
                                    i === 'style'
                                        ? Su(e, a)
                                        : i === 'dangerouslySetInnerHTML'
                                          ? ((a = a ? a.__html : void 0), a != null && wu(e, a))
                                          : i === 'children'
                                            ? typeof a == 'string'
                                                ? (n !== 'textarea' || a !== '') && hn(e, a)
                                                : typeof a == 'number' && hn(e, '' + a)
                                            : i !== 'suppressContentEditableWarning' &&
                                              i !== 'suppressHydrationWarning' &&
                                              i !== 'autoFocus' &&
                                              (fn.hasOwnProperty(i)
                                                  ? a != null && i === 'onScroll' && I('scroll', e)
                                                  : a != null && Ll(e, i, a, o));
                                }
                            switch (n) {
                                case 'input':
                                    (ur(e), mu(e, r, !1));
                                    break;
                                case 'textarea':
                                    (ur(e), gu(e));
                                    break;
                                case 'option':
                                    r.value != null && e.setAttribute('value', '' + Je(r.value));
                                    break;
                                case 'select':
                                    ((e.multiple = !!r.multiple),
                                        (i = r.value),
                                        i != null
                                            ? Ut(e, !!r.multiple, i, !1)
                                            : r.defaultValue != null && Ut(e, !!r.multiple, r.defaultValue, !0));
                                    break;
                                default:
                                    typeof l.onClick == 'function' && (e.onclick = jr);
                            }
                            switch (n) {
                                case 'button':
                                case 'input':
                                case 'select':
                                case 'textarea':
                                    r = !!r.autoFocus;
                                    break e;
                                case 'img':
                                    r = !0;
                                    break e;
                                default:
                                    r = !1;
                            }
                        }
                        r && (t.flags |= 4);
                    }
                    t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
                }
                return (re(t), null);
            case 6:
                if (e && t.stateNode != null) Oa(e, t, e.memoizedProps, r);
                else {
                    if (typeof r != 'string' && t.stateNode === null) throw Error(y(166));
                    if (((n = Ct(Vn.current)), Ct(De.current), Ur(t))) {
                        if (
                            ((r = t.stateNode),
                            (n = t.memoizedProps),
                            (r[Ie] = t),
                            (i = r.nodeValue !== n) && ((e = ge), e !== null))
                        )
                            switch (e.tag) {
                                case 3:
                                    Lr(r.nodeValue, n, (e.mode & 1) !== 0);
                                    break;
                                case 5:
                                    e.memoizedProps.suppressHydrationWarning !== !0 &&
                                        Lr(r.nodeValue, n, (e.mode & 1) !== 0);
                            }
                        i && (t.flags |= 4);
                    } else
                        ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
                            (r[Ie] = t),
                            (t.stateNode = r));
                }
                return (re(t), null);
            case 13:
                if (
                    (D(B),
                    (r = t.memoizedState),
                    e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
                ) {
                    if (U && ye !== null && t.mode & 1 && !(t.flags & 128)) (Ms(), bt(), (t.flags |= 98560), (i = !1));
                    else if (((i = Ur(t)), r !== null && r.dehydrated !== null)) {
                        if (e === null) {
                            if (!i) throw Error(y(318));
                            if (((i = t.memoizedState), (i = i !== null ? i.dehydrated : null), !i))
                                throw Error(y(317));
                            i[Ie] = t;
                        } else (bt(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4));
                        (re(t), (i = !1));
                    } else (Te !== null && (_o(Te), (Te = null)), (i = !0));
                    if (!i) return t.flags & 65536 ? t : null;
                }
                return t.flags & 128
                    ? ((t.lanes = n), t)
                    : ((r = r !== null),
                      r !== (e !== null && e.memoizedState !== null) &&
                          r &&
                          ((t.child.flags |= 8192),
                          t.mode & 1 && (e === null || B.current & 1 ? Y === 0 && (Y = 3) : zo())),
                      t.updateQueue !== null && (t.flags |= 4),
                      re(t),
                      null);
            case 4:
                return (rn(), po(e, t), e === null && Mn(t.stateNode.containerInfo), re(t), null);
            case 10:
                return (Bi(t.type._context), re(t), null);
            case 17:
                return (ce(t.type) && Rr(), re(t), null);
            case 19:
                if ((D(B), (i = t.memoizedState), i === null)) return (re(t), null);
                if (((r = (t.flags & 128) !== 0), (o = i.rendering), o === null))
                    if (r) Gn(i, !1);
                    else {
                        if (Y !== 0 || (e !== null && e.flags & 128))
                            for (e = t.child; e !== null; ) {
                                if (((o = Wr(e)), o !== null)) {
                                    for (
                                        t.flags |= 128,
                                            Gn(i, !1),
                                            r = o.updateQueue,
                                            r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                                            t.subtreeFlags = 0,
                                            r = n,
                                            n = t.child;
                                        n !== null;
                                    )
                                        ((i = n),
                                            (e = r),
                                            (i.flags &= 14680066),
                                            (o = i.alternate),
                                            o === null
                                                ? ((i.childLanes = 0),
                                                  (i.lanes = e),
                                                  (i.child = null),
                                                  (i.subtreeFlags = 0),
                                                  (i.memoizedProps = null),
                                                  (i.memoizedState = null),
                                                  (i.updateQueue = null),
                                                  (i.dependencies = null),
                                                  (i.stateNode = null))
                                                : ((i.childLanes = o.childLanes),
                                                  (i.lanes = o.lanes),
                                                  (i.child = o.child),
                                                  (i.subtreeFlags = 0),
                                                  (i.deletions = null),
                                                  (i.memoizedProps = o.memoizedProps),
                                                  (i.memoizedState = o.memoizedState),
                                                  (i.updateQueue = o.updateQueue),
                                                  (i.type = o.type),
                                                  (e = o.dependencies),
                                                  (i.dependencies =
                                                      e === null
                                                          ? null
                                                          : { lanes: e.lanes, firstContext: e.firstContext })),
                                            (n = n.sibling));
                                    return (F(B, (B.current & 1) | 2), t.child);
                                }
                                e = e.sibling;
                            }
                        i.tail !== null && H() > sn && ((t.flags |= 128), (r = !0), Gn(i, !1), (t.lanes = 4194304));
                    }
                else {
                    if (!r)
                        if (((e = Wr(o)), e !== null)) {
                            if (
                                ((t.flags |= 128),
                                (r = !0),
                                (n = e.updateQueue),
                                n !== null && ((t.updateQueue = n), (t.flags |= 4)),
                                Gn(i, !0),
                                i.tail === null && i.tailMode === 'hidden' && !o.alternate && !U)
                            )
                                return (re(t), null);
                        } else
                            2 * H() - i.renderingStartTime > sn &&
                                n !== 1073741824 &&
                                ((t.flags |= 128), (r = !0), Gn(i, !1), (t.lanes = 4194304));
                    i.isBackwards
                        ? ((o.sibling = t.child), (t.child = o))
                        : ((n = i.last), n !== null ? (n.sibling = o) : (t.child = o), (i.last = o));
                }
                return i.tail !== null
                    ? ((t = i.tail),
                      (i.rendering = t),
                      (i.tail = t.sibling),
                      (i.renderingStartTime = H()),
                      (t.sibling = null),
                      (n = B.current),
                      F(B, r ? (n & 1) | 2 : n & 1),
                      t)
                    : (re(t), null);
            case 22:
            case 23:
                return (
                    No(),
                    (r = t.memoizedState !== null),
                    e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
                    r && t.mode & 1 ? we & 1073741824 && (re(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : re(t),
                    null
                );
            case 24:
                return null;
            case 25:
                return null;
        }
        throw Error(y(156, t.tag));
    }
    function Nd(e, t) {
        switch ((Fi(t), t.tag)) {
            case 1:
                return (ce(t.type) && Rr(), (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
            case 3:
                return (
                    rn(),
                    D(ae),
                    D(te),
                    Gi(),
                    (e = t.flags),
                    e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
                );
            case 5:
                return (Qi(t), null);
            case 13:
                if ((D(B), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
                    if (t.alternate === null) throw Error(y(340));
                    bt();
                }
                return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
            case 19:
                return (D(B), null);
            case 4:
                return (rn(), null);
            case 10:
                return (Bi(t.type._context), null);
            case 22:
            case 23:
                return (No(), null);
            case 24:
                return null;
            default:
                return null;
        }
    }
    var br = !1,
        le = !1,
        zd = typeof WeakSet == 'function' ? WeakSet : Set,
        S = null;
    function on(e, t) {
        var n = e.ref;
        if (n !== null)
            if (typeof n == 'function')
                try {
                    n(null);
                } catch (r) {
                    V(e, t, r);
                }
            else n.current = null;
    }
    function mo(e, t, n) {
        try {
            n();
        } catch (r) {
            V(e, t, r);
        }
    }
    var Ra = !1;
    function Pd(e, t) {
        if (((Ci = wr), (e = fs()), gi(e))) {
            if ('selectionStart' in e) var n = { start: e.selectionStart, end: e.selectionEnd };
            else
                e: {
                    n = ((n = e.ownerDocument) && n.defaultView) || window;
                    var r = n.getSelection && n.getSelection();
                    if (r && r.rangeCount !== 0) {
                        n = r.anchorNode;
                        var l = r.anchorOffset,
                            i = r.focusNode;
                        r = r.focusOffset;
                        try {
                            (n.nodeType, i.nodeType);
                        } catch {
                            n = null;
                            break e;
                        }
                        var o = 0,
                            u = -1,
                            a = -1,
                            s = 0,
                            d = 0,
                            f = e,
                            c = null;
                        t: for (;;) {
                            for (
                                var v;
                                f !== n || (l !== 0 && f.nodeType !== 3) || (u = o + l),
                                    f !== i || (r !== 0 && f.nodeType !== 3) || (a = o + r),
                                    f.nodeType === 3 && (o += f.nodeValue.length),
                                    (v = f.firstChild) !== null;
                            )
                                ((c = f), (f = v));
                            for (;;) {
                                if (f === e) break t;
                                if (
                                    (c === n && ++s === l && (u = o),
                                    c === i && ++d === r && (a = o),
                                    (v = f.nextSibling) !== null)
                                )
                                    break;
                                ((f = c), (c = f.parentNode));
                            }
                            f = v;
                        }
                        n = u === -1 || a === -1 ? null : { start: u, end: a };
                    } else n = null;
                }
            n = n || { start: 0, end: 0 };
        } else n = null;
        for (Ni = { focusedElem: e, selectionRange: n }, wr = !1, S = t; S !== null; )
            if (((t = S), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null)) ((e.return = t), (S = e));
            else
                for (; S !== null; ) {
                    t = S;
                    try {
                        var w = t.alternate;
                        if (t.flags & 1024)
                            switch (t.tag) {
                                case 0:
                                case 11:
                                case 15:
                                    break;
                                case 1:
                                    if (w !== null) {
                                        var k = w.memoizedProps,
                                            z = w.memoizedState,
                                            m = t.stateNode,
                                            p = m.getSnapshotBeforeUpdate(
                                                t.elementType === t.type ? k : Le(t.type, k),
                                                z
                                            );
                                        m.__reactInternalSnapshotBeforeUpdate = p;
                                    }
                                    break;
                                case 3:
                                    var h = t.stateNode.containerInfo;
                                    h.nodeType === 1
                                        ? (h.textContent = '')
                                        : h.nodeType === 9 && h.documentElement && h.removeChild(h.documentElement);
                                    break;
                                case 5:
                                case 6:
                                case 4:
                                case 17:
                                    break;
                                default:
                                    throw Error(y(163));
                            }
                    } catch (g) {
                        V(t, t.return, g);
                    }
                    if (((e = t.sibling), e !== null)) {
                        ((e.return = t.return), (S = e));
                        break;
                    }
                    S = t.return;
                }
        return ((w = Ra), (Ra = !1), w);
    }
    function Yn(e, t, n) {
        var r = t.updateQueue;
        if (((r = r !== null ? r.lastEffect : null), r !== null)) {
            var l = (r = r.next);
            do {
                if ((l.tag & e) === e) {
                    var i = l.destroy;
                    ((l.destroy = void 0), i !== void 0 && mo(t, n, i));
                }
                l = l.next;
            } while (l !== r);
        }
    }
    function el(e, t) {
        if (((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)) {
            var n = (t = t.next);
            do {
                if ((n.tag & e) === e) {
                    var r = n.create;
                    n.destroy = r();
                }
                n = n.next;
            } while (n !== t);
        }
    }
    function ho(e) {
        var t = e.ref;
        if (t !== null) {
            var n = e.stateNode;
            switch (e.tag) {
                case 5:
                    e = n;
                    break;
                default:
                    e = n;
            }
            typeof t == 'function' ? t(e) : (t.current = e);
        }
    }
    function Fa(e) {
        var t = e.alternate;
        (t !== null && ((e.alternate = null), Fa(t)),
            (e.child = null),
            (e.deletions = null),
            (e.sibling = null),
            e.tag === 5 &&
                ((t = e.stateNode),
                t !== null && (delete t[Ie], delete t[Dn], delete t[Li], delete t[cd], delete t[fd])),
            (e.stateNode = null),
            (e.return = null),
            (e.dependencies = null),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.pendingProps = null),
            (e.stateNode = null),
            (e.updateQueue = null));
    }
    function Ma(e) {
        return e.tag === 5 || e.tag === 3 || e.tag === 4;
    }
    function Ia(e) {
        e: for (;;) {
            for (; e.sibling === null; ) {
                if (e.return === null || Ma(e.return)) return null;
                e = e.return;
            }
            for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
                if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
                ((e.child.return = e), (e = e.child));
            }
            if (!(e.flags & 2)) return e.stateNode;
        }
    }
    function vo(e, t, n) {
        var r = e.tag;
        if (r === 5 || r === 6)
            ((e = e.stateNode),
                t
                    ? n.nodeType === 8
                        ? n.parentNode.insertBefore(e, t)
                        : n.insertBefore(e, t)
                    : (n.nodeType === 8 ? ((t = n.parentNode), t.insertBefore(e, n)) : ((t = n), t.appendChild(e)),
                      (n = n._reactRootContainer),
                      n != null || t.onclick !== null || (t.onclick = jr)));
        else if (r !== 4 && ((e = e.child), e !== null))
            for (vo(e, t, n), e = e.sibling; e !== null; ) (vo(e, t, n), (e = e.sibling));
    }
    function go(e, t, n) {
        var r = e.tag;
        if (r === 5 || r === 6) ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
        else if (r !== 4 && ((e = e.child), e !== null))
            for (go(e, t, n), e = e.sibling; e !== null; ) (go(e, t, n), (e = e.sibling));
    }
    var b = null,
        je = !1;
    function ct(e, t, n) {
        for (n = n.child; n !== null; ) (Da(e, t, n), (n = n.sibling));
    }
    function Da(e, t, n) {
        if (Me && typeof Me.onCommitFiberUnmount == 'function')
            try {
                Me.onCommitFiberUnmount(pr, n);
            } catch {}
        switch (n.tag) {
            case 5:
                le || on(n, t);
            case 6:
                var r = b,
                    l = je;
                ((b = null),
                    ct(e, t, n),
                    (b = r),
                    (je = l),
                    b !== null &&
                        (je
                            ? ((e = b),
                              (n = n.stateNode),
                              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
                            : b.removeChild(n.stateNode)));
                break;
            case 18:
                b !== null &&
                    (je
                        ? ((e = b),
                          (n = n.stateNode),
                          e.nodeType === 8 ? Ti(e.parentNode, n) : e.nodeType === 1 && Ti(e, n),
                          Nn(e))
                        : Ti(b, n.stateNode));
                break;
            case 4:
                ((r = b), (l = je), (b = n.stateNode.containerInfo), (je = !0), ct(e, t, n), (b = r), (je = l));
                break;
            case 0:
            case 11:
            case 14:
            case 15:
                if (!le && ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))) {
                    l = r = r.next;
                    do {
                        var i = l,
                            o = i.destroy;
                        ((i = i.tag), o !== void 0 && (i & 2 || i & 4) && mo(n, t, o), (l = l.next));
                    } while (l !== r);
                }
                ct(e, t, n);
                break;
            case 1:
                if (!le && (on(n, t), (r = n.stateNode), typeof r.componentWillUnmount == 'function'))
                    try {
                        ((r.props = n.memoizedProps), (r.state = n.memoizedState), r.componentWillUnmount());
                    } catch (u) {
                        V(n, t, u);
                    }
                ct(e, t, n);
                break;
            case 21:
                ct(e, t, n);
                break;
            case 22:
                n.mode & 1 ? ((le = (r = le) || n.memoizedState !== null), ct(e, t, n), (le = r)) : ct(e, t, n);
                break;
            default:
                ct(e, t, n);
        }
    }
    function Ua(e) {
        var t = e.updateQueue;
        if (t !== null) {
            e.updateQueue = null;
            var n = e.stateNode;
            (n === null && (n = e.stateNode = new zd()),
                t.forEach(function (r) {
                    var l = Dd.bind(null, e, r);
                    n.has(r) || (n.add(r), r.then(l, l));
                }));
        }
    }
    function Oe(e, t) {
        var n = t.deletions;
        if (n !== null)
            for (var r = 0; r < n.length; r++) {
                var l = n[r];
                try {
                    var i = e,
                        o = t,
                        u = o;
                    e: for (; u !== null; ) {
                        switch (u.tag) {
                            case 5:
                                ((b = u.stateNode), (je = !1));
                                break e;
                            case 3:
                                ((b = u.stateNode.containerInfo), (je = !0));
                                break e;
                            case 4:
                                ((b = u.stateNode.containerInfo), (je = !0));
                                break e;
                        }
                        u = u.return;
                    }
                    if (b === null) throw Error(y(160));
                    (Da(i, o, l), (b = null), (je = !1));
                    var a = l.alternate;
                    (a !== null && (a.return = null), (l.return = null));
                } catch (s) {
                    V(l, t, s);
                }
            }
        if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) (Aa(t, e), (t = t.sibling));
    }
    function Aa(e, t) {
        var n = e.alternate,
            r = e.flags;
        switch (e.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                if ((Oe(t, e), Ae(e), r & 4)) {
                    try {
                        (Yn(3, e, e.return), el(3, e));
                    } catch (k) {
                        V(e, e.return, k);
                    }
                    try {
                        Yn(5, e, e.return);
                    } catch (k) {
                        V(e, e.return, k);
                    }
                }
                break;
            case 1:
                (Oe(t, e), Ae(e), r & 512 && n !== null && on(n, n.return));
                break;
            case 5:
                if ((Oe(t, e), Ae(e), r & 512 && n !== null && on(n, n.return), e.flags & 32)) {
                    var l = e.stateNode;
                    try {
                        hn(l, '');
                    } catch (k) {
                        V(e, e.return, k);
                    }
                }
                if (r & 4 && ((l = e.stateNode), l != null)) {
                    var i = e.memoizedProps,
                        o = n !== null ? n.memoizedProps : i,
                        u = e.type,
                        a = e.updateQueue;
                    if (((e.updateQueue = null), a !== null))
                        try {
                            (u === 'input' && i.type === 'radio' && i.name != null && pu(l, i), Gl(u, o));
                            var s = Gl(u, i);
                            for (o = 0; o < a.length; o += 2) {
                                var d = a[o],
                                    f = a[o + 1];
                                d === 'style'
                                    ? Su(l, f)
                                    : d === 'dangerouslySetInnerHTML'
                                      ? wu(l, f)
                                      : d === 'children'
                                        ? hn(l, f)
                                        : Ll(l, d, f, s);
                            }
                            switch (u) {
                                case 'input':
                                    Vl(l, i);
                                    break;
                                case 'textarea':
                                    vu(l, i);
                                    break;
                                case 'select':
                                    var c = l._wrapperState.wasMultiple;
                                    l._wrapperState.wasMultiple = !!i.multiple;
                                    var v = i.value;
                                    v != null
                                        ? Ut(l, !!i.multiple, v, !1)
                                        : c !== !!i.multiple &&
                                          (i.defaultValue != null
                                              ? Ut(l, !!i.multiple, i.defaultValue, !0)
                                              : Ut(l, !!i.multiple, i.multiple ? [] : '', !1));
                            }
                            l[Dn] = i;
                        } catch (k) {
                            V(e, e.return, k);
                        }
                }
                break;
            case 6:
                if ((Oe(t, e), Ae(e), r & 4)) {
                    if (e.stateNode === null) throw Error(y(162));
                    ((l = e.stateNode), (i = e.memoizedProps));
                    try {
                        l.nodeValue = i;
                    } catch (k) {
                        V(e, e.return, k);
                    }
                }
                break;
            case 3:
                if ((Oe(t, e), Ae(e), r & 4 && n !== null && n.memoizedState.isDehydrated))
                    try {
                        Nn(t.containerInfo);
                    } catch (k) {
                        V(e, e.return, k);
                    }
                break;
            case 4:
                (Oe(t, e), Ae(e));
                break;
            case 13:
                (Oe(t, e),
                    Ae(e),
                    (l = e.child),
                    l.flags & 8192 &&
                        ((i = l.memoizedState !== null),
                        (l.stateNode.isHidden = i),
                        !i || (l.alternate !== null && l.alternate.memoizedState !== null) || (ko = H())),
                    r & 4 && Ua(e));
                break;
            case 22:
                if (
                    ((d = n !== null && n.memoizedState !== null),
                    e.mode & 1 ? ((le = (s = le) || d), Oe(t, e), (le = s)) : Oe(t, e),
                    Ae(e),
                    r & 8192)
                ) {
                    if (((s = e.memoizedState !== null), (e.stateNode.isHidden = s) && !d && e.mode & 1))
                        for (S = e, d = e.child; d !== null; ) {
                            for (f = S = d; S !== null; ) {
                                switch (((c = S), (v = c.child), c.tag)) {
                                    case 0:
                                    case 11:
                                    case 14:
                                    case 15:
                                        Yn(4, c, c.return);
                                        break;
                                    case 1:
                                        on(c, c.return);
                                        var w = c.stateNode;
                                        if (typeof w.componentWillUnmount == 'function') {
                                            ((r = c), (n = c.return));
                                            try {
                                                ((t = r),
                                                    (w.props = t.memoizedProps),
                                                    (w.state = t.memoizedState),
                                                    w.componentWillUnmount());
                                            } catch (k) {
                                                V(r, n, k);
                                            }
                                        }
                                        break;
                                    case 5:
                                        on(c, c.return);
                                        break;
                                    case 22:
                                        if (c.memoizedState !== null) {
                                            Va(f);
                                            continue;
                                        }
                                }
                                v !== null ? ((v.return = c), (S = v)) : Va(f);
                            }
                            d = d.sibling;
                        }
                    e: for (d = null, f = e; ; ) {
                        if (f.tag === 5) {
                            if (d === null) {
                                d = f;
                                try {
                                    ((l = f.stateNode),
                                        s
                                            ? ((i = l.style),
                                              typeof i.setProperty == 'function'
                                                  ? i.setProperty('display', 'none', 'important')
                                                  : (i.display = 'none'))
                                            : ((u = f.stateNode),
                                              (a = f.memoizedProps.style),
                                              (o = a != null && a.hasOwnProperty('display') ? a.display : null),
                                              (u.style.display = ku('display', o))));
                                } catch (k) {
                                    V(e, e.return, k);
                                }
                            }
                        } else if (f.tag === 6) {
                            if (d === null)
                                try {
                                    f.stateNode.nodeValue = s ? '' : f.memoizedProps;
                                } catch (k) {
                                    V(e, e.return, k);
                                }
                        } else if (
                            ((f.tag !== 22 && f.tag !== 23) || f.memoizedState === null || f === e) &&
                            f.child !== null
                        ) {
                            ((f.child.return = f), (f = f.child));
                            continue;
                        }
                        if (f === e) break e;
                        for (; f.sibling === null; ) {
                            if (f.return === null || f.return === e) break e;
                            (d === f && (d = null), (f = f.return));
                        }
                        (d === f && (d = null), (f.sibling.return = f.return), (f = f.sibling));
                    }
                }
                break;
            case 19:
                (Oe(t, e), Ae(e), r & 4 && Ua(e));
                break;
            case 21:
                break;
            default:
                (Oe(t, e), Ae(e));
        }
    }
    function Ae(e) {
        var t = e.flags;
        if (t & 2) {
            try {
                e: {
                    for (var n = e.return; n !== null; ) {
                        if (Ma(n)) {
                            var r = n;
                            break e;
                        }
                        n = n.return;
                    }
                    throw Error(y(160));
                }
                switch (r.tag) {
                    case 5:
                        var l = r.stateNode;
                        r.flags & 32 && (hn(l, ''), (r.flags &= -33));
                        var i = Ia(e);
                        go(e, i, l);
                        break;
                    case 3:
                    case 4:
                        var o = r.stateNode.containerInfo,
                            u = Ia(e);
                        vo(e, u, o);
                        break;
                    default:
                        throw Error(y(161));
                }
            } catch (a) {
                V(e, e.return, a);
            }
            e.flags &= -3;
        }
        t & 4096 && (e.flags &= -4097);
    }
    function Td(e, t, n) {
        ((S = e), Ba(e));
    }
    function Ba(e, t, n) {
        for (var r = (e.mode & 1) !== 0; S !== null; ) {
            var l = S,
                i = l.child;
            if (l.tag === 22 && r) {
                var o = l.memoizedState !== null || br;
                if (!o) {
                    var u = l.alternate,
                        a = (u !== null && u.memoizedState !== null) || le;
                    u = br;
                    var s = le;
                    if (((br = o), (le = a) && !s))
                        for (S = l; S !== null; )
                            ((o = S),
                                (a = o.child),
                                o.tag === 22 && o.memoizedState !== null
                                    ? Ha(l)
                                    : a !== null
                                      ? ((a.return = o), (S = a))
                                      : Ha(l));
                    for (; i !== null; ) ((S = i), Ba(i), (i = i.sibling));
                    ((S = l), (br = u), (le = s));
                }
                $a(e);
            } else l.subtreeFlags & 8772 && i !== null ? ((i.return = l), (S = i)) : $a(e);
        }
    }
    function $a(e) {
        for (; S !== null; ) {
            var t = S;
            if (t.flags & 8772) {
                var n = t.alternate;
                try {
                    if (t.flags & 8772)
                        switch (t.tag) {
                            case 0:
                            case 11:
                            case 15:
                                le || el(5, t);
                                break;
                            case 1:
                                var r = t.stateNode;
                                if (t.flags & 4 && !le)
                                    if (n === null) r.componentDidMount();
                                    else {
                                        var l =
                                            t.elementType === t.type ? n.memoizedProps : Le(t.type, n.memoizedProps);
                                        r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
                                    }
                                var i = t.updateQueue;
                                i !== null && Vs(t, i, r);
                                break;
                            case 3:
                                var o = t.updateQueue;
                                if (o !== null) {
                                    if (((n = null), t.child !== null))
                                        switch (t.child.tag) {
                                            case 5:
                                                n = t.child.stateNode;
                                                break;
                                            case 1:
                                                n = t.child.stateNode;
                                        }
                                    Vs(t, o, n);
                                }
                                break;
                            case 5:
                                var u = t.stateNode;
                                if (n === null && t.flags & 4) {
                                    n = u;
                                    var a = t.memoizedProps;
                                    switch (t.type) {
                                        case 'button':
                                        case 'input':
                                        case 'select':
                                        case 'textarea':
                                            a.autoFocus && n.focus();
                                            break;
                                        case 'img':
                                            a.src && (n.src = a.src);
                                    }
                                }
                                break;
                            case 6:
                                break;
                            case 4:
                                break;
                            case 12:
                                break;
                            case 13:
                                if (t.memoizedState === null) {
                                    var s = t.alternate;
                                    if (s !== null) {
                                        var d = s.memoizedState;
                                        if (d !== null) {
                                            var f = d.dehydrated;
                                            f !== null && Nn(f);
                                        }
                                    }
                                }
                                break;
                            case 19:
                            case 17:
                            case 21:
                            case 22:
                            case 23:
                            case 25:
                                break;
                            default:
                                throw Error(y(163));
                        }
                    le || (t.flags & 512 && ho(t));
                } catch (c) {
                    V(t, t.return, c);
                }
            }
            if (t === e) {
                S = null;
                break;
            }
            if (((n = t.sibling), n !== null)) {
                ((n.return = t.return), (S = n));
                break;
            }
            S = t.return;
        }
    }
    function Va(e) {
        for (; S !== null; ) {
            var t = S;
            if (t === e) {
                S = null;
                break;
            }
            var n = t.sibling;
            if (n !== null) {
                ((n.return = t.return), (S = n));
                break;
            }
            S = t.return;
        }
    }
    function Ha(e) {
        for (; S !== null; ) {
            var t = S;
            try {
                switch (t.tag) {
                    case 0:
                    case 11:
                    case 15:
                        var n = t.return;
                        try {
                            el(4, t);
                        } catch (a) {
                            V(t, n, a);
                        }
                        break;
                    case 1:
                        var r = t.stateNode;
                        if (typeof r.componentDidMount == 'function') {
                            var l = t.return;
                            try {
                                r.componentDidMount();
                            } catch (a) {
                                V(t, l, a);
                            }
                        }
                        var i = t.return;
                        try {
                            ho(t);
                        } catch (a) {
                            V(t, i, a);
                        }
                        break;
                    case 5:
                        var o = t.return;
                        try {
                            ho(t);
                        } catch (a) {
                            V(t, o, a);
                        }
                }
            } catch (a) {
                V(t, t.return, a);
            }
            if (t === e) {
                S = null;
                break;
            }
            var u = t.sibling;
            if (u !== null) {
                ((u.return = t.return), (S = u));
                break;
            }
            S = t.return;
        }
    }
    var Ld = Math.ceil,
        tl = $e.ReactCurrentDispatcher,
        yo = $e.ReactCurrentOwner,
        Ce = $e.ReactCurrentBatchConfig,
        O = 0,
        Z = null,
        K = null,
        ee = 0,
        we = 0,
        un = it(0),
        Y = 0,
        Xn = null,
        zt = 0,
        nl = 0,
        wo = 0,
        Zn = null,
        de = null,
        ko = 0,
        sn = 1 / 0,
        Xe = null,
        rl = !1,
        So = null,
        ft = null,
        ll = !1,
        dt = null,
        il = 0,
        Jn = 0,
        xo = null,
        ol = -1,
        ul = 0;
    function se() {
        return O & 6 ? H() : ol !== -1 ? ol : (ol = H());
    }
    function pt(e) {
        return e.mode & 1
            ? O & 2 && ee !== 0
                ? ee & -ee
                : pd.transition !== null
                  ? (ul === 0 && (ul = Iu()), ul)
                  : ((e = R), e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : Qu(e.type))), e)
            : 1;
    }
    function Re(e, t, n, r) {
        if (50 < Jn) throw ((Jn = 0), (xo = null), Error(y(185)));
        (Sn(e, n, r),
            (!(O & 2) || e !== Z) &&
                (e === Z && (!(O & 2) && (nl |= n), Y === 4 && mt(e, ee)),
                pe(e, r),
                n === 1 && O === 0 && !(t.mode & 1) && ((sn = H() + 500), Mr && ut())));
    }
    function pe(e, t) {
        var n = e.callbackNode;
        pf(e, t);
        var r = vr(e, e === Z ? ee : 0);
        if (r === 0) (n !== null && Ru(n), (e.callbackNode = null), (e.callbackPriority = 0));
        else if (((t = r & -r), e.callbackPriority !== t)) {
            if ((n != null && Ru(n), t === 1))
                (e.tag === 0 ? dd(Qa.bind(null, e)) : Ls(Qa.bind(null, e)),
                    sd(function () {
                        !(O & 6) && ut();
                    }),
                    (n = null));
            else {
                switch (Du(r)) {
                    case 1:
                        n = ei;
                        break;
                    case 4:
                        n = Fu;
                        break;
                    case 16:
                        n = dr;
                        break;
                    case 536870912:
                        n = Mu;
                        break;
                    default:
                        n = dr;
                }
                n = ba(n, Wa.bind(null, e));
            }
            ((e.callbackPriority = t), (e.callbackNode = n));
        }
    }
    function Wa(e, t) {
        if (((ol = -1), (ul = 0), O & 6)) throw Error(y(327));
        var n = e.callbackNode;
        if (an() && e.callbackNode !== n) return null;
        var r = vr(e, e === Z ? ee : 0);
        if (r === 0) return null;
        if (r & 30 || r & e.expiredLanes || t) t = sl(e, r);
        else {
            t = r;
            var l = O;
            O |= 2;
            var i = Ga();
            (Z !== e || ee !== t) && ((Xe = null), (sn = H() + 500), Tt(e, t));
            do
                try {
                    Rd();
                    break;
                } catch (u) {
                    Ka(e, u);
                }
            while (!0);
            (Ai(), (tl.current = i), (O = l), K !== null ? (t = 0) : ((Z = null), (ee = 0), (t = Y)));
        }
        if (t !== 0) {
            if ((t === 2 && ((l = ti(e)), l !== 0 && ((r = l), (t = Eo(e, l)))), t === 1))
                throw ((n = Xn), Tt(e, 0), mt(e, r), pe(e, H()), n);
            if (t === 6) mt(e, r);
            else {
                if (
                    ((l = e.current.alternate),
                    !(r & 30) &&
                        !jd(l) &&
                        ((t = sl(e, r)), t === 2 && ((i = ti(e)), i !== 0 && ((r = i), (t = Eo(e, i)))), t === 1))
                )
                    throw ((n = Xn), Tt(e, 0), mt(e, r), pe(e, H()), n);
                switch (((e.finishedWork = l), (e.finishedLanes = r), t)) {
                    case 0:
                    case 1:
                        throw Error(y(345));
                    case 2:
                        Lt(e, de, Xe);
                        break;
                    case 3:
                        if ((mt(e, r), (r & 130023424) === r && ((t = ko + 500 - H()), 10 < t))) {
                            if (vr(e, 0) !== 0) break;
                            if (((l = e.suspendedLanes), (l & r) !== r)) {
                                (se(), (e.pingedLanes |= e.suspendedLanes & l));
                                break;
                            }
                            e.timeoutHandle = Pi(Lt.bind(null, e, de, Xe), t);
                            break;
                        }
                        Lt(e, de, Xe);
                        break;
                    case 4:
                        if ((mt(e, r), (r & 4194240) === r)) break;
                        for (t = e.eventTimes, l = -1; 0 < r; ) {
                            var o = 31 - ze(r);
                            ((i = 1 << o), (o = t[o]), o > l && (l = o), (r &= ~i));
                        }
                        if (
                            ((r = l),
                            (r = H() - r),
                            (r =
                                (120 > r
                                    ? 120
                                    : 480 > r
                                      ? 480
                                      : 1080 > r
                                        ? 1080
                                        : 1920 > r
                                          ? 1920
                                          : 3e3 > r
                                            ? 3e3
                                            : 4320 > r
                                              ? 4320
                                              : 1960 * Ld(r / 1960)) - r),
                            10 < r)
                        ) {
                            e.timeoutHandle = Pi(Lt.bind(null, e, de, Xe), r);
                            break;
                        }
                        Lt(e, de, Xe);
                        break;
                    case 5:
                        Lt(e, de, Xe);
                        break;
                    default:
                        throw Error(y(329));
                }
            }
        }
        return (pe(e, H()), e.callbackNode === n ? Wa.bind(null, e) : null);
    }
    function Eo(e, t) {
        var n = Zn;
        return (
            e.current.memoizedState.isDehydrated && (Tt(e, t).flags |= 256),
            (e = sl(e, t)),
            e !== 2 && ((t = de), (de = n), t !== null && _o(t)),
            e
        );
    }
    function _o(e) {
        de === null ? (de = e) : de.push.apply(de, e);
    }
    function jd(e) {
        for (var t = e; ; ) {
            if (t.flags & 16384) {
                var n = t.updateQueue;
                if (n !== null && ((n = n.stores), n !== null))
                    for (var r = 0; r < n.length; r++) {
                        var l = n[r],
                            i = l.getSnapshot;
                        l = l.value;
                        try {
                            if (!Pe(i(), l)) return !1;
                        } catch {
                            return !1;
                        }
                    }
            }
            if (((n = t.child), t.subtreeFlags & 16384 && n !== null)) ((n.return = t), (t = n));
            else {
                if (t === e) break;
                for (; t.sibling === null; ) {
                    if (t.return === null || t.return === e) return !0;
                    t = t.return;
                }
                ((t.sibling.return = t.return), (t = t.sibling));
            }
        }
        return !0;
    }
    function mt(e, t) {
        for (t &= ~wo, t &= ~nl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
            var n = 31 - ze(t),
                r = 1 << n;
            ((e[n] = -1), (t &= ~r));
        }
    }
    function Qa(e) {
        if (O & 6) throw Error(y(327));
        an();
        var t = vr(e, 0);
        if (!(t & 1)) return (pe(e, H()), null);
        var n = sl(e, t);
        if (e.tag !== 0 && n === 2) {
            var r = ti(e);
            r !== 0 && ((t = r), (n = Eo(e, r)));
        }
        if (n === 1) throw ((n = Xn), Tt(e, 0), mt(e, t), pe(e, H()), n);
        if (n === 6) throw Error(y(345));
        return ((e.finishedWork = e.current.alternate), (e.finishedLanes = t), Lt(e, de, Xe), pe(e, H()), null);
    }
    function Co(e, t) {
        var n = O;
        O |= 1;
        try {
            return e(t);
        } finally {
            ((O = n), O === 0 && ((sn = H() + 500), Mr && ut()));
        }
    }
    function Pt(e) {
        dt !== null && dt.tag === 0 && !(O & 6) && an();
        var t = O;
        O |= 1;
        var n = Ce.transition,
            r = R;
        try {
            if (((Ce.transition = null), (R = 1), e)) return e();
        } finally {
            ((R = r), (Ce.transition = n), (O = t), !(O & 6) && ut());
        }
    }
    function No() {
        ((we = un.current), D(un));
    }
    function Tt(e, t) {
        ((e.finishedWork = null), (e.finishedLanes = 0));
        var n = e.timeoutHandle;
        if ((n !== -1 && ((e.timeoutHandle = -1), ud(n)), K !== null))
            for (n = K.return; n !== null; ) {
                var r = n;
                switch ((Fi(r), r.tag)) {
                    case 1:
                        ((r = r.type.childContextTypes), r != null && Rr());
                        break;
                    case 3:
                        (rn(), D(ae), D(te), Gi());
                        break;
                    case 5:
                        Qi(r);
                        break;
                    case 4:
                        rn();
                        break;
                    case 13:
                        D(B);
                        break;
                    case 19:
                        D(B);
                        break;
                    case 10:
                        Bi(r.type._context);
                        break;
                    case 22:
                    case 23:
                        No();
                }
                n = n.return;
            }
        if (
            ((Z = e),
            (K = e = ht(e.current, null)),
            (ee = we = t),
            (Y = 0),
            (Xn = null),
            (wo = nl = zt = 0),
            (de = Zn = null),
            _t !== null)
        ) {
            for (t = 0; t < _t.length; t++)
                if (((n = _t[t]), (r = n.interleaved), r !== null)) {
                    n.interleaved = null;
                    var l = r.next,
                        i = n.pending;
                    if (i !== null) {
                        var o = i.next;
                        ((i.next = l), (r.next = o));
                    }
                    n.pending = r;
                }
            _t = null;
        }
        return e;
    }
    function Ka(e, t) {
        do {
            var n = K;
            try {
                if ((Ai(), (Qr.current = Xr), Kr)) {
                    for (var r = $.memoizedState; r !== null; ) {
                        var l = r.queue;
                        (l !== null && (l.pending = null), (r = r.next));
                    }
                    Kr = !1;
                }
                if (
                    ((Nt = 0),
                    (X = G = $ = null),
                    (Hn = !1),
                    (Wn = 0),
                    (yo.current = null),
                    n === null || n.return === null)
                ) {
                    ((Y = 1), (Xn = t), (K = null));
                    break;
                }
                e: {
                    var i = e,
                        o = n.return,
                        u = n,
                        a = t;
                    if (
                        ((t = ee),
                        (u.flags |= 32768),
                        a !== null && typeof a == 'object' && typeof a.then == 'function')
                    ) {
                        var s = a,
                            d = u,
                            f = d.tag;
                        if (!(d.mode & 1) && (f === 0 || f === 11 || f === 15)) {
                            var c = d.alternate;
                            c
                                ? ((d.updateQueue = c.updateQueue),
                                  (d.memoizedState = c.memoizedState),
                                  (d.lanes = c.lanes))
                                : ((d.updateQueue = null), (d.memoizedState = null));
                        }
                        var v = ga(o);
                        if (v !== null) {
                            ((v.flags &= -257), ya(v, o, u, i, t), v.mode & 1 && va(i, s, t), (t = v), (a = s));
                            var w = t.updateQueue;
                            if (w === null) {
                                var k = new Set();
                                (k.add(a), (t.updateQueue = k));
                            } else w.add(a);
                            break e;
                        } else {
                            if (!(t & 1)) {
                                (va(i, s, t), zo());
                                break e;
                            }
                            a = Error(y(426));
                        }
                    } else if (U && u.mode & 1) {
                        var z = ga(o);
                        if (z !== null) {
                            (!(z.flags & 65536) && (z.flags |= 256), ya(z, o, u, i, t), Di(ln(a, u)));
                            break e;
                        }
                    }
                    ((i = a = ln(a, u)), Y !== 4 && (Y = 2), Zn === null ? (Zn = [i]) : Zn.push(i), (i = o));
                    do {
                        switch (i.tag) {
                            case 3:
                                ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
                                var m = ma(i, a, t);
                                $s(i, m);
                                break e;
                            case 1:
                                u = a;
                                var p = i.type,
                                    h = i.stateNode;
                                if (
                                    !(i.flags & 128) &&
                                    (typeof p.getDerivedStateFromError == 'function' ||
                                        (h !== null &&
                                            typeof h.componentDidCatch == 'function' &&
                                            (ft === null || !ft.has(h))))
                                ) {
                                    ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
                                    var g = ha(i, u, t);
                                    $s(i, g);
                                    break e;
                                }
                        }
                        i = i.return;
                    } while (i !== null);
                }
                Xa(n);
            } catch (x) {
                ((t = x), K === n && n !== null && (K = n = n.return));
                continue;
            }
            break;
        } while (!0);
    }
    function Ga() {
        var e = tl.current;
        return ((tl.current = Xr), e === null ? Xr : e);
    }
    function zo() {
        ((Y === 0 || Y === 3 || Y === 2) && (Y = 4),
            Z === null || (!(zt & 268435455) && !(nl & 268435455)) || mt(Z, ee));
    }
    function sl(e, t) {
        var n = O;
        O |= 2;
        var r = Ga();
        (Z !== e || ee !== t) && ((Xe = null), Tt(e, t));
        do
            try {
                Od();
                break;
            } catch (l) {
                Ka(e, l);
            }
        while (!0);
        if ((Ai(), (O = n), (tl.current = r), K !== null)) throw Error(y(261));
        return ((Z = null), (ee = 0), Y);
    }
    function Od() {
        for (; K !== null; ) Ya(K);
    }
    function Rd() {
        for (; K !== null && !rf(); ) Ya(K);
    }
    function Ya(e) {
        var t = qa(e.alternate, e, we);
        ((e.memoizedProps = e.pendingProps), t === null ? Xa(e) : (K = t), (yo.current = null));
    }
    function Xa(e) {
        var t = e;
        do {
            var n = t.alternate;
            if (((e = t.return), t.flags & 32768)) {
                if (((n = Nd(n, t)), n !== null)) {
                    ((n.flags &= 32767), (K = n));
                    return;
                }
                if (e !== null) ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
                else {
                    ((Y = 6), (K = null));
                    return;
                }
            } else if (((n = Cd(n, t, we)), n !== null)) {
                K = n;
                return;
            }
            if (((t = t.sibling), t !== null)) {
                K = t;
                return;
            }
            K = t = e;
        } while (t !== null);
        Y === 0 && (Y = 5);
    }
    function Lt(e, t, n) {
        var r = R,
            l = Ce.transition;
        try {
            ((Ce.transition = null), (R = 1), Fd(e, t, n, r));
        } finally {
            ((Ce.transition = l), (R = r));
        }
        return null;
    }
    function Fd(e, t, n, r) {
        do an();
        while (dt !== null);
        if (O & 6) throw Error(y(327));
        n = e.finishedWork;
        var l = e.finishedLanes;
        if (n === null) return null;
        if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current)) throw Error(y(177));
        ((e.callbackNode = null), (e.callbackPriority = 0));
        var i = n.lanes | n.childLanes;
        if (
            (mf(e, i),
            e === Z && ((K = Z = null), (ee = 0)),
            (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
                ll ||
                ((ll = !0),
                ba(dr, function () {
                    return (an(), null);
                })),
            (i = (n.flags & 15990) !== 0),
            n.subtreeFlags & 15990 || i)
        ) {
            ((i = Ce.transition), (Ce.transition = null));
            var o = R;
            R = 1;
            var u = O;
            ((O |= 4),
                (yo.current = null),
                Pd(e, n),
                Aa(n, e),
                ed(Ni),
                (wr = !!Ci),
                (Ni = Ci = null),
                (e.current = n),
                Td(n),
                lf(),
                (O = u),
                (R = o),
                (Ce.transition = i));
        } else e.current = n;
        if (
            (ll && ((ll = !1), (dt = e), (il = l)),
            (i = e.pendingLanes),
            i === 0 && (ft = null),
            sf(n.stateNode),
            pe(e, H()),
            t !== null)
        )
            for (r = e.onRecoverableError, n = 0; n < t.length; n++)
                ((l = t[n]), r(l.value, { componentStack: l.stack, digest: l.digest }));
        if (rl) throw ((rl = !1), (e = So), (So = null), e);
        return (
            il & 1 && e.tag !== 0 && an(),
            (i = e.pendingLanes),
            i & 1 ? (e === xo ? Jn++ : ((Jn = 0), (xo = e))) : (Jn = 0),
            ut(),
            null
        );
    }
    function an() {
        if (dt !== null) {
            var e = Du(il),
                t = Ce.transition,
                n = R;
            try {
                if (((Ce.transition = null), (R = 16 > e ? 16 : e), dt === null)) var r = !1;
                else {
                    if (((e = dt), (dt = null), (il = 0), O & 6)) throw Error(y(331));
                    var l = O;
                    for (O |= 4, S = e.current; S !== null; ) {
                        var i = S,
                            o = i.child;
                        if (S.flags & 16) {
                            var u = i.deletions;
                            if (u !== null) {
                                for (var a = 0; a < u.length; a++) {
                                    var s = u[a];
                                    for (S = s; S !== null; ) {
                                        var d = S;
                                        switch (d.tag) {
                                            case 0:
                                            case 11:
                                            case 15:
                                                Yn(8, d, i);
                                        }
                                        var f = d.child;
                                        if (f !== null) ((f.return = d), (S = f));
                                        else
                                            for (; S !== null; ) {
                                                d = S;
                                                var c = d.sibling,
                                                    v = d.return;
                                                if ((Fa(d), d === s)) {
                                                    S = null;
                                                    break;
                                                }
                                                if (c !== null) {
                                                    ((c.return = v), (S = c));
                                                    break;
                                                }
                                                S = v;
                                            }
                                    }
                                }
                                var w = i.alternate;
                                if (w !== null) {
                                    var k = w.child;
                                    if (k !== null) {
                                        w.child = null;
                                        do {
                                            var z = k.sibling;
                                            ((k.sibling = null), (k = z));
                                        } while (k !== null);
                                    }
                                }
                                S = i;
                            }
                        }
                        if (i.subtreeFlags & 2064 && o !== null) ((o.return = i), (S = o));
                        else
                            e: for (; S !== null; ) {
                                if (((i = S), i.flags & 2048))
                                    switch (i.tag) {
                                        case 0:
                                        case 11:
                                        case 15:
                                            Yn(9, i, i.return);
                                    }
                                var m = i.sibling;
                                if (m !== null) {
                                    ((m.return = i.return), (S = m));
                                    break e;
                                }
                                S = i.return;
                            }
                    }
                    var p = e.current;
                    for (S = p; S !== null; ) {
                        o = S;
                        var h = o.child;
                        if (o.subtreeFlags & 2064 && h !== null) ((h.return = o), (S = h));
                        else
                            e: for (o = p; S !== null; ) {
                                if (((u = S), u.flags & 2048))
                                    try {
                                        switch (u.tag) {
                                            case 0:
                                            case 11:
                                            case 15:
                                                el(9, u);
                                        }
                                    } catch (x) {
                                        V(u, u.return, x);
                                    }
                                if (u === o) {
                                    S = null;
                                    break e;
                                }
                                var g = u.sibling;
                                if (g !== null) {
                                    ((g.return = u.return), (S = g));
                                    break e;
                                }
                                S = u.return;
                            }
                    }
                    if (((O = l), ut(), Me && typeof Me.onPostCommitFiberRoot == 'function'))
                        try {
                            Me.onPostCommitFiberRoot(pr, e);
                        } catch {}
                    r = !0;
                }
                return r;
            } finally {
                ((R = n), (Ce.transition = t));
            }
        }
        return !1;
    }
    function Za(e, t, n) {
        ((t = ln(n, t)), (t = ma(e, t, 1)), (e = at(e, t, 1)), (t = se()), e !== null && (Sn(e, 1, t), pe(e, t)));
    }
    function V(e, t, n) {
        if (e.tag === 3) Za(e, e, n);
        else
            for (; t !== null; ) {
                if (t.tag === 3) {
                    Za(t, e, n);
                    break;
                } else if (t.tag === 1) {
                    var r = t.stateNode;
                    if (
                        typeof t.type.getDerivedStateFromError == 'function' ||
                        (typeof r.componentDidCatch == 'function' && (ft === null || !ft.has(r)))
                    ) {
                        ((e = ln(n, e)),
                            (e = ha(t, e, 1)),
                            (t = at(t, e, 1)),
                            (e = se()),
                            t !== null && (Sn(t, 1, e), pe(t, e)));
                        break;
                    }
                }
                t = t.return;
            }
    }
    function Md(e, t, n) {
        var r = e.pingCache;
        (r !== null && r.delete(t),
            (t = se()),
            (e.pingedLanes |= e.suspendedLanes & n),
            Z === e &&
                (ee & n) === n &&
                (Y === 4 || (Y === 3 && (ee & 130023424) === ee && 500 > H() - ko) ? Tt(e, 0) : (wo |= n)),
            pe(e, t));
    }
    function Ja(e, t) {
        t === 0 && (e.mode & 1 ? ((t = hr), (hr <<= 1), !(hr & 130023424) && (hr = 4194304)) : (t = 1));
        var n = se();
        ((e = Ke(e, t)), e !== null && (Sn(e, t, n), pe(e, n)));
    }
    function Id(e) {
        var t = e.memoizedState,
            n = 0;
        (t !== null && (n = t.retryLane), Ja(e, n));
    }
    function Dd(e, t) {
        var n = 0;
        switch (e.tag) {
            case 13:
                var r = e.stateNode,
                    l = e.memoizedState;
                l !== null && (n = l.retryLane);
                break;
            case 19:
                r = e.stateNode;
                break;
            default:
                throw Error(y(314));
        }
        (r !== null && r.delete(t), Ja(e, n));
    }
    var qa;
    qa = function (e, t, n) {
        if (e !== null)
            if (e.memoizedProps !== t.pendingProps || ae.current) fe = !0;
            else {
                if (!(e.lanes & n) && !(t.flags & 128)) return ((fe = !1), _d(e, t, n));
                fe = !!(e.flags & 131072);
            }
        else ((fe = !1), U && t.flags & 1048576 && js(t, Dr, t.index));
        switch (((t.lanes = 0), t.tag)) {
            case 2:
                var r = t.type;
                (qr(e, t), (e = t.pendingProps));
                var l = Zt(t, te.current);
                (nn(t, n), (l = Zi(null, t, r, e, l, n)));
                var i = Ji();
                return (
                    (t.flags |= 1),
                    typeof l == 'object' && l !== null && typeof l.render == 'function' && l.$$typeof === void 0
                        ? ((t.tag = 1),
                          (t.memoizedState = null),
                          (t.updateQueue = null),
                          ce(r) ? ((i = !0), Fr(t)) : (i = !1),
                          (t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null),
                          Hi(t),
                          (l.updater = Zr),
                          (t.stateNode = l),
                          (l._reactInternals = t),
                          ro(t, r, e, n),
                          (t = uo(null, t, r, !0, i, n)))
                        : ((t.tag = 0), U && i && Ri(t), ue(null, t, l, n), (t = t.child)),
                    t
                );
            case 16:
                r = t.elementType;
                e: {
                    switch (
                        (qr(e, t),
                        (e = t.pendingProps),
                        (l = r._init),
                        (r = l(r._payload)),
                        (t.type = r),
                        (l = t.tag = Ad(r)),
                        (e = Le(r, e)),
                        l)
                    ) {
                        case 0:
                            t = oo(null, t, r, e, n);
                            break e;
                        case 1:
                            t = _a(null, t, r, e, n);
                            break e;
                        case 11:
                            t = wa(null, t, r, e, n);
                            break e;
                        case 14:
                            t = ka(null, t, r, Le(r.type, e), n);
                            break e;
                    }
                    throw Error(y(306, r, ''));
                }
                return t;
            case 0:
                return (
                    (r = t.type),
                    (l = t.pendingProps),
                    (l = t.elementType === r ? l : Le(r, l)),
                    oo(e, t, r, l, n)
                );
            case 1:
                return (
                    (r = t.type),
                    (l = t.pendingProps),
                    (l = t.elementType === r ? l : Le(r, l)),
                    _a(e, t, r, l, n)
                );
            case 3:
                e: {
                    if ((Ca(t), e === null)) throw Error(y(387));
                    ((r = t.pendingProps), (i = t.memoizedState), (l = i.element), Bs(e, t), Hr(t, r, null, n));
                    var o = t.memoizedState;
                    if (((r = o.element), i.isDehydrated))
                        if (
                            ((i = {
                                element: r,
                                isDehydrated: !1,
                                cache: o.cache,
                                pendingSuspenseBoundaries: o.pendingSuspenseBoundaries,
                                transitions: o.transitions
                            }),
                            (t.updateQueue.baseState = i),
                            (t.memoizedState = i),
                            t.flags & 256)
                        ) {
                            ((l = ln(Error(y(423)), t)), (t = Na(e, t, r, n, l)));
                            break e;
                        } else if (r !== l) {
                            ((l = ln(Error(y(424)), t)), (t = Na(e, t, r, n, l)));
                            break e;
                        } else
                            for (
                                ye = lt(t.stateNode.containerInfo.firstChild),
                                    ge = t,
                                    U = !0,
                                    Te = null,
                                    n = Us(t, null, r, n),
                                    t.child = n;
                                n;
                            )
                                ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
                    else {
                        if ((bt(), r === l)) {
                            t = Ye(e, t, n);
                            break e;
                        }
                        ue(e, t, r, n);
                    }
                    t = t.child;
                }
                return t;
            case 5:
                return (
                    Hs(t),
                    e === null && Ii(t),
                    (r = t.type),
                    (l = t.pendingProps),
                    (i = e !== null ? e.memoizedProps : null),
                    (o = l.children),
                    zi(r, l) ? (o = null) : i !== null && zi(r, i) && (t.flags |= 32),
                    Ea(e, t),
                    ue(e, t, o, n),
                    t.child
                );
            case 6:
                return (e === null && Ii(t), null);
            case 13:
                return za(e, t, n);
            case 4:
                return (
                    Wi(t, t.stateNode.containerInfo),
                    (r = t.pendingProps),
                    e === null ? (t.child = en(t, null, r, n)) : ue(e, t, r, n),
                    t.child
                );
            case 11:
                return (
                    (r = t.type),
                    (l = t.pendingProps),
                    (l = t.elementType === r ? l : Le(r, l)),
                    wa(e, t, r, l, n)
                );
            case 7:
                return (ue(e, t, t.pendingProps, n), t.child);
            case 8:
                return (ue(e, t, t.pendingProps.children, n), t.child);
            case 12:
                return (ue(e, t, t.pendingProps.children, n), t.child);
            case 10:
                e: {
                    if (
                        ((r = t.type._context),
                        (l = t.pendingProps),
                        (i = t.memoizedProps),
                        (o = l.value),
                        F(Br, r._currentValue),
                        (r._currentValue = o),
                        i !== null)
                    )
                        if (Pe(i.value, o)) {
                            if (i.children === l.children && !ae.current) {
                                t = Ye(e, t, n);
                                break e;
                            }
                        } else
                            for (i = t.child, i !== null && (i.return = t); i !== null; ) {
                                var u = i.dependencies;
                                if (u !== null) {
                                    o = i.child;
                                    for (var a = u.firstContext; a !== null; ) {
                                        if (a.context === r) {
                                            if (i.tag === 1) {
                                                ((a = Ge(-1, n & -n)), (a.tag = 2));
                                                var s = i.updateQueue;
                                                if (s !== null) {
                                                    s = s.shared;
                                                    var d = s.pending;
                                                    (d === null ? (a.next = a) : ((a.next = d.next), (d.next = a)),
                                                        (s.pending = a));
                                                }
                                            }
                                            ((i.lanes |= n),
                                                (a = i.alternate),
                                                a !== null && (a.lanes |= n),
                                                $i(i.return, n, t),
                                                (u.lanes |= n));
                                            break;
                                        }
                                        a = a.next;
                                    }
                                } else if (i.tag === 10) o = i.type === t.type ? null : i.child;
                                else if (i.tag === 18) {
                                    if (((o = i.return), o === null)) throw Error(y(341));
                                    ((o.lanes |= n),
                                        (u = o.alternate),
                                        u !== null && (u.lanes |= n),
                                        $i(o, n, t),
                                        (o = i.sibling));
                                } else o = i.child;
                                if (o !== null) o.return = i;
                                else
                                    for (o = i; o !== null; ) {
                                        if (o === t) {
                                            o = null;
                                            break;
                                        }
                                        if (((i = o.sibling), i !== null)) {
                                            ((i.return = o.return), (o = i));
                                            break;
                                        }
                                        o = o.return;
                                    }
                                i = o;
                            }
                    (ue(e, t, l.children, n), (t = t.child));
                }
                return t;
            case 9:
                return (
                    (l = t.type),
                    (r = t.pendingProps.children),
                    nn(t, n),
                    (l = Ee(l)),
                    (r = r(l)),
                    (t.flags |= 1),
                    ue(e, t, r, n),
                    t.child
                );
            case 14:
                return ((r = t.type), (l = Le(r, t.pendingProps)), (l = Le(r.type, l)), ka(e, t, r, l, n));
            case 15:
                return Sa(e, t, t.type, t.pendingProps, n);
            case 17:
                return (
                    (r = t.type),
                    (l = t.pendingProps),
                    (l = t.elementType === r ? l : Le(r, l)),
                    qr(e, t),
                    (t.tag = 1),
                    ce(r) ? ((e = !0), Fr(t)) : (e = !1),
                    nn(t, n),
                    da(t, r, l),
                    ro(t, r, l, n),
                    uo(null, t, r, !0, e, n)
                );
            case 19:
                return Ta(e, t, n);
            case 22:
                return xa(e, t, n);
        }
        throw Error(y(156, t.tag));
    };
    function ba(e, t) {
        return Ou(e, t);
    }
    function Ud(e, t, n, r) {
        ((this.tag = e),
            (this.key = n),
            (this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null),
            (this.index = 0),
            (this.ref = null),
            (this.pendingProps = t),
            (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
            (this.mode = r),
            (this.subtreeFlags = this.flags = 0),
            (this.deletions = null),
            (this.childLanes = this.lanes = 0),
            (this.alternate = null));
    }
    function Ne(e, t, n, r) {
        return new Ud(e, t, n, r);
    }
    function Po(e) {
        return ((e = e.prototype), !(!e || !e.isReactComponent));
    }
    function Ad(e) {
        if (typeof e == 'function') return Po(e) ? 1 : 0;
        if (e != null) {
            if (((e = e.$$typeof), e === Rl)) return 11;
            if (e === Il) return 14;
        }
        return 2;
    }
    function ht(e, t) {
        var n = e.alternate;
        return (
            n === null
                ? ((n = Ne(e.tag, t, e.key, e.mode)),
                  (n.elementType = e.elementType),
                  (n.type = e.type),
                  (n.stateNode = e.stateNode),
                  (n.alternate = e),
                  (e.alternate = n))
                : ((n.pendingProps = t), (n.type = e.type), (n.flags = 0), (n.subtreeFlags = 0), (n.deletions = null)),
            (n.flags = e.flags & 14680064),
            (n.childLanes = e.childLanes),
            (n.lanes = e.lanes),
            (n.child = e.child),
            (n.memoizedProps = e.memoizedProps),
            (n.memoizedState = e.memoizedState),
            (n.updateQueue = e.updateQueue),
            (t = e.dependencies),
            (n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
            (n.sibling = e.sibling),
            (n.index = e.index),
            (n.ref = e.ref),
            n
        );
    }
    function al(e, t, n, r, l, i) {
        var o = 2;
        if (((r = e), typeof e == 'function')) Po(e) && (o = 1);
        else if (typeof e == 'string') o = 5;
        else
            e: switch (e) {
                case Dt:
                    return jt(n.children, l, i, t);
                case jl:
                    ((o = 8), (l |= 8));
                    break;
                case Ol:
                    return ((e = Ne(12, n, t, l | 2)), (e.elementType = Ol), (e.lanes = i), e);
                case Fl:
                    return ((e = Ne(13, n, t, l)), (e.elementType = Fl), (e.lanes = i), e);
                case Ml:
                    return ((e = Ne(19, n, t, l)), (e.elementType = Ml), (e.lanes = i), e);
                case su:
                    return cl(n, l, i, t);
                default:
                    if (typeof e == 'object' && e !== null)
                        switch (e.$$typeof) {
                            case ou:
                                o = 10;
                                break e;
                            case uu:
                                o = 9;
                                break e;
                            case Rl:
                                o = 11;
                                break e;
                            case Il:
                                o = 14;
                                break e;
                            case Ze:
                                ((o = 16), (r = null));
                                break e;
                        }
                    throw Error(y(130, e == null ? e : typeof e, ''));
            }
        return ((t = Ne(o, n, t, l)), (t.elementType = e), (t.type = r), (t.lanes = i), t);
    }
    function jt(e, t, n, r) {
        return ((e = Ne(7, e, r, t)), (e.lanes = n), e);
    }
    function cl(e, t, n, r) {
        return ((e = Ne(22, e, r, t)), (e.elementType = su), (e.lanes = n), (e.stateNode = { isHidden: !1 }), e);
    }
    function To(e, t, n) {
        return ((e = Ne(6, e, null, t)), (e.lanes = n), e);
    }
    function Lo(e, t, n) {
        return (
            (t = Ne(4, e.children !== null ? e.children : [], e.key, t)),
            (t.lanes = n),
            (t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }),
            t
        );
    }
    function Bd(e, t, n, r, l) {
        ((this.tag = t),
            (this.containerInfo = e),
            (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
            (this.timeoutHandle = -1),
            (this.callbackNode = this.pendingContext = this.context = null),
            (this.callbackPriority = 0),
            (this.eventTimes = ni(0)),
            (this.expirationTimes = ni(-1)),
            (this.entangledLanes =
                this.finishedLanes =
                this.mutableReadLanes =
                this.expiredLanes =
                this.pingedLanes =
                this.suspendedLanes =
                this.pendingLanes =
                    0),
            (this.entanglements = ni(0)),
            (this.identifierPrefix = r),
            (this.onRecoverableError = l),
            (this.mutableSourceEagerHydrationData = null));
    }
    function jo(e, t, n, r, l, i, o, u, a) {
        return (
            (e = new Bd(e, t, n, u, a)),
            t === 1 ? ((t = 1), i === !0 && (t |= 8)) : (t = 0),
            (i = Ne(3, null, null, t)),
            (e.current = i),
            (i.stateNode = e),
            (i.memoizedState = {
                element: r,
                isDehydrated: n,
                cache: null,
                transitions: null,
                pendingSuspenseBoundaries: null
            }),
            Hi(i),
            e
        );
    }
    function $d(e, t, n) {
        var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
        return { $$typeof: It, key: r == null ? null : '' + r, children: e, containerInfo: t, implementation: n };
    }
    function ec(e) {
        if (!e) return ot;
        e = e._reactInternals;
        e: {
            if (wt(e) !== e || e.tag !== 1) throw Error(y(170));
            var t = e;
            do {
                switch (t.tag) {
                    case 3:
                        t = t.stateNode.context;
                        break e;
                    case 1:
                        if (ce(t.type)) {
                            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
                            break e;
                        }
                }
                t = t.return;
            } while (t !== null);
            throw Error(y(171));
        }
        if (e.tag === 1) {
            var n = e.type;
            if (ce(n)) return Ps(e, n, t);
        }
        return t;
    }
    function tc(e, t, n, r, l, i, o, u, a) {
        return (
            (e = jo(n, r, !0, e, l, i, o, u, a)),
            (e.context = ec(null)),
            (n = e.current),
            (r = se()),
            (l = pt(n)),
            (i = Ge(r, l)),
            (i.callback = t ?? null),
            at(n, i, l),
            (e.current.lanes = l),
            Sn(e, l, r),
            pe(e, r),
            e
        );
    }
    function fl(e, t, n, r) {
        var l = t.current,
            i = se(),
            o = pt(l);
        return (
            (n = ec(n)),
            t.context === null ? (t.context = n) : (t.pendingContext = n),
            (t = Ge(i, o)),
            (t.payload = { element: e }),
            (r = r === void 0 ? null : r),
            r !== null && (t.callback = r),
            (e = at(l, t, o)),
            e !== null && (Re(e, l, o, i), Vr(e, l, o)),
            o
        );
    }
    function dl(e) {
        if (((e = e.current), !e.child)) return null;
        switch (e.child.tag) {
            case 5:
                return e.child.stateNode;
            default:
                return e.child.stateNode;
        }
    }
    function nc(e, t) {
        if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
            var n = e.retryLane;
            e.retryLane = n !== 0 && n < t ? n : t;
        }
    }
    function Oo(e, t) {
        (nc(e, t), (e = e.alternate) && nc(e, t));
    }
    function Vd() {
        return null;
    }
    var rc =
        typeof reportError == 'function'
            ? reportError
            : function (e) {
                  console.error(e);
              };
    function Ro(e) {
        this._internalRoot = e;
    }
    ((pl.prototype.render = Ro.prototype.render =
        function (e) {
            var t = this._internalRoot;
            if (t === null) throw Error(y(409));
            fl(e, t, null, null);
        }),
        (pl.prototype.unmount = Ro.prototype.unmount =
            function () {
                var e = this._internalRoot;
                if (e !== null) {
                    this._internalRoot = null;
                    var t = e.containerInfo;
                    (Pt(function () {
                        fl(null, e, null, null);
                    }),
                        (t[Ve] = null));
                }
            }));
    function pl(e) {
        this._internalRoot = e;
    }
    pl.prototype.unstable_scheduleHydration = function (e) {
        if (e) {
            var t = Bu();
            e = { blockedOn: null, target: e, priority: t };
            for (var n = 0; n < tt.length && t !== 0 && t < tt[n].priority; n++);
            (tt.splice(n, 0, e), n === 0 && Hu(e));
        }
    };
    function Fo(e) {
        return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
    }
    function ml(e) {
        return !(
            !e ||
            (e.nodeType !== 1 &&
                e.nodeType !== 9 &&
                e.nodeType !== 11 &&
                (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
        );
    }
    function lc() {}
    function Hd(e, t, n, r, l) {
        if (l) {
            if (typeof r == 'function') {
                var i = r;
                r = function () {
                    var s = dl(o);
                    i.call(s);
                };
            }
            var o = tc(t, r, e, 0, null, !1, !1, '', lc);
            return ((e._reactRootContainer = o), (e[Ve] = o.current), Mn(e.nodeType === 8 ? e.parentNode : e), Pt(), o);
        }
        for (; (l = e.lastChild); ) e.removeChild(l);
        if (typeof r == 'function') {
            var u = r;
            r = function () {
                var s = dl(a);
                u.call(s);
            };
        }
        var a = jo(e, 0, !1, null, null, !1, !1, '', lc);
        return (
            (e._reactRootContainer = a),
            (e[Ve] = a.current),
            Mn(e.nodeType === 8 ? e.parentNode : e),
            Pt(function () {
                fl(t, a, n, r);
            }),
            a
        );
    }
    function hl(e, t, n, r, l) {
        var i = n._reactRootContainer;
        if (i) {
            var o = i;
            if (typeof l == 'function') {
                var u = l;
                l = function () {
                    var a = dl(o);
                    u.call(a);
                };
            }
            fl(t, o, e, l);
        } else o = Hd(n, t, e, l, r);
        return dl(o);
    }
    ((Uu = function (e) {
        switch (e.tag) {
            case 3:
                var t = e.stateNode;
                if (t.current.memoizedState.isDehydrated) {
                    var n = kn(t.pendingLanes);
                    n !== 0 && (ri(t, n | 1), pe(t, H()), !(O & 6) && ((sn = H() + 500), ut()));
                }
                break;
            case 13:
                (Pt(function () {
                    var r = Ke(e, 1);
                    if (r !== null) {
                        var l = se();
                        Re(r, e, 1, l);
                    }
                }),
                    Oo(e, 1));
        }
    }),
        (li = function (e) {
            if (e.tag === 13) {
                var t = Ke(e, 134217728);
                if (t !== null) {
                    var n = se();
                    Re(t, e, 134217728, n);
                }
                Oo(e, 134217728);
            }
        }),
        (Au = function (e) {
            if (e.tag === 13) {
                var t = pt(e),
                    n = Ke(e, t);
                if (n !== null) {
                    var r = se();
                    Re(n, e, t, r);
                }
                Oo(e, t);
            }
        }),
        (Bu = function () {
            return R;
        }),
        ($u = function (e, t) {
            var n = R;
            try {
                return ((R = e), t());
            } finally {
                R = n;
            }
        }),
        (Zl = function (e, t, n) {
            switch (t) {
                case 'input':
                    if ((Vl(e, n), (t = n.name), n.type === 'radio' && t != null)) {
                        for (n = e; n.parentNode; ) n = n.parentNode;
                        for (
                            n = n.querySelectorAll('input[name=' + JSON.stringify('' + t) + '][type="radio"]'), t = 0;
                            t < n.length;
                            t++
                        ) {
                            var r = n[t];
                            if (r !== e && r.form === e.form) {
                                var l = Or(r);
                                if (!l) throw Error(y(90));
                                (fu(r), Vl(r, l));
                            }
                        }
                    }
                    break;
                case 'textarea':
                    vu(e, n);
                    break;
                case 'select':
                    ((t = n.value), t != null && Ut(e, !!n.multiple, t, !1));
            }
        }),
        (Cu = Co),
        (Nu = Pt));
    var Wd = { usingClientEntryPoint: !1, Events: [Un, Yt, Or, Eu, _u, Co] },
        qn = { findFiberByHostInstance: kt, bundleType: 0, version: '18.3.1', rendererPackageName: 'react-dom' },
        Qd = {
            bundleType: qn.bundleType,
            version: qn.version,
            rendererPackageName: qn.rendererPackageName,
            rendererConfig: qn.rendererConfig,
            overrideHookState: null,
            overrideHookStateDeletePath: null,
            overrideHookStateRenamePath: null,
            overrideProps: null,
            overridePropsDeletePath: null,
            overridePropsRenamePath: null,
            setErrorHandler: null,
            setSuspenseHandler: null,
            scheduleUpdate: null,
            currentDispatcherRef: $e.ReactCurrentDispatcher,
            findHostInstanceByFiber: function (e) {
                return ((e = Lu(e)), e === null ? null : e.stateNode);
            },
            findFiberByHostInstance: qn.findFiberByHostInstance || Vd,
            findHostInstancesForRefresh: null,
            scheduleRefresh: null,
            scheduleRoot: null,
            setRefreshHandler: null,
            getCurrentFiber: null,
            reconcilerVersion: '18.3.1-next-f1338f8080-20240426'
        };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
        var vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!vl.isDisabled && vl.supportsFiber)
            try {
                ((pr = vl.inject(Qd)), (Me = vl));
            } catch {}
    }
    ((me.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Wd),
        (me.createPortal = function (e, t) {
            var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
            if (!Fo(t)) throw Error(y(200));
            return $d(e, t, null, n);
        }),
        (me.createRoot = function (e, t) {
            if (!Fo(e)) throw Error(y(299));
            var n = !1,
                r = '',
                l = rc;
            return (
                t != null &&
                    (t.unstable_strictMode === !0 && (n = !0),
                    t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
                    t.onRecoverableError !== void 0 && (l = t.onRecoverableError)),
                (t = jo(e, 1, !1, null, null, n, !1, r, l)),
                (e[Ve] = t.current),
                Mn(e.nodeType === 8 ? e.parentNode : e),
                new Ro(t)
            );
        }),
        (me.findDOMNode = function (e) {
            if (e == null) return null;
            if (e.nodeType === 1) return e;
            var t = e._reactInternals;
            if (t === void 0)
                throw typeof e.render == 'function'
                    ? Error(y(188))
                    : ((e = Object.keys(e).join(',')), Error(y(268, e)));
            return ((e = Lu(t)), (e = e === null ? null : e.stateNode), e);
        }),
        (me.flushSync = function (e) {
            return Pt(e);
        }),
        (me.hydrate = function (e, t, n) {
            if (!ml(t)) throw Error(y(200));
            return hl(null, e, t, !0, n);
        }),
        (me.hydrateRoot = function (e, t, n) {
            if (!Fo(e)) throw Error(y(405));
            var r = (n != null && n.hydratedSources) || null,
                l = !1,
                i = '',
                o = rc;
            if (
                (n != null &&
                    (n.unstable_strictMode === !0 && (l = !0),
                    n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
                    n.onRecoverableError !== void 0 && (o = n.onRecoverableError)),
                (t = tc(t, null, e, 1, n ?? null, l, !1, i, o)),
                (e[Ve] = t.current),
                Mn(e),
                r)
            )
                for (e = 0; e < r.length; e++)
                    ((n = r[e]),
                        (l = n._getVersion),
                        (l = l(n._source)),
                        t.mutableSourceEagerHydrationData == null
                            ? (t.mutableSourceEagerHydrationData = [n, l])
                            : t.mutableSourceEagerHydrationData.push(n, l));
            return new pl(t);
        }),
        (me.render = function (e, t, n) {
            if (!ml(t)) throw Error(y(200));
            return hl(null, e, t, !1, n);
        }),
        (me.unmountComponentAtNode = function (e) {
            if (!ml(e)) throw Error(y(40));
            return e._reactRootContainer
                ? (Pt(function () {
                      hl(null, null, e, !1, function () {
                          ((e._reactRootContainer = null), (e[Ve] = null));
                      });
                  }),
                  !0)
                : !1;
        }),
        (me.unstable_batchedUpdates = Co),
        (me.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
            if (!ml(n)) throw Error(y(200));
            if (e == null || e._reactInternals === void 0) throw Error(y(38));
            return hl(e, t, n, !1, r);
        }),
        (me.version = '18.3.1-next-f1338f8080-20240426'));
    function ic() {
        if (
            !(
                typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
                typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
            )
        )
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ic);
            } catch (e) {
                console.error(e);
            }
    }
    (ic(), (eu.exports = me));
    var Kd = eu.exports,
        oc,
        uc = Kd;
    ((oc = uc.createRoot), uc.hydrateRoot);
    var sc = { exports: {} },
        ac = { exports: {} };
    (function () {
        var e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
            t = {
                rotl: function (n, r) {
                    return (n << r) | (n >>> (32 - r));
                },
                rotr: function (n, r) {
                    return (n << (32 - r)) | (n >>> r);
                },
                endian: function (n) {
                    if (n.constructor == Number) return (t.rotl(n, 8) & 16711935) | (t.rotl(n, 24) & 4278255360);
                    for (var r = 0; r < n.length; r++) n[r] = t.endian(n[r]);
                    return n;
                },
                randomBytes: function (n) {
                    for (var r = []; n > 0; n--) r.push(Math.floor(Math.random() * 256));
                    return r;
                },
                bytesToWords: function (n) {
                    for (var r = [], l = 0, i = 0; l < n.length; l++, i += 8) r[i >>> 5] |= n[l] << (24 - (i % 32));
                    return r;
                },
                wordsToBytes: function (n) {
                    for (var r = [], l = 0; l < n.length * 32; l += 8) r.push((n[l >>> 5] >>> (24 - (l % 32))) & 255);
                    return r;
                },
                bytesToHex: function (n) {
                    for (var r = [], l = 0; l < n.length; l++)
                        (r.push((n[l] >>> 4).toString(16)), r.push((n[l] & 15).toString(16)));
                    return r.join('');
                },
                hexToBytes: function (n) {
                    for (var r = [], l = 0; l < n.length; l += 2) r.push(parseInt(n.substr(l, 2), 16));
                    return r;
                },
                bytesToBase64: function (n) {
                    for (var r = [], l = 0; l < n.length; l += 3)
                        for (var i = (n[l] << 16) | (n[l + 1] << 8) | n[l + 2], o = 0; o < 4; o++)
                            l * 8 + o * 6 <= n.length * 8 ? r.push(e.charAt((i >>> (6 * (3 - o))) & 63)) : r.push('=');
                    return r.join('');
                },
                base64ToBytes: function (n) {
                    n = n.replace(/[^A-Z0-9+\/]/gi, '');
                    for (var r = [], l = 0, i = 0; l < n.length; i = ++l % 4)
                        i != 0 &&
                            r.push(
                                ((e.indexOf(n.charAt(l - 1)) & (Math.pow(2, -2 * i + 8) - 1)) << (i * 2)) |
                                    (e.indexOf(n.charAt(l)) >>> (6 - i * 2))
                            );
                    return r;
                }
            };
        ac.exports = t;
    })();
    var Gd = ac.exports,
        Mo = {
            utf8: {
                stringToBytes: function (e) {
                    return Mo.bin.stringToBytes(unescape(encodeURIComponent(e)));
                },
                bytesToString: function (e) {
                    return decodeURIComponent(escape(Mo.bin.bytesToString(e)));
                }
            },
            bin: {
                stringToBytes: function (e) {
                    for (var t = [], n = 0; n < e.length; n++) t.push(e.charCodeAt(n) & 255);
                    return t;
                },
                bytesToString: function (e) {
                    for (var t = [], n = 0; n < e.length; n++) t.push(String.fromCharCode(e[n]));
                    return t.join('');
                }
            }
        },
        cc = Mo;
    /*!
     * Determine if an object is a Buffer
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */ var Yd = function (e) {
        return e != null && (fc(e) || Xd(e) || !!e._isBuffer);
    };
    function fc(e) {
        return !!e.constructor && typeof e.constructor.isBuffer == 'function' && e.constructor.isBuffer(e);
    }
    function Xd(e) {
        return typeof e.readFloatLE == 'function' && typeof e.slice == 'function' && fc(e.slice(0, 0));
    }
    (function () {
        var e = Gd,
            t = cc.utf8,
            n = Yd,
            r = cc.bin,
            l = function (i, o) {
                i.constructor == String
                    ? o && o.encoding === 'binary'
                        ? (i = r.stringToBytes(i))
                        : (i = t.stringToBytes(i))
                    : n(i)
                      ? (i = Array.prototype.slice.call(i, 0))
                      : !Array.isArray(i) && i.constructor !== Uint8Array && (i = i.toString());
                for (
                    var u = e.bytesToWords(i),
                        a = i.length * 8,
                        s = 1732584193,
                        d = -271733879,
                        f = -1732584194,
                        c = 271733878,
                        v = 0;
                    v < u.length;
                    v++
                )
                    u[v] = (((u[v] << 8) | (u[v] >>> 24)) & 16711935) | (((u[v] << 24) | (u[v] >>> 8)) & 4278255360);
                ((u[a >>> 5] |= 128 << (a % 32)), (u[(((a + 64) >>> 9) << 4) + 14] = a));
                for (var w = l._ff, k = l._gg, z = l._hh, m = l._ii, v = 0; v < u.length; v += 16) {
                    var p = s,
                        h = d,
                        g = f,
                        x = c;
                    ((s = w(s, d, f, c, u[v + 0], 7, -680876936)),
                        (c = w(c, s, d, f, u[v + 1], 12, -389564586)),
                        (f = w(f, c, s, d, u[v + 2], 17, 606105819)),
                        (d = w(d, f, c, s, u[v + 3], 22, -1044525330)),
                        (s = w(s, d, f, c, u[v + 4], 7, -176418897)),
                        (c = w(c, s, d, f, u[v + 5], 12, 1200080426)),
                        (f = w(f, c, s, d, u[v + 6], 17, -1473231341)),
                        (d = w(d, f, c, s, u[v + 7], 22, -45705983)),
                        (s = w(s, d, f, c, u[v + 8], 7, 1770035416)),
                        (c = w(c, s, d, f, u[v + 9], 12, -1958414417)),
                        (f = w(f, c, s, d, u[v + 10], 17, -42063)),
                        (d = w(d, f, c, s, u[v + 11], 22, -1990404162)),
                        (s = w(s, d, f, c, u[v + 12], 7, 1804603682)),
                        (c = w(c, s, d, f, u[v + 13], 12, -40341101)),
                        (f = w(f, c, s, d, u[v + 14], 17, -1502002290)),
                        (d = w(d, f, c, s, u[v + 15], 22, 1236535329)),
                        (s = k(s, d, f, c, u[v + 1], 5, -165796510)),
                        (c = k(c, s, d, f, u[v + 6], 9, -1069501632)),
                        (f = k(f, c, s, d, u[v + 11], 14, 643717713)),
                        (d = k(d, f, c, s, u[v + 0], 20, -373897302)),
                        (s = k(s, d, f, c, u[v + 5], 5, -701558691)),
                        (c = k(c, s, d, f, u[v + 10], 9, 38016083)),
                        (f = k(f, c, s, d, u[v + 15], 14, -660478335)),
                        (d = k(d, f, c, s, u[v + 4], 20, -405537848)),
                        (s = k(s, d, f, c, u[v + 9], 5, 568446438)),
                        (c = k(c, s, d, f, u[v + 14], 9, -1019803690)),
                        (f = k(f, c, s, d, u[v + 3], 14, -187363961)),
                        (d = k(d, f, c, s, u[v + 8], 20, 1163531501)),
                        (s = k(s, d, f, c, u[v + 13], 5, -1444681467)),
                        (c = k(c, s, d, f, u[v + 2], 9, -51403784)),
                        (f = k(f, c, s, d, u[v + 7], 14, 1735328473)),
                        (d = k(d, f, c, s, u[v + 12], 20, -1926607734)),
                        (s = z(s, d, f, c, u[v + 5], 4, -378558)),
                        (c = z(c, s, d, f, u[v + 8], 11, -2022574463)),
                        (f = z(f, c, s, d, u[v + 11], 16, 1839030562)),
                        (d = z(d, f, c, s, u[v + 14], 23, -35309556)),
                        (s = z(s, d, f, c, u[v + 1], 4, -1530992060)),
                        (c = z(c, s, d, f, u[v + 4], 11, 1272893353)),
                        (f = z(f, c, s, d, u[v + 7], 16, -155497632)),
                        (d = z(d, f, c, s, u[v + 10], 23, -1094730640)),
                        (s = z(s, d, f, c, u[v + 13], 4, 681279174)),
                        (c = z(c, s, d, f, u[v + 0], 11, -358537222)),
                        (f = z(f, c, s, d, u[v + 3], 16, -722521979)),
                        (d = z(d, f, c, s, u[v + 6], 23, 76029189)),
                        (s = z(s, d, f, c, u[v + 9], 4, -640364487)),
                        (c = z(c, s, d, f, u[v + 12], 11, -421815835)),
                        (f = z(f, c, s, d, u[v + 15], 16, 530742520)),
                        (d = z(d, f, c, s, u[v + 2], 23, -995338651)),
                        (s = m(s, d, f, c, u[v + 0], 6, -198630844)),
                        (c = m(c, s, d, f, u[v + 7], 10, 1126891415)),
                        (f = m(f, c, s, d, u[v + 14], 15, -1416354905)),
                        (d = m(d, f, c, s, u[v + 5], 21, -57434055)),
                        (s = m(s, d, f, c, u[v + 12], 6, 1700485571)),
                        (c = m(c, s, d, f, u[v + 3], 10, -1894986606)),
                        (f = m(f, c, s, d, u[v + 10], 15, -1051523)),
                        (d = m(d, f, c, s, u[v + 1], 21, -2054922799)),
                        (s = m(s, d, f, c, u[v + 8], 6, 1873313359)),
                        (c = m(c, s, d, f, u[v + 15], 10, -30611744)),
                        (f = m(f, c, s, d, u[v + 6], 15, -1560198380)),
                        (d = m(d, f, c, s, u[v + 13], 21, 1309151649)),
                        (s = m(s, d, f, c, u[v + 4], 6, -145523070)),
                        (c = m(c, s, d, f, u[v + 11], 10, -1120210379)),
                        (f = m(f, c, s, d, u[v + 2], 15, 718787259)),
                        (d = m(d, f, c, s, u[v + 9], 21, -343485551)),
                        (s = (s + p) >>> 0),
                        (d = (d + h) >>> 0),
                        (f = (f + g) >>> 0),
                        (c = (c + x) >>> 0));
                }
                return e.endian([s, d, f, c]);
            };
        ((l._ff = function (i, o, u, a, s, d, f) {
            var c = i + ((o & u) | (~o & a)) + (s >>> 0) + f;
            return ((c << d) | (c >>> (32 - d))) + o;
        }),
            (l._gg = function (i, o, u, a, s, d, f) {
                var c = i + ((o & a) | (u & ~a)) + (s >>> 0) + f;
                return ((c << d) | (c >>> (32 - d))) + o;
            }),
            (l._hh = function (i, o, u, a, s, d, f) {
                var c = i + (o ^ u ^ a) + (s >>> 0) + f;
                return ((c << d) | (c >>> (32 - d))) + o;
            }),
            (l._ii = function (i, o, u, a, s, d, f) {
                var c = i + (u ^ (o | ~a)) + (s >>> 0) + f;
                return ((c << d) | (c >>> (32 - d))) + o;
            }),
            (l._blocksize = 16),
            (l._digestsize = 16),
            (sc.exports = function (i, o) {
                if (i == null) throw new Error('Illegal argument ' + i);
                var u = e.wordsToBytes(l(i, o));
                return o && o.asBytes ? u : o && o.asString ? r.bytesToString(u) : e.bytesToHex(u);
            }));
    })();
    var Zd = sc.exports,
        gl = {},
        Jd = function (e) {
            return encodeURIComponent(e).replace(/[!'()*]/g, function (t) {
                return '%' + t.charCodeAt(0).toString(16).toUpperCase();
            });
        };
    /*
object-assign
(c) Sindre Sorhus
@license MIT
*/ var dc = Object.getOwnPropertySymbols,
        qd = Object.prototype.hasOwnProperty,
        bd = Object.prototype.propertyIsEnumerable;
    function ep(e) {
        if (e == null) throw new TypeError('Object.assign cannot be called with null or undefined');
        return Object(e);
    }
    function tp() {
        try {
            if (!Object.assign) return !1;
            var e = new String('abc');
            if (((e[5] = 'de'), Object.getOwnPropertyNames(e)[0] === '5')) return !1;
            for (var t = {}, n = 0; n < 10; n++) t['_' + String.fromCharCode(n)] = n;
            var r = Object.getOwnPropertyNames(t).map(function (i) {
                return t[i];
            });
            if (r.join('') !== '0123456789') return !1;
            var l = {};
            return (
                'abcdefghijklmnopqrst'.split('').forEach(function (i) {
                    l[i] = i;
                }),
                Object.keys(Object.assign({}, l)).join('') === 'abcdefghijklmnopqrst'
            );
        } catch {
            return !1;
        }
    }
    var np = tp()
            ? Object.assign
            : function (e, t) {
                  for (var n, r = ep(e), l, i = 1; i < arguments.length; i++) {
                      n = Object(arguments[i]);
                      for (var o in n) qd.call(n, o) && (r[o] = n[o]);
                      if (dc) {
                          l = dc(n);
                          for (var u = 0; u < l.length; u++) bd.call(n, l[u]) && (r[l[u]] = n[l[u]]);
                      }
                  }
                  return r;
              },
        rp = Jd,
        pc = np;
    function lp(e) {
        switch (e.arrayFormat) {
            case 'index':
                return function (t, n, r) {
                    return n === null
                        ? [ke(t, e), '[', r, ']'].join('')
                        : [ke(t, e), '[', ke(r, e), ']=', ke(n, e)].join('');
                };
            case 'bracket':
                return function (t, n) {
                    return n === null ? ke(t, e) : [ke(t, e), '[]=', ke(n, e)].join('');
                };
            default:
                return function (t, n) {
                    return n === null ? ke(t, e) : [ke(t, e), '=', ke(n, e)].join('');
                };
        }
    }
    function ip(e) {
        var t;
        switch (e.arrayFormat) {
            case 'index':
                return function (n, r, l) {
                    if (((t = /\[(\d*)\]$/.exec(n)), (n = n.replace(/\[\d*\]$/, '')), !t)) {
                        l[n] = r;
                        return;
                    }
                    (l[n] === void 0 && (l[n] = {}), (l[n][t[1]] = r));
                };
            case 'bracket':
                return function (n, r, l) {
                    if (((t = /(\[\])$/.exec(n)), (n = n.replace(/\[\]$/, '')), t)) {
                        if (l[n] === void 0) {
                            l[n] = [r];
                            return;
                        }
                    } else {
                        l[n] = r;
                        return;
                    }
                    l[n] = [].concat(l[n], r);
                };
            default:
                return function (n, r, l) {
                    if (l[n] === void 0) {
                        l[n] = r;
                        return;
                    }
                    l[n] = [].concat(l[n], r);
                };
        }
    }
    function ke(e, t) {
        return t.encode ? (t.strict ? rp(e) : encodeURIComponent(e)) : e;
    }
    function mc(e) {
        return Array.isArray(e)
            ? e.sort()
            : typeof e == 'object'
              ? mc(Object.keys(e))
                    .sort(function (t, n) {
                        return Number(t) - Number(n);
                    })
                    .map(function (t) {
                        return e[t];
                    })
              : e;
    }
    ((gl.extract = function (e) {
        return e.split('?')[1] || '';
    }),
        (gl.parse = function (e, t) {
            t = pc({ arrayFormat: 'none' }, t);
            var n = ip(t),
                r = Object.create(null);
            return typeof e != 'string' || ((e = e.trim().replace(/^(\?|#|&)/, '')), !e)
                ? r
                : (e.split('&').forEach(function (l) {
                      var i = l.replace(/\+/g, ' ').split('='),
                          o = i.shift(),
                          u = i.length > 0 ? i.join('=') : void 0;
                      ((u = u === void 0 ? null : decodeURIComponent(u)), n(decodeURIComponent(o), u, r));
                  }),
                  Object.keys(r)
                      .sort()
                      .reduce(function (l, i) {
                          var o = r[i];
                          return (o && typeof o == 'object' && !Array.isArray(o) ? (l[i] = mc(o)) : (l[i] = o), l);
                      }, Object.create(null)));
        }),
        (gl.stringify = function (e, t) {
            var n = { encode: !0, strict: !0, arrayFormat: 'none' };
            t = pc(n, t);
            var r = lp(t);
            return e
                ? Object.keys(e)
                      .sort()
                      .map(function (l) {
                          var i = e[l];
                          if (i === void 0) return '';
                          if (i === null) return ke(l, t);
                          if (Array.isArray(i)) {
                              var o = [];
                              return (
                                  i.slice().forEach(function (u) {
                                      u !== void 0 && o.push(r(l, u, o.length));
                                  }),
                                  o.join('&')
                              );
                          }
                          return ke(l, t) + '=' + ke(i, t);
                      })
                      .filter(function (l) {
                          return l.length > 0;
                      })
                      .join('&')
                : '';
        }));
    var op = function () {
            var e;
            return !!(
                typeof window < 'u' &&
                window !== null &&
                ((e =
                    '(-webkit-min-device-pixel-ratio: 1.25), (min--moz-device-pixel-ratio: 1.25), (-o-min-device-pixel-ratio: 5/4), (min-resolution: 1.25dppx)'),
                window.devicePixelRatio > 1.25 || (window.matchMedia && window.matchMedia(e).matches))
            );
        },
        hc =
            Object.assign ||
            function (e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
            },
        up = (function () {
            function e(t, n) {
                for (var r = 0; r < n.length; r++) {
                    var l = n[r];
                    ((l.enumerable = l.enumerable || !1),
                        (l.configurable = !0),
                        'value' in l && (l.writable = !0),
                        Object.defineProperty(t, l.key, l));
                }
            }
            return function (t, n, r) {
                return (n && e(t.prototype, n), r && e(t, r), t);
            };
        })(),
        sp = gt,
        yl = bn(sp),
        ap = Zd,
        cp = bn(ap),
        fp = gl,
        vc = bn(fp),
        dp = op,
        pp = bn(dp),
        mp = yc,
        vt = bn(mp);
    function bn(e) {
        return e && e.__esModule ? e : { default: e };
    }
    function hp(e, t) {
        var n = {};
        for (var r in e) t.indexOf(r) >= 0 || (Object.prototype.hasOwnProperty.call(e, r) && (n[r] = e[r]));
        return n;
    }
    function vp(e, t) {
        if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
    }
    function gp(e, t) {
        if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return t && (typeof t == 'object' || typeof t == 'function') ? t : e;
    }
    function yp(e, t) {
        if (typeof t != 'function' && t !== null)
            throw new TypeError('Super expression must either be null or a function, not ' + typeof t);
        ((e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 }
        })),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : (e.__proto__ = t)));
    }
    var wl = (function (e) {
        yp(t, e);
        function t() {
            return (vp(this, t), gp(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments)));
        }
        return (
            up(t, [
                {
                    key: 'render',
                    value: function () {
                        var r = this.props.protocol + 'www.gravatar.com/avatar/',
                            l = vc.default.stringify({
                                s: this.props.size,
                                r: this.props.rating,
                                d: this.props.default
                            }),
                            i = vc.default.stringify({
                                s: this.props.size * 2,
                                r: this.props.rating,
                                d: this.props.default
                            }),
                            o = ('' + this.props.email).trim().toLowerCase(),
                            u = void 0;
                        if (this.props.md5) u = this.props.md5;
                        else if (typeof this.props.email == 'string') u = (0, cp.default)(o, { encoding: 'binary' });
                        else
                            return (
                                console.warn(
                                    'Gravatar image can not be fetched. Either the "email" or "md5" prop must be specified.'
                                ),
                                yl.default.createElement('script', null)
                            );
                        var a = '' + r + u + '?' + l,
                            s = '' + r + u + '?' + i,
                            d = !0;
                        typeof window < 'u' && (d = 'srcset' in document.createElement('img'));
                        var f = 'react-gravatar';
                        this.props.className && (f = f + ' ' + this.props.className);
                        var c = hp(this.props, []);
                        return (
                            delete c.md5,
                            delete c.email,
                            delete c.protocol,
                            delete c.rating,
                            delete c.size,
                            delete c.style,
                            delete c.className,
                            delete c.default,
                            !d && (0, pp.default)()
                                ? yl.default.createElement(
                                      'img',
                                      hc(
                                          {
                                              alt: 'Gravatar for ' + o,
                                              style: this.props.style,
                                              src: s,
                                              height: this.props.size,
                                              width: this.props.size
                                          },
                                          c,
                                          { className: f }
                                      )
                                  )
                                : yl.default.createElement(
                                      'img',
                                      hc(
                                          {
                                              alt: 'Gravatar for ' + o,
                                              style: this.props.style,
                                              src: a,
                                              srcSet: s + ' 2x',
                                              height: this.props.size,
                                              width: this.props.size
                                          },
                                          c,
                                          { className: f }
                                      )
                                  )
                        );
                    }
                }
            ]),
            t
        );
    })(yl.default.Component);
    ((wl.displayName = 'Gravatar'),
        (wl.propTypes = {
            email: vt.default.string,
            md5: vt.default.string,
            size: vt.default.number,
            rating: vt.default.string,
            default: vt.default.string,
            className: vt.default.string,
            protocol: vt.default.string,
            style: vt.default.object
        }),
        (wl.defaultProps = { size: 50, rating: 'g', default: 'retro', protocol: '//' }));
    var wp = wl;
    const kp = wc(wp),
        Sp = ({ commit: e }) => {
            var t;
            return (
                e.author
                    .split(' ')
                    .map((n) => n.charAt(0))
                    .join('')
                    .toUpperCase()
                    .slice(0, 2),
                M.jsxs('section', {
                    className: 'flex items-center justify-between gap-4 p-3',
                    children: [
                        M.jsx('div', {
                            className: 'flex min-w-0 grow items-center gap-3',
                            children: M.jsx('h3', { className: 'truncate text-base font-medium', children: e.message })
                        }),
                        M.jsxs('div', {
                            className: 'flex shrink-0 items-center gap-3',
                            children: [
                                M.jsx('time', {
                                    className: 'text-sm opacity-60',
                                    dateTime: e.date.split('T')[0],
                                    children: new Date(e.date).toLocaleDateString('en-CA', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                }),
                                M.jsx('time', {
                                    className: 'text-sm opacity-60',
                                    dateTime: ((t = e.date.split('T')[1]) == null ? void 0 : t.split('+')[0]) || e.date,
                                    children: new Date(e.date).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: !1
                                    })
                                }),
                                M.jsxs('div', {
                                    className: 'flex items-center gap-2',
                                    children: [
                                        M.jsx(kp, {
                                            email: e.email,
                                            size: 24,
                                            default: 'identicon',
                                            className: 'h-6 w-6 rounded-full',
                                            alt: e.author
                                        }),
                                        M.jsx('span', { className: 'text-sm opacity-80', children: e.author })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            );
        },
        xp = () => {
            const [e, t] = gt.useState([]),
                [n, r] = gt.useState(!0),
                [l, i] = gt.useState(null);
            return (
                gt.useEffect(() => {
                    const o = window.acquireVsCodeApi(),
                        u = (a) => {
                            const s = a.data;
                            switch (s.type) {
                                case 'gitCommits':
                                    (t(s.commits), r(!1));
                                    break;
                                case 'gitError':
                                    (i(s.error), r(!1));
                                    break;
                            }
                        };
                    return (
                        window.addEventListener('message', u),
                        o.postMessage({ type: 'getGitCommits' }),
                        () => {
                            window.removeEventListener('message', u);
                        }
                    );
                }, []),
                n
                    ? M.jsxs('div', {
                          className: 'flex flex-col items-center justify-center gap-4 p-8',
                          children: [
                              M.jsx('div', {
                                  className: 'h-8 w-8 animate-spin rounded-full border-b-2 border-current'
                              }),
                              M.jsx('p', { children: 'Loading git history...' })
                          ]
                      })
                    : l
                      ? M.jsxs('div', {
                            className: 'flex flex-col items-center justify-center gap-2 p-8 text-center text-red-400',
                            children: [
                                M.jsx('p', { children: 'Error loading git history:' }),
                                M.jsx('p', { className: 'font-mono text-sm', children: l })
                            ]
                        })
                      : e.length === 0
                        ? M.jsx('div', {
                              className: 'flex items-center justify-center p-8',
                              children: M.jsx('p', {
                                  className: 'text-center text-gray-400',
                                  children: 'No commits found in this repository.'
                              })
                          })
                        : M.jsx('div', {
                              className: 'flex flex-col p-4',
                              children: e.map((o) => M.jsx(Sp, { commit: o }, o.hash))
                          })
            );
        },
        Ep = () =>
            M.jsxs('div', {
                className: 'flex min-h-screen min-w-screen flex-col',
                style: { backgroundColor: 'var(--vscode-editor-background)', color: 'var(--vscode-editor-foreground)' },
                children: [
                    M.jsx('header', {
                        className: 'border-opacity-20 border-b p-4',
                        style: { borderColor: 'var(--vscode-widget-border, rgba(255,255,255,0.1))' },
                        children: M.jsx('h1', { className: 'text-xl font-bold', children: 'GitGo Git Graph' })
                    }),
                    M.jsx('main', { className: 'flex-1 overflow-auto', children: M.jsx(xp, {}) })
                ]
            });
    oc(document.getElementById('root')).render(M.jsx(Ep, {}));
})(require$$4);

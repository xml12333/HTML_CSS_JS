!(function (e, t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? t(exports)
    : 'function' == typeof define && define.amd
    ? define(['exports'], t)
    : t(((e = e || self).window = e.window || {}))
})(this, function (e) {
  'use strict'
  function m(e) {
    return Math.round(100000 * e) / 100000 || 0
  }
  var U = Math.PI / 180,
    Y = Math.sin,
    k = Math.cos,
    B = Math.abs,
    F = Math.sqrt
  function arcToSegment(e, t, n, s, i, o, r, a, u) {
    if (e !== a || t !== u) {
      n = B(n)
      s = B(s)
      var h = (i % 360) * U,
        f = k(h),
        c = Y(h),
        l = Math.PI,
        g = 2 * l,
        v = (e - a) / 2,
        d = (t - u) / 2,
        m = f * v + c * d,
        p = -c * v + f * d,
        x = m * m,
        y = p * p,
        w = x / (n * n) + y / (s * s)
      1 < w && ((n = F(w) * n), (s = F(w) * s))
      var C = n * n,
        M = s * s,
        E = (C * M - C * y - M * x) / (C * y + M * x)
      E < 0 && (E = 0)
      var b = (o === r ? -1 : 1) * F(E),
        P = ((n * p) / s) * b,
        S = ((-s * m) / n) * b,
        N = f * P - c * S + (e + a) / 2,
        T = c * P + f * S + (t + u) / 2,
        _ = (m - P) / n,
        D = (p - S) / s,
        O = (-m - P) / n,
        V = (-p - S) / s,
        q = _ * _ + D * D,
        A = (D < 0 ? -1 : 1) * Math.acos(_ / F(q)),
        R =
          (_ * V - D * O < 0 ? -1 : 1) *
          Math.acos((_ * O + D * V) / F(q * (O * O + V * V)))
      isNaN(R) && (R = l)
      !r && 0 < R ? (R -= g) : r && R < 0 && (R += g)
      A %= g
      R %= g
      var G,
        L = Math.ceil(B(R) / (g / 4)),
        j = [],
        z = R / L,
        I = (1.3333333333333333 * Y(z / 2)) / (1 + k(z / 2)),
        W = f * n,
        H = c * n,
        Q = c * -s,
        Z = f * s
      for (G = 0; G < L; G++) {
        m = k((i = A + G * z))
        p = Y(i)
        _ = k((i += z))
        D = Y(i)
        j.push(m - I * p, p + I * m, _ + I * D, D - I * _, _, D)
      }
      for (G = 0; G < j.length; G += 2) {
        m = j[G]
        p = j[G + 1]
        j[G] = m * W + p * Q + N
        j[G + 1] = m * H + p * Z + T
      }
      return (j[G - 2] = a), (j[G - 1] = u), j
    }
  }
  function stringToRawPath(e) {
    function ib(e, t, n, s) {
      f = (n - e) / 3
      c = (s - t) / 3
      a.push(e + f, t + c, n - f, s - c, n, s)
    }
    var t,
      n,
      s,
      i,
      o,
      r,
      a,
      u,
      h,
      f,
      c,
      l,
      g,
      v,
      d,
      m =
        (e + '')
          .replace(/[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi, function (e) {
            var t = +e
            return t < 0.0001 && -0.0001 < t ? 0 : t
          })
          .match(/[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi) || [],
      p = [],
      x = 0,
      y = 0,
      w = m.length,
      C = 0,
      M = 'ERROR: malformed path: ' + e
    if (!e || !isNaN(m[0]) || isNaN(m[1])) {
      return console.log(M), p
    }
    for (t = 0; t < w; t++) {
      if (
        ((g = o),
        isNaN(m[t]) ? (r = (o = m[t].toUpperCase()) !== m[t]) : t--,
        (s = +m[t + 1]),
        (i = +m[t + 2]),
        r && ((s += x), (i += y)),
        t || ((u = s), (h = i)),
        'M' === o)
      ) {
        a && (a.length < 8 ? --p.length : (C += a.length))
        x = u = s
        y = h = i
        a = [s, i]
        p.push(a)
        t += 2
        o = 'L'
      } else {
        if ('C' === o) {
          r || (x = y = 0)
          ;(a = a || [0, 0]).push(
            s,
            i,
            x + 1 * m[t + 3],
            y + 1 * m[t + 4],
            (x += 1 * m[t + 5]),
            (y += 1 * m[t + 6])
          )
          t += 6
        } else {
          if ('S' === o) {
            f = x
            c = y
            ;('C' !== g && 'S' !== g) ||
              ((f += x - a[a.length - 4]), (c += y - a[a.length - 3]))
            r || (x = y = 0)
            a.push(f, c, s, i, (x += 1 * m[t + 3]), (y += 1 * m[t + 4]))
            t += 4
          } else {
            if ('Q' === o) {
              f = x + 0.6666666666666666 * (s - x)
              c = y + 0.6666666666666666 * (i - y)
              r || (x = y = 0)
              x += 1 * m[t + 3]
              y += 1 * m[t + 4]
              a.push(
                f,
                c,
                x + 0.6666666666666666 * (s - x),
                y + 0.6666666666666666 * (i - y),
                x,
                y
              )
              t += 4
            } else {
              if ('T' === o) {
                f = x - a[a.length - 4]
                c = y - a[a.length - 3]
                a.push(
                  x + f,
                  y + c,
                  s + 0.6666666666666666 * (x + 1.5 * f - s),
                  i + 0.6666666666666666 * (y + 1.5 * c - i),
                  (x = s),
                  (y = i)
                )
                t += 2
              } else {
                if ('H' === o) {
                  ib(x, y, (x = s), y)
                  t += 1
                } else {
                  if ('V' === o) {
                    ib(x, y, x, (y = s + (r ? y - x : 0)))
                    t += 1
                  } else {
                    if ('L' === o || 'Z' === o) {
                      'Z' === o && ((s = u), (i = h), (a.closed = true))
                      ;('L' === o || 0.5 < B(x - s) || 0.5 < B(y - i)) &&
                        (ib(x, y, s, i), 'L' === o && (t += 2))
                      x = s
                      y = i
                    } else {
                      if ('A' === o) {
                        if (
                          ((v = m[t + 4]),
                          (d = m[t + 5]),
                          (f = m[t + 6]),
                          (c = m[t + 7]),
                          (n = 7),
                          1 < v.length &&
                            (v.length < 3
                              ? ((c = f), (f = d), n--)
                              : ((c = d), (f = v.substr(2)), (n -= 2)),
                            (d = v.charAt(1)),
                            (v = v.charAt(0))),
                          (l = arcToSegment(
                            x,
                            y,
                            +m[t + 1],
                            +m[t + 2],
                            +m[t + 3],
                            +v,
                            +d,
                            (r ? x : 0) + 1 * f,
                            (r ? y : 0) + 1 * c
                          )),
                          (t += n),
                          l)
                        ) {
                          for (n = 0; n < l.length; n++) {
                            a.push(l[n])
                          }
                        }
                        x = a[a.length - 2]
                        y = a[a.length - 1]
                      } else {
                        console.log(M)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return (
      (t = a.length) < 6
        ? (p.pop(), (t = 0))
        : a[0] === a[t - 2] && a[1] === a[t - 1] && (a.closed = true),
      (p.totalPoints = C + t),
      p
    )
  }
  function p() {
    return (
      y ||
      ('undefined' != typeof window &&
        (y = window.gsap) &&
        y.registerPlugin &&
        y)
    )
  }
  function q() {
    ;(y = p())
      ? (y.registerEase('_CE', n.create), (i = 1))
      : console.warn('Please gsap.registerPlugin(CustomEase)')
  }
  function s(e) {
    return ~~(1000 * e + (e < 0 ? -0.5 : 0.5)) / 1000
  }
  function v() {
    return String.fromCharCode.apply(null, arguments)
  }
  function C(e, t, n, s, i, o, r, a, u, h, f) {
    var c,
      l = (e + n) / 2,
      g = (t + s) / 2,
      v = (n + i) / 2,
      d = (s + o) / 2,
      m = (i + r) / 2,
      p = (o + a) / 2,
      x = (l + v) / 2,
      y = (g + d) / 2,
      w = (v + m) / 2,
      M = (d + p) / 2,
      E = (x + w) / 2,
      b = (y + M) / 2,
      P = r - e,
      S = a - t,
      N = Math.abs((n - r) * S - (s - a) * P),
      T = Math.abs((i - r) * S - (o - a) * P)
    return (
      h ||
        ((h = [
          {
            x: e,
            y: t,
          },
          {
            x: r,
            y: a,
          },
        ]),
        (f = 1)),
      h.splice(f || h.length - 1, 0, {
        x: E,
        y: b,
      }),
      u * (P * P + S * S) < (N + T) * (N + T) &&
        ((c = h.length),
        C(e, t, l, g, x, y, E, b, u, h, f),
        C(E, b, w, M, m, p, r, a, u, h, f + 1 + (h.length - c))),
      h
    )
  }
  var y,
    i,
    t,
    r = "greensock.com",
    a = (function (e) {
      var t =
          0 ===
            (window ? window.location.href : '').indexOf(
             "file://"
            ) ||
          -1 !== e.indexOf("localhost") ||
          -1 !== e.indexOf("127.0 0.1"),
        n = [
          r,
          "codepen.io",
         "codepen.plumbing",
         "codepen.dev",
         "codepen.app",
         "pens.cloud",
         "css-tricks.com",
         "cdpn.io",
         "pens.io",
         "gannon.tv",
         "codecanyon.net",
         "themeforest.net",
         "cerebrax.co.uk",
         "tympanus.net",
         "tweenmax.com",
         "tweenlite.com",
         "plnkr.co",
         "hotjar.com",
         "webpackbin.com",
         "archive.org",
         "codesandbox.io",
         "csb.app",
         "stackblitz.com",
         "codier.io",
         "motiontricks.com",
         "stackoverflow.com",
         "stackexchange.com",
         "jsfiddle.net",
        ],
        s = n.length
      for (
        setTimeout(function () {
          window &&
            window.console &&
            !window._gsapWarned &&
            y &&
            false !== y.config().trialWarn &&
            (console.log(
              "%cWarning",
            "font-size:30px;color:red;"
            ),
            console.log(
              "A trial version of "+
                'CustomEase' +
               " is loaded that only works locally and on domains like codepen.io and codesandbox.io. *** DO NOT DEPLOY THIS FILE *** Loading it on an unauthorized site violates the license and will cause a redirect. Please join Club GreenSock to get full access to the bonus plugins that boost your animation superpowers. Disable this warning with gsap.config({trialWarn: false});"
            ),
            console.log(
             "%cGet unrestricted files at https://greensock.com/club",
              "stage.js:4 font-size:16px;color:#4e9815"
            ),
            (window._gsapWarned = 1))
        }, 50);
        -1 < --s;

      ) {
        if (-1 !== e.indexOf(n[s])) {
          return true
        }
      }
      return (true
        // t ||
        // !setTimeout(function () {
        //   window.location.href =
        //     "https://" +
        //     r +
        //    "/requires-membership/"+
        //     '?plugin=' +
        //     'CustomEase' +
        //     '&source=codepen'
        // }, 3000)
      )
    })(window ? window.location.host : ''),
    n =
      (((t = CustomEase.prototype).setData = function setData(e, t) {
        t = t || {}
        var n,
          s,
          i,
          o,
          r,
          a,
          u,
          h,
          f,
          c = (e = e || '0,0,1,1').match(
            /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi
          ),
          l = 1,
          g = [],
          v = [],
          d = t.precision || 1,
          m = d <= 1
        if (
          ((this.data = e),
          (/[cLlsSaAhHvVtTqQ]/g.test(e) ||
            (~e.indexOf('M') && e.indexOf('C') < 0)) &&
            (c = stringToRawPath(e)[0]),
          4 === (n = c.length))
        ) {
          c.unshift(0, 0)
          c.push(1, 1)
          n = 8
        } else {
          if ((n - 2) % 6) {
            throw 'Invalid CustomEase'
          }
        }
        for (
          (0 == +c[0] && 1 == +c[n - 2]) ||
            (function _normalize(e, t, n) {
              n || 0 === n || (n = Math.max(+e[e.length - 1], +e[1]))
              var s,
                i = -1 * e[0],
                o = -n,
                r = e.length,
                a = 1 / (+e[r - 2] + i),
                u =
                  -t ||
                  (Math.abs(e[r - 1] - e[1]) < 0.01 * (e[r - 2] - e[0])
                    ? (function _findMinimum(e) {
                        var t,
                          n = e.length,
                          s = 100000000000000000000
                        for (t = 1; t < n; t += 6) {
                          ;+e[t] < s && (s = +e[t])
                        }
                        return s
                      })(e) + o
                    : +e[r - 1] + o)
              for (u = u ? 1 / u : -a, s = 0; s < r; s += 2) {
                e[s] = (+e[s] + i) * a
                e[s + 1] = (+e[s + 1] + o) * u
              }
            })(c, t.height, t.originY),
            this.segment = c,
            o = 2;
          o < n;
          o += 6
        ) {
          s = {
            x: +c[o - 2],
            y: +c[o - 1],
          }
          i = {
            x: +c[o + 4],
            y: +c[o + 5],
          }
          g.push(s, i)
          C(
            s.x,
            s.y,
            +c[o],
            +c[o + 1],
            +c[o + 2],
            +c[o + 3],
            i.x,
            i.y,
            1 / (200000 * d),
            g,
            g.length - 1
          )
        }
        for (n = g.length, o = 0; o < n; o++) {
          u = g[o]
          h = g[o - 1] || u
          ;(u.x > h.x || (h.y !== u.y && h.x === u.x) || u === h) && u.x <= 1
            ? ((h.cx = u.x - h.x),
              (h.cy = u.y - h.y),
              (h.n = u),
              (h.nx = u.x),
              m &&
                1 < o &&
                2 < Math.abs(h.cy / h.cx - g[o - 2].cy / g[o - 2].cx) &&
                (m = 0),
              h.cx < l &&
                (h.cx
                  ? (l = h.cx)
                  : ((h.cx = 0.001),
                    o === n - 1 &&
                      ((h.x -= 0.001), (l = Math.min(l, 0.001)), (m = 0)))))
            : (g.splice(o--, 1), n--)
        }
        if (((r = 1 / (n = (1 / l + 1) | 0)), (u = g[(a = 0)]), m)) {
          for (o = 0; o < n; o++) {
            f = o * r
            u.nx < f && (u = g[++a])
            s = u.y + ((f - u.x) / u.cx) * u.cy
            v[o] = {
              x: f,
              cx: r,
              y: s,
              cy: 0,
              nx: 9,
            }
            o && (v[o - 1].cy = s - v[o - 1].y)
          }
          v[n - 1].cy = g[g.length - 1].y - s
        } else {
          for (o = 0; o < n; o++) {
            u.nx < o * r && (u = g[++a])
            v[o] = u
          }
          a < g.length - 1 && (v[o - 1] = g[g.length - 2])
        }
        return (
          (this.ease = function (e) {
            var t = v[(e * n) | 0] || v[n - 1]
            return t.nx < e && (t = t.n), t.y + ((e - t.x) / t.cx) * t.cy
          }),
          (this.ease.custom = this).id &&
            y &&
            y.registerEase(this.id, this.ease),
          this
        )
      }),
      (t.getSVGData = function getSVGData(e) {
        return CustomEase.getSVGData(this, e)
      }),
      (CustomEase.create = function create(e, t, n) {
        return new CustomEase(e, t, n).ease
      }),
      (CustomEase.register = function register(e) {
        y = e
        q()
      }),
      (CustomEase.get = function get(e) {
        return y.parseEase(e)
      }),
      (CustomEase.getSVGData = function getSVGData(e, t) {
        var n,
          i,
          o,
          r,
          a,
          u,
          h,
          f,
          c,
          l,
          g = (t = t || {}).width || 100,
          v = t.height || 100,
          d = t.x || 0,
          p = (t.y || 0) + v,
          x = y.utils.toArray(t.path)[0]
        if (
          (t.invert && ((v = -v), (p = 0)),
          'string' == typeof e && (e = y.parseEase(e)),
          e.custom && (e = e.custom),
          e instanceof CustomEase)
        ) {
          n = (function rawPathToString(e) {
            !(function _isNumber(e) {
              return 'number' == typeof e
            })(e[0]) || (e = [e])
            var t,
              n,
              s,
              i,
              o = '',
              r = e.length
            for (n = 0; n < r; n++) {
              for (
                i = e[n],
                  o += 'M' + m(i[0]) + ',' + m(i[1]) + ' C',
                  t = i.length,
                  s = 2;
                s < t;
                s++
              ) {
                o +=
                  m(i[s++]) +
                  ',' +
                  m(i[s++]) +
                  ' ' +
                  m(i[s++]) +
                  ',' +
                  m(i[s++]) +
                  ' ' +
                  m(i[s++]) +
                  ',' +
                  m(i[s]) +
                  ' '
              }
              i.closed && (o += 'z')
            }
            return o
          })(
            (function transformRawPath(e, t, n, s, i, o, r) {
              for (var a, u, h, f, c, l = e.length; -1 < --l; ) {
                for (u = (a = e[l]).length, h = 0; h < u; h += 2) {
                  f = a[h]
                  c = a[h + 1]
                  a[h] = f * t + c * s + o
                  a[h + 1] = f * n + c * i + r
                }
              }
              return (e._dirty = 1), e
            })([e.segment], g, 0, 0, -v, d, p)
          )
        } else {
          for (
            n = [d, p],
              r = 1 / (h = Math.max(5, 200 * (t.precision || 1))),
              f = 5 / (h += 2),
              c = s(d + r * g),
              i = ((l = s(p + e(r) * -v)) - p) / (c - d),
              o = 2;
            o < h;
            o++
          ) {
            a = s(d + o * r * g)
            u = s(p + e(o * r) * -v)
            ;(Math.abs((u - l) / (a - c) - i) > f || o === h - 1) &&
              (n.push(c, l), (i = (u - l) / (a - c)))
            c = a
            l = u
          }
          n = 'M' + n.join(',')
        }
        return x && x.setAttribute('d', n), n
      }),
      CustomEase)
  function CustomEase(e, t, n) {
    i || q()
    this.id = e
    a && this.setData(t, n)
  }
  p() && y.registerPlugin(n)
  n.version = '3.8.0'
  e.CustomEase = n
  e.default = n
  if (typeof window === 'undefined' || window !== e) {
    Object.defineProperty(e, '__esModule', { value: true })
  } else {
    delete e.default
  }
})

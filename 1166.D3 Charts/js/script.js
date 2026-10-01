const SPECIMENS = [
    /* ---------------------------------------------------------------- 01 */
    {
      title: "Pie Chart with Timeline",
      note: "Eleven years of revenue mix on one pie. Arc tween interpolates start and end angles between frames, so wedges rotate and resize together while a scrubber walks the timeline in step.",
      tags: ["d3.pie", "arcTween", "scalePoint"],
      fn: function (root) {
        const W = 600,
          H = 430,
          CX = W / 2,
          CY = 148,
          R = 112;
        const keys = ["Plane", "Car", "Train", "Bus", "Ship"];
        const years = d3.range(2016, 2027);
        const rnd = d3.randomLcg(0.71);
        const color = d3.scaleOrdinal(keys, d3.schemeTableau10);

        const series = keys.map(() => {
          let v = 1 + rnd() * 50;
          return years.map(() => {
            v = Math.max(7, v * (0.87 + rnd() * 0.3));
            return v;
          });
        });
        const frames = years.map((y, j) =>
          keys.map((k, i) => ({ key: k, value: series[i][j] }))
        );

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const pie = d3
          .pie()
          .sort(null)
          .value((d) => d.value)
          .padAngle(0.012);
        const arc = d3.arc().innerRadius(0).outerRadius(R).cornerRadius(2);
        const mid = d3
          .arc()
          .innerRadius(R * 0.64)
          .outerRadius(R * 0.64);

        const g = svg.append("g").attr("transform", `translate(${CX},${CY})`);
        let cur = pie(frames[0]);

        const slice = g
          .selectAll("path")
          .data(cur, (d) => d.data.key)
          .join("path")
          .attr("fill", (d) => color(d.data.key))
          .attr("d", arc)
          .each(function (d) {
            this._c = d;
          });

        const label = g
          .selectAll("text")
          .data(cur, (d) => d.data.key)
          .join("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("font-size", 11)
          .attr("font-weight", 600)
          .attr("fill", "#fff")
          .attr("transform", (d) => `translate(${mid.centroid(d)})`)
          .text(
            (d) =>
              Math.round((d.value / d3.sum(frames[0], (f) => f.value)) * 100) +
              "%"
          );

        // --- timeline ---------------------------------------------------
        const TY = 300;
        const x = d3.scalePoint(years, [58, W - 58]);
        const track = d3.schemeTableau10[2];

        svg
          .append("line")
          .attr("x1", x(years[0]))
          .attr("x2", x(years[years.length - 1]))
          .attr("y1", TY)
          .attr("y2", TY)
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.2)
          .attr("stroke-width", 2);

        svg
          .append("g")
          .selectAll("line")
          .data(years)
          .join("line")
          .attr("x1", (d) => x(d))
          .attr("x2", (d) => x(d))
          .attr("y1", TY - 5)
          .attr("y2", TY + 5)
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.2);

        svg
          .append("g")
          .selectAll("text")
          .data(years)
          .join("text")
          .attr("x", (d) => x(d))
          .attr("y", TY + 22)
          .attr("text-anchor", "middle")
          .attr("font-size", 9)
          .attr("letter-spacing", "0.06em")
          .attr("fill", "currentColor")
          .attr("opacity", 0.45)
          .text((d) => "'" + String(d).slice(2));

        const prog = svg
          .append("line")
          .attr("x1", x(years[0]))
          .attr("x2", x(years[0]))
          .attr("y1", TY)
          .attr("y2", TY)
          .attr("stroke", track)
          .attr("stroke-width", 3)
          .attr("stroke-linecap", "round");

        const handle = svg
          .append("circle")
          .attr("cx", x(years[0]))
          .attr("cy", TY)
          .attr("r", 6.5)
          .attr("fill", track)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        const yearLabel = svg
          .append("text")
          .attr("x", W - 20)
          .attr("y", TY - 22)
          .attr("text-anchor", "end")
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("font-size", 42)
          .attr("font-weight", 600)
          .attr("opacity", 0.16)
          .attr("fill", "currentColor")
          .text(years[0]);

        // --- legend -----------------------------------------------------
        const leg = svg
          .append("g")
          .attr("transform", `translate(58,${H - 22})`);
        let ox = 0;
        keys.forEach((k) => {
          const gg = leg.append("g").attr("transform", `translate(${ox},0)`);
          gg.append("rect")
            .attr("width", 9)
            .attr("height", 9)
            .attr("y", -8)
            .attr("rx", 2)
            .attr("fill", color(k));
          gg.append("text")
            .attr("x", 14)
            .attr("font-size", 10)
            .attr("fill", "currentColor")
            .attr("opacity", 0.65)
            .text(k);
          ox += 22 + k.length * 6.2;
        });

        // --- cycle ------------------------------------------------------
        let j = 0;
        function step() {
          j = (j + 1) % years.length;
          const data = pie(frames[j]);
          const total = d3.sum(frames[j], (f) => f.value);

          slice
            .data(data, (d) => d.data.key)
            .transition()
            .duration(950)
            .ease(d3.easeCubicInOut)
            .attrTween("d", function (a) {
              const i = d3.interpolate(this._c, a);
              this._c = i(0);
              return (t) => arc(i(t));
            });

          label
            .data(data, (d) => d.data.key)
            .transition()
            .duration(950)
            .ease(d3.easeCubicInOut)
            .attr("transform", (d) => `translate(${mid.centroid(d)})`)
            .attr("opacity", (d) => (d.endAngle - d.startAngle > 0.3 ? 1 : 0))
            .tween("pct", function (d) {
              const i = d3.interpolateNumber(
                parseFloat(this.textContent) || 0,
                (d.value / total) * 100
              );
              return (t) => {
                this.textContent = Math.round(i(t)) + "%";
              };
            });

          prog
            .transition()
            .duration(950)
            .ease(d3.easeCubicInOut)
            .attr("x2", x(years[j]));
          handle
            .transition()
            .duration(950)
            .ease(d3.easeCubicInOut)
            .attr("cx", x(years[j]));
          yearLabel.text(years[j]);
        }
        step();
        setInterval(step, 1500);
      }
    },

    /* ---------------------------------------------------------------- 02 */
    {
      title: "Pizza Chart — Sales by Age",
      note: "A pie chart that leaned into the metaphor. Crust, cheese and toppings are separate arcs and scattered circles; slices are pulled from the pan on a loop, cheese strings and all.",
      tags: ["d3.pie", "easeBackOut", "quadratic paths"],
      fn: function (root) {
        const W = 600,
          H = 462,
          CX = W / 2,
          CY = 194,
          R = 138,
          CRUST = 20;
        const data = [
          { k: "18–24", v: 14 },
          { k: "25–34", v: 27 },
          { k: "35–44", v: 23 },
          { k: "45–54", v: 18 },
          { k: "55–64", v: 11 },
          { k: "65+", v: 7 }
        ];
        const CRUST_C = "#DB9C3E",
          CRUST_D = "#B0761F",
          CHEESE = "#F5C451",
          MELT = "#FADA84",
          SAUCE = "#C0392B",
          BASIL = "#3F7D3F",
          OLIVE = "#2F2A33";

        const rnd = d3.randomLcg(0.37);
        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);

        const pie = d3
          .pie()
          .sort(null)
          .value((d) => d.v)
          .padAngle(0.028);
        const arcs = pie(data);
        const crustArc = d3.arc().innerRadius(0).outerRadius(R).cornerRadius(3);
        const cheeseArc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(R - CRUST)
          .cornerRadius(2);

        // shadow under the pan
        svg
          .append("ellipse")
          .attr("cx", CX)
          .attr("cy", CY + R * 0.94)
          .attr("rx", R * 0.86)
          .attr("ry", 14)
          .attr("fill", "currentColor")
          .attr("opacity", 0.08);

        const board = svg
          .append("g")
          .attr("transform", `translate(${CX},${CY}) scale(0.62) rotate(-22)`)
          .attr("opacity", 0);

        const slice = board
          .selectAll("g.sl")
          .data(arcs)
          .join("g")
          .attr("class", "sl");

        slice
          .append("path")
          .attr("d", crustArc)
          .attr("fill", CRUST_C)
          .attr("stroke", CRUST_D)
          .attr("stroke-width", 2.5)
          .attr("stroke-linejoin", "round");
        slice
          .append("path")
          .attr("d", cheeseArc)
          .attr("fill", CHEESE)
          .attr("stroke", MELT)
          .attr("stroke-width", 1.5);

        // toppings, scattered inside each wedge
        slice.each(function (a) {
          const gg = d3.select(this);
          const span = a.endAngle - a.startAngle;
          const n = 3 + Math.round(span * 3.4);
          for (let i = 0; i < n; i++) {
            const ang =
              a.startAngle + 0.22 + rnd() * Math.max(0.03, span - 0.44);
            const rr = (0.34 + rnd() * 0.5) * (R - CRUST - 20);
            const px = Math.sin(ang) * rr,
              py = -Math.cos(ang) * rr;
            const kind = i % 3;
            if (kind === 2) {
              gg.append("circle")
                .attr("class", "top")
                .attr("cx", px)
                .attr("cy", py)
                .attr("r", 5)
                .attr("fill", BASIL)
                .attr("opacity", 0);
            } else if (kind === 1) {
              gg.append("circle")
                .attr("class", "top")
                .attr("cx", px)
                .attr("cy", py)
                .attr("r", 6)
                .attr("fill", "none")
                .attr("stroke", OLIVE)
                .attr("stroke-width", 4)
                .attr("opacity", 0);
            } else {
              gg.append("circle")
                .attr("class", "top")
                .attr("cx", px)
                .attr("cy", py)
                .attr("r", 10)
                .attr("fill", SAUCE)
                .attr("stroke", "#96271A")
                .attr("stroke-width", 1.5)
                .attr("opacity", 0);
            }
          }
        });

        // age-group labels ride outside the crust, clear of the toppings
        const outer = svg
          .append("g")
          .attr("transform", `translate(${CX},${CY})`)
          .attr("opacity", 0);
        arcs.forEach((d) => {
          const m = (d.startAngle + d.endAngle) / 2;
          const lx = Math.sin(m) * (R + 26),
            ly = -Math.cos(m) * (R + 26);
          const anchor =
            Math.abs(Math.sin(m)) < 0.25
              ? "middle"
              : Math.sin(m) > 0
                ? "start"
                : "end";
          const gg = outer
            .append("g")
            .attr("transform", `translate(${lx},${ly})`);
          gg.append("text")
            .attr("text-anchor", anchor)
            .attr("font-size", 12)
            .attr("font-weight", 600)
            .attr("letter-spacing", "0.04em")
            .attr("fill", "currentColor")
            .text(d.data.k);
          gg.append("text")
            .attr("text-anchor", anchor)
            .attr("y", 15)
            .attr("font-family", "Fraunces, Georgia, serif")
            .attr("font-size", 16)
            .attr("font-weight", 600)
            .attr("fill", CRUST_D)
            .text(d.data.v + "%");
        });

        const strings = svg
          .append("g")
          .attr("transform", `translate(${CX},${CY})`);

        const caption = svg
          .append("text")
          .attr("x", CX)
          .attr("y", H - 42)
          .attr("text-anchor", "middle")
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("font-size", 26)
          .attr("font-weight", 600)
          .attr("fill", "currentColor");
        const sub = svg
          .append("text")
          .attr("x", CX)
          .attr("y", H - 18)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .attr("letter-spacing", "0.28em")
          .attr("fill", "currentColor")
          .attr("opacity", 0.5)
          .text("SHARE OF SALES BY AGE GROUP");

        function intro() {
          board
            .attr("opacity", 0)
            .attr(
              "transform",
              `translate(${CX},${CY}) scale(0.62) rotate(-22)`
            );
          slice
            .selectAll("circle.top")
            .attr("opacity", 0)
            .attr("transform", "scale(0)");
          board
            .transition()
            .duration(950)
            .ease(d3.easeBackOut.overshoot(1.3))
            .attr("opacity", 1)
            .attr("transform", `translate(${CX},${CY}) scale(1) rotate(0)`);
          slice
            .selectAll("circle.top")
            .transition()
            .delay((d, i) => 620 + i * 26)
            .duration(380)
            .ease(d3.easeBackOut.overshoot(2.4))
            .attr("opacity", 1)
            .attr("transform", "scale(1)");
          outer
            .attr("opacity", 0)
            .transition()
            .delay(900)
            .duration(600)
            .attr("opacity", 1);
        }

        function pull(i) {
          const d = arcs[i],
            m = (d.startAngle + d.endAngle) / 2;
          const dx = Math.sin(m),
            dy = -Math.cos(m),
            D = 40;

          slice
            .transition()
            .duration(650)
            .ease(d3.easeCubicOut)
            .attr("transform", (s, k) =>
              k === i ? `translate(${dx * D},${dy * D})` : "translate(0,0)"
            );

          caption
            .text(d.data.k + "  ·  " + d.data.v + "%")
            .attr("opacity", 0)
            .transition()
            .delay(180)
            .duration(400)
            .attr("opacity", 1);

          strings
            .selectAll("path")
            .data([-1, 0, 1])
            .join("path")
            .attr("fill", "none")
            .attr("stroke", MELT)
            .attr("stroke-width", 3.5)
            .attr("stroke-linecap", "round")
            .attr("d", (s) => {
              const ox = -dy * s * 16,
                oy = dx * s * 16;
              const x0 = dx * (R - CRUST - 8) + ox,
                y0 = dy * (R - CRUST - 8) + oy;
              const x1 = dx * (R - CRUST - 8 + D) + ox,
                y1 = dy * (R - CRUST - 8 + D) + oy;
              return `M${x0},${y0} Q${(x0 + x1) / 2},${(y0 + y1) / 2 + 20} ${x1},${y1}`;
            })
            .attr("opacity", 0)
            .transition()
            .delay(150)
            .duration(320)
            .attr("opacity", 0.95)
            .transition()
            .delay(760)
            .duration(300)
            .attr("opacity", 0);
        }

        let i = -1;
        intro();
        setInterval(() => {
          i++;
          if (i >= arcs.length) {
            i = -1;
            intro();
            caption.transition().duration(300).attr("opacity", 0);
          } else pull(i);
        }, 1900);
      }
    },

    /* ---------------------------------------------------------------- 03 */
    {
      title: "3D Pie — Monthly Expenses",
      note: "No 3D library. An ellipse projection plus extruded arc walls, redrawn every frame with a painter's-algorithm sort, so the pie can spin and lift a slice while the depth reads correctly.",
      tags: ["d3.timer", "ellipse projection", "painter's algorithm"],
      fn: function (root) {
        const W = 600,
          H = 430,
          CX = W / 2,
          CY = 196;
        const RX = 168,
          RY = 84,
          DEPTH = 48,
          LIFT = 16;

        const data = [
          { k: "Rent", v: 1450, c: "#6C7BFF" },
          { k: "Savings", v: 600, c: "#3ECF8E" },
          { k: "Groceries", v: 520, c: "#FFB13D" },
          { k: "Fun", v: 310, c: "#FF6B9A" },
          { k: "Utilities", v: 280, c: "#B57BFF" },
          { k: "Transport", v: 240, c: "#FF8A5B" }
        ];
        const total = d3.sum(data, (d) => d.v);
        const money = d3.format("$,.0f");

        // cumulative angles, 0 = 3 o'clock, sweeping clockwise on screen
        let acc = 0;
        data.forEach((d) => {
          d.a0 = acc;
          acc += (d.v / total) * Math.PI * 2;
          d.a1 = acc;
          d.off = 0;
          d.tgt = 0;
        });

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);

        svg
          .append("ellipse")
          .attr("cx", CX)
          .attr("cy", CY + DEPTH + 16)
          .attr("rx", RX * 0.94)
          .attr("ry", RY * 0.34)
          .attr("fill", "currentColor")
          .attr("opacity", 0.09);

        const gp = svg.append("g").attr("transform", `translate(${CX},${CY})`);
        const wallG = gp.append("g");
        const topG = gp.append("g");

        const wall = wallG
          .selectAll("path")
          .data(data)
          .join("path")
          .attr("fill", (d) => d3.color(d.c).darker(0.85).formatHex());
        const top = topG
          .selectAll("path")
          .data(data)
          .join("path")
          .attr("fill", (d) => d.c)
          .attr("stroke", (d) => d3.color(d.c).darker(0.35).formatHex())
          .attr("stroke-width", 1);

        // --- readout ------------------------------------------------------
        const name = svg
          .append("text")
          .attr("x", 22)
          .attr("y", 38)
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("font-size", 27)
          .attr("font-weight", 600)
          .attr("fill", "currentColor");
        const amount = svg
          .append("text")
          .attr("x", 22)
          .attr("y", 64)
          .attr("font-size", 13)
          .attr("fill", "currentColor")
          .attr("opacity", 0.6);
        svg
          .append("text")
          .attr("x", W - 22)
          .attr("y", 38)
          .attr("text-anchor", "end")
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("font-size", 27)
          .attr("font-weight", 600)
          .attr("fill", "currentColor")
          .text(money(total));
        svg
          .append("text")
          .attr("x", W - 22)
          .attr("y", 60)
          .attr("text-anchor", "end")
          .attr("font-size", 9.5)
          .attr("letter-spacing", "0.24em")
          .attr("fill", "currentColor")
          .attr("opacity", 0.45)
          .text("PER MONTH");

        const leg = svg
          .append("g")
          .attr("transform", `translate(24,${H - 20})`);
        let ox = 0;
        data.forEach((d) => {
          const gg = leg.append("g").attr("transform", `translate(${ox},0)`);
          gg.append("circle").attr("r", 4.5).attr("cy", -3).attr("fill", d.c);
          gg.append("text")
            .attr("x", 11)
            .attr("font-size", 10)
            .attr("fill", "currentColor")
            .attr("opacity", 0.65)
            .text(d.k);
          ox += 30 + d.k.length * 6.2;
        });

        // --- geometry -----------------------------------------------------
        function pt(a) {
          return [Math.cos(a) * RX, Math.sin(a) * RY];
        }

        function topPath(d, rot) {
          const a0 = d.a0 + rot,
            a1 = d.a1 + rot;
          const p0 = pt(a0),
            p1 = pt(a1);
          const la = a1 - a0 > Math.PI ? 1 : 0;
          const ex = d.ex,
            ey = d.ey;
          return (
            `M${ex},${ey}L${p0[0] + ex},${p0[1] + ey}` +
            `A${RX},${RY} 0 ${la},1 ${p1[0] + ex},${p1[1] + ey}Z`
          );
        }

        function wallPath(d, rot) {
          const a0 = d.a0 + rot,
            a1 = d.a1 + rot;
          const ex = d.ex,
            ey = d.ey;
          let out = "";

          // extruded cut faces, only worth drawing once the slice is out
          if (d.off > 0.04) {
            [a0, a1].forEach((a) => {
              const p = pt(a);
              out +=
                `M${ex},${ey}L${p[0] + ex},${p[1] + ey}` +
                `L${p[0] + ex},${p[1] + ey + DEPTH}L${ex},${ey + DEPTH}Z`;
            });
          }

          // outer wall, clipped to the front-facing half (sin > 0)
          for (let k = -1; k <= 2; k++) {
            const s = Math.max(a0, k * 2 * Math.PI);
            const e = Math.min(a1, k * 2 * Math.PI + Math.PI);
            if (e <= s) continue;
            const p0 = pt(s),
              p1 = pt(e);
            const la = e - s > Math.PI ? 1 : 0;
            out +=
              `M${p0[0] + ex},${p0[1] + ey}` +
              `A${RX},${RY} 0 ${la},1 ${p1[0] + ex},${p1[1] + ey}` +
              `L${p1[0] + ex},${p1[1] + ey + DEPTH}` +
              `A${RX},${RY} 0 ${la},0 ${p0[0] + ex},${p0[1] + ey + DEPTH}Z`;
          }
          return out;
        }

        // --- loop ---------------------------------------------------------
        let rot = -Math.PI / 2,
          focus = 0,
          shown = -1;

        setInterval(() => {
          focus = (focus + 1) % data.length;
          data.forEach((d, i) => (d.tgt = i === focus ? 1 : 0));
        }, 2600);

        d3.timer((elapsed, delta) => {
          rot += 0.00016 * (delta || 16);

          data.forEach((d) => {
            d.off += (d.tgt - d.off) * 0.11;
            const m = (d.a0 + d.a1) / 2 + rot;
            d.ex = Math.cos(m) * 30 * d.off;
            d.ey = Math.sin(m) * 15 * d.off - LIFT * d.off;
          });

          // painter's algorithm: back slices first
          const depth = (d) => Math.sin((d.a0 + d.a1) / 2 + rot);
          wall
            .sort((a, b) => depth(a) - depth(b))
            .attr("d", (d) => wallPath(d, rot));
          top
            .sort((a, b) => depth(a) - depth(b))
            .attr("d", (d) => topPath(d, rot));

          if (shown !== focus) {
            shown = focus;
            const d = data[focus];
            name.text(d.k);
            amount.text(
              money(d.v) +
                "  ·  " +
                Math.round((d.v / total) * 100) +
                "% of spend"
            );
          }
        });
      }
    },

    /* ---------------------------------------------------------------- 04 */
    {
      title: "Half-Donut Gauge",
      note: "The original pen, rebuilt on D3 v7: arc tween sweeps each wedge open while a number tween counts the centre label up.",
      tags: ["d3.arc", "attrTween", "interpolateNumber"],
      fn: function (root) {
        const W = 600,
          H = 320,
          R = 250,
          TH = 62;
        const data = [18, 12, 9, 7, 6, 4, 3, 2];
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const g = svg
          .append("g")
          .attr("transform", `translate(${W / 2},${H - 34})`);

        const pie = d3
          .pie()
          .sort(null)
          .startAngle(-Math.PI / 2)
          .endAngle(Math.PI / 2);
        const arc = d3
          .arc()
          .innerRadius(R - TH)
          .outerRadius(R)
          .cornerRadius(2)
          .padAngle(0.012);
        const arcs = pie(data);

        const path = g
          .selectAll("path")
          .data(arcs)
          .join("path")
          .attr("fill", (d, i) => color(i));

        const value = g
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", -30)
          .attr("font-size", 78)
          .attr("font-weight", 600)
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("fill", "currentColor");

        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 2)
          .attr("font-size", 12)
          .attr("letter-spacing", "0.24em")
          .attr("fill", "currentColor")
          .attr("opacity", 0.5)
          .text("CAPACITY USED");

        function run() {
          path
            .attr("d", (d) => arc({ ...d, endAngle: d.startAngle }))
            .transition()
            .duration(1100)
            .delay((d, i) => i * 85)
            .ease(d3.easeCubicOut)
            .attrTween("d", (d) => {
              const i = d3.interpolate(d.startAngle, d.endAngle);
              return (t) => arc({ ...d, endAngle: i(t) });
            });

          value
            .transition()
            .duration(1800)
            .ease(d3.easeCubicOut)
            .tween("count", function () {
              const i = d3.interpolateNumber(0, 68);
              return (t) => {
                this.textContent = Math.round(i(t)) + "%";
              };
            });
        }
        run();
        setInterval(run, 4600);
      }
    },

    /* ---------------------------------------------------------------- 05 */
    {
      title: "Bar Chart Race",
      note: "Ranked bars re-sorted on every tick. Object constancy comes from the key function — bars slide to new ranks instead of being redrawn.",
      tags: ["data join", "key function", "easeLinear"],
      fn: function (root) {
        const W = 600,
          H = 380,
          m = { t: 26, r: 66, b: 26, l: 96 },
          N = 8;
        const names = [
          "ALPHA",
          "BOREAL",
          "CINDER",
          "DELTA",
          "EOS",
          "FERRO",
          "GLYPH",
          "HALO",
          "IRIS",
          "JUNO",
          "KILO",
          "LUMEN"
        ];
        const color = d3.scaleOrdinal(
          names,
          d3.schemeTableau10.concat(d3.schemeSet2)
        );
        const step = (H - m.t - m.b) / N;

        const values = new Map(names.map((n) => [n, 20 + Math.random() * 70]));
        let year = 2014;

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const x = d3.scaleLinear().range([m.l, W - m.r]);
        const bars = svg.append("g");
        const yearLabel = svg
          .append("text")
          .attr("x", W - 10)
          .attr("y", H - 12)
          .attr("text-anchor", "end")
          .attr("font-size", 46)
          .attr("font-weight", 600)
          .attr("opacity", 0.16)
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("fill", "currentColor");

        function tick() {
          names.forEach((n) =>
            values.set(n, values.get(n) * (1 + Math.random() * 0.16))
          );
          if (++year > 2026) {
            year = 2014;
            names.forEach((n) => values.set(n, 20 + Math.random() * 70));
          }

          const top = [...values].sort((a, b) => b[1] - a[1]).slice(0, N);
          x.domain([0, d3.max(top, (d) => d[1])]);
          yearLabel.text(year);

          const t = svg.transition().duration(1000).ease(d3.easeLinear);

          bars
            .selectAll("g.bar")
            .data(top, (d) => d[0])
            .join(
              (enter) => {
                const gg = enter
                  .append("g")
                  .attr("class", "bar")
                  .attr("opacity", 0)
                  .attr(
                    "transform",
                    (d, i) => `translate(0,${m.t + i * step})`
                  );
                gg.append("rect")
                  .attr("x", m.l)
                  .attr("height", step - 9)
                  .attr("width", 0)
                  .attr("rx", 2)
                  .attr("fill", (d) => color(d[0]));
                gg.append("text")
                  .attr("class", "nm")
                  .attr("x", m.l - 9)
                  .attr("y", (step - 9) / 2)
                  .attr("dy", "0.35em")
                  .attr("text-anchor", "end")
                  .attr("font-size", 10.5)
                  .attr("font-weight", 600)
                  .attr("letter-spacing", "0.08em")
                  .attr("fill", "currentColor")
                  .text((d) => d[0]);
                gg.append("text")
                  .attr("class", "vl")
                  .attr("y", (step - 9) / 2)
                  .attr("dy", "0.35em")
                  .attr("font-size", 10.5)
                  .attr("fill", "currentColor")
                  .attr("opacity", 0.55);
                return gg;
              },
              (update) => update,
              (exit) => exit.transition(t).attr("opacity", 0).remove()
            )
            .transition(t)
            .attr("opacity", 1)
            .attr("transform", (d, i) => `translate(0,${m.t + i * step})`)
            .call((sel) =>
              sel.select("rect").attr("width", (d) => x(d[1]) - m.l)
            )
            .call((sel) =>
              sel
                .select(".vl")
                .attr("x", (d) => x(d[1]) + 7)
                .textTween(function (d) {
                  const i = d3.interpolateNumber(+this.textContent || 0, d[1]);
                  return (t2) => Math.round(i(t2)).toLocaleString();
                })
            );
        }
        tick();
        setInterval(tick, 1100);
      }
    },

    /* ---------------------------------------------------------------- 06 */
    {
      title: "Animated Treemap",
      note: "The layout is recomputed against new values every cycle; cells keep identity by name so rectangles glide and resize rather than pop.",
      tags: ["d3.treemap", "d3.hierarchy", "easeCubicInOut"],
      fn: function (root) {
        const W = 600,
          H = 380;
        const cats = [
          "Assembly",
          "Test",
          "Rework",
          "Kitting",
          "Burn-in",
          "Inspect",
          "Pack",
          "Stage",
          "Calibrate",
          "QA Hold"
        ];
        const color = d3.scaleOrdinal(cats, d3.schemeTableau10);
        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);

        function draw() {
          const data = {
            name: "root",
            children: cats.map((n) => ({
              name: n,
              value: 12 + Math.random() * 92
            }))
          };
          const nodes = d3
            .treemap()
            .size([W, H])
            .paddingInner(3)
            .round(true)(
              d3
                .hierarchy(data)
                .sum((d) => d.value)
                .sort((a, b) => b.value - a.value)
            )
            .leaves();

          const t = svg.transition().duration(1500).ease(d3.easeCubicInOut);

          const cell = svg
            .selectAll("g.cell")
            .data(nodes, (d) => d.data.name)
            .join((enter) => {
              const gg = enter
                .append("g")
                .attr("class", "cell")
                .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
              gg.append("rect")
                .attr("rx", 2)
                .attr("width", (d) => d.x1 - d.x0)
                .attr("height", (d) => d.y1 - d.y0)
                .attr("fill", (d) => color(d.data.name));
              gg.append("text")
                .attr("class", "lb")
                .attr("x", 9)
                .attr("y", 20)
                .attr("fill", "#fff")
                .attr("font-size", 11)
                .attr("font-weight", 600)
                .attr("letter-spacing", "0.04em")
                .text((d) => d.data.name);
              gg.append("text")
                .attr("class", "vl")
                .attr("x", 9)
                .attr("y", 36)
                .attr("fill", "#fff")
                .attr("opacity", 0.75)
                .attr("font-size", 10);
              return gg;
            });

          cell
            .transition(t)
            .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
          cell
            .select("rect")
            .transition(t)
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0);
          cell
            .select(".lb")
            .transition(t)
            .attr("opacity", (d) =>
              d.x1 - d.x0 > 72 && d.y1 - d.y0 > 30 ? 1 : 0
            );
          cell
            .select(".vl")
            .transition(t)
            .attr("opacity", (d) =>
              d.x1 - d.x0 > 72 && d.y1 - d.y0 > 48 ? 0.75 : 0
            )
            .textTween(function (d) {
              const i = d3.interpolateNumber(+this.textContent || 0, d.value);
              return (t2) => Math.round(i(t2)) + " hrs";
            });
        }
        draw();
        setInterval(draw, 2600);
      }
    },

    /* ---------------------------------------------------------------- 07 */
    {
      title: "Connected Scatterplot",
      note: "A dash-offset trick draws the path as if by hand, while a leading marker rides the curve via getPointAtLength and the dots fade in behind it.",
      tags: ["stroke-dashoffset", "curveCatmullRom", "getPointAtLength"],
      fn: function (root) {
        const W = 600,
          H = 380,
          m = { t: 26, r: 26, b: 38, l: 46 },
          n = 36;
        const pts = d3.range(n).map((i) => {
          const a = (i / (n - 1)) * Math.PI * 2.3;
          return {
            x: 40 + i * 1.7 + Math.sin(a) * 15,
            y: 42 + Math.cos(a * 0.9) * 19 + i * 0.85,
            k: 1990 + i
          };
        });

        const x = d3.scaleLinear(
          d3.extent(pts, (d) => d.x),
          [m.l, W - m.r]
        );
        const y = d3.scaleLinear(
          d3.extent(pts, (d) => d.y),
          [H - m.b, m.t]
        );

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);

        svg
          .append("g")
          .attr("transform", `translate(0,${H - m.b})`)
          .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
          .call((g) => g.selectAll(".domain,.tick line").attr("opacity", 0.25))
          .call((g) => g.selectAll("text").attr("opacity", 0.55));
        svg
          .append("g")
          .attr("transform", `translate(${m.l},0)`)
          .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
          .call((g) => g.selectAll(".domain,.tick line").attr("opacity", 0.25))
          .call((g) => g.selectAll("text").attr("opacity", 0.55));

        const line = d3
          .line()
          .curve(d3.curveCatmullRom)
          .x((d) => x(d.x))
          .y((d) => y(d.y));
        const path = svg
          .append("path")
          .datum(pts)
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", d3.schemeTableau10[0])
          .attr("stroke-width", 2.25)
          .attr("stroke-linecap", "round");

        const L = path.node().getTotalLength();

        const dots = svg
          .selectAll("circle.pt")
          .data(pts)
          .join("circle")
          .attr("class", "pt")
          .attr("r", 3.2)
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))
          .attr("fill", "currentColor");

        const head = svg
          .append("circle")
          .attr("r", 5.5)
          .attr("fill", d3.schemeTableau10[2]);

        function run() {
          path
            .attr("stroke-dasharray", `${L} ${L}`)
            .attr("stroke-dashoffset", L)
            .transition()
            .duration(4200)
            .ease(d3.easeCubicInOut)
            .attr("stroke-dashoffset", 0);

          dots
            .attr("opacity", 0)
            .transition()
            .delay((d, i) => (i / (n - 1)) * 4000)
            .duration(300)
            .attr("opacity", 1);

          head
            .attr("opacity", 1)
            .transition()
            .duration(4200)
            .ease(d3.easeCubicInOut)
            .attrTween("transform", () => (t) => {
              const p = path.node().getPointAtLength(t * L);
              return `translate(${p.x},${p.y})`;
            })
            .transition()
            .duration(400)
            .attr("opacity", 0);
        }
        run();
        setInterval(run, 5800);
      }
    },

    /* ---------------------------------------------------------------- 08 */
    {
      title: "Stacked to Grouped Bars",
      note: "Same rectangles, two layouts. Only x, width, y and height are interpolated — a staggered delay per column gives the change a direction.",
      tags: ["scaleBand", "staggered delay", "layout swap"],
      fn: function (root) {
        const W = 600,
          H = 360,
          m = { t: 24, r: 18, b: 30, l: 42 };
        const n = 5,
          groups = 9;
        const rnd = d3.randomUniform(6, 30);
        const series = d3.range(n).map(() => d3.range(groups).map(() => rnd()));

        const yStackMax = d3.max(d3.range(groups), (j) =>
          d3.sum(series, (s) => s[j])
        );
        const yGroupMax = d3.max(series, (s) => d3.max(s));

        const x = d3
          .scaleBand()
          .domain(d3.range(groups))
          .rangeRound([m.l, W - m.r])
          .padding(0.18);
        const y = d3.scaleLinear().range([H - m.b, m.t]);
        const color = d3.scaleOrdinal(d3.range(n), d3.schemeTableau10);

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        svg
          .append("line")
          .attr("x1", m.l - 6)
          .attr("x2", W - m.r)
          .attr("y1", H - m.b)
          .attr("y2", H - m.b)
          .attr("stroke", "currentColor")
          .attr("opacity", 0.25);

        const cells = [];
        series.forEach((s, i) => s.forEach((v, j) => cells.push({ v, i, j })));

        const rect = svg
          .append("g")
          .selectAll("rect")
          .data(cells)
          .join("rect")
          .attr("fill", (d) => color(d.i))
          .attr("x", (d) => x(d.j))
          .attr("width", x.bandwidth())
          .attr("y", H - m.b)
          .attr("height", 0)
          .attr("rx", 1);

        const label = svg
          .append("text")
          .attr("x", m.l)
          .attr("y", m.t - 6)
          .attr("font-size", 10)
          .attr("letter-spacing", "0.2em")
          .attr("fill", "currentColor")
          .attr("opacity", 0.5);

        function base(d) {
          let s = 0;
          for (let k = 0; k < d.i; k++) s += series[k][d.j];
          return s;
        }

        function stacked() {
          y.domain([0, yStackMax]);
          label.text("STACKED");
          rect
            .transition()
            .duration(700)
            .delay((d) => d.j * 22)
            .ease(d3.easeCubicInOut)
            .attr("x", (d) => x(d.j))
            .attr("width", x.bandwidth())
            .attr("y", (d) => y(base(d) + d.v))
            .attr("height", (d) => y(base(d)) - y(base(d) + d.v));
        }
        function grouped() {
          y.domain([0, yGroupMax]);
          label.text("GROUPED");
          const bw = x.bandwidth() / n;
          rect
            .transition()
            .duration(700)
            .delay((d) => d.j * 22)
            .ease(d3.easeCubicInOut)
            .attr("x", (d) => x(d.j) + bw * d.i)
            .attr("width", bw - 1)
            .attr("y", (d) => y(d.v))
            .attr("height", (d) => y(0) - y(d.v));
        }

        let isStacked = true;
        stacked();
        setInterval(() => {
          isStacked = !isStacked;
          isStacked ? stacked() : grouped();
        }, 2900);
      }
    },

    /* ---------------------------------------------------------------- 09 */
    {
      title: "Streamgraph Transitions",
      note: "Wiggle offset plus inside-out order keeps the ribbon balanced. New random bumps are generated every cycle and the path data is interpolated in place.",
      tags: ["d3.stack", "stackOffsetWiggle", "curveBasis"],
      fn: function (root) {
        const W = 600,
          H = 340,
          k = 7,
          n = 52;
        const color = d3.scaleOrdinal(d3.range(k), d3.schemeTableau10);

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const x = d3.scaleLinear([0, n - 1], [0, W]);
        const y = d3.scaleLinear([0, 1], [H, 0]);
        const area = d3
          .area()
          .x((d, i) => x(i))
          .y0((d) => y(d[0]))
          .y1((d) => y(d[1]))
          .curve(d3.curveBasis);
        const stack = d3
          .stack()
          .keys(d3.range(k))
          .offset(d3.stackOffsetWiggle)
          .order(d3.stackOrderInsideOut);

        function bump(a) {
          const xx = 1 / (0.1 + Math.random()),
            yy = 2 * Math.random() - 0.5,
            zz = 10 / (0.1 + Math.random());
          for (let i = 0; i < n; i++) {
            const w = (i / n - yy) * zz;
            a[i] += xx * Math.exp(-w * w);
          }
        }
        function matrix() {
          return d3.range(k).map(() => {
            const a = new Array(n).fill(0);
            for (let i = 0; i < 5; i++) bump(a);
            return a;
          });
        }

        let paths = null;
        function draw(duration) {
          const cols = matrix();
          const rows = d3.range(n).map((i) => {
            const o = {};
            cols.forEach((s, j) => (o[j] = s[i]));
            return o;
          });
          const layers = stack(rows);
          y.domain([
            d3.min(layers, (l) => d3.min(l, (d) => d[0])),
            d3.max(layers, (l) => d3.max(l, (d) => d[1]))
          ]);

          if (!paths) {
            paths = svg
              .selectAll("path")
              .data(layers)
              .join("path")
              .attr("fill", (d, i) => color(i))
              .attr("d", area);
          } else {
            paths
              .data(layers)
              .transition()
              .duration(duration)
              .ease(d3.easeCubicInOut)
              .attr("d", area);
          }
        }
        draw(0);
        setInterval(() => draw(2300), 3100);
      }
    },

    /* ---------------------------------------------------------------- 10 */
    {
      title: "Scatterplot Tour",
      note: "Two hundred points tour four layouts — clusters, grid, ring, wave. Per-point delay turns a hard cut into a sweep across the frame.",
      tags: ["transition delay", "layout morph", "easeCubicInOut"],
      fn: function (root) {
        const W = 600,
          H = 360,
          N = 200;
        const color = d3.scaleOrdinal(d3.schemeTableau10);
        const pts = d3.range(N).map((i) => ({ i, g: i % 6 }));

        const centres = [
          [0.22, 0.3],
          [0.5, 0.74],
          [0.78, 0.34],
          [0.36, 0.62],
          [0.66, 0.2],
          [0.5, 0.46]
        ];
        const cols = 20,
          rows = Math.ceil(N / cols);

        const layouts = [
          (p) => {
            const c = centres[p.g];
            return [
              c[0] * W + (Math.random() - 0.5) * 88,
              c[1] * H + (Math.random() - 0.5) * 70
            ];
          },
          (p) => [
            64 + (p.i % cols) * ((W - 128) / (cols - 1)),
            46 + Math.floor(p.i / cols) * ((H - 92) / (rows - 1))
          ],
          (p) => {
            const a = (p.i / N) * Math.PI * 2;
            return [W / 2 + Math.cos(a) * 210, H / 2 + Math.sin(a) * 138];
          },
          (p) => {
            const t = p.i / N;
            return [
              40 + t * (W - 80),
              H / 2 + Math.sin(t * Math.PI * 4) * (34 + p.g * 9)
            ];
          }
        ];
        const names = ["CLUSTERS", "GRID", "RING", "WAVE"];

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const node = svg
          .selectAll("circle")
          .data(pts)
          .join("circle")
          .attr("r", 4.2)
          .attr("fill", (d) => color(d.g))
          .attr("fill-opacity", 0.85)
          .attr("cx", W / 2)
          .attr("cy", H / 2);

        const label = svg
          .append("text")
          .attr("x", 12)
          .attr("y", 20)
          .attr("font-size", 10)
          .attr("letter-spacing", "0.22em")
          .attr("fill", "currentColor")
          .attr("opacity", 0.5);

        let step = 0;
        function go() {
          const layout = layouts[step % layouts.length];
          label.text(names[step % names.length]);
          step++;
          node
            .transition()
            .duration(1300)
            .delay((d) => (d.i / N) * 500)
            .ease(d3.easeCubicInOut)
            .attr("cx", (d) => layout(d)[0])
            .attr("cy", (d) => layout(d)[1]);
        }
        go();
        setInterval(go, 2600);
      }
    },

    /* ---------------------------------------------------------------- 11 */
    {
      title: "Zoomable Icicle",
      note: "A partition layout rescaled to the focused node. Every descendant is remapped into the new domain, so the drill-down reads as a single continuous zoom.",
      tags: ["d3.partition", "domain rescale", "auto drill"],
      fn: function (root) {
        const W = 600,
          H = 360;
        const data = {
          name: "ALL",
          children: [
            {
              name: "CPU",
              children: [
                { name: "i3", value: 40 },
                { name: "i5", value: 26 },
                { name: "i7", value: 18 }
              ]
            },
            {
              name: "Chassis",
              children: [
                { name: "17-inch", value: 34 },
                { name: "Sub-rack", value: 22 },
                { name: "Desktop", value: 15 }
              ]
            },
            {
              name: "Systems",
              children: [
                { name: "ATX", value: 28 },
                { name: "ITX", value: 31 },
                { name: "SDU", value: 12 }
              ]
            },
            {
              name: "Cables",
              children: [
                { name: "Power", value: 17 },
                { name: "RF", value: 11 }
              ]
            }
          ]
        };
        const color = d3.scaleOrdinal(d3.schemeTableau10);
        const hier = d3.partition().size([H, W])(
          d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value)
        );

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const cid = "icicle-clip-" + Math.random().toString(36).slice(2, 8);
        svg
          .append("defs")
          .append("clipPath")
          .attr("id", cid)
          .append("rect")
          .attr("width", W)
          .attr("height", H);

        const frame = svg.append("g").attr("clip-path", `url(#${cid})`);
        const cell = frame
          .selectAll("g")
          .data(hier.descendants())
          .join("g")
          .attr("transform", (d) => `translate(${d.y0},${d.x0})`);

        cell
          .append("rect")
          .attr("width", (d) => d.y1 - d.y0 - 1)
          .attr("height", (d) => d.x1 - d.x0 - 1)
          .attr("rx", 2)
          .attr("fill", (d) =>
            color((d.depth ? d.ancestors().slice(-2)[0] : d).data.name)
          )
          .attr("fill-opacity", (d) => 0.35 + d.depth * 0.28);

        cell
          .append("text")
          .attr("x", 8)
          .attr("y", (d) => (d.x1 - d.x0) / 2)
          .attr("dy", "0.35em")
          .attr("font-size", 10.5)
          .attr("font-weight", 500)
          .attr("fill", "currentColor")
          .attr("opacity", (d) => (d.x1 - d.x0 > 18 ? 0.9 : 0))
          .text((d) => d.data.name);

        const stops = [hier, ...hier.children];
        let i = 0;

        function focus(p) {
          hier.each(
            (d) =>
              (d.tgt = {
                x0: ((d.x0 - p.x0) / (p.x1 - p.x0)) * H,
                x1: ((d.x1 - p.x0) / (p.x1 - p.x0)) * H,
                y0: d.y0 - p.y0,
                y1: d.y1 - p.y0
              })
          );
          const t = svg.transition().duration(1200).ease(d3.easeCubicInOut);
          cell
            .transition(t)
            .attr("transform", (d) => `translate(${d.tgt.y0},${d.tgt.x0})`)
            .attr("opacity", (d) =>
              d.tgt.y0 < 0 || d.tgt.x1 < 0 || d.tgt.x0 > H ? 0 : 1
            );
          cell
            .select("rect")
            .transition(t)
            .attr("width", (d) => Math.max(0, d.tgt.y1 - d.tgt.y0 - 1))
            .attr("height", (d) => Math.max(0, d.tgt.x1 - d.tgt.x0 - 1));
          cell
            .select("text")
            .transition(t)
            .attr("y", (d) => (d.tgt.x1 - d.tgt.x0) / 2)
            .attr("opacity", (d) => (d.tgt.x1 - d.tgt.x0 > 18 ? 0.9 : 0));
        }
        focus(hier);
        setInterval(() => {
          i = (i + 1) % stops.length;
          focus(stops[i]);
        }, 2800);
      }
    },

    /* ---------------------------------------------------------------- 12 */
    {
      title: "Hierarchical Bar Chart",
      note: "A drill-down that keeps its bearings: outgoing bars exit in the travel direction, incoming bars enter from the opposite edge and grow to scale.",
      tags: ["enter/exit", "directional transition", "breadcrumb"],
      fn: function (root) {
        const W = 600,
          H = 340,
          m = { t: 40, r: 26, b: 22, l: 104 };
        const data = {
          name: "All Work Orders",
          children: [
            {
              name: "CPU",
              children: [
                { name: "i3", value: 42 },
                { name: "i5", value: 31 },
                { name: "i7", value: 24 },
                { name: "i9", value: 16 }
              ]
            },
            {
              name: "Chassis",
              children: [
                { name: "17-inch", value: 38 },
                { name: "Sub-rack", value: 27 },
                { name: "Mobile", value: 14 }
              ]
            },
            {
              name: "Systems",
              children: [
                { name: "ATX", value: 33 },
                { name: "ITX", value: 29 },
                { name: "Mobile", value: 21 },
                { name: "Desktop", value: 11 }
              ]
            },
            {
              name: "Cables",
              children: [
                { name: "Data", value: 25 },
                { name: "RF", value: 18 },
                { name: "Power", value: 9 }
              ]
            }
          ]
        };
        const color = d3.scaleOrdinal(d3.schemeTableau10);
        const total = (c) =>
          c.value != null ? c.value : d3.sum(c.children, (d) => d.value);

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const x = d3.scaleLinear().range([m.l, W - m.r]);
        const bars = svg.append("g");

        const crumb = svg
          .append("text")
          .attr("x", 12)
          .attr("y", 22)
          .attr("font-size", 11)
          .attr("letter-spacing", "0.2em")
          .attr("font-weight", 600)
          .attr("fill", "currentColor");

        function show(node, dir) {
          const items = node.children.map((c, i) => ({
            name: c.name,
            value: total(c),
            i
          }));
          x.domain([0, d3.max(items, (d) => d.value)]);
          crumb.text(node.name.toUpperCase());

          const step = (H - m.t - m.b) / Math.max(items.length, 4);
          const t = svg.transition().duration(850).ease(d3.easeCubicInOut);

          bars
            .selectAll("g.b")
            .data(items, (d) => d.name)
            .join(
              (enter) => {
                const gg = enter
                  .append("g")
                  .attr("class", "b")
                  .attr("opacity", 0)
                  .attr(
                    "transform",
                    (d, i) => `translate(${dir * 44},${m.t + i * step})`
                  );
                gg.append("rect")
                  .attr("x", m.l)
                  .attr("height", step - 10)
                  .attr("width", 0)
                  .attr("rx", 2)
                  .attr("fill", (d) => color(d.name));
                gg.append("text")
                  .attr("x", m.l - 9)
                  .attr("y", (step - 10) / 2)
                  .attr("dy", "0.35em")
                  .attr("text-anchor", "end")
                  .attr("font-size", 10.5)
                  .attr("fill", "currentColor")
                  .text((d) => d.name);
                gg.append("text")
                  .attr("class", "v")
                  .attr("y", (step - 10) / 2)
                  .attr("dy", "0.35em")
                  .attr("font-size", 10)
                  .attr("fill", "currentColor")
                  .attr("opacity", 0.55)
                  .text((d) => d.value);
                return gg;
              },
              (update) => update,
              (exit) =>
                exit
                  .transition(t)
                  .attr("opacity", 0)
                  .attr(
                    "transform",
                    (d, i) => `translate(${-dir * 44},${m.t + i * step})`
                  )
                  .remove()
            )
            .transition(t)
            .attr("opacity", 1)
            .attr("transform", (d, i) => `translate(0,${m.t + i * step})`)
            .call((sel) =>
              sel.select("rect").attr("width", (d) => x(d.value) - m.l)
            )
            .call((sel) => sel.select(".v").attr("x", (d) => x(d.value) + 7));
        }

        let idx = -1;
        function cycle() {
          idx++;
          if (idx >= data.children.length) {
            idx = -1;
            show(data, -1);
          } else show(data.children[idx], 1);
        }
        show(data, 1);
        setInterval(cycle, 2600);
      }
    },

    /* ---------------------------------------------------------------- 13 */
    {
      title: "Wealth & Health of Nations",
      note: "A continuous timer drives the clock instead of discrete transitions — every frame recomputes income, life expectancy and population for the current year.",
      tags: ["d3.timer", "scaleLog", "scaleSqrt"],
      fn: function (root) {
        const W = 600,
          H = 380,
          m = { t: 22, r: 22, b: 38, l: 46 };
        const rnd = d3.randomLcg(0.42);
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        const nations = d3.range(24).map((i) => ({
          i,
          inc0: 320 * Math.pow(10, rnd() * 1.55),
          life0: 36 + rnd() * 20,
          g: 0.012 + rnd() * 0.032,
          l: 0.1 + rnd() * 0.38,
          pop: 3 + rnd() * 40,
          pg: 0.008 + rnd() * 0.02
        }));

        const x = d3.scaleLog([250, 90000], [m.l, W - m.r]);
        const y = d3.scaleLinear([28, 90], [H - m.b, m.t]);
        const r = d3.scaleSqrt([0, 120], [3, 28]);

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        svg
          .append("g")
          .attr("transform", `translate(0,${H - m.b})`)
          .call(d3.axisBottom(x).ticks(4, "~s").tickSizeOuter(0))
          .call((g) => g.selectAll(".domain,.tick line").attr("opacity", 0.25))
          .call((g) => g.selectAll("text").attr("opacity", 0.55));
        svg
          .append("g")
          .attr("transform", `translate(${m.l},0)`)
          .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
          .call((g) => g.selectAll(".domain,.tick line").attr("opacity", 0.25))
          .call((g) => g.selectAll("text").attr("opacity", 0.55));

        const yearLabel = svg
          .append("text")
          .attr("x", W - 16)
          .attr("y", H - 52)
          .attr("text-anchor", "end")
          .attr("font-size", 54)
          .attr("font-weight", 600)
          .attr("opacity", 0.14)
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("fill", "currentColor");

        const node = svg
          .selectAll("circle")
          .data(nations)
          .join("circle")
          .attr("fill", (d) => color(d.i % 10))
          .attr("fill-opacity", 0.7)
          .attr("stroke", (d) => color(d.i % 10))
          .attr("stroke-width", 1.2);

        const Y0 = 1960,
          Y1 = 2020,
          PERIOD = 26000;
        d3.timer((elapsed) => {
          const year = Y0 + ((elapsed % PERIOD) / PERIOD) * (Y1 - Y0);
          const dt = year - Y0;
          yearLabel.text(Math.floor(year));
          node
            .attr("cx", (d) =>
              x(Math.min(89000, d.inc0 * Math.pow(1 + d.g, dt)))
            )
            .attr("cy", (d) => y(Math.min(88, d.life0 + d.l * dt)))
            .attr("r", (d) => r(d.pop * Math.pow(1 + d.pg, dt)));
        });
      }
    },

    /* ---------------------------------------------------------------- 14 */
    {
      title: "Force-Directed Graph",
      note: "Link, charge, collide and centring forces settle a random network. The simulation is scattered and reheated on a loop so the layout keeps re-forming.",
      tags: ["forceSimulation", "forceLink", "alpha reheat"],
      fn: function (root) {
        const W = 600,
          H = 380,
          N = 46;
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        const nodes = d3.range(N).map((i) => ({ id: i, g: i % 6 }));
        const links = d3
          .range(1, N)
          .map((i) => ({ source: i, target: Math.floor(Math.random() * i) }));
        d3.range(10).forEach(() =>
          links.push({
            source: Math.floor(Math.random() * N),
            target: Math.floor(Math.random() * N)
          })
        );

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const link = svg
          .append("g")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.22)
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke-width", 1);
        const node = svg
          .append("g")
          .selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("r", (d) => 4 + (d.id % 5))
          .attr("fill", (d) => color(d.g))
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.15);

        const sim = d3
          .forceSimulation(nodes)
          .force("link", d3.forceLink(links).distance(36).strength(0.55))
          .force("charge", d3.forceManyBody().strength(-88))
          .force("center", d3.forceCenter(W / 2, H / 2))
          .force("collide", d3.forceCollide(11))
          .alphaDecay(0.02)
          .on("tick", () => {
            // keep every node inside the frame so nothing escapes the card
            nodes.forEach((d) => {
              const r = 4 + (d.id % 5) + 2;
              d.x = Math.max(r, Math.min(W - r, d.x));
              d.y = Math.max(r, Math.min(H - r, d.y));
            });
            link
              .attr("x1", (d) => d.source.x)
              .attr("y1", (d) => d.source.y)
              .attr("x2", (d) => d.target.x)
              .attr("y2", (d) => d.target.y);
            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
          });

        setInterval(() => {
          nodes.forEach((n) => {
            n.x = W / 2 + (Math.random() - 0.5) * W * 0.6;
            n.y = H / 2 + (Math.random() - 0.5) * H * 0.6;
            n.vx = n.vy = 0;
          });
          sim.alpha(1).restart();
        }, 6500);
      }
    },

    /* ---------------------------------------------------------------- 15 */
    {
      title: "Kinetic Type & Logo Cut-In",
      note: "Not a chart — a motion graphic. Words are cut in through clip rectangles, then the AutonomousQ mark snaps in: the red target ring draws itself, the bullseye pops and the blue pointer flies in to hit it.",
      tags: ["clipPath wipe", "easeBackOut", "sequenced timeline"],
      fn: function (root) {
        const W = 600,
          H = 380;
        const words = ["DATA", "MOTION", "DESIGN"];
        const RED = "#FF1400",
          BLUE = "#1A16F0",
          ink = "currentColor";

        const svg = d3.select(root).append("svg").attr("viewBox", [0, 0, W, H]);
        const defs = svg.append("defs");

        // Clip rectangles: one per word, used to cut each word in and out.
        words.forEach((w, i) => {
          defs
            .append("clipPath")
            .attr("id", `wclip${i}`)
            .append("rect")
            .attr("class", "r")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", H);
        });

        // --- Word stage -------------------------------------------------
        const stage = svg.append("g");
        const wordEls = words.map((w, i) =>
          stage
            .append("g")
            .attr("clip-path", `url(#wclip${i})`)
            .append("text")
            .attr("x", W / 2)
            .attr("y", H / 2 + 16)
            .attr("text-anchor", "middle")
            .attr("font-family", "Fraunces, Georgia, serif")
            .attr("font-size", 76)
            .attr("font-weight", 600)
            .attr("letter-spacing", "-0.02em")
            .attr("fill", i === 1 ? RED : ink)
            .text(w)
        );

        // --- Logo: red target + blue pointer ----------------------------
        const logo = svg
          .append("g")
          .attr("transform", `translate(${W / 2 - 20},${H / 2 - 60}) scale(1)`)
          .attr("opacity", 0);

        const RING_R = 52,
          RING_W = 24;
        const ring = logo
          .append("circle")
          .attr("r", RING_R)
          .attr("fill", "none")
          .attr("stroke", RED)
          .attr("stroke-width", RING_W);

        const bull = logo
          .append("circle")
          .attr("r", 21)
          .attr("fill", RED)
          .attr("opacity", 0);

        const arrow = logo.append("g").attr("opacity", 0);
        arrow
          .append("line")
          .attr("x1", 40)
          .attr("y1", 40)
          .attr("x2", 94)
          .attr("y2", 94)
          .attr("stroke", BLUE)
          .attr("stroke-width", 15)
          .attr("stroke-linecap", "round");
        arrow
          .append("path")
          .attr("d", "M2,2 L66,32 L44,44 L32,66 Z")
          .attr("fill", BLUE)
          .attr("stroke", BLUE)
          .attr("stroke-width", 4)
          .attr("stroke-linejoin", "round");

        const mark = svg
          .append("text")
          .attr("x", W / 2)
          .attr("y", H / 2 + 84)
          .attr("text-anchor", "middle")
          .attr("font-family", "Fraunces, Georgia, serif")
          .attr("font-size", 40)
          .attr("font-weight", 500)
          .attr("letter-spacing", "-0.01em")
          .attr("fill", ink)
          .attr("opacity", 0)
          .text("AutonomousQ");

        const tag = svg
          .append("text")
          .attr("x", W / 2)
          .attr("y", H / 2 + 114)
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("letter-spacing", "0.36em")
          .attr("fill", ink)
          .attr("opacity", 0)
          .text("D3.JS ANIMATED ILLUSTRATION");

        const RL = 2 * Math.PI * RING_R;
        const CYCLE = 9200;

        function run() {
          // reset
          svg.selectAll("clipPath rect.r").attr("width", 0);
          wordEls.forEach((t) => t.attr("opacity", 1).attr("transform", null));
          logo
            .attr("opacity", 0)
            .attr(
              "transform",
              `translate(${W / 2 - 20},${H / 2 - 60}) scale(1.45)`
            );
          ring
            .attr("stroke-dasharray", `${RL} ${RL}`)
            .attr("stroke-dashoffset", RL);
          bull.attr("opacity", 0);
          arrow.attr("opacity", 0).attr("transform", "translate(74,74)");
          mark.attr("opacity", 0).attr("transform", "translate(0,22)");
          tag.attr("opacity", 0);

          // 1. words cut in and out, one after another
          words.forEach((w, i) => {
            const t0 = i * 900;
            d3.select(`#wclip${i} rect`)
              .attr("x", 0)
              .attr("width", 0)
              .transition()
              .delay(t0)
              .duration(420)
              .ease(d3.easeCubicOut)
              .attr("width", W)
              .transition()
              .delay(280)
              .duration(340)
              .ease(d3.easeCubicIn)
              .attr("x", W)
              .attr("width", 0);
            wordEls[i]
              .attr("transform", "translate(0,26)")
              .transition()
              .delay(t0)
              .duration(520)
              .ease(d3.easeCubicOut)
              .attr("transform", "translate(0,0)")
              .transition()
              .delay(180)
              .duration(340)
              .attr("transform", "translate(0,-26)");
          });

          // 2. logo cut-in: scale snap, ring draws, bullseye pops, pointer flies to target
          const T = words.length * 900 + 220;
          logo
            .transition()
            .delay(T)
            .duration(760)
            .ease(d3.easeBackOut.overshoot(1.9))
            .attr("opacity", 1)
            .attr(
              "transform",
              `translate(${W / 2 - 20},${H / 2 - 60}) scale(1)`
            );
          ring
            .transition()
            .delay(T + 120)
            .duration(900)
            .ease(d3.easeCubicInOut)
            .attr("stroke-dashoffset", 0);
          bull
            .transition()
            .delay(T + 780)
            .duration(380)
            .ease(d3.easeBackOut.overshoot(3))
            .attr("opacity", 1);
          arrow
            .transition()
            .delay(T + 900)
            .duration(620)
            .ease(d3.easeBackOut.overshoot(1.4))
            .attr("opacity", 1)
            .attr("transform", "translate(0,0)");

          // 3. wordmark and tagline rise
          mark
            .transition()
            .delay(T + 1240)
            .duration(700)
            .ease(d3.easeCubicOut)
            .attr("opacity", 1)
            .attr("transform", "translate(0,0)");
          tag
            .transition()
            .delay(T + 1480)
            .duration(700)
            .attr("opacity", 0.55);

          // 4. hold, then fade for the loop
          logo
            .transition()
            .delay(CYCLE - 700)
            .duration(560)
            .attr("opacity", 0);
          mark
            .transition()
            .delay(CYCLE - 700)
            .duration(560)
            .attr("opacity", 0);
          tag
            .transition()
            .delay(CYCLE - 700)
            .duration(560)
            .attr("opacity", 0);
        }
        run();
        setInterval(run, CYCLE);
      }
    }
  ];

  /* ================================================================
   PAGE ASSEMBLY
   ================================================================ */
  const D3_CDN = "https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js";

  function snippet(spec) {
    return [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "<title>" + spec.title + " — D3.js</title>",
      '<script src="' + D3_CDN + '"><\/script>',
      "<style>",
      "  body{margin:0;background:#fff;color:#16130F;",
      '       font-family:"IBM Plex Mono",ui-monospace,monospace}',
      "  #chart{max-width:820px;margin:48px auto;padding:0 16px}",
      "  svg{display:block;width:100%;height:auto;overflow:hidden}",
      "</style>",
      "</head>",
      "<body>",
      '<div id="chart"></div>',
      "<script>",
      "// " + spec.title + " — " + spec.tags.join(" · "),
      "const render = " + spec.fn.toString() + ";",
      'render(document.getElementById("chart"));',
      "<\/script>",
      "</body>",
      "</html>"
    ].join("\n");
  }

  const grid = document.getElementById("grid");

  /* ---- clipboard helper ------------------------------------------ */
  async function copyCode(spec, btn) {
    const code = snippet(spec);
    try {
      await navigator.clipboard.writeText(code);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const label = btn.textContent;
    btn.textContent = "Copied";
    btn.classList.add("ok");
    setTimeout(() => {
      btn.textContent = label;
      btn.classList.remove("ok");
    }, 1600);
  }

  /* ---- lightbox --------------------------------------------------- */
  const lb = document.getElementById("lb");
  const lbPanel = document.getElementById("lbPanel");
  const lbStage = document.getElementById("lbStage");
  const lbIdx = document.getElementById("lbIdx");
  const lbTitle = document.getElementById("lbTitle");
  const lbNote = document.getElementById("lbNote");
  const lbTags = document.getElementById("lbTags");
  const lbCopy = document.getElementById("lbCopy");
  const lbClose = document.getElementById("lbClose");

  const EASE = "cubic-bezier(.2,.85,.25,1)";
  let active = null; // { card, stage, spec }

  // FLIP: map the panel back onto the card it came from, then release it.
  function flip(fromRect, reverse, done) {
    const p = lbPanel.getBoundingClientRect();
    const dx = fromRect.left + fromRect.width / 2 - (p.left + p.width / 2);
    const dy = fromRect.top + fromRect.height / 2 - (p.top + p.height / 2);
    const s = Math.max(0.15, fromRect.width / p.width);
    const collapsed = `translate(${dx}px,${dy}px) scale(${s})`;

    lbPanel.style.transition = "none";
    lbPanel.style.transform = reverse ? "none" : collapsed;
    lbPanel.style.opacity = reverse ? "1" : "0";
    void lbPanel.offsetWidth; // force reflow
    lbPanel.style.transition = `transform .5s ${EASE}, opacity .35s ease`;
    lbPanel.style.transform = reverse ? collapsed : "none";
    lbPanel.style.opacity = reverse ? "0" : "1";

    if (done) setTimeout(done, 500);
  }

  function openLightbox(card, spec, idx) {
    if (active) return;
    const stage = card.querySelector(".stage");
    const from = card.getBoundingClientRect();

    lbIdx.textContent = idx;
    lbTitle.textContent = spec.title;
    lbNote.textContent = spec.note;
    lbTags.innerHTML = spec.tags.map((t) => "<li>" + t + "</li>").join("");

    lbStage.appendChild(stage); // move the *live* node — animation never restarts
    lb.hidden = false;
    requestAnimationFrame(() => {
      lb.classList.add("on");
      flip(from, false);
    });

    document.body.style.overflow = "hidden";
    active = { card, stage, spec };
    lbClose.focus();
  }

  function closeLightbox() {
    if (!active) return;
    const { card, stage } = active;
    const to = card.getBoundingClientRect();

    lb.classList.remove("on");
    flip(to, true, () => {
      card.insertBefore(stage, card.querySelector(".foot"));
      lb.hidden = true;
      lbStage.innerHTML = "";
      lbPanel.style.transition = "none";
      lbPanel.style.transform = "none";
      lbPanel.style.opacity = "1";
      document.body.style.overflow = "";
      active = null;
    });
  }

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
  lbCopy.addEventListener(
    "click",
    () => active && copyCode(active.spec, lbCopy)
  );

  /* ---- build the specimen cards ----------------------------------- */
  SPECIMENS.forEach((spec, i) => {
    const idx = String(i + 1).padStart(2, "0");

    const card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--i", i);
    card.innerHTML =
      '<div class="head">' +
      '<span class="idx">' +
      idx +
      "</span>" +
      "<h2>" +
      spec.title +
      "</h2>" +
      '<div class="actions">' +
      '<button class="btn expand" type="button" title="View full screen">Expand ⤢</button>' +
      '<button class="btn copy" type="button" title="Copy standalone source">Copy</button>' +
      "</div>" +
      "</div>" +
      '<div class="stage"></div>' +
      '<div class="foot">' +
      '<p class="note">' +
      spec.note +
      "</p>" +
      '<ul class="tags">' +
      spec.tags.map((t) => "<li>" + t + "</li>").join("") +
      "</ul>" +
      "</div>";

    grid.appendChild(card);

    // render the specimen
    try {
      spec.fn(card.querySelector(".stage"));
    } catch (err) {
      console.error(spec.title, err);
    }

    card.querySelector(".copy").addEventListener("click", function () {
      copyCode(spec, this);
    });
    card
      .querySelector(".expand")
      .addEventListener("click", () => openLightbox(card, spec, idx));
  });

  /* ---- theme toggle ---------------------------------------------- */
  const html = document.documentElement;
  const themeBtn = document.getElementById("theme");

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    html.dataset.theme = "dark";
  }
  const syncLabel = () => {
    themeBtn.textContent = html.dataset.theme === "dark" ? "Light" : "Dark";
  };
  syncLabel();

  themeBtn.addEventListener("click", () => {
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    syncLabel();
  });
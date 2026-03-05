const phylumColors = {
            'Arthropoda': '#00ffff',
            'Cnidaria': '#4488ff',
            'Myzozoa': '#00ff88',
            'Ctenophora': '#cc44ff',
            'Proteobacteria': '#ffdd00',
            'Mollusca': '#ff6688',
            'Annelida': '#ff8844'
        };

        function hexToRgb(hex) {
            return {
                r: parseInt(hex.slice(1, 3), 16),
                g: parseInt(hex.slice(3, 5), 16),
                b: parseInt(hex.slice(5, 7), 16)
            };
        }

        let allData = [], filteredData = [], worldFeatures = null;
        const container = document.getElementById('map-container');
        const canvas = document.getElementById('map');
        const ctx = canvas.getContext('2d');
        const tooltip = document.getElementById('tooltip');
        let width, height, dpr, projection, pathGenerator, quadtree, hoveredPoint = null;

        // Zoom/pan state
        let zoomTransform = { k: 1, x: 0, y: 0 };

        function fitScale() {
            // Choose scale so the full globe fits inside the viewport
            const scaleW = width / 5.5;
            const scaleH = height / 3.1;
            return Math.min(scaleW, scaleH);
        }

        function updateProjection() {
            const baseScale = fitScale();
            projection = d3.geoNaturalEarth1()
                .scale(baseScale * zoomTransform.k)
                .translate([width / 2 + zoomTransform.x, height / 2 + zoomTransform.y]);
            pathGenerator = d3.geoPath().projection(projection).context(ctx);

            for (let i = 0; i < allData.length; i++) {
                const p = projection([allData[i].longitude, allData[i].latitude]);
                allData[i]._px = p ? p[0] : -9999;
                allData[i]._py = p ? p[1] : -9999;
            }
            rebuildQuadtree();
        }

        function resize() {
            dpr = window.devicePixelRatio || 1;
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            updateProjection();
            render();
        }

        function rebuildQuadtree() {
            quadtree = d3.quadtree()
                .x(d => d._px).y(d => d._py)
                .addAll(filteredData.filter(d => d._px > -9000));
        }

        function render() {
            ctx.clearRect(0, 0, width, height);

            // Land - barely visible
            if (worldFeatures) {
                ctx.beginPath();
                pathGenerator(worldFeatures);
                ctx.fillStyle = '#060a10';
                ctx.fill();
                ctx.strokeStyle = '#0c1018';
                ctx.lineWidth = 0.3;
                ctx.stroke();
            }

            // Dots by phylum
            const byPhylum = new Map();
            for (const d of filteredData) {
                if (d._px < -9000) continue;
                if (!byPhylum.has(d.phylum)) byPhylum.set(d.phylum, []);
                byPhylum.get(d.phylum).push(d);
            }

            byPhylum.forEach((points, phylum) => {
                const hex = phylumColors[phylum] || '#ffffff';
                const rgb = hexToRgb(hex);
                ctx.shadowColor = hex;
                ctx.shadowBlur = 4;
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
                ctx.beginPath();
                for (const d of points) {
                    ctx.moveTo(d._px + 1.2, d._py);
                    ctx.arc(d._px, d._py, 1.2, 0, Math.PI * 2);
                }
                ctx.fill();
            });

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const nearest = quadtree ? quadtree.find(e.clientX - rect.left, e.clientY - rect.top, 10) : null;
            if (nearest !== hoveredPoint) {
                hoveredPoint = nearest;
                render();
                if (hoveredPoint) {
                    const hex = phylumColors[hoveredPoint.phylum] || '#fff';
                    ctx.shadowColor = hex; ctx.shadowBlur = 10; ctx.fillStyle = hex;
                    ctx.beginPath();
                    ctx.arc(hoveredPoint._px, hoveredPoint._py, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

                    const depthStr = hoveredPoint.depth !== null ? `${hoveredPoint.depth}m` : '—';
                    tooltip.innerHTML = `
                        <div class="tooltip-title">${hoveredPoint.scientificName || 'Unknown'}</div>
                        <div class="tooltip-detail">${hoveredPoint.phylum} · ${depthStr} · ${hoveredPoint.year || '—'}</div>
                    `;
                    tooltip.classList.add('visible');
                    canvas.style.cursor = 'pointer';
                } else {
                    tooltip.classList.remove('visible');
                    canvas.style.cursor = 'default';
                }
            }
            if (hoveredPoint) {
                let left = e.pageX + 12, top = e.pageY - 12;
                if (left + 260 > window.innerWidth) left = e.pageX - 260;
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            hoveredPoint = null; render();
            tooltip.classList.remove('visible');
            canvas.style.cursor = 'default';
        });

        // Close help modal on click outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('helpModal');
            const icon = document.querySelector('.help-icon');
            if (modal.classList.contains('active') && !modal.contains(e.target) && !icon.contains(e.target)) {
                modal.classList.remove('active');
            }
        });

        // Zoom with scroll wheel
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            const newK = Math.max(0.5, Math.min(8, zoomTransform.k * (1 + delta)));

            // Zoom toward cursor position
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const cx = width / 2 + zoomTransform.x;
            const cy = height / 2 + zoomTransform.y;
            const scale = newK / zoomTransform.k;

            zoomTransform.x = (zoomTransform.x + width / 2 - mx) * scale + mx - width / 2;
            zoomTransform.y = (zoomTransform.y + height / 2 - my) * scale + my - height / 2;
            zoomTransform.k = newK;

            updateProjection();
            render();
        }, { passive: false });

        // Pan with mouse drag
        let isDragging = false, dragStart = null;
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                isDragging = true;
                dragStart = { x: e.clientX, y: e.clientY, tx: zoomTransform.x, ty: zoomTransform.y };
                canvas.style.cursor = 'grabbing';
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDragging || !dragStart) return;
            zoomTransform.x = dragStart.tx + (e.clientX - dragStart.x);
            zoomTransform.y = dragStart.ty + (e.clientY - dragStart.y);
            updateProjection();
            render();
        });
        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragStart = null;
                canvas.style.cursor = 'default';
            }
        });

        // Touch: 1-finger pan, 2-finger pinch zoom
        let activeTouches = {};
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                activeTouches[t.identifier] = { x: t.clientX, y: t.clientY };
            }
            if (e.touches.length === 1) {
                dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: zoomTransform.x, ty: zoomTransform.y };
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && dragStart) {
                zoomTransform.x = dragStart.tx + (e.touches[0].clientX - dragStart.x);
                zoomTransform.y = dragStart.ty + (e.touches[0].clientY - dragStart.y);
                updateProjection();
                render();
            } else if (e.touches.length === 2) {
                const t0 = e.touches[0], t1 = e.touches[1];
                const prev0 = activeTouches[t0.identifier] || { x: t0.clientX, y: t0.clientY };
                const prev1 = activeTouches[t1.identifier] || { x: t1.clientX, y: t1.clientY };
                const prevDist = Math.hypot(prev0.x - prev1.x, prev0.y - prev1.y);
                const curDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
                if (prevDist > 0) {
                    const scale = curDist / prevDist;
                    const midX = (t0.clientX + t1.clientX) / 2;
                    const midY = (t0.clientY + t1.clientY) / 2;
                    const newK = Math.max(0.5, Math.min(8, zoomTransform.k * scale));
                    const s = newK / zoomTransform.k;
                    zoomTransform.x = (zoomTransform.x + width / 2 - midX) * s + midX - width / 2;
                    zoomTransform.y = (zoomTransform.y + height / 2 - midY) * s + midY - height / 2;
                    zoomTransform.k = newK;
                }
                activeTouches[t0.identifier] = { x: t0.clientX, y: t0.clientY };
                activeTouches[t1.identifier] = { x: t1.clientX, y: t1.clientY };
                updateProjection();
                render();
            }
        }, { passive: false });

        // Tap to inspect individual dots on mobile
        let touchStartPos = null, touchStartTime = 0;
        canvas.addEventListener('touchend', (e) => {
            const wasSingleFinger = Object.keys(activeTouches).length <= 1;
            for (const t of e.changedTouches) {
                // Detect tap (short, minimal movement)
                if (wasSingleFinger && e.touches.length === 0 && touchStartPos) {
                    const dx = t.clientX - touchStartPos.x;
                    const dy = t.clientY - touchStartPos.y;
                    const dt = Date.now() - touchStartTime;
                    if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 300) {
                        const rect = canvas.getBoundingClientRect();
                        const nearest = quadtree ? quadtree.find(t.clientX - rect.left, t.clientY - rect.top, 18) : null;
                        if (nearest) {
                            hoveredPoint = nearest;
                            render();
                            const hex = phylumColors[nearest.phylum] || '#fff';
                            ctx.shadowColor = hex; ctx.shadowBlur = 10; ctx.fillStyle = hex;
                            ctx.beginPath();
                            ctx.arc(nearest._px, nearest._py, 3, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
                            const depthStr = nearest.depth !== null ? `${nearest.depth}m` : '\u2014';
                            tooltip.innerHTML = `
                                <div class="tooltip-title">${nearest.scientificName || 'Unknown'}</div>
                                <div class="tooltip-detail">${nearest.phylum} \u00b7 ${depthStr} \u00b7 ${nearest.year || '\u2014'}</div>
                            `;
                            tooltip.classList.add('visible');
                        } else {
                            hoveredPoint = null;
                            tooltip.classList.remove('visible');
                            render();
                        }
                    }
                }
                delete activeTouches[t.identifier];
            }
            if (e.touches.length === 0) dragStart = null;
        }, { passive: false });

        // Track touch start position for tap detection
        canvas.addEventListener('touchstart', function captureTapStart(e) {
            if (e.touches.length === 1) {
                touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                touchStartTime = Date.now();
            }
        }, { passive: true });

        Promise.all([
            d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
            d3.json('https://dr.eamer.dev/datavis/data_trove/data/quirky/bioluminescence.json')
        ]).then(([world, bioData]) => {
            worldFeatures = topojson.feature(world, world.objects.countries);
            allData = bioData.filter(d => d.latitude && d.longitude);
            filteredData = allData;

            document.getElementById('totalCount').textContent = `${allData.length.toLocaleString()} observations`;

            resize();

            function selectPhylum(phylum, row) {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                const btn = row.querySelector('.filter-btn');
                if (btn) btn.classList.add('active');
                filteredData = phylum === 'all' ? allData : allData.filter(d => d.phylum === phylum);
                rebuildQuadtree();
                render();

                // Emphasize wiki link for active phylum
                document.querySelectorAll('.filter-wiki').forEach(w => w.classList.remove('visible'));
                if (phylum !== 'all') {
                    const wiki = row.querySelector('.filter-wiki');
                    if (wiki) wiki.classList.add('visible');
                }

            }

            // Attach click to both button AND row (row click delegates to its button)
            document.querySelectorAll('.filter-row').forEach(row => {
                const btn = row.querySelector('.filter-btn');
                if (!btn) return;
                const handler = (e) => {
                    // Don't hijack wiki link clicks
                    if (e.target.closest('.filter-wiki')) return;
                    e.stopPropagation();
                    selectPhylum(btn.dataset.phylum, row);
                };
                btn.addEventListener('click', handler);
                row.addEventListener('click', handler);
            });

            window.addEventListener('resize', resize);
        }).catch(err => console.error('Data load error:', err));
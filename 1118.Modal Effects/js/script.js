(function() {
            function createModalHandlers(overlayId, openBtnId, closeBtnId) {
                const overlay = document.getElementById(overlayId);
                const openBtn = document.getElementById(openBtnId);
                const closeBtn = document.getElementById(closeBtnId);
                console.log("&Toc on codepen - https://codepen.io/ol-ivier");

                function openModal() {
                    overlay.classList.add('open');
                }

                function closeModal() {
                    overlay.classList.remove('open');
                }

                openBtn.addEventListener('click', openModal);
                closeBtn.addEventListener('click', closeModal);

                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        closeModal();
                    }
                });

                return { overlay, closeModal };
            }

            const modals = [];

            modals.push(createModalHandlers('overlayTop', 'openModalTop', 'closeModalTop'));
            modals.push(createModalHandlers('overlayLeft', 'openModalLeft', 'closeModalLeft'));
            modals.push(createModalHandlers('overlayBottom', 'openModalBottom', 'closeModalBottom'));
            modals.push(createModalHandlers('overlayRight', 'openModalRight', 'closeModalRight'));
            modals.push(createModalHandlers('overlaySlideLeft', 'openModalSlideLeft', 'closeModalSlideLeft'));
            modals.push(createModalHandlers('overlaySlideRight', 'openModalSlideRight', 'closeModalSlideRight'));
            modals.push(createModalHandlers('overlaySlideTop', 'openModalSlideTop', 'closeModalSlideTop'));
            modals.push(createModalHandlers('overlaySlideBottom', 'openModalSlideBottom', 'closeModalSlideBottom'));
            modals.push(createModalHandlers('overlaySpring', 'openModalSpring', 'closeModalSpring'));
            modals.push(createModalHandlers('overlayZoomRotate', 'openModalZoomRotate', 'closeModalZoomRotate'));
            modals.push(createModalHandlers('overlayPerspective', 'openModalPerspective', 'closeModalPerspective'));
            modals.push(createModalHandlers('overlayOrigami', 'openModalOrigami', 'closeModalOrigami'));
            modals.push(createModalHandlers('overlayBounce', 'openModalBounce', 'closeModalBounce'));
            modals.push(createModalHandlers('overlayDiagonal', 'openModalDiagonal', 'closeModalDiagonal'));
            modals.push(createModalHandlers('overlayConvex', 'openModalConvex', 'closeModalConvex'));
            modals.push(createModalHandlers('overlayDiagonalTopRight', 'openModalDiagonalTopRight', 'closeModalDiagonalTopRight'));
            modals.push(createModalHandlers('overlayDiagonalBottomLeft', 'openModalDiagonalBottomLeft', 'closeModalDiagonalBottomLeft'));
            modals.push(createModalHandlers('overlayDiagonalBottomRight', 'openModalDiagonalBottomRight', 'closeModalDiagonalBottomRight'));
            modals.push(createModalHandlers('overlayOrigamiRight', 'openModalOrigamiRight', 'closeModalOrigamiRight'));
            modals.push(createModalHandlers('overlayFlipX', 'openModalFlipX', 'closeModalFlipX'));
            modals.push(createModalHandlers('overlayFlipYS', 'openModalFlipYS', 'closeModalFlipYS'));
            modals.push(createModalHandlers('overlayFlipYSReverse', 'openModalFlipYSReverse', 'closeModalFlipYSReverse'));
            modals.push(createModalHandlers('overlayFlipMix', 'openModalFlipMix', 'closeModalFlipMix'));

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    modals.forEach(function(modal) {
                        if (modal.overlay.classList.contains('open')) {
                            modal.closeModal();
                        }
                    });
                }
            });
        })();
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

            modals.push(createModalHandlers('overlaySwing', 'openModalSwing', 'closeModalSwing'));
            modals.push(createModalHandlers('overlayRubber', 'openModalRubber', 'closeModalRubber'));
            modals.push(createModalHandlers('overlayRollLeft', 'openModalRollLeft', 'closeModalRollLeft'));
            modals.push(createModalHandlers('overlayRollRight', 'openModalRollRight', 'closeModalRollRight'));
            modals.push(createModalHandlers('overlaySkew', 'openModalSkew', 'closeModalSkew'));
            modals.push(createModalHandlers('overlaySlideRotate', 'openModalSlideRotate', 'closeModalSlideRotate'));
            modals.push(createModalHandlers('overlayHeartbeat', 'openModalHeartbeat', 'closeModalHeartbeat'));
            modals.push(createModalHandlers('overlayJello', 'openModalJello', 'closeModalJello'));
            modals.push(createModalHandlers('overlayFlipXY', 'openModalFlipXY', 'closeModalFlipXY'));
            modals.push(createModalHandlers('overlayZoomCorner', 'openModalZoomCorner', 'closeModalZoomCorner'));
            modals.push(createModalHandlers('overlaySwingBottom', 'openModalSwingBottom', 'closeModalSwingBottom'));
            modals.push(createModalHandlers('overlayBounceDown', 'openModalBounceDown', 'closeModalBounceDown'));
            modals.push(createModalHandlers('overlayBounceUp', 'openModalBounceUp', 'closeModalBounceUp'));
            modals.push(createModalHandlers('overlayRotateDownLeft', 'openModalRotateDownLeft', 'closeModalRotateDownLeft'));
            modals.push(createModalHandlers('overlayRotateDownRight', 'openModalRotateDownRight', 'closeModalRotateDownRight'));
            modals.push(createModalHandlers('overlayLightSpeed', 'openModalLightSpeed', 'closeModalLightSpeed'));
            modals.push(createModalHandlers('overlayFadeScaleRotate', 'openModalFadeScaleRotate', 'closeModalFadeScaleRotate'));
            modals.push(createModalHandlers('overlayBlur', 'openModalBlur', 'closeModalBlur'));
            modals.push(createModalHandlers('overlayUnfoldVertical', 'openModalUnfoldVertical', 'closeModalUnfoldVertical'));
            modals.push(createModalHandlers('overlayUnfoldHorizontal', 'openModalUnfoldHorizontal', 'closeModalUnfoldHorizontal'));

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
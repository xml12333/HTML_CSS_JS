// Utils https://assets.codepen.io/573855/utils-v3.js

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    autoRefreshEvents: 'DOMContentLoaded,load',
});

const scroller = (() => {
    if (typeof gsap === 'undefined' || typeof ScrollSmoother === 'undefined' || utils.device.isTouch()) {
        document.body.classList.add('normalize-scroll');
        return null;
    }

    return {
        initialize: (contentSelector = '.content-scroll', wrapperSelector = '.viewport-wrapper') =>
            ScrollSmoother.create({
                content: contentSelector,
                wrapper: wrapperSelector,
                smooth: 2,
                effects: false,
                normalizeScroll: true,
                preventDefault: true,
            }),
    };
})();

const createCarousel = () => {
    let DOM = {};
    let swiper = null;
    let swiperInitialized = false;
    let gsapAnimation = null;

    let isScrubActive = false;
    let isSwiperNavigation = false;
    let centeredSlides = true;
    let currentActiveSlideIndex = 0;
    let options = {};
    let slidesInteraction = false;
    let isTouching = false;
    let slideOpacity = true;

    const defaultOptions = {
        selector: null,
        centeredSlides: true,
        slideOpacity: true,
        isScrubActive: false,
        isScrubOnTouchActive: false,
        scrubDir: 1,
    };

    const _initializeSwiper = (selectorEl) => {
        if (!selectorEl) return;

        const swiperOptions = {
            init: false,
            runCallbacksOnInit: true,
            direction: 'horizontal',
            slidesPerView: 'auto',
            centeredSlides,
            centeredSlidesBounds: false,
            slidesOffsetBefore: _getSlidesOffset(),
            slidesOffsetAfter: _getSlidesOffsetAfter(),
            spaceBetween: 0,
            initialSlide: currentActiveSlideIndex,
            loop: false,
            speed: 700,
            roundLengths: false,
            preloadImages: false,
            touchMoveStopPropagation: false,
            threshold: utils.device.isTouch() ? 10 : 6,
            passiveListeners: true,
            preventClicks: true,
            watchSlidesProgress: slideOpacity,
            watchSlidesVisibility: false,
            grabCursor: !utils.device.isTouch(),
            customTransition: true,
            slideToClickedSlide: false,
            virtualTranslate: false,
            watchOverflow: false,
            resistanceRatio: 0.85,
            on: {
                init: _onSwiperInit,
                setTransition: _onSetTransition,
                progress: _onSwiperProgress,
                touchStart: _onTouchStart,
            }
        };

        // Add scrub-specific config
        if (isScrubActive) {
            swiperOptions.updateOnWindowResize = false;
            swiperOptions.grabCursor = false;
            utils.dom.addClass(DOM.swiper, 'swiper-no-swiping');
        } else {
            // Attach pagination only if it exists
            if (DOM.swiperPagination) {
                swiperOptions.pagination = {
                    el: DOM.swiperPagination,
                    type: 'bullets',
                    clickable: true,
                };
            }

            // Setup navigation buttons if available and non touch
            if (!utils.device.isTouch()) _setupNavigation();

            // Attach bounds-checking callbacks
            swiperOptions.on.touchMove = _onTouchMove;
            swiperOptions.on.touchEnd = _onTouchEnd;
            swiperOptions.on.transitionStart = _checkBounds;
            swiperOptions.on.transitionEnd = _checkBounds;
        }

        swiper = new Swiper(selectorEl, swiperOptions);

        utils.system.nextTick(() => {
            swiper.init();
            _updateSwiperStateByProgress(0);
            _update();
        });
    };

    /**
     * Gets the spacing between Swiper slides based on the `.swiper-column-gap` element.
     * @returns {number}
     */

    const _getSlideSpacing = () => {
        return DOM.cachedSlideSpacing ?? 0;
    };

    /**
     * Calculates horizontal offset before the first Swiper slide,
     * based on layout breakpoints and centered slide settings.
     * @returns {number}
     */
    const _getSlidesOffset = () => {
        const spacingOffset = _getSlideSpacing(); // already cached
        const bodyWidth = document.body.clientWidth;
        const maxWrapperSize = _getMaxWrapperSize();
        const adjustedMax = maxWrapperSize + 0.5;
        const viewportWidth = window.innerWidth;

        if (viewportWidth < adjustedMax) {
            return centeredSlides && viewportWidth > DOM.mdBreakpoint ? 0 : spacingOffset;
        }

        if (centeredSlides) return 0;

        //const additionalSpacing = spacingOffset// * 2;
        const wrapperWidth = maxWrapperSize - spacingOffset;
        const padding = (bodyWidth - wrapperWidth) * 0.5;

        return Math.max(padding, spacingOffset);
    };

    /**
     * Calculates horizontal offset after the last Swiper slide.
     * Adjusts for cases where there are too few slides to fill the width.
     * @returns {number}
     */
    const _getSlidesOffsetAfter = () => {
        const beforeOffset = _getSlidesOffset();

        if (centeredSlides || !swiperInitialized || !swiper) {
            return beforeOffset;
        }

        const slides = swiper.slides || [];
        const spacing = _getSlideSpacing();
        const slideCount = slides.length;

        let totalSlideWidth = 0;
        for (let i = 0; i < slideCount; i++) {
            totalSlideWidth += slides[i]?.offsetWidth || 0;
        }

        const containerWidth = swiper.width;
        const remainingSpace = containerWidth - beforeOffset - totalSlideWidth;

        if (remainingSpace > 0) {
            const compensation = Math.round(remainingSpace + spacing * (slideCount - 1)) + 1;
            return -compensation;
        }

        return beforeOffset;
    };

    /**
     * Checks swiper bounds (start/end) and updates navigation arrow visibility.
     */
    const _checkBounds = () => {
        if (!swiper || !swiperInitialized || !isSwiperNavigation) return;

        const isBeginning = swiper.isBeginning;
        const isEnd = swiper.isEnd;

        _updateSwiperNavigation(isBeginning, isEnd);
    };

    /**
     * Configures Swiper pagination if available and scrub mode is off.
     */
    const _setupPagination = () => {
        if (!DOM.swiperPagination) return;

        swiper.params.pagination = {
            el: DOM.swiperPagination,
            type: 'bullets',
            clickable: true
        };
    };

    const _setupNavigation = () => {
        const container = DOM.swiperNavigationContainer;
        if (!container) return;

        DOM.swiperNext = container.querySelector('.swiper-next');
        DOM.swiperPrev = container.querySelector('.swiper-prev');
        isSwiperNavigation = true;

        if (DOM.swiperNext) {
            DOM.swiperNext.addEventListener('click', () => {
                swiper.slideTo(swiper.activeIndex + 1);
            });
        }

        if (DOM.swiperPrev) {
            DOM.swiperPrev.addEventListener('click', () => {
                swiper.slideTo(swiper.activeIndex - 1);
            });
        }
    };

    const _onSwiperInit = () => {
        swiperInitialized = true;
        _toggleSlidesInteraction(true);
    };

    const _toggleSlidesInteraction = (enabled = true) => {
        if (!swiperInitialized || !swiper || slidesInteraction == enabled) return;
        const slides = swiper.slides;
        const len = slides.length;
        let slide;
        for (let i = 0; i < len; i++) {
            slide = slides[i];
            if (!slide) continue;
            (!enabled) ? utils.dom.addClass(slide, 'no-interaction'): utils.dom.removeClass(slide, 'no-interaction');
        }

        slidesInteraction = enabled;
    }

    /**
     * Callback to apply transition duration to all slides manually.
     * @param {number} speed - Transition duration in milliseconds.
     */

    const _onSetTransition = (speed) => {
        if (!swiperInitialized || !swiper) return;

        const slides = swiper.slides;
        const len = slides.length;
        let slide;

        for (let i = 0; i < len; i++) {
            slide = slides[i];
            if (slide && slide.style) {
                slide.style.transition = `${speed}ms`;
            }
        }
    };

    /**
     * Callback to apply visual effects based on Swiper progress.
     * Primarily controls per-slide opacity
     * @param {number} progress - Overall progress of Swiper (0–1).
     */
    // Constants for Swiper slide opacity effect
    const OPACITY_THRESHOLD = 0.6; // Threshold below which we disable interaction
    const OPACITY_DIFF_THRESHOLD = 0.01; // Skip if opacity hasn't changed significantly
    const OPACITY_MIN_PROGRESS = 0.25; // Minimum slide progress to begin fading
    const OPACITY_MAX_PROGRESS = 0.85; //1; // Max slide progress
    const OPACITY_MIN_VALUE = 0.25; // Faded-out opacity
    const OPACITY_MAX_VALUE = 1; // Fully visible opacity

    const _onSwiperProgressNotInUse = (progress) => {
        if (!swiperInitialized || !swiper || !slideOpacity) return;

        const slides = swiper.slides;
        const len = slides.length;

        let i = 0,
            slide, slideProgress, absProgress, opacity, currentOpacity, hasClass;

        while (i < len) {
            slide = slides[i++];
            if (!slide) continue;

            slideProgress = utils.math.clamp(slide.progress ?? -1, -1, 1);
            absProgress = utils.math.clamp(Math.abs(slideProgress), OPACITY_MIN_PROGRESS, OPACITY_MAX_PROGRESS);
            opacity = utils.math.interpolateRange(absProgress, OPACITY_MIN_PROGRESS, OPACITY_MAX_PROGRESS, OPACITY_MAX_VALUE, OPACITY_MIN_VALUE);
            opacity = (opacity * 1000 | 0) / 1000; // Fast toFixed(3)

            //Use custom property instead of style.opacity
            slide.style.setProperty('--swiper-slide-opacity', (1 - opacity).toFixed(3));

            if (!isTouching) {
                hasClass = slide.classList.contains('no-interaction');
                (opacity < OPACITY_THRESHOLD) ?
                (!hasClass && utils.dom.addClass(slide, 'no-interaction')) :
                (hasClass && utils.dom.removeClass(slide, 'no-interaction'));
            }
        }
    };

    const _onSwiperProgress = (progress) => {
        if (!swiperInitialized || !swiper || !slideOpacity) return;

        const slides = swiper.slides;
        const len = slides.length;

        let i = 0,
            slide, slideProgress, absProgress, opacity, currentOpacity, hasClass;

        while (i < len) {
            slide = slides[i++];
            if (!slide) continue;

            slideProgress = utils.math.clamp(slide.progress ?? -1, -1, 1);
            absProgress = utils.math.clamp(Math.abs(slideProgress), OPACITY_MIN_PROGRESS, OPACITY_MAX_PROGRESS);
            opacity = utils.math.interpolateRange(absProgress, OPACITY_MIN_PROGRESS, OPACITY_MAX_PROGRESS, OPACITY_MAX_VALUE, OPACITY_MIN_VALUE);
            //  opacity = Math.pow(opacity, 1.1);
            opacity = (opacity * 1000 | 0) / 1000; // Fast toFixed(3)

            currentOpacity = parseFloat(slide.style.opacity || 1);
            if (Math.abs(currentOpacity - opacity) > OPACITY_DIFF_THRESHOLD) {
                slide.style.opacity = opacity;
            }

            if (!isTouching) {
                hasClass = slide.classList.contains('no-interaction');
                (opacity < OPACITY_THRESHOLD) ? (!hasClass && utils.dom.addClass(slide, 'no-interaction')) : (hasClass && utils.dom.removeClass(slide, 'no-interaction'));
            }
        }
    };

    /**
     * Callback triggered when user starts interacting with Swiper (touch/drag).
     * Clears all transition styles to allow natural dragging.
     */
    const _onTouchStart = () => {
        if (!swiperInitialized || !swiper || isScrubActive) return;

        const slides = swiper.slides;
        const len = slides.length;
        let slide;

        for (let i = 0; i < len; i++) {
            slide = slides[i];
            if (slide && slide.style) {
                slide.style.transition = '';
            }
        }
    };

    const _onTouchMove = () => {
        if (!swiperInitialized || !swiper || isScrubActive) return;
        isTouching = true;
        if (!utils.device.isTouch()) {
            _toggleSlidesInteraction(false);
        }

    };

    const _onTouchEnd = () => {
        if (!swiperInitialized || !swiper || isScrubActive) return;
        isTouching = false;
        _checkBounds();
        if (!utils.device.isTouch()) {
            _toggleSlidesInteraction(true);
        }
    };

    /**
     * Recalculates Swiper layout, navigation, and associated content positioning.
     */
    const _update = () => {
        _updateSwiper();
        _updateTextBeforeWrapper();
        _updateSwiperNavigationContainer();
    };

    const _getSlideSpacingFromDOM = () => {
        const spacingEl = DOM.swiperSpacing;
        return spacingEl ? Math.ceil(spacingEl.offsetWidth) : 0;
    };

    /**
     * Updates Swiper layout dynamically: offsets, spacing, centering.
     * Also updates pagination and visual effects.
     */
    const _updateSwiper = () => {
        if (!swiperInitialized || !swiper) return;

        // Call to ensure transition is fully cleared before layout updates
        swiper.transitionEnd?.();

        // Re-evaluate `centeredSlides` based on screen size
        const isSmallScreen = window.innerWidth < DOM.mdBreakpoint;
        centeredSlides = isSmallScreen ? false : options.centeredSlides;

        DOM.cachedSlideSpacing = _getSlideSpacingFromDOM();

        swiper.params.slidesOffsetBefore = _getSlidesOffset();
        swiper.params.slidesOffsetAfter = _getSlidesOffsetAfter();
        swiper.params.spaceBetween = _getSlideSpacing();
        swiper.params.centeredSlides = centeredSlides;

        swiper.update();
        swiper.pagination?.update?.();

        _onSwiperProgress(swiper.progress);
    };

    /**
     * Toggles visibility of Swiper navigation buttons based on scroll bounds.
     * @param {boolean} isBeginning - True if at the first slide.
     * @param {boolean} isEnd - True if at the last slide.
     */

    const _updateSwiperNavigation = (isBeginning, isEnd) => {
        if (!isSwiperNavigation) return;

        if (DOM.swiperNext) {
            const nextClassList = DOM.swiperNext.classList;
            const shouldBeHidden = isEnd;
            if (nextClassList.contains('hide') !== shouldBeHidden) {
                nextClassList.toggle('hide', shouldBeHidden);
            }
        }

        if (DOM.swiperPrev) {
            const prevClassList = DOM.swiperPrev.classList;
            const shouldBeHidden = isBeginning;
            if (prevClassList.contains('hide') !== shouldBeHidden) {
                prevClassList.toggle('hide', shouldBeHidden);
            }
        }
    };

    /**
     * Updates custom CSS vars for aligning text before the Swiper.
     * Based on current wrapper width, offset, and slide layout.
     */

    const _updateTextBeforeWrapper = () => {
        const { textBefore, mediaContainerRef } = DOM;
        if (!swiper || !textBefore || !mediaContainerRef) return;

        const bodyWidth = document.body.clientWidth;
        const slideWidth = mediaContainerRef.offsetWidth;
        const wDiff = Math.max(0, (bodyWidth - _getMaxWrapperSize()) * 0.5);

        const slideOffset = centeredSlides ? (bodyWidth - slideWidth) * 0.5 + _getSlidesOffset() : _getSlidesOffset();

        const beforeWidth = bodyWidth - slideOffset - wDiff;
        const marginLeft = slideOffset;

        textBefore.style.cssText = `--swiper-text-before-width: ${beforeWidth}px; --swiper-text-before-margin-left: ${marginLeft}px;`;
    };

    /**
     * Updates CSS variable for Swiper navigation container height
     * to match the current media (slide) container height.
     */

    let lastNavigationHeight = -1;

    const _updateSwiperNavigationContainer = () => {
        const { swiperNavigationContainer, mediaContainerRef } = DOM;
        if (!swiper || !swiperNavigationContainer || !mediaContainerRef) return;

        const height = mediaContainerRef.offsetHeight;
        if (height === lastNavigationHeight) return; // Skip if no change

        swiperNavigationContainer.style.setProperty('--swiper-navigation-height', `${height}px`);
        lastNavigationHeight = height;
    };

    /**
     * Sets up a GSAP ScrollTrigger that scrubs Swiper based on scroll progress.
     */

    const _proxy = {
        set _updateSwiperStateByProgress(value) {
            _updateSwiperStateByProgress(value);
        }
    };

    const _initializeGsapAnimation = () => {
        if (!isScrubActive || gsapAnimation) return;

        const slowDownFactor = 0.5;
        const getLVH = utils.css.getLVH;

        let cachedWrapperWidth = DOM.swiperWrapper?.offsetWidth || 0;
        let cachedSlideHeight = (swiper?.slides.length || 0) * getLVH() * slowDownFactor;

        gsapAnimation = gsap.to(_proxy, {
            _updateSwiperStateByProgress: 1,
            duration: 1,
            ease: 'none',
            scrollTrigger: {
                id: `pin-${options.selector?.replace('#', '')}`,
                trigger: DOM.trigger,
                pin: DOM.pin,
                pinSpacing: true,
                scrub: true,
                invalidateOnRefresh: true,

                start: () => `${DOM.trigger.offsetHeight * 0.5}px ${getLVH() * 0.5}px`,

                end: () => `+=${Math.max(cachedWrapperWidth, cachedSlideHeight)}px`,

                //onUpdate: (self) => _updateSwiperStateByProgress(self.progress),

                onRefreshInit: () => {
                    if (swiper && swiperInitialized) {
                        swiper.updateSize();
                        _update();
                    }

                    cachedWrapperWidth = DOM.swiperWrapper?.offsetWidth || 0;
                    cachedSlideHeight = (swiper?.slides.length || 0) * getLVH() * slowDownFactor;
                },

                onRefresh: () => {
                    if (swiper && swiperInitialized) {
                        _update();
                    }
                }
            }
        });
    };

    /**
     * Applies scroll progress (0–1) to Swiper's internal translate state.
     * Used for ScrollTrigger-based scrubbing.
     * @param {number} progress - Normalized scroll progress (0 to 1)
     */

    //let lastScrubProgress = -1;

    const _updateSwiperStateByProgress = (progress) => {
        if (!swiper || !swiperInitialized) return;

        const clamped = utils.math.clamp(isNaN(progress) ? 0 : progress, 0, 1);

        // Avoid unnecessary state updates for small changes
        //if ((clamped * 1000 | 0) === (lastScrubProgress * 1000 | 0)) return;
        //lastScrubProgress = clamped;

        const directionAdjusted = options.scrubDir === -1 ? 1 - clamped : clamped;

        const min = swiper.minTranslate();
        const max = swiper.maxTranslate();
        const translate = (max - min) * directionAdjusted + min;

        swiper.translateTo(translate, 0); // 0 = no duration
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
    };

    const _getMaxWrapperSize = () => {
        const val = DOM.maxWrapperSize;
        return Number.isFinite(val) && val > 0 ? val : document.body.clientWidth;
    };

    /**
     * Resets internal state and cached references
     */

    const _reset = () => {
        DOM = Object.create(null); // avoids prototype inheritance issues
        swiper = null;
        swiperInitialized = false;
        gsapAnimation = null;

        isScrubActive = false;
        isSwiperNavigation = false;
        centeredSlides = true;
        slideOpacity = true;
        currentActiveSlideIndex = 0;

        options = { ...defaultOptions };
    };

    /**
     * Applies `loading="lazy"` and `decoding="async"` to images
     * if Swiper is outside the initial viewport.
     */
    const _maybeLazyLoadImages = () => {
        const swiperEl = DOM.swiper;
        if (!swiperEl) return;

        const { top, bottom } = swiperEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (top < viewportHeight && bottom > 0) return; // Swiper is in view

        const images = swiperEl.querySelectorAll('img');
        let img;
        for (let i = 0; i < images.length; i++) {
            img = images[i];
            if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
            if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        }
    };

    /**
     * Main initializer: sets up swiper instance and (optionally) ScrollTrigger.
     * @param {Object} opts
     */
    const initialize = (opts = {}) => {
        _reset();
        options = { ...defaultOptions, ...opts };

        const el = utils.dom.resolveElement(options.selector);
        if (!el) {
            console.warn('[gsapSwiper] Invalid or missing selector.');
            return;
        }

        const swiperEl = el.querySelector('.swiper-container');
        const wrapperEl = swiperEl?.querySelector('.swiper-wrapper') || null;
        const spacingEl = swiperEl?.querySelector('.swiper-column-gap') || null;

        DOM.el = el;
        DOM.mediaContainerRef = el.querySelector('.media-container');
        DOM.textBefore = el.querySelector('.text-before');
        DOM.swiper = swiperEl;
        DOM.swiperSpacing = spacingEl;
        DOM.swiperWrapper = wrapperEl;

        DOM.cachedSlideSpacing = null;

        centeredSlides = options.centeredSlides;
        slideOpacity = options.slideOpacity;

        DOM.maxWrapperSize = utils.css.getCssVarValue(el, '--max-wrapper-size', true);
        DOM.mdBreakpoint = utils.css.getCssVarValue(el, '--md-breakpoint', true) + 0.5;

        isScrubActive = !utils.device.isTouch() && options.isScrubActive;
        if (utils.device.isTouch() && options.isScrubOnTouchActive) {
            isScrubActive = true;
        }

        if (!DOM.swiper) {
            console.warn(`[gsapSwiper] Could not find .swiper-container in ${options.selector}`);
            return;
        }

        if (isScrubActive) {
            el.dataset.scrub = 'true';
            DOM.pin = swiperEl;
            DOM.trigger = wrapperEl;
            _initializeGsapAnimation();
        } else {
            DOM.swiperPagination = el.querySelector('.swiper-pagination');
            DOM.swiperNavigationContainer = el.querySelector('.swiper-navigation-container');
        }

        //_maybeLazyLoadImages();
        _initializeSwiper(swiperEl);
    };

    return {
        initialize,
        update: () => {
            if (swiperInitialized && swiper) _update();
        },
        isScrubbing: () => isScrubActive
    };

};

document.addEventListener('DOMContentLoaded', () => {
    if (scroller) scroller.initialize();

    const carousels = [];

    const carousel1 = createCarousel();
    carousel1.initialize({ selector: '#carousel_1', isScrubActive: true, isScrubOnTouchActive: true });
    carousels.push(carousel1);

    const carousel2 = createCarousel();
    carousel2.initialize({ selector: '#carousel_2', isScrubActive: false, slideOpacity: false });
    carousels.push(carousel2);

    const carousel3 = createCarousel();
    carousel3.initialize({ selector: '#carousel_3', isScrubActive: true, isScrubOnTouchActive: true,slideOpacity: false, scrubDir: -1 });
    carousels.push(carousel3);

    const globalRefresh = () => {
        carousels.forEach(instance => {
            if (!instance.isScrubbing()) {
                instance.update();
            }
        });

        ScrollTrigger.refresh();
    };

    const hideBlocker = () => {
        const blocker = document.getElementById('app_blocker');
        if (!blocker) return;

        blocker.classList.add('hide');

        // Remove after transition ends (or fallback timeout)
        const cleanup = () => {
            blocker.removeEventListener('transitionend', cleanup);
            blocker.remove();
        };

        blocker.addEventListener('transitionend', cleanup);
        setTimeout(() => {
            if (document.body.contains(blocker)) blocker.remove();
        }, 350);
    };

    if (utils.device.isTouch()) {
        window.addEventListener('orientationchange', () => {
            utils.system.nextTick(globalRefresh, null, 500);
        });
    } else {
        window.addEventListener('resize', () => {
            utils.system.nextTick(globalRefresh);
        });
    }

    const isCodePen = document.referrer.includes("codepen.io");
    const hostDomains = isCodePen ? ["codepen.io"] : [];
    hostDomains.push(window.location.hostname);

    const links = document.getElementsByTagName("a");
    utils.url.validateLinks(links, hostDomains);

    utils.system.nextTick(() => {
        globalRefresh();
        hideBlocker();
    }, null, 300);

});
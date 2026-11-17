/*=============== SWIPER CAROUSEL ===============*/
const formatNumber = (number) =>{
   return String(number).padStart(2, '0')
}

const swiperCards = new Swiper('.card__swiper', {
   direction: 'vertical',
   loop: true,
   loopAdditionalSlides: 1,
   slidesPerView: 1,
   grabCursor: true,
   speed: 800,

   /* Effect creative */
   effect: 'creative',
   creativeEffect: {
      limitProgress: 2,
      /* The card straightens while moving and ends with the opposite rotation */
      prev: {
         translate: [0, '-107%', 0],
         rotate: [0, 0, -30],
         opacity: .5,
      },
      next: {
         translate: [0, '107%', 0],
         rotate: [0, 0, -30],
         opacity: .5,
      },
   },

   /* Pagination fraction */
   pagination: {
      el: '.card__pagination',
      type: 'fraction',
      formatFractionCurrent: formatNumber,
      formatFractionTotal: formatNumber,
   },

   /* Navigation buttons */
   navigation: {
      nextEl: '.card__button-next',
      prevEl: '.card__button-prev',
   },

   /* Places the last card above the first one on load */
   on: {
      init: (swiper) =>{
         swiper.loopFix({ direction: 'prev' })
      },
   },
})

document.addEventListener("DOMContentLoaded", function () {
    var swiperCategories = new Swiper(".categories-container", {
        slidesPerView: "auto", // Ensure slides retain their size
        spaceBetween: 10, // Reduce spacing without affecting border size
        centeredSlides: false, // Prevent excessive spacing
        loop: false, // Ensure natural positioning
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: false,
        },
        breakpoints: {
            768: {
                slidesPerView: "auto",
                spaceBetween: 10, // Less space between each item
            },
            1024: {
                slidesPerView: "auto",
                spaceBetween: 10, // Adjust spacing for medium screens
            },
            1440: {
                slidesPerView: 5, // Ensure exactly 5 items are visible
                spaceBetween: 10, // Keep spacing minimal
            }
        }
    });
});


// Feedback Carousel Auto Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.feedback');

function showNextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(showNextSlide, 4000);

// Section animations on scroll
window.addEventListener('scroll', function () {
    const sections = document.querySelectorAll('.course-curriculum, .infrastructure, .feedback');
    sections.forEach(section => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100) {
            section.classList.add('visible');
        }
    });
});

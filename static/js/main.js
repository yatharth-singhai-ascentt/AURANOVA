document.addEventListener('DOMContentLoaded', function () {
    // Search button functionality
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', function () {
        const brand = document.getElementById('brand').value.trim();
        const model = document.getElementById('model').value.trim();
        const year = document.getElementById('year').value.trim();

        if (brand && model && year) {
            //alert(`Searching for ${year} ${brand} ${model}`);
            // Add your search functionality here
        } else {
            alert('Please fill out all fields before searching.');
        }
    });
});


const particleContainer = document.querySelector('.particle-container');
const particleCount = 100;

// Create particles and randomly position them
for (let i = 0; i < particleCount; i++) {
const particle = document.createElement('div');
particle.className = 'particle';
particle.style.left = Math.random() * 100 + '%';
particle.style.top = Math.random() * 100 + '%';
particle.style.transform = `translateZ(${Math.random() * 200 - 100}px)`;
particleContainer.appendChild(particle);
}

// Mouse interaction with particles
document.addEventListener('mousemove', (e) => {
const mouseX = e.clientX / window.innerWidth - 0.5;
const mouseY = e.clientY / window.innerHeight - 0.5;

const particles = document.querySelectorAll('.particle');
particles.forEach(particle => {
 const rect = particle.getBoundingClientRect();
 const centerX = rect.left + rect.width / 2;
 const centerY = rect.top + rect.height / 2;

 const distanceX = e.clientX - centerX;
 const distanceY = e.clientY - centerY;
 const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

 if (distance < 100) {
     const angle = Math.atan2(distanceY, distanceX);
     const force = (100 - distance) / 100;
     const moveX = Math.cos(angle) * force * 20;
     const moveY = Math.sin(angle) * force * 20;
     particle.style.transform = `translate(${moveX}px, ${moveY}px) translateZ(${Math.random() * 200 - 100}px)`;
 }
});

document.querySelector('.center-circle').style.transform =
 `rotateY(${mouseX * 30}deg) rotateX(${-mouseY * 30}deg)`;
});

// Update progress percentage
const percentageElement = document.querySelector('.percentage');
let progress = 0;
const progressInterval = setInterval(() => {
progress++;
percentageElement.textContent = `${progress}%`;
document.querySelector('.progress-bar').style.width = `${progress}%`;
if (progress >= 100) clearInterval(progressInterval);
}, 30);

// Hide loading screen and show main content
function hideLoadingScreen() {
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.querySelector('.main-content');

loadingScreen.style.opacity = '0';
loadingScreen.style.transition = 'opacity 0.5s ease-in-out';

setTimeout(() => {
 loadingScreen.style.display = 'none';
 mainContent.classList.add('visible');
}, 500);
}
setTimeout(hideLoadingScreen, 3000);

// Optional reload button for testing
document.querySelector('.reload-button').addEventListener('click', () => {
location.reload();
});

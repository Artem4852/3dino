function lerp(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}

function updateCameraPosition(newY) {
    const currentPosition = parseFloat(camera.getAttribute('position').y);
    const targetPosition = newY;
    let alpha = 0;

    function animate() {
        if (alpha < 1) {
            alpha += 0.1;
            const yPos = lerp(currentPosition, targetPosition, alpha);
            camera.setAttribute('position', {
                x: camera.getAttribute('position').x,
                y: yPos,
                z: camera.getAttribute('position').z
            
            });
            requestAnimationFrame(animate);
        }
    }
    animate();
}

function jump() {
    if (isJumping) return;
    isJumping = true;

    const gravity = -40;
    const initialVelocity = 24;

    let startTime = performance.now();
    const startPosition = parseFloat(camera.getAttribute('position').y);

    function animateJump(timestamp) {
        if (!startTime) startTime = timestamp;
        const time = (timestamp - startTime) / 1000;

        let newPosition = startPosition + initialVelocity * time + 0.5 * gravity * time * time;

        if (newPosition < startPosition) {
            newPosition = startPosition; 
            isJumping = false;
        }

        camera.setAttribute('position', {
            x: camera.getAttribute('position').x,
            y: newPosition,
            z: camera.getAttribute('position').z
        });

        if (isJumping) {
            requestAnimationFrame(animateJump);
        }
    }
    animateJump();
}

const camera = document.getElementById('camera');
camera.removeAttribute('wasd-controls');
camera.setAttribute('custom-wasd-controls', '');

let movingUp = true;
let shiftPressed = false;
let isJumping = false;
setInterval(() => {
    if (pause) return;
    checkCollisions();
    if (isJumping || lost) return;

    if (shiftPressed && camera.getAttribute('position').y > 1.3) {
        camera.setAttribute('position', '0 1 0');
    } else if (!shiftPressed && camera.getAttribute('position').y < 2.7) {
        camera.setAttribute('position', '0 3 0');
    }


    const currentPosition = parseFloat(camera.getAttribute('position').y);
    if (movingUp) {
        updateCameraPosition(currentPosition + 0.2);
    } else {
        updateCameraPosition(currentPosition - 0.2);
    }
    movingUp = !movingUp;
}, 150);

// For desktop devices
document.addEventListener('keydown', (e) => {
    // console.log(e.key);
    if (e.key === 'c') {
        shiftPressed = true;
    } else if (e.key === 'w' && !shiftPressed) {
        jump();
    } else if (e.key === 'Escape') {
        pause = !pause;
        if (pause) {
            document.getElementById('pause').style.display = 'flex';
            document.getElementById('score').parentElement.style.display = 'none';
        }
        else {
            document.getElementById('score').parentElement.style.display = 'flex';
            document.getElementById('pause').style.display = 'none';
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'c') {
        shiftPressed = false;
    }
});

// For mobile devices
let touchStartY = 0;
const swipeThreshold = 50;

document.addEventListener('touchstart', (e) => {
    // shiftPressed = true;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    // shiftPressed = false;
    const touchEndY = e.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;
    
    if (swipeDistance > swipeThreshold) {
        if (shiftPressed) shiftPressed = false;
        else jump();
    }
    else if (swipeDistance < -swipeThreshold) {
        shiftPressed = !shiftPressed;
    }
});

document.addEventListener('touchcancel', () => {
    shiftPressed = !shiftPressed;
});
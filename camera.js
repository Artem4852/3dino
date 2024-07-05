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

    const gravity = -9.8;
    const initialVelocity = 12;
    const frameDuration = 1 / 60;

    let time = 0;
    const startPosition = parseFloat(camera.getAttribute('position').y);

    function animateJump() {
        time += frameDuration;

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
    checkCollisions();
    if (isJumping || reload) return;

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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        shiftPressed = true;
    } else if (e.key === 'w' && !shiftPressed) {
        jump();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        shiftPressed = false;
    }
});
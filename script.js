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
    const startPosition = parseFloat(camera.getAttribute('position').y);
    const peakPosition = startPosition + 2;
    let ascending = true;
    let alpha = 0;

    console.log('jumping');

    function animateJump() {
        if (ascending) {
            alpha += 0.02;
            if (alpha >= 1) {
                ascending = false;
                alpha = 0;
            }
        } else {
            alpha += 0.02;
        }

        let yPos;
        if (ascending) {
            yPos = lerp(startPosition, peakPosition, alpha);
        } else {
            yPos = lerp(peakPosition, startPosition, alpha);
            if (alpha >= 1) {
                isJumping = false;
                return;
            }
        }

        camera.setAttribute('position', {
            x: camera.getAttribute('position').x,
            y: yPos,
            z: camera.getAttribute('position').z
        });

        requestAnimationFrame(animateJump);
    }

    animateJump();
}

const camera = document.getElementById('camera');
let movingUp = true;
let shiftPressed = false;
let isJumping = false;
setInterval(() => {
    if (isJumping) return;

    if (shiftPressed && camera.getAttribute('position').y > 0.3) {
        camera.setAttribute('position', '0 0 0');
    } else if (!shiftPressed && camera.getAttribute('position').y < 0.7) {
        camera.setAttribute('position', '0 1 0');
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


cactus = document.getElementsByClassName("cactus")[0];
cactus.setAttribute('position', '0 0 -10');

setInterval(() => {
    cactus.setAttribute('position', {
        x: cactus.getAttribute('position').x,
        y: cactus.getAttribute('position').y,
        z: cactus.getAttribute('position').z + 0.02
    });
}, 10);
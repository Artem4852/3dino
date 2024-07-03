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
    const peakPosition = startPosition + 6;
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

    if (shiftPressed && camera.getAttribute('position').y > 1.3) {
        camera.setAttribute('position', '0 1 20');
    } else if (!shiftPressed && camera.getAttribute('position').y < 2.7) {
        camera.setAttribute('position', '0 3 20');
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

cacti = ["cactus_big_1", "cactus_big_2", "cactus_big_3", "cactus_small_1", "cactus_small_2"]

function spawnCactus() {
    const cactus = document.createElement('a-obj-model');
    choice = "#" + cacti[Math.floor(Math.random() * cacti.length)];
    console.log(choice);
    cactus.setAttribute('src', choice + '_obj');
    cactus.setAttribute('mtl', choice + '_mtl');
    cactus.setAttribute('scale', '0.7 0.7 0.7');
    cactus.setAttribute('position', '0 -1 -20');
    cactus.setAttribute('class', 'move cactus');
    document.getElementById('scene').appendChild(cactus);
}

for (let i = 0; i < 10; i++) {
    setTimeout(() => {
        spawnCactus();
    }, 1000 * i);
}

function moveCacti() {
    const cacti = document.getElementsByClassName('cactus');
    for (let i = 0; i < cacti.length; i++) {
        const positionAttr = cacti[i].getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
        cacti[i].setAttribute('position', {x: 0, y: -1, z: position.z + 0.1});
        if (position.z > 50) {
            cacti[i].remove();
            spawnCactus();
        }
    }
}

setInterval(() => {
    moveCacti();
    // toMove = document.getElementsByClassName("move");
    // for (let i = 0; i < toMove.length; i++) {
    //     toMove[i].setAttribute('position', {
    //         x: toMove[i].getAttribute('position').x,
    //         y: toMove[i].getAttribute('position').y,
    //         z: toMove[i].getAttribute('position').z + 0.1
    //     });
    // }
}, 10);
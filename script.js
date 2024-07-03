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

// const camera = document.getElementById('camera');
// let movingUp = true;
// let shiftPressed = false;
// let isJumping = false;
// setInterval(() => {
//     if (isJumping) return;

//     if (shiftPressed && camera.getAttribute('position').y > 1.3) {
//         camera.setAttribute('position', '0 1 20');
//     } else if (!shiftPressed && camera.getAttribute('position').y < 2.7) {
//         camera.setAttribute('position', '0 3 20');
//     }


//     const currentPosition = parseFloat(camera.getAttribute('position').y);
//     if (movingUp) {
//         updateCameraPosition(currentPosition + 0.2);
//     } else {
//         updateCameraPosition(currentPosition - 0.2);
//     }
//     movingUp = !movingUp;
// }, 150);

// document.addEventListener('keydown', (e) => {
//     if (e.key === 'Shift') {
//         shiftPressed = true;
//     } else if (e.key === 'w' && !shiftPressed) {
//         jump();
//     }
// });

// document.addEventListener('keyup', (e) => {
//     if (e.key === 'Shift') {
//         shiftPressed = false;
//     }
// });

const obstacle_names = ["cactus_big_1", "cactus_big_2", "cactus_big_3", "cactus_small_1", "cactus_small_2"]

function spawnObstacle() {
    const obstcale = document.createElement('a-obj-model');
    choice = "#" + obstacle_names[Math.floor(Math.random() * obstacle_names.length)];
    obstcale.setAttribute('src', choice + '_obj');
    obstcale.setAttribute('mtl', choice + '_mtl');
    obstcale.setAttribute('scale', '0.7 0.7 0.7');
    obstcale.setAttribute('position', {x: 0, y: -1, z: -50});
    obstcale.setAttribute('class', 'obstacle');
    document.getElementById('scene').appendChild(obstcale);
}

function spawnFloor() {
    const floor = document.createElement('a-obj-model');
    choice = "#floor_" + (Math.floor(Math.random() * 3) + 1);
    floor.setAttribute('src', choice + '_obj');
    floor.setAttribute('mtl', choice + '_mtl');
    floor.setAttribute('scale', '0.7 0.7 0.7');
    floor.setAttribute('position', {x: 0, y: -1, z: -100});
    console.log("POSITION: ", floor.getAttribute('position'));
    floor.setAttribute('class', 'floor');
    document.getElementById('scene').appendChild(floor);
}

function moveObstacles() {
    const obstacles = document.getElementsByClassName('obstacle');
    for (let i = 0; i < obstacles.length; i++) {
        const positionAttr = obstacles[i].getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
        obstacles[i].setAttribute('position', {x: 0, y: -1, z: position.z + 0.1});
        if (position.z > 60) {
            obstacles[i].remove();
        }
    }
}

setInterval(() => {
    spawnObstacle();
}, 1000);

spawnFloor();

setInterval(() => {
    moveObstacles();
    floors = document.getElementsByClassName("floor");
    let spawn = false;
    for (let i = 0; i < floors.length; i++) {
        const positionAttr = floors[i].getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
        floors[i].setAttribute('position', { x: 0, y: -1, z: position.z + 0.1 });
        console.log(position.z)
        if (Math.floor(position.z) === 0) {
            spawn = true;
        } else if (position.z > 70) {
            floors[i].remove();
        }
    }
    if (spawn) {
        spawnFloor();
    }
    return;
}, 10);
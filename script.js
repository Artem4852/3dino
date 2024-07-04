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
let movingUp = true;
let shiftPressed = false;
let isJumping = false;
let reload = false;
setInterval(() => {
    if (isJumping || reload) return;

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


const obstacle_names = ["cactus_big_1", "cactus_big_2", "cactus_big_3", "cactus_small_1", "cactus_small_2"]

function spawnObstacle() {
    return new Promise((resolve) => {
        const obstacle = document.createElement('a-obj-model');
        choice = "#" + obstacle_names[Math.floor(Math.random() * obstacle_names.length)];
        size = choice.includes("small") ? "short" : "tall";
        obstacle.setAttribute('src', choice + '_obj');
        obstacle.setAttribute('mtl', choice + '_mtl');
        obstacle.setAttribute('scale', '0.7 0.7 0.7');
        obstacle.setAttribute('position', {x: 0, y: -0.9, z: -50});
        obstacle.setAttribute('rotation', {x: 0, y: Math.random() * 360, z: 0});
        obstacle.setAttribute('class', 'obstacle');

        obstacle.setAttribute('shadow', 'cast: true');
        obstacle.setAttribute('shadowcaster', '');
        obstacle.setAttribute('material', 'shader: standard');

        obstacle.setAttribute('data-obstacle_type', size + "_cactus")
        obstacle.addEventListener('loaded', () => resolve(obstacle));
        document.getElementById('scene').appendChild(obstacle);
    });
}

function spawnFloor(origin = false) {
    return new Promise((resolve) => {
        const floor = document.createElement('a-obj-model');
        choice = "#floor_" + (Math.floor(Math.random() * 3) + 1);
        floor.setAttribute('src', choice + '_obj');
        floor.setAttribute('mtl', choice + '_mtl');
        floor.setAttribute('scale', '0.7 0.7 0.7');
        floor.setAttribute('position', {x: 0, y: -1, z: origin ? 0 : -100});
        floor.setAttribute('class', 'floor');

        floor.setAttribute('shadow', 'receive: true');
        floor.setAttribute('material', 'shader: standard');

        floor.addEventListener('loaded', () => resolve(floor));
        document.getElementById('scene').appendChild(floor);
    });
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

function checkCollisions() {
    const camera = document.getElementById('camera');
    const cameraPositionAttr = camera.getAttribute('position');
    const cameraPosition = typeof cameraPositionAttr === 'string' ? AFRAME.utils.coordinates.parse(cameraPositionAttr) : cameraPositionAttr;
    const obstacles = document.getElementsByClassName('obstacle');
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const positionAttr = obstacle.getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
        if (position.z > cameraPosition.z + 1 || position.z < cameraPosition.z - 1 || reload) continue;
        // console.log(cameraPosition, position)
        if (obstacle.getAttribute('data-obstacle_type') === 'short_cactus' && cameraPosition.y < 5) {
            alert("Game over!");
            reload = true;
            return;
        }
        else if (obstacle.getAttribute('data-obstacle_type') === 'tall_cactus' && cameraPosition.y < 8) {
            alert("Game over!");
            reload = true;
            return;
        }
    }
}

async function spawnObstacleRandomly() {
    await spawnObstacle();
    setTimeout(spawnObstacleRandomly, Math.floor(Math.random() * 1000) + 1500);
}
setTimeout(spawnObstacleRandomly, 1000);


async function initializeFloors() {
    await spawnFloor(true);
    await spawnFloor(false);
}
initializeFloors();

let lastSpawned = 0;
setInterval(() => {
    checkCollisions();
    if (reload) {
        location.reload();
        return;
    }
    moveObstacles();
    floors = document.getElementsByClassName("floor");
    let spawn = false;
    lastSpawned += 0.1;
    for (let i = 0; i < floors.length; i++) {
        const positionAttr = floors[i].getAttribute('position');
        const position = typeof positionAttr === 'string' ? AFRAME.utils.coordinates.parse(positionAttr) : positionAttr;
        floors[i].setAttribute('position', { x: 0, y: -1, z: position.z + 0.1 });
        if (Math.floor(position.z) === 0 && lastSpawned >= 2) {
            spawn = true;
            lastSpawned = 0;
        } else if (position.z > 70) {
            floors[i].remove();
        }
    }
    if (spawn) {
        spawnFloor();
    }
    return;
}, 10);
const obstacle_names = ["cactus_big_1", "cactus_big_2", "cactus_big_3", "cactus_small_1", "cactus_small_2", "pteranodon", "pteranodon", "pteranodon"]

function spawnObstacle() {
    return new Promise((resolve) => {
        choice = obstacle_names[Math.floor(Math.random() * obstacle_names.length)]
        if (choice === "pteranodon") {
            const obstacle = document.createElement('a-entity');
            obstacle.setAttribute('position', { x: 0, y: 4, z: -50 });
            obstacle.setAttribute('class', 'obstacle');
            obstacle.setAttribute('data-obstacle_type', "pteranodon")

            const base = document.createElement('a-obj-model');
            base.setAttribute('src', '#pteranodon_base_obj');
            base.setAttribute('mtl', '#pteranodon_base_mtl');
            base.setAttribute('scale', '0.7 0.7 0.7');
            base.setAttribute('position', '0 0 0');
            obstacle.appendChild(base);

            const wing_l = document.createElement('a-obj-model');
            wing_l.setAttribute('src', '#pteranodon_wing_l_obj');
            wing_l.setAttribute('mtl', '#pteranodon_wing_l_mtl');
            wing_l.setAttribute('scale', '0.7 0.7 0.7');
            wing_l.setAttribute('position', '0 0.78 -3.03806');
            obstacle.appendChild(wing_l);

            const wing_r = document.createElement('a-obj-model');
            wing_r.setAttribute('src', '#pteranodon_wing_r_obj');
            wing_r.setAttribute('mtl', '#pteranodon_wing_r_mtl');
            wing_r.setAttribute('scale', '0.7 0.7 0.7');
            wing_r.setAttribute('position', '0 0.78 -3.03806');
            obstacle.appendChild(wing_r);

            obstacle.addEventListener('loaded', () => resolve(obstacle));
            document.getElementById('scene').appendChild(obstacle);
        }
        else {
            const obstacle = document.createElement('a-obj-model');
            id = "#" + choice;
            size = choice.includes("small") ? "short" : "tall";
            obstacle.setAttribute('src', id + '_obj');
            obstacle.setAttribute('mtl', id + '_mtl');
            obstacle.setAttribute('scale', '0.7 0.7 0.7');
            obstacle.setAttribute('position', { x: 0, y: -0.9, z: -50 });
            obstacle.setAttribute('rotation', { x: 0, y: Math.random() * 360, z: 0 });
            obstacle.setAttribute('class', 'obstacle');

            obstacle.setAttribute('shadow', 'cast: true');
            obstacle.setAttribute('shadowcaster', '');
            obstacle.setAttribute('material', 'shader: standard');

            obstacle.setAttribute('data-obstacle_type', size + "_cactus")
            obstacle.addEventListener('loaded', () => resolve(obstacle));
            document.getElementById('scene').appendChild(obstacle);
        }
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
        obstacles[i].setAttribute('position', {x: 0, y: position.y, z: position.z + 0.1});
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
        else if (obstacle.getAttribute('data-obstacle_type') === 'pteranodon' && cameraPosition.y > 2) {
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
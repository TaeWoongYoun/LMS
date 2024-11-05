const data = {
    score: 0,
    oldCoords: null,
    newCoords: null,
    pos: { x: 3, y: -2 },
    over: false
};

const renderWell = () => {
    const wellElement = document.querySelector('pre');
    wellElement.textContent = `${data.score}\n${well.map(row => row.join('')).join('\n')}\n`;
};

let well = Array(20).fill(0).map(() => Array(10).fill('□'));

const tets = [
    [['□', '■', '□'], ['■', '■', '■'], ['□', '□', '□']], // T
    [['■', '□', '□'], ['■', '■', '■'], ['□', '□', '□']], // L
    [['□', '□', '■'], ['■', '■', '■'], ['□', '□', '□']], // J
    [['■', '■', '□'], ['■', '■', '□'], ['□', '□', '□']], // O
    [['□', '■', '■'], ['■', '■', '□'], ['□', '□', '□']], // S
    [['■', '■', '□'], ['□', '■', '■'], ['□', '□', '□']], // Z
    [['□', '□', '□', '□'], ['■', '■', '■', '■'], ['□', '□', '□', '□']], // I
];

let tet = tets[Math.floor(Math.random() * tets.length)];

window.addEventListener('keydown', e => {
    if (data.over) return;

    if (e.code === 'ArrowDown') {
        canMove('down') && move('down');
    } else if (e.code === 'ArrowLeft') {
        canMove('left') && move('left');
    } else if (e.code === 'ArrowRight') {
        canMove('right') && move('right');
    } else if (e.code === 'ArrowUp') {
        canMove('rotate') && move('rotate');
    }
});

const setCoords = (t, p) => t.flatMap((r, i) => r.map((c, j) => ({ x: p.x + j, y: p.y + i, z: c === '■' })));

const placeOnWell = coords => {
    coords.forEach(c => { if (c.y >= 0 && c.z) well[c.y][c.x] = '■'; });
};

const removeFromWell = (coords, w) => {
    coords.forEach(c => { if (c.y >= 0 && c.z) w[c.y][c.x] = '□'; });
};

const canMove = dir => {
    const tempWell = JSON.parse(JSON.stringify(well)); 
    const tempPos = { ...data.pos };

    data.oldCoords && removeFromWell(data.oldCoords, tempWell);

    if (dir === 'rotate') {
        const rotateTet = t => t[0].map((_, i) => t.map(row => row[i]).reverse());
        const tempTet = rotateTet(tet);
        const tempNC = setCoords(tempTet, tempPos);
        const collided = tempNC.some(c => c.z && c.y >= 0 && (!tempWell[c.y] || tempWell[c.y][c.x] === '■'));

        if (!collided) {
            tet = tempTet;
            return true;
        }
        return false;
    }

    if (dir === 'down') {
        tempPos.y += 1;
        const tempNC = setCoords(tet, tempPos);
        const collided = tempNC.some(c => c.z && c.y >= 0 && (!tempWell[c.y] || tempWell[c.y][c.x] === '■'));

        if (data.oldCoords && collided && !well[0].slice(3, 6).includes('■')) {
            data.pos = { x: 3, y: -2 };
            data.newCoords = null;
            data.oldCoords = null;
            clearFullRows();
            tet = tets[Math.floor(Math.random() * tets.length)];
        }

        if (collided && well[0].slice(3, 6).includes('■')) {
            well[8] = ['G', 'A', 'M', 'E', ' ', 'O', 'V', 'E', 'R'];
            data.over = true;
            renderWell();
        }
        return !collided;
    }

    if (dir === 'left') {
        tempPos.x -= 1;
        const tempNC = setCoords(tet, tempPos);
        return !tempNC.some(c => c.z && (!(tempWell[c.y] && tempWell[c.y][c.x]) || tempWell[c.y][c.x] === '■'));
    }

    if (dir === 'right') {
        tempPos.x += 1;
        const tempNC = setCoords(tet, tempPos);
        return !tempNC.some(c => c.z && (!(tempWell[c.y] && tempWell[c.y][c.x]) || tempWell[c.y][c.x] === '■'));
    }

    return true;
};

const move = dir => {
    if (dir === 'down') { data.pos.y += 1; }
    if (dir === 'left') { data.pos.x -= 1; }
    if (dir === 'right') { data.pos.x += 1; }

    data.newCoords = setCoords(tet, data.pos);
    data.oldCoords && removeFromWell(data.oldCoords, well);
    placeOnWell(data.newCoords);
    data.oldCoords = data.newCoords;
    renderWell();
};

const clearFullRows = () => {
    well = well.filter(row => !row.every(c => c === '■'));
    const rowsCleared = 20 - well.length;
    data.score += rowsCleared;
    for (let i = 0; i < rowsCleared; i++) well.unshift(Array(10).fill('□'));
};

let before = Date.now();
const freeFall = () => {
    const now = Date.now();
    if (now - before >= 500) {
        before = now;
        canMove('down') && move('down');
    }
    if (well[8][0] !== 'G') requestAnimationFrame(freeFall);
};

requestAnimationFrame(freeFall);

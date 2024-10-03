const range = end => Array.from(Array(end).keys());

const checkCell = e => typeof e != "number";
const checkNotCell = e => typeof e == "number"

const giveIndex = (cell, predicate) => {
    const property = predicate ? cell.style.top : cell.style.left;
    return property.slice(0, property.length - 2) / 110;
};

const createCell = (options = {}, addClass = false) => Object.assign(document.createElement('div'), { className: `d-flex cell ${addClass ? "float" : ""}`, ...options });

const structureCells = grid => {
    grid.forEach((e, index) => {
        if (checkCell(e)) {
            cells[index] = createCell({ className: e.class, style: `top: ${e.top}; left: ${e.left};`, innerHTML: e.text });
            board.append(cells[index]);
        };
    });
};

const destructureCells = () => cells.map(cell => checkCell(cell) ? Object({ class: cell.className, top: cell.style.top, left: cell.style.left, text: cell.innerHTML }) : cell);

const fillCell = () => {
    let list = cells.filter(checkNotCell);
    const index = list[Math.floor(Math.random() * list.length)];
    setTimeout(() => {
        const cell = createCell({ style: `top: ${Math.floor(index / width) * 110}px; left: ${index % width * 110}px;` }, true);
        setTimeout(() => {
            let value = Math.random() * 7 < 6 ? 2 : 4;
            Object.assign(cell, { innerHTML: `${value}`, className: cell.className + ` cell-${value}` });
            cells[index] = cell;
            localStorage.setItem("board", JSON.stringify(destructureCells()));
        }, 100);
        board.append(cell);
    }, 150);
};

const formGroups = opt => {
    const groups = Array.from(Array(width), () => new Array());
    cells.filter(checkCell).forEach(e => groups[giveIndex(e, opt)].push(e));
    return groups;
};

const checkAnyMove = () => {
    for (let i = 0; i < width; i++) for (let j = 0; j < width; j++) if ((i + j) % 2 && (i != 0 && cells[i * width + j].innerHTML == cells[(i - 1) * width + j].innerHTML) || (i != width - 1 && cells[i * width + j].innerHTML == cells[(i + 1) * width + j].innerHTML) || (j != 0 && cells[i * width + j].innerHTML == cells[i * width + j - 1].innerHTML) || (i != width - 1 && cells[i * width + j].innerHTML == cells[i * width + j + 1].innerHTML)) return true;
    displayMsg(1);
}

const performAction = value => {
    const con1 = ["Left", "Right"].includes(value);
    const con2 = ["Left", "Up"].includes(value);
    let swap = false;

    const groups = formGroups(con1);
    cells = range(size);

    groups.forEach((list, index) => {
        let count = con2 ? 0 : width - 1;
        if (list.length == 1 && !(giveIndex(list[0], !con1) == count)) swap = true;
        else {
            list = con2 ? list : list.reverse();
            for (let j = 0; j < list.length - 1; j++) if (Math.abs(giveIndex(list[j + 1], !con1) - giveIndex(list[j], !con1)) > 1 || (con2 ? giveIndex(list[j], !con1) > j : giveIndex(list[j], !con1) < (count - j)) || list[j].innerHTML == list[j + 1].innerHTML) swap = true;
        }

        range(list.length).forEach(e => {
            if (e != 0) {
                if (list[e].innerHTML != list[e - 1].innerHTML) count += con2 ? 1 : -1;
                else {
                    list[e].classList.replace(`cell-${list[e].innerHTML}`, `cell-${list[e].innerHTML * 2}`);
                    list[e].innerHTML = list[e].innerHTML * 2;
                    setTimeout(() => list[e - 1].remove(), 150);
                };
            };
            con1 ? list[e].style.left = `${count * 110}px` : list[e].style.top = `${count * 110}px`;
            let [a, b] = con1 ? [index, count] : [count, index];
            cells[a * width + b] = list[e];
        });
    });
    if (swap) fillCell();
    if (!cells.some(checkNotCell)) checkAnyMove();
    else if (checkWin()) displayMsg(0);
};

const checkWin = () => cells.some(e => e.innerHTML == "2048");

const displayMsg = ch => {
    const container = document.querySelector(".msg-container");
    container.classList.remove("hidden")
    container.style.background = `#${ch ? "ff0000" : "00ff4c"}cc`
    container.querySelector(`#${ch ? "lose" : "win"}`).classList.remove("d-none");
}

const startGame = () => {
    range(size).forEach(_ => board.append(createCell()));
    let grid = JSON.parse(localStorage.getItem("board"));
    if (grid) structureCells(grid);
    else range(2).forEach(_ => setTimeout(fillCell, 100));
}

const newGame = () => {
    board.innerHTML = "";
    cells = range(size);
    localStorage.removeItem("board");
    startGame()
}

const width = 4;
const size = width * width;

const board = document.querySelector(".grid-container");
let cells = range(size);

startGame()

addEventListener("keydown", key => {
    let value = key.key.slice(5);
    if (["Up", "Down", "Left", "Right"].includes(value)) performAction(value);
});
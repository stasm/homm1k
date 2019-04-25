function cell_to_screen(cell) {
    return {
        x: (cell % 30 * 4 + 500 - offset_x) * 8,
        y: ((0|cell / 30) * 4 + 20 - offset_y) * 8,
    };
}

function show_current_cell(cell) {
    let {x, y} = cell_to_screen(cell);
    if (x > 480 - 32)
        return;

    let prev_fill_style = c.fillStyle;
    let score = world[cell];
    c.fillStyle = palette[5];
    c.fillRect(x, y, 32, 32);
    c.fillStyle = `hsla(
        ${score * 255 / 15}, 100%, 50%, ${0.2 - score / 75}`;
    c.fillRect(x, y, 24, 24);
    c.fillStyle = `rgba(255, 255, 255, ${0.5 - score / 30}`;
    c.font = "16px monospace";
    c.fillText(score, x + 2, y + 16);
    c.fillStyle = prev_fill_style;
}

let arrows = [
    "↑",
    "←",
    "↓",
    "→",
    "↖",
    "↙",
    "↘",
    "↗",
];

function show_current_neighbor(n, i) {
    let {x, y} = cell_to_screen(n);
    if (x > 480 - 32)
        return;

    let prev_fill_style = c.fillStyle;
    c.fillStyle = "rgba(255, 255, 255, .9)";
    c.font = "16px sans-serif";
    c.fillText(arrows[i], x + 8, y + 16);
    c.fillStyle = prev_fill_style;
}

function show_world_values() {
    for (let [cell, score] of world.entries()) {
        let {x, y} = cell_to_screen(cell);
        if (x > 480 - 32)
            continue;

        if (score === palette) {
            c.fillStyle = "hsla(0, 0%, 0%, 1)";
            c.fillRect(x, y, 32, 32);
        }
    }

    return true;
}

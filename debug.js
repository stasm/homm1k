function tile_to_screen(i) {
    return {
        x: (i % 30 * 4 + 500 - offset_x) * 8,
        y: ((0|i / 30) * 4 + 20 - offset_y) * 8,
    };
}

function DEBUG_distances() {
    for (let [i, score] of world.entries()) {
        if (isNaN(score) || score === 0 || score > 15)
            continue

        let {x, y} = tile_to_screen(i);
        if (x >= 480)
            continue;

        let prev_fill_style = c.fillStyle;
        c.fillStyle = `hsla(
                ${score * 255 / 15}, 100%, 50%, ${0.33 - score / 45}`;
        c.fillRect(x, y, 24, 24);
        c.fillStyle = `rgba(255, 255, 255, ${0.5 - score / 30}`;
        c.font = "16px monospace";
        c.fillText(score, x + 2, y + 16);
        c.fillStyle = prev_fill_style;
    }
}

function DEBUG_critter(i) {
    let {x, y} = tile_to_screen(i);
    if (x < 480) {
        let prev_fill_style = c.fillStyle;
        c.fillStyle = `rgba(0, 128, 255, 0.5)`;
        c.fillRect(x, y, 24, 24);
        c.fillStyle = prev_fill_style;
    }

    return true;
}

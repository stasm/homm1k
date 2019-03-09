function DEBUG_distances() {
    for (let [i, score] of world.entries()) {
        if (score <= 15) {
            let x = (i % 30 * 4 + 500 - offset_x) * 8;
            let y = ((0|i / 30) * 4 + 20 - offset_y) * 8;
            if (x >= 480) continue;

            c.fillStyle = `rgba(128, 128, 0, ${0.5 - score / 30}`;
            c.fillRect(x, y, 24, 24);
            c.fillStyle = `rgba(255, 255, 255, ${0.5 - score / 30}`;
            c.font = "16px monospace";
            c.fillText(score, x + 2, y + 16);
        }
    }
}

c.imageSmoothingEnabled = false;
var palette = [
    ,       // transparent
    "#000", // 1 black
    "#900", // 2 red
    "#c96", // 3 beige
    "#382", // 4 light green
    "#352", // 5 dark green
    "#036", // 6 blue
    "#fff", // 7 white
],
player_pos = 248,
offset_x = 1,
offset_y = 1,
target = 0,
through = 0,
timeout = 0,
distances = [],
world = (x, y) => 30 * (y + offset_y) + x + offset_x,
view = i => [(i % 30) - offset_x, (i / 30 >> 0) - offset_y],
minimap = (x, y) => [500 + x * 4, 20 + y * 4],

draw = (x, y, pattern) => {
    for (let i = 0; i < 16; i++) {
        let index = parseInt(pattern.substr(i * 3, 3), 2);
        if (index) {
            c.fillStyle = palette[index];
            c.fillRect(x + (i % 4), y + (i / 4 >> 0), 1, 1);
        }
    }
},

draw_tilted = ([x, y], pattern) => {
    //c.scale(8, 8);
    //c.rotate(Math.PI / 4);
    //c.translate(x * 4 + 2.5, y * 4 + 1.5);
    c.setTransform(5.6, 5.6, -5.6, 5.6, x*32+20, y*32+12);
    draw(-2.5, -1.5, pattern);
    c.setTransform(1, 0, 0, 1, 0, 0);
},

neighbors = i => [
    i - 30, i - 1, i + 30, i + 1,
    i - 30 - 1, i + 30 - 1, i + 30 + 1, i - 30 + 1],

distance = i => neighbors(i).map(n =>
    distances[i] + 1 < distances[n] &&
        (distances[n] = distances[i] + 1, distance(n))),

move = (x, y) => {
    // x, y are in view coords
    clearTimeout(timeout);
    render();
    let i = world(x, y);
    if (distances[i] > 0) {
        if (i === target) {
            player_pos = through;
            timeout = setTimeout(() => move(x, y), 33);
        }
        target = i;
        path(i);
    }
},

path = i => {
    trace(i);
    draw_tilted(view(i), "000000100000000100100100000001100001000000001000" /* x */);
},

scroll = (x, y) => {
    offset_x = x / 4 >> 0;
    offset_y = y / 4 >> 0;
    render();
    target && target !== player_pos && path(target);
},

trace = i => (through = i, neighbors(i).some(n =>
        //  (c.font = "8px sans-serif", c.fillStyle = "#fff",
        //  c.fillText(distances[n], ...view(n).map(x => x * 32 + 4)),
         distances[n] === 0 || distances[n] < distances[i] &&
             (draw_tilted(view(n), "000000000000000000100000000000001000000000000000" /* dot */), trace(n)))),

render = () => {
    // Sidebar
    c.fillStyle = palette[2];
    c.fillRect(480, 0, 160, 480);
    c.fillStyle = palette[1];
    c.fillRect(490, 10, 140, 140);


    // Map
    for (let c = 0; c < 30**2; c++) {
        let x = c % 30;
        let y = c / 30 >> 0;
        let v =
            (Math.sin((x + 5) / 3) + Math.sin(y / 4))
            + (Math.cos((x + 3) / 5) + Math.cos(y / 6));

        draw(...minimap(x, y),
            v > 2.3 ? "101001011101001001001011001001001001001001001001" : // rock
            v > .7 ? "101101100101101100100101101100100100101101001101" : // tree
            v > -1 ? "101101101101101101101101101101101101101101101101" : // grass
            v > -1.7 ? "011011011011011011011011011011011011011011011011" : // beach
            "110110110110110110110110110110110110110110110110", // water
        );

        distances[c] = -1.7 < v && v < .7 ? Infinity : "X";
    }

    distances[player_pos] = 0;
    distance(player_pos);

    draw(
        ...minimap(player_pos % 30, player_pos / 30 >> 0),
        "010110111111000110111000001010001000111000111000" /* knight */);

    // Viewport
    c.drawImage(a, ...minimap(offset_x, offset_y), 60, 60, 0, 0, 480, 480);

    // Overflow border
    c.lineWidth = 2;
    c.strokeStyle = palette[7];
    c.strokeRect(...minimap(offset_x, offset_y), 60, 60);
};

render();

a.onclick = (e, x, y) => (
    x = e.x - e.target.offsetLeft,
    y = e.y - e.target.offsetTop,
    // Handle viewport clicks
    x < 480 && move(x / 32 >> 0, y / 32 >> 00),
    // Handle minimap clicks
    (500 < x && x < 620 && 20 < y && y < 140) && scroll(x - 530, y - 50));

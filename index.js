var palette = [
    ,       // transparent
    "#111", // 1 black
    "#900", // 2 red
    "#c96", // 3 beige
    "#382", // 4 light green
    "#352", // 5 dark green
    "#036", // 6 blue
    "#fff", // 7 white
],

// The position of the player and the enemy expressed as an index into the 30x30
// world array.
player_pos = 335,
enemy_pos = 373,

// The offset of the currently viisble area of the minimap, in canvas pixels
// from the origin. This makes it easy to update it when scrolling the view, to
// draw the white border on the minimap, and to draw the zoomed in viewport.
offset_x = 508,
offset_y = 28,

// The world array index of the most recently clicked tile.
target = -1,

// The world array index of the next tile on the path from the player to the
// current target. It's updated every time the path is traced. Because the
// tracing starts at the target, the last tile traced is the closest to the
// player.
next = -1,

// The world array stores distances of each tile to the player, as well as a
// non-numeric value for non-passable terrain, and +Infinity for unreachable
// tiles.
world = [],

// Seed for noise used in terrain generation.
timestamp = Date.now(),

// A generic draw function capable of drawing 4x4 sprites or solid 4x4 blocks of
// color. Sprites encode 48 bits of data: 7 colors or transparency (3 bits) for
// each of the 16 pixels. When written as octal numbers, the pixel pattern is
// easy to spot; each digits corresponds to one pixel. Pixels are encoded in the
// reversed order, i.e. the first digit of the 16-digit long octal number
// (the factor of 8**15) represents the last pixel of the sprite in the
// top-to-bottom, left-to-right reading order. Hint: transparent pixels on the
// last row of the sprite will result in zeros at the front of the encoded
// sprite. Free bytes!
draw = (sprite, x, y) => {
    for (p=16; p--;) {
        if (c.fillStyle = palette[
                // Single-digit sprites are solid 4x4 blocks of the same color.
                // Regular sprites are decoded into pixels by dividing the whole
                // sprite by a factor of 8 corresponding to the position of the
                // currently drawn pixel, followed by an AND with 0b111 to get
                // just the value of that pixel. The value is an index into the
                // array of colors.
                sprite < 8 ? sprite : 0|sprite / 8 ** p & 7]) {
            c.fillRect(x + (p % 4), y + (0|p / 4), 1, 1);
        }
    }
},

minimap = (i, sprite) =>
    draw(sprite, i % 30 * 4 + 500, (0|i / 30) * 4 + 20),

viewport = (i, sprite) => {
    // Approximate scale(8, 8) and rotate(Math.PI / 4).
    c.setTransform(6, 6, -6, 6,
        (i % 30 * 4 + 502 - offset_x) * 8,
        ((0|i / 30) * 4 + 20 - offset_y) * 8);
    draw(sprite, 0, 0);
    c.resetTransform();
},

neighbors = i => [
    // Cardinal directions: N W S E
    i - 30, i - 1, i + 30, i + 1,
    // Diagonal directions: NW SW SE NE
    i - 31, i + 29, i + 31, i - 29,
],

distance = i => neighbors(i).map(n =>
    world[i] + 1 < world[n] &&
        (world[n] = world[i] + 1, distance(n))),

plan = i => {
    // If the tile is reachable...
    if (world[i] > 0 && world[i] < Infinity) {
        // Trace the path from it to the player.
        trace(target = i);
        // Draw the X mark.
        viewport(i, 0x80590db018); // The X
    }
},

trace = i => (next = i, neighbors(i).some(n =>
         world[n] == 0 || world[n] < world[i] &&
             (viewport(n, 0x8018000), // The dot
             trace(n)))),

render = (i = 900, v) => {
    // Draw the red background.
    // Also set the line width for the minimap visible area
    c.fillStyle = palette[c.lineWidth = 2];
    c.fillRect(0, 0, 640, 480);

    // Draw the minimap's black border.
    c.fillStyle = palette[1];
    c.fillRect(490, 10, 140, 140);

    // Draw the minimap.
    while (i--) {
        // Generate the terrain seeded by the timestamp of when the script ran.
        v = 5 * Math.sin((i % 30 - 17) * (i - 300) / 3e3)
                + Math.sin(timestamp % i) + 3;

        minimap(i,
            v > 6 ? 0x249249649acd: // rock
            v > 4 ? 0xa6d925b25b2d: // tree
            v > 1 ? 5: // grass
            v > 0 ? 0x92592db6db6d: // bush
            6 // water
        );

        // palette here is used as a non-numerical value (also when coerced)
        // which doesn't compare as less than nor greater than a number when
        // compared in distance(). It represents non-passable terrain.
        world[i] = 0 < v && v <= 4 ? Infinity : palette;
    }

    // minimap(enemy_pos, 0x6180d81d8fda); // griffin
    // minimap(enemy_pos, 0x40249088489); // black dragon
    // minimap(enemy_pos, 0x80492050252); // red dragon
    // minimap(enemy_pos, 0x249049040051); // snake
    // minimap(enemy_pos, 0x208248088489); // dread knight
    // minimap(enemy_pos, 0x4124904900a); // godzilla
    // minimap(enemy_pos, 0x4824804900a); // t-rex
    minimap(enemy_pos, 0x208048088489); // gargoyle
    minimap(player_pos, 0x1c70711d8ff2); // player

    // Viewport
    c.drawImage(a, offset_x, offset_y, 60, 60, 0, 0, 480, 480);

    // Minimap visible area border
    c.strokeStyle = palette[7];
    c.strokeRect(offset_x, offset_y, 60, 60);

    // Populate the world array with distances of each tile to the player.
    world[player_pos] = 0;
    distance(player_pos);

    // Move the player if they haven't reached the target yet.
    if (world[target]) {
        // Re-draw the path to the target.
        plan(target);

        // Move the dragon one tile away from the player, if possible.
        neighbors(enemy_pos).some(n =>
            // Shuffle the neighboring tiles by mixing the timestamp (a
            // pseudo-random component) in and testing sin() against a
            // threshold. The threshold is set to reject more tiles than it
            // accepts, which makes the enemy skip some moves. This mitigates
            // the consequence of the > check on the next line, which makes the
            // enemy flee in a direction strictly away from the player, thus
            // making it hard to cath up with it.
            Math.sin(n * Date.now()) > .3
            // We use the > check rather than >= to avoid the enemy swapping
            // places with the player when they're next to each other. With >,
            // the enemy is only allowed to run away from the player. E.g. if
            // the player is at NW, the enemy will choose between S, SE, and E.
            && world[n] > world[enemy_pos]
            // If the tile is a good candidate for the enemy's movement, update
            // the enemy's position and return true to end the some() iteration.
            && (enemy_pos = n));

        // Move the player one tile along the traced path.
        if (enemy_pos == (player_pos = next)) {
            // Defeat the dragon!
            // Clear the screen and draw the checkmark. enemy_pos is set to
            // undefined and acts as a flag to stop rendering.
            enemy_pos = c.fillRect(0, 0, 640, 480);
            viewport(player_pos, 0x168164160020);
        }
    }
},
// Render the game only while the dragon is roaming.
tick = _ => enemy_pos && render();

a.onclick = (e,
        x = e.x - e.target.offsetLeft,
        y = e.y - e.target.offsetTop) => (
    // Handle viewport clicks
    x < 480 && enemy_pos && plan(
        // Transform x, y into an index into the world array
        0|(x/8 + offset_x - 500) / 4
        + 30 * (0|(y/8 + offset_y - 20) / 4)),
    // Handle minimap clicks
    500 < x && y < 140 && (
        offset_x = x - 30,
        offset_y = y - 30));

// The visible minimap fragment is drawn into the main viewport scaled up via
// drawImage(). Preserve the sharpness of pixels.
c.imageSmoothingEnabled = false;

// Start the game loop.
setInterval(tick, 200);

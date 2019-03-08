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

// The position of the player and the critter expressed as an index into the
// 30x30 world array.
player = 335,
critter = 373,

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


// DRAWING

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
        // Single-digit sprites are solid 4x4 blocks of the same color. Regular
        // sprites are decoded into pixels by dividing the whole sprite by a
        // factor of 8 corresponding to the position of the currently drawn
        // pixel, followed by an AND with 0b111 to get just the value of that
        // pixel. The value is an index into the array of colors.
        if (c.fillStyle = palette[sprite < 8
                ? sprite : 0|sprite / 8 ** p & 7]) {
            c.fillRect(x + (p % 4), y + (0|p / 4), 1, 1);
        }
    }
},

// Draw a sprite on the minimap.
minimap = (i, sprite) =>
    draw(sprite, i % 30 * 4 + 500, (0|i / 30) * 4 + 20),

// Draw a sprite in the main viewport. This only happens for the path indicators
// and the victory checkmark. The canvas needs to be scaled up and rotated. This
// makes the X look like an x :)
viewport = (i, sprite) => {
    // Approximate scale(8, 8) and rotate(Math.PI / 4).
    c.setTransform(
            6, 6, -6, 6,
            (i % 30 * 4 + 502 - offset_x) * 8,
            ((0|i / 30) * 4 + 20 - offset_y) * 8);
    draw(sprite, 0, 0);
    c.resetTransform();
},


// PATH-FINDING

// For a given tile of the world array, return the 8 tiles neighboring with it
// on the map. Note: this makes the map wrap around horizontally.
neighbors = i => [
    // Cardinal directions: N W S E
    i - 30, i - 1, i + 30, i + 1,
    // Diagonal directions: NW SW SE NE
    i - 31, i + 29, i + 31, i - 29,
],

// For a given tile, inspect its neighbors and increment their distance scores
// if they haven't been inspected yet. Non-passable terrain is represented as a
// non-numeric value which also fails the < check. If the computed distance
// score of the neighbor is lower than the preivous one, assign it and
// recursively call distance on the neighbor's neighbors.
distance = i => neighbors(i).map(n =>
    world[i] + 1 < world[n]
    && (world[n] = world[i] + 1, distance(n))),

// Trace the path connecting the player and the target. The tracing starts at
// the target and follows the descending gradient of distance scores stored in
// the world array. For each tile on the path, its neighbors are considered and
// the first neighbor with a lower distance score is recurred into. The
// recursive loop ends when the first neighbor with the score of 0 is found,
// i.e. the path has reached a tile immediately next to the player. Note that
// this function also updates the `next` global every time it's called, which is
// used in the render loop to move the player. Path tracing starts at the target
// and proceeds towards the player which means that the last time `next` is
// updated it will hold the index of the tile which is the closest to the player
// and on the path to the target.
trace = i => neighbors(next = i).some(n =>
     world[n] == 0 || world[n] < world[i]
     && (viewport(n, 0x8018000), // The dot
         trace(n))),

// Plan the player's movement in response to a click.
plan = i => {
    // If the tile is reachable...
    if (world[i] > 0 && world[i] < Infinity) {
        // Trace the path from it to the player.
        trace(target = i);
        // Draw the X mark.
        viewport(i, 0x80590db018); // The X
    }
},


// GAME LOOP

// Render the game only while the dragon is roaming.
tick = _ => critter && render(),

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

    // minimap(critter, 0x6180d81d8fda); // griffin
    // minimap(critter, 0x40249088489); // black dragon
    // minimap(critter, 0x80492050252); // red dragon
    // minimap(critter, 0x249049040051); // snake
    // minimap(critter, 0x208248088489); // dread knight
    // minimap(critter, 0x4124904900a); // godzilla
    // minimap(critter, 0x4824804900a); // t-rex
    minimap(critter, 0x208048088489); // gargoyle
    minimap(player, 0x1c70711d8ff2); // knight

    // Draw the main viewport by copying and scaling the minimap up.
    c.drawImage(a, offset_x, offset_y, 60, 60, 0, 0, 480, 480);

    // Draw the white border around the visible area on the minimap.
    c.strokeStyle = palette[7];
    c.strokeRect(offset_x, offset_y, 60, 60);

    // Populate the world array with distances of each tile to the player.
    world[player] = 0;
    distance(player);

    // Move the player if they haven't reached the target yet.
    if (world[target]) {
        // Re-draw the path to the target.
        plan(target);

        // Move the dragon one tile away from the player, if possible.
        neighbors(critter).some(n =>
            // Shuffle the neighboring tiles by mixing the timestamp (a
            // pseudo-random component) in and testing sin() against a
            // threshold. The threshold is set to reject more tiles than it
            // accepts, which makes the critter skip some moves in order to
            // mitigate the consequence of the > check on the next line.
            Math.sin(n * Date.now()) > .3
            // We use the > check rather than >= to avoid the critter swapping
            // places with the player when they're next to each other. With >,
            // the critter is only allowed to run away from the player. E.g. if
            // the player is at NW, the critter will choose between S, SE, and
            // E. Without the skewed threshold above this movement pattern makes
            // the critter hard to catch: it runs away fast and doesn't stray.
            && world[n] > world[critter]
            // If the tile is a good candidate for the critter's movement,
            // update the critter's position and return true to end the some()
            // iteration.
            && (critter = n));

        // Move the player one tile along the traced path.
        if (critter == (player = next)) {
            // Defeat the critter!
            // Clear the screen and draw the checkmark. `critter` is set to
            // undefined and acts as a flag to stop rendering.
            critter = c.fillRect(0, 0, 640, 480);
            viewport(player, 0x168164160020); // The checkmark
        }
    }
};

a.onclick = (e,
        x = e.x - e.target.offsetLeft,
        y = e.y - e.target.offsetTop) => (
    // Handle viewport clicks
    x < 480 && critter && plan(
        // Transform x, y into an index into the world array.
        0|(x / 8 + offset_x - 500) / 4
        + 30 * (0|(y / 8 + offset_y - 20) / 4)),
    // Handle minimap clicks
    500 < x && y < 140 && (
        // Adjust the offset of the visible minimap fragment.
        offset_x = x - 30,
        offset_y = y - 30));

// The visible minimap fragment is drawn into the main viewport scaled up via
// drawImage(). Preserve the sharpness of pixels.
c.imageSmoothingEnabled = false;
b.bgColor = palette[3];

// Start the game loop.
setInterval(tick, 200);

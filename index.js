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

// The offset of the currently visible area of the minimap, in canvas pixels
// from the origin. This makes it easy to update it when scrolling the view, to
// draw the white border on the minimap, and to draw the zoomed in viewport.
offset_x = 508,
offset_y = 28,

// moving: Whether the player is currently moving in response to a double click.
// imageSmoothingEnabled: The visible minimap fragment is drawn into the main
// viewport scaled up via drawImage(). Preserve the sharpness of pixels.
moving = c.imageSmoothingEnabled = false,

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

// The seed for the terrain generation.
seed = Date.now(),


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
// non-numeric value which also fails the > check. If the computed distance
// score of the neighbor is lower than the previous one, assign it and
// recursively call distance on the neighbor's neighbors.
distance = i => neighbors(i).map(n => {
    if (world[n] > world[i] + 1) {
        world[n] = world[i] + 1;
        distance(n);
    }
}),

// Trace the path connecting the player and the target. The tracing starts at
// the target and follows the descending gradient of distance scores stored in
// the world array. For each tile on the path, its neighbors are considered and
// the neighbor with a lower distance score is chosen as the next one. This
// function also updates the `next` global used in the game loop to move the
// player. The while loop makes sure that `next` is never set to the current
// position of the player. The last time `next` is updated it holds the index of
// the tile which is the closest to the player and on the path to the target.
trace = i => {
    while (i != player) {
        viewport(next = i, 00000001000300000); // The dot
        neighbors(i).map(n => {
            if (world[n] < world[i]) {
                i = n;
            }
        });
    }
},

// Plan the player's movement in response to a click.
plan = i => {
    // If this is the second click on the same tile, start moving towards it.
    moving = i == target;
    // If the tile is reachable set it as the current target.
    if (world[i] > 0 && world[i] < Infinity) {
        target = i;
    }
},


// GAME LOOP

tick = (v, i = 900) => {
    // Draw the red background.
    // Also set the line width for the minimap visible area
    c.fillStyle = palette[c.lineWidth = 2];
    c.fillRect(0, 0, 640, 480);

    // Draw the minimap's black border.
    c.fillStyle = palette[1];
    c.fillRect(490, 10, 140, 140);

    // Draw the minimap.
    while (i--) {
        // Generate the terrain adding a bit of high-frequency noise.
        v = 5 * Math.sin((i % 30 - 17) * (i - 300) / 3e3)
                + Math.sin(seed % i) + 3;

        minimap(i,
                v > 6 ? 01111111131115315: // rock
                v > 4 ? 05155444554455455: // tree
                v > 1 ? 5: // grass
                v > 0 ? 04445445555555555: // bush
                6 // water
        );

        // palette here is used as a non-numerical value (also when coerced)
        // which doesn't compare as less than nor greater than a number when
        // compared in distance(). It represents non-passable terrain.
        world[i] = 0 < v && v <= 4 ? Infinity : palette;
    }

    // minimap(critter + 2, 03030033007307732); // griffin
    // minimap(critter + 4, 00100111102102211); // black dragon with claws
    // minimap(critter + 60, 00200222201201122); // red dragon with claws
    // minimap(critter + 62, 01111011101000121); // snake
    // minimap(critter + 64, 01010111002102211); // dread knight
    // minimap(critter + 120, 00101111101110012); // godzilla
    // minimap(critter + 122, 00110111001110012); // t-rex
    // minimap(critter + 124, 01010011002102211); // young dragon
    // minimap(critter + 180, 03333333007307732); // sphinx
    minimap(critter, 01111111002102211); // black dragon
    minimap(player, 00707016107307762); // knight

    // Draw the main viewport by copying and scaling the minimap up.
    c.drawImage(a, offset_x, offset_y, 60, 60, 0, 0, 480, 480);

    // Draw the white border around the visible area on the minimap.
    c.strokeStyle = palette[7];
    c.strokeRect(offset_x, offset_y, 60, 60);

    // Populate the world array with distances of each tile to the player.
    world[player] = 0;
    distance(player);
    // DEBUG_distance_scores();

    // Handle movement if the player if they haven't reached the target yet. The
    // world[target] check is similar to player != target, but it also avoids
    // drawing the path for the null target at the beginning of the game.
    if (world[target]) {
        // Trace the path from the target to the player.
        trace(target);
        // Draw the X mark at the target.
        viewport(target, 00010013103330030); // The X

        if (moving) {
            // Move the critter one tile away from the player, if possible.
            // The critter moves first to give it a chance to escape when the
            // player is on an adjacent tile. If the critter has been just
            // caught, neighbors(critter) returns an array of NaNs which is good
            // enough for making this no-op.
            neighbors(critter).some(n =>
                // Filter the neighboring tiles by mixing the timestamp (a
                // pseudo-random component) in to land somewhere far on the x
                // axis and testing if sin() is above zero.
                Math.sin(n * Date.now()) > 0
                // && DEBUG_critter_deciding(n, {final: false})
                // We use the > check rather than >= to force the critter to run
                // away from the player. E.g. if the player is at NW, the
                // critter will choose between S, SE, and E.
                && world[n] > world[critter]
                // && DEBUG_critter_deciding(n, {final: true})
                // If the tile is a good candidate for the critter's movement,
                // update the critter's position and return true to end the
                // some() iteration.
                && (critter = n)
            );

            // Move the player one tile along the traced path and check the
            // victory condition. This happens before the critter gets a chance
            // to run away this turn to avoid the boring situation of chasing it
            // when it's right next to the player.
            if (critter == (player = next)) {
                // Defeat the critter! Clear the screen and draw the checkmark.
                // `critter` is set to undefined and acts as a flag to stop the
                // game loop.
                critter = c.fillRect(0, 0, 640, 480);
                viewport(player, 00550054405400040); // The checkmark
            }

            // NOMOREBYTES Scroll the viewport together with the player.
            // offset_x = player % 30 * 4 + 500 - 30;
            // offset_y = (0|player / 30) * 4 + 20 - 30;
        }
    }

    // Schedule the next tick only while the critter is roaming.
    critter && setTimeout(tick);
};

a.onclick = (e,
        x = e.x - e.target.offsetLeft,
        y = e.y - e.target.offsetTop) => {
    if (x < 480) {
        // Handle viewport clicks. Transform x, y into an index into the world
        // array taking the scaled offset into account.
        plan(
            0|(x / 8 + offset_x - 500) / 4
            + 30 * (0|(y / 8 + offset_y - 20) / 4));
    } else if (y < 140) {
        // Handle minimap clicks. Adjust the offset of the visible minimap
        // fragment.
        offset_x = x - 30;
        offset_y = y - 30;
    }
};

b.bgColor = palette[3];

// Start the game loop.
tick();

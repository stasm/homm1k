# HoMM 1K

_HoMM 1K_ is a homage to _Heroes of Might and Magic 3_ and a submission for
JS1K 2019. Play it online at https://js1k.com/2019-x/demo/4210.

![](screenshot.png)

## Motivation

The theme of this year's JS1K is _X_, to celebrate its tenth anniversary. The
theme made me think of the iconic _X_ which marks the destination of heroes'
movement in _HoMM_.

## Goal of the Game

The goal of the game is to capture the dragon roaming your realm. Your devout
knight is at your service, his armor shining bright in the sun, ready to do
your bidding. Plan their moves carefully and try to corner the dragon so that
it cannot flee this time.

## Features

The game is written in JavaScript using the Canvas 2D API. It runs in modern
Firefox and Chrome. The minified and compressed source code is under 1024
bytes.

  - 4px x 4px sprites are stored as numbers, with each pixel represented by
    a factor of 8 which encodes one of the 7 colors of the palette or the
    transparency.

  - The details of the terrain are generated randomly with `Date.now()` used
    as the seed.

  - The playable world is larger than the viewport. Click the minimap to set
    the visible fragment.

  - Plan your knight's moves by clicking on the map once. The path-finding
    algorithm will trace the path to the destination. Click a second time to
    confirm the move.

  - The dragon responds to your moves and tries to run away from your knight.
    You can use this to your advantage: rather than head directly for the
    dragon, try to force it to move into the woods or near the water, where
    it's easier to capture it.

Once you capture the dragon, the win screen appears and the game ends. Reload
the page to play again.

## Running locally

Refer to `index.js` for the documented source code of the game. To play, open
`index.html` in the browser. Set the `DEBUG` global in `index.js` to `true` to
see details of the path-finding algorithm and the dragon's AI.

To build the optimized version of the source code, install the dependencies
with `npm install` and run `make`.

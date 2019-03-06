function encode(s) {
    let reversed = s.padStart(16, 0).split("").reverse().join("");
    let octal = parseInt(reversed, 8);
    let hex = octal.toString(16);
    return `0x${hex}`;
}

console.log(
    encode(process.argv[2]));

// Parse the FEN string
function parseFEN(fen: string) {
  // The FEN string is split into rows by slashes
  const rows = fen.split('/');
  let pieces = [];

  // For each row in the FEN string
  for (let row of rows) {
    let rowPieces = [];

    // For each character in the row
    for (let char of row) {
      // If the character is a number, it represents empty squares
      if (!isNaN(parseInt(char))) {
        for (let i = 0; i < parseInt(char); i++) {
          rowPieces.push({ piece: 'empty', color: 'none' });
        }
      } else {
        // Otherwise, it represents a piece
        const color = char === char.toUpperCase() ? 'white' : 'black';
        const piece = char.toLowerCase();

        rowPieces.push({ piece: piece, color: color });
      }
    }

    pieces.push(rowPieces);
  }

  return pieces;
}

figma.showUI(`
  <input id="fen" type="text" placeholder="Enter FEN string">
  <button id="submit">Submit</button>

  <script>
    document.getElementById('submit').onclick = () => {
      const fen = document.getElementById('fen').value;
      parent.postMessage({ pluginMessage: { type: 'fen', fen } }, '*');
    };
  </script>
`);

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'fen') {
    const pieces = parseFEN(msg.fen);
    console.log(pieces);
  }
};
function parseFEN(fen: string) {
  const piecePositions = fen.split(' ')[0];
  const rows = piecePositions.split('/');

  let pieces = [];

  for (let row of rows) {
    for (let char of row) {
      // If the character is a number, it represents empty squares
      if (!isNaN(parseInt(char))) {
        for (let i = 0; i < parseInt(char); i++) {
          pieces.push({ piece: 'empty', color: 'none' });
        }
      } else {
        // Otherwise, it represents a piece
        const color = char === char.toUpperCase() ? 'white' : 'black';
        const piece = char.toLowerCase();

        pieces.push({ piece: piece, color: color });
      }
    }
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

// Helper function to convert piece type from FEN to Figma variant
function convertPieceType(piece: string) {
  switch (piece) {
    case 'r': return 'Rook';
    case 'n': return 'Knight';
    case 'b': return 'Bishop';
    case 'q': return 'Queen';
    case 'k': return 'King';
    case 'p': return 'Pawn';
    default: return 'None';
  }
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'fen') {
    const pieces = parseFEN(msg.fen);
    console.log(pieces);

    // Get the currently selected nodes
    const selection = figma.currentPage.selection;

    // If there's exactly one node selected and it's a FrameNode (which includes components)
    if (selection.length === 1 && selection[0].type === 'INSTANCE') {
      // This is your selected component
      const board = selection[0];

      figma.root.setRelaunchData({});

      // For each child of the component
      for (let i = 0; i < board.children.length; i++) {
        let child = board.children[i];
        let piece = pieces[i];

        // If the child is an instance and has the 'Piece' variant property
        if (child.type === 'INSTANCE' && child.variantProperties && 'Piece' in child.variantProperties) {
          // If piece is empty, set the 'Piece' property to 'Off'
          if (piece.piece === 'empty') {
            child.setProperties({ Piece: 'Off' });
          } else {
            // Otherwise, set the 'Piece' property to 'On'
            child.setProperties({ Piece: 'On' });

            // If the child has its own child (the chess piece)
            if (child.children && child.children[0].type === 'INSTANCE') {
              let chessPiece = child.children[0];
              // Set the 'Piece' and 'Side' properties on the chess piece
              chessPiece.setProperties({
                Piece: convertPieceType(piece.piece),
                Side: piece.color.charAt(0).toUpperCase() + piece.color.slice(1)
              });
            }
          }
        }
      }
    } else {
      // If the selection isn't exactly one FrameNode, show an error message
      figma.notify('Please select a single component.');
    }
  }
};

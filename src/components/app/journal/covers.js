// The covers a journal can wear. Each one says where its label sits and what colour it's printed in,
// because a cream label that works on dark leaves disappears on white paper.

export const COVERS = [
  {
    id: "leaves",
    name: "Leaves",
    image: "/journalbg2.png",
    // a cream label pressed onto the dark cover
    card: "#FBF5EF",
    ink: "#2b2b2b",
    at: "50%",
  },
  {
    id: "blooms",
    name: "Blooms",
    image: "/journalbg.png",
    // printed straight onto the watercolour paper, in the clear middle
    card: "transparent",
    ink: "#4b3a34",
    at: "48%",
  },
  {
    id: "play",
    name: "Play",
    image: "/journalbg3.png",
    // the shapes crowd the bottom, so the label sits high
    card: "transparent",
    ink: "#2f2a24",
    at: "30%",
  },
];

export const coverById = (id) => COVERS.find((c) => c.id === id) ?? COVERS[0];

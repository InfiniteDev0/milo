// The journal page's own faces — a bookish serif and a handwriting for the pages. The app's own fonts are untouched.

import { Caveat, Fraunces } from "next/font/google";

export const bookSerif = Fraunces({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"] });

// writing in the book, like pen on paper
export const bookHand = Caveat({ subsets: ["latin"], weight: ["400", "500"] });

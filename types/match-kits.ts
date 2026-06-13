export type KitPiece = {
  img: string;
  color: string;
  colors: string[];
};

export type PlayerKit = {
  shirt: KitPiece;
  shorts: KitPiece;
  socks: KitPiece;
};

/** Maillot joueur extrait — PNG dans /public/team-kits */
export type TeamKitImage = {
  img: string;
  colors: string[];
};

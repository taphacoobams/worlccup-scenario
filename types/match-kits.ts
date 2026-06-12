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

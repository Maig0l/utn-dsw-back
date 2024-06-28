import { randomUUID } from "crypto";

export class User {
  public id: string;

  // Tener en cuenta que un usuario podría querer cambiar su nick
  // TODO: Creo que fue una mala idea poner el nick como id
  constructor(
    public nick: string, // Actúa como id, debe ser único
    public email: string,
    public password: string,
    public profilePic: string = "",
    public bioText: string = "",
    public likes: any[] = [], //TODO: Falta entidad Tag
    public linkedAccounts: string[] = [],
    public createdPlaylists: any[] = [], //TODO: Falta entidad Playlist
    public reviews: any[] = [], //TODO: Falta entidad Review
  ) {
    this.id = randomUUID()
  }
}
export class User {
  private static idCounter = 0;
  public id: number;

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
    this.id = ++User.idCounter;
  }
}
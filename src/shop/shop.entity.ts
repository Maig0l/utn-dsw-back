export class Shop {
  private static ID_COUNTER = 0;
  public id: number;

  constructor(
    public name: string,
    public img: string,
    public site: string) {

    this.id = ++Shop.ID_COUNTER;
  }
}
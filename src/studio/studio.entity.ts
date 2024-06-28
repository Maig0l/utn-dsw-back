export class Studio {
    private static ID_COUNTER = 0;
    public id: number;
  constructor(
    public name: string,
    public type: string [],
    public site: string) {
        
        this.id = ++Studio.ID_COUNTER;
    }
}
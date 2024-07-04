export class Studio {
    private static ID_COUNTER = 0;
    public id: number;
  constructor(
    public name: string,
    public type: StudioType[],
    public site: string) {
        
        this.id = ++Studio.ID_COUNTER;
    }
}

export enum StudioType {
  Developer = "Desarrollador",
  Publisher = "Editor"
}
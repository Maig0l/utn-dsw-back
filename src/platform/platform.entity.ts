export class Platform {
    private static ID_COUNTER = 0;
    public id: number;
  
    constructor(
    public name: string,
    public img: string) {

        this.id = ++Platform.ID_COUNTER;
        this.name = name;
        this.img = img;
    }
  }
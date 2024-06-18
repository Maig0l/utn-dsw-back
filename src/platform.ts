export class Platform {
    private static ID_COUNTER = 0;
    private id: number;
  constructor(
    private name: string,
    private img: string ){
      this.id = ++Platform.ID_COUNTER;
        this.name = name;
        this.img = img;
    }

    getId(): number {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getImg(): string {
        return this.img;
    }
    setName(name: string): void {
        this.name = name;
    }
    setImg(img: string): void {
        this.img = img;
    }

  }
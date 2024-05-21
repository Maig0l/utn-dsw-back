export class Shop {
    private static ID_COUNTER = 0;
    private id: number;
  constructor(
    private name: string,
    private img: string,
    private site: string) {
        
        this.id = ++Shop.ID_COUNTER;
        this.name = name;
        this.img = img;
        this.site = site;
    
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
    getSite(): string {
        return this.site;
    }
    setName(name: string): void {
        this.name = name;
    }
    setImg(img: string): void {
        this.img = img;
    }
    setSite(site: string): void {
        this.site = site;
    }
}


  

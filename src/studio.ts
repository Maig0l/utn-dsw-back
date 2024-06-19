export class Studio {
    private static ID_COUNTER = 0;
    private id: number;
  constructor(
    private name: string,
    private type: string [],
    private site: string) {
        
        this.id = ++Studio.ID_COUNTER;
        this.name = name;
        this.type = type;
        this.site = site;
    
    }
    getId(): number {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getType(): string [] {
        return this.type;
    }
    getSite(): string {
        return this.site;
    }
    setName(name: string): void {
        this.name = name;
    }
    setType(type: string []): void {
        this.type = type;
    }
    setSite(site: string): void {
        this.site = site;
    }   
}
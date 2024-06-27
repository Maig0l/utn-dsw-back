export class Tag {
    private static ID_COUNTER =0;
    public id: number;

    constructor(
        public name: string,
        public description: string,

    )
    {   this.id = ++Tag.ID_COUNTER;
        this.name = name;
        this.description = description 

    }


    getId(): number{
        return this.id;

    }

    getName(): string{
        return this.name;

    }

    getDescriptions(): string{
        return this.description;
    }


    setName(name:string):void{
        this.name = name;
    }

    set(description:string){
        this.description = description;
    }
}


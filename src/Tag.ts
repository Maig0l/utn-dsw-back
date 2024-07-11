export class Tag {
    private static ID_COUNTER =0;
    private id: number;

    constructor(
        private name: string,
        private description: string,

    )
    { this.id = ++Tag.ID_COUNTER;
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


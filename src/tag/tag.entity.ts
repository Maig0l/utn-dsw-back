export class Tag {
    private static ID_COUNTER = 0;
    public id: number;

    constructor(
        public name: string,
        public description: string,
    ) {
        this.id = ++Tag.ID_COUNTER;
        this.name = name;
        this.description = description 
    }
}


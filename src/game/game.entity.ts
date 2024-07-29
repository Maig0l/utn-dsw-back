import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class Game extends BaseEntity {
    @Property({nullable: false, unique: true})
    title!: string
    
    @Property()
    synopsis!: string

    @Property({nullable: false})
    releaseDate!: Date //debe usarse en formato date?

    @Property()
    portrait!: string

    @Property()
    banner!: string

    @Property()
    pictures!: string[]

    }
    //Proximamente propiedades de relaciones con otras entidades
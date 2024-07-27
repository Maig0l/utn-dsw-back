import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class Playlist extends BaseEntity {
    @Property({nullable: false, unique: true})
    name!: string
    
    @Property()
    description!: string

    @Property()
    is_private!: boolean
    // "is_private" un buen nombre? CONSULTA


    //falta relacion n..m con game, y 1 a n con usuario. ver Rel<entidadX> en vid 68
}
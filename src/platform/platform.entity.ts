import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class Platform extends BaseEntity {
    @Property({nullable: false, unique: true})
    name!: string
    
    @Property()
    img!: string

    //falta relacion n..m con game. ver Rel<entidadX> en vid 68
}
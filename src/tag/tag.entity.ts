import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";


@Entity()
export class Tag extends BaseEntity {
    @Property({nullable: false, unique: true})
    name!: string
    
    @Property()
    description!: string

   
}


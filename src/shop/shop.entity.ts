import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class Shop extends BaseEntity {
  @Property({nullable: false, unique: true})
  name!: string

  // Mientras que img y site pueden ser vacíos, no serán undefined, si no ""
  // O sea, son nullables en la DB, pero en TS serán String 
  @Property()
  img!: string

  @Property({unique: true})
  site!: string
}
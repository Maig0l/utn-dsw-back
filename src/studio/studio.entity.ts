import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class Studio extends BaseEntity {
  @Property({nullable: false, unique: true})
  name!: string

  @Property()
  type!: string[]

  @Property({unique: true})
  site!: string
}

export enum StudioType {
  Developer = "Desarrollador",
  Publisher = "Editor"
}

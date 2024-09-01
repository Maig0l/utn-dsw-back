import {
  Entity,
  Property,
  ManyToMany,
  Collection,
} from '@mikro-orm/core'
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from '../game/game.entity.js';

@Entity()
export class Studio extends BaseEntity {
  @Property({nullable: false, unique: true})
  name!: string

  @Property()
  type!: string[]

  @Property({unique: true})
  site!: string

  @ManyToMany(() => Game, (game) => game.studios)
  games = new Collection<Game>(this)
}

export enum StudioType {
  Developer = "Desarrollador",
  Publisher = "Editor"
}

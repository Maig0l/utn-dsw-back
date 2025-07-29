import {
  Entity,
  PrimaryKey,
  Property,
  ManyToMany,
  Cascade,
  Collection,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";

@Entity()
export class Shop extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property({ unique: true })
  site!: string;

  @ManyToMany(() => Game, (game) => game.shops)
  games = new Collection<Game>(this);
}

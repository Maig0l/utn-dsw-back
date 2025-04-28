import {
  Entity,
  PrimaryKey,
  Property,
  ManyToMany,
  Collection,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class Tag extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property()
  description!: string;

  @ManyToMany(() => Game, (game) => game.tags)
  games = new Collection<Game>(this);

  @ManyToMany(() => User, (user) => user.likedTags)
  tags = new Collection<Tag>(this);
}

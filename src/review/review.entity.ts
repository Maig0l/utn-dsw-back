import {
  ManyToMany,
  ManyToOne,
  Property,
  Collection,
  DateType,
  Cascade,
  Entity,
  DecimalType,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";
import { Tag } from "../tag/tag.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class Review extends BaseEntity {
  @ManyToOne()
  author!: User;

  @Property()
  readonly createdAt: Date = new Date();

  @ManyToOne()
  game!: Game;

  @Property({ type: DecimalType, scale: 1 })
  score!: number;

  @Property({ nullable: true })
  title!: string;

  @Property({ nullable: true })
  body!: string;

  @ManyToMany("Tag", undefined, { nullable: true })
  suggestedTags = new Collection<Tag>(this);
}

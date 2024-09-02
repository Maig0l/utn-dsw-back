import { ManyToMany, ManyToOne, OneToMany, Property, Collection, DateType } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";
import { Tag } from "../tag/tag.entity.js";
import { User } from "../user/user.entity.js";

export class Review extends BaseEntity {
  @ManyToOne()
  author!: User

  @Property()
  createdAt: Date = new Date();

  @ManyToOne()
  game!: Game

  @Property()
  score!: number

  @Property({nullable: true})
  title!: string

  @Property({nullable: true})
  body!: string

  @ManyToMany('Tag', undefined, {nullable: true})
  suggestedTags = new Collection<Tag>(this)

}
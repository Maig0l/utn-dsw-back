import { ManyToMany, ManyToOne, OneToMany, Property, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Game } from "../game/game.entity.js";
import { Platform } from "../platform/platform.entity.js";
import { Shop } from "../shop/shop.entity.js";

export class Release extends BaseEntity {

  @Property({nullable: false})
  siteUrl!: string

  @ManyToOne()
  game!: Game
  
  @ManyToMany('Platforms', undefined, {owner: true})
  platforms = new Collection<Platform>(this)

  @ManyToOne('Shop')
  shop!: Shop
}
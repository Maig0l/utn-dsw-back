import {
  Entity,
  Property,
  ManyToMany,
  Cascade,
  Collection,
  ManyToOne,
  OneToMany,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Studio } from '../studio/studio.entity.js';
import { Shop } from '../shop/shop.entity.js';
import { Platform } from '../platform/platform.entity.js';
import { Franchise } from '../franchise/franchise.entity.js';
import { Tag } from '../tag/tag.entity.js';
import { Review } from '../review/review.entity.js';

@Entity()
export class Game extends BaseEntity {
  @Property({ nullable: false, unique: true })
  title!: string;

  @Property({ nullable: true })
  synopsis!: string;
  //TODO ojo el limite de caracteres, nos estamos quedando cortos

  @Property({ nullable: true })
  releaseDate!: string; //Mepa que es más facil enviar un string y que valibot haga lo suyo

  @Property({ nullable: true })
  portrait!: string;

  @Property({ nullable: true })
  banner!: string;

  // total rating of the game, calculated as the sum of all ratings
  @Property({ default: 0 })
  cumulativeRating!: number;

  // number of reviews that contributed to the cumulative rating
  @Property({ default: 0 })
  reviewCount!: number;

  @ManyToMany(() => Tag, (tag) => tag.games, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  tags = new Collection<Tag>(this);

  @ManyToMany(() => Studio, (studio) => studio.games, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  studios = new Collection<Studio>(this);

  @ManyToMany(() => Shop, (shop) => shop.games, {
    cascade: [Cascade.ALL],
    owner: true,
    lazy: true,
  })
  shops = new Collection<Shop>(this);

  @ManyToOne(() => Franchise, { nullable: true })
  franchise?: Franchise | null;

  @ManyToMany(() => Platform, (platform) => platform.games, {
    cascade: [Cascade.ALL],
    owner: true,
    lazy: true,
  })
  platforms = new Collection<Platform>(this);

  @OneToMany('Review', 'game', { lazy: true })
  reviews = new Collection<Review>(this);
}

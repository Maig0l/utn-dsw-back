import {
    Entity,
    Property,
    ManyToMany,
    Cascade,
    Collection,
    ManyToOne,
    OneToMany,
} from '@mikro-orm/core'
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Studio } from '../studio/studio.entity.js';
import { Shop } from '../shop/shop.entity.js';
import { Platform } from '../platform/platform.entity.js';
import { Franchise } from '../franchise/franchise.entity.js';
import { Tag } from '../tag/tag.entity.js';
import { Review } from '../review/review.entity.js';
import { GamePicture } from '../game-picture/game-picture.entity.js';

@Entity()
export class Game extends BaseEntity {
  @Property({ nullable: false, unique: true })
  title!: string;

  @Property()
  synopsis!: string;
  //TODO ojo el limite de caracteres, nos estamos quedando cortos

  @Property({ nullable: true })
  releaseDate!: Date; //debe usarse en formato date?

  @Property({ nullable: true })
  portrait!: string;

  @Property({ nullable: true })
  banner!: string;

  @OneToMany('GamePicture', 'game', {
    cascade: [Cascade.ALL],
    nullable: true,
  })
  pictures = new Collection<GamePicture>(this);

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
  })
  shops = new Collection<Shop>(this);

  @ManyToOne(() => Franchise, { nullable: true })
  franchise!: Franchise;

  @ManyToMany(() => Platform, (platform) => platform.games, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  platforms = new Collection<Platform>(this);

    @OneToMany('Review', 'game')
    reviews = new Collection<Review>(this)


}

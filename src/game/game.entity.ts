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

@Entity()
export class Game extends BaseEntity {
    @Property({ nullable: false, unique: true })
    title!: string

    @Property()
    synopsis!: string
    //TODO ojo el limite de caracteres, nos estamos quedando cortos

    @Property()
    releaseDate!: Date //debe usarse en formato date?

    @Property()
    portrait!: string

    @Property({ nullable: true })
    banner!: string

    @Property({ nullable: true })
    pictures!: string
    //TODO cambiar a array

    @ManyToMany(() => Tag, (tag) => tag.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    tag = new Collection<Tag>(this);

    @ManyToMany(() => Studio, (studio) => studio.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    studios = new Collection<Studio>(this);

    @ManyToMany(() => Shop, (shop) => shop.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    shops = new Collection<Shop>(this)

    @ManyToOne(() => Franchise, { nullable: true })
    franchise!: Franchise

    @ManyToMany(() => Platform, (platform) => platform.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    platforms = new Collection<Platform>(this)

    @OneToMany('Review', 'game')
    reviews = new Collection<Review>(this)

    @ManyToMany('Tag')
    tags = new Collection<Tag>(this)
}

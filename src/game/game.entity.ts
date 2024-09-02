import {
    Entity,
    Property,
    ManyToMany,
    Cascade,
    Collection,
    OneToMany,
  } from '@mikro-orm/core'
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Studio } from '../studio/studio.entity.js';
import { Shop } from '../shop/shop.entity.js';
import { Platform } from '../platform/platform.entity.js';
import { Review } from '../review/review.entity.js';
import { Release} from '../release/release.entity.js';

@Entity()
export class Game extends BaseEntity {
    @Property({nullable: false, unique: true})
    title!: string
    
    @Property()
    synopsis!: string

    @Property({nullable: false})
    releaseDate!: Date //debe usarse en formato date?

    @Property()
    portrait!: string

    @Property()
    banner!: string

    @Property()
    pictures!: string[]

   @ManyToMany(() => Studio, (studio) => studio.games, {
        cascade: [Cascade.ALL],
        owner: true,
    }) //Relacion muchos a muchos con la entidad Studio?
    studios = new Collection<Studio>(this)

    @ManyToMany(() => Shop, (shop) => shop.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    shops = new Collection<Shop>(this)

   @ManyToMany(() => Platform, (platform) => platform.games, {
        cascade: [Cascade.ALL],
        owner: true,
    })
    platforms = new Collection<Platform>(this)

    @OneToMany(() => Review, (review) => review.game, {
        cascade: [Cascade.ALL],
    })  
    reviews = new Collection<Review>(this)

    @OneToMany(() => Release, (release) => release.game, {
        cascade: [Cascade.ALL],
    })
    releases = new Collection<Release>(this)
}
    //Proximamente propiedades de relaciones con otras entidades (menos User; ver comentario en User.entity.ts)
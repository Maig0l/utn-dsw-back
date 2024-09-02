import { Collection, Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Tag } from "../tag/tag.entity.js";
import { Playlist } from "../playlist/playlist.entity.js";
import { Review } from "../review/review.entity.js";

@Entity()
export class User extends BaseEntity {
  @Property({ nullable: false, unique: true })
  nick!: string

  @Property({ nullable: false, unique: true })
  email!: string

  @Property({ nullable: false })
  password!: string

  @Property({ nullable: true })
  profile_img?: string

  @Property({ nullable: true })
  bio_text?: string

  @Property({ nullable: true })
  linked_accounts?: string[]

  @OneToMany('Playlist', 'owner')
  playlists = new Collection<Playlist>(this)

  @ManyToMany('Tag')
  likedTags = new Collection<Tag>(this)

  // TODO: Implementar entidad Review
  @OneToMany('Review', 'author')
  reviews = new Collection<Review>(this)
}
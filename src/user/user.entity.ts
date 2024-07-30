import { Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";

@Entity()
export class User extends BaseEntity {
  @Property({nullable: false, unique: true})
  nick!: string

  @Property({nullable: false, unique: true})
  email!: string

  @Property({nullable: false})
  password!: string

  @Property({nullable: true})
  profile_img?: string

  @Property({nullable: true})
  bio_text?: string

  @Property({nullable: true})
  linked_accounts?: string[]

  // @OneToMany(Playlist)
  // playlists!: Playlist[]

  // @ManyToMany(Title)
  // likes!: Title[]

  // @OneToMany(Review)
  // reviews!: Review[]
}
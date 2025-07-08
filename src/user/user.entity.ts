import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  Property,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Tag } from "../tag/tag.entity.js";
import { Playlist } from "../playlist/playlist.entity.js";
import { Review } from "../review/review.entity.js";

@Entity()
export class User extends BaseEntity {
  @Property({ nullable: false, unique: true })
  nick!: string;

  @Property({ nullable: false, unique: true, hidden: true })
  email!: string;

  @Property({ nullable: false, hidden: true })
  password!: string;

  @Property({ nullable: true })
  profile_img?: string;

  @Property({ nullable: true, lazy: true })
  bio_text?: string;

  @Property({ nullable: true, lazy: true })
  linked_accounts?: string[];

  @Property({ nullable: false, default: false })
  is_admin: boolean = false;

  @OneToMany("Playlist", "owner", { lazy: true })
  playlists = new Collection<Playlist>(this);

  @ManyToMany("Tag", undefined, { lazy: true })
  likedTags = new Collection<Tag>(this);

  @OneToMany("Review", "author", { lazy: true })
  reviews = new Collection<Review>(this);
}

# Schema Information

## songs
column name | data type | details
------------|-----------|-----------------------
id          | integer   | not null, primary key
title       | string    | not null
artwork_url | string    |
song_url    | string    | not null
user_id     | integer   | not null, foreign key (references users), indexed

## songlikes
column name | data type | details
------------|-----------|-----------------------
id          | integer   | not null, primary key
song_id     | integer   | not null, foreign key (references songs), indexed
user_id     | integer   | not null, foreign key (references users), indexed, uniq [song_id, user_id]

## users
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
username        | string    | not null, indexed, unique
picture_url     | string    |
password_digest | string    | not null
session_token   | string    | not null, indexed, unique

## playlistAdds (???)
column name | data type | details
------------|-----------|-----------------------
id          | integer   | not null, primary key
song_id     | integer   | not null, foreign key (references songs), indexed
playlist_id | integer   | not null, foreign key (references playlists), indexed, uniq [song_id, playlist_id]

## playlists (???)
column name | data type | details
------------|-----------|-----------------------
id          | integer   | not null, primary key
name        | string    | not null
user_id     | integer   | not null, foreign key (references users), indexed

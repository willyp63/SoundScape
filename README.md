# SoundScape

[Heroku link][heroku]

[heroku]: https://salty-falls-17641.herokuapp.com

SoundScape is a full-stack web application. SoundScape uses Ruby on Rails with a PostgresSQL database for the backend. SoundScape utilizes Facebook's React.js with a Flux design to delivery front end content.

SoundScape is a great place to explore new music. Users can search for almost any song in existence, sample it, and then add that song to their personal list of liked songs. Users can also post original songs that can be seen by all other users.

![splash]

## Like Tracks!

Any track that is displayed on SoundScape can be liked by clicking an icon on the track image or player bar. Once a user likes a track the icon will change color and will then be used to unlike the track. All tracks that the user currently likes will be displayed in their collection.

![likes]

## Search Millions of Tracks

SoundCloud uses Spotify's API to stream thirty second samples of tracks. This allows for any song to be searched for, sampled, and then liked by the user. A dropdown of ten results is presented while typing in the search bar. Those results can be clicked to play or the user can hit enter and see the full list of results.

When a track from the Spotify API is liked, it must be added to SoundScape's database before it can be liked. The track is posted by an anonymous user and then is liked by the current user. This all happens Seamlessly.

![search]

## Infinite Scroll

All pages have infinite scroll. This is especially important for pages that may have to display hundreds of tracks, like the search result page. Only a small number of tracks are requested and rendered to begin with. And as the user scrolls down the page, more tracks will be requested and appended.

## Post, Edit and Delete Tracks

Any logged in user can post their own tracks. The only requirement is that the audio be in MP3 format and that an image is included. Users have a page where they can view all of their posted tracks. Here they can edit/delete their tracks.

![new]

## Custom Audio Player

SoundScape has a custom built audio player. The player accepts multiple tracks and allows the user to cycle through these tracks. The progress bar and volume bar are clickable and dragable. While navigating the site, the player stays up and playing whatever it was last assigned. Tracks can also be liked via the player.

![player]

## Future Direction

### Profile Page

I would like to give users their own profile page. Other users could find this page via the search bar or other links. All of a users posted tracks would be displayed on their profile page along with other information about that user.

### Track Comments

I think users would be interested in expressing their opinions of the tracks they listen to. And even more users would like to see what other people think of a song. I might even allow someone to score a song (1-5). Doing something like this would require creating a track display page.

### Playlists

The tracks a user likes are all thrown into the same group. It would be nice if someone could further organize their liked songs into playlists. Playlists could then be shared with others and even searchable.

[splash]: ./docs/screenshots/splash.jpg
[new]: ./docs/screenshots/new.jpg
[search]: ./docs/screenshots/search.jpg
[likes]: ./docs/screenshots/likes.jpg
[player]: ./docs/screenshots/player.jpg

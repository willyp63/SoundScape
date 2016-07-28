# SoundScape

[Heroku link][heroku]

[heroku]: https://soundsscape.com

SoundScape utilizes Ruby on Rails and Facebook's React.js with a Flux design to delivery front end content. A secondary Node.js server is used for streaming audio.

SoundScape is a great place to explore new music. You can search for and play millions of popular songs! While navigating the site add songs to your player's queue, or like the song to add it to your personal collection. Users can even upload and manage their own songs!

![splash]

## Where do the Songs Come from?

By integrating with two powerful APIs, SoundScape is able to deliver high-quality audio for millions of popular songs. SoundScape's search results come from Spotify API. When a user wants to play a song returned from Spotify, a search request is made to the Youtube API. SoundScape's algorithm analyzes each result returned from Youtube and makes its best guess at what video contains the desired audio. Once the video is located, SoundScape's Node.js opens an audio stream and pipes it back to the client.

![search]

## Custom Audio Player Interface

SoundScape has a hand-rolled audio player interface built on top of the HTML5 Audio Player. The player has a queue of songs it plays back in order. Songs can be added and removed while navigating. The progress bar and volume bar are clickable and dragable. Tracks can also be liked via the player.

![like_player]

## Post, Edit and Delete Songs

Any logged in user can post their own songs. The only requirement is that the audio be in MP3 format and that an image is included. Users can edit/delete their uploaded songs within their collection.

![new]

## Infinite Scroll

All pages have infinite scroll. This is especially important for pages that may have to display hundreds of tracks, like the search result page. Only a small number of tracks are requested and rendered to begin with. As the user scrolls down the page, more tracks will be requested and appended.

## Future Direction

### Profile Page

I would like to give users their own profile page. Other users could find this page via the search bar or other links. All of a users posted tracks would be displayed on their profile page along with other information about that user.

### Playlists

The tracks a user likes are all thrown into the same group. It would be nice if someone could further organize their liked songs into playlists. Playlists could then be shared with others and even searchable.

### Track Comments

I think users would be interested in expressing their opinions of the tracks they listen to. And even more users would like to see what other people think of a song. I might even allow someone to score a song (1-5). Doing something like this would require creating a track display page.

[splash]: ./docs/screenshots/splash.jpg
[like_player]: ./docs/screenshots/like_player.jpg
[new]: ./docs/screenshots/new.jpg
[search]: ./docs/screenshots/search.jpg

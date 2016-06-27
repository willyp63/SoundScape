# Flux Cycles

Flux loops are organized by data type. Under each data type, there may
be sub-categories, and each action is listed with the sequence of events
that result from its invocation, ending with the API or store. Finally,
store listeners are listed at the end.

You should be able to use this document trace an **action** starting
with where it was invoked, through the **API**/**store** involved, and
finally to the **components** that update as a result. This is important
because once you start implementing your flux loops, that's precisely
what you'll need to do.


## Song Cycles

### Songs API Request Actions

* `fetchAllSongs`
  0. invoked from `SongsIndex` `didMount`/`willReceiveProps`
  0. `GET /api/songs` is called.
  0. `receiveAllSongs` is set as the callback.

* `createSong`
  0. invoked from new song button `onClick`
  0. `POST /api/songs` is called.
  0. `receiveSingleSong` is set as the callback.

* `fetchSingleSong`
  0. invoked from `SongDetail` `didMount`/`willReceiveProps`
  0. `GET /api/songs/:id` is called.
  0. `receiveSingleSong` is set as the callback.

* `updateSong`
  0. invoked from `SongForm` `onSubmit`
  0. `POST /api/songs` is called.
  0. `receiveSingleSong` is set as the callback.

* `destroySong`
  0. invoked from delete song button `onClick`
  0. `DELETE /api/songs/:id` is called.
  0. `removeSong` is set as the callback.

### Songs API Response Actions

* `receiveAllSongs`
  0. invoked from an API callback.
  0. `Song` store updates `_songs` and emits change.

* `receiveSingleSong`
  0. invoked from an API callback.
  0. `Song` store updates `_songs[id]` and emits change.

* `removeSong`
  0. invoked from an API callback.
  0. `Song` store removes `_songs[id]` and emits change.

### Store Listeners

* `SongsIndex` component listens to `Song` store.
* `SongDetail` component listens to `Song` store.


## Songbook Cycles

### Songbooks API Request Actions

* `fetchAllSongbooks`
  0. invoked from `SongbooksIndex` `didMount`/`willReceiveProps`
  0. `GET /api/songbooks` is called.
  0. `receiveAllSongbooks` is set as the callback.

* `createSongbook`
  0. invoked from new songbook button `onClick`
  0. `POST /api/songbooks` is called.
  0. `receiveSingleSongbook` is set as the callback.

* `fetchSingleSongbook`
  0. invoked from `SongbookDetail` `didMount`/`willReceiveProps`
  0. `GET /api/songbooks/:id` is called.
  0. `receiveSingleSongbook` is set as the callback.

* `updateSongbook`
  0. invoked from `SongbookForm` `onSubmit`
  0. `POST /api/songbooks` is called.
  0. `receiveSingleSongbook` is set as the callback.

* `destroySongbook`
  0. invoked from delete songbook button `onClick`
  0. `DELETE /api/songbooks/:id` is called.
  0. `removeSongbook` is set as the callback.

## SearchSuggestion Cycles

* `fetchSearchSuggestions`
  0. invoked from `SongSearchBar` `onChange` when there is text
  0. `GET /api/songs` is called with `q` param.
  0. `receiveSearchSuggestions` is set as the callback.

* `receiveSearchSuggestions`
  0. invoked from an API callback.
  0. `SearchSuggestion` store updates `_suggestions` and emits change.

* `removeSearchSuggestions`
  0. invoked from `SongSearchBar` `onChange` when empty
  0. `SearchSuggestion` store resets `_suggestions` and emits change.

### Store Listeners

* `SearchBarSuggestions` component listens to `SearchSuggestion` store.

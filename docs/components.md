## Component Hierarchy

**Bolded** components are associated with routes.

(:exclamation: Remember, the bolded components are created by their
associated routes, so the nesting of your bolded components must
_**exactly**_ match the nesting of your routes.)

* **App**
  * SongsIndex
  * **UserPage**
    * UploadedSongs
      * SongsIndex
    * LikedSongs
      * SongsIndex


## Routes

* **component:** `App` **path:** `/`
  * **component:** `SongsIndex` **path:** index
  * **component:** `UserPage` **path:** `users/:user_id`
    * **component:** `UploadedSongs` **path:** `users/:user_id/uploaded_songs`
    * **component:** `LikedSongs` **path:** `users/:user_id/liked_songs`

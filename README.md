# SoundScape

[Heroku link][heroku] **Song:** This should be a link to your production site

[heroku]: http://www.herokuapp.com

## Minimum Viable Product

SoundScape is a web application inspired by SoundCloud that will be built using Ruby on Rails and React.js.  By the end of Week 9, this app will, at a minimum, satisfy the following criteria:

- [ ] Hosting on Heroku
- [ ] New account creation, login, and guest/demo login
- [ ] A production README, replacing this README (**NB**: check out the [sample production README](docs/production_readme.md) -- you'll write this later)
- [ ] User Pages
  - [ ] Smooth, bug-free navigation
  - [ ] Adequate seed data to demonstrate the site's features
  - [ ] Adequate CSS styling
- [ ] Song CRUD
  - [ ] Smooth, bug-free navigation
  - [ ] Adequate seed data to demonstrate the site's features
  - [ ] Adequate CSS styling
- [ ] Song Likes
  - [ ] Smooth, bug-free navigation
  - [ ] Adequate seed data to demonstrate the site's features
  - [ ] Adequate CSS styling
- [ ] Continuous Play while Navigating Site
  - [ ] Smooth, bug-free navigation
  - [ ] Adequate seed data to demonstrate the site's features
  - [ ] Adequate CSS styling


## Design Docs
* [View Wireframes][views]
* [React Components][components]
* [Flux Cycles][flux-cycles]
* [API endpoints][api-endpoints]
* [DB schema][schema]

[views]: docs/views.md
[components]: docs/components.md
[flux-cycles]: docs/flux-cycles.md
[api-endpoints]: docs/api-endpoints.md
[schema]: docs/schema.md

## Implementation Timeline

### Phase 1: Backend setup and Front End User Authentication (1.5 days, W1 Wed 12pm)

**Objective:** Functioning rails project with Authentication

- [ ] create `User` model
- [ ] authentication
- [ ] user signup/signin modals
- [ ] create basic user profile pages
- [ ] allow users to upload profile picture
- [ ] implement basic navigation bar

### Phase 2: Song Model, API, and basic APIUtil (1 day, W1 Th 12pm)

**Objective:** Songs can be created, read, edited and destroyed through
the API.

- [ ] create `Song` model
- [ ] seed the database with a small amount of test data
- [ ] CRUD API for songs (`Api::SongsController`)
- [ ] jBuilder views for songs (?)
- [ ] setup Webpack & Flux scaffold
- [ ] setup `APIUtil` to interact with the API
- [ ] test out API interaction in the console.

### Phase 3: Flux Architecture and Router (1.5 days, W1 F 6pm)

**Objective:** Songs can be created, read, edited and destroyed with the
user interface.

- [ ] setup the flux loop with skeleton files
- [ ] setup React Router
- implement each song component, building out the flux loop as needed.
  - [ ] `SongsIndex`
  - [ ] `SongIndexItem`
  - [ ] `SongForm`
- [ ] implement a separate song index for profile page (user's uploaded songs)
and for home page (all user's uploaded songs)
- [ ] update navigation bar to link to home page and user page as well as signup
and login

### Phase 4: Start Styling (0.5 days, W2 M 12pm)

**Objective:** Existing pages (including signup/signin) will look good.

- [ ] create a basic style guide
- [ ] position elements on the page
- [ ] add basic colors & styles

### Phase 5: Song Likes (1 day, W2 Tu 12pm)

**Objective:** Songs can be likes, and can be viewed on user page.

- [ ] create `SongLike` model (join table)
- build out API, Flux loop, and components for:
  - [ ] liking/unliking any song other than your own
  - [ ] viewing liked songs on user Pages
- [ ] Use CSS to style new views

### Phase 6: Play back (1 days, W2 Th 12pm)

**Objective:** Songs can be played continuously while navigating the site

- [ ] implement UI to allow for play a song
- implement a functioning play back bar
  - [ ] bar should show/hide based on state
  - [ ] buttons for pause/play, forward/rewind, and volume control
  - [ ] animated view that shows the current location of the play back
- [ ] bar stays open when navigating pages


### Phase 7: Allow Complex Styling (0.5 days, W2 Th 6pm)

**objective:** Enable complex styling using bootstrap.

- [ ] Integrate bootstrap
- [ ] make the page stand out and look good
- [ ] add custom animation to transitions (?)

### Phase 8: Seeding and clean up (1 day, W2 F 6pm)

**objective:** Make the site feel more cohesive and awesome.

- [ ] Seed database with music (spotify api or other source)
- [ ] Get feedback on UI and seed data
- [ ] style finishing touches / code clean up

### Bonus Features (TBD)
- [ ] Search for songs with search bar in navigation bar
- [ ] Allow look up of any song using spotify api (only samples)
- [ ] Pagination / infinite scroll for Songs Index
- [ ] Allow users to organize songs into playlists

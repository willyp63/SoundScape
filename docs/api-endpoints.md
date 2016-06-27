# API Endpoints

## HTML API

### Root

- `GET /` - loads React web app

### Users

- `GET /users/new`
- `POST /users`
- `PATCH /users`

### Session

- `GET /session/new`
- `POST /session`
- `DELETE /session`

## JSON API

### Songs

- `GET /api/songs`
  - Songs index/search
  - accepts `q` query param to filter songs (if I get there)
  - accepts pagination params (if I get there)
- `POST /api/songs`
- `GET /api/songs/:id`
- `PATCH /api/songs/:id`
- `DELETE /api/songs/:id`

### User Specific Songs

- `GET /users/:user_id/uploaded_songs`
- `GET /users/:user_id/liked_songs`

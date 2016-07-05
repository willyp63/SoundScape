class Api::TracksController < ApplicationController
  def index
    if params[:limit] && params[:offset]
      @tracks = Track.all_tracks(params[:limit], params[:offset])
    else
      @tracks = Track.all
    end

    if logged_in?
      @tracks = build_liked_tracks(@tracks)
    end

    render json: @tracks
  end

  def liked
    if logged_in?
      @tracks = Track.liked_tracks(current_user)
      @tracks = @tracks.map do |t|
        track = track_hash(t)
        track[:liked] = true
        track
      end
      render json: @tracks
    else
      render json: ["you're not logged in"], status: 404
    end
  end

  def build_liked
    render json: build_liked_spotify_tracks(params[:tracks])
  end

  def posted
    if logged_in?
      @tracks = Track.posted_tracks(current_user)
      render json: build_liked_tracks(@tracks)
    else
      render json: ["you're not logged in"], status: 404
    end
  end

  def create
    track = Track.new(track_params);

    if logged_in?
      track.user_id = current_user.id
    end

    if track.save
      render json: track
    else
      render json: track.errors.full_messages, status: 422
    end
  end

  def create_anonymous
    track = Track.new(track_params);

    if track.save
      render json: track
    else
      render json: track.errors.full_messages, status: 422
    end
  end

  def update
    track = Track.find(params[:id]);
    if track.update(track_params)
      track = track_hash(track)
      track[:liked] = (params[:track][:liked] == "true")
      render json: track
    else
      render json: track.errors.full_messages, status: 422
    end
  end

  def destroy
    track = Track.find(params[:id]);
    track.destroy!
    render json: track
  end

  private
  def build_liked_tracks(tracks)
    # build hash
    track_id_hash = {}.tap do |h|
      tracks.each do |t|
        id = (t.spotify_id || t.id)
        h[id] = track_hash(t)
      end
    end
    # set liked field
    Track.liked_tracks(current_user).each do |t|
      id = (t.spotify_id || t.id)
      if track_id_hash[id]
        track_id_hash[id][:liked] = true
      end
    end
    track_id_hash.values
  end

  def track_hash(t)
    {id: t.id, title: t.title, audio_url: t.audio_url, liked: false,
     image_url: t.image_url, user_id: t.user_id, spotify_id: t.spotify_id}
  end

  def build_liked_spotify_tracks(tracks)
    # build hash
    track_id_hash = {}.tap do |h|
      tracks.each do |_, t|
        t['liked'] = false
        h[t['spotify_id']] = t
      end
    end
    # set liked field
    Track.liked_spotify_tracks(current_user).each do |t|
      if track_id_hash[t.spotify_id]
        track_id_hash[t.spotify_id]['liked'] = true
      end
    end
    # set id field for those already in db
    Track.spotify_tracks.each do |t|
      if track_id_hash[t.spotify_id]
        track_id_hash[t.spotify_id]['id'] = t.id
      end
    end
    track_id_hash.values
  end

  def track_params
    params.require(:track).permit(:title, :audio_url, :image_url, :spotify_id)
  end
end

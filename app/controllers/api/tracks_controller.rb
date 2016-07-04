class Api::TracksController < ApplicationController
  def index
    if params[:limit] && params[:offset]
      @tracks = Track.all_tracks(params[:limit], params[:offset])
    else
      @tracks = Track.all
    end

    if logged_in?
      liked_tracks = Track.liked_tracks(current_user)
      track_id_hash = {}.tap do |h|
        @tracks.each do |t|
          h[t.spotify_id || t.id] = {id: t.id, title: t.title, audio_url: t.audio_url, liked: false,
                              image_url: t.image_url, user_id: t.user_id, spotify_id: t.spotify_id}
        end
      end
      liked_tracks.each do |t|
        id = t.spotify_id || t.id
        if track_id_hash[id]
          track_id_hash[id][:liked] = true
        end
      end
      @tracks = track_id_hash.keys.map {|k| track_id_hash[k] }
    end

    render json: @tracks
  end

  def liked
    if logged_in?
      @tracks = Track.liked_tracks(current_user)
      render json: @tracks
    else
      render json: ["you're not logged in"], status: 404
    end
  end

  def build_liked
    spotify_tracks = Track.where("tracks.spotify_id IS NOT NULL")
    liked_tracks = Track.where("tracks.spotify_id IS NOT NULL")
                        .joins("INNER JOIN track_likes ON track_likes.spotify_id = tracks.spotify_id")
                        .where("track_likes.user_id = ?", current_user.id)
    track_id_hash = {}.tap do |h|
      params[:tracks].each do |_, t|
        t['liked'] = false
        h[t['spotify_id'] || t['id']] = t
      end
    end
    # set liked field
    liked_tracks.each do |t|
      id = t.spotify_id || t.id
      if track_id_hash[id]
        track_id_hash[id]['liked'] = true
      end
    end
    # set id field for those already in db
    spotify_tracks.each do |t|
      if track_id_hash[t.spotify_id]
        track_id_hash[t.spotify_id]['id'] = t.id
      end
    end
    @tracks = track_id_hash.keys.map {|k| track_id_hash[k] }
    render json: @tracks
  end

  def posted
    if logged_in?
      @tracks = Track.posted_tracks(current_user)
      render json: @tracks
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

  private
  def set_liked_field(tracks)
    liked_tracks = Track.liked_tracks(current_user)
    track_id_hash = {}.tap do |h|
      tracks.each do |t|
        h[t.id || t.spotify_id] = {id: t.id, title: t.title, audio_url: t.audio_url, liked: false,
                            image_url: t.image_url, user_id: t.user_id, spotify_id: t.spotify_id}
      end
    end
    liked_tracks.each do |t|
      id = t.id || t.spotify_id
      if track_id_hash[id]
        track_id_hash[id][:liked] = true
      end
    end
    track_id_hash.keys.map {|k| track_id_hash[k] }
  end

  def track_params
    params.require(:track).permit(:title, :audio_url, :image_url, :spotify_id)
  end
end

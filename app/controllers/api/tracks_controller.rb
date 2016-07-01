class Api::TracksController < ApplicationController
  def index
    if params[:limit] && params[:offset]
      @tracks = Track.all_tracks(params[:limit], params[:offset])
    else
      @tracks = Track.all
    end

    # set liked prop without n+1 queries
    @tracks = @tracks.map {|t| {id: t.id, title: t.title, audio_url: t.audio_url,
      image_url: t.image_url, user_id: t.user_id} }

    TrackLike.where(user_id: current_user.id).includes(:track).each do |like|
      track = @tracks.detect {|t| t[:id] == like.track_id}
      track[:liked] = true
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
  def track_params
    params.require(:track).permit(:title, :audio_url, :image_url)
  end
end

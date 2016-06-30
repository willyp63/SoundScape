class Api::TracksController < ApplicationController
  def index
    @tracks = Track.all
    render 'api/tracks/index'
  end

  def liked
    if logged_in?
      @tracks = Track.liked_tracks(current_user)
      render 'api/tracks/index'
    else
      render json: ["you're not logged in"], status: 404
    end
  end

  def posted
    if logged_in?
      @tracks = Track.posted_tracks(current_user)
      render 'api/tracks/index'
    else
      render json: ["you're not logged in"], status: 404
    end
  end

  def create
    track = Track.new(track_params);
    track.user_id = current_user.id
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

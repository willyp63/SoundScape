class Api::TracksController < ApplicationController
  def index
    tracks = Track.all
    render json: tracks
  end

  def create
    track = Track.new(track_params);
    track.user_id = current_user.id
    if track.save
      render json: track
    else
      render json: track.errors.full_messages
    end
  end

  private
  def track_params
    params.require(:track).permit(:title, :audio_url, :image_url)
  end
end

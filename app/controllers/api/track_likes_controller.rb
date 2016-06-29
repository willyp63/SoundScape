class Api::TrackLikesController < ApplicationController
  def create
    track_like = TrackLike.new(track_like_params);
    track_like.user_id = current_user.id
    if track_like.save
      render json: track_like
    else
      render json: track_like.errors.full_messages
    end
  end

  private
  def track_like_params
    params.require(:track_like).permit(:track_id)
  end
end

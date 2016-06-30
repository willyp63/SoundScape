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

  def destroy
    track_like = TrackLike.find_by(track_id: params[:id], user_id: current_user.id);
    track_like.destroy!
    render json: track_like
  end

  private
  def track_like_params
    params.require(:track_like).permit(:track_id)
  end
end

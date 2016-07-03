class Api::TrackLikesController < ApplicationController
  def create
    # perfer to set spotify id
    if params[:track_like][:spotify_id]
      track_like = TrackLike.new(spotify_id: params[:track_like][:spotify_id]);
    else
      track_like = TrackLike.new(track_id: params[:track_like][:track_id]);
    end
    track_like.user_id = current_user.id
    if track_like.save
      render json: track_like
    else
      render json: track_like.errors.full_messages
    end
  end

  def destroy
    # match either id type
    track_like = TrackLike.find_by(track_id: params[:id], user_id: current_user.id);
    track_like ||= TrackLike.find_by(spotify_id: params[:id], user_id: current_user.id);
    track_like.destroy!
    render json: track_like
  end

  private
  def track_like_params
    params.require(:track_like).permit(:track_id, :spotify_id)
  end
end

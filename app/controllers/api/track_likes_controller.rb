class Api::TrackLikesController < ApplicationController
  def create
    unless logged_in?
      render json: ["Nobody signed in"], status: 404
      return
    end

    # perfer to set spotify id
    spotify_id = params[:track_like][:spotify_id]
    if spotify_id && !spotify_id.empty?
      unless TrackLike.find_by(spotify_id: spotify_id, user_id: current_user.id)
        track_like = TrackLike.new(spotify_id: spotify_id, user_id: current_user.id)
        track_like.save!
        Track.find_by(spotify_id: spotify_id).incrementLikeCount
      end
    else
      unless TrackLike.find_by(track_id: params[:track_like][:track_id], user_id: current_user.id)
        track_like = TrackLike.new(track_id: params[:track_like][:track_id], user_id: current_user.id)
        track_like.save!
        track_like.track.incrementLikeCount
      end
    end
    render json: track_like
  end

  def destroy
    unless logged_in?
      render json: ["Nobody signed in"], status: 404
      return
    end

    if params[:id].to_i.to_s != params[:id]
      track_like = TrackLike.find_by(spotify_id: params[:id], user_id: current_user.id);
      if track_like
        Track.find_by(spotify_id: params[:id]).decrementLikeCount
        track_like.destroy!
      end
    else
      track_like = TrackLike.find_by(track_id: params[:id], user_id: current_user.id);
      if track_like
        track_like.track.decrementLikeCount
        track_like.destroy!
      end
    end
    render json: track_like
  end

  private
  def track_like_params
    params.require(:track_like).permit(:track_id, :spotify_id)
  end
end

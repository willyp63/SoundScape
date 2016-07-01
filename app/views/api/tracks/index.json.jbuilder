json.array! @tracks do |track|
  json.extract! track, :title, :audio_url, :image_url, :user_id, :id
  if logged_in?
    json.liked track.track_likes.any? {|track_like| track_like.user_id == current_user.id}
  end
end

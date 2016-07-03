# == Schema Information
#
# Table name: track_likes
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null
#  track_id   :integer
#  spotify_id :string
#

class TrackLike < ActiveRecord::Base
  belongs_to :user
  belongs_to :track
end

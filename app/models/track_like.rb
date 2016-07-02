# == Schema Information
#
# Table name: track_likes
#
#  id       :integer          not null, primary key
#  user_id  :integer          not null
#  track_id :integer          not null
#

class TrackLike < ActiveRecord::Base
  belongs_to :user
  belongs_to :track

  validates_uniqueness_of :user_id, scope: :track_id
end

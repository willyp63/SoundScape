# == Schema Information
#
# Table name: tracks
#
#  id         :integer          not null, primary key
#  title      :string           not null
#  audio_url  :string           not null
#  image_url  :string
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  spotify_id :string
#

class Track < ActiveRecord::Base
  belongs_to :user
  has_many :track_likes
  has_many :likers, through: :track_likes, source: :user

  validates(
    :title,
    :audio_url,
    :image_url,
    presence: true
  )

  def self.all_tracks(limit, offset)
    Track.limit(limit).offset(offset)
  end

  def self.posted_tracks(user)
    Track.where(user_id: user.id)
  end

  def self.liked_tracks(user)
    Track.joins("INNER JOIN track_likes ON track_likes.track_id = tracks.id OR
                                           track_likes.spotify_id = tracks.spotify_id")
         .where("track_likes.user_id = ?", user.id)
  end
end

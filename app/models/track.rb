# == Schema Information
#
# Table name: tracks
#
#  id         :integer          not null, primary key
#  title      :string           not null
#  audio_url  :string
#  image_url  :string
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  spotify_id :string
#  like_count :integer          default(0)
#  artists    :string           is an Array
#

class Track < ActiveRecord::Base
  belongs_to :user
  has_many :reports
  has_many :track_likes
  has_many :likers, through: :track_likes, source: :user

  validates :title, presence: true

  def self.all_tracks(limit, offset)
    Track.limit(limit).offset(offset)
  end

  def self.posted_tracks(user)
    Track.where(user_id: user.id)
  end

  def self.reported(limit, offset)
    Track.joins(:reports).group('tracks.id').order('COUNT(*)').limit(limit).offset(offset)
  end

  def self.liked_tracks(user)
    Track.joins("INNER JOIN track_likes ON track_likes.track_id = tracks.id OR
                                          track_likes.spotify_id = tracks.spotify_id")
         .where("track_likes.user_id = ?", user.id)
  end

  def self.spotify_tracks
    Track.where("tracks.spotify_id IS NOT NULL")
  end

  def self.liked_spotify_tracks(user)
    Track.where("tracks.spotify_id IS NOT NULL")
         .joins("INNER JOIN track_likes ON track_likes.spotify_id = tracks.spotify_id")
         .where("track_likes.user_id = ?", user.id)
  end

  def self.most_liked(limit, offset)
    Track.order("like_count DESC").limit(limit).offset(offset)
  end

  def self.most_recent(limit, offset)
    Track.order("created_at DESC").limit(limit).offset(offset)
  end

  def incrementLikeCount
    update!(like_count: like_count + 1)
  end

  def decrementLikeCount
    update!(like_count: like_count - 1)
  end
end

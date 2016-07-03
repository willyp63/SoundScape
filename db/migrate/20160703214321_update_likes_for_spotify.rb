class UpdateLikesForSpotify < ActiveRecord::Migration
  def change
    change_column :track_likes, :track_id, :integer, null: true
    add_column :track_likes, :spotify_id, :string
  end
end

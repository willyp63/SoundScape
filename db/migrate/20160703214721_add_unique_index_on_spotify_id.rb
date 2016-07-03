class AddUniqueIndexOnSpotifyId < ActiveRecord::Migration
  def change
    add_index :track_likes, [:user_id, :spotify_id], unique: true
  end
end

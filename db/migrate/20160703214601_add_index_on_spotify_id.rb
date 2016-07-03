class AddIndexOnSpotifyId < ActiveRecord::Migration
  def change
    add_index :track_likes, :spotify_id
  end
end

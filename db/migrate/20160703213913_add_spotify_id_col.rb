class AddSpotifyIdCol < ActiveRecord::Migration
  def change
    add_column :tracks, :spotify_id, :string
    add_index :tracks, :spotify_id, unique: true
  end
end

class ArtistAreArrays < ActiveRecord::Migration
  def change
    remove_column :tracks, :artist, :string
    add_column :tracks, :artists, :string, array: true
  end
end

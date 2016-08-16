class AddDurationToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :duration_sec, :integer
  end
end

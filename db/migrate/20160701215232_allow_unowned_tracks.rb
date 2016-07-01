class AllowUnownedTracks < ActiveRecord::Migration
  def change
    change_column :tracks, :user_id, :integer, :null => true
  end
end

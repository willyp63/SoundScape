class AddUniqToLikes < ActiveRecord::Migration
  def change
    add_index :track_likes, [:user_id, :track_id], unique: true
  end
end

class AddLikeCount < ActiveRecord::Migration
  def change
    add_column :tracks, :like_count, :integer, default: 0
  end
end

class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.string :title, null: false
      t.string :audio_url, null: false
      t.string :image_url
      t.integer :user_id, null: false

      t.timestamps null: false
    end

    add_index :tracks, :title
    add_index :tracks, :user_id
  end
end

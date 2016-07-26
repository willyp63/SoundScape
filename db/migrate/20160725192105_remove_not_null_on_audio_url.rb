class RemoveNotNullOnAudioUrl < ActiveRecord::Migration
  def change
    change_column :tracks, :audio_url, :string, null: true
  end
end

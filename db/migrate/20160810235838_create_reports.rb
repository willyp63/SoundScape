class CreateReports < ActiveRecord::Migration
  def change
    create_table :reports do |t|
      t.integer :track_id, null: false
    end
  end
end

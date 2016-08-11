class Report < ActiveRecord::Base
  validates :track_id, presence: true

  belongs_to :track
end

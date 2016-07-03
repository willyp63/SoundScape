# == Schema Information
#
# Table name: tracks
#
#  id         :integer          not null, primary key
#  title      :string           not null
#  audio_url  :string           not null
#  image_url  :string
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  spotify_id :string
#

require 'test_helper'

class TrackTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

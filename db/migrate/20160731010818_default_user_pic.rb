class DefaultUserPic < ActiveRecord::Migration
  def change
    change_column :users, :picture_url, :string, default: 'http://res.cloudinary.com/dcwxxqs4l/image/upload/v1469825821/nobody_wix2c9.jpg'
  end
end

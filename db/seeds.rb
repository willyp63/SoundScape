# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

admin = User.create!(username: 'admin', password: 'password',
    picture_url: "http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467420920/ju19klj43ayaxvaw2u2g.jpg")

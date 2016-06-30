# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

admin = User.create!(username: 'admin', password: 'password')

Track.create!(title: 'Africa', user_id: admin.id,
              audio_url: 'http://res.cloudinary.com/dcwxxqs4l/video/upload/v1467217241/Toto_-_Africa_sxwlq8.mp3',
              image_url: 'http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467217018/cover4_b01g61.jpg')
Track.create!(title: 'A Whiter Shade of Pale', user_id: admin.id,
              audio_url: 'http://res.cloudinary.com/dcwxxqs4l/video/upload/v1467217228/Procol_Harum_-_A_Whiter_Shade_Of_Pale_yw2p7n.mp3',
              image_url: 'http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467217018/cover3_zqqfzf.jpg')
Track.create!(title: 'All Along the Watch Tower', user_id: admin.id,
              audio_url: 'http://res.cloudinary.com/dcwxxqs4l/video/upload/v1467217239/Jimi_Hendrix_-_All_Along_The_Watchtower_spcy2w.mp3',
              image_url: 'http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467217018/cover5_jvhrm9.jpg')
Track.create!(title: 'Against the Wind', user_id: admin.id,
              audio_url: 'http://res.cloudinary.com/dcwxxqs4l/video/upload/v1467217239/Bob_Seger_-_Against_The_Wind_bldnoz.mp3',
              image_url: 'http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467217018/cover1_fmm3u7.jpg')
Track.create!(title: 'Dont Fear the Reaper', user_id: admin.id,
              audio_url: 'http://res.cloudinary.com/dcwxxqs4l/video/upload/v1467217244/Blue_O%CC%88yster_Cult_-_Don_t_Fear_The_Reaper_cezei0.mp3',
              image_url: 'http://res.cloudinary.com/dcwxxqs4l/image/upload/v1467217018/cover2_xwj6w0.jpg')

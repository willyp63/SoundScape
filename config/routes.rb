Rails.application.routes.draw do
  root to: 'static_pages#root'
  namespace :api, defaults: {format: :json} do
    resources :tracks, only: [:index, :create]
    get '/tracks/liked', to: 'tracks#liked'
    get '/tracks/posted', to: 'tracks#posted'
    post '/tracks/anonymous', to: 'tracks#create_anonymous'
    resources :track_likes, only: [:create, :destroy]
    resources :users, only: [:create]
    resource :session, only: [:create, :destroy]
  end
end

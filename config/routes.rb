Rails.application.routes.draw do
  root to: 'static_pages#root'
  namespace :api, defaults: {format: :json} do
    resources :tracks, only: [:index, :create]
    resources :track_likes, only: [:create]
    resources :users, only: [:create]
    resource :session, only: [:create, :destroy]
  end
end

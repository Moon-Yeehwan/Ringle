Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get :ping, to: "ping#index"
      resources :notes, only: %i[index show create update destroy]
    end
  end
end

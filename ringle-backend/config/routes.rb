Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get :ping, to: "ping#index"

      # Notes API
      resources :notes, only: %i[index show create update destroy]

      # Memberships API
      resources :memberships, only: [:index, :show, :create, :destroy]

      # Users API (membership 관련) — 모두 컬렉션 라우트
      resources :users, only: [] do
        collection do
          get    :memberships
          post   :purchase
          post   :grant
          delete :revoke
          # ⛔ can_chat 은 여기서 제거
        end
      end

      # Me API (권한 체크)
      get "me/can_chat", to: "me#can_chat"
    end
  end
end

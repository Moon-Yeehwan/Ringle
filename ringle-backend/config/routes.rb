# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # --- Memberships ---
      resources :memberships, only: [:index]  # GET /api/v1/memberships

      # --- Users ---
      get    'users/memberships', to: 'users#memberships'  # GET  /api/v1/users/memberships?email=...
      post   'users/grant',       to: 'users#grant'        # POST /api/v1/users/grant        { email, membership_id }
      post   'users/purchase',    to: 'users#purchase'     # POST /api/v1/users/purchase     { email, membership_id }
      delete 'users/revoke',      to: 'users#revoke'       # DEL  /api/v1/users/revoke       { email, user_membership_id }

      # --- Me ---
      get 'me/can_chat', to: 'me#can_chat'                 # GET  /api/v1/me/can_chat?email=...

      # --- Notes (화면에 버튼 있으니 같이 노출) ---
      resources :notes, only: [:index, :create]            # GET /api/v1/notes, POST /api/v1/notes

      # --- Ping (상단 Ping 카드) ---
      get 'ping', to: 'ping#show'                          # GET /api/v1/ping
    end
  end
end

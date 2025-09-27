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
      delete 'users/revoke',      to: 'users#revoke'       # DELETE /api/v1/users/revoke     { email, user_membership_id }

      # --- Me ---
      get 'me/can_chat', to: 'me#can_chat'                 # GET /api/v1/me/can_chat?email=...

      # --- Notes ---
      resources :notes, only: [:index, :create]            # GET /api/v1/notes, POST /api/v1/notes

      # --- Ping ---
      get 'ping', to: 'ping#show'                          # GET /api/v1/ping
    end
  end
end

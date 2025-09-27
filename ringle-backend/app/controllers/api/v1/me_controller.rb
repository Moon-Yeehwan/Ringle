module Api
  module V1
    class MeController < ApplicationController
      def can_chat
        email = params[:email] || 'demo@ringle.test'
        user  = User.find_by(email: email)

        can_chat = user&.can_chat? || false
        memberships = user ? user.active_memberships : []

        render json: {
          canChat: can_chat,
          memberships: memberships
        }
      end
    end
  end
end

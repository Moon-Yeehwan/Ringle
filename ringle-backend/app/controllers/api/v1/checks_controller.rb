# frozen_string_literal: true

class Api::V1::ChecksController < Api::V1::ApplicationController
  # 인증은 과제 제외 → 헤더/파라미터 없으면 첫 번째 유저로 가정
  def can_chat
    user     = current_user!
    active   = user.active_user_memberships
    features = user.active_features

    render json: {
      canChat: features.include?('chat'),
      features: features,
      memberships: active.map { |um|
        {
          id: um.id,
          title: um.membership.title,
          expiresAt: um.expires_at.iso8601,
          features: um.membership.features
        }
      }
    }
  end

  private

  def current_user!
    uid = request.headers['X-User-Id'] || params[:user_id]
    User.find_by(id: uid) || User.first!
  end
end

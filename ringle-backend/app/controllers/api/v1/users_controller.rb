# app/controllers/api/v1/users_controller.rb
class Api::V1::UsersController < Api::V1::ApplicationController
  before_action :set_user

  # GET /api/v1/users/memberships?email=...
  def memberships
    render json: @user.user_memberships
                     .includes(:membership)
                     .order(id: :desc)
                     .map { |um|
      m = um.membership
      {
        id:            um.id,                     # user_membership id
        membership_id: m.id,
        title:         m.title || m.name,         # 최신/구 스키마 호환
        starts_on:     um.starts_on,
        ends_on:       um.ends_on,
        expires_at:    um.expires_at,
        active:        respond_to_active?(um),
        features:      m.features || legacy_features(m) # ["learn","chat","analyze"]
      }
    }
  end

  # POST /api/v1/users/purchase?email=... { membership_id: 8 }
  def purchase
    um = create_membership_for!(@user, params.require(:membership_id))
    render json: { ok: true, user_membership_id: um.id }
  rescue ActiveRecord::RecordInvalid => e
    render json: { ok: false, error: e.record.errors.full_messages }, status: 422
  end

  # POST /api/v1/users/grant?email=... { membership_id: 8 }
  def grant
    um = create_membership_for!(@user, params.require(:membership_id))
    render json: { ok: true, user_membership_id: um.id }
  rescue ActiveRecord::RecordInvalid => e
    render json: { ok: false, error: e.record.errors.full_messages }, status: 422
  end

  # DELETE /api/v1/users/revoke?email=... { user_membership_id: 12 }
  def revoke
    @user.user_memberships.find(params.require(:user_membership_id)).destroy!
    render json: { ok: true }
  end

  # NOTE: 권한 판정은 ChecksController#can_chat 로 이동됨.
  # 남겨두고 싶다면 아래 주석 해제해서 임시 호환용으로 사용 가능
  #
  # def can_chat
  #   allowed = @user.user_memberships
  #                 .includes(:membership)
  #                 .any? { |um|
  #                   active_date?(um) &&
  #                   Array(um.membership.features).include?("chat")
  #                 }
  #   render json: { canChat: allowed }
  # end

  private

  def set_user
    @user = User.find_by!(email: params[:email]) # 인증 제외
  end

  # 최신/구 스키마를 모두 지원해서 UserMembership 생성
  def create_membership_for!(user, membership_id)
    m = Membership.find(membership_id)
    days = (m.respond_to?(:duration_days) && m.duration_days) ? m.duration_days :
           (m.respond_to?(:days) && m.days) ? m.days : 0
    starts_on = Date.current
    ends_on   = starts_on + days.to_i           # Date + Integer(일)
    user.user_memberships.create!(
      membership: m,
      starts_on:  starts_on,
      ends_on:    ends_on,
      expires_at: ends_on                       # ✅ NOT NULL 보장
    )
  end

  # 구 스키마(boolean 3종)를 배열로 변환
  def legacy_features(m)
    feats = []
    feats << "learn"   if m.respond_to?(:can_learn)   && m.can_learn
    feats << "chat"    if m.respond_to?(:can_chat)    && m.can_chat
    feats << "analyze" if m.respond_to?(:can_analyze) && m.can_analyze
    feats
  end

  def respond_to_active?(um)
    if um.respond_to?(:active?)
      um.active?
    else
      active_date?(um)
    end
  end

  def active_date?(um)
    ref = um.expires_at || um.ends_on
    ref.present? && ref >= Date.current
  end
end

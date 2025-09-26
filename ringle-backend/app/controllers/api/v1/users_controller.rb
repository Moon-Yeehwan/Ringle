class Api::V1::UsersController < Api::V1::ApplicationController
  before_action :set_user

  def memberships
    render json: @user.user_memberships.includes(:membership).map { |um|
      m = um.membership
      { id: um.id, name: m.name, ends_on: um.ends_on, active: um.active?,
        features: { learn: m.can_learn, chat: m.can_chat, analyze: m.can_analyze } }
    }
  end

  def purchase
    m = Membership.find(params[:membership_id])
    um = @user.user_memberships.create!(
      membership: m, starts_on: Date.today, ends_on: Date.today + m.days
    )
    render json: { ok: true, user_membership_id: um.id }
  end

  def grant
    m = Membership.find(params[:membership_id])
    um = @user.user_memberships.create!(
      membership: m, starts_on: Date.today, ends_on: Date.today + m.days
    )
    render json: { ok: true, granted: um.id }
  end

  def revoke
    @user.user_memberships.find(params[:user_membership_id]).destroy!
    render json: { ok: true }
  end

  def can_chat
    allowed = @user.user_memberships.active.joins(:membership)
                 .where(memberships: { can_chat: true }).exists?
    render json: { can_chat: allowed }
  end

  private
  def set_user
    @user = User.find_by!(email: params[:email])  # 인증 제외
  end
end

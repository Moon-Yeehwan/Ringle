class UserMembership < ApplicationRecord
  belongs_to :user
  belongs_to :membership

  scope :active, -> { where('expires_at > ?', Time.current) }

  delegate :features, to: :membership
  def expired? = expires_at <= Time.current

  # ✅ 컨트롤러/프론트 레거시 호환용
  def active?
    expires_at.present? && expires_at > Time.current
  end
end

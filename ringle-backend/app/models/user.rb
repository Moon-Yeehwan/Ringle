class User < ApplicationRecord
  has_many :user_memberships, dependent: :destroy
  has_many :memberships, through: :user_memberships

  def active_user_memberships = user_memberships.active.includes(:membership)
  def active_features = active_user_memberships.flat_map(&:features).uniq
  def can_chat? = active_features.include?('chat')
end

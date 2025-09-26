class UserMembership < ApplicationRecord
  belongs_to :user
  belongs_to :membership

  scope :active, -> { where("ends_on >= ?", Date.today) }
  def active? = ends_on && ends_on >= Date.today
end

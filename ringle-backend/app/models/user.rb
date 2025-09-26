class User < ApplicationRecord
  has_many :user_memberships, dependent: :destroy
  has_many :memberships, through: :user_memberships
end

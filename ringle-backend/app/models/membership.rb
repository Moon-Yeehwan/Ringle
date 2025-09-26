class Membership < ApplicationRecord
  validates :name, presence: true
  validates :days, numericality: { greater_than: 0 }
end

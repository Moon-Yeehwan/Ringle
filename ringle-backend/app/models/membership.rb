class Membership < ApplicationRecord
  FEATURES = %w[learn chat analyze].freeze

  validates :title, presence: true
  validates :duration_days, numericality: { greater_than: 0 }
  validate  :features_are_valid

  def feature?(k) = features.include?(k.to_s)

  private
  def features_are_valid
    invalid = features - FEATURES
    errors.add(:features, "invalid: #{invalid.join(', ')}") if invalid.any?
  end
end

class Invitation < ApplicationRecord
  belongs_to :tenant

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  before_validation :generate_token, on: :create
  before_validation :set_default_expiration, on: :create

  scope :active, -> { where('expires_at > ?', Time.current).where(used_at: nil) }

  def expired?
    expires_at < Time.current
  end

  def used?
    used_at.present?
  end

  def valid_for_use?
    !expired? && !used?
  end

  def mark_as_used!
    update!(used_at: Time.current)
  end

  private

  def generate_token
    self.token ||= SecureRandom.hex(16)
  end

  def set_default_expiration
    self.expires_at ||= 7.days.from_now
  end
end

class Session < ApplicationRecord
  belongs_to :user

  TTL = 7.days
  SLIDE_AFTER = 1.day

  def self.start!(user:, user_agent: nil, ip_address: nil)
    raw = SecureRandom.urlsafe_base64(32)
    session = create!(
      user: user,
      token_digest: digest(raw),
      expires_at: TTL.from_now,
      last_active_at: Time.current,
      user_agent: user_agent,
      ip_address: ip_address
    )
    [session, raw]
  end

  def self.digest(raw)
    Digest::SHA256.hexdigest(raw)
  end

  def self.authenticate(raw)
    return nil if raw.blank?
    session = find_by(token_digest: digest(raw))
    return nil unless session&.active?
    session.touch_expiry
    session
  end

  def active?
    expires_at > Time.current
  end

  def touch_expiry
    return if last_active_at && last_active_at > SLIDE_AFTER.ago
    update!(expires_at: TTL.from_now, last_active_at: Time.current)
  end
end

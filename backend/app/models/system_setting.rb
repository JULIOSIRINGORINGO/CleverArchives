class SystemSetting < ApplicationRecord
  self.table_name = 'system_settings'

  validates :maintenance_mode, inclusion: { in: [true, false] }

  def self.instance
    first_or_create!(maintenance_mode: false, maintenance_message: 'Platform sedang dalam pemeliharaan rutin.')
  end
end

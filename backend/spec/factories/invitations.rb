FactoryBot.define do
  factory :invitation do
    token { "MyString" }
    tenant { nil }
    expires_at { "2026-03-25 12:59:34" }
    used_at { "2026-03-25 12:59:34" }
    email { "MyString" }
  end
end

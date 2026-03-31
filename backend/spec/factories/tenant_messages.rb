FactoryBot.define do
  factory :tenant_message do
    tenant { nil }
    title { "MyString" }
    body { "MyText" }
    sender_role { "MyString" }
    read_at { "2026-03-15 23:13:31" }
  end
end

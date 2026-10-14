Pod::Spec.new do |s|
  s.name           = 'UniversalLink'
  s.version        = '1.0.0'
  s.summary        = 'Universal Link 로만 다른 앱을 연다(앱 없으면 false — 사파리로 새지 않는다).'
  s.description    = s.summary
  s.author         = 'jirum-alarm'
  s.homepage       = 'https://jirum-alarm.com'
  s.license        = { :type => 'UNLICENSED' }
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,swift}'
end

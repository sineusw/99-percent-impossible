Pod::Spec.new do |s|
  s.name = 'N99Storekit'
  s.version = '1.0.0'
  s.summary = 'Verified StoreKit 2 purchases for 99 Percent Impossible'
  s.license = { :type => 'Proprietary' }
  s.homepage = 'https://github.com/sineusw/99-percent-impossible'
  s.author = 'Petty Games Studios'
  s.source = { :git => 'https://github.com/sineusw/99-percent-impossible.git', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m}'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end

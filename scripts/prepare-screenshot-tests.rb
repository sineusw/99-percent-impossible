require 'xcodeproj'

project = Xcodeproj::Project.open('ios/App/App.xcodeproj')
app = project.targets.find { |target| target.name == 'App' }
raise 'App target missing' unless app

tests = project.new_target(:ui_test_bundle, 'ScreenshotCapture', :ios, '15.0')
tests.add_dependency(app)
source = project.main_group.new_file('../../tests/ios/ScreenshotCapture.swift')
tests.source_build_phase.add_file_reference(source)
tests.build_configurations.each do |config|
  config.build_settings['PRODUCT_NAME'] = 'ScreenshotCapture'
  config.build_settings['PRODUCT_MODULE_NAME'] = 'ScreenshotCapture'
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.pettygamesstudios.ninetynineimpossible.screenshots'
  config.build_settings['TEST_TARGET_NAME'] = 'App'
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
end
project.save

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_build_target(tests)
scheme.add_test_target(tests)
scheme.test_action.build_configuration = 'Debug'
scheme.save_as(project.path, 'ScreenshotCapture', true)

# Be sure to restart your server when you modify this file.

# activates the logging of where in the code a query initiates from
# currently only available in Development - slows down the logging
if Rails.env.development?
  ActiveRecordQueryTrace.enabled = true

  #app - includes only files in your app/ directory.
  #full - includes files in your app as well as rails.
  #rails - alternate output of full backtrace, useful for debugging gems.
  ActiveRecordQueryTrace.level = :app


  ActiveRecordQueryTrace.ignore_cached_queries = false # Default is false.
end

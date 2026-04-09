# Puma configuration file.
# SOP v5.6.0 Performance Tuning

# Puma can serve each request in a separate thread.
# In development, we allow more threads to support concurrent Next.js requests.
threads_count = ENV.fetch("RAILS_MAX_THREADS") { 16 }
threads threads_count, threads_count

# Specifies the `port` that Puma will listen on to receive requests; default is 3000.
port ENV.fetch("PORT") { 3001 }

# Specifies the `environment` that Puma will run in.
environment ENV.fetch("RAILS_ENV") { "development" }

# Specifies the `pidfile` that Puma will use.
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Allow puma to be restarted by `bin/rails restart` command.
plugin :tmp_restart
